import { SplashscreenWrapper } from "@/components/layout";
import { Loader2 } from "lucide-react";

export default function Splashscreen() {
  const isDev = process.env.NODE_ENV === 'development';
  
  return (
    <SplashscreenWrapper>
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-6">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600 dark:text-blue-400" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Desktop Widget
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isDev ? "开发模式 - 正在启动..." : "正在初始化应用..."}
            </p>
            {isDev && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                热重载已启用
              </p>
            )}
          </div>
        </div>
      </div>
    </SplashscreenWrapper>
  );
}