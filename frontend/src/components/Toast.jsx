import { useEffect } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(onClose, 4200);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);
  if (!toast) return null;
  const Icon = toast.type === 'error' ? Info : CheckCircle2;
  return <div className={`toast toast-${toast.type || 'success'}`} role="status"><Icon size={19} /><div><strong>{toast.title || (toast.type === 'error' ? 'Something went wrong' : 'Done')}</strong><span>{toast.message}</span></div><button type="button" className="icon-button" aria-label="Dismiss" onClick={onClose}><X size={16} /></button></div>;
}
