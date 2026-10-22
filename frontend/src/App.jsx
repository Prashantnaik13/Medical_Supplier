import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Toast from './components/Toast.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const CatalogPage = lazy(() => import('./pages/CatalogPage.jsx'));
const StorefrontPage = lazy(() => import('./pages/StorefrontPage.jsx'));
const OrdersPage = lazy(() => import('./pages/OrdersPage.jsx'));
const ServicesPage = lazy(() => import('./pages/ServicesPage.jsx'));
const MapPage = lazy(() => import('./pages/MapPage.jsx'));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage.jsx'));
const InventoryPage = lazy(() => import('./pages/InventoryPage.jsx'));
const CustomersPage = lazy(() => import('./pages/CustomersPage.jsx'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage.jsx'));
const TeamPage = lazy(() => import('./pages/TeamPage.jsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
import { CUSTOMERS, DEMO_USERS, INITIAL_BOOKINGS, INITIAL_NOTIFICATIONS, INITIAL_ORDERS, INITIAL_PRODUCTS, INITIAL_SERVICES, INITIAL_TEAM, MAP_LOCATIONS } from './data/demoData.js';
import { api, DEMO_MODE, setAuthToken } from './lib/api.js';

const copy = (value) => JSON.parse(JSON.stringify(value));
function readStored(key, fallback) {
  try { const value = localStorage.getItem(`medora:${key}`); return value ? JSON.parse(value) : copy(fallback); }
  catch { return copy(fallback); }
}
function useStoredState(key, fallback) {
  const [value, setValue] = useState(() => readStored(key, fallback));
  useEffect(() => { try { localStorage.setItem(`medora:${key}`, JSON.stringify(value)); } catch { /* storage may be unavailable */ } }, [key, value]);
  return [value, setValue];
}
const newId = (prefix) => `${prefix}-${globalThis.crypto?.randomUUID?.() || Date.now()}`;
const nextOrderNumber = () => `MD-${String(Date.now()).slice(-6)}`;
const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const unwrap = (response) => response?.data ?? response;

function openRazorpayCheckout(checkout, order) {
  return new Promise((resolve, reject) => {
    const launch = () => {
      if (!window.Razorpay) return reject(new Error('Secure checkout could not be loaded. Your order is saved with payment pending.'));
      const instance = new window.Razorpay({
        key: checkout.keyId,
        amount: checkout.amount,
        currency: checkout.currency || 'INR',
        order_id: checkout.razorpayOrderId,
        name: 'Medora Supply Co.',
        description: `Payment for ${order.orderNumber}`,
        image: `${window.location.origin}/medora-hero.png`,
        prefill: { name: order.buyerName, email: order.buyer?.email || '' },
        theme: { color: '#147764' },
        handler: async (response) => {
          try { await api.post('/payments/razorpay/verify', response); resolve(true); }
          catch (error) { reject(error); }
        },
        modal: { ondismiss: () => resolve(false) },
      });
      instance.open();
    };
    if (window.Razorpay) return launch();
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = launch;
    script.onerror = () => reject(new Error('Payment gateway could not be reached. Your order is saved with payment pending.'));
    document.body.appendChild(script);
  });
}

export default function App() {
  const [page, setPage] = useState(() => DEMO_MODE ? 'overview' : 'login');
  const [user, setUser] = useStoredState('user', DEMO_MODE ? DEMO_USERS.ADMIN : null);
  const [products, setProducts] = useStoredState('products', INITIAL_PRODUCTS);
  const [orders, setOrders] = useStoredState('orders', INITIAL_ORDERS);
  const [services, setServices] = useStoredState('services', INITIAL_SERVICES);
  const [bookings, setBookings] = useStoredState('bookings', INITIAL_BOOKINGS);
  const [notifications, setNotifications] = useStoredState('notifications', INITIAL_NOTIFICATIONS);
  const [team, setTeam] = useStoredState('team', INITIAL_TEAM);
  const [customers, setCustomers] = useStoredState('customers', CUSTOMERS);
  const [mapLocations, setMapLocations] = useStoredState('mapLocations', MAP_LOCATIONS);
  const [settings, setSettings] = useStoredState('settings', null);
  const [cart, setCart] = useStoredState('cart', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogQuery, setCatalogQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [apiBootstrapped, setApiBootstrapped] = useState(DEMO_MODE);

  const showToast = useCallback((title, message, type = 'success') => setToast({ title, message, type, key: Date.now() }), []);
  const notify = useCallback((title, message, type = 'info') => {
    showToast(title, message, type === 'error' ? 'error' : 'success');
    if (DEMO_MODE) setNotifications((current) => [{ id: newId('n'), title, body: message, type: 'order', time: 'Just now', read: false, userId: user?.id, createdAt: new Date().toISOString() }, ...current].slice(0, 30));
  }, [showToast, setNotifications, user]);

  const bootstrap = useCallback(async () => {
    if (DEMO_MODE) return;
    const rowsFrom = (response) => {
      const payload = unwrap(response);
      return Array.isArray(payload) ? payload : payload?.rows || [];
    };
    const optionalGet = async (path, fallback) => {
      try { return unwrap(await api.get(path)); } catch { return fallback; }
    };
    try {
      const me = unwrap(await api.get('/auth/me'));
      const [productsRes, ordersRes, servicesRes, bookingsRes, notificationsRes, mapRes, settingsRes] = await Promise.all([
        api.get('/products?limit=100'), api.get('/orders?limit=100'), api.get('/services'), api.get('/services/bookings'), api.get('/notifications'), api.get('/map/locations'), optionalGet('/settings/profile', null),
      ]);
      setUser(me);
      setProducts(rowsFrom(productsRes));
      setOrders(rowsFrom(ordersRes));
      setServices(rowsFrom(servicesRes));
      setBookings(rowsFrom(bookingsRes));
      setNotifications(rowsFrom(notificationsRes));
      setMapLocations(rowsFrom(mapRes));
      if (settingsRes) setSettings(settingsRes);
      if (['ADMIN', 'SUPPLIER'].includes(me.role)) {
        const customersRes = await optionalGet('/customers', []);
        setCustomers(Array.isArray(customersRes) ? customersRes : customersRes?.rows || []);
      }
      if (me.role === 'ADMIN') {
        const teamRes = await optionalGet('/users', []);
        setTeam(Array.isArray(teamRes) ? teamRes : teamRes?.rows || []);
      }
      setPage('overview');
      setApiBootstrapped(true);
    } catch (error) {
      setAuthToken(null);
      setUser(null);
      setPage('login');
      setApiBootstrapped(false);
    }
  }, [setUser, setProducts, setOrders, setServices, setBookings, setNotifications, setMapLocations, setSettings, setCustomers, setTeam]);

  useEffect(() => {
    if (!DEMO_MODE && localStorage.getItem('medora:token')) bootstrap();
    else if (!DEMO_MODE) setPage('login');
  }, [bootstrap]);

  useEffect(() => {
    const onNavigate = (event) => setPage(event.detail || 'overview');
    const onHotkey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPage('catalog');
        window.setTimeout(() => document.querySelector('.catalog-search input, .global-search input')?.focus(), 30);
      }
    };
    window.addEventListener('medora:navigate', onNavigate);
    window.addEventListener('keydown', onHotkey);
    return () => { window.removeEventListener('medora:navigate', onNavigate); window.removeEventListener('keydown', onHotkey); };
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const pendingCount = orders.filter((order) => !['DELIVERED', 'CANCELLED'].includes(order.status)).length;
  const canSeePage = useCallback((target) => {
    const role = user?.role || 'ADMIN';
    const pagesByRole = {
      ADMIN: ['overview', 'admin', 'storefront', 'catalog', 'orders', 'services', 'map', 'invoices', 'inventory', 'customers', 'team', 'notifications', 'settings'],
      SUPPLIER: ['overview', 'storefront', 'catalog', 'orders', 'services', 'map', 'invoices', 'inventory', 'customers', 'notifications', 'settings'],
      BUYER: ['overview', 'storefront', 'catalog', 'orders', 'services', 'map', 'invoices', 'notifications', 'settings'],
      FULFILLMENT: ['overview', 'orders', 'map', 'inventory', 'notifications', 'settings'],
    };
    return Boolean(pagesByRole[role]?.includes(target));
  }, [user]);
  const navigate = useCallback((target) => {
    if (canSeePage(target)) setPage(target);
    else setPage('overview');
  }, [canSeePage]);

  const switchRole = (role) => {
    if (!DEMO_MODE) return;
    setUser(copy(DEMO_USERS[role] || DEMO_USERS.ADMIN));
    setSettings(null);
    const allowedByRole = {
      SUPPLIER: ['overview', 'storefront', 'catalog', 'orders', 'services', 'map', 'invoices', 'inventory', 'customers', 'notifications', 'settings'],
      BUYER: ['overview', 'storefront', 'catalog', 'orders', 'services', 'map', 'invoices', 'notifications', 'settings'],
      FULFILLMENT: ['overview', 'orders', 'map', 'inventory', 'notifications', 'settings'],
    };
    if (allowedByRole[role] && !allowedByRole[role].includes(page)) setPage('overview');
    showToast('Preview role changed', `You’re now viewing Medora as ${role.replaceAll('_', ' ').toLowerCase()}.`);
  };

  const handleLogin = async ({ email, password, role }) => {
    setLoginError('');
    if (DEMO_MODE) {
      setUser(copy(DEMO_USERS[role] || DEMO_USERS.ADMIN));
      setSettings(null);
      setPage('overview');
      showToast('Welcome to Medora', `Signed in to the ${role.replaceAll('_', ' ').toLowerCase()} workspace.`);
      return;
    }
    setLoginLoading(true);
    try {
      const result = await api.post('/auth/login', { email, password });
      const payload = unwrap(result);
      setAuthToken(payload.token);
      setUser(payload.user);
      await bootstrap();
      setPage('overview');
    } catch (error) {
      setLoginError(error.message || 'Could not sign in. Check your email and password.');
    } finally { setLoginLoading(false); }
  };

  const handleRegister = async (details) => {
    setLoginError('');
    setLoginLoading(true);
    try {
      if (DEMO_MODE) {
        const createdUser = {
          id: newId('buyer'), name: details.name.trim(), email: details.email.trim().toLowerCase(), role: 'BUYER',
          organization: details.organization.trim(), phone: details.phone.trim(), gstin: details.gstin.trim().toUpperCase(),
          initials: details.name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase(),
        };
        setUser(createdUser);
        setSettings(null);
        setPage('overview');
        showToast('Buyer account created', `Welcome to Medora, ${createdUser.name}.`);
        return;
      }
      const response = await api.post('/auth/register', details);
      const payload = unwrap(response);
      setAuthToken(payload.token);
      setUser(payload.user);
      await bootstrap();
      showToast('Buyer account created', 'Your Medora workspace is ready.');
    } catch (error) {
      setLoginError(error.message || 'Could not create your account. Please check your details and try again.');
    } finally { setLoginLoading(false); }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setPage('login');
    setCart([]);
  };

  const addToCart = (product) => {
    setCart((current) => {
      const found = current.find((item) => item.id === product.id);
      if (found) return current.map((item) => item.id === product.id ? { ...item, quantity: Math.min(Number(product.stock || 99), item.quantity + 1) } : item);
      return [...current, { ...product, quantity: 1 }];
    });
    showToast('Added to your order', `${product.name} is in your cart.`);
  };
  const changeQuantity = (productId, delta) => setCart((current) => current.map((item) => item.id === productId ? { ...item, quantity: Math.max(1, Math.min(Number(item.stock || 99), item.quantity + delta)) } : item));
  const removeFromCart = (productId) => setCart((current) => current.filter((item) => item.id !== productId));
  const addProduct = async (product) => {
    if (!DEMO_MODE) {
      const response = await api.post('/products', product);
      const created = unwrap(response);
      setProducts((current) => [created, ...current]);
      return;
    }
    setProducts((current) => [product, ...current]);
  };

  const updateOrder = async (orderId, status) => {
    try {
      if (!DEMO_MODE) await api.patch(`/orders/${orderId}/status`, { status });
      setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status, deliveredAt: status === 'DELIVERED' ? new Date().toISOString() : order.deliveredAt } : order));
      const label = status.replaceAll('_', ' ').toLowerCase();
      showToast('Order updated', `Order status changed to ${label}.`);
      if (DEMO_MODE) setNotifications((current) => [{ id: newId('n'), title: `Order ${label}`, body: `A Medora order was updated to ${label}.`, type: 'delivery', time: 'Just now', read: false, userId: user?.id }, ...current]);
    } catch (error) { showToast('Could not update order', error.message, 'error'); }
  };

  const createBooking = async (booking) => {
    if (!DEMO_MODE) {
      const response = await api.post('/services/bookings', booking);
      setBookings((current) => [unwrap(response), ...current]);
      return;
    }
    setBookings((current) => [booking, ...current]);
  };
  const updateBooking = async (bookingId, status) => {
    try {
      if (!DEMO_MODE) await api.patch(`/services/bookings/${bookingId}`, { status });
      setBookings((current) => current.map((booking) => booking.id === bookingId ? { ...booking, status, technician: status === 'TECHNICIAN_ASSIGNED' ? 'Rahul Deshmukh' : booking.technician } : booking));
      showToast('Service request updated', `Booking status is now ${status.replaceAll('_', ' ').toLowerCase()}.`);
    } catch (error) { showToast('Could not update request', error.message, 'error'); }
  };
  const adjustStock = async (productId, delta, reason) => {
    try {
      if (!DEMO_MODE) await api.patch(`/products/${productId}/stock`, { delta, reason });
      setProducts((current) => current.map((product) => product.id === productId ? { ...product, stock: Math.max(0, Number(product.stock) + delta) } : product));
    } catch (error) { showToast('Could not adjust stock', error.message, 'error'); }
  };
  const inviteMember = async (member) => {
    if (!DEMO_MODE) {
      const response = await api.post('/users/invite', member);
      setTeam((current) => [unwrap(response), ...current]);
      return;
    }
    setTeam((current) => [member, ...current]);
  };
  const saveSettings = async (nextSettings) => {
    let savedSettings = nextSettings;
    if (!DEMO_MODE) savedSettings = unwrap(await api.put('/settings/profile', nextSettings));
    setSettings(savedSettings);
    setUser((current) => current ? {
      ...current,
      name: savedSettings.accountName || current.name,
      email: savedSettings.accountEmail || current.email,
      phone: savedSettings.accountPhone || '',
      organization: savedSettings.organization || current.organization,
      gstin: savedSettings.gstin || current.gstin,
    } : current);
    showToast('Profile saved', 'Your personal and business details are up to date.');
  };

  const handlePlaceOrder = async ({ items, form, method, subtotal, tax, shipping, total }) => {
    setCheckoutLoading(true);
    try {
      let order;
      let checkout = null;
      if (!DEMO_MODE) {
        const response = await api.post('/orders', {
          items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
          paymentMethod: method,
          shippingAddress: { recipient: form.recipient, organization: form.organization, line1: form.address, city: form.city, state: form.state, pincode: form.pincode, gstin: form.gstin },
        });
        order = unwrap(response);
        checkout = response?.checkout || null;
      } else {
        const orderNumber = nextOrderNumber();
        const createdAt = new Date().toISOString();
        const invoiceYear = String(new Date(createdAt).getFullYear()).slice(-2);
        order = {
          id: newId('ord'), orderNumber, userId: user?.id || 'buyer-1', buyerName: form.recipient, buyerOrg: form.organization,
          status: method === 'COD' ? 'PROCESSING' : 'CONFIRMED', paymentStatus: ['UPI', 'CARD'].includes(method) ? 'PAID' : 'PENDING', paymentMethod: method,
          createdAt, expectedDelivery: 'Within 24–48 hours', shippingAddress: `${form.address}, ${form.city}, ${form.state} ${form.pincode}`,
          addressCoordinates: { lat: 18.5594, lng: 73.8073 }, subtotal, tax, shippingFee: shipping, total,
          items: items.map((item) => ({ productId: item.id, name: item.name, sku: item.sku, quantity: item.quantity, unitPrice: item.price, gstRate: item.gstRate, total: Number(item.price) * Number(item.quantity) })),
          invoiceNumber: `INV-${invoiceYear}-${orderNumber.replace(/^MD-/, '')}`,
        };
        setProducts((current) => current.map((product) => { const ordered = items.find((item) => item.id === product.id); return ordered ? { ...product, stock: Math.max(0, Number(product.stock) - Number(ordered.quantity)) } : product; }));
      }
      setOrders((current) => [order, ...current]);
      setCart([]);
      setCheckoutOpen(false);
      setCartOpen(false);
      setPage('orders');
      if (DEMO_MODE) {
        showToast('Order placed successfully', `${order.orderNumber} is confirmed. Your invoice is ready to download.`);
        setNotifications((current) => [{ id: newId('n'), title: 'Order confirmed', body: `Order ${order.orderNumber} was placed successfully. Your tax invoice is ready.`, type: 'order', time: 'Just now', read: false, userId: user?.id }, ...current]);
      } else {
        showToast('Order placed successfully', `${order.orderNumber} is saved. We’re preparing your invoice.`);
        if (checkout) {
          try {
            const paid = await openRazorpayCheckout(checkout, order);
            if (paid) {
              setOrders((current) => current.map((item) => item.id === order.id ? { ...item, paymentStatus: 'PAID' } : item));
              showToast('Payment received', `Payment for ${order.orderNumber} was verified.`);
            } else showToast('Payment pending', `Order ${order.orderNumber} is saved. You can complete payment from your order details.`, 'error');
          } catch (paymentError) {
            showToast('Payment needs attention', `${order.orderNumber} is saved, but payment was not confirmed. ${paymentError.message}`, 'error');
          }
        }
      }
    } catch (error) {
      showToast('Order could not be placed', error.message || 'Please review your details and try again.', 'error');
    } finally { setCheckoutLoading(false); }
  };

  const downloadInvoice = async (order) => {
    try {
      if (DEMO_MODE) {
        const { downloadInvoicePdf } = await import('./lib/invoicePdf.js');
        downloadInvoicePdf(order, user || {});
      } else {
        const response = await api.get(`/invoices/${order.id}/pdf`);
        const blob = response instanceof Blob ? response : new Blob([response], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${order.invoiceNumber || order.orderNumber}.pdf`;
        anchor.click();
        URL.revokeObjectURL(url);
      }
      showToast('Invoice downloaded', `${order.invoiceNumber || order.orderNumber} PDF is ready.`);
    } catch (error) { showToast('Could not download invoice', error.message, 'error'); }
  };
  const markRead = (id) => setNotifications((current) => current.map((note) => note.id === id ? { ...note, read: true } : note));
  const markAllRead = () => setNotifications((current) => current.map((note) => ({ ...note, read: true })));

  const pageBody = useMemo(() => {
    if (!user) return <LoginPage onLogin={handleLogin} onRegister={handleRegister} onBack={() => setPage('storefront')} loading={loginLoading} error={loginError} demoMode={DEMO_MODE} />;
    const shared = { user, onPage: navigate, onNotify: notify };
    switch (page) {
      case 'overview': return <DashboardPage {...shared} orders={orders} products={products} bookings={bookings} onViewOrder={() => setPage('orders')} onUpdateOrder={updateOrder} />;
      case 'admin': return <AdminPage team={team} customers={customers} orders={orders} products={products} bookings={bookings} onPage={navigate} />;
      case 'storefront': return <StorefrontPage {...shared} products={products} services={services} onAddToCart={addToCart} />;
      case 'catalog': return <CatalogPage products={products} role={user.role} searchQuery={catalogQuery} setSearchQuery={setCatalogQuery} onAddToCart={addToCart} onAddProduct={addProduct} onNotify={notify} />;
      case 'orders': return <OrdersPage orders={orders} user={user} onUpdateOrder={updateOrder} onDownloadInvoice={downloadInvoice} />;
      case 'services': return <ServicesPage services={services} bookings={bookings} user={user} onCreateBooking={createBooking} onUpdateBooking={updateBooking} onNotify={notify} />;
      case 'map': return <MapPage locations={mapLocations} orders={orders} user={user} onUpdateOrder={updateOrder} onPage={navigate} />;
      case 'invoices': return <InvoicesPage orders={orders} user={user} onDownload={downloadInvoice} />;
      case 'inventory': return <InventoryPage products={products} role={user.role} onAdjustStock={adjustStock} onNotify={notify} />;
      case 'customers': return <CustomersPage customers={customers} onNotify={notify} />;
      case 'notifications': return <NotificationsPage notifications={notifications} onMarkRead={markRead} onMarkAllRead={markAllRead} />;
      case 'team': return <TeamPage team={team} onInvite={inviteMember} onNotify={notify} />;
      case 'settings': return <SettingsPage user={user} settings={settings} onSave={saveSettings} onNotify={notify} />;
      default: return <DashboardPage {...shared} orders={orders} products={products} bookings={bookings} onViewOrder={() => setPage('orders')} onUpdateOrder={updateOrder} />;
    }
  }, [user, page, handleLogin, handleRegister, loginLoading, loginError, navigate, notify, orders, products, bookings, services, catalogQuery, customers, notifications, team, settings, mapLocations]);

  if (!user) {
    const fallback = <div className="page-loading" role="status">Loading Medora…</div>;
    if (page === 'storefront') return <Suspense fallback={fallback}><><StorefrontPage user={null} products={products} services={services} onPage={() => setPage('login')} onAddToCart={() => setPage('login')} /><Toast toast={toast} onClose={() => setToast(null)} /></></Suspense>;
    return <Suspense fallback={fallback}><><LoginPage onLogin={handleLogin} onRegister={handleRegister} onBack={() => setPage('storefront')} loading={loginLoading} error={loginError} demoMode={DEMO_MODE} /><Toast toast={toast} onClose={() => setToast(null)} /></></Suspense>;
  }
  return <div className="app-shell">
    <Sidebar user={user} currentPage={page} onNavigate={navigate} mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} pendingCount={pendingCount} />
    <div className="main-shell"><Topbar user={user} page={page} setPage={navigate} onSearch={(query) => setCatalogQuery(query)} query={searchQuery} cartCount={cartCount} onOpenCart={() => setCartOpen(true)} notifications={notifications} onMarkRead={markRead} onSwitchRole={switchRole} demoMode={DEMO_MODE} onMenu={() => setMobileNavOpen(true)} onLogout={logout} /><main className={`page-content page-content-${page}`}><Suspense fallback={<div className="page-loading" role="status">Loading workspace…</div>}>{pageBody}</Suspense></main><footer className="app-footer"><span>© 2026 Medora Supply Co.</span><span><span className="online-dot" /> Secure healthcare supply</span><a href="mailto:care@medora.health">Need support?</a></footer></div>
    <CartDrawer open={cartOpen} items={cart} onClose={() => setCartOpen(false)} onChangeQuantity={changeQuantity} onRemove={removeFromCart} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} onContinue={() => { setCartOpen(false); setPage('catalog'); }} />
    <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} items={cart} user={user} onPlaceOrder={handlePlaceOrder} processing={checkoutLoading} />
    <Toast toast={toast} onClose={() => setToast(null)} />
    <button type="button" className="mobile-cart-fab" aria-label={`Open cart, ${cartCount} items`} onClick={() => setCartOpen(true)}><ShoppingCart size={19} />{cartCount > 0 && <span>{cartCount}</span>}</button>
  </div>;
}
