import { ArrowRight, Building2, Boxes, ClipboardList, ShieldCheck, Stethoscope, Users } from 'lucide-react';

const roleNames = { ADMIN: 'Platform admin', SUPPLIER: 'Supplier / operations', FULFILLMENT: 'Warehouse / delivery', BUYER: 'Clinic / hospital buyer' };

export default function AdminPage({ team = [], customers = [], orders = [], products = [], bookings = [], onPage }) {
  const openOrders = orders.filter((order) => !['DELIVERED', 'CANCELLED'].includes(order.status));
  const lowStock = products.filter((product) => Number(product.stock) <= Number(product.reorderLevel || 0));
  const openBookings = bookings.filter((booking) => !['COMPLETED', 'CANCELLED'].includes(booking.status));
  const pendingInvites = team.filter((member) => String(member.status).toLowerCase() === 'invited').length;
  const roles = [
    { key: 'ADMIN', label: roleNames.ADMIN, count: team.filter((member) => member.role === 'ADMIN').length },
    { key: 'SUPPLIER', label: roleNames.SUPPLIER, count: team.filter((member) => member.role === 'SUPPLIER').length },
    { key: 'FULFILLMENT', label: roleNames.FULFILLMENT, count: team.filter((member) => member.role === 'FULFILLMENT').length },
    { key: 'BUYER', label: roleNames.BUYER, count: customers.length },
  ];
  const maxRoleCount = Math.max(1, ...roles.map((role) => role.count));
  const actions = [
    { title: 'Team & access', description: 'Invite team members and review role access.', page: 'team', icon: Users, value: `${team.length} accounts · ${pendingInvites} invite${pendingInvites === 1 ? '' : 's'}` },
    { title: 'Customer accounts', description: 'Review clinic, hospital, and lab buyer accounts.', page: 'customers', icon: Building2, value: `${customers.length} facilities` },
    { title: 'Inventory control', description: 'Monitor stock levels, expiry, and adjustments.', page: 'inventory', icon: Boxes, value: `${lowStock.length} low-stock item${lowStock.length === 1 ? '' : 's'}` },
    { title: 'Order operations', description: 'Review fulfilment and delivery progress.', page: 'orders', icon: ClipboardList, value: `${openOrders.length} active orders` },
    { title: 'Service desk', description: 'Review installation, maintenance, and repair visits.', page: 'services', icon: Stethoscope, value: `${openBookings.length} open requests` },
    { title: 'Business settings', description: 'Maintain supplier profile, email, and preferences.', page: 'settings', icon: ShieldCheck, value: 'Organization profile' },
  ];

  return <div className="page-stack admin-page">
    <div className="page-heading-row">
      <div><div className="eyebrow">PLATFORM CONTROL CENTER</div><h1>Admin panel</h1><p>Manage people, buyer facilities, catalogue, and day-to-day operations.</p></div>
      <div className="heading-actions"><span className="admin-secure-pill"><ShieldCheck size={14} /> Administrator access</span><button type="button" className="button button-primary" onClick={() => onPage?.('team')}><Users size={15} /> Manage users</button></div>
    </div>

    <div className="admin-stat-grid">
      <article className="admin-stat-card"><span className="admin-stat-icon admin-stat-green"><Users size={18} /></span><div><small>Platform team</small><strong>{team.length}</strong><span>{pendingInvites} invite{pendingInvites === 1 ? '' : 's'} awaiting activation</span></div></article>
      <article className="admin-stat-card"><span className="admin-stat-icon admin-stat-blue"><Building2 size={18} /></span><div><small>Buyer facilities</small><strong>{customers.length}</strong><span>Clinic, hospital & lab accounts</span></div></article>
      <article className="admin-stat-card"><span className="admin-stat-icon admin-stat-amber"><ClipboardList size={18} /></span><div><small>Active orders</small><strong>{openOrders.length}</strong><span>Not yet delivered or cancelled</span></div></article>
      <article className="admin-stat-card"><span className="admin-stat-icon admin-stat-rose"><Boxes size={18} /></span><div><small>Low-stock products</small><strong>{lowStock.length}</strong><span>At or below reorder threshold</span></div></article>
    </div>

    <div className="admin-panel-grid">
      <section className="card-surface admin-control-card">
        <div className="admin-section-heading"><span><span className="eyebrow">OPERATIONS</span><h2>Administration shortcuts</h2></span><span className="admin-live-tag"><i /> Workspace live</span></div>
        <div className="admin-action-grid">{actions.map(({ title, description, page, icon: Icon, value }) => <button type="button" className="admin-action" onClick={() => onPage?.(page)} key={page}><span className="admin-action-icon"><Icon size={17} /></span><span className="admin-action-copy"><strong>{title}</strong><small>{description}</small><em>{value}</em></span><ArrowRight size={15} className="admin-action-arrow" /></button>)}</div>
      </section>

      <section className="card-surface admin-access-card">
        <div className="admin-section-heading"><span><span className="eyebrow">ROLE-BASED ACCESS</span><h2>Workspace users</h2></span><button type="button" className="link-button" onClick={() => onPage?.('team')}>Review team <ArrowRight size={13} /></button></div>
        <div className="admin-role-list">{roles.map((role) => <div className="admin-role-row" key={role.key}><span className={`role-dot role-dot-${role.key.toLowerCase()}`} /><span>{role.label}</span><strong>{role.count}</strong><div className="admin-role-track"><i style={{ width: `${Math.max(role.count ? 10 : 0, role.count / maxRoleCount * 100)}%` }} /></div></div>)}</div>
        <div className="admin-permission-note"><ShieldCheck size={15} /><span>Protected routes enforce access on the API. Changes to access and business settings are recorded in the audit log.</span></div>
      </section>
    </div>

    <section className="card-surface admin-team-card">
      <div className="admin-section-heading"><span><span className="eyebrow">TEAM DIRECTORY</span><h2>Recent team accounts</h2></span><button type="button" className="link-button" onClick={() => onPage?.('team')}>Open team & access <ArrowRight size={13} /></button></div>
      <div className="admin-team-list">{team.slice(0, 5).map((member) => <div className="admin-team-row" key={member.id}><span className="admin-member-avatar">{member.initials || member.name?.slice(0, 1) || 'M'}</span><span className="admin-member-copy"><strong>{member.name}</strong><small>{member.email}</small></span><span className="admin-member-role">{roleNames[member.role] || member.role}</span><span className={`admin-member-status ${String(member.status).toLowerCase() === 'invited' ? 'admin-member-invited' : ''}`}>{member.status || 'Active'}</span></div>)}{!team.length && <div className="empty-inline">No team accounts loaded yet.</div>}</div>
    </section>
  </div>;
}
