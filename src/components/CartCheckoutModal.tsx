import React, { useState } from 'react';
import {
  X,
  Trash2,
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  Mail,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import {
  CartItem,
  PaymentMethod,
  PaymentConfig,
  Order,
  SentEmailRecord,
  calculateCartTotals,
  validateCheckoutForm,
  buildPaymentQrPayload,
  formatVND,
  getPaymentMethodLabel,
} from '../utils/storeLogic';
import { YarnArtwork } from './YarnArtwork';
import { QrCodeSvg } from './QrCodeSvg';

interface CartCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  paymentConfig: PaymentConfig;
  onUpdateQuantity: (
    productId: string,
    selectedColor: string,
    delta: number
  ) => void;
  onRemoveItem: (productId: string, selectedColor: string) => void;
  onPlaceOrder: (orderData: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    note: string;
    paymentMethod: PaymentMethod;
    couponCode: string;
    markPaidImmediately: boolean;
    draftOrderCode: string;
  }) => { order: Order; sentEmail: SentEmailRecord | null };
}

export const CartCheckoutModal: React.FC<CartCheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  paymentConfig,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmed'>('cart');
  const [couponCode, setCouponCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const paymentMethod: PaymentMethod = 'vietqr';
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftOrderCode, setDraftOrderCode] = useState<string>(() =>
    String(Math.floor(1000 + Math.random() * 9000))
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [qrImgFailed, setQrImgFailed] = useState(false);
  const [confirmedResult, setConfirmedResult] = useState<{
    order: Order;
    sentEmail: SentEmailRecord | null;
  } | null>(null);

  if (!isOpen) return null;

  const totals = calculateCartTotals(cart, couponCode, paymentConfig);
  const qrDetails = buildPaymentQrPayload(
    paymentMethod,
    draftOrderCode,
    totals.totalAmount,
    paymentConfig
  );

  const handleCopy = (label: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleCompleteCheckout = () => {
    const validation = validateCheckoutForm({
      fullName,
      email,
      phone,
      address,
      note,
      paymentMethod,
      couponCode,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    const result = onPlaceOrder({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      note: note.trim(),
      paymentMethod,
      couponCode,
      markPaidImmediately: true,
      draftOrderCode,
    });

    setConfirmedResult(result);
    setStep('confirmed');
  };

  const resetAndClose = () => {
    setStep('cart');
    setConfirmedResult(null);
    setDraftOrderCode(String(Math.floor(1000 + Math.random() * 9000)));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-stone-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      <div className="relative flex h-full w-full max-w-2xl flex-col bg-[#FFF8FA] shadow-2xl border-l border-[#F4B8C6]">
        {/* Top Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#F4B8C6] px-6 py-4 bg-white">
          <div>
            <h2
              id="cart-drawer-title"
              className="font-serif-display text-xl font-semibold text-[#4A252B]"
            >
              {step === 'cart' && 'Giỏ Hàng Handmade PA'}
              {step === 'checkout' && 'Thanh Toán Qua Mã VietQR — Ngân Hàng VIB'}
              {step === 'confirmed' && 'Đã Thanh Toán VietQR & Xác Nhận Đơn Hàng Order'}
            </h2>
            {step === 'confirmed' && (
              <p className="text-xs text-[#7D4E57] mt-0.5">
                Mã đơn hàng #{confirmedResult?.order.orderCode} · Thời gian hoàn thiện đan len: 7–10 ngày
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Đóng giỏ hàng"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="font-serif-display text-xl text-stone-700">
                    Giỏ hàng của bạn đang trống
                  </p>
                  <p className="mt-2 max-w-sm text-sm text-stone-500">
                    Hãy khám phá các mẫu túi tote đan mũi waffle, mũ beret len Merino và charm hoa tulip thủ công của Handmade PA.
                  </p>
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="mt-6 rounded-lg bg-[#E14B68] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#C83754] transition-colors"
                  >
                    Xem bộ sưu tập
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Made-to-Order 7-10 Days & VietQR Policy Notice */}
                  <div className="rounded-xl bg-[#EAF2DC] border border-dashed border-[#88A86C] p-3.5 flex items-start gap-3 text-xs text-[#3F5E2A]">
                    <Clock className="h-4 w-4 text-[#5D8243] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[#2E481D]">
                        Chính sách Thanh toán VietQR & Hàng Order (7–10 ngày):
                      </span>{' '}
                      Handmade PA chỉ nhận thanh toán bằng mã <strong>VietQR đến tài khoản VIB 386625242 — Trần Thị Phương Ái</strong> (không nhận COD, không thanh toán qua ví điện tử). Phí vận chuyển cố định toàn quốc là <strong>25.000 VNĐ</strong>. Sau khi thanh toán, nghệ nhân sẽ đan mới hoàn toàn trong <strong>7–10 ngày</strong>.
                    </div>
                  </div>

                  <ul className="divide-y divide-stone-200 border-b border-stone-200">
                    {cart.map((item) => (
                      <li
                        key={`${item.product.id}-${item.selectedColor}`}
                        className="flex items-center gap-4 py-4"
                      >
                        <YarnArtwork
                          preset={item.product.artworkPreset}
                          customImageUrl={item.product.customImageUrl}
                          alt={item.product.name}
                          className="h-20 w-24 shrink-0 rounded-lg border border-stone-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-stone-900 truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-xs text-stone-500 mt-0.5">
                            Màu sợi: {item.selectedColor} · {formatVND(item.product.price)}
                          </p>
                          <div className="mt-2.5 flex items-center gap-3">
                            <div className="inline-flex items-center rounded-md border border-stone-300 bg-white">
                              <button
                                type="button"
                                aria-label={`Giảm số lượng ${item.product.name}`}
                                onClick={() =>
                                  onUpdateQuantity(
                                    item.product.id,
                                    item.selectedColor,
                                    -1
                                  )
                                }
                                className="px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                              >
                                −
                              </button>
                              <span className="px-2.5 py-1 font-mono-tabular text-xs font-medium text-stone-900">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                aria-label={`Tăng số lượng ${item.product.name}`}
                                onClick={() =>
                                  onUpdateQuantity(
                                    item.product.id,
                                    item.selectedColor,
                                    1
                                  )
                                }
                                className="px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              aria-label={`Xóa ${item.product.name} khỏi giỏ`}
                              onClick={() =>
                                onRemoveItem(
                                  item.product.id,
                                  item.selectedColor
                                )
                              }
                              className="text-xs text-stone-400 hover:text-red-700 inline-flex items-center gap-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Xóa</span>
                            </button>
                          </div>
                        </div>
                        <div className="text-right font-mono-tabular text-sm font-semibold text-stone-900">
                          {formatVND(item.product.price * item.quantity)}
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Totals Breakdown */}
                  <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-2.5 text-sm">
                    <div className="flex justify-between text-stone-600">
                      <span>
                        Tạm tính giỏ hàng ({cart.reduce((s, i) => s + i.quantity, 0)} sản phẩm)
                      </span>
                      <span className="font-mono-tabular">
                        {formatVND(totals.subtotal)}
                      </span>
                    </div>
                    {totals.discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Mã giảm giá ({couponCode.toUpperCase()})</span>
                        <span className="font-mono-tabular">
                          −{formatVND(totals.discount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-600">
                      <span>Phí vận chuyển cố định</span>
                      <span className="font-mono-tabular font-medium text-stone-900">
                        +{formatVND(totals.shippingFee)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-semibold text-stone-900">
                      <span>Tổng tiền thanh toán VietQR</span>
                      <span className="font-mono-tabular text-lg text-[#E14B68]">
                        {formatVND(totals.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <div className="space-y-3">
              {/* Prominent Hero VietQR Payment Section (VIB 386625242 Trần Thị Phương Ái) */}
              <div className="overflow-hidden rounded-2xl border-2 border-[#E14B68] bg-white shadow-md">
                {/* Bold High-Contrast Header Banner */}
                <div className="flex items-center justify-between gap-3 bg-[#E14B68] px-4 py-3 text-white">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 shrink-0" />
                    <h3 className="text-sm sm:text-base font-bold tracking-wide uppercase">
                      1. Quét Mã VietQR Ngân Hàng VIB
                    </h3>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 font-mono-tabular text-xs sm:text-sm font-bold text-[#E14B68] shadow-2xs">
                    {formatVND(totals.totalAmount)}
                  </span>
                </div>

                {/* Live Dynamic VietQR Payment Box with Exact Cart Total + 25.000 VNĐ Shipping */}
                <div className="bg-gingham-pink p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl bg-white/95 p-4 border-2 border-dashed border-[#F498AE] shadow-xs">
                    {/* Enlarged Standout QR Code Frame with Scanner Corner Accents */}
                    <div className="shrink-0 flex flex-col items-center">
                      <div className="relative rounded-2xl border-2 border-[#E14B68] bg-white p-2.5 shadow-md">
                        <span className="pointer-events-none absolute -top-1 -left-1 h-4 w-4 border-t-4 border-l-4 border-[#C83754] rounded-tl-md" />
                        <span className="pointer-events-none absolute -top-1 -right-1 h-4 w-4 border-t-4 border-r-4 border-[#C83754] rounded-tr-md" />
                        <span className="pointer-events-none absolute -bottom-1 -left-1 h-4 w-4 border-b-4 border-l-4 border-[#C83754] rounded-bl-md" />
                        <span className="pointer-events-none absolute -bottom-1 -right-1 h-4 w-4 border-b-4 border-r-4 border-[#C83754] rounded-br-md" />

                        {!qrImgFailed ? (
                          <img
                            src={qrDetails.dynamicVietQrUrl}
                            alt={`Mã VietQR VIB ${qrDetails.accountNumber} ${qrDetails.accountHolder} - ${formatVND(totals.totalAmount)}`}
                            referrerPolicy="no-referrer"
                            onError={() => setQrImgFailed(true)}
                            className="w-52 sm:w-56 h-auto rounded-lg bg-white object-contain"
                          />
                        ) : (
                          <QrCodeSvg
                            payload={qrDetails.qrString}
                            method="vietqr"
                            size={216}
                          />
                        )}
                      </div>

                      <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#FFE8EE] border border-[#F4A6B8] px-3.5 py-1 text-xs font-bold text-[#C83754]">
                        <span>Quét mã thanh toán:</span>
                        <span className="font-mono-tabular text-sm text-[#E14B68]">
                          {formatVND(totals.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* High-Contrast Bank & Amount Breakdown */}
                    <div className="flex-1 w-full space-y-2 text-xs sm:text-sm">
                      <div className="font-serif-display text-base font-bold text-[#4A252B] border-b border-[#FAD4DC] pb-1.5">
                        {qrDetails.providerLabel}
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-stone-200/80">
                        <span className="text-stone-600">Chủ tài khoản:</span>
                        <span className="font-bold text-[#4A252B] uppercase">
                          {qrDetails.accountHolder}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 py-1.5 border-b border-stone-200/80">
                        <span className="text-stone-600 whitespace-nowrap shrink-0">
                          Số tài khoản VIB:
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono-tabular text-base font-bold text-[#E14B68] whitespace-nowrap">
                            {qrDetails.accountNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy('acc', qrDetails.accountNumber)
                            }
                            className="inline-flex items-center gap-1 rounded-md bg-[#FFE8EE] border border-[#F4A6B8] px-2 py-0.5 text-xs font-semibold text-[#C83754] hover:bg-[#E14B68] hover:text-white transition-colors whitespace-nowrap shrink-0"
                          >
                            {copiedField === 'acc' ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                            <span>Sao chép</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-stone-100 text-stone-600">
                        <span>Tạm tính giỏ hàng:</span>
                        <span className="font-mono-tabular font-medium text-stone-800">
                          {formatVND(totals.subtotal - totals.discount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-stone-200/80 text-stone-600">
                        <span>Phí vận chuyển cố định:</span>
                        <span className="font-mono-tabular font-semibold text-stone-800">
                          +{formatVND(totals.shippingFee)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 rounded-xl bg-[#FFF0F4] border border-[#F4A6B8] px-3 py-2">
                        <span className="font-bold text-[#4A252B] whitespace-nowrap">
                          Tổng thanh toán:
                        </span>
                        <span className="font-mono-tabular text-base sm:text-lg font-bold text-[#E14B68] whitespace-nowrap">
                          {formatVND(totals.totalAmount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-stone-600 whitespace-nowrap shrink-0">
                          Nội dung CK:
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono-tabular font-bold text-[#4A252B] bg-[#EAF2DC] border border-[#88A86C] px-2.5 py-0.5 rounded-md whitespace-nowrap">
                            {qrDetails.transferMemo}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy('memo', qrDetails.transferMemo)
                            }
                            className="inline-flex items-center gap-1 rounded-md bg-[#FFE8EE] border border-[#F4A6B8] px-2 py-0.5 text-xs font-semibold text-[#C83754] hover:bg-[#E14B68] hover:text-white transition-colors whitespace-nowrap shrink-0"
                          >
                            {copiedField === 'memo' ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                            <span>Sao chép</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Shipping & Automated Email Form */}
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-2.5">
                <h3 className="text-sm font-semibold text-stone-900">
                  2. Thông tin người nhận & Email nhận hóa đơn (Hàng Order 7–10 ngày)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label
                      htmlFor="checkout-fullname"
                      className="block text-xs font-medium text-stone-700 mb-1"
                    >
                      Họ và tên người nhận *
                    </label>
                    <input
                      id="checkout-fullname"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Phương Anh"
                      className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm focus:border-[#E14B68] focus:outline-none"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-red-700">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-phone"
                      className="block text-xs font-medium text-stone-700 mb-1"
                    >
                      Số điện thoại liên hệ *
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912345678"
                      className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm focus:border-[#E14B68] focus:outline-none"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-700">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label
                      htmlFor="checkout-email"
                      className="block text-xs font-medium text-stone-700 mb-1"
                    >
                      Email nhận xác nhận đơn *
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="khachhang@gmail.com"
                      className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm focus:border-[#E14B68] focus:outline-none"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-700">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-address"
                      className="block text-xs font-medium text-stone-700 mb-1"
                    >
                      Địa chỉ nhận hàng chi tiết *
                    </label>
                    <input
                      id="checkout-address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Số 28 Lê Lợi, Thành Phố Huế"
                      className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm focus:border-[#E14B68] focus:outline-none"
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-700">
                        {errors.address}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="checkout-note"
                    className="block text-xs font-medium text-stone-700 mb-1"
                  >
                    Ghi chú đan theo yêu cầu (Tùy chọn)
                  </label>
                  <input
                    id="checkout-note"
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ví dụ: Viết thiệp chúc mừng sinh nhật, yêu cầu độ dài quai..."
                    className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm focus:border-[#E14B68] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 'confirmed' && confirmedResult && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-white border border-stone-200 p-6">
                <div className="flex items-start gap-3 text-emerald-800">
                  <CheckCircle2 className="h-6 w-6 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-serif-display text-lg font-semibold text-stone-900">
                      Cảm ơn {confirmedResult.order.customerName}! Đơn hàng Order #{confirmedResult.order.orderCode} đã thanh toán
                    </h3>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Phương thức: {getPaymentMethodLabel(confirmedResult.order.paymentMethod)} · Tổng cộng (đã gồm 25.000₫ ship):{' '}
                      <span className="font-mono-tabular font-semibold text-[#E14B68]">
                        {formatVND(confirmedResult.order.totalAmount)}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Prominent 7-10 Day Made-to-Order Banner after payment */}
                <div className="mt-4 rounded-xl bg-[#EAF2DC] border border-dashed border-[#88A86C] p-4 flex items-start gap-3 text-xs text-[#3F5E2A]">
                  <Clock className="h-4 w-4 text-[#5D8243] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-[#2E481D]">
                      Thời gian hoàn thiện & nhận hàng dự kiến: 7–10 ngày
                    </div>
                    <p className="mt-0.5 leading-relaxed">
                      Vì sản phẩm của Handmade PA là hàng đan thủ công theo đơn (Order), nghệ nhân sẽ bắt đầu lên sợi đan mới ngay sau khi xác nhận thanh toán VietQR VIB. Kiện hàng sẽ có trong khoảng 7–10 ngày tới.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600">
                  <div>
                    <span className="text-stone-400 block">
                      Người nhận & Điện thoại:
                    </span>
                    <span className="font-medium text-stone-800">
                      {confirmedResult.order.customerName} ·{' '}
                      {confirmedResult.order.customerPhone}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">
                      Địa chỉ giao hàng:
                    </span>
                    <span className="font-medium text-stone-800">
                      {confirmedResult.order.shippingAddress}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-500">
                  <strong className="text-stone-700">
                    Handmade PA — Phụ Kiện Len Thủ Công:
                  </strong>{' '}
                  Địa chỉ: Thành Phố Huế · Hotline: 0977980873 · Email: des.trannhan@gmail.com
                </div>
              </div>

              {/* Automated Sales Email Confirmation Preview */}
              {confirmedResult.sentEmail && (
                <div className="rounded-2xl bg-white border border-stone-200 p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
                      <Mail className="h-4 w-4 text-[#E14B68]" />
                      <span>
                        Email Bán Hàng Tự Động đã gửi tới:{' '}
                        {confirmedResult.sentEmail.recipientEmail}
                      </span>
                    </div>
                    <span className="text-xs text-emerald-700 font-medium">
                      Đã gửi tự động
                    </span>
                  </div>

                  <div className="text-xs text-stone-700">
                    <span className="text-stone-500">Tiêu đề: </span>
                    <span className="font-semibold text-stone-900">
                      {confirmedResult.sentEmail.subject}
                    </span>
                  </div>

                  <pre className="whitespace-pre-wrap rounded-xl bg-[#FFF8FA] p-4 font-sans text-xs text-stone-700 leading-relaxed border border-stone-200/80">
                    {confirmedResult.sentEmail.bodyText}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Drawer Footer Actions */}
        <div className="border-t border-stone-200 bg-white px-6 py-4">
          {step === 'cart' && cart.length > 0 && (
            <button
              type="button"
              onClick={() => setStep('checkout')}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#E14B68] px-5 py-3 text-sm font-semibold text-white hover:bg-[#C83754] transition-colors"
            >
              <span>
                Tiến hành thanh toán VietQR ({formatVND(totals.totalAmount)})
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {step === 'checkout' && (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-300 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Quay lại giỏ</span>
              </button>

              <button
                type="button"
                onClick={handleCompleteCheckout}
                className="w-full flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#E14B68] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#C83754] transition-colors whitespace-nowrap shrink-0"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>
                  Xác nhận đã thanh toán VietQR VIB ({formatVND(totals.totalAmount)}) & Đặt hàng
                </span>
              </button>
            </div>
          )}

          {step === 'confirmed' && (
            <button
              type="button"
              onClick={resetAndClose}
              className="w-full rounded-lg bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800 transition-colors"
            >
              Tiếp tục mua sắm tại Handmade PA
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
