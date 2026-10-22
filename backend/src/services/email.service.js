const nodemailer = require('nodemailer');
const path = require('node:path');
const { EmailLog } = require('../models');

let transporter;
let transporterReady = false;
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

function getTransporter() {
  if (transporterReady) return transporter;
  transporterReady = true;
  if (!process.env.SMTP_HOST) return null;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true' || Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
  });
  return transporter;
}

function emailShell(title, body) {
  return `<!doctype html><html><body style="margin:0;background:#f4f7f5;font-family:Arial,sans-serif;color:#263e3d"><div style="max-width:600px;margin:24px auto;background:#fff;border:1px solid #e5ece8;border-radius:14px;overflow:hidden"><div style="padding:22px 28px;background:#16483f;color:#fff"><div style="font-size:21px;font-weight:700;letter-spacing:-1px">medora <span style="font-size:9px;letter-spacing:2px;color:#c0ded0">SUPPLY CO.</span></div></div><div style="padding:28px"><p style="margin:0 0 8px;color:#40866c;font-size:10px;letter-spacing:1px;font-weight:700">CARE, DELIVERED.</p><h1 style="margin:0 0 14px;font-size:23px;letter-spacing:-.5px;color:#294744">${escapeHtml(title)}</h1>${body}<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #edf1ef;color:#899a93;font-size:11px;line-height:1.6">Need help? Email <a href="mailto:care@medora.health" style="color:#18745d">care@medora.health</a> or call +91 20 6789 0123.</p></div><div style="padding:13px 28px;background:#f8fbf9;color:#93a29b;font-size:10px">Medora Supply Co. · Pune, Maharashtra · GST-ready billing</div></div></body></html>`;
}

const templates = {
  orderPlaced: ({ name, orderNumber, total, expectedDelivery }) => ({
    subject: `Order ${orderNumber} is confirmed`,
    html: emailShell('Your order is in good hands.', `<p style="font-size:14px;line-height:1.6;color:#61746d">Hi ${escapeHtml(name)}, we’ve received <strong>${escapeHtml(orderNumber)}</strong> and our team is preparing it for dispatch.</p><div style="padding:14px 16px;border-radius:9px;background:#f3f8f4"><div style="font-size:11px;color:#84958d">ORDER TOTAL</div><div style="margin-top:5px;font-size:21px;font-weight:700;color:#246b56">₹${Number(total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div><div style="margin-top:8px;font-size:11px;color:#758980">Estimated delivery: ${escapeHtml(expectedDelivery || '24–48 hours')}</div></div><p style="font-size:12px;color:#75877f;line-height:1.6">Your tax invoice is attached when available. We’ll send another update as your order moves.</p>`),
  }),
  orderStatus: ({ name, orderNumber, status }) => ({
    subject: `Order ${orderNumber}: ${String(status).replaceAll('_', ' ').toLowerCase()}`,
    html: emailShell('A quick update on your order.', `<p style="font-size:14px;line-height:1.6;color:#61746d">Hi ${escapeHtml(name)}, order <strong>${escapeHtml(orderNumber)}</strong> is now <strong>${escapeHtml(String(status).replaceAll('_', ' ').toLowerCase())}</strong>.</p><p style="font-size:12px;line-height:1.6;color:#75877f">Sign in to Medora to see your latest order timeline, delivery details, and invoice.</p>`),
  }),
  serviceBooking: ({ name, serviceName, bookingNumber, preferredDate, preferredTime }) => ({
    subject: `Service request ${bookingNumber} received`,
    html: emailShell('Your equipment care request is received.', `<p style="font-size:14px;line-height:1.6;color:#61746d">Hi ${escapeHtml(name)}, we’ve received your request for <strong>${escapeHtml(serviceName)}</strong>.</p><div style="padding:13px 15px;border-radius:9px;background:#f4f8f5;color:#61746d;font-size:12px;line-height:1.8">Request: <strong>${escapeHtml(bookingNumber)}</strong><br>Preferred date: ${escapeHtml(preferredDate)}<br>Time window: ${escapeHtml(preferredTime)}</div><p style="font-size:12px;color:#75877f;line-height:1.6">Our local service team will review the slot and confirm your visit shortly.</p>`),
  }),
  invitation: ({ name, role, activationUrl }) => ({
    subject: 'You’re invited to Medora Supply',
    html: emailShell('Your Medora workspace is ready.', `<p style="font-size:14px;line-height:1.6;color:#61746d">Hi ${escapeHtml(name)}, you’ve been invited to Medora as <strong>${escapeHtml(role)}</strong>.</p><p style="font-size:12px;line-height:1.6;color:#75877f">Set your password and activate your account to access your team workspace.</p><p style="margin:20px 0"><a href="${escapeHtml(activationUrl)}" style="display:inline-block;padding:12px 17px;border-radius:7px;background:#167662;color:#fff;text-decoration:none;font-size:12px;font-weight:700">Activate account</a></p><p style="font-size:10px;color:#91a099">This secure invitation link expires in 48 hours.</p>`),
  }),
  welcome: ({ name }) => ({
    subject: 'Welcome to Medora Supply',
    html: emailShell('Welcome to Medora.', `<p style="font-size:14px;line-height:1.6;color:#61746d">Hi ${escapeHtml(name)}, your account is ready. Explore verified medical supplies, track orders, and book equipment services in one place.</p>`),
  }),
};

async function sendEmail({ to, subject, html, text, template = 'custom', attachments = [], metadata = {} }) {
  const recipients = Array.isArray(to) ? to.join(',') : String(to || '');
  const log = await EmailLog.create({ to: recipients, subject, template, status: 'QUEUED', metadata });
  const mailTransport = getTransporter();
  if (!mailTransport) {
    await log.update({ status: 'SIMULATED', errorMessage: 'SMTP_HOST is not configured. Delivery is simulated in development.' });
    if (process.env.NODE_ENV !== 'production') console.info(`[email:simulated] ${recipients} · ${subject}`);
    return { status: 'SIMULATED', id: log.id };
  }
  try {
    const result = await mailTransport.sendMail({ from: process.env.MAIL_FROM || 'Medora Supply <care@medora.health>', to: recipients, subject, html, text, attachments });
    await log.update({ status: 'SENT', providerMessageId: result.messageId });
    return { status: 'SENT', id: result.messageId };
  } catch (error) {
    await log.update({ status: 'FAILED', errorMessage: error.message });
    console.error('[email:failed]', error.message);
    return { status: 'FAILED', id: log.id, error: error.message };
  }
}

async function sendTemplate(templateName, to, values = {}, options = {}) {
  const template = templates[templateName];
  if (!template) throw new Error(`Unknown email template: ${templateName}`);
  const built = template(values);
  return sendEmail({ to, ...built, template: templateName, ...options });
}

module.exports = { sendEmail, sendTemplate, templates, emailShell, escapeHtml };
