import { useMemo, useState } from 'react';
import { Bell, Boxes, CalendarDays, Check, CheckCheck, FileText, Truck } from 'lucide-react';

const ICONS = { delivery: Truck, inventory: Boxes, service: CalendarDays, invoice: FileText, order: Bell };

export default function NotificationsPage({ notifications = [], onMarkRead, onMarkAllRead }) {
  const [filter, setFilter] = useState('All updates');
  const filtered = useMemo(() => filter === 'Unread' ? notifications.filter((item) => !item.read) : notifications, [filter, notifications]);
  const unread = notifications.filter((item) => !item.read).length;
  const buckets = filtered.reduce((groups, item) => {
    const key = item.time?.includes('Yesterday') ? 'YESTERDAY' : item.time?.includes('day') ? 'EARLIER' : 'TODAY';
    (groups[key] ||= []).push(item);
    return groups;
  }, {});
  return <div className="page-stack notifications-page">
    <div className="page-heading-row"><div><div className="eyebrow">A LITTLE MORE IN THE LOOP</div><h1>Notifications</h1><p>Order updates, service reminders, and stock alerts in one place.</p></div><div className="heading-actions"><button type="button" className="button button-secondary" disabled={!unread} onClick={onMarkAllRead}><CheckCheck size={15} /> Mark all read</button></div></div>
    <div className="notification-summary-strip"><span className="notification-summary-icon"><Bell size={19} /></span><div><strong>{unread ? `${unread} updates need your attention` : 'You’re all caught up'}</strong><small>Medora keeps you posted when something needs your care.</small></div><div className="notification-filter-tabs">{['All updates', 'Unread'].map((item) => <button type="button" className={filter === item ? 'notification-filter-active' : ''} key={item} onClick={() => setFilter(item)}>{item}{item === 'Unread' && unread > 0 && <span>{unread}</span>}</button>)}</div></div>
    <section className="notification-feed card-surface">{Object.entries(buckets).map(([bucket, entries]) => <div className="notification-bucket" key={bucket}><div className="notification-bucket-label">{bucket}</div>{entries.map((item) => { const Icon = ICONS[item.type] || Bell; return <button type="button" className={`notification-feed-row ${item.read ? '' : 'feed-unread'}`} key={item.id} onClick={() => onMarkRead?.(item.id)}><span className={`feed-notification-icon feed-icon-${item.type}`}><Icon size={17} /></span><span className="feed-notification-copy"><strong>{item.title}</strong><small>{item.body}</small><em>{item.time}</em></span>{!item.read && <span className="unread-indicator" />}<span className="notification-read-action">{item.read ? <Check size={15} /> : 'Mark read'}</span></button>; })}</div>)}{!filtered.length && <div className="empty-state notification-empty"><CheckCheck size={28} /><h3>Nothing unread</h3><p>You're right where you need to be.</p><button type="button" className="button button-secondary" onClick={() => setFilter('All updates')}>See all updates</button></div>}</section>
    <div className="notification-preference-note"><Bell size={15} /><span>Want fewer emails? Manage what reaches your inbox in <a href="#settings" onClick={(event) => { event.preventDefault(); window.dispatchEvent(new CustomEvent('medora:navigate', { detail: 'settings' })); }}>notification preferences</a>.</span></div>
  </div>;
}
