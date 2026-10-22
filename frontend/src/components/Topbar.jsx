import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, CircleHelp, Menu, Search, ShoppingCart, X } from 'lucide-react';
import { ROLE_LABELS } from '../data/demoData.js';
import { PAGE_TITLES } from './Sidebar.jsx';

const ROLE_OPTIONS = ['ADMIN', 'SUPPLIER', 'BUYER', 'FULFILLMENT'];

export default function Topbar({ user, page, setPage, onSearch, query, cartCount, onOpenCart, notifications = [], onMarkRead, onSwitchRole, onLogout, demoMode = true, onMenu }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [localQuery, setLocalQuery] = useState(query || '');
  const notificationRef = useRef(null);
  const unread = notifications.filter((note) => !note.read).length;

  useEffect(() => setLocalQuery(query || ''), [query]);
  useEffect(() => {
    const close = (event) => {
      if (!event.target.closest('.notification-area')) setShowNotifications(false);
      if (!event.target.closest('.profile-area')) setShowProfile(false);
    };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    onSearch?.(localQuery);
    setPage('catalog');
  };

  return <header className="topbar">
    <div className="topbar-left">
      <button className="icon-button mobile-menu" type="button" aria-label="Open menu" onClick={onMenu}><Menu size={20} /></button>
      <div className="breadcrumbs"><span>Medora</span><span className="breadcrumb-slash">/</span><strong>{PAGE_TITLES[page] || 'Overview'}</strong></div>
    </div>
    <div className="topbar-tools">
      <form className="global-search" onSubmit={submitSearch} role="search"><Search size={16} /><input aria-label="Search products" placeholder="Search products..." value={localQuery} onChange={(event) => setLocalQuery(event.target.value)} /><kbd>ctrl K or ⌘ K</kbd></form> 
      <button type="button" className="help-link" title="Support"><CircleHelp size={17} /><span>Help</span></button>
      {user?.role !== 'FULFILLMENT' && <button type="button" className="icon-button cart-top-button" aria-label={`Cart, ${cartCount} items`} onClick={onOpenCart}><ShoppingCart size={18} />{cartCount > 0 && <span className="icon-count">{cartCount}</span>}</button>}
      <div className="notification-area topbar-popover-anchor" ref={notificationRef}>
        <button type="button" className={`icon-button notification-button ${showNotifications ? 'icon-button-selected' : ''}`} aria-label="Notifications" onClick={() => { setShowNotifications((value) => !value); setShowProfile(false); }}><Bell size={18} />{unread > 0 && <span className="notification-dot" />}</button>
        {showNotifications && <div className="popover notification-popover">
          <div className="popover-head"><div><strong>Notifications</strong><small>{unread ? `${unread} unread` : 'You are all caught up'}</small></div><button type="button" className="link-button" onClick={() => notifications.forEach((note) => !note.read && onMarkRead?.(note.id))}>Mark all read</button></div>
          <div className="notification-preview-list">{notifications.slice(0, 4).map((note) => <button type="button" className={`notification-preview ${note.read ? '' : 'notification-unread'}`} key={note.id} onClick={() => { onMarkRead?.(note.id); setPage('notifications'); setShowNotifications(false); }}><span className={`notification-mini-icon notif-${note.type}`}>{note.type === 'delivery' ? '↗' : note.type === 'invoice' ? '▤' : note.type === 'service' ? '✳' : '!'}</span><span><strong>{note.title}</strong><small>{note.body}</small><em>{note.time}</em></span>{!note.read && <i />}</button>)}</div>
          <button type="button" className="popover-foot" onClick={() => { setPage('notifications'); setShowNotifications(false); }}>View all notifications <span>→</span></button>
        </div>}
      </div>
      <div className="profile-area topbar-popover-anchor">
        <button type="button" className="profile-trigger" onClick={() => { setShowProfile((value) => !value); setShowNotifications(false); }} aria-expanded={showProfile}>
          <span className={`user-avatar avatar-${user?.role?.toLowerCase()}`}>{user?.initials || 'MS'}</span><span className="profile-copy"><strong>{user?.name?.split(' ')[0] || 'Team'}</strong><small>{ROLE_LABELS[user?.role] || 'Team member'}</small></span><ChevronDown size={15} />
        </button>
        {showProfile && <div className="popover profile-popover">
          <div className="profile-popover-user"><span className={`user-avatar avatar-${user?.role?.toLowerCase()}`}>{user?.initials || 'MS'}</span><div><strong>{user?.name}</strong><small>{user?.email}</small></div></div>
          {demoMode && <div className="role-switcher"><span className="role-switch-label">Preview as role</span>{ROLE_OPTIONS.map((role) => <button type="button" key={role} className={user?.role === role ? 'role-option role-option-active' : 'role-option'} onClick={() => { onSwitchRole(role); setShowProfile(false); }}><span className={`role-dot role-dot-${role.toLowerCase()}`} />{ROLE_LABELS[role]}{user?.role === role && <span className="role-check">✓</span>}</button>)}</div>}
          <button type="button" className="profile-settings-link" onClick={() => { setPage('settings'); setShowProfile(false); }}>Account settings <span>→</span></button>
          <button type="button" className="profile-logout-link" onClick={() => { setShowProfile(false); onLogout?.(); }}>Sign out <span>↗</span></button>
        </div>}
      </div>
    </div>
  </header>;
}
