import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useCart } from '../lib/cart.jsx';

const TONE = {
  orange: ['#FFA91F', '#FFE4A6'],
  purple: ['#B46BA3', '#E7CBE0'],
  green: ['#83B881', '#D6F0C9']
};

function BottleSVG({ tone }) {
  const [c1, c2] = TONE[tone] || TONE.orange;
  const gid = 'g' + tone + c1.length;
  return (
    <svg viewBox="0 0 120 160" width="100%" height="100%" style={{ maxHeight: 150 }}>
      <rect x="44" y="6" width="32" height="18" rx="4" fill="#2B0512" />
      <rect x="40" y="20" width="40" height="8" rx="2" fill="#caa66a" />
      <path d="M40 28 h40 a8 8 0 0 1 8 8 v100 a10 10 0 0 1 -10 10 h-36 a10 10 0 0 1 -10 -10 v-100 a8 8 0 0 1 8 -8 z" fill={`url(#${gid})`} />
      <defs>
        <linearGradient id={gid} x1="0" x2="1">
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

export async function fetchProducts() {
  return api('/products');
}

// A small horizontal row of recommended product cards (used by the
// 'product-recommendations' section and the PDP "pairs well with" area).
export function RecommendationsView({ products: preset, limit = 4, title }) {
  const [products, setProducts] = useState(preset || []);
  useEffect(() => {
    if (preset && preset.length) { setProducts(preset); return; }
    (async () => { try { setProducts(await api('/products').then((all) => all.slice(0, limit))); } catch (e) { /* noop */ } })();
  }, [preset, limit]);
  if (!products.length) return <div className="pcard-meta">Loading…</div>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + Math.min(products.length, 4) + ',1fr)', gap: 12 }}>
      {products.slice(0, limit).map((p) => (
        <ProductCard key={p.id} product={p} onOpen={() => {}} />
      ))}
    </div>
  );
}

export function ProductCard({ product, onOpen }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const open = onOpen || (() => {});
  return (
    <div className="pcard" onClick={() => open(product)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && open(product)}>
      <div className="pcard-media" style={{ background: TONE[product.tone]?.[1] || '#eee' }}>
        {product.badge && <span className="pcard-badge">{product.badge}</span>}
        {product.gallery?.[0] ? (
          <img src={product.gallery[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} onError={(e) => e.target.style.display = 'none'} />
        ) : (
          <BottleSVG tone={product.tone} />
        )}
      </div>
      <div className="pcard-body">
        <div className="pcard-title">{product.name}</div>
        <div className="pcard-meta">{product.meta}</div>
        <div className="pcard-foot">
          <span className="pcard-price">£{Number(product.price).toFixed(2)}</span>
          <button
            className="btn accent sm"
            disabled={product.stock === 0}
            onClick={(e) => { e.stopPropagation(); add(product.slug, product.variants[0]?.id, 1); setAdded(true); setTimeout(() => setAdded(false), 1200); }}
          >
            {product.stock === 0 ? 'Out of stock' : (added ? 'Added ✓' : 'Add to cart')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({ products, onOpen }) {
  return (
    <div className="pcard-grid">
      {products.map((p) => <ProductCard key={p.id} product={p} onOpen={onOpen} />)}
    </div>
  );
}

export function ProductPage({ product, onBack }) {
  const { add } = useCart();
  const [variant, setVariant] = useState(product.variants[0]?.id);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const v = product.variants.find((x) => x.id === variant);
  const price = Number(product.price) + (v?.delta || 0);
  const gallery = product.gallery && product.gallery.length ? product.gallery : [];
  const detail = product.detail && product.detail.length ? product.detail : [];
  return (
    <div className="pdp">
      <button className="btn ghost sm" onClick={onBack}>← Back to shop</button>
      <div className="pdp-grid">
        <div className="pdp-media-wrap">
          <div className="pdp-media" style={{ background: TONE[product.tone]?.[1] || '#eee' }}>
            {gallery.length ? (
              <img src={gallery[activeImg]} alt={product.name} onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <BottleSVG tone={product.tone} />
            )}
            {product.badge && <span className="pcard-badge">{product.badge}</span>}
          </div>
          {gallery.length > 1 && (
            <div className="pdp-thumbs">
              {gallery.map((src, i) => (
                <button key={i} className={`pdp-thumb ${i === activeImg ? 'on' : ''}`} onClick={() => setActiveImg(i)}>
                  <img src={src} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="pdp-info">
          <div className="pcard-title" style={{ fontSize: 24, marginTop: 6 }}>{product.name}</div>
          <div className="pdp-price">£{price.toFixed(2)}</div>
          <div className="pcard-meta">{product.meta} · {product.formula}</div>
          <p className="pdp-desc">{product.description}</p>
          <div className="pdp-variants">
            <span className="sub light">Options</span>
            <div className="radio-row">
              {product.variants.map((x) => (
                <label key={x.id} className={`radio ${variant === x.id ? 'on' : ''}`}>
                  <input type="radio" name="v" checked={variant === x.id} onChange={() => setVariant(x.id)} />
                  <span>{x.label}{x.note ? <small>{x.note}</small> : null}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="pdp-stock">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</div>
          <button className="btn primary" disabled={product.stock === 0} style={{ width: '100%', marginTop: 14 }}
            onClick={() => { add(product.slug, variant, 1); setAdded(true); setTimeout(() => setAdded(false), 1400); }}>
            {product.stock === 0 ? 'Out of stock' : (added ? 'Added to cart ✓' : `Add to cart — £${price.toFixed(2)}`)}
          </button>
          <div className="pcard-meta" style={{ marginTop: 10, fontSize: 12 }}>30-day money-back guarantee · Practitioner-guided</div>
        </div>
      </div>
      {detail.length > 0 && <DetailBlocks detail={detail} />}
    </div>
  );
}

function DetailBlocks({ detail }) {
  return (
    <div className="pdp-detail">
      {detail.map((b, i) => {
        switch (b.type) {
          case 'banner':
            return (
              <figure key={i} className="db-banner">
                <img src={b.image} alt={b.caption || ''} onError={(e) => e.target.style.display = 'none'} />
                {b.caption && <figcaption>{b.caption}</figcaption>}
              </figure>
            );
          case 'headline':
            return (
              <section key={i} className="db-block">
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </section>
            );
          case 'list':
            return (
              <section key={i} className="db-block">
                <h3>{b.title}</h3>
                <ul>{(b.items || []).map((t, j) => <li key={j}>{t}</li>)}</ul>
              </section>
            );
          case 'grid':
            return (
              <section key={i} className="db-block">
                <h3>{b.title}</h3>
                <div className="db-grid">
                  {(b.items || []).map((it, j) => (
                    <div className="db-grid-card" key={j}><b>{it.title}</b><p>{it.body}</p></div>
                  ))}
                </div>
              </section>
            );
          case 'guarantee':
            return (
              <section key={i} className="db-guarantee">
                <b>{b.title}</b>
                <p>{b.body}</p>
              </section>
            );
          case 'gallery':
            return (
              <section key={i} className="db-block">
                <h3>{b.title}</h3>
                <div className="db-gallery">
                  {(b.images || []).map((src, j) => (
                    <img key={j} src={src} alt="" onError={(e) => e.target.style.display = 'none'} />
                  ))}
                </div>
              </section>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

// Backend-driven shop: fetch products, open PDP via callback or route
export function ShopView({ onOpenProduct }) {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [sort, setSort] = useState('name');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setProducts(await fetchProducts()); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  let list = products;
  if (cat) list = list.filter((p) => p.category === cat);
  if (q) list = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.meta.toLowerCase().includes(q.toLowerCase()));
  list = [...list].sort((a, b) => sort === 'price-asc' ? a.price - b.price : sort === 'price-desc' ? b.price - a.price : a.name.localeCompare(b.name));

  return (
    <div className="shop-view">
      <div className="shop-toolbar">
        <input placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">All categories</option>
          <option value="day">Day</option>
          <option value="night">Night</option>
          <option value="bundle">Bundles</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="name">Sort: Name</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
      {loading ? <div className="spin">Loading products…</div> : (
        <ProductGrid products={list} onOpen={onOpenProduct} />
      )}
    </div>
  );
}

// Payment + checkout step inside the drawer
function CheckoutPanel() {
  const c = useCart();
  const [method, setMethod] = useState('card');
  const [num, setNum] = useState('4242 4242 4242 4242');
  const [exp, setExp] = useState('12/34');
  const [cvc, setCvc] = useState('123');
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('mock');
  const last4 = num.replace(/\D/g, '').slice(-4) || '0000';

  useEffect(() => { api('/orders/payment', { auth: false }).then((j) => j && j.provider && setProvider(j.provider)).catch(() => {}); }, []);

  const place = () => c.placeOrder({ method, last4 });
  const hint = provider === 'mock'
    ? <>Mock gateway — use any card; a number ending in <b>0000</b> is declined.</>
    : <><b>{provider}</b> provider selected ({provider.toUpperCase()}). Configure your key to go live; it currently approves mock charges.</>;

  return (
    <div className="checkout">
      <button className="btn ghost sm" onClick={c.cancelCheckout}>← Back to cart</button>
      <h3 style={{ margin: '12px 0 4px' }}>Payment</h3>
      <p className="pcard-meta">{hint}</p>
      <div className="field"><label>Name on card</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="field"><label>Card number</label><input value={num} onChange={(e) => setNum(e.target.value)} /></div>
      <div className="grid2" style={{ gap: 8 }}>
        <div className="field"><label>Expiry</label><input value={exp} onChange={(e) => setExp(e.target.value)} /></div>
        <div className="field"><label>CVC</label><input value={cvc} onChange={(e) => setCvc(e.target.value)} /></div>
      </div>
      <div className="field"><label>Method</label>
        <div className="radio-row">
          {['card', 'paypal'].map((m) => (
            <label key={m} className={`radio ${method === m ? 'on' : ''}`}><input type="radio" checked={method === m} onChange={() => setMethod(m)} /><span>{m === 'card' ? 'Card' : 'PayPal (mock)'}</span></label>
          ))}
        </div>
      </div>
      <div className="err">{c.error}</div>
      <button className="btn primary" style={{ width: '100%' }} disabled={c.placing} onClick={place}>
        {c.placing ? 'Processing…' : 'Pay (mock)'}
      </button>
    </div>
  );
}

export function CartDrawer() {
  const c = useCart();
  const nav = useNavigate();
  const [prodById, setProdById] = useState({});

  useEffect(() => {
    (async () => {
      try { const ps = await fetchProducts(); setProdById(Object.fromEntries(ps.map((p) => [p.slug, p]))); } catch (e) { /* noop */ }
    })();
  }, []);

  if (!c.open && !c.checkout && !c.placed) return null;

  if (c.placed) {
    return (
      <div className="drawer" onClick={c.closeAll}>
        <div className="drawer-body" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', padding: 30 }}>
          <div style={{ fontSize: 44, color: 'var(--green)' }}>✓</div>
          <h2 style={{ margin: '10px 0 4px' }}>Order confirmed</h2>
          <p className="sub light">Ref <b>{c.placed.ref}</b> · {c.placed.items.length} item(s) · £{Number(c.placed.total).toFixed(2)}</p>
          <p className="pcard-meta">Paid via {(c.placed.payment.method || 'card').toUpperCase()}. A confirmation email is on its way (mock).</p>
          <button className="btn primary" style={{ marginTop: 16 }} onClick={() => { c.closeAll(); nav('/'); }}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="drawer" onClick={() => c.closeAll()}>
      <div className="drawer-body" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h3>{c.checkout ? 'Checkout' : 'Your cart'}</h3>
          <button className="icon-btn" onClick={() => c.closeAll()}>×</button>
        </div>
        {c.checkout ? (
          <div className="drawer-body-scroll"><CheckoutPanel /></div>
        ) : c.items.length === 0 ? (
          <div style={{ padding: 20 }}><p className="pcard-meta">Your cart is empty.</p>
            <button className="btn sm" onClick={() => { c.closeAll(); nav('/shop'); }}>Browse the shop</button>
          </div>
        ) : (
          <>
            <div className="cart-list">
              {c.items.map((i) => {
                const p = prodById[i.slug];
                const v = p?.variants.find((x) => x.id === i.variant);
                const unit = p ? Number(p.price) + (v?.delta || 0) : 0;
                return (
                  <div className="cart-row" key={i.key}>
                    <div className="cart-row-media" style={{ background: TONE[p?.tone]?.[1] }}><BottleSVG tone={p?.tone || 'orange'} /></div>
                    <div className="cart-row-info">
                      <b>{p?.name || i.slug}</b>
                      <small>{v?.label || i.variant}</small>
                      <div className="qty">
                        <button className="icon-btn" onClick={() => c.setQty(i.key, i.qty - 1)}>−</button>
                        <span>{i.qty}</span>
                        <button className="icon-btn" onClick={() => c.setQty(i.key, i.qty + 1)}>+</button>
                      </div>
                    </div>
                    <div className="cart-row-price">£{(unit * i.qty).toFixed(2)}
                      <button className="link" onClick={() => c.remove(i.key)}>remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="drawer-foot">
              <button className="btn primary" style={{ width: '100%' }} onClick={c.startCheckout}>Proceed to checkout</button>
              <button className="btn ghost sm" style={{ width: '100%', marginTop: 6 }} onClick={c.clear}>Clear cart</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Routed PDP page
export function ProductDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    api('/products/' + id).then(setProduct).catch(() => setProduct(null)).finally(() => setLoading(false));
  }, [id]);
  if (loading) return <div className="spin">Loading product…</div>;
  if (!product) return <div className="admin"><p>Product not found.</p><button className="btn" onClick={() => nav('/shop')}>Back to shop</button></div>;
  return (
    <div className="admin">
      <ProductPage product={product} onBack={() => nav('/shop')} />
    </div>
  );
}

// Routed shop page
export function ShopPage() {
  const nav = useNavigate();
  const open = (p) => nav('/product/' + p.slug);
  return (
    <div className="admin">
      <div className="canvas-head">
        <div>
          <div className="pt">Shop</div>
          <div className="pd">Click a product for its detail page; Add to cart then check out.</div>
        </div>
      </div>
      <ShopView onOpenProduct={open} />
    </div>
  );
}
