const LABELS = {
  PENDING: 'Awaiting review',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  PICKING: 'Picking',
  PACKED: 'Packed',
  READY_FOR_DISPATCH: 'Ready to dispatch',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REQUESTED: 'Requested',
  TECHNICIAN_ASSIGNED: 'Technician assigned',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
  ACTIVE: 'Active',
  REVIEW: 'Needs review',
};

const TONES = {
  PENDING: 'warning', REQUESTED: 'warning', PROCESSING: 'info', PICKING: 'info',
  CONFIRMED: 'info', PACKED: 'blue', READY_FOR_DISPATCH: 'blue', OUT_FOR_DELIVERY: 'blue',
  DELIVERED: 'success', COMPLETED: 'success', PAID: 'success', ACTIVE: 'success',
  CANCELLED: 'muted', FAILED: 'danger', REFUNDED: 'muted', TECHNICIAN_ASSIGNED: 'violet',
  IN_PROGRESS: 'violet', REVIEW: 'warning',
};

export function statusLabel(status) {
  return LABELS[status] || String(status || 'Unknown').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function StatusBadge({ status, dot = true }) {
  const key = String(status || '').toUpperCase();
  return <span className={`status-badge status-${TONES[key] || 'muted'}`}>{dot && <i />}{statusLabel(key)}</span>;
}
