import { SplashscreenWrapper } from "@/components/layout";
import { Loader2 } from "lucide-react";

export default function Splashscreen() {
  return (
    <SplashscreenWrapper>
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    </SplashscreenWrapper>
  );
}