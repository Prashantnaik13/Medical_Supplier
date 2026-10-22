import { useMemo } from 'react';
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingCart, Trash2, Truck, X } from 'lucide-react';
import ProductArt from './ProductArt.jsx';

const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function CartDrawer({ open, items = [], onClose, onChangeQuantity, onRemove, onCheckout, onContinue }) {
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0), [items]);
  const tax = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1) * Number(item.gstRate || 0) / 100, 0), [items]);
  const shipping = subtotal === 0 || subtotal >= 5000 ? 0 : 100;
  const total = subtotal + tax + shipping;
  if (!open) return null;
  return <div className="drawer-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
    <aside className="cart-drawer" aria-label="Shopping cart">
      <header className="cart-drawer-header"><div><span className="cart-heading-icon"><ShoppingCart size={18} /></span><div><h2>Your order</h2><p>{items.length} product{items.length !== 1 ? 's' : ''} · care, packed carefully</p></div></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close cart"><X size={19} /></button></header>
      {items.length ? <><div className="cart-delivery-note"><Truck size={15} /><span>{subtotal >= 5000 ? 'You’ve unlocked complimentary local delivery.' : `Add ${money(5000 - subtotal)} more for complimentary delivery.`}</span></div><div className="cart-items-list">{items.map((item) => <div className="cart-item" key={item.id}><ProductArt type={item.art} className="cart-item-art" /><div className="cart-item-info"><strong>{item.name}</strong><small>{item.sku} · {item.unit}</small><b>{money(item.price)} <small>/ unit</small></b><div className="quantity-control"><button type="button" aria-label="Decrease quantity" onClick={() => onChangeQuantity(item.id, -1)}><Minus size={13} /></button><span>{item.quantity}</span><button type="button" aria-label="Increase quantity" onClick={() => onChangeQuantity(item.id, 1)}><Plus size={13} /></button></div></div><div className="cart-item-trailing"><strong>{money(item.price * item.quantity)}</strong><button type="button" className="cart-remove" onClick={() => onRemove(item.id)} aria-label="Remove item"><Trash2 size={15} /></button></div></div>)}</div><div className="cart-recommended"><span className="cart-recommend-icon"><ShieldCheck size={15} /></span><span><b>Carefully checked before dispatch</b><small>Batch traceability included with every order.</small></span></div><div className="cart-summary"><div><span>Subtotal</span><b>{money(subtotal)}</b></div><div><span>Estimated GST</span><b>{money(tax)}</b></div><div><span>Local delivery</span><b>{shipping ? money(shipping) : 'Complimentary'}</b></div><div className="cart-total"><strong>Total incl. tax</strong><strong>{money(total)}</strong></div><button type="button" className="button button-primary cart-checkout-button" onClick={onCheckout}>Continue to checkout <ArrowRight size={16} /></button><p className="cart-terms">Secure checkout · GST-compliant invoice · 24–48 hr local delivery</p></div></> : <div className="cart-empty"><span><ShoppingCart size={27} /></span><h3>Your cart is ready for care.</h3><p>Find everyday essentials for your facility and add them to your order.</p><button type="button" className="button button-primary" onClick={onContinue}>Explore supplies <ArrowRight size={15} /></button></div>}
    </aside>
  </div>;
}
