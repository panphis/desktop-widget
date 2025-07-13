"use client"

import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";


async function setup() {
    // 模拟执行一些重量级的设置任务
    // await new Promise(resolve => setTimeout(resolve, 3000));
    try {
        await invoke('set_complete', { task: 'frontend' });
        console.log('前端设置任务完成！')
    } catch (error) {
        console.error('调用 set_complete 失败:', error);
    }
}

// // Effectively a JavaScript main function
// window.addEventListener("DOMContentLoaded", () => {
//     setup()
// });

type SplashscreenWrapperProps = {
    children: React.ReactNode
}


export function SplashscreenWrapper({ children }: SplashscreenWrapperProps) {
    useEffect(() => {
        // // Effectively a JavaScript main function
        window.addEventListener("DOMContentLoaded", setup);
        setup()
        return () => {
            window.removeEventListener("DOMContentLoaded", setup);
        }
    }, [])
    return (children)
}

