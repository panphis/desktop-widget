'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Folder, File, Monitor, Play } from 'lucide-react';
import { shortcutService } from '@/service/shortcut';
import { ShortcutItem, CreateShortcutRequest } from '@/types/shortcut';
import { toast } from 'sonner';

export  function Shortcut() {
  const [shortcuts, setShortcuts] = useState<ShortcutItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newShortcut, setNewShortcut] = useState<CreateShortcutRequest>({
    name: '',
    path: '',
    type: 'application'
  });

  useEffect(() => {
    loadShortcuts();
  }, []);

  const loadShortcuts = async () => {
    try {
      setIsLoading(true);
      const data = await shortcutService.getAll();
      setShortcuts(data);
    } catch (error) {
      toast.error('加载快捷方式失败');
      console.error('Failed to load shortcuts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateShortcut = async () => {
    try {
      if (!newShortcut.name || !newShortcut.path) {
        toast.error('请填写完整信息');
        return;
      }

      await shortcutService.create(newShortcut);
      toast.success('快捷方式创建成功');
      setIsDialogOpen(false);
      setNewShortcut({ name: '', path: '', type: 'application' });
      loadShortcuts();
    } catch (error) {
      toast.error('创建快捷方式失败');
      console.error('Failed to create shortcut:', error);
    }
  };

  const handleDeleteShortcut = async (id: string) => {
    try {
      await shortcutService.delete(id);
      toast.success('快捷方式删除成功');
      loadShortcuts();
    } catch (error) {
      toast.error('删除快捷方式失败');
      console.error('Failed to delete shortcut:', error);
    }
  };

  const handleOpenShortcut = async (shortcut: ShortcutItem) => {
    try {
      await shortcutService.open(shortcut.path);
    } catch (error) {
      toast.error('打开失败');
      console.error('Failed to open shortcut:', error);
    }
  };

  const handleSelectFile = async () => {
    try {
      const result = await shortcutService.selectFile();
      if (result) {
        setNewShortcut(prev => ({
          ...prev,
          name: result.name,
          path: result.path,
          type: 'file'
        }));
      }
    } catch (error) {
      toast.error('选择文件失败');
    }
  };

  const handleSelectFolder = async () => {
    try {
      const result = await shortcutService.selectFolder();
      if (result) {
        setNewShortcut(prev => ({
          ...prev,
          name: result.name,
          path: result.path,
          type: 'folder'
        }));
      }
    } catch (error) {
      toast.error('选择文件夹失败');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <Monitor className="w-4 h-4" />;
      case 'file':
        return <File className="w-4 h-4" />;
      case 'folder':
        return <Folder className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'application':
        return <Badge variant="default">应用</Badge>;
      case 'file':
        return <Badge variant="secondary">文件</Badge>;
      case 'folder':
        return <Badge variant="outline">文件夹</Badge>;
      default:
        return <Badge variant="secondary">未知</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">快捷方式管理</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              添加快捷方式
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>添加快捷方式</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">名称</Label>
                <Input
                  id="name"
                  value={newShortcut.name}
                  onChange={(e) => setNewShortcut(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="输入快捷方式名称"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">类型</Label>
                <Select
                  value={newShortcut.type}
                  onValueChange={(value: 'application' | 'file' | 'folder') =>
                    setNewShortcut(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="application">应用</SelectItem>
                    <SelectItem value="file">文件</SelectItem>
                    <SelectItem value="folder">文件夹</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="path">路径</Label>
                <div className="flex gap-2">
                  <Input
                    id="path"
                    value={newShortcut.path}
                    onChange={(e) => setNewShortcut(prev => ({ ...prev, path: e.target.value }))}
                    placeholder="选择或输入路径"
                  />
                  {newShortcut.type === 'file' && (
                    <Button variant="outline" onClick={handleSelectFile}>
                      选择文件
                    </Button>
                  )}
                  {newShortcut.type === 'folder' && (
                    <Button variant="outline" onClick={handleSelectFolder}>
                      选择文件夹
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleCreateShortcut}>
                创建
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((shortcut) => (
          <Card key={shortcut.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {shortcut.icon ? (
                    <img
                      src={shortcut.icon}
                      alt={shortcut.name}
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    getTypeIcon(shortcut.type)
                  )}
                  <CardTitle className="text-lg">{shortcut.name}</CardTitle>
                </div>
                {getTypeBadge(shortcut.type)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3 truncate" title={shortcut.path}>
                {shortcut.path}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleOpenShortcut(shortcut)}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-1" />
                  打开
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteShortcut(shortcut.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
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