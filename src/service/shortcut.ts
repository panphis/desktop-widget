import { invoke } from '@tauri-apps/api/core';
import { ShortcutType } from "@/types/shortcut";


// 打开文件/应用
export const openPath = async (path: string): Promise<void> => {
  return await invoke('open_any_file', { path });
}

export const getFileIcon = async (path: string): Promise<string> => {
  return await invoke('get_file_icon_base64', { path });
}

export const getShortcuts = async (): Promise<ShortcutType[]> => {
  return await invoke('get_shortcuts');
}

export const createShortcut = async (path: string): Promise<ShortcutType> => {
  console.log('createShortcut',path);
  return await invoke('create_shortcut', { path });
}

export const deleteShortcut = async (id: string): Promise<boolean> => {
  return await invoke('delete_shortcut', { id });
}
