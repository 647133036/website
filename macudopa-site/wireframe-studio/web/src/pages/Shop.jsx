import { useNavigate, useParams } from 'react-router-dom';
import { ProductGrid, ProductPage } from '../components/shop.jsx';
import { useCart } from '../lib/cart.jsx';

export function ShopPage() {
  const { add } = useCart();
  return (
    <div className="admin">
      <div className="canvas-head">
        <div>
          <div className="pt">Shop</div>
          <div className="pd">Click a product to open its detail page; Add to cart fills the cart drawer.</div>
        </div>
        <button className="btn accent sm" onClick={() => add('bundle-pd', 'sub', 1)}>+ Try Add to cart</button>
      </div>
      <ProductGrid />
    </div>
  );
}

export function ProductDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  return (
    <div className="admin">
      <ProductPage id={id} onBack={() => nav('/shop')} />
    </div>
  );
}
