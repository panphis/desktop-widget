import { invoke } from '@tauri-apps/api/core';
import { ShortcutItem, CreateShortcutRequest, UpdateShortcutRequest } from '@/types/shortcut';

export const shortcutService = {
  // 获取所有快捷方式
  async getAll(): Promise<ShortcutItem[]> {
    return await invoke('shortcut_get_all');
  },

  // 创建快捷方式
  async create(data: CreateShortcutRequest): Promise<ShortcutItem> {
    return await invoke('shortcut_create', { data });
  },

  // 更新快捷方式
  async update(data: UpdateShortcutRequest): Promise<ShortcutItem> {
    return await invoke('shortcut_update', { data });
  },

  // 删除快捷方式
  async delete(id: string): Promise<void> {
    return await invoke('shortcut_delete', { id });
  },

  // 打开文件/应用
  async open(path: string): Promise<void> {
    return await invoke('shortcut_open_path', { path });
  },

  // 选择文件
  async selectFile(): Promise<{ path: string; name: string } | null> {
    return await invoke('shortcut_select_file');
  },

  // 选择文件夹
  async selectFolder(): Promise<{ path: string; name: string } | null> {
    return await invoke('shortcut_select_folder');
  },

  // 获取系统图标
  async getIcon(path: string): Promise<string | null> {
    return await invoke('shortcut_get_file_icon', { path });
  }
}; 