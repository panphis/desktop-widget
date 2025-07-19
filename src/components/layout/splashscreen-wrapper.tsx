"use client"

import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

async function setup() {
    try {
        await invoke('set_complete', { task: 'frontend' });
        console.log('前端设置任务完成！')
    } catch (error) {
        console.error('调用 set_complete 失败:', error);
    }
}

type SplashscreenWrapperProps = {
    children: React.ReactNode
}

export function SplashscreenWrapper({ children }: SplashscreenWrapperProps) {
    const [_isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                // 在开发环境中，立即完成初始化
                await setup();
                setIsInitialized(true);
            } catch (error) {
                console.error('应用初始化失败:', error);
                // 即使失败也继续显示，避免卡死
                setIsInitialized(true);
            }
        };

        // 立即开始初始化，减少延迟
        initializeApp();
    }, []);

    return <>{children}</>;
}

