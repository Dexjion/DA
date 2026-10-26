import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

// In-memory access token cache (NEVER stored in localStorage or sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;

export interface DriveFileRecord {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  webViewLink?: string;
  thumbnailLink?: string;
}

export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleDriveSignIn = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Không lấy được mã truy cập Google Drive từ tài khoản Google.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Drive sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleDriveLogout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh từ máy tính.'));
    reader.readAsDataURL(file);
  });
};

export const listDriveProductImages = async (): Promise<DriveFileRecord[]> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('NEEDS_AUTH');
  }

  const query = encodeURIComponent(
    "mimeType contains 'image/' and trashed = false"
  );
  const fields = encodeURIComponent(
    'files(id,name,mimeType,size,createdTime,webViewLink,thumbnailLink)'
  );
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=createdTime desc&pageSize=30`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (res.status === 401 || res.status === 403) {
    cachedAccessToken = null;
    throw new Error('NEEDS_AUTH');
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Lỗi tải danh sách Google Drive: ${errText}`);
  }

  const data = await res.json();
  return data.files || [];
};

export const uploadImageToDrive = async (
  file: File,
  customName?: string
): Promise<DriveFileRecord> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('NEEDS_AUTH');
  }

  const metadata = {
    name: customName?.trim() || `HandmadePA_${file.name}`,
    mimeType: file.type || 'image/jpeg',
    description: 'Ảnh sản phẩm phụ kiện len Handmade PA',
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', file);

  const fields = encodeURIComponent(
    'id,name,mimeType,size,createdTime,webViewLink,thumbnailLink'
  );
  const res = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=${fields}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    }
  );

  if (res.status === 401 || res.status === 403) {
    cachedAccessToken = null;
    throw new Error('NEEDS_AUTH');
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Không thể tải ảnh lên Google Drive: ${errText}`);
  }

  return await res.json();
};

export const renameDriveImageFile = async (
  fileId: string,
  newName: string
): Promise<DriveFileRecord> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('NEEDS_AUTH');
  }

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      fileId
    )}?fields=id,name,mimeType,size,createdTime,webViewLink,thumbnailLink`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName.trim() }),
    }
  );

  if (!res.ok) {
    throw new Error('Không thể đổi tên tệp trên Google Drive.');
  }

  return await res.json();
};

export const deleteDriveImageFile = async (fileId: string): Promise<void> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('NEEDS_AUTH');
  }

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Không thể xóa tệp khỏi Google Drive.');
  }
};
