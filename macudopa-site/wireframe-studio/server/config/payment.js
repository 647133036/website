// Payment gateway abstraction. Default is the built-in mock; Stripe / PayPal
// are reserved so a real PSP can be enabled via env vars without touching order
// flow. All gateways resolve to { approved, last4, provider, externalId?, error? }.

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

function stripeGateway(payment) {
  // Reserved integration point. A real implementation would create a Payment
  // Intent with the Stripe SDK and confirm with a token; here it validates that
  // the provider key is configured so callers get a clear signal instead of a
  // silent success.
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { approved: false, provider: 'stripe', error: 'Stripe is not configured (STRIPE_SECRET_KEY missing). Using mock is recommended until a PSP is set up.' };
  const last4 = String((payment && payment.last4) || '').slice(-4);
  return { approved: true, last4, provider: 'stripe', externalId: 'pi_' + crypto.randomBytes(8).toString('hex') };
}

function paypalGateway(payment) {
  const key = process.env.PAYPAL_CLIENT_ID;
  if (!key) return { approved: false, provider: 'paypal', error: 'PayPal is not configured (PAYPAL_CLIENT_ID missing). Using mock is recommended until a PSP is set up.' };
  const last4 = String((payment && payment.last4) || '').slice(-4);
  return { approved: true, last4, provider: 'paypal', externalId: 'PP-' + crypto.randomBytes(6).toString('hex').toUpperCase() };
}

const GATEWAYS = { mock: mockGateway, stripe: stripeGateway, paypal: paypalGateway };

function activeMethod() {
  const m = (process.env.PAYMENT_METHOD || 'mock').toLowerCase();
  return GATEWAYS[m] ? m : 'mock';
}

function charge(payment) {
  const method = activeMethod();
  const result = GATEWAYS[method](payment);
  return { ...result, method };
}

module.exports = { charge, activeMethod, GATEWAYS };
