import { ArrowUpRight, MoreHorizontal } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';

const rupees = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const shortDate = (value) => new Date(value || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

export default function OrderTable({ orders = [], role = 'ADMIN', onView, onUpdate, compact = false, limit }) {
  const visible = typeof limit === 'number' ? orders.slice(0, limit) : orders;
  const buyerMode = role === 'BUYER';
  return (
    <div className={`table-wrap ${compact ? 'table-compact' : ''}`}>
      <table className="data-table orders-table">
        <thead><tr>
          <th>Order</th>
          {!buyerMode && <th>Customer</th>}
          <th>Placed</th><th>Items</th><th>Total</th><th>Status</th><th aria-label="Actions" />
        </tr></thead>
        <tbody>
          {visible.map((order) => (
            <tr key={order.id}>
              <td><button type="button" className="link-button order-id" onClick={() => onView?.(order)}>{order.orderNumber}</button><span className="cell-sub">{order.paymentMethod?.replaceAll('_', ' ') || 'Invoice'}</span></td>
              {!buyerMode && <td><div className="customer-cell"><span className="tiny-avatar">{(order.buyerOrg || 'MC').slice(0, 1)}</span><span><strong>{order.buyerOrg || order.buyerName || 'Clinic'}</strong><small>{order.buyerName || 'Buyer account'}</small></span></div></td>}
              <td>{shortDate(order.createdAt)}<span className="cell-sub">{new Date(order.createdAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></td>
              <td>{order.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0} items</td>
              <td className="amount-cell">{rupees(order.total)}</td>
              <td><StatusBadge status={order.status} /></td>
              <td className="row-actions">
                <button type="button" className="icon-button table-action" title="View order" onClick={() => onView?.(order)}><ArrowUpRight size={16} /></button>
                {onUpdate && <button type="button" className="icon-button table-action" title="Update status" onClick={() => onUpdate(order)}><MoreHorizontal size={17} /></button>}
              </td>
            </tr>
          ))}
          {!visible.length && <tr><td className="empty-cell" colSpan={7}>No orders match these filters.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
