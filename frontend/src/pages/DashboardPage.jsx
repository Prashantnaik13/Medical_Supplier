import { ArrowRight, ArrowUpRight, CalendarDays, CircleDollarSign, Clock3, PackageCheck, ShoppingCart, Sparkles, Truck, Users, WalletCards, Boxes } from 'lucide-react';
import StatCard from '../components/StatCard.jsx';
import OrderTable from '../components/OrderTable.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ProductArt from '../components/ProductArt.jsx';

const rupees = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

function SalesChart({ role }) {
  const labels = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const line = role === 'BUYER' ? 'M0 110 C45 95 56 82 100 89 S158 66 202 74 S258 48 303 57 S362 39 404 48 S460 20 505 29' : 'M0 99 C42 84 63 97 101 69 S159 81 202 55 S257 63 304 43 S361 50 404 26 S460 38 505 15';
  return <div className="chart-card card-surface">
    <div className="panel-heading chart-heading"><div><span className="eyebrow">PERFORMANCE</span><h3>{role === 'BUYER' ? 'Your purchasing activity' : role === 'FULFILLMENT' ? 'Delivery performance' : 'Sales overview'}</h3></div><button type="button" className="select-control">Last 6 months <span>⌄</span></button></div>
    <div className="chart-total"><strong>{role === 'BUYER' ? '₹82,640' : role === 'FULFILLMENT' ? '96.8%' : '₹24,82,940'}</strong><span className="positive-pill"><ArrowUpRight size={13} /> 18.6%</span><small>vs previous period</small></div>
    <div className="chart-visual">
      <div className="chart-y-labels"><span>₹30L</span><span>₹20L</span><span>₹10L</span><span>₹0</span></div>
      <svg viewBox="0 0 505 130" preserveAspectRatio="none" className="chart-svg" aria-label="Six month performance chart" role="img">
        <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#2b9d84" stopOpacity=".17" /><stop offset="100%" stopColor="#2b9d84" stopOpacity="0" /></linearGradient></defs>
        {[15, 48, 81, 114].map((y) => <line key={y} x1="0" x2="505" y1={y} y2={y} className="chart-gridline" />)}
        <path d={`${line} L505 130 L0 130 Z`} className="chart-area" />
        <path d={line} className="chart-line" />
        <circle cx="505" cy={role === 'BUYER' ? '29' : '15'} r="4.5" className="chart-point" />
      </svg>
      <div className="chart-x-labels">{labels.map((label) => <span key={label}>{label}</span>)}</div>
    </div>
  </div>;
}

function StockWatch({ products, onPage }) {
  const low = products.filter((product) => Number(product.stock) <= Number(product.reorderLevel)).sort((a, b) => a.stock - b.stock).slice(0, 3);
  return <section className="card-surface stock-watch">
    <div className="panel-heading"><div><span className="eyebrow">INVENTORY HEALTH</span><h3>Needs attention</h3></div><button type="button" className="text-arrow" onClick={() => onPage('inventory')}>View all <ArrowRight size={14} /></button></div>
    <div className="stock-watch-list">
      {low.map((product) => <div className="stock-watch-item" key={product.id}><ProductArt type={product.art} className="stock-art" /><div className="stock-product-copy"><strong>{product.name}</strong><small>{product.sku}</small><div className="stock-progress"><span style={{ width: `${Math.min(100, Math.max(9, product.stock / product.reorderLevel * 100))}%` }} /></div></div><span className="stock-quantity"><b>{product.stock}</b><small>left</small></span></div>)}
      {!low.length && <p className="muted-copy">All stocked products are above their reorder level.</p>}
    </div>
    <div className="stock-watch-foot"><span><span className="online-dot warning-dot" /> {low.length} items below reorder point</span><button type="button" className="mini-link" onClick={() => onPage('inventory')}>Review stock</button></div>
  </section>;
}

function DeliveryCard({ orders, role, onPage }) {
  const active = orders.filter((order) => ['PACKED', 'READY_FOR_DISPATCH', 'OUT_FOR_DELIVERY'].includes(order.status)).slice(0, 3);
  return <section className="card-surface delivery-card">
    <div className="panel-heading"><div><span className="eyebrow">LIVE OPERATIONS</span><h3>{role === 'FULFILLMENT' ? 'Your route today' : 'On the move'}</h3></div><button type="button" className="text-arrow" onClick={() => onPage('map')}>Open map <ArrowRight size={14} /></button></div>
    <div className="delivery-list">{active.map((order, index) => <div className="delivery-item" key={order.id}><div className={`delivery-timeline-dot ${order.status === 'OUT_FOR_DELIVERY' ? 'timeline-live' : ''}`}>{index + 1}</div><div className="delivery-item-main"><strong>{order.buyerOrg || order.buyerName}</strong><small>{order.orderNumber} · {order.expectedDelivery || 'Today'}</small></div><StatusBadge status={order.status} /></div>)}{!active.length && <p className="muted-copy">No deliveries need your attention right now.</p>}</div>
    <button className="delivery-route-button" type="button" onClick={() => onPage('map')}><Truck size={16} /><span>View delivery routes</span><ArrowRight size={15} /></button>
  </section>;
}

export default function DashboardPage({ user, orders = [], products = [], bookings = [], onPage, onViewOrder, onUpdateOrder }) {
  const role = user?.role || 'ADMIN';
  const visibleOrders = role === 'BUYER' ? orders.filter((order) => order.userId === user.id) : role === 'FULFILLMENT' ? orders.filter((order) => order.assignedToId === user.id || ['PACKED', 'READY_FOR_DISPATCH', 'OUT_FOR_DELIVERY'].includes(order.status)) : orders;
  const pending = visibleOrders.filter((order) => !['DELIVERED', 'CANCELLED'].includes(order.status)).length;
  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const isBuyer = role === 'BUYER';
  const isDriver = role === 'FULFILLMENT';
  const title = isBuyer ? 'Your care, restocked.' : isDriver ? 'Ready for your route?' : 'Care moves better together.';
  const subtitle = isBuyer ? 'Keep your clinic stocked and your team ready. Everything you need, in one place.' : isDriver ? 'Your deliveries and warehouse tasks are lined up for today.' : 'A clear view of your supply operations, so your team can focus on better care.';
  const recent = visibleOrders.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const todayServices = bookings.filter((booking) => booking.status === 'REQUESTED' || booking.status === 'CONFIRMED').length;

  const stats = isBuyer ? [
    { icon: ShoppingCart, label: 'Orders this month', value: '12', change: '2 more', compare: 'than last month', tone: 'mint' },
    { icon: WalletCards, label: 'Purchases this month', value: '₹82,640', change: '12.4%', compare: 'vs last month', tone: 'blue' },
    { icon: Truck, label: 'In transit', value: String(visibleOrders.filter((order) => order.status === 'OUT_FOR_DELIVERY').length || 1), note: 'on the way', compare: 'Your next delivery', tone: 'amber' },
    { icon: CalendarDays, label: 'Service visits', value: String(todayServices || 1), note: 'upcoming', compare: 'Booked for your facility', tone: 'violet' },
  ] : isDriver ? [
    { icon: Truck, label: 'Stops today', value: '08', change: '2 complete', compare: 'Your delivery route', tone: 'mint' },
    { icon: PackageCheck, label: 'Ready to dispatch', value: String(visibleOrders.filter((order) => ['PACKED', 'READY_FOR_DISPATCH'].includes(order.status)).length), compare: 'Orders to load', tone: 'blue' },
    { icon: Clock3, label: 'On-time rate', value: '96.8%', change: '2.1%', compare: 'This month', tone: 'amber' },
    { icon: Boxes, label: 'Warehouse tasks', value: '04', note: 'open', compare: 'Pick & pack queue', tone: 'violet' },
  ] : [
    { icon: CircleDollarSign, label: 'Gross sales', value: '₹24.8L', change: '18.6%', compare: 'vs last month', tone: 'mint' },
    { icon: ShoppingCart, label: 'Orders', value: '1,284', change: '12.3%', compare: 'vs last month', tone: 'blue' },
    { icon: Clock3, label: 'Awaiting action', value: String(pending || 42), note: 'open orders', compare: 'Across all channels', tone: 'amber' },
    { icon: Boxes, label: 'Low stock items', value: String(products.filter((p) => p.stock <= p.reorderLevel).length), note: 'need a look', compare: 'Reorder soon', tone: 'violet' },
  ];

  return <div className="page-stack dashboard-page">
    <section className="welcome-row"><div><div className="welcome-kicker"><Sparkles size={14} /> {greeting}, {firstName}</div><h1>{title}</h1><p>{subtitle}</p></div><div className="welcome-actions"><span className="today-date"><CalendarDays size={15} /> {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span><button className="button button-primary" onClick={() => onPage(isBuyer ? 'catalog' : 'orders')}>{isBuyer ? <ShoppingCart size={16} /> : <ClipboardIcon />} {isBuyer ? 'Shop supplies' : isDriver ? 'Open route' : 'View orders'}</button></div></section>
    <section className="stat-grid">{stats.map((stat) => <StatCard key={stat.label} {...stat} />)}</section>
    <section className="dashboard-middle"><SalesChart role={role} /><DeliveryCard orders={visibleOrders} role={role} onPage={onPage} /></section>
    <section className="dashboard-lower">
      <div className="card-surface recent-orders-card"><div className="panel-heading"><div><span className="eyebrow">THE LATEST</span><h3>{isBuyer ? 'Your recent orders' : isDriver ? 'Today’s stops' : 'Recent orders'}</h3></div><button type="button" className="text-arrow" onClick={() => onPage('orders')}>All orders <ArrowRight size={14} /></button></div><OrderTable orders={recent} role={role} onView={onViewOrder} compact limit={4} /></div>
      <div className="dashboard-right-column"><StockWatch products={products} onPage={onPage} /><section className="service-nudge"><div className="service-nudge-icon"><Users size={18} /></div><div><span className="eyebrow">SERVICE DESK</span><h3>{todayServices ? `${todayServices} service visits` : 'Equipment needs a check?'}</h3><p>{isBuyer ? 'Keep your devices reliable with a scheduled calibration.' : `${todayServices || 2} bookings need a team response.`}</p><button type="button" onClick={() => onPage('services')}>{isBuyer ? 'Book a visit' : 'Manage requests'} <ArrowRight size={14} /></button></div></section></div>
    </section>
    <div className="dashboard-footer-note"><span className="secure-mark">✓</span><span>Trusted by 2,400+ care teams across Maharashtra</span><span className="footer-dot">·</span><span>GST-compliant invoices</span><span className="footer-dot">·</span><span>Reliable, traceable sourcing</span><button type="button" onClick={() => onPage('storefront')}>Explore Medora <ArrowUpRight size={13} /></button></div>
  </div>;
}

function ClipboardIcon() { return <ShoppingCart size={16} />; }
