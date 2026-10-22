import { useMemo, useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, FileText, Search, ShieldCheck } from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function InvoicesPage({ orders = [], user, onDownload }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All invoices');
  const invoiceRows = useMemo(() => {
    let rows = orders.filter((order) => user?.role !== 'BUYER' || order.userId === user.id).map((order) => {
      const year = String(new Date(order.createdAt || Date.now()).getFullYear()).slice(-2);
      const reference = String(order.orderNumber || '000000').replace(/^MD-/, '');
      return { ...order, invoiceNumber: order.invoiceNumber || `INV-${year}-${reference}` };
    });
    if (filter === 'Paid') rows = rows.filter((order) => order.paymentStatus === 'PAID');
    if (filter === 'Payment due') rows = rows.filter((order) => order.paymentStatus !== 'PAID');
    if (query) rows = rows.filter((order) => `${order.invoiceNumber} ${order.orderNumber} ${order.buyerOrg} ${order.buyerName}`.toLowerCase().includes(query.toLowerCase()));
    return rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, user, filter, query]);
  const paidTotal = invoiceRows.filter((order) => order.paymentStatus === 'PAID').reduce((sum, order) => sum + Number(order.total || 0), 0);
  const dueTotal = invoiceRows.filter((order) => order.paymentStatus !== 'PAID').reduce((sum, order) => sum + Number(order.total || 0), 0);
  return <div className="page-stack invoices-page">
    <div className="page-heading-row"><div><div className="eyebrow">CLEAR, INDIA-READY BILLING</div><h1>Invoices</h1><p>GST-ready invoices linked to every order, available when you need them.</p></div><div className="heading-actions"><span className="verified-pill"><ShieldCheck size={15} /> GST-ready</span></div></div>
    <div className="invoice-summary-grid"><div className="invoice-summary-card"><span className="summary-icon summary-teal"><FileText size={18} /></span><div><small>{user?.role === 'BUYER' ? 'Invoices this year' : 'Invoices issued'}</small><strong>{invoiceRows.length}</strong><span>Linked to order history</span></div><div className="invoice-sparkline"><i /><i /><i /><i /><i /><i /><i /></div></div><div className="invoice-summary-card"><span className="summary-icon summary-green"><ShieldCheck size={18} /></span><div><small>Paid</small><strong>{money(paidTotal)}</strong><span>Settled invoices</span></div><span className="summary-trend">✓ up to date</span></div><div className="invoice-summary-card"><span className="summary-icon summary-amber"><FileText size={18} /></span><div><small>{user?.role === 'BUYER' ? 'Payment due' : 'Outstanding'}</small><strong>{money(dueTotal)}</strong><span>{invoiceRows.filter((order) => order.paymentStatus !== 'PAID').length} invoice(s) pending</span></div><span className="invoice-due-pill">Review</span></div></div>
    <section className="card-surface invoice-list-card"><div className="invoice-list-toolbar"><div className="segmented-tabs">{['All invoices', 'Paid', 'Payment due'].map((tab) => <button type="button" key={tab} className={filter === tab ? 'segment-active' : ''} onClick={() => setFilter(tab)}>{tab}</button>)}</div><label className="orders-search"><Search size={15} /><input placeholder="Search invoice or order" value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>/</kbd></label></div><div className="table-wrap"><table className="data-table invoice-table"><thead><tr><th>Invoice</th><th>Order ref.</th>{user?.role !== 'BUYER' && <th>Customer</th>}<th>Issued</th><th>Amount</th><th>Payment</th><th /></tr></thead><tbody>{invoiceRows.map((order) => <tr key={order.id}><td><div className="invoice-id-cell"><span className="invoice-doc-icon"><FileText size={17} /></span><span><strong>{order.invoiceNumber}</strong><small>Tax invoice · PDF</small></span></div></td><td><strong className="table-order-number">{order.orderNumber}</strong></td>{user?.role !== 'BUYER' && <td><div className="customer-cell"><span className="tiny-avatar">{(order.buyerOrg || 'M').slice(0, 1)}</span><span><strong>{order.buyerOrg || order.buyerName}</strong><small>GST registered</small></span></div></td>}<td>{new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td><td className="amount-cell">{money(order.total)}</td><td><StatusBadge status={order.paymentStatus || 'PENDING'} /></td><td><button type="button" className="button button-download" onClick={() => onDownload(order)}><ArrowDownToLine size={14} /> PDF</button></td></tr>)}{!invoiceRows.length && <tr><td colSpan={7} className="empty-cell">No invoices match your search.</td></tr>}</tbody></table></div><div className="invoice-footnote"><ShieldCheck size={15} /><span>Each invoice includes supplier GSTIN, place of supply, itemised tax, and order reference.</span><button type="button" className="link-button" onClick={() => window.print()}>Export list <ArrowUpRight size={14} /></button></div></section>
  </div>;
}
