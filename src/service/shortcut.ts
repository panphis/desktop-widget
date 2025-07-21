import { invoke } from '@tauri-apps/api/core';
import { ShortcutType, CreateShortcutRequest, UpdateShortcutRequest } from '@/types/shortcut';



// 打开文件/应用
export const openPath = async (path: string): Promise<void> => {
  return await invoke('open_any_file', { path });
}

export const getFileIcon = async (path: string): Promise<string> => {
  return await invoke('get_file_icon_base64', { path });
}


export const shortcutService = {
  // 获取所有快捷方式
  async getAll(): Promise<ShortcutType[]> {
    return await invoke('shortcut_get_all');
  },

  // 创建快捷方式
  async create(data: CreateShortcutRequest): Promise<ShortcutType> {
    return await invoke('shortcut_create', { data });
  },

  // 更新快捷方式
  async update(data: UpdateShortcutRequest): Promise<ShortcutType> {
    return await invoke('shortcut_update', { data });
  },

  // 删除快捷方式
  async delete(id: string): Promise<void> {
    return await invoke('shortcut_delete', { id });
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