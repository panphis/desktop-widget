#!/bin/bash

# 显示卸载开始消息
echo "正在清理安装目录..."

# 应用标识符，用于验证是否为正确的目录
APP_IDENTIFIER="desktop-widget"
APP_CONFIG_FILE=".desktop-widget-config"

# 获取安装目录
INSTALL_DIR="$HOME/.local/share/desktop-widget"

# 检查并删除安装目录 - 增加安全检查
if [ -d "$INSTALL_DIR" ]; then
    # 检查是否确实是我们的应用目录
    if [ -f "$INSTALL_DIR/$APP_CONFIG_FILE" ]; then
        echo "正在删除应用目录: $INSTALL_DIR"
        rm -rf "$INSTALL_DIR"
    else
        echo "警告: 跳过删除 $INSTALL_DIR - 不是有效的应用目录"
    fi
fi

# 检查并删除桌面快捷方式
DESKTOP_FILE="$HOME/.local/share/applications/$APP_IDENTIFIER.desktop"
if [ -f "$DESKTOP_FILE" ]; then
    # 验证文件内容包含我们的应用标识符
    if grep -q "$APP_IDENTIFIER" "$DESKTOP_FILE"; then
        echo "正在删除桌面快捷方式"
        rm -f "$DESKTOP_FILE"
    fi
fi

# 检查并删除应用程序图标
ICON_FILE="$HOME/.local/share/icons/$APP_IDENTIFIER.png"
if [ -f "$ICON_FILE" ]; then
    # 只删除我们应用的图标
    if [ "$(stat -f %Su "$ICON_FILE")" = "$(whoami)" ]; then
        echo "正在删除应用图标"
        rm -f "$ICON_FILE"
    fi
fi

echo "卸载完成"