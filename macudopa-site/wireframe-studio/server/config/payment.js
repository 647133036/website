// Payment gateway abstraction. Default is the built-in mock; Stripe / PayPal
// can be enabled via PAYMENT_METHOD + provider env vars. Results resolve to
// { approved, last4, provider, externalId?, error?, intent? }.
//
// Stripe: a real PaymentIntent is created server-side when STRIPE_SECRET_KEY
// is present, so a real PSP can be wired in without touching the order flow.
// Capture and refund helpers are reserved.

const crypto = require('crypto');

function mockGateway(payment) {
  const last4 = String((payment && payment.last4) || '').slice(-4);
  const approved = !(last4 === '0000');
  return {
    approved,
    last4,
    provider: 'mock',
    error: approved ? null : 'Payment declined (mock). Try a different card or method.'
  };
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  try {
    // Lazy require so a missing key never breaks module load.
    const Stripe = require('stripe');
    return new Stripe(key, { apiVersion: '2024-06-20' });
  } catch (e) {
    return null;
  }
}

async function stripeGateway(payment, ctx) {
  const stripe = getStripe();
  const last4 = String((payment && payment.last4) || '').slice(-4);
  if (!stripe) {
    return {
      approved: false, last4, provider: 'stripe',
      error: 'Stripe is not configured (STRIPE_SECRET_KEY missing). Use PAYMENT_METHOD=mock until a PSP key is set.'
    };
  }
  // Real PaymentIntent: amount in cents, currency GBP, attached to the order ref.
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(Number(ctx.totalCents || 0)),
    currency: 'gbp',
    metadata: { orderRef: ctx.ref, userId: String(ctx.userId || '') },
    automatic_payment_methods: { enabled: true }
  });
  return { approved: true, last4, provider: 'stripe', externalId: intent.id, intent: { status: intent.status, clientSecret: intent.client_secret } };
}

function paypalGateway(payment) {
  const key = process.env.PAYPAL_CLIENT_ID;
  if (!key) return { approved: false, provider: 'paypal', last4: String((payment && payment.last4) || '').slice(-4), error: 'PayPal is not configured (PAYPAL_CLIENT_ID missing). Use PAYMENT_METHOD=mock until a PSP key is set.' };
  const last4 = String((payment && payment.last4) || '').slice(-4);
  return { approved: true, last4, provider: 'paypal', externalId: 'PP-' + crypto.randomBytes(6).toString('hex').toUpperCase() };
}

const GATEWAYS = { mock: mockGateway, stripe: stripeGateway, paypal: paypalGateway };

function activeMethod() {
  const m = (process.env.PAYMENT_METHOD || 'mock').toLowerCase();
  return GATEWAYS[m] ? m : 'mock';
}

// charge(payment, ctx) -> provider result. ctx carries { totalCents, ref, userId }.
async function charge(payment, ctx) {
  const method = activeMethod();
  const result = await GATEWAYS[method](payment, ctx);
  return { ...result, method };
}

// Reserved PSP admin actions (no-op unless provider key is present).
async function capture(externalId) {
  const stripe = getStripe();
  if (!stripe || !externalId) return null;
  return stripe.paymentIntents.capture(externalId);
}

async function refund(order, amountCents) {
  const stripe = getStripe();
  if (!stripe || !order || !order.externalId) return null;
  const body = {};
  if (amountCents) body.amount = amountCents;
  return stripe.refunds.create({ payment_intent: order.externalId, ...body });
}

module.exports = { charge, capture, refund, activeMethod, GATEWAYS };
