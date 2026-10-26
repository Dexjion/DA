import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Mail,
  QrCode,
  CheckCircle2,
  Truck,
  Package,
  Send,
  ArrowLeft,
  Save,
  Eye,
  Upload,
  HardDrive,
  FolderOpen,
  LogOut,
  KeyRound,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  Product,
  ProductCategory,
  ArtworkPreset,
  UploadedMediaItem,
  AdminCredentials,
  Order,
  OrderStatus,
  PaymentConfig,
  EmailTemplate,
  SentEmailRecord,
  formatVND,
  formatFileSize,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getOrderStatusLabel,
} from '../utils/storeLogic';
import {
  initDriveAuth,
  googleDriveSignIn,
  googleDriveLogout,
  readFileAsDataUrl,
  listDriveProductImages,
  uploadImageToDrive,
  renameDriveImageFile,
  deleteDriveImageFile,
  DriveFileRecord,
} from '../utils/googleDrive';
import { YarnArtwork } from './YarnArtwork';

interface AdminPortalProps {
  products: Product[];
  orders: Order[];
  paymentConfig: PaymentConfig;
  emailTemplates: EmailTemplate[];
  sentEmails: SentEmailRecord[];
  mediaLibrary: UploadedMediaItem[];
  adminCredentials: AdminCredentials;
  onSaveProduct: (product: Product, isNew: boolean) => void;
  onDeleteProduct: (productId: string) => void;
  onQuickStockChange: (productId: string, delta: number) => void;
  onUpdateOrderStatus: (
    orderId: string,
    newStatus: OrderStatus,
    markPaid?: boolean
  ) => void;
  onUpdatePaymentConfig: (config: PaymentConfig) => void;
  onUpdateEmailTemplate: (template: EmailTemplate) => void;
  onResendEmail: (order: Order, triggerType: EmailTemplate['id']) => void;
  onAddMediaItem: (item: UploadedMediaItem) => void;
  onUpdateMediaItem: (item: UploadedMediaItem) => void;
  onRemoveMediaItem: (id: string) => void;
  onUpdateAdminCredentials: (creds: AdminCredentials) => void;
  onLogoutAdmin: () => void;
  onBackToStore: () => void;
}

interface PendingDriveConfirmation {
  title: string;
  description: string;
  confirmLabel: string;
  isDestructive?: boolean;
  onConfirm: () => Promise<void>;
}

const CATEGORIES: ProductCategory[] = [
  'Túi & Ví Len',
  'Mũ & Khăn Choàng',
  'Phụ Kiện & Charm',
];

const ARTWORK_OPTIONS: { value: ArtworkPreset; label: string }[] = [
  { value: 'tote_waffle', label: 'Túi Tote Len Mũi Waffle' },
  { value: 'beret_sage', label: 'Mũ Beret Len Xanh Xô Thơm' },
  { value: 'tulip_charm', label: 'Charm Bó Hoa Tulip Len' },
  { value: 'collar_lace', label: 'Cổ Áo Len Ren & Nơ Kẹp' },
  { value: 'bucket_hat', label: 'Mũ Bucket Len Hoa Cúc' },
  { value: 'cardholder_daisy', label: 'Ví Len Đựng Thẻ Thêu Hoa' },
];

export const AdminPortal: React.FC<AdminPortalProps> = ({
  products,
  orders,
  paymentConfig,
  emailTemplates,
  sentEmails,
  mediaLibrary,
  adminCredentials,
  onSaveProduct,
  onDeleteProduct,
  onQuickStockChange,
  onUpdateOrderStatus,
  onUpdatePaymentConfig,
  onUpdateEmailTemplate,
  onResendEmail,
  onAddMediaItem,
  onUpdateMediaItem,
  onRemoveMediaItem,
  onUpdateAdminCredentials,
  onLogoutAdmin,
  onBackToStore,
}) => {
  const [activeTab, setActiveTab] = useState<
    'products' | 'drive_media' | 'orders' | 'emails' | 'security'
  >('products');

  // Google Drive Auth State (following workspace-integration pattern)
  const [needsDriveAuth, setNeedsDriveAuth] = useState(true);
  const [driveUser, setDriveUser] = useState<FirebaseUser | null>(null);
  const [isSigningInDrive, setIsSigningInDrive] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileRecord[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [driveStatusMessage, setDriveStatusMessage] = useState<string>('');
  const [driveErrorMessage, setDriveErrorMessage] = useState<string>('');

  // Mandatory User Confirmation Dialog State for Google Drive mutations
  const [pendingDriveAction, setPendingDriveAction] =
    useState<PendingDriveConfirmation | null>(null);
  const [isExecutingDriveAction, setIsExecutingDriveAction] = useState(false);

  // Rename Input State for Drive File
  const [renamingMediaId, setRenamingMediaId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');

  // Product Form State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [formSku, setFormSku] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] =
    useState<ProductCategory>('Túi & Ví Len');
  const [formPrice, setFormPrice] = useState('250000');
  const [formStock, setFormStock] = useState('10');
  const [formMaterial, setFormMaterial] = useState('100% Len Cotton Milk');
  const [formCraftHours, setFormCraftHours] = useState('6');
  const [formDimensions, setFormDimensions] = useState('20 × 18 cm');
  const [formColors, setFormColors] = useState('Kem Sữa, Nâu Hạt Dẻ');
  const [formDescription, setFormDescription] = useState('');
  const [formCareNote, setFormCareNote] = useState(
    'Giặt tay nhẹ với nước lạnh, phơi phẳng tránh nắng gắt.'
  );
  const [formFeatured, setFormFeatured] = useState(true);
  const [formArtworkPreset, setFormArtworkPreset] =
    useState<ArtworkPreset>('tote_waffle');
  const [formCustomImageUrl, setFormCustomImageUrl] = useState('');
  const [formDriveFileId, setFormDriveFileId] = useState<string | undefined>(
    undefined
  );
  const [formDriveFileName, setFormDriveFileName] = useState<
    string | undefined
  >(undefined);
  const [pendingComputerFile, setPendingComputerFile] = useState<File | null>(
    null
  );
  const [productFormError, setProductFormError] = useState('');

  const productFileInputRef = useRef<HTMLInputElement | null>(null);
  const libraryFileInputRef = useRef<HTMLInputElement | null>(null);

  // Payment Config Form State
  const [cfgForm, setCfgForm] = useState<PaymentConfig>(paymentConfig);
  const [cfgSavedNotice, setCfgSavedNotice] = useState(false);

  // Email Inspection State
  const [selectedEmailLog, setSelectedEmailLog] =
    useState<SentEmailRecord | null>(sentEmails[0] || null);
  const [editingTemplateId, setEditingTemplateId] = useState<
    EmailTemplate['id']
  >('order_created');

  // Security Credentials Form State
  const [secUsername, setSecUsername] = useState(adminCredentials.username);
  const [secPassword, setSecPassword] = useState(adminCredentials.password);
  const [secSavedNotice, setSecSavedNotice] = useState(false);

  useEffect(() => {
    const unsubscribe = initDriveAuth(
      (user) => {
        setDriveUser(user);
        setNeedsDriveAuth(false);
      },
      () => {
        setDriveUser(null);
        setNeedsDriveAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const refreshDriveFiles = async () => {
    setIsLoadingDrive(true);
    setDriveErrorMessage('');
    try {
      const files = await listDriveProductImages();
      setDriveFiles(files);
    } catch (err: any) {
      if (err?.message === 'NEEDS_AUTH') {
        setNeedsDriveAuth(true);
      } else {
        setDriveErrorMessage(
          err?.message || 'Không thể tải danh sách tệp từ Google Drive.'
        );
      }
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleGoogleDriveLogin = async () => {
    setIsSigningInDrive(true);
    setDriveErrorMessage('');
    try {
      const result = await googleDriveSignIn();
      if (result) {
        setDriveUser(result.user);
        setNeedsDriveAuth(false);
        setDriveStatusMessage(
          `Đã kết nối Google Drive (${result.user.email || result.user.displayName})`
        );
        await refreshDriveFiles();
      }
    } catch (err: any) {
      setDriveErrorMessage(
        'Đăng nhập Google Drive chưa hoàn tất. Bạn vẫn có thể tải ảnh từ bộ nhớ máy tính và kết nối lại bất kỳ lúc nào.'
      );
    } finally {
      setIsSigningInDrive(false);
    }
  };

  const handleGoogleDriveDisconnect = async () => {
    await googleDriveLogout();
    setDriveUser(null);
    setNeedsDriveAuth(true);
    setDriveFiles([]);
    setDriveStatusMessage('Đã ngắt kết nối tài khoản Google Drive.');
  };

  // Handle selecting an image from computer inside the Product Form
  const handleSelectProductComputerImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setFormCustomImageUrl(dataUrl);
      setFormDriveFileName(file.name);
      setPendingComputerFile(file);

      const newMedia: UploadedMediaItem = {
        id: `media-${Date.now()}`,
        name: file.name,
        mimeType: file.type || 'image/jpeg',
        sizeBytes: file.size,
        dataUrl,
        uploadedAt: new Date().toLocaleString('vi-VN'),
        syncedToDrive: false,
      };
      onAddMediaItem(newMedia);
      setDriveStatusMessage(
        `Đã nạp ảnh "${file.name}" (${formatFileSize(file.size)}) từ bộ nhớ máy tính.`
      );
    } catch (err: any) {
      setProductFormError(err?.message || 'Lỗi đọc tệp ảnh từ máy tính.');
    }
  };

  // Handle uploading an image from computer in the Media Library tab
  const handleSelectLibraryComputerImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        const dataUrl = await readFileAsDataUrl(file);
        const item: UploadedMediaItem = {
          id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          mimeType: file.type || 'image/jpeg',
          sizeBytes: file.size,
          dataUrl,
          uploadedAt: new Date().toLocaleString('vi-VN'),
          syncedToDrive: false,
        };
        onAddMediaItem(item);

        // If already connected to Google Drive, ask user confirmation to upload to Drive
        if (!needsDriveAuth) {
          requestUploadFileToDrive(file, item);
        } else {
          setDriveStatusMessage(
            `Đã tải "${file.name}" từ bộ nhớ máy tính vào thư viện ảnh cửa hàng.`
          );
        }
      } catch (err: any) {
        setDriveErrorMessage(err?.message || 'Không thể đọc tệp từ máy tính.');
      }
    }
    e.target.value = '';
  };

  // Convert dataURL back to File when syncing an existing local media item to Google Drive
  const dataUrlToFile = async (
    dataUrl: string,
    fileName: string,
    mimeType: string
  ): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], fileName, { type: mimeType || 'image/jpeg' });
  };

  // Mandatory Confirmation Dialog before uploading/mutating Google Drive
  const requestUploadFileToDrive = (
    file: File | null,
    mediaItem: UploadedMediaItem
  ) => {
    setPendingDriveAction({
      title: 'Xác nhận tải ảnh lên Google Drive',
      description: `Bạn có đồng ý tải tệp ảnh "${mediaItem.name}" (${formatFileSize(
        mediaItem.sizeBytes
      )}) từ bộ nhớ máy tính lên tài khoản Google Drive (${
        driveUser?.email || 'đã kết nối'
      }) không?`,
      confirmLabel: 'Xác nhận tải lên Google Drive',
      isDestructive: false,
      onConfirm: async () => {
        const targetFile =
          file ||
          (await dataUrlToFile(
            mediaItem.dataUrl,
            mediaItem.name,
            mediaItem.mimeType
          ));
        const uploaded = await uploadImageToDrive(targetFile, mediaItem.name);
        onUpdateMediaItem({
          ...mediaItem,
          syncedToDrive: true,
          driveFileId: uploaded.id,
          driveWebViewLink: uploaded.webViewLink,
          driveOwnerEmail: driveUser?.email || undefined,
        });
        setFormDriveFileId(uploaded.id);
        setDriveStatusMessage(
          `Đã đồng bộ ảnh "${uploaded.name}" lên Google Drive (ID: ${uploaded.id}).`
        );
        await refreshDriveFiles();
      },
    });
  };

  const requestRenameOnDrive = (
    mediaItem: UploadedMediaItem,
    newFileName: string
  ) => {
    const cleanName = newFileName.trim();
    if (!cleanName) return;

    if (!mediaItem.driveFileId || needsDriveAuth) {
      onUpdateMediaItem({ ...mediaItem, name: cleanName });
      setRenamingMediaId(null);
      return;
    }

    setPendingDriveAction({
      title: 'Xác nhận đổi tên tệp trên Google Drive',
      description: `Bạn có chắc chắn muốn đổi tên tệp trên Google Drive từ "${mediaItem.name}" thành "${cleanName}" không?`,
      confirmLabel: 'Xác nhận đổi tên',
      isDestructive: false,
      onConfirm: async () => {
        await renameDriveImageFile(mediaItem.driveFileId!, cleanName);
        onUpdateMediaItem({ ...mediaItem, name: cleanName });
        setRenamingMediaId(null);
        setDriveStatusMessage(
          `Đã cập nhật tên tệp "${cleanName}" trên Google Drive.`
        );
        await refreshDriveFiles();
      },
    });
  };

  const requestDeleteMediaItem = (mediaItem: UploadedMediaItem) => {
    if (mediaItem.driveFileId && !needsDriveAuth) {
      setPendingDriveAction({
        title: 'Xác nhận xóa tệp ảnh khỏi Google Drive',
        description: `Bạn có chắc chắn muốn xóa vĩnh viễn tệp ảnh "${mediaItem.name}" khỏi Google Drive (${
          driveUser?.email || ''
        }) và thư viện ảnh không? Hành động này không thể hoàn tác.`,
        confirmLabel: 'Xác nhận xóa khỏi Google Drive',
        isDestructive: true,
        onConfirm: async () => {
          await deleteDriveImageFile(mediaItem.driveFileId!);
          onRemoveMediaItem(mediaItem.id);
          setDriveStatusMessage(
            `Đã xóa tệp "${mediaItem.name}" khỏi Google Drive và thư viện.`
          );
          await refreshDriveFiles();
        },
      });
    } else {
      onRemoveMediaItem(mediaItem.id);
    }
  };

  const executePendingDriveAction = async () => {
    if (!pendingDriveAction) return;
    setIsExecutingDriveAction(true);
    setDriveErrorMessage('');
    try {
      await pendingDriveAction.onConfirm();
      setPendingDriveAction(null);
    } catch (err: any) {
      if (err?.message === 'NEEDS_AUTH') {
        setNeedsDriveAuth(true);
        setDriveErrorMessage(
          'Phiên Google Drive đã hết hạn. Vui lòng đăng nhập lại bằng nút Sign in with Google.'
        );
      } else {
        setDriveErrorMessage(
          err?.message || 'Thao tác trên Google Drive không thành công.'
        );
      }
      setPendingDriveAction(null);
    } finally {
      setIsExecutingDriveAction(false);
    }
  };

  const startCreateProduct = () => {
    setIsAddingNew(true);
    setEditingProduct(null);
    setFormSku(`PA-NEW-${String(products.length + 1).padStart(2, '0')}`);
    setFormName('');
    setFormCategory('Túi & Ví Len');
    setFormPrice('265000');
    setFormStock('12');
    setFormMaterial('100% Len Cotton Milk 5Ply');
    setFormCraftHours('8');
    setFormDimensions('24 × 20 cm');
    setFormColors('Kem Bơ, Xanh Bơ');
    setFormDescription(
      'Sản phẩm đan móc thủ công tỉ mỉ từng mũi sợi tại xưởng Handmade PA.'
    );
    setFormCareNote('Giặt tay nhẹ bằng nước mát, phơi ngang trên khăn khô.');
    setFormFeatured(true);
    setFormArtworkPreset('tote_waffle');
    setFormCustomImageUrl('');
    setFormDriveFileId(undefined);
    setFormDriveFileName(undefined);
    setPendingComputerFile(null);
    setProductFormError('');
  };

  const startEditProduct = (product: Product) => {
    setIsAddingNew(false);
    setEditingProduct(product);
    setFormSku(product.sku);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormPrice(String(product.price));
    setFormStock(String(product.stock));
    setFormMaterial(product.material);
    setFormCraftHours(String(product.craftHours));
    setFormDimensions(product.dimensions);
    setFormColors(product.colors.join(', '));
    setFormDescription(product.description);
    setFormCareNote(product.careNote);
    setFormFeatured(product.featured);
    setFormArtworkPreset(product.artworkPreset);
    setFormCustomImageUrl(product.customImageUrl || '');
    setFormDriveFileId(product.driveFileId);
    setFormDriveFileName(product.driveFileName);
    setPendingComputerFile(null);
    setProductFormError('');
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formName.trim();
    const numericPrice = Number(formPrice);
    const numericStock = Number(formStock);

    if (!cleanName) {
      setProductFormError('Vui lòng nhập tên sản phẩm len.');
      return;
    }
    if (Number.isNaN(numericPrice) || numericPrice < 1000) {
      setProductFormError('Giá bán phải từ 1.000₫ trở lên.');
      return;
    }

    const parsedColors = formColors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const payload: Product = {
      id: editingProduct ? editingProduct.id : `pa-${Date.now()}`,
      sku: formSku.trim() || 'PA-ITEM',
      name: cleanName,
      category: formCategory,
      price: Math.round(numericPrice),
      stock: Math.max(0, Math.round(numericStock || 0)),
      material: formMaterial.trim() || '100% Len Cotton Milk',
      craftHours: Math.max(1, Math.round(Number(formCraftHours) || 4)),
      dimensions: formDimensions.trim() || 'Tiêu chuẩn',
      colors: parsedColors.length > 0 ? parsedColors : ['Mặc định'],
      description:
        formDescription.trim() ||
        'Phụ kiện đan móc thủ công tinh xảo từ xưởng Handmade PA.',
      careNote: formCareNote.trim() || 'Giặt tay nhẹ với nước lạnh.',
      featured: formFeatured,
      artworkPreset: formArtworkPreset,
      customImageUrl: formCustomImageUrl.trim() || undefined,
      driveFileId: formDriveFileId,
      driveFileName: formDriveFileName,
    };

    onSaveProduct(payload, isAddingNew);
    setEditingProduct(null);
    setIsAddingNew(false);
    setProductFormError('');
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const currentEditingTemplate =
    emailTemplates.find((t) => t.id === editingTemplateId) || emailTemplates[0];

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      {/* Header & KPI Overview */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-stone-200 pb-8">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <button
              type="button"
              onClick={onBackToStore}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay về cửa hàng Handmade PA</span>
            </button>
            <span className="text-stone-300">·</span>
            <span className="font-mono-tabular text-xs font-semibold text-[#E14B68] whitespace-nowrap shrink-0">
              /adminpa ({adminCredentials.username})
            </span>
            <span className="text-stone-300">·</span>
            <button
              type="button"
              onClick={onLogoutAdmin}
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:underline whitespace-nowrap shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>

          <h1 className="font-serif-display text-3xl font-semibold text-stone-900">
            Quản Trị Cửa Hàng Handmade PA
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Cập nhật sản phẩm, tải ảnh từ bộ nhớ máy tính & quản lý qua Google Drive, đối soát VietQR/MoMo và tự động hóa email.
          </p>
        </div>

        {/* Clean Single-Row Tab Bar */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-stone-200/75 p-1.5 self-start shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'products'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Sản phẩm ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('drive_media')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'drive_media'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Kho Ảnh & Drive ({mediaLibrary.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'orders'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Đơn hàng & QR ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('emails')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'emails'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Email tự động ({sentEmails.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'security'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Tài khoản /adminpa
          </button>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white border border-stone-200 p-4">
          <span className="text-xs text-stone-500">Tổng mẫu len đang bán</span>
          <p className="mt-1 font-mono-tabular text-2xl font-semibold text-stone-900">
            {products.length} mẫu
          </p>
        </div>
        <div className="rounded-xl bg-white border border-stone-200 p-4">
          <span className="text-xs text-stone-500">Ảnh tải từ máy & Google Drive</span>
          <p className="mt-1 font-mono-tabular text-2xl font-semibold text-stone-900">
            {mediaLibrary.length} tệp ảnh
          </p>
        </div>
        <div className="rounded-xl bg-white border border-stone-200 p-4">
          <span className="text-xs text-stone-500">Doanh thu đơn hàng</span>
          <p className="mt-1 font-mono-tabular text-2xl font-semibold text-[#E14B68]">
            {formatVND(totalRevenue)}
          </p>
        </div>
        <div className="rounded-xl bg-white border border-stone-200 p-4">
          <span className="text-xs text-stone-500">Trạng thái Google Drive</span>
          <p className="mt-1 text-sm font-semibold text-emerald-800 truncate">
            {!needsDriveAuth && driveUser
              ? `Đã kết nối: ${driveUser.email}`
              : 'Chưa kết nối Drive Mail'}
          </p>
        </div>
      </div>

      {/* Status / Error Banner for Computer & Google Drive Operations */}
      {(driveStatusMessage || driveErrorMessage) && (
        <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-white border border-stone-200 px-4 py-3 text-xs">
          <span
            className={
              driveErrorMessage
                ? 'font-medium text-red-700'
                : 'font-medium text-emerald-800'
            }
          >
            {driveErrorMessage || driveStatusMessage}
          </span>
          <button
            type="button"
            onClick={() => {
              setDriveStatusMessage('');
              setDriveErrorMessage('');
            }}
            className="text-stone-400 hover:text-stone-700"
          >
            Đóng
          </button>
        </div>
      )}

      {/* TAB 1: PRODUCT MANAGEMENT WITH COMPUTER UPLOAD & GOOGLE DRIVE */}
      {activeTab === 'products' && (
        <div className="mt-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif-display text-xl font-semibold text-stone-900">
                Danh mục sản phẩm phụ kiện len
              </h2>
              <p className="text-xs text-stone-500">
                Tải hình ảnh sản phẩm trực tiếp từ bộ nhớ máy tính và đồng bộ quản lý trên Google Drive của bạn.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('drive_media')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 whitespace-nowrap shrink-0"
              >
                <HardDrive className="h-4 w-4 text-[#E14B68]" />
                <span>Mở Kho Ảnh & Google Drive</span>
              </button>
              <button
                type="button"
                onClick={startCreateProduct}
                className="inline-flex items-center gap-2 rounded-lg bg-[#E14B68] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#C83754] transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Thêm sản phẩm len mới</span>
              </button>
            </div>
          </div>

          {/* Add / Edit Product Form */}
          {(isAddingNew || editingProduct) && (
            <form
              onSubmit={handleSubmitProduct}
              className="rounded-2xl bg-white border border-stone-300 p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="font-serif-display text-lg font-semibold text-stone-900">
                  {isAddingNew
                    ? 'Thêm sản phẩm phụ kiện len mới'
                    : `Cập nhật sản phẩm: ${editingProduct?.name}`}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingProduct(null);
                  }}
                  className="text-xs text-stone-500 hover:text-stone-900"
                >
                  Đóng biểu mẫu
                </button>
              </div>

              {productFormError && (
                <p className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {productFormError}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="admin-prod-name"
                    className="block text-xs font-medium text-stone-700 mb-1"
                  >
                    Tên sản phẩm len *
                  </label>
                  <input
                    id="admin-prod-name"
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ví dụ: Túi Đeo Chéo Len Hoa Cúc"
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#E14B68] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-prod-category"
                    className="block text-xs font-medium text-stone-700 mb-1"
                  >
                    Danh mục
                  </label>
                  <select
                    id="admin-prod-category"
                    value={formCategory}
                    onChange={(e) =>
                      setFormCategory(e.target.value as ProductCategory)
                    }
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:border-[#E14B68] focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="admin-prod-sku"
                    className="block text-xs font-medium text-stone-700 mb-1"
                  >
                    Mã SKU
                  </label>
                  <input
                    id="admin-prod-sku"
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono-tabular focus:border-[#E14B68] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-prod-price"
                    className="block text-xs font-medium text-stone-700 mb-1"
                  >
                    Giá bán (VNĐ) *
                  </label>
                  <input
                    id="admin-prod-price"
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono-tabular focus:border-[#E14B68] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-prod-stock"
                    className="block text-xs font-medium text-stone-700 mb-1"
                  >
                    Số lượng tồn kho
                  </label>
                  <input
                    id="admin-prod-stock"
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono-tabular focus:border-[#E14B68] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-prod-preset"
                    className="block text-xs font-medium text-stone-700 mb-1"
                  >
                    Mẫu minh họa Studio (Khi chưa tải ảnh riêng)
                  </label>
                  <select
                    id="admin-prod-preset"
                    value={formArtworkPreset}
                    onChange={(e) =>
                      setFormArtworkPreset(e.target.value as ArtworkPreset)
                    }
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:border-[#E14B68] focus:outline-none"
                  >
                    {ARTWORK_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="admin-prod-material"
                    className="block text-xs font-medium text-stone-700 mb-1"
                  >
                    Chất liệu sợi len
                  </label>
                  <input
                    id="admin-prod-material"
                    type="text"
                    value={formMaterial}
                    onChange={(e) => setFormMaterial(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#E14B68] focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="admin-prod-colors"
                    className="block text-xs font-medium text-stone-700 mb-1"
                  >
                    Các màu sắc (ngăn cách bằng dấu phẩy)
                  </label>
                  <input
                    id="admin-prod-colors"
                    type="text"
                    value={formColors}
                    onChange={(e) => setFormColors(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#E14B68] focus:outline-none"
                  />
                </div>
              </div>

              {/* Computer Image Upload & Google Drive Sync Block */}
              <div className="rounded-xl bg-[#FAF8F5] border border-stone-200 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-stone-900">
                      Hình ảnh sản phẩm (Tải từ bộ nhớ máy tính & Quản lý trên Google Drive)
                    </div>
                    <p className="text-xs text-stone-500">
                      Chọn tệp ảnh (.jpg, .png, .webp) từ máy tính của bạn hoặc chọn từ thư viện ảnh Google Drive.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={productFileInputRef}
                      id="product-computer-file"
                      type="file"
                      accept="image/*"
                      onChange={handleSelectProductComputerImage}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => productFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-stone-800 whitespace-nowrap shrink-0"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Chọn ảnh từ máy tính</span>
                    </button>

                    {pendingComputerFile && !needsDriveAuth && (
                      <button
                        type="button"
                        onClick={() => {
                          const latestMedia = mediaLibrary[0];
                          if (latestMedia) {
                            requestUploadFileToDrive(
                              pendingComputerFile,
                              latestMedia
                            );
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#E14B68] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#C83754] whitespace-nowrap shrink-0"
                      >
                        <HardDrive className="h-3.5 w-3.5" />
                        <span>Lưu ảnh này lên Google Drive</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Live Image Preview + Quick Pick from Uploaded Media */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2 border-t border-stone-200">
                  <YarnArtwork
                    preset={formArtworkPreset}
                    customImageUrl={formCustomImageUrl}
                    alt={formName || 'Xem trước sản phẩm'}
                    className="h-20 w-28 shrink-0 rounded-lg border border-stone-300"
                  />
                  <div className="flex-1 space-y-1.5 text-xs">
                    <div className="text-stone-700 font-medium">
                      {formCustomImageUrl
                        ? `Đang dùng ảnh tải lên: ${formDriveFileName || 'Ảnh tùy chỉnh từ máy tính'}`
                        : 'Đang dùng minh họa Studio mặc định'}
                    </div>
                    {formCustomImageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormCustomImageUrl('');
                          setFormDriveFileId(undefined);
                          setFormDriveFileName(undefined);
                        }}
                        className="text-red-700 hover:underline text-xs"
                      >
                        Gỡ ảnh tải lên (Dùng lại ảnh Studio)
                      </button>
                    )}
                    {mediaLibrary.length > 0 && (
                      <div className="pt-1">
                        <span className="text-stone-500 block mb-1">
                          Hoặc chọn nhanh ảnh đã tải lên trong kho ({mediaLibrary.length}):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {mediaLibrary.slice(0, 5).map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setFormCustomImageUrl(m.dataUrl);
                                setFormDriveFileId(m.driveFileId);
                                setFormDriveFileName(m.name);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-2.5 py-1 text-xs text-stone-700 hover:border-[#E14B68]"
                            >
                              <span className="truncate max-w-[140px]">
                                {m.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-prod-desc"
                  className="block text-xs font-medium text-stone-700 mb-1"
                >
                  Mô tả chi tiết mũi đan & công năng
                </label>
                <textarea
                  id="admin-prod-desc"
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#E14B68] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingProduct(null);
                  }}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#E14B68] px-5 py-2 text-xs font-semibold text-white hover:bg-[#C83754]"
                >
                  <Save className="h-4 w-4" />
                  <span>Lưu sản phẩm</span>
                </button>
              </div>
            </form>
          )}

          {/* Product Table */}
          <div className="overflow-x-auto rounded-2xl bg-white border border-stone-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-xs font-semibold text-stone-500">
                  <th className="py-3.5 px-4">Sản phẩm</th>
                  <th className="py-3.5 px-4">Danh mục · Nguồn ảnh</th>
                  <th className="py-3.5 px-4">Giá bán</th>
                  <th className="py-3.5 px-4">Tồn kho</th>
                  <th className="py-3.5 px-4 text-right">Thao tác quản trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-sm">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-stone-50/80">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <YarnArtwork
                          preset={product.artworkPreset}
                          customImageUrl={product.customImageUrl}
                          alt={product.name}
                          className="h-12 w-16 shrink-0 rounded-lg border border-stone-200"
                        />
                        <div>
                          <div className="font-semibold text-stone-900">
                            {product.name}
                          </div>
                          <div className="text-xs text-stone-500 font-mono-tabular">
                            {product.sku} · {product.craftHours}h đan tay
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-stone-600">
                      <div className="font-medium text-stone-800">
                        {product.category}
                      </div>
                      <div className="text-stone-500">
                        {product.driveFileId
                          ? `Google Drive (${product.driveFileName || 'Đã đồng bộ'})`
                          : product.customImageUrl
                          ? `Ảnh máy tính (${product.driveFileName || 'Local'})`
                          : product.material}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono-tabular font-semibold text-[#E14B68]">
                      {formatVND(product.price)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`Giảm tồn kho ${product.name}`}
                          onClick={() => onQuickStockChange(product.id, -1)}
                          className="h-7 w-7 rounded border border-stone-300 text-xs font-semibold hover:bg-stone-100"
                        >
                          −
                        </button>
                        <span className="font-mono-tabular text-xs font-semibold w-8 text-center">
                          {product.stock}
                        </span>
                        <button
                          type="button"
                          aria-label={`Tăng tồn kho ${product.name}`}
                          onClick={() => onQuickStockChange(product.id, 1)}
                          className="h-7 w-7 rounded border border-stone-300 text-xs font-semibold hover:bg-stone-100"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditProduct(product)}
                          className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 whitespace-nowrap shrink-0"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Sửa & Đổi ảnh</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteProduct(product.id)}
                          aria-label={`Xóa sản phẩm ${product.name}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-medium text-stone-500 hover:border-red-300 hover:text-red-700 whitespace-nowrap shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: COMPUTER IMAGE UPLOAD & GOOGLE DRIVE MANAGER */}
      {activeTab === 'drive_media' && (
        <div className="mt-8 space-y-8">
          {/* Google Drive Connection & Computer File Upload Card */}
          <div className="rounded-2xl bg-white border border-stone-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[#E14B68] text-xs font-semibold">
                  <HardDrive className="h-4 w-4" />
                  <span>QUẢN LÝ HÌNH ẢNH BẰNG BỘ NHỚ MÁY TÍNH & GOOGLE DRIVE MAIL</span>
                </div>
                <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
                  Kho Hình Ảnh Sản Phẩm Handmade PA
                </h2>
                <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
                  Tải hình ảnh chụp sản phẩm thực tế từ bộ nhớ máy tính lên web, đồng bộ lưu trữ trên Google Drive theo tài khoản Gmail của bạn và gán ảnh cho bất kỳ sản phẩm len nào.
                </p>
              </div>

              {/* Official Sign in with Google Button or Connected Account Info */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <input
                  ref={libraryFileInputRef}
                  id="library-computer-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSelectLibraryComputerImage}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => libraryFileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#E14B68] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#C83754] transition-colors whitespace-nowrap shrink-0"
                >
                  <Upload className="h-4 w-4" />
                  <span>Tải ảnh từ bộ nhớ máy tính</span>
                </button>

                {needsDriveAuth ? (
                  <button
                    type="button"
                    disabled={isSigningInDrive}
                    onClick={handleGoogleDriveLogin}
                    className="gsi-material-button inline-flex items-center gap-2.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-semibold text-stone-800 hover:bg-stone-50 shadow-2xs transition-colors whitespace-nowrap shrink-0"
                  >
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      className="h-4 w-4 block"
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                    <span>
                      {isSigningInDrive
                        ? 'Đang kết nối Google Drive...'
                        : 'Sign in with Google (Kết nối Drive Mail)'}
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={refreshDriveFiles}
                      disabled={isLoadingDrive}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 whitespace-nowrap shrink-0"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${
                          isLoadingDrive ? 'animate-spin' : ''
                        }`}
                      />
                      <span>Làm mới Google Drive</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleGoogleDriveDisconnect}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-100 px-3 py-2.5 text-xs font-medium text-stone-600 hover:text-red-700 whitespace-nowrap shrink-0"
                    >
                      <span>Ngắt kết nối ({driveUser?.email})</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Local Computer & Synced Google Drive Media Grid */}
          <div className="space-y-4">
            <h3 className="font-serif-display text-lg font-semibold text-stone-900">
              Danh sách ảnh đã tải từ máy tính ({mediaLibrary.length})
            </h3>

            {mediaLibrary.length === 0 ? (
              <div className="rounded-2xl bg-white border border-stone-200 p-12 text-center space-y-3">
                <FolderOpen className="h-8 w-8 text-stone-400 mx-auto" />
                <p className="font-serif-display text-base font-semibold text-stone-800">
                  Chưa có tệp ảnh nào được tải lên từ máy tính
                </p>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Nhấn nút "Tải ảnh từ bộ nhớ máy tính" ở trên để chọn ảnh sản phẩm len từ máy tính và đồng bộ lên Google Drive của bạn.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mediaLibrary.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-white border border-stone-200 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-4/3 w-full bg-[#EFEAE1] overflow-hidden border-b border-stone-200">
                        <img
                          src={item.dataUrl}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="p-4 space-y-2">
                        {renamingMediaId === item.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              className="flex-1 rounded-lg border border-stone-300 px-2.5 py-1 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                requestRenameOnDrive(item, renameValue)
                              }
                              className="rounded-lg bg-[#E14B68] px-2.5 py-1 text-xs font-semibold text-white"
                            >
                              Lưu
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-semibold text-stone-900 truncate">
                              {item.name}
                            </h4>
                            <button
                              type="button"
                              onClick={() => {
                                setRenamingMediaId(item.id);
                                setRenameValue(item.name);
                              }}
                              className="text-xs text-stone-500 hover:text-stone-900 shrink-0"
                            >
                              Đổi tên
                            </button>
                          </div>
                        )}

                        <div className="text-xs text-stone-500">
                          Kích thước: {formatFileSize(item.sizeBytes)} · Tải lúc:{' '}
                          {item.uploadedAt}
                        </div>

                        <div className="text-xs">
                          {item.syncedToDrive ? (
                            <span className="font-medium text-emerald-800">
                              Đã lưu trên Google Drive ({item.driveOwnerEmail || 'Drive Mail'})
                            </span>
                          ) : (
                            <span className="text-stone-500">
                              Lưu cục bộ từ máy tính · Chưa đẩy lên Google Drive
                            </span>
                          )}
                        </div>

                        {/* Assign Image to a Product */}
                        <div className="pt-2">
                          <label className="block text-xs text-stone-500 mb-1">
                            Gán ảnh này cho sản phẩm:
                          </label>
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              const targetProd = products.find(
                                (p) => p.id === e.target.value
                              );
                              if (targetProd) {
                                onSaveProduct(
                                  {
                                    ...targetProd,
                                    customImageUrl: item.dataUrl,
                                    driveFileId: item.driveFileId,
                                    driveFileName: item.name,
                                  },
                                  false
                                );
                                setDriveStatusMessage(
                                  `Đã cập nhật ảnh "${item.name}" cho sản phẩm "${targetProd.name}".`
                                );
                              }
                            }}
                            className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-800"
                          >
                            <option value="" disabled>
                              -- Chọn sản phẩm để áp dụng ảnh --
                            </option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-3 border-t border-stone-100 flex items-center justify-between gap-2 bg-[#FAF8F5]">
                      {!item.syncedToDrive ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (needsDriveAuth) {
                              handleGoogleDriveLogin();
                            } else {
                              requestUploadFileToDrive(null, item);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E14B68] hover:underline"
                        >
                          <HardDrive className="h-3.5 w-3.5" />
                          <span>
                            {needsDriveAuth
                              ? 'Kết nối Drive để lưu'
                              : 'Đẩy lên Google Drive'}
                          </span>
                        </button>
                      ) : item.driveWebViewLink ? (
                        <a
                          href={item.driveWebViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Xem trên Google Drive</span>
                        </a>
                      ) : (
                        <span className="text-xs text-emerald-800 font-medium">
                          Đã đồng bộ Drive
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => requestDeleteMediaItem(item)}
                        className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Remote Google Drive Files List (if connected) */}
          {!needsDriveAuth && driveFiles.length > 0 && (
            <div className="rounded-2xl bg-white border border-stone-200 p-6 space-y-4">
              <h3 className="font-serif-display text-lg font-semibold text-stone-900">
                Tệp ảnh đang quản lý trực tiếp trên Google Drive ({driveFiles.length})
              </h3>
              <div className="divide-y divide-stone-200 text-xs">
                {driveFiles.map((df) => (
                  <div
                    key={df.id}
                    className="py-3 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-semibold text-stone-900">
                        {df.name}
                      </div>
                      <div className="text-stone-500 font-mono-tabular">
                        Drive ID: {df.id} · {df.mimeType}
                      </div>
                    </div>
                    {df.webViewLink && (
                      <a
                        href={df.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#E14B68] font-medium hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Mở trong Google Drive</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ORDERS & VIETQR / MOMO CONFIGURATION */}
      {activeTab === 'orders' && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <h2 className="font-serif-display text-xl font-semibold text-stone-900">
              Danh sách đơn đặt hàng & Đối soát QR
            </h2>
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl bg-white border border-stone-200 p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
                  <div>
                    <span className="font-mono-tabular text-sm font-bold text-stone-900">
                      Đơn #{order.orderCode}
                    </span>
                    <span className="mx-2 text-stone-300">·</span>
                    <span className="text-xs text-stone-600">
                      {order.customerName} ({order.customerPhone})
                    </span>
                    <span className="mx-2 text-stone-300">·</span>
                    <span className="text-xs text-stone-500">
                      {order.customerEmail}
                    </span>
                  </div>
                  <div className="font-mono-tabular text-base font-semibold text-[#E14B68]">
                    {formatVND(order.totalAmount)}
                  </div>
                </div>

                <div className="text-xs text-stone-600 space-y-1">
                  <div>
                    <span className="text-stone-400">Sản phẩm: </span>
                    {order.items.map((i, idx) => (
                      <span key={idx} className="font-medium text-stone-800">
                        {i.product.name} ({i.selectedColor}) ×{i.quantity}
                        {idx < order.items.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                  <div>
                    <span className="text-stone-400">Địa chỉ giao: </span>
                    <span>{order.shippingAddress}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-stone-700">
                    <span>
                      Phương thức:{' '}
                      <strong>{getPaymentMethodLabel(order.paymentMethod)}</strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Thanh toán:{' '}
                      <strong>{getPaymentStatusLabel(order.paymentStatus)}</strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Trạng thái đơn:{' '}
                      <strong>{getOrderStatusLabel(order.orderStatus)}</strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular">
                      Nội dung CK: <strong>{order.transferContent}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
                  {order.paymentStatus !== 'paid' && (
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateOrderStatus(order.id, 'paid_verified', true)
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-900 whitespace-nowrap shrink-0"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Xác nhận đã nhận tiền QR & Gửi Email biên lai</span>
                    </button>
                  )}

                  {order.orderStatus !== 'shipping' &&
                    order.orderStatus !== 'completed' && (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateOrderStatus(order.id, 'shipping', false)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 whitespace-nowrap shrink-0"
                      >
                        <Truck className="h-3.5 w-3.5" />
                        <span>Chuyển giao hàng & Gửi Email vận đơn</span>
                      </button>
                    )}

                  {order.orderStatus !== 'completed' && (
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateOrderStatus(order.id, 'completed', true)
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 whitespace-nowrap shrink-0"
                    >
                      <Package className="h-3.5 w-3.5" />
                      <span>Đánh dấu Hoàn tất</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-2xl bg-white border border-stone-200 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-[#E14B68]" />
                <h3 className="font-serif-display text-lg font-semibold text-stone-900">
                  Cấu hình Cổng VietQR VIB
                </h3>
              </div>
              <p className="text-xs text-stone-500">
                Chỉ nhận thanh toán qua mã VietQR Ngân hàng Quốc Tế VIB (Không nhận COD, không dùng ví MoMo · Hàng Order 7–10 ngày).
              </p>

              {cfgForm.vietQrImageUrl && (
                <div className="rounded-xl bg-[#FAF8F5] border border-stone-200 p-3 flex items-center gap-3">
                  <img
                    src={cfgForm.vietQrImageUrl}
                    alt="Mã VietQR VIB"
                    referrerPolicy="no-referrer"
                    className="h-20 w-20 rounded-lg border border-stone-200 object-contain bg-white shrink-0"
                  />
                  <div className="text-xs text-stone-600">
                    <div className="font-semibold text-stone-900">
                      Tài khoản VietQR VIB Đang Áp Dụng
                    </div>
                    <div className="font-mono-tabular text-stone-700 mt-0.5">
                      {cfgForm.bankAccountName} · {cfgForm.bankAccountNo}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label
                    htmlFor="cfg-bank-name"
                    className="block font-medium text-stone-700 mb-1"
                  >
                    Ngân hàng thụ hưởng (VietQR)
                  </label>
                  <input
                    id="cfg-bank-name"
                    type="text"
                    value={cfgForm.bankName}
                    onChange={(e) =>
                      setCfgForm({ ...cfgForm, bankName: e.target.value })
                    }
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cfg-bank-no"
                    className="block font-medium text-stone-700 mb-1"
                  >
                    Số tài khoản ngân hàng VIB
                  </label>
                  <input
                    id="cfg-bank-no"
                    type="text"
                    value={cfgForm.bankAccountNo}
                    onChange={(e) =>
                      setCfgForm({ ...cfgForm, bankAccountNo: e.target.value })
                    }
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono-tabular"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cfg-bank-holder"
                    className="block font-medium text-stone-700 mb-1"
                  >
                    Tên chủ tài khoản
                  </label>
                  <input
                    id="cfg-bank-holder"
                    type="text"
                    value={cfgForm.bankAccountName}
                    onChange={(e) =>
                      setCfgForm({
                        ...cfgForm,
                        bankAccountName: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  />
                </div>

                <div className="pt-2 border-t border-stone-200">
                  <label
                    htmlFor="cfg-shipping-fee"
                    className="block font-medium text-stone-700 mb-1"
                  >
                    Phí vận chuyển cố định (VNĐ)
                  </label>
                  <input
                    id="cfg-shipping-fee"
                    type="number"
                    value={cfgForm.standardShippingFee}
                    onChange={(e) =>
                      setCfgForm({
                        ...cfgForm,
                        standardShippingFee: Math.max(
                          0,
                          Number(e.target.value) || 0
                        ),
                      })
                    }
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono-tabular"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onUpdatePaymentConfig(cfgForm);
                  setCfgSavedNotice(true);
                  setTimeout(() => setCfgSavedNotice(false), 2000);
                }}
                className="w-full rounded-lg bg-[#E14B68] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#C83754] transition-colors"
              >
                {cfgSavedNotice
                  ? 'Đã lưu cấu hình VietQR VIB!'
                  : 'Lưu cấu hình thanh toán VietQR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUTOMATED SALES EMAIL CENTER */}
      {activeTab === 'emails' && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-2xl bg-white border border-stone-200 p-6 space-y-4">
              <h2 className="font-serif-display text-xl font-semibold text-stone-900">
                Kịch bản Tự động hóa Email Bán hàng
              </h2>
              <p className="text-xs text-stone-500">
                Hệ thống tự động điền thông tin khách hàng, danh sách sản phẩm len, mã VietQR/MoMo và gửi email ngay khi phát sinh sự kiện đơn hàng.
              </p>

              <div className="space-y-3">
                {emailTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className={`rounded-xl border p-4 transition-colors ${
                      editingTemplateId === tpl.id
                        ? 'border-[#E14B68] bg-[#FAF8F5]'
                        : 'border-stone-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingTemplateId(tpl.id)}
                        className="text-left flex-1"
                      >
                        <div className="text-sm font-semibold text-stone-900">
                          {tpl.name}
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5">
                          {tpl.triggerLabel}
                        </div>
                      </button>

                      <label className="inline-flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={tpl.enabled}
                          onChange={(e) =>
                            onUpdateEmailTemplate({
                              ...tpl,
                              enabled: e.target.checked,
                            })
                          }
                          className="h-4 w-4 accent-[#E14B68] rounded"
                        />
                        <span>{tpl.enabled ? 'Đang bật' : 'Tắt'}</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {currentEditingTemplate && (
                <div className="pt-4 border-t border-stone-200 space-y-3">
                  <div className="text-xs font-semibold text-stone-800">
                    Chỉnh sửa nội dung mẫu: {currentEditingTemplate.name}
                  </div>
                  <div>
                    <label
                      htmlFor="tpl-subject"
                      className="block text-xs text-stone-500 mb-1"
                    >
                      Tiêu đề Email (Hỗ trợ biến {'{{orderCode}}'},{' '}
                      {'{{customerName}}'}, {'{{totalAmount}}'})
                    </label>
                    <input
                      id="tpl-subject"
                      type="text"
                      value={currentEditingTemplate.subjectTemplate}
                      onChange={(e) =>
                        onUpdateEmailTemplate({
                          ...currentEditingTemplate,
                          subjectTemplate: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium bg-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="tpl-body"
                      className="block text-xs text-stone-500 mb-1"
                    >
                      Nội dung Email tự động
                    </label>
                    <textarea
                      id="tpl-body"
                      rows={7}
                      value={currentEditingTemplate.bodyTemplate}
                      onChange={(e) =>
                        onUpdateEmailTemplate({
                          ...currentEditingTemplate,
                          bodyTemplate: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-stone-300 p-3 text-xs leading-relaxed bg-white"
                    />
                  </div>

                  {orders.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        onResendEmail(orders[0], currentEditingTemplate.id)
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>
                        Kích hoạt gửi thử cho đơn #{orders[0].orderCode}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl bg-white border border-stone-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif-display text-xl font-semibold text-stone-900">
                  Nhật ký Email đã gửi tự động ({sentEmails.length})
                </h2>
                <span className="text-xs text-stone-500">Thời gian thực</span>
              </div>

              <div className="divide-y divide-stone-200 max-h-60 overflow-y-auto border border-stone-200 rounded-xl">
                {sentEmails.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedEmailLog(item)}
                    className={`w-full text-left p-3.5 hover:bg-stone-50 transition-colors flex items-center justify-between gap-3 ${
                      selectedEmailLog?.id === item.id ? 'bg-[#FAF8F5]' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-stone-900 truncate">
                        {item.subject}
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        Tới: {item.recipientEmail} · Đơn #{item.orderCode} ·{' '}
                        {item.sentAt}
                      </div>
                    </div>
                    <Eye className="h-4 w-4 text-stone-400 shrink-0" />
                  </button>
                ))}
              </div>

              {selectedEmailLog && (
                <div className="rounded-xl bg-[#FAF8F5] border border-stone-200 p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-stone-500 border-b border-stone-200 pb-2">
                    <span>
                      Người nhận:{' '}
                      <strong className="text-stone-800">
                        {selectedEmailLog.recipientName} (
                        {selectedEmailLog.recipientEmail})
                      </strong>
                    </span>
                    <span className="font-mono-tabular">
                      {selectedEmailLog.sentAt}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-stone-900">
                    {selectedEmailLog.subject}
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-xs text-stone-700 leading-relaxed pt-1">
                    {selectedEmailLog.bodyText}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ADMINPA SECURITY & CREDENTIALS */}
      {activeTab === 'security' && (
        <div className="mt-8 max-w-xl">
          <div className="rounded-2xl bg-white border border-stone-200 p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#E14B68]">
              <KeyRound className="h-5 w-5" />
              <h2 className="font-serif-display text-xl font-semibold text-stone-900">
                Cài đặt Tài khoản & Mật khẩu /adminpa
              </h2>
            </div>
            <p className="text-xs text-stone-600">
              Cổng quản trị được ẩn hoàn toàn khỏi thanh điều hướng khách hàng và chỉ truy cập qua đường dẫn riêng <strong>/adminpa</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label
                  htmlFor="sec-username"
                  className="block font-medium text-stone-700 mb-1"
                >
                  Tên đăng nhập quản trị
                </label>
                <input
                  id="sec-username"
                  type="text"
                  value={secUsername}
                  onChange={(e) => setSecUsername(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono-tabular"
                />
              </div>

              <div>
                <label
                  htmlFor="sec-password"
                  className="block font-medium text-stone-700 mb-1"
                >
                  Mật khẩu quản trị mới
                </label>
                <input
                  id="sec-password"
                  type="text"
                  value={secPassword}
                  onChange={(e) => setSecPassword(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono-tabular"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (secUsername.trim().length >= 3 && secPassword.length >= 4) {
                  onUpdateAdminCredentials({
                    username: secUsername.trim(),
                    password: secPassword,
                  });
                  setSecSavedNotice(true);
                  setTimeout(() => setSecSavedNotice(false), 2000);
                }
              }}
              className="rounded-lg bg-[#E14B68] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#C83754]"
            >
              {secSavedNotice
                ? 'Đã cập nhật thông tin đăng nhập /adminpa!'
                : 'Lưu tên đăng nhập & mật khẩu'}
            </button>
          </div>
        </div>
      )}

      {/* MANDATORY USER CONFIRMATION MODAL FOR GOOGLE DRIVE MUTATIONS */}
      {pendingDriveAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drive-confirm-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-stone-200 p-6 shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle
                className={`h-5 w-5 shrink-0 mt-0.5 ${
                  pendingDriveAction.isDestructive
                    ? 'text-red-600'
                    : 'text-[#E14B68]'
                }`}
              />
              <div>
                <h3
                  id="drive-confirm-title"
                  className="font-serif-display text-lg font-semibold text-stone-900"
                >
                  {pendingDriveAction.title}
                </h3>
                <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                  {pendingDriveAction.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
              <button
                type="button"
                disabled={isExecutingDriveAction}
                onClick={() => setPendingDriveAction(null)}
                className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isExecutingDriveAction}
                onClick={executePendingDriveAction}
                className={`rounded-lg px-4 py-2 text-xs font-semibold text-white ${
                  pendingDriveAction.isDestructive
                    ? 'bg-red-700 hover:bg-red-800'
                    : 'bg-[#E14B68] hover:bg-[#C83754]'
                }`}
              >
                {isExecutingDriveAction
                  ? 'Đang xử lý với Google Drive...'
                  : pendingDriveAction.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
