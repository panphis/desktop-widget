'use client';

import React, { useState } from 'react';
import {
  Button,
} from '@/components/ui';
 
import { open } from '@tauri-apps/plugin-dialog';
import { Plus, Folder } from 'lucide-react'; 
import ShortcutItem from './shortcut-item';
 
 

export function Shortcut() {
 
  const [shortcuts, setShortcuts] = useState<string[]>([]);


  const handleSelectFile = async () => {
    const file = await open({
      multiple: false,
      directory: false,
    });
    console.log(file);
    if (file) {
      setShortcuts([...shortcuts, file!])
    }
  }


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">快捷方式管理</h2>

        <Button variant="outline" onClick={handleSelectFile}>
          <Plus className="w-4 h-4 mr-2" />
          选择文件
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((shortcut) => (
          <ShortcutItem key={shortcut} path={shortcut} />
        ))}
      </div>

      {shortcuts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>暂无快捷方式</p>
          <p className="text-sm">点击上方按钮添加您的第一个快捷方式</p>
        </div>
      )}
    </div>
  );
} 