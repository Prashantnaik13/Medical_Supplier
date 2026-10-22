import { useState } from 'react';
import { Activity, ArrowLeft, ArrowRight, Eye, EyeOff, HeartPulse, ShieldCheck } from 'lucide-react';
import { ROLE_LABELS } from '../data/demoData.js';

export default function LoginPage({ onLogin, onRegister, onBack, loading = false, error = '', demoMode = true }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('ananya@medora.demo');
  const [password, setPassword] = useState('medora-demo');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setFormError('');
    if (nextMode === 'register') {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('BUYER');
    } else {
      setEmail('ananya@medora.demo');
      setPassword('medora-demo');
      setRole('ADMIN');
    }
  };

  const submit = (event) => {
    event.preventDefault();
    setFormError('');
    if (mode === 'register') {
      if (password !== confirmPassword) {
        setFormError('Your passwords do not match.');
        return;
      }
      onRegister?.({ name, email, password, organization, phone, gstin });
      return;
    }
    onLogin?.({ email, password, role });
  };

  const isRegistering = mode === 'register';
  return <main className="login-page">
    <div className="login-left-panel">
      <button type="button" className="login-back" onClick={onBack}><ArrowLeft size={16} /> Back to Medora</button>
      <div className="login-brand"><span className="brand-mark"><Activity size={22} /></span><span><strong>medora</strong><small>SUPPLY CO.</small></span></div>
      <div className="login-left-content">
        <div className="login-emblem"><HeartPulse size={34} /></div>
        <span className="eyebrow">BETTER CARE STARTS HERE</span>
        <h1>Supply care.<br /><em>Support people.</em></h1>
        <p>A little less friction in your supply chain, and a lot more room to do what matters.</p>
        <div className="login-proof"><ShieldCheck size={17} /><span>Secure, role-based access for your team</span></div>
      </div>
      <div className="login-left-footer"><span>© 2026 Medora Supply Co.</span><span>Care, delivered.</span></div>
    </div>

    <div className="login-right-panel">
      <div className="login-card">
        <span className="eyebrow">{isRegistering ? 'JOIN THE MEDORA NETWORK' : 'WELCOME BACK'}</span>
        <h2>{isRegistering ? 'Create your account' : 'Sign in to Medora'}</h2>
        <p>{isRegistering ? 'Set up a buyer account for your clinic or hospital.' : 'Access your supplies, orders, and care services.'}</p>
        <form onSubmit={submit} className="form-stack login-form">
          {isRegistering && <>
            <label className="form-field"><span>Your full name</span><input type="text" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required minLength={2} maxLength={120} placeholder="Dr. Meera Shah" /></label>
            <label className="form-field"><span>Clinic or hospital name</span><input type="text" value={organization} onChange={(event) => setOrganization(event.target.value)} autoComplete="organization" required minLength={2} maxLength={160} placeholder="Westside Family Clinic" /></label>
          </>}
          <label className="form-field"><span>Work email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required maxLength={190} placeholder="you@clinic.com" /></label>
          {isRegistering && <div className="form-grid login-register-grid">
            <label className="form-field"><span>Phone <small>optional</small></span><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" maxLength={25} placeholder="+91 98765 43210" /></label>
            <label className="form-field"><span>GSTIN <small>optional</small></span><input type="text" value={gstin} onChange={(event) => setGstin(event.target.value.toUpperCase())} maxLength={15} placeholder="27ABCDE1234F1Z5" /></label>
          </div>}
          <label className="form-field password-field"><span>Password{isRegistering && <small> · at least 10 characters</small>}</span><div className="password-input"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isRegistering ? 'new-password' : 'current-password'} required minLength={isRegistering ? 10 : 1} maxLength={120} /><button type="button" aria-label="Toggle password" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
          {isRegistering && <label className="form-field"><span>Confirm password</span><input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required minLength={10} maxLength={120} /></label>}
          {!isRegistering && demoMode && <label className="form-field"><span>Preview role</span><select value={role} onChange={(event) => setRole(event.target.value)}>{Object.entries(ROLE_LABELS).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label>}
          {(formError || error) && <div className="form-error" role="alert">{formError || error}</div>}
          <button className="button button-primary login-submit" type="submit" disabled={loading}>{loading ? (isRegistering ? 'Creating account…' : 'Signing in…') : (isRegistering ? 'Create buyer account' : 'Sign in')} <ArrowRight size={16} /></button>
        </form>
        {demoMode && !isRegistering && <div className="demo-hint"><span className="demo-hint-icon">✳</span><span><strong>Preview mode is ready.</strong><small>Try any role above — no account setup needed.</small></span></div>}
        {isRegistering && <div className="register-note"><ShieldCheck size={14} /> Buyer accounts are self-service. Supplier and delivery access is issued by a Medora administrator.</div>}
        <div className="login-help">{isRegistering ? 'Already have an account?' : 'New to Medora?'} <button type="button" className="login-mode-link" onClick={() => switchMode(isRegistering ? 'login' : 'register')}>{isRegistering ? 'Sign in' : 'Create a buyer account'}</button></div>
        <div className="login-security"><ShieldCheck size={14} /> Your information is encrypted and protected.</div>
      </div>
      <div className="login-mobile-footer">Medora Supply Co. · Secure healthcare supply</div>
    </div>
  </main>;
}
