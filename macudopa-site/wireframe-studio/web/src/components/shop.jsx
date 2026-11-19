import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../lib/cart.jsx';
import { PRODUCTS, byId, productPrice } from '../lib/products.js';

const TONE = {
  orange: ['#FFA91F', '#FFD27F'],
  purple: ['#B46BA3', '#2B0512'],
  green: ['#83B881', '#d6f0c9']
};

function BottleSVG({ tone }) {
  const [c1, c2] = TONE[tone] || TONE.orange;
  return (
    <svg viewBox="0 0 120 160" width="100%" height="100%" style={{ maxHeight: 150 }}>
      <rect x="44" y="6" width="32" height="18" rx="4" fill="#2B0512" />
      <rect x="40" y="20" width="40" height="8" rx="2" fill="#caa66a" />
      <path d="M40 28 h40 a8 8 0 0 1 8 8 v100 a10 10 0 0 1 -10 10 h-36 a10 10 0 0 1 -10 -10 v-100 a8 8 0 0 1 8 -8 z" fill={`url(#g${tone})`} />
      <defs>
        <linearGradient id={`g${tone}`} x1="0" x2="1">
          <stop offset="0" stopColor={c2} />
          <stop offset="1" stopColor={c1} />
        </linearGradient>
      </defs>
      <rect x="46" y="60" width="28" height="46" rx="4" fill="rgba(255,255,255,.72)" />
      <text x="60" y="78" textAnchor="middle" fontSize="10" fill="#2B0512" fontFamily="Fraunces, serif" fontWeight="600">MacuDopa</text>
      <text x="60" y="92" textAnchor="middle" fontSize="8" fill="#5a4a52">{tone}</text>
    </svg>
  );
}

export function ProductCard({ product }) {
  const nav = useNavigate();
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  return (
    <div className="pcard" onClick={() => nav('/product/' + product.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && nav('/product/' + product.id)}>
      <div className="pcard-media" style={{ background: TONE[product.tone][1] }}>
        {product.badge && <span className="pcard-badge">{product.badge}</span>}
        <BottleSVG tone={product.tone} />
      </div>
      <div className="pcard-body">
        <div className="pcard-title">{product.name}</div>
        <div className="pcard-meta">{product.meta}</div>
        <div className="pcard-foot">
          <span className="pcard-price">£{product.price.toFixed(2)}</span>
          <button
            className="btn accent sm"
            onClick={(e) => { e.stopPropagation(); add(product.id, product.variants[0]?.id, 1); setAdded(true); setTimeout(() => setAdded(false), 1200); }}
          >
            {added ? 'Added ✓' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({ onOpenProduct }) {
  return (
    <div className="pcard-grid">
      {PRODUCTS.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

export function ProductPage({ id, onBack }) {
  const nav = useNavigate();
  const { add } = useCart();
  const p = byId(id);
  const [variant, setVariant] = useState(p.variants[0]?.id);
  const [added, setAdded] = useState(false);
  if (!p) return <div className="spin">Product not found. <button className="btn sm" onClick={onBack || (() => nav('/studio'))}>Back</button></div>;
  const v = p.variants.find((x) => x.id === variant);
  const price = productPrice(p, v);
  return (
    <div className="pdp">
      <button className="btn ghost sm" onClick={onBack}>← Back to shop</button>
      <div className="pdp-grid">
        <div className="pdp-media" style={{ background: TONE[p.tone][1] }}>
          <BottleSVG tone={p.tone} />
        </div>
        <div className="pdp-info">
          <div className="pcard-title" style={{ fontSize: 22 }}>{p.name}</div>
          <div className="pdp-price">£{price.toFixed(2)}</div>
          <div className="pcard-meta">{p.meta} · {p.formula}</div>
          <div className="pdp-variants">
            <span className="sub light">Options</span>
            <div className="radio-row">
              {p.variants.map((x) => (
                <label key={x.id} className={`radio ${variant === x.id ? 'on' : ''}`}>
                  <input type="radio" name="v" checked={variant === x.id} onChange={() => setVariant(x.id)} />
                  <span>{x.label}{x.note ? <small>{x.note}</small> : null}</span>
                </label>
              ))}
            </div>
          </div>
          <button className="btn primary" style={{ width: '100%', marginTop: 14 }} onClick={() => { add(p.id, variant, 1); setAdded(true); setTimeout(() => setAdded(false), 1400); }}>
            {added ? 'Added to cart ✓' : `Add to cart — £${price.toFixed(2)}`}
          </button>
          <div className="pcard-meta" style={{ marginTop: 10, fontSize: 12 }}>30-day money-back guarantee · Practitioner-guided</div>
        </div>
      </div>
    </div>
  );
}

export function CartDrawer() {
  const c = useCart();
  if (!c.open && !c.placed) return null;
  if (c.placed) {
    return (
      <div className="drawer" onClick={() => c.setPlaced(null)}>
        <div className="drawer-body" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', padding: 30 }}>
          <div style={{ fontSize: 40 }}>✓</div>
          <h2 style={{ margin: '10px 0 4px' }}>Order placed</h2>
          <p className="sub light">Ref {c.placed.ref} · {c.placed.count} item(s) · £{c.placed.total}</p>
          <p className="pcard-meta">This is a mock checkout — no payment was taken.</p>
          <button className="btn primary" style={{ marginTop: 16 }} onClick={() => c.setPlaced(null)}>Continue</button>
        </div>
      </div>
    );
  }
  return (
    <div className="drawer" onClick={() => c.setOpen(false)}>
      <div className="drawer-body" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h3>Your cart</h3>
          <button className="icon-btn" onClick={() => c.setOpen(false)}>×</button>
        </div>
        {c.items.length === 0 ? <p className="pcard-meta">Your cart is empty.</p> : (
          <>
            <div className="cart-list">
              {c.items.map((i) => {
                const p = byId(i.id);
                const v = p.variants.find((x) => x.id === i.variant);
                const lp = c.linePrice(i);
                return (
                  <div className="cart-row" key={i.key}>
                    <div className="cart-row-media" style={{ background: TONE[p.tone][1] }}><BottleSVG tone={p.tone} /></div>
                    <div className="cart-row-info">
                      <b>{p.name}</b>
                      <small>{v?.label}</small>
                      <div className="qty">
                        <button className="icon-btn" onClick={() => c.setQty(i.key, i.qty - 1)}>−</button>
                        <span>{i.qty}</span>
                        <button className="icon-btn" onClick={() => c.setQty(i.key, i.qty + 1)}>+</button>
                      </div>
                    </div>
                    <div className="cart-row-price">£{(lp * i.qty).toFixed(2)}
                      <button className="link" onClick={() => c.remove(i.key)}>remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="drawer-foot">
              <div className="sub light">Total</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>£{c.total.toFixed(2)}</div>
              <button className="btn primary" style={{ width: '100%' }} onClick={c.checkout}>Checkout (mock)</button>
              <button className="btn ghost sm" style={{ width: '100%', marginTop: 6 }} onClick={c.clear}>Clear cart</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
