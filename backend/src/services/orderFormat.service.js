function addressToString(order) {
  if (order.shippingAddressRecord) {
    const address = order.shippingAddressRecord;
    return [address.line1, address.line2, address.city, address.state, address.pincode].filter(Boolean).join(', ');
  }
  const snapshot = order.shippingAddressJson || {};
  if (typeof snapshot === 'string') return snapshot;
  return [snapshot.line1, snapshot.line2, snapshot.city, snapshot.state, snapshot.pincode].filter(Boolean).join(', ') || order.shippingAddress || '';
}

function serializeOrder(order) {
  const raw = order.get ? order.get({ plain: true }) : { ...order };
  const buyerOrg = raw.buyer?.organizationRecord?.name || raw.buyer?.organization || raw.buyerOrg || raw.shippingAddressJson?.organization || '';
  return {
    ...raw,
    userId: raw.userId || raw.buyer?.id,
    buyerName: raw.buyer?.name || raw.buyerName || raw.shippingAddressJson?.recipient || '',
    buyerOrg,
    shippingAddress: addressToString(raw),
    items: (raw.items || []).map((item) => ({
      ...item,
      productName: item.name,
      unitPrice: Number(item.unitPrice),
      gstRate: Number(item.gstRate),
      total: Number(item.total),
      quantity: Number(item.quantity),
    })),
    subtotal: Number(raw.subtotal || 0),
    tax: Number(raw.tax || 0),
    shippingFee: Number(raw.shippingFee || 0),
    total: Number(raw.total || 0),
    paymentStatus: raw.paymentStatus || 'PENDING',
    invoiceNumber: raw.invoice?.invoiceNumber || raw.invoiceNumber || null,
  };
}

function serializeProduct(product) {
  const raw = product.get ? product.get({ plain: true }) : { ...product };
  return { ...raw, category: raw.categoryRecord?.name || raw.category || 'Medical supplies', price: Number(raw.price), mrp: Number(raw.mrp || raw.price), gstRate: Number(raw.gstRate || 0), stock: Number(raw.stock || 0), reorderLevel: Number(raw.reorderLevel || 0) };
}

function serializeService(service) {
  const raw = service.get ? service.get({ plain: true }) : { ...service };
  return { ...raw, price: Number(raw.basePrice ?? raw.price ?? 0), duration: raw.duration || (raw.durationMinutes ? `${raw.durationMinutes} min` : ''), response: raw.responseSla || raw.response || '' };
}

function serializeBooking(booking) {
  const raw = booking.get ? booking.get({ plain: true }) : { ...booking };
  const address = raw.addressSnapshot || {};
  return {
    ...raw,
    serviceName: raw.service?.name || raw.serviceName,
    buyerOrg: raw.customer?.organizationRecord?.name || raw.buyerOrg || '',
    userId: raw.userId || raw.customer?.id,
    address: [address.line1, address.line2, address.city, address.state, address.pincode].filter(Boolean).join(', ') || raw.address || '',
    preferredTime: raw.preferredTime,
    preferredDate: raw.preferredDate,
  };
}

module.exports = { serializeOrder, serializeProduct, serializeService, serializeBooking, addressToString };
