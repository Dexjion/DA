import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatVND,
  calculateCartTotals,
  validateCheckoutForm,
  buildPaymentQrPayload,
  renderEmailTemplate,
  filterAndSortProducts,
  isAdminRoute,
  validateAdminLogin,
  INITIAL_PRODUCTS,
  INITIAL_EMAIL_TEMPLATES,
  Order,
} from './storeLogic';

test('formatVND formats currency in Vietnamese Dong correctly', () => {
  const formatted = formatVND(385000);
  assert.ok(formatted.includes('385') && formatted.endsWith('₫'));
});

test('calculateCartTotals computes subtotal + fixed 25.000 VND shipping fee and coupon discount', () => {
  const item1 = {
    product: INITIAL_PRODUCTS[0], // 385,000
    quantity: 1,
    selectedColor: 'Kem Bơ',
  };
  const totalsSingle = calculateCartTotals([item1], '');
  assert.equal(totalsSingle.subtotal, 385000);
  assert.equal(totalsSingle.shippingFee, 25000);
  assert.equal(totalsSingle.totalAmount, 410000);

  const item2 = {
    product: INITIAL_PRODUCTS[2], // 125,000
    quantity: 1,
    selectedColor: 'Hồng Phấn & Vàng Bơ',
  };
  const totalsWithDiscount = calculateCartTotals([item1, item2], 'handmade10');
  assert.equal(totalsWithDiscount.subtotal, 510000);
  assert.equal(totalsWithDiscount.shippingFee, 25000);
  assert.equal(totalsWithDiscount.discount, 51000);
  assert.equal(totalsWithDiscount.totalAmount, 484000);
});

test('validateCheckoutForm rejects empty/invalid fields and accepts valid VietQR details', () => {
  const invalidResult = validateCheckoutForm({
    fullName: 'A',
    email: 'not-an-email',
    phone: '123',
    address: 'Short',
    paymentMethod: 'vietqr',
  });
  assert.equal(invalidResult.valid, false);
  assert.ok(invalidResult.errors.fullName);
  assert.ok(invalidResult.errors.email);
  assert.ok(invalidResult.errors.phone);
  assert.ok(invalidResult.errors.address);

  const validResult = validateCheckoutForm({
    fullName: 'Nguyễn Minh Anh',
    email: 'minhanh@example.com',
    phone: '0912345678',
    address: '42 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
    paymentMethod: 'vietqr',
  });
  assert.equal(validResult.valid, true);
  assert.equal(Object.keys(validResult.errors).length, 0);
});

test('buildPaymentQrPayload constructs dynamic VietQR VIB (386625242 - Trần Thị Phương Ái) with exact total amount', () => {
  const vietQr = buildPaymentQrPayload('vietqr', '8492', 410000);
  assert.equal(vietQr.transferMemo, 'PA8492');
  assert.equal(vietQr.accountNumber, '386625242');
  assert.equal(vietQr.accountHolder, 'Trần Thị Phương Ái');
  assert.ok(vietQr.dynamicVietQrUrl.includes('970441-386625242-compact2.png'));
  assert.ok(vietQr.dynamicVietQrUrl.includes('amount=410000'));
  assert.ok(vietQr.dynamicVietQrUrl.includes('addInfo=PA8492'));
  assert.ok(vietQr.qrString.includes('970441'));
  assert.ok(vietQr.qrString.includes('386625242'));
  assert.ok(vietQr.qrString.includes('410000'));
});

test('renderEmailTemplate populates 7-10 day made-to-order notice and VietQR VIB details', () => {
  const sampleOrder: Order = {
    id: 'ord-1',
    orderCode: 'PA8492',
    createdAt: '2026-10-25T10:00:00Z',
    customerName: 'Trần Thu Hà',
    customerEmail: 'thuha@example.com',
    customerPhone: '0987654321',
    shippingAddress: '18 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội',
    note: '',
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 2,
        selectedColor: 'Kem Bơ',
      },
    ],
    subtotal: 770000,
    shippingFee: 25000,
    discount: 0,
    totalAmount: 795000,
    paymentMethod: 'vietqr',
    paymentStatus: 'paid',
    orderStatus: 'paid_verified',
    transferContent: 'PA8492',
    estimatedDeliveryNote: 'Hàng order đan mới: 7–10 ngày sau khi thanh toán',
  };

  const rendered = renderEmailTemplate(INITIAL_EMAIL_TEMPLATES[0], sampleOrder);
  assert.ok(rendered.subject.includes('#PA8492'));
  assert.ok(rendered.subject.includes('7–10 ngày'));
  assert.ok(rendered.bodyText.includes('7–10 ngày'));
  assert.ok(rendered.bodyText.includes('386625242'));
  assert.ok(rendered.bodyText.includes('Trần Thị Phương Ái'));
  assert.ok(rendered.bodyText.includes('Thành Phố Huế'));
  assert.ok(rendered.bodyText.includes('des.trannhan@gmail.com'));
});

test('filterAndSortProducts filters by category and search query and sorts by price', () => {
  const bagsOnly = filterAndSortProducts(INITIAL_PRODUCTS, {
    category: 'Túi & Ví Len',
    searchQuery: '',
    sortBy: 'price_asc',
  });
  assert.equal(bagsOnly.length, 2);
  assert.ok(bagsOnly[0].price <= bagsOnly[1].price);

  const tulipSearch = filterAndSortProducts(INITIAL_PRODUCTS, {
    category: 'all',
    searchQuery: 'tulip',
    sortBy: 'featured',
  });
  assert.equal(tulipSearch.length, 1);
  assert.equal(tulipSearch[0].id, 'pa-03');
});

test('isAdminRoute detects /adminpa path, hash, or query parameter accurately', () => {
  assert.equal(isAdminRoute('/adminpa'), true);
  assert.equal(isAdminRoute('/adminpa/'), true);
  assert.equal(isAdminRoute('/', '#/adminpa'), true);
  assert.equal(isAdminRoute('/', '', '?route=adminpa'), true);
  assert.equal(isAdminRoute('/'), false);
  assert.equal(isAdminRoute('/collection'), false);
});

test('validateAdminLogin enforces dedicated username and password for /adminpa', () => {
  const emptyCheck = validateAdminLogin('', '');
  assert.equal(emptyCheck.valid, false);
  assert.ok(emptyCheck.error);

  const wrongCheck = validateAdminLogin('adminpa', 'wrong-pass');
  assert.equal(wrongCheck.valid, false);

  const validCheck = validateAdminLogin('adminpa', 'HandmadePA@2026');
  assert.equal(validCheck.valid, true);
});
