import React, { useState, useEffect } from 'react';
import { X, Check, ShoppingBag, Clock } from 'lucide-react';
import { Product, formatVND } from '../utils/storeLogic';
import { YarnArtwork } from './YarnArtwork';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    selectedColor: string
  ) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedFeedback, setAddedFeedback] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0] || 'Mặc định');
      setQuantity(1);
      setAddedFeedback(false);
    }
  }, [product]);

  if (!product) return null;

  const handleAdd = () => {
    if (product.stock <= 0) return;
    onAddToCart(product, quantity, selectedColor);
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
    }, 1400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#4A252B]/55 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-[#FFF9FA] border-2 border-[#F4B8C6] shadow-xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng chi tiết sản phẩm"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 border border-[#F5C6D0] text-[#4A252B] hover:bg-[#E14B68] hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
          {/* Left Gallery Column */}
          <div className="md:col-span-6 bg-gingham-pink flex flex-col justify-between p-6 border-b md:border-b-0 md:border-r border-dashed border-[#F4B8C6]">
            <YarnArtwork
              preset={product.artworkPreset}
              customImageUrl={product.customImageUrl}
              alt={product.name}
              className="w-full aspect-4/3 rounded-2xl border-2 border-[#FAD4DC]"
            />
            <div className="mt-4 pt-4 border-t border-dashed border-[#F4B8C6] flex items-center justify-between text-xs font-medium text-[#6E3B44]">
              <span>Mã SP: {product.sku}</span>
              <span aria-hidden="true">·</span>
              <span>Đan thủ công: {product.craftHours} giờ</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#4F6F3A] font-semibold">Hàng Order: 7–10 ngày</span>
            </div>
          </div>

          {/* Right Contiguous Purchase Module */}
          <div className="md:col-span-6 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#7D4E57] mb-2">
                <span className="font-semibold text-[#C83754]">{product.category}</span>
                <span aria-hidden="true">·</span>
                <span>{product.material}</span>
              </div>

              <h2
                id="product-modal-title"
                className="font-serif-display text-2xl md:text-3xl font-bold text-[#4A252B] leading-tight"
              >
                {product.name}
              </h2>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-mono-tabular text-2xl font-bold text-[#E14B68]">
                  {formatVND(product.price)}
                </span>
                <span className="text-xs font-medium text-[#5D8243]">
                  Sản phẩm theo yêu cầu (Có hàng sau 7–10 ngày)
                </span>
              </div>

              <p className="mt-4 text-sm text-[#6E3B44] leading-relaxed">
                {product.description}
              </p>

              {/* Color Variant Selector */}
              <div className="mt-5">
                <label className="block text-xs font-medium text-[#6E3B44] mb-2">
                  Phối màu sợi len:{' '}
                  <span className="text-[#4A252B] font-bold">
                    {selectedColor}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-full border transition-colors whitespace-nowrap shrink-0 ${
                        selectedColor === color
                          ? 'border-[#E14B68] bg-[#FFE8EE] text-[#C83754]'
                          : 'border-[#F5C6D0] bg-white text-[#6E3B44] hover:border-[#E14B68]'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specifications, Payment & Lead Time Note */}
              <div className="mt-5 space-y-2 border-t border-dashed border-[#F4B8C6] pt-4 text-xs text-[#6E3B44]">
                <div className="flex justify-between">
                  <span className="text-[#8E5B65]">Kích thước tiêu chuẩn:</span>
                  <span className="font-semibold text-[#4A252B]">
                    {product.dimensions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E5B65]">Phương thức thanh toán:</span>
                  <span className="font-semibold text-[#4A252B]">
                    Mã VietQR VIB 386625242 (Phí ship 25.000₫)
                  </span>
                </div>
                <div className="flex items-start gap-2 rounded-2xl bg-[#EAF2DC] border border-dashed border-[#88A86C] p-3 text-[#3F5E2A] mt-2">
                  <Clock className="h-4 w-4 text-[#5D8243] shrink-0 mt-0.5" />
                  <span>
                    <strong>Thời gian chuẩn bị hàng Order:</strong> Mất khoảng{' '}
                    <strong>7–10 ngày</strong> đan thủ công sau khi hoàn tất thanh toán.
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity & Primary Purchase CTA */}
            <div className="mt-6 pt-4 border-t border-dashed border-[#F4B8C6]">
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-full border border-[#F4B8C6] bg-white">
                  <button
                    type="button"
                    aria-label="Giảm số lượng"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2.5 text-sm font-bold text-[#6E3B44] hover:bg-[#FFE8EE] rounded-l-full"
                  >
                    −
                  </button>
                  <span className="px-3 py-2.5 font-mono-tabular text-sm font-semibold text-[#4A252B]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Tăng số lượng"
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(Math.max(1, product.stock), q + 1)
                      )
                    }
                    className="px-3.5 py-2.5 text-sm font-bold text-[#6E3B44] hover:bg-[#FFE8EE] rounded-r-full"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={handleAdd}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#E14B68] px-5 py-3 text-sm font-semibold text-white hover:bg-[#C83754] disabled:bg-stone-300 transition-colors whitespace-nowrap shrink-0"
                >
                  {addedFeedback ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Đã thêm vào giỏ hàng</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      <span>
                        Đặt Order · {formatVND(product.price * quantity)}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
