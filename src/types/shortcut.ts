export interface ShortcutType {
  id: string;
  name: string;
  path: string;
  type: 'application' | 'file' | 'folder';
  icon?: string; // base64 图标数据
  created_at: string;
  updated_at: string;
}

export interface CreateShortcutRequest {
  name: string;
  path: string;
  type: 'application' | 'file' | 'folder';
}

export interface UpdateShortcutRequest {
  id: string;
  name?: string;
  path?: string;
  type?: 'application' | 'file' | 'folder';
} 