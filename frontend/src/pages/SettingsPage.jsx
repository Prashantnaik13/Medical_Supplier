import { useEffect, useState } from 'react';
import { Bell, Building2, Check, CreditCard, LockKeyhole, Mail, MapPin, Save, ShieldCheck, UserRound } from 'lucide-react';
import { ROLE_LABELS } from '../data/demoData.js';

const DEFAULT_SETTINGS = {
  organization: 'Medora Supply Co.', email: 'care@medora.health', phone: '+91 20 6789 0123', gstin: '27AAFCM4821D1Z4',
  address: 'Plot 14, Chakan MIDC, Pune, Maharashtra 410501', city: 'Pune', state: 'Maharashtra', pincode: '410501',
  notifications: { orders: true, inventory: true, services: true, billing: false },
};

function settingsForUser(settings, user) {
  const buyer = user?.role === 'BUYER';
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    accountName: settings?.accountName ?? user?.name ?? '',
    accountEmail: settings?.accountEmail ?? user?.email ?? '',
    accountPhone: settings?.accountPhone ?? user?.phone ?? '',
    organization: settings?.organization ?? user?.organization ?? (buyer ? '' : DEFAULT_SETTINGS.organization),
    email: settings?.email ?? (buyer ? user?.email ?? '' : DEFAULT_SETTINGS.email),
    phone: settings?.phone ?? (buyer ? user?.phone ?? '' : DEFAULT_SETTINGS.phone),
    gstin: settings?.gstin ?? user?.gstin ?? '',
    address: settings?.address ?? (buyer ? '' : DEFAULT_SETTINGS.address),
    city: settings?.city ?? (buyer ? '' : DEFAULT_SETTINGS.city),
    state: settings?.state ?? 'Maharashtra',
    pincode: settings?.pincode ?? (buyer ? '' : DEFAULT_SETTINGS.pincode),
    notifications: { ...DEFAULT_SETTINGS.notifications, ...(settings?.notifications || {}) },
  };
}

export default function SettingsPage({ user, settings, onSave, onNotify }) {
  const [form, setForm] = useState(() => settingsForUser(settings, user));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  useEffect(() => setForm(settingsForUser(settings, user)), [settings, user]);
  const change = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const toggle = (key) => setForm((current) => ({ ...current, notifications: { ...current.notifications, [key]: !current.notifications?.[key] } }));
  const goTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const canManageOrganization = ['ADMIN', 'SUPPLIER', 'BUYER'].includes(user?.role);
  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await onSave?.(form);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2400);
    } catch (error) {
      setSaveError(error.message || 'Your changes could not be saved. Please try again.');
    } finally { setSaving(false); }
  };

  return <div className="page-stack settings-page">
    <div className="page-heading-row"><div><div className="eyebrow">MAKE MEDORA YOURS</div><h1>Profile & settings</h1><p>Update your personal account, facility details, and important notifications.</p></div><div className="heading-actions"><span className="settings-role-pill"><span className={`role-dot role-dot-${user?.role?.toLowerCase()}`} /> {ROLE_LABELS[user?.role]}</span></div></div>
    <div className="settings-layout">
      <nav className="settings-side-nav" aria-label="Settings sections">
        <button className="settings-nav-active" type="button" onClick={() => goTo('setting-account')}><UserRound size={16} /> My profile</button>
        {canManageOrganization && <>
          <button type="button" onClick={() => goTo('setting-business')}><Building2 size={16} /> Business profile</button>
          <button type="button" onClick={() => goTo('setting-notifications')}><Bell size={16} /> Notifications</button>
        </>}
        <button type="button" onClick={() => onNotify?.('Payment settings', 'Razorpay and bank-transfer adapters are configured from the server environment.')}><CreditCard size={16} /> Payments & billing</button>
        <button type="button" onClick={() => onNotify?.('Security settings', 'Authentication is JWT-based with bcrypt password hashing and role-based access.')}><LockKeyhole size={16} /> Security</button>
        <button type="button" onClick={() => onNotify?.('Team access', 'Admins can review invitations and user roles in Team & access.')}><UserRound size={16} /> Team access</button>
      </nav>

      <form className="settings-main" onSubmit={handleSave}>
        <section className="card-surface settings-card" id="setting-account">
          <div className="settings-card-heading"><span className="settings-card-icon"><UserRound size={17} /></span><div><h3>My profile</h3><p>Your sign-in identity and contact details.</p></div><span className="settings-saved-tag">{saved && <><Check size={13} /> Saved</>}</span></div>
          <div className="form-grid">
            <label className="form-field"><span>Full name</span><input value={form.accountName} onChange={change('accountName')} required minLength={2} maxLength={120} autoComplete="name" /></label>
            <label className="form-field"><span>Work email</span><input type="email" value={form.accountEmail} onChange={change('accountEmail')} required maxLength={190} autoComplete="email" /></label>
            <label className="form-field"><span>Personal phone</span><input type="tel" value={form.accountPhone} onChange={change('accountPhone')} maxLength={25} autoComplete="tel" /></label>
            <div className="settings-profile-note"><LockKeyhole size={14} /> Your role is managed by Medora access controls. Contact an administrator to change it.</div>
          </div>
        </section>

        {canManageOrganization && <section className="card-surface settings-card" id="setting-business">
          <div className="settings-card-heading"><span className="settings-card-icon"><Building2 size={17} /></span><div><h3>Business profile</h3><p>Facility or supplier details used on invoices and service visits.</p></div><span className="settings-saved-tag">{saved && <><Check size={13} /> Saved</>}</span></div>
          <div className="form-grid">
            <label className="form-field span-2"><span>Business name</span><input value={form.organization} onChange={change('organization')} required minLength={2} maxLength={160} /></label>
            <label className="form-field"><span>Business email</span><input type="email" value={form.email} onChange={change('email')} required /></label>
            <label className="form-field"><span>Business phone</span><input type="tel" value={form.phone} onChange={change('phone')} maxLength={25} /></label>
            <label className="form-field"><span>GSTIN</span><input value={form.gstin} onChange={change('gstin')} maxLength={15} /></label>
            <label className="form-field"><span>Primary city</span><input value={form.city} onChange={change('city')} maxLength={80} /></label>
            <label className="form-field"><span>State</span><input value={form.state} onChange={change('state')} maxLength={80} /></label>
            <label className="form-field"><span>PIN code</span><input value={form.pincode} onChange={change('pincode')} maxLength={10} /></label>
            <label className="form-field span-2"><span>Registered address</span><textarea rows="3" value={form.address} onChange={change('address')} maxLength={300} /></label>
          </div>
          <div className="settings-compliance"><ShieldCheck size={16} /><span><strong>GST-ready details</strong><small>Your GSTIN and place of supply are used in invoice records.</small></span><span className="online-dot" /></div>
        </section>}

        {canManageOrganization && <section className="card-surface settings-card" id="setting-notifications">
          <div className="settings-card-heading"><span className="settings-card-icon settings-icon-amber"><Bell size={17} /></span><div><h3>Notification preferences</h3><p>Choose which updates your team receives by email.</p></div></div>
          <div className="preference-list">{[['orders', 'Order updates', 'New orders, dispatch, and delivery changes'], ['inventory', 'Inventory alerts', 'Low stock and expiry-date reminders'], ['services', 'Service bookings', 'Visit requests, confirmations, and technician updates'], ['billing', 'Billing summaries', 'Payment receipts and monthly account summaries']].map(([key, title, description]) => <div className="preference-row" key={key}><span><strong>{title}</strong><small>{description}</small></span><button type="button" role="switch" aria-checked={Boolean(form.notifications?.[key])} className={`toggle-switch ${form.notifications?.[key] ? 'toggle-on' : ''}`} onClick={() => toggle(key)}><i /></button></div>)}</div>
          <div className="email-status"><Mail size={15} /><span>Email delivery is <strong>ready to configure</strong></span><button type="button" onClick={() => onNotify?.('Email provider', 'Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and MAIL_FROM in backend/.env to send real email.')}>Configure <MapPin size={13} /></button></div>
        </section>}
        {saveError && <div className="form-error" role="alert">{saveError}</div>}
        <div className="settings-save-row"><span><LockKeyhole size={14} /> {canManageOrganization ? 'Personal and business details are saved securely.' : 'Your personal details are saved securely.'}</span><button type="submit" className="button button-primary" disabled={saving}><Save size={15} /> {saving ? 'Saving…' : 'Save changes'}</button></div>
      </form>
    </div>
  </div>;
}
