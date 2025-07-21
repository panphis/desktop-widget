export interface ShortcutType {
  id: string;
  path: string;
}

export interface CreateShortcutRequest {
  path: string;
}

export interface UpdateShortcutRequest {
  id: string;
  path?: string;
} 