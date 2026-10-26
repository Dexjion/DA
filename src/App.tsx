/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Check,
  Heart,
  Sparkles,
} from 'lucide-react';
import {
  Product,
  ProductCategory,
  UploadedMediaItem,
  AdminCredentials,
  DEFAULT_ADMIN_CREDENTIALS,
  CartItem,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentConfig,
  EmailTemplate,
  SentEmailRecord,
  INITIAL_PRODUCTS,
  INITIAL_PAYMENT_CONFIG,
  INITIAL_EMAIL_TEMPLATES,
  isAdminRoute,
  formatVND,
  filterAndSortProducts,
  calculateCartTotals,
  generateTransferContent,
  renderEmailTemplate,
} from './utils/storeLogic';
import { YarnArtwork } from './components/YarnArtwork';
import { ProductModal } from './components/ProductModal';
import { CartCheckoutModal } from './components/CartCheckoutModal';
import { AdminLoginScreen } from './components/AdminLoginScreen';
import { AdminPortal } from './components/AdminPortal';

const SEED_ORDER: Order = {
  id: 'ord-seed-1042',
  orderCode: 'PA1042',
  createdAt: '25/10/2026 09:15',
  customerName: 'Lê Ngọc Minh Châu',
  customerEmail: 'minhchau.le@gmail.com',
  customerPhone: '0904819273',
  shippingAddress: '28 Lê Lợi, Phường Phú Hội, Thành Phố Huế',
  note: 'Gói hộp quà giấy kraft kèm thiệp cảm ơn',
  items: [
    {
      product: INITIAL_PRODUCTS[0],
      quantity: 1,
      selectedColor: 'Kem Bơ',
    },
    {
      product: INITIAL_PRODUCTS[2],
      quantity: 1,
      selectedColor: 'Hồng Phấn & Vàng Bơ',
    },
  ],
  subtotal: 510000,
  shippingFee: 25000,
  discount: 0,
  totalAmount: 535000,
  paymentMethod: 'vietqr',
  paymentStatus: 'paid',
  orderStatus: 'paid_verified',
  transferContent: 'PA1042',
  estimatedDeliveryNote:
    'Hàng đan thủ công theo đơn (Order): Có hàng sau 7–10 ngày kể từ khi thanh toán.',
};

// Hand-drawn Daisy SVG motif matching the cover banner
const DaisyMotif: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <circle cx="16" cy="6" r="4.5" fill="#FFFDF9" stroke="#F4A6B8" strokeWidth="1.2" />
    <circle cx="25" cy="12" r="4.5" fill="#FFFDF9" stroke="#F4A6B8" strokeWidth="1.2" />
    <circle cx="22" cy="23" r="4.5" fill="#FFFDF9" stroke="#F4A6B8" strokeWidth="1.2" />
    <circle cx="10" cy="23" r="4.5" fill="#FFFDF9" stroke="#F4A6B8" strokeWidth="1.2" />
    <circle cx="7" cy="12" r="4.5" fill="#FFFDF9" stroke="#F4A6B8" strokeWidth="1.2" />
    <circle cx="16" cy="15" r="4.5" fill="#F6B93B" />
  </svg>
);

// Hand-drawn Tulip SVG motif matching the cover banner
const TulipMotif: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <path d="M16 17 L16 29" stroke="#688850" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M16 24 Q10 21 9 25 Q12 28 16 24" fill="#82A868" />
    <path d="M16 24 Q22 21 23 25 Q20 28 16 24" fill="#82A868" />
    <path
      d="M9 11 C9 20, 23 20, 23 11 C23 6, 19 9, 16 4 C13 9, 9 6, 9 11 Z"
      fill="#F2798F"
      stroke="#E14B68"
      strokeWidth="1.2"
    />
  </svg>
);

export default function App() {
  // Persistent State with localStorage fallback
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('handmade_pa_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(() => {
    try {
      const saved = localStorage.getItem('handmade_pa_payment_cfg_v3');
      return saved ? JSON.parse(saved) : INITIAL_PAYMENT_CONFIG;
    } catch {
      return INITIAL_PAYMENT_CONFIG;
    }
  });

  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('handmade_pa_email_tpls_v4');
      return saved ? JSON.parse(saved) : INITIAL_EMAIL_TEMPLATES;
    } catch {
      return INITIAL_EMAIL_TEMPLATES;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('handmade_pa_orders_v3');
      return saved ? JSON.parse(saved) : [SEED_ORDER];
    } catch {
      return [SEED_ORDER];
    }
  });

  const [sentEmails, setSentEmails] = useState<SentEmailRecord[]>(() => {
    try {
      const saved = localStorage.getItem('handmade_pa_sent_emails_v4');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const seedTpl = renderEmailTemplate(INITIAL_EMAIL_TEMPLATES[0], SEED_ORDER);
    return [
      {
        id: 'mail-seed-1',
        orderCode: SEED_ORDER.orderCode,
        recipientEmail: SEED_ORDER.customerEmail,
        recipientName: SEED_ORDER.customerName,
        triggerType: 'order_created',
        subject: seedTpl.subject,
        bodyText: seedTpl.bodyText,
        sentAt: '25/10/2026 09:15',
        status: 'delivered',
      },
    ];
  });

  const [mediaLibrary, setMediaLibrary] = useState<UploadedMediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('handmade_pa_media_lib');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(
    () => {
      try {
        const saved = localStorage.getItem('handmade_pa_admin_creds');
        return saved ? JSON.parse(saved) : DEFAULT_ADMIN_CREDENTIALS;
      } catch {
        return DEFAULT_ADMIN_CREDENTIALS;
      }
    }
  );

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(
    () => {
      try {
        return sessionStorage.getItem('handmade_pa_admin_session') === '1';
      } catch {
        return false;
      }
    }
  );

  // Route Detection for hidden /adminpa path
  const [activeView, setActiveView] = useState<'store' | 'admin'>(() =>
    isAdminRoute(
      window.location.pathname,
      window.location.hash,
      window.location.search
    )
      ? 'admin'
      : 'store'
  );

  const [cart, setCart] = useState<CartItem[]>([
    {
      product: INITIAL_PRODUCTS[0],
      quantity: 1,
      selectedColor: INITIAL_PRODUCTS[0].colors[0],
    },
  ]);

  // Storefront Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | ProductCategory
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc'>(
    'featured'
  );

  // Modals & Drawers
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(
    null
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickAddedId, setQuickAddedId] = useState<string | null>(null);

  useEffect(() => {
    const syncRoute = () => {
      if (
        isAdminRoute(
          window.location.pathname,
          window.location.hash,
          window.location.search
        )
      ) {
        setActiveView('admin');
      } else {
        setActiveView('store');
      }
    };
    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, []);

  const navigateToStore = () => {
    try {
      window.history.pushState({}, '', '/');
    } catch {}
    setActiveView('store');
  };

  const navigateToAdminPa = () => {
    try {
      window.history.pushState({}, '', '/adminpa');
    } catch {}
    setActiveView('admin');
  };

  useEffect(() => {
    try {
      localStorage.setItem('handmade_pa_products', JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'handmade_pa_payment_cfg_v3',
        JSON.stringify(paymentConfig)
      );
    } catch {}
  }, [paymentConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'handmade_pa_email_tpls_v4',
        JSON.stringify(emailTemplates)
      );
    } catch {}
  }, [emailTemplates]);

  useEffect(() => {
    try {
      localStorage.setItem('handmade_pa_orders_v3', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'handmade_pa_sent_emails_v4',
        JSON.stringify(sentEmails)
      );
    } catch {}
  }, [sentEmails]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'handmade_pa_media_lib',
        JSON.stringify(mediaLibrary)
      );
    } catch {}
  }, [mediaLibrary]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'handmade_pa_admin_creds',
        JSON.stringify(adminCredentials)
      );
    } catch {}
  }, [adminCredentials]);

  // Allow typing "/adminpa" into search to jump to /adminpa
  const handleSearchChange = (val: string) => {
    if (val.trim().toLowerCase() === '/adminpa') {
      setSearchQuery('');
      navigateToAdminPa();
      return;
    }
    setSearchQuery(val);
  };

  const filteredProducts = filterAndSortProducts(products, {
    category: selectedCategory,
    searchQuery,
    sortBy,
  });

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (
    product: Product,
    quantity = 1,
    selectedColor = product.colors[0] || 'Mặc định'
  ) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id && item.selectedColor === selectedColor
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { product, quantity, selectedColor }];
    });

    setQuickAddedId(product.id);
    setTimeout(() => setQuickAddedId(null), 1200);
  };

  const handleUpdateCartQuantity = (
    productId: string,
    selectedColor: string,
    delta: number
  ) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (
            item.product.id === productId &&
            item.selectedColor === selectedColor
          ) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (productId: string, selectedColor: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedColor === selectedColor
          )
      )
    );
  };

  const triggerAutomatedEmail = (
    order: Order,
    triggerType: EmailTemplate['id']
  ): SentEmailRecord | null => {
    const template = emailTemplates.find((t) => t.id === triggerType);
    if (!template || !template.enabled) return null;

    const rendered = renderEmailTemplate(template, order);
    const nowStr = new Date().toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const record: SentEmailRecord = {
      id: `mail-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      orderCode: order.orderCode,
      recipientEmail: order.customerEmail,
      recipientName: order.customerName,
      triggerType,
      subject: rendered.subject,
      bodyText: rendered.bodyText,
      sentAt: nowStr,
      status: 'delivered',
    };

    setSentEmails((prev) => [record, ...prev]);
    return record;
  };

  const handlePlaceOrder = (orderData: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    note: string;
    paymentMethod: PaymentMethod;
    couponCode: string;
    markPaidImmediately: boolean;
    draftOrderCode: string;
  }) => {
    const totals = calculateCartTotals(
      cart,
      orderData.couponCode,
      paymentConfig
    );
    const orderCode = generateTransferContent(orderData.draftOrderCode);
    const nowStr = new Date().toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderCode,
      createdAt: nowStr,
      customerName: orderData.fullName,
      customerEmail: orderData.email,
      customerPhone: orderData.phone,
      shippingAddress: orderData.address,
      note: orderData.note,
      items: [...cart],
      subtotal: totals.subtotal,
      shippingFee: totals.shippingFee,
      discount: totals.discount,
      totalAmount: totals.totalAmount,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.markPaidImmediately
        ? 'paid'
        : 'awaiting_transfer',
      orderStatus: orderData.markPaidImmediately
        ? 'paid_verified'
        : 'pending_payment',
      transferContent: orderCode,
      estimatedDeliveryNote:
        'Hàng đan thủ công theo đơn (Order): Có hàng sau 7–10 ngày kể từ khi thanh toán.',
    };

    setProducts((prev) =>
      prev.map((prod) => {
        const boughtQty = cart
          .filter((c) => c.product.id === prod.id)
          .reduce((s, c) => s + c.quantity, 0);
        if (boughtQty > 0) {
          return { ...prod, stock: Math.max(0, prod.stock - boughtQty) };
        }
        return prod;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);

    const sentEmail = triggerAutomatedEmail(newOrder, 'order_created');
    if (orderData.markPaidImmediately) {
      triggerAutomatedEmail(newOrder, 'payment_confirmed');
    }

    return { order: newOrder, sentEmail };
  };

  // Admin Handlers
  const handleSaveProduct = (product: Product, isNew: boolean) => {
    setProducts((prev) => {
      if (isNew) return [product, ...prev];
      return prev.map((p) => (p.id === product.id ? product : p));
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleQuickStockChange = (productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, stock: Math.max(0, p.stock + delta) }
          : p
      )
    );
  };

  const handleUpdateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    markPaid?: boolean
  ) => {
    let updatedOrderRef: Order | null = null;
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const next: Order = {
          ...ord,
          orderStatus: newStatus,
          paymentStatus: markPaid ? 'paid' : ord.paymentStatus,
        };
        updatedOrderRef = next;
        return next;
      })
    );

    if (updatedOrderRef) {
      if (newStatus === 'paid_verified') {
        triggerAutomatedEmail(updatedOrderRef, 'payment_confirmed');
      } else if (newStatus === 'shipping') {
        triggerAutomatedEmail(updatedOrderRef, 'order_shipped');
      }
    }
  };

  const handleUpdateEmailTemplate = (updated: EmailTemplate) => {
    setEmailTemplates((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gingham-pink text-[#4A252B]">
      {/* Pastel Pink Gingham Top Ribbon Strip matching the Cover Image */}
      <div className="h-2.5 w-full bg-gingham-strip border-b border-[#F5C6D0]" />

      {/* Strict 3-Zone Top Bar Contract (No public admin link — hidden behind /adminpa) */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 py-3.5 bg-[#FFF9FA]/95 backdrop-blur-xs border-b-2 border-dashed border-[#F4B8C6]">
        {/* Zone 1: Single wordmark matching Handmade PA Cover Logo */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigateToStore();
          }}
          className="inline-flex items-center gap-2 font-serif-display text-2xl font-bold tracking-tight text-[#E14B68] whitespace-nowrap shrink-0"
        >
          <TulipMotif className="h-6 w-6" />
          <span>Handmade PA</span>
        </a>

        {/* Zone 2: Customer category navigation links */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#6E3B44]"
        >
          <a
            href="#collection"
            onClick={() => {
              setSelectedCategory('all');
              navigateToStore();
            }}
            className="hover:text-[#E14B68] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Bộ sưu tập
          </a>
          <a
            href="#collection"
            onClick={() => {
              setSelectedCategory('Túi & Ví Len');
              navigateToStore();
            }}
            className="hover:text-[#E14B68] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Túi & Ví Len
          </a>
          <a
            href="#collection"
            onClick={() => {
              setSelectedCategory('Mũ & Khăn Choàng');
              navigateToStore();
            }}
            className="hover:text-[#E14B68] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Mũ & Khăn Choàng
          </a>
          <a
            href="#collection"
            onClick={() => {
              setSelectedCategory('Phụ Kiện & Charm');
              navigateToStore();
            }}
            className="hover:text-[#E14B68] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Phụ Kiện & Charm
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#E14B68] rounded-full shadow-xs hover:bg-[#C83754] transition-colors whitespace-nowrap shrink-0"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Giỏ hàng ({totalCartItems})</span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Bar (Customer-facing links only) */}
      <div className="flex md:hidden items-center justify-around border-b border-[#F5C6D0] bg-[#FFFDFD] px-4 py-2 text-xs font-semibold text-[#6E3B44]">
        <a
          href="#collection"
          onClick={() => {
            setSelectedCategory('all');
            navigateToStore();
          }}
          className="py-1 whitespace-nowrap shrink-0"
        >
          Bộ sưu tập
        </a>
        <a
          href="#collection"
          onClick={() => {
            setSelectedCategory('Túi & Ví Len');
            navigateToStore();
          }}
          className="py-1 whitespace-nowrap shrink-0"
        >
          Túi & Ví Len
        </a>
        <a
          href="#collection"
          onClick={() => {
            setSelectedCategory('Phụ Kiện & Charm');
            navigateToStore();
          }}
          className="py-1 whitespace-nowrap shrink-0"
        >
          Phụ Kiện & Charm
        </a>
      </div>

      {/* Main Content */}
      <main id="top" className="flex-1">
        {activeView === 'admin' ? (
          !isAdminAuthenticated ? (
            <AdminLoginScreen
              expectedCredentials={adminCredentials}
              onLoginSuccess={() => {
                setIsAdminAuthenticated(true);
                try {
                  sessionStorage.setItem('handmade_pa_admin_session', '1');
                } catch {}
              }}
              onBackToStore={navigateToStore}
            />
          ) : (
            <AdminPortal
              products={products}
              orders={orders}
              paymentConfig={paymentConfig}
              emailTemplates={emailTemplates}
              sentEmails={sentEmails}
              mediaLibrary={mediaLibrary}
              adminCredentials={adminCredentials}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              onQuickStockChange={handleQuickStockChange}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onUpdatePaymentConfig={setPaymentConfig}
              onUpdateEmailTemplate={handleUpdateEmailTemplate}
              onResendEmail={(ord, trig) => {
                triggerAutomatedEmail(ord, trig);
              }}
              onAddMediaItem={(item) =>
                setMediaLibrary((prev) => [item, ...prev])
              }
              onUpdateMediaItem={(updated) =>
                setMediaLibrary((prev) =>
                  prev.map((m) => (m.id === updated.id ? updated : m))
                )
              }
              onRemoveMediaItem={(id) =>
                setMediaLibrary((prev) => prev.filter((m) => m.id !== id))
              }
              onUpdateAdminCredentials={setAdminCredentials}
              onLogoutAdmin={() => {
                setIsAdminAuthenticated(false);
                try {
                  sessionStorage.removeItem('handmade_pa_admin_session');
                } catch {}
                navigateToStore();
              }}
              onBackToStore={navigateToStore}
            />
          )
        ) : (
          <>
            {/* SECTION 1: MAIN COVER BANNER (Bìa Chính Handmade PA) */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-8">
              <div className="rounded-3xl bg-[#FFFDFD] p-2.5 sm:p-4 border-2 border-dashed border-[#F4A6B8] shadow-sm">
                <div className="overflow-hidden rounded-2xl border border-[#FAD4DC] bg-[#FFF5F7]">
                  <img
                    src="/assets/aistudio/B_a_e2d96620.jpg"
                    alt="Handmade PA — Những điều nhỏ xinh, gửi gắm yêu thương · Sản phẩm theo yêu cầu: Móc khóa len, Túi xách len, Mũ len & phụ kiện, Đồ trang trí len"
                    className="w-full h-auto block object-contain"
                  />
                </div>

                {/* Synchronized Ribbon & Category Strip under Cover Banner */}
                <div className="mt-3.5 flex flex-col md:flex-row items-center justify-between gap-3 px-2 pt-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-semibold">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF2DC] border border-dashed border-[#88A86C] px-3.5 py-1.5 text-[#3F5E2A]">
                      <Sparkles className="h-3.5 w-3.5 text-[#5D8243]" />
                      <span>Sản phẩm đan móc theo yêu cầu (Order 7–10 ngày)</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFE8EE] border border-dashed border-[#F4A6B8] px-3.5 py-1.5 text-[#C83754]">
                      <Heart className="h-3.5 w-3.5 fill-[#E14B68] text-[#E14B68]" />
                      <span>Những điều nhỏ xinh, gửi gắm yêu thương</span>
                    </span>
                  </div>

                  {/* Quick Category Ribbons matching the 4 badges on the Cover */}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <a
                      href="#collection"
                      onClick={() => setSelectedCategory('Phụ Kiện & Charm')}
                      className="rounded-full bg-[#F6A5B5] hover:bg-[#E14B68] text-white px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                    >
                      Móc khóa & Charm len ♥
                    </a>
                    <a
                      href="#collection"
                      onClick={() => setSelectedCategory('Túi & Ví Len')}
                      className="rounded-full bg-[#7A9168] hover:bg-[#5E744E] text-white px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                    >
                      Túi xách len ♥
                    </a>
                    <a
                      href="#collection"
                      onClick={() => setSelectedCategory('Mũ & Khăn Choàng')}
                      className="rounded-full bg-[#F48B98] hover:bg-[#E14B68] text-white px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                    >
                      Mũ len & phụ kiện ♥
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: FEATURED COLLECTION GRID */}
            <section
              id="collection"
              className="mx-auto max-w-7xl px-6 py-10 border-t-2 border-dashed border-[#F4B8C6]"
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2">
                    <DaisyMotif className="h-6 w-6" />
                    <h2 className="font-serif-display text-2xl md:text-3xl font-bold text-[#E14B68]">
                      Bộ Sưu Tập Phụ Kiện Đan Len
                    </h2>
                    <TulipMotif className="h-6 w-6" />
                  </div>
                  <p className="mt-1.5 text-sm text-[#6E3B44]">
                    Mỗi sản phẩm là một chút dịu dàng được đan bằng cả yêu thương · Hàng Order 7–10 ngày sau khi thanh toán.
                  </p>
                </div>

                {/* Interactive Filter Controls */}
                <div className="flex items-center gap-3 shrink-0">
                  <div
                    role="group"
                    aria-label="Lọc theo danh mục"
                    className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 rounded-2xl bg-[#FFE8EE] border border-[#F5C6D0] p-1.5 shrink-0"
                  >
                    {(
                      [
                        'all',
                        'Túi & Ví Len',
                        'Mũ & Khăn Choàng',
                        'Phụ Kiện & Charm',
                      ] as const
                    ).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
                          selectedCategory === cat
                            ? 'bg-[#E14B68] text-white shadow-xs'
                            : 'text-[#6E3B44] hover:text-[#E14B68] hover:bg-white/60'
                        }`}
                      >
                        {cat === 'all' ? 'Tất cả mẫu' : cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Search & Sort Toolbar */}
              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D47A8C]" />
                  <input
                    type="search"
                    aria-label="Tìm kiếm sản phẩm len"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Tìm túi xách len, mũ beret, móc khóa hoa tulip..."
                    className="w-full rounded-2xl border border-[#F5C6D0] bg-white pl-10 pr-4 py-2.5 text-sm text-[#4A252B] placeholder:text-[#B37B86] focus:border-[#E14B68] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-[#6E3B44]">
                  <label htmlFor="sort-select" className="font-semibold">
                    Sắp xếp:
                  </label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as
                          | 'featured'
                          | 'price_asc'
                          | 'price_desc'
                      )
                    }
                    className="rounded-xl border border-[#F5C6D0] bg-white px-3.5 py-2 text-xs font-semibold text-[#4A252B] focus:border-[#E14B68] focus:outline-none"
                  >
                    <option value="featured">Mẫu tiêu biểu</option>
                    <option value="price_asc">Giá: Thấp đến Cao</option>
                    <option value="price_desc">Giá: Cao đến Thấp</option>
                  </select>
                </div>
              </div>

              {/* 3-Column Product Grid */}
              {filteredProducts.length === 0 ? (
                <div className="mt-10 rounded-3xl bg-white border-2 border-dashed border-[#F4B8C6] p-12 text-center">
                  <p className="font-serif-display text-lg text-[#4A252B]">
                    Không tìm thấy sản phẩm len phù hợp với từ khóa "{searchQuery}"
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="mt-4 rounded-full bg-[#E14B68] px-5 py-2 text-xs font-semibold text-white hover:bg-[#C83754]"
                  >
                    Xem lại toàn bộ sản phẩm
                  </button>
                </div>
              ) : (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                  {filteredProducts.map((product) => (
                    <article
                      key={product.id}
                      className="group flex flex-col justify-between rounded-3xl bg-[#FFFDFD] border-2 border-[#FAD4DC] overflow-hidden transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md hover:border-[#F498AE]"
                    >
                      <div>
                        {/* 70% Card Height Lead Imagery */}
                        <div className="relative aspect-4/3 w-full bg-[#FFF2F5] overflow-hidden border-b border-dashed border-[#FAD4DC]">
                          <YarnArtwork
                            preset={product.artworkPreset}
                            customImageUrl={product.customImageUrl}
                            alt={product.name}
                            className="w-full h-full"
                          />
                        </div>

                        {/* Card Body — Unboxed Metadata with · separators */}
                        <div className="p-5">
                          <div className="flex items-center gap-2 text-xs font-medium text-[#7A9168]">
                            <span className="text-[#C83754] font-semibold">{product.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>Đan tay {product.craftHours}h</span>
                            <span aria-hidden="true">·</span>
                            <span>Order 7–10 ngày</span>
                          </div>

                          <h3 className="mt-2 text-base font-bold text-[#4A252B] leading-snug">
                            <button
                              type="button"
                              onClick={() => setActiveProductModal(product)}
                              className="text-left hover:text-[#E14B68] transition-colors"
                            >
                              {product.name}
                            </button>
                          </h3>

                          <p className="mt-1.5 text-xs text-[#7D4E57] line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer — Baseline Aligned Tabular Price & Actions */}
                      <div className="px-5 pb-5 pt-3 border-t border-dashed border-[#FAD4DC] flex items-center justify-between gap-3 bg-[#FFF9FA]">
                        <span className="font-mono-tabular text-base font-bold text-[#E14B68]">
                          {formatVND(product.price)}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveProductModal(product)}
                            className="rounded-full border border-[#F4B8C6] bg-white px-3.5 py-2 text-xs font-semibold text-[#6E3B44] hover:bg-[#FFE8EE] transition-colors whitespace-nowrap shrink-0"
                          >
                            Chi tiết
                          </button>
                          <button
                            type="button"
                            disabled={product.stock <= 0}
                            onClick={() =>
                              handleAddToCart(
                                product,
                                1,
                                product.colors[0] || 'Mặc định'
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#E14B68] px-4 py-2 text-xs font-semibold text-white hover:bg-[#C83754] disabled:bg-stone-300 transition-colors whitespace-nowrap shrink-0"
                          >
                            {quickAddedId === product.id ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Đã thêm</span>
                              </>
                            ) : (
                              <span>Đặt Order ♥</span>
                            )}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Clean Store Footer with Pastel Gingham Strip */}
      <footer className="border-t-2 border-dashed border-[#F4B8C6] bg-[#FFFDFD] text-xs text-[#6E3B44]">
        <div className="mx-auto max-w-7xl px-6 py-9">
          <p className="inline-flex items-center gap-2 font-serif-display text-lg font-bold text-[#E14B68]">
            <DaisyMotif className="h-5 w-5" />
            <span>Handmade PA — Phụ Kiện Len Thủ Công</span>
          </p>
          <p className="mt-1.5 text-[#4A252B] font-semibold">
            Địa chỉ: Thành Phố Huế · Hotline: 0977980873 · Email: des.trannhan@gmail.com
          </p>
        </div>
        <div className="h-3 w-full bg-gingham-strip border-t border-[#F5C6D0]" />
      </footer>

      {/* Product Detail Modal */}
      <ProductModal
        product={activeProductModal}
        onClose={() => setActiveProductModal(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart & VietQR / MoMo Checkout Drawer */}
      <CartCheckoutModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        paymentConfig={paymentConfig}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onPlaceOrder={handlePlaceOrder}
      />
    </div>
  );
}
