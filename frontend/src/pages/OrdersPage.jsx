import { useEffect, useMemo, useState } from 'react';
import { ArrowDownToLine, ArrowLeft, ArrowRight, CalendarDays, Check, ChevronDown, ClipboardList, FileText, MapPin, Package, Search, Truck } from 'lucide-react';
import Modal from '../components/Modal.jsx';
import OrderTable from '../components/OrderTable.jsx';
import StatusBadge, { statusLabel } from '../components/StatusBadge.jsx';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const DATE_OPTIONS = { day: 'numeric', month: 'short', year: 'numeric' };
const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PICKING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

function nextAvailableStatus(order, role) {
  if (role === 'FULFILLMENT') {
    if (order.status === 'PACKED' || order.status === 'READY_FOR_DISPATCH') return 'OUT_FOR_DELIVERY';
    if (order.status === 'OUT_FOR_DELIVERY') return 'DELIVERED';
    return null;
  }
  if (order.status === 'PENDING') return 'CONFIRMED';
  const index = STATUS_FLOW.indexOf(order.status);
  return index >= 0 && index < STATUS_FLOW.length - 1 ? STATUS_FLOW[index + 1] : null;
}

function OrderDetail({ order, role, onUpdate, onDownload, onClose }) {
  const [customStatus, setCustomStatus] = useState(order?.status || 'PENDING');
  useEffect(() => setCustomStatus(order?.status || 'PENDING'), [order?.id, order?.status]);
  if (!order) return null;
  const next = nextAvailableStatus(order, role);
  const steps = ['CONFIRMED', 'PROCESSING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const currentStep = steps.indexOf(order.status);
  const canManage = ['ADMIN', 'SUPPLIER', 'FULFILLMENT'].includes(role);
  return <Modal open={Boolean(order)} onClose={onClose} title={order.orderNumber} subtitle={`Placed ${new Date(order.createdAt).toLocaleDateString('en-IN', DATE_OPTIONS)} · ${order.items?.length || 0} line items`} size="large" footer={<div className="order-detail-footer"><button type="button" className="button button-secondary" onClick={() => onDownload(order)}><ArrowDownToLine size={15} /> Download invoice</button><div className="modal-footer-spacer" />{canManage && role !== 'FULFILLMENT' && <label className="inline-status-select"><span>Status</span><select value={customStatus} onChange={(event) => setCustomStatus(event.target.value)}>{STATUS_FLOW.map((status) => <option value={status} key={status}>{statusLabel(status)}</option>)}<option value="CANCELLED">Cancelled</option></select><ChevronDown size={13} /></label>}{canManage && (role === 'FULFILLMENT' ? next : customStatus !== order.status) && <button type="button" className="button button-primary" onClick={() => { onUpdate(order, role === 'FULFILLMENT' ? next : customStatus); onClose(); }}><Check size={15} /> {role === 'FULFILLMENT' ? `Mark ${next === 'DELIVERED' ? 'delivered' : 'out for delivery'}` : 'Save status'}</button>}</div>}>
    <div className="order-detail-layout">
      <div className="order-detail-main"><div className="order-status-track">{steps.map((step, index) => { const reached = currentStep >= index || order.status === 'DELIVERED'; return <div className={`track-step ${reached ? 'track-step-done' : ''} ${order.status === step ? 'track-step-current' : ''}`} key={step}><span className="track-dot">{reached ? <Check size={12} /> : index + 1}</span><span>{statusLabel(step)}</span>{index < steps.length - 1 && <i />}</div>; })}</div><div className="detail-items-title"><h3>Items in this order</h3><span>{order.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0} units</span></div><div className="order-line-items">{(order.items || []).map((item) => <div className="order-line-item" key={`${item.productId}-${item.sku}`}><span className="line-item-art"><Package size={18} /></span><span className="line-item-name"><strong>{item.name || item.productName}</strong><small>{item.sku || 'Medical supply'} · {item.quantity} × {money(item.unitPrice)}</small></span><b>{money(item.total || item.unitPrice * item.quantity)}</b></div>)}</div><div className="detail-totals"><span>Subtotal <b>{money(order.subtotal)}</b></span><span>GST <b>{money(order.tax)}</b></span><span>Delivery <b>{order.shippingFee === 0 ? 'Complimentary' : money(order.shippingFee)}</b></span><span className="detail-total"><strong>Total</strong><strong>{money(order.total)}</strong></span></div></div>
      <aside className="order-detail-aside"><div className="detail-side-card"><span className="eyebrow">ORDER STATUS</span><div className="detail-current-status"><StatusBadge status={order.status} /></div><p>{order.status === 'OUT_FOR_DELIVERY' ? 'Your driver is on the way.' : order.status === 'DELIVERED' ? 'This order has been delivered.' : 'We’ll keep you updated as your order moves.'}</p></div><div className="detail-side-card"><span className="eyebrow">DELIVER TO</span><h4>{order.buyerOrg || order.buyerName || 'Healthcare facility'}</h4><p>{order.buyerName}</p><div className="address-copy"><MapPin size={14} />{order.shippingAddress || 'Pune, Maharashtra'}</div><span className="eta-line"><CalendarDays size={14} /> {order.expectedDelivery || 'Delivery date to be confirmed'}</span></div><div className="detail-side-card detail-payment-card"><span className="eyebrow">PAYMENT</span><div><strong>{money(order.total)}</strong><StatusBadge status={order.paymentStatus || 'PENDING'} /></div><p>{String(order.paymentMethod || 'COD').replaceAll('_', ' ')} · Tax invoice available</p></div></aside>
    </div>
  </Modal>;
}

export default function OrdersPage({ orders = [], user, onUpdateOrder, onDownloadInvoice }) {
  const [filter, setFilter] = useState('All orders');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const isBuyer = user?.role === 'BUYER';
  const visibleOrders = useMemo(() => {
    let list = orders;
    if (isBuyer) list = list.filter((order) => order.userId === user.id);
    if (user?.role === 'FULFILLMENT') list = list.filter((order) => order.assignedToId === user.id || ['PACKED', 'READY_FOR_DISPATCH', 'OUT_FOR_DELIVERY'].includes(order.status));
    if (filter === 'Needs action') list = list.filter((order) => !['DELIVERED', 'CANCELLED'].includes(order.status));
    if (filter === 'In transit') list = list.filter((order) => order.status === 'OUT_FOR_DELIVERY');
    if (filter === 'Delivered') list = list.filter((order) => order.status === 'DELIVERED');
    if (search) list = list.filter((order) => `${order.orderNumber} ${order.buyerOrg} ${order.buyerName} ${order.status}`.toLowerCase().includes(search.toLowerCase()));
    return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, user, filter, search, isBuyer]);
  const tabs = ['All orders', 'Needs action', 'In transit', 'Delivered'];
  const pendingCount = orders.filter((order) => !['DELIVERED', 'CANCELLED'].includes(order.status)).length;
  return <div className="page-stack orders-page">
    <div className="page-heading-row"><div><div className="eyebrow">FULFILMENT, IN ONE VIEW</div><h1>{isBuyer ? 'Your orders' : user?.role === 'FULFILLMENT' ? 'Delivery queue' : 'Orders'}</h1><p>{isBuyer ? 'Track deliveries, view line items, and download your tax invoices.' : 'Keep every order moving from confirmation to delivery.'}</p></div><div className="heading-actions"><span className="orders-summary-pill"><span className="pulse-mini" /> {pendingCount} need action</span>{isBuyer && <button type="button" className="button button-primary" onClick={() => window.dispatchEvent(new CustomEvent('medora:navigate', { detail: 'catalog' }))}><Package size={16} /> Shop supplies</button>}</div></div>
    <div className="orders-toolbar"><div className="segmented-tabs">{tabs.map((tab) => <button type="button" key={tab} className={filter === tab ? 'segment-active' : ''} onClick={() => setFilter(tab)}>{tab}{tab === 'Needs action' && <span>{pendingCount}</span>}</button>)}</div><label className="orders-search"><Search size={15} /><input placeholder="Search order or customer" value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>/</kbd></label><button type="button" className="button button-secondary" onClick={() => window.print()}><ArrowDownToLine size={15} /> Export</button></div>
    <div className="orders-panel card-surface"><div className="orders-panel-heading"><div><h3>{filter}</h3><p>{visibleOrders.length} order{visibleOrders.length !== 1 ? 's' : ''} · Updated just now</p></div><span className="privacy-note">Live order feed <i /></span></div><OrderTable orders={visibleOrders} role={user?.role} onView={setSelectedOrder} onUpdate={['ADMIN', 'SUPPLIER', 'FULFILLMENT'].includes(user?.role) ? setSelectedOrder : undefined} /></div>
    <OrderDetail order={selectedOrder} role={user?.role} onClose={() => setSelectedOrder(null)} onUpdate={(order, status) => onUpdateOrder?.(order.id, status)} onDownload={onDownloadInvoice} />
  </div>;
}
