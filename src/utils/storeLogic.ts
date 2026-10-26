export type ProductCategory = 'Túi & Ví Len' | 'Mũ & Khăn Choàng' | 'Phụ Kiện & Charm';

export type ArtworkPreset =
  | 'tote_waffle'
  | 'beret_sage'
  | 'tulip_charm'
  | 'collar_lace'
  | 'bucket_hat'
  | 'cardholder_daisy';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  material: string;
  craftHours: number;
  dimensions: string;
  colors: string[];
  description: string;
  careNote: string;
  featured: boolean;
  artworkPreset: ArtworkPreset;
  customImageUrl?: string;
  driveFileId?: string;
  driveFileName?: string;
}

export interface UploadedMediaItem {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl: string;
  uploadedAt: string;
  driveFileId?: string;
  driveWebViewLink?: string;
  driveOwnerEmail?: string;
  syncedToDrive: boolean;
}

export interface AdminCredentials {
  username: string;
  password: string;
}

export const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  username: 'adminpa',
  password: 'HandmadePA@2026',
};

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
}

// Strict Prepayment Only via VietQR (VIB 386625242 - Trần Thị Phương Ái) — No COD, No MoMo
export type PaymentMethod = 'vietqr';

export type OrderStatus =
  | 'pending_payment'
  | 'paid_verified'
  | 'crafting_packing'
  | 'shipping'
  | 'completed';

export interface CheckoutFormInput {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  note?: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
}

export interface Order {
  id: string;
  orderCode: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  note: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'awaiting_transfer' | 'paid';
  orderStatus: OrderStatus;
  transferContent: string;
  estimatedDeliveryNote: string;
}

export interface PaymentConfig {
  bankName: string;
  bankBin: string;
  bankAccountNo: string;
  bankAccountName: string;
  vietQrImageUrl: string;
  orderLeadTimeText: string;
  standardShippingFee: number;
}

export type EmailTriggerType =
  | 'order_created'
  | 'payment_confirmed'
  | 'order_shipped';

export interface EmailTemplate {
  id: EmailTriggerType;
  name: string;
  triggerLabel: string;
  enabled: boolean;
  subjectTemplate: string;
  bodyTemplate: string;
}

export interface SentEmailRecord {
  id: string;
  orderCode: string;
  recipientEmail: string;
  recipientName: string;
  triggerType: EmailTriggerType;
  subject: string;
  bodyText: string;
  sentAt: string;
  status: 'delivered' | 'queued';
}

export interface CartTotals {
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
}

export const INITIAL_PAYMENT_CONFIG: PaymentConfig = {
  bankName: 'Ngân hàng Quốc Tế VIB',
  bankBin: '970441',
  bankAccountNo: '386625242',
  bankAccountName: 'Trần Thị Phương Ái',
  vietQrImageUrl:
    '/assets/aistudio/29ac5d3e-0c5d-4769-b058-8ffca5bf9ca7_ac0dd7c2.jfif',
  orderLeadTimeText:
    'Hàng đan thủ công theo đơn (Order): Sau khi thanh toán VietQR, sản phẩm được nghệ nhân đan mới và giao trong khoảng 7–10 ngày.',
  standardShippingFee: 25000,
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'pa-01',
    sku: 'PA-TOTE-01',
    name: 'Túi Tote Len Mũi Waffle Kem Bơ',
    category: 'Túi & Ví Len',
    price: 385000,
    stock: 9,
    material: '100% Sợi Cotton Milk Chập Đôi 3mm',
    craftHours: 14,
    dimensions: '32 × 36 cm (Quai tết 58 cm)',
    colors: ['Kem Bơ', 'Yến Mạch', 'Nâu Hạt Dẻ'],
    description:
      'Túi tote đan tay mũi Tổ Ong (Waffle Stitch) dày dặn, giữ phom cứng cáp cùng lớp lót vải canvas thô bên trong và khóa bấm đồng thau cổ điển.',
    careNote:
      'Giặt tay nhẹ với nước lạnh và dầu gội dịu nhẹ, phơi phẳng trên khăn khô.',
    featured: true,
    artworkPreset: 'tote_waffle',
  },
  {
    id: 'pa-02',
    sku: 'PA-HAT-02',
    name: 'Mũ Beret Len Merino Xanh Lá Xô Thơm',
    category: 'Mũ & Khăn Choàng',
    price: 295000,
    stock: 12,
    material: 'Len Lông Cừu Merino Úc Pha Cotton',
    craftHours: 9,
    dimensions: 'Chu vi vòng đầu 54–58 cm (Có dây rút ẩn)',
    colors: ['Xanh Xô Thơm', 'Kem Sữa', 'Hồng Phấn'],
    description:
      'Mũ nồi Beret móc tay tỉ mỉ với độ phồng tự nhiên, thoáng khí và mềm mịn không gây ngứa khi đội cả ngày dài.',
    careNote:
      'Không vắt xoắn mạnh; phơi nơi thoáng mát tránh nắng gắt trực tiếp.',
    featured: true,
    artworkPreset: 'beret_sage',
  },
  {
    id: 'pa-03',
    sku: 'PA-CHM-03',
    name: 'Charm Bó Hoa Tulip Len Móc Khóa Đồng',
    category: 'Phụ Kiện & Charm',
    price: 125000,
    stock: 24,
    material: 'Len Sữa Cotton 5Ply & Khoen Đồng Thau',
    craftHours: 4,
    dimensions: '13 × 7 cm',
    colors: ['Hồng Phấn & Vàng Bơ', 'Trắng Kem & Tím Oải Hương'],
    description:
      'Bó 3 bông hoa tulip nhồi bông gòn kháng khuẩn đính nơ ruy-băng lụa và móc khóa đồng xoay 360 độ, dùng treo túi xách hoặc chìa khóa.',
    careNote:
      'Lau sạch bề mặt bằng khăn ẩm ấm hoặc giặt tay nhanh trong 3 phút.',
    featured: true,
    artworkPreset: 'tulip_charm',
  },
  {
    id: 'pa-04',
    sku: 'PA-COL-04',
    name: 'Cổ Áo Rời Len Ren Hoa Nhí & Nơ Kẹp Tóc',
    category: 'Phụ Kiện & Charm',
    price: 215000,
    stock: 8,
    material: 'Sợi Ren Cotton Ai Cập Mercerized',
    craftHours: 8,
    dimensions: 'Cổ áo 42 cm · Nơ kẹp 11 cm',
    colors: ['Trắng Ngà Cổ Điển', 'Kem Hạnh Nhân'],
    description:
      'Bộ cổ áo rời Peter Pan móc họa tiết ren hoa cúc cổ điển đi kèm kẹp tóc nơ đồng điệu, tạo điểm nhấn thanh lịch cho sơ mi và váy liền.',
    careNote: 'Ủi hơi nước nhẹ ở nhiệt độ thấp qua lớp vải lót cotton.',
    featured: true,
    artworkPreset: 'collar_lace',
  },
  {
    id: 'pa-05',
    sku: 'PA-HAT-05',
    name: 'Mũ Bucket Len Viền Sóng Hoa Cúc Hoạ Mi',
    category: 'Mũ & Khăn Choàng',
    price: 320000,
    stock: 7,
    material: 'Sợi Raffia Tự Nhiên Kết Hợp Cotton',
    craftHours: 11,
    dimensions: 'Vành rộng 7.5 cm · Vòng đầu 55–58 cm',
    colors: ['Nâu Cỏ Khô', 'Kem Cát Biển'],
    description:
      'Mũ tai bèo vành lượn sóng nhẹ điểm xuyết họa tiết hoa cúc thêu nổi thủ công quanh thân mũ, dễ dàng gấp gọn bỏ túi khi đi du lịch.',
    careNote: 'Dùng bàn chải lông mềm phủi bụi khô hoặc khăn ẩm lau nhẹ.',
    featured: false,
    artworkPreset: 'bucket_hat',
  },
  {
    id: 'pa-06',
    sku: 'PA-BAG-06',
    name: 'Ví Đựng Thẻ & Tai Nghe Thêu Hoa Cúc Nổi',
    category: 'Túi & Ví Len',
    price: 165000,
    stock: 16,
    material: 'Len Cotton hữu cơ nhuộm màu thực vật',
    craftHours: 5,
    dimensions: '11.5 × 9 cm',
    colors: ['Xanh Rêu & Kem', 'Hồng Dâu & Kem'],
    description:
      'Ví cầm tay nhỏ gọn đan khít tay với nút gỗ sồi tự nhiên, vừa vặn cho thẻ ngân hàng, tiền mặt gấp gọn và hộp tai nghe không dây.',
    careNote: 'Giặt tay nhẹ nhàng với nước mát, không sấy nhiệt cao.',
    featured: false,
    artworkPreset: 'cardholder_daisy',
  },
];

export const INITIAL_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'order_created',
    name: 'Email Xác Nhận Đơn Hàng Order & Thông Báo Thời Gian Đan (7–10 Ngày)',
    triggerLabel: 'Tự động gửi ngay khi khách hoàn tất thanh toán VietQR đặt hàng trên web',
    enabled: true,
    subjectTemplate:
      '[Handmade PA] Xác nhận đơn Order #{{orderCode}} (Dự kiến 7–10 ngày) — Cảm ơn {{customerName}}',
    bodyTemplate: `Xin chào {{customerName}},

Handmade PA đã nhận được đơn đặt hàng #{{orderCode}} của bạn.

LƯU Ý QUAN TRỌNG VỀ THỜI GIAN HOÀN THIỆN HÀNG ORDER:
Vì toàn bộ phụ kiện len tại Handmade PA là hàng đan thủ công theo đơn (Order), sau khi bạn hoàn tất thanh toán qua VietQR, nghệ nhân sẽ bắt đầu lên sợi và đan mới 100%. Thời gian hoàn thiện và chuẩn bị hàng mất khoảng 7–10 ngày trước khi giao tới bạn.

THÔNG TIN ĐƠN HÀNG #{{orderCode}}:
{{itemsList}}

• Phí vận chuyển: 25.000₫
• Tổng thanh toán: {{totalAmount}}
• Phương thức thanh toán: {{paymentMethod}} (Chỉ thanh toán qua VietQR VIB)
• Trạng thái thanh toán: {{paymentStatus}}
• Nội dung chuyển khoản đối soát: {{transferContent}}
• Địa chỉ giao hàng: {{shippingAddress}}
• Thời gian có hàng dự kiến: 7–10 ngày sau khi thanh toán

Thông tin tài khoản VietQR chính thức của Handmade PA:
- Ngân hàng Quốc Tế VIB — Số tài khoản: 386625242 — Chủ TK: Trần Thị Phương Ái

Thương mến,
Handmade PA — Phụ Kiện Len Thủ Công
Địa chỉ: Thành Phố Huế · Hotline: 0977980873 · Email: des.trannhan@gmail.com`,
  },
  {
    id: 'payment_confirmed',
    name: 'Email Xác Nhận Đã Nhận Thanh Toán VietQR & Bắt Đầu Đan Len (7–10 Ngày)',
    triggerLabel: 'Tự động gửi khi xác nhận đã nhận tiền qua VietQR VIB',
    enabled: true,
    subjectTemplate:
      '[Handmade PA] Đã nhận thanh toán VietQR đơn #{{orderCode}} — Bắt đầu đan thủ công (7–10 ngày)',
    bodyTemplate: `Xin chào {{customerName}},

Handmade PA xác nhận đã nhận đủ khoản thanh toán {{totalAmount}} (đã bao gồm 25.000₫ phí vận chuyển) cho đơn hàng #{{orderCode}} qua {{paymentMethod}}.

Đơn hàng của bạn đã chính thức được đưa vào lịch đan thủ công tại xưởng.
• Mã đơn hàng: #{{orderCode}}
• Thời gian đan & hoàn thiện sản phẩm: 7–10 ngày
• Danh sách sản phẩm đang thực hiện:
{{itemsList}}

Ngay khi sản phẩm hoàn thiện và bàn giao cho đơn vị vận chuyển, hệ thống sẽ tự động gửi email thông báo tiếp theo cho bạn.

Trân trọng,
Handmade PA — Phụ Kiện Len Thủ Công
Địa chỉ: Thành Phố Huế · Hotline: 0977980873 · Email: des.trannhan@gmail.com`,
  },
  {
    id: 'order_shipped',
    name: 'Email Thông Báo Đã Hoàn Thiện Đan Len & Bắt Đầu Giao Hàng',
    triggerLabel: 'Tự động gửi khi sản phẩm Order đã đan xong và chuyển sang Đang giao hàng',
    enabled: true,
    subjectTemplate:
      '[Handmade PA] Sản phẩm len Order #{{orderCode}} đã hoàn thiện và đang giao đến bạn!',
    bodyTemplate: `Xin chào {{customerName}},

Sau thời gian đan thủ công tỉ mỉ, kiện hàng len #{{orderCode}} của bạn đã hoàn thiện và được bàn giao cho đơn vị vận chuyển tới địa chỉ "{{shippingAddress}}".

CẨM NANG CHĂM SÓC PHỤ KIỆN LEN HANDMADE PA:
1. Giặt tay nhẹ nhàng trong nước lạnh với dầu gội hoặc nước giặt dịu nhẹ.
2. Không vắt xoắn mạnh; hãy ép nhẹ qua khăn bông khô để thấm nước.
3. Phơi ngang trên mặt phẳng thoáng gió để giữ nguyên phom mũi đan nhiều năm.

Cảm ơn bạn đã kiên nhẫn chờ đợi món đồ thủ công 7–10 ngày từ Handmade PA!
Handmade PA — Phụ Kiện Len Thủ Công
Địa chỉ: Thành Phố Huế · Hotline: 0977980873 · Email: des.trannhan@gmail.com`,
  },
];

export function isAdminRoute(
  pathname: string,
  hash = '',
  search = ''
): boolean {
  const cleanPath = pathname.replace(/\/+$/, '').toLowerCase();
  const cleanHash = hash.toLowerCase();
  const cleanSearch = search.toLowerCase();

  return (
    cleanPath === '/adminpa' ||
    cleanPath.endsWith('/adminpa') ||
    cleanHash === '#/adminpa' ||
    cleanHash === '#adminpa' ||
    cleanSearch.includes('adminpa=1') ||
    cleanSearch.includes('route=adminpa')
  );
}

export function validateAdminLogin(
  inputUsername: string,
  inputPassword: string,
  expected: AdminCredentials = DEFAULT_ADMIN_CREDENTIALS
): {
  valid: boolean;
  error?: string;
} {
  const u = inputUsername.trim();
  const p = inputPassword;

  if (!u || !p) {
    return {
      valid: false,
      error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu quản trị.',
    };
  }

  if (u !== expected.username || p !== expected.password) {
    return {
      valid: false,
      error: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
    };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatVND(amount: number): string {
  const safe = Math.max(0, Math.round(amount));
  return `${safe.toLocaleString('vi-VN')}₫`;
}

export function calculateCartTotals(
  items: CartItem[],
  couponCode = '',
  config: PaymentConfig = INITIAL_PAYMENT_CONFIG
): CartTotals {
  const subtotal = items.reduce((sum, item) => {
    const qty = Math.max(0, item.quantity);
    return sum + item.product.price * qty;
  }, 0);

  if (subtotal === 0) {
    return {
      subtotal: 0,
      shippingFee: 0,
      discount: 0,
      totalAmount: 0,
    };
  }

  const normalizedCoupon = couponCode.trim().toUpperCase();
  let discount = 0;
  if (normalizedCoupon === 'HANDMADE10') {
    discount = Math.round(subtotal * 0.1);
  } else if (normalizedCoupon === 'PA30K') {
    discount = Math.min(30000, subtotal);
  }

  // Flat 25.000 VNĐ shipping fee added to cart subtotal
  const shippingFee = config.standardShippingFee ?? 25000;
  const totalAmount = Math.max(0, subtotal - discount) + shippingFee;

  return {
    subtotal,
    shippingFee,
    discount,
    totalAmount,
  };
}

export function validateCheckoutForm(input: CheckoutFormInput): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  const fullName = input.fullName.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();
  const address = input.address.trim();

  if (fullName.length < 2) {
    errors.fullName = 'Vui lòng nhập họ và tên người nhận (tối thiểu 2 ký tự).';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.email =
      'Vui lòng nhập địa chỉ email hợp lệ để nhận hóa đơn tự động.';
  }

  const digitsOnlyPhone = phone.replace(/[\s.-]/g, '');
  if (!/^(0|\+84)\d{8,10}$/.test(digitsOnlyPhone)) {
    errors.phone = 'Số điện thoại không hợp lệ (ví dụ: 0912345678).';
  }

  if (address.length < 8) {
    errors.address =
      'Vui lòng nhập địa chỉ giao hàng chi tiết (số nhà, đường, phường/xã, quận/tỉnh).';
  }

  if (input.paymentMethod !== 'vietqr') {
    errors.paymentMethod =
      'Cửa hàng chỉ nhận thanh toán qua mã VietQR (Ngân hàng VIB 386625242 - Trần Thị Phương Ái).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function generateTransferContent(orderCode: string): string {
  const cleanCode = orderCode.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  return cleanCode.startsWith('PA') ? cleanCode : `PA${cleanCode}`;
}

// Standard EMVCo CRC-16/CCITT-FALSE checksum for Napas247 VietQR
export function computeVietQrCrc16(payloadWithoutCrcValue: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payloadWithoutCrcValue.length; i++) {
    crc ^= payloadWithoutCrcValue.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function buildPaymentQrPayload(
  _method: PaymentMethod,
  orderCode: string,
  amount: number,
  config: PaymentConfig = INITIAL_PAYMENT_CONFIG
): {
  qrString: string;
  dynamicVietQrUrl: string;
  providerLabel: string;
  accountNumber: string;
  accountHolder: string;
  transferMemo: string;
  amount: number;
} {
  const transferMemo = generateTransferContent(orderCode);
  const safeAmount = Math.max(0, Math.round(amount));
  const amountStr = String(safeAmount);

  // Build EMVCo Merchant Account Info (ID 38) for Napas247 VietQR
  const guidSub = '0010A000000727';
  const bankBinTlv = `00${String(config.bankBin.length).padStart(2, '0')}${config.bankBin}`;
  const accNoTlv = `01${String(config.bankAccountNo.length).padStart(2, '0')}${config.bankAccountNo}`;
  const beneficiaryValue = `${bankBinTlv}${accNoTlv}`;
  const beneficiaryTlv = `01${String(beneficiaryValue.length).padStart(2, '0')}${beneficiaryValue}`;
  const serviceCodeTlv = '0208QRIBFTTA';
  const field38Value = `${guidSub}${beneficiaryTlv}${serviceCodeTlv}`;
  const field38Tlv = `38${String(field38Value.length).padStart(2, '0')}${field38Value}`;

  const field54Tlv = `54${String(amountStr.length).padStart(2, '0')}${amountStr}`;
  const memoSubTlv = `08${String(transferMemo.length).padStart(2, '0')}${transferMemo}`;
  const field62Tlv = `62${String(memoSubTlv.length).padStart(2, '0')}${memoSubTlv}`;

  const rawPayload = `000201010212${field38Tlv}5303704${field54Tlv}5802VN${field62Tlv}6304`;
  const crcHex = computeVietQrCrc16(rawPayload);
  const qrString = `${rawPayload}${crcHex}`;

  // Official VietQR dynamic image URL with exact total amount + transfer memo to VIB 386625242 Trần Thị Phương Ái
  const dynamicVietQrUrl = `https://img.vietqr.io/image/${config.bankBin}-${config.bankAccountNo}-compact2.png?amount=${safeAmount}&addInfo=${encodeURIComponent(
    transferMemo
  )}&accountName=${encodeURIComponent(config.bankAccountName)}`;

  return {
    qrString,
    dynamicVietQrUrl,
    providerLabel: `VietQR — ${config.bankName}`,
    accountNumber: config.bankAccountNo,
    accountHolder: config.bankAccountName,
    transferMemo,
    amount: safeAmount,
  };
}

export function getPaymentMethodLabel(_method: PaymentMethod): string {
  return 'Chuyển khoản VietQR (VIB - 386625242 - Trần Thị Phương Ái)';
}

export function getPaymentStatusLabel(
  status: Order['paymentStatus']
): string {
  switch (status) {
    case 'paid':
      return 'Đã thanh toán VietQR';
    case 'awaiting_transfer':
      return 'Chờ đối soát chuyển khoản VietQR';
  }
}

export function getOrderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'pending_payment':
      return 'Chờ thanh toán VietQR';
    case 'paid_verified':
      return 'Đã thanh toán · Chờ đan (7–10 ngày)';
    case 'crafting_packing':
      return 'Đang đan thủ công (7–10 ngày)';
    case 'shipping':
      return 'Đang giao hàng';
    case 'completed':
      return 'Hoàn tất';
  }
}

export function renderEmailTemplate(
  template: EmailTemplate,
  order: Order
): {
  subject: string;
  bodyText: string;
} {
  const itemsList = order.items
    .map(
      (item) =>
        `  - ${item.product.name} (${item.selectedColor}) × ${item.quantity}: ${formatVND(
          item.product.price * item.quantity
        )}`
    )
    .join('\n');

  const replacements: Record<string, string> = {
    '{{customerName}}': order.customerName,
    '{{orderCode}}': order.orderCode,
    '{{totalAmount}}': formatVND(order.totalAmount),
    '{{paymentMethod}}': getPaymentMethodLabel(order.paymentMethod),
    '{{paymentStatus}}': getPaymentStatusLabel(order.paymentStatus),
    '{{transferContent}}': order.transferContent,
    '{{shippingAddress}}': order.shippingAddress,
    '{{itemsList}}': itemsList,
  };

  let subject = template.subjectTemplate;
  let bodyText = template.bodyTemplate;

  for (const [token, value] of Object.entries(replacements)) {
    subject = subject.split(token).join(value);
    bodyText = bodyText.split(token).join(value);
  }

  return { subject, bodyText };
}

export function filterAndSortProducts(
  products: Product[],
  options: {
    category: 'all' | ProductCategory;
    searchQuery: string;
    sortBy: 'featured' | 'price_asc' | 'price_desc';
  }
): Product[] {
  const query = options.searchQuery.trim().toLowerCase();

  const filtered = products.filter((p) => {
    const matchesCategory =
      options.category === 'all' || p.category === options.category;
    const matchesQuery =
      query.length === 0 ||
      p.name.toLowerCase().includes(query) ||
      p.material.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });

  return [...filtered].sort((a, b) => {
    if (options.sortBy === 'price_asc') return a.price - b.price;
    if (options.sortBy === 'price_desc') return b.price - a.price;
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return 0;
  });
}
