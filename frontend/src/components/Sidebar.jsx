import { Activity, ArrowLeft, Bell, Boxes, Building2, ClipboardList, FileText, LayoutDashboard, Map, PackageSearch, Settings, ShieldCheck, ShoppingBag, Stethoscope, Users, X } from 'lucide-react';

const ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'WORKSPACE', roles: ['ADMIN', 'SUPPLIER', 'BUYER', 'FULFILLMENT'] },
  // { id: 'storefront', label: 'Online storefront', icon: ShoppingBag, group: 'WORKSPACE', roles: ['ADMIN', 'SUPPLIER', 'BUYER'] },
  { id: 'catalog', label: 'Product catalog', icon: PackageSearch, group: 'WORKSPACE', roles: ['ADMIN', 'SUPPLIER', 'BUYER'] },
  { id: 'orders', label: 'Orders', icon: ClipboardList, group: 'WORKSPACE', roles: ['ADMIN', 'SUPPLIER', 'BUYER', 'FULFILLMENT'], badge: 'orders' },
  { id: 'services', label: 'Services', icon: Stethoscope, group: 'WORKSPACE', roles: ['ADMIN', 'SUPPLIER', 'BUYER'] },
  { id: 'map', label: 'Map & delivery', icon: Map, group: 'WORKSPACE', roles: ['ADMIN', 'SUPPLIER', 'BUYER', 'FULFILLMENT'] },
  { id: 'invoices', label: 'Invoices', icon: FileText, group: 'MANAGE', roles: ['ADMIN', 'SUPPLIER', 'BUYER'] },
  { id: 'inventory', label: 'Inventory', icon: Boxes, group: 'MANAGE', roles: ['ADMIN', 'SUPPLIER', 'FULFILLMENT'] },
  { id: 'customers', label: 'Customers', icon: Building2, group: 'MANAGE', roles: ['ADMIN', 'SUPPLIER'] },
  { id: 'admin', label: 'Admin panel', icon: ShieldCheck, group: 'MANAGE', roles: ['ADMIN'] },
  { id: 'team', label: 'Team & access', icon: Users, group: 'MANAGE', roles: ['ADMIN'] },
  { id: 'notifications', label: 'Notifications', icon: Bell, group: 'ACCOUNT', roles: ['ADMIN', 'SUPPLIER', 'BUYER', 'FULFILLMENT'] },
  { id: 'settings', label: 'Profile & settings', icon: Settings, group: 'ACCOUNT', roles: ['ADMIN', 'SUPPLIER', 'BUYER', 'FULFILLMENT'] },
];

export const PAGE_TITLES = Object.fromEntries(ITEMS.map(({ id, label }) => [id, label]));

export default function Sidebar({ user, currentPage, onNavigate, mobileOpen, onClose, pendingCount = 0 }) {
  const visible = ITEMS.filter((item) => item.roles.includes(user?.role || 'ADMIN'));
  const groups = [...new Set(visible.map((item) => item.group))];
  return <>
    {mobileOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={onClose} />}
    <aside className={`sidebar ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
      <div className="sidebar-brand-row">
        <div className="brand-mark"><Activity size={22} strokeWidth={2.2} /><span className="brand-mark-dot" /></div>
        <div className="brand-copy"><strong>medora</strong><span>SUPPLY CO.</span></div>
        {/* <button type="button" className="icon-button mobile-close" onClick={onClose} aria-label="Close menu"><X size={19} /></button> */}
      </div>
      <div className="workspace-select"><span className="workspace-avatar">M</span><span><strong>Medora Supply Co.</strong><small>Pune, Maharashtra</small></span><ArrowLeft className="workspace-chevron" size={15} /></div>
      <nav className="side-nav" aria-label="Main navigation">
        {groups.map((group) => <div className="nav-group" key={group}>
          <p className="nav-group-title">{group}</p>
          {visible.filter((item) => item.group === group).map(({ id, label, icon: Icon, badge }) => <button key={id} type="button" className={`nav-item ${currentPage === id ? 'nav-item-active' : ''}`} onClick={() => { onNavigate(id); onClose?.(); }}>
            <Icon size={17} strokeWidth={1.8} /><span>{label}</span>{badge === 'orders' && pendingCount > 0 && <b className="nav-badge">{pendingCount}</b>}
          </button>)}
        </div>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-help"><div className="help-icon"><Stethoscope size={17} /></div><div><strong>Need a hand?</strong><span>Care team is online</span><a href="mailto:care@medora.health">Contact support <span>↗</span></a></div></div>
        <div className="sidebar-foot"><span className="online-dot" /> All systems operational <span className="version-label">v1.0</span></div>
      </div>
    </aside>
  </>;
}
