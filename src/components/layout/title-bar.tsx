import { ModeToggle } from "@/provider/mode-toggle";
import { Separator } from "@/components/ui"
import { WindowOperations } from "@/components/layout/window-operations";

export function TitleBar() {
  return (
    <header
      style={
        {
          WebkitAppRegion: "drag",
        } as React.CSSProperties
      }
      className="px-2 py-0.5 sticky top-0 flex items-center select-none shadow-md backdrop-blur-md justify-between"
    >
      <div className="flex items-center gap-2 h-7">
        <p>My Custom Title Bar</p>
        <Separator orientation="vertical" />
        <ModeToggle />
      </div>
      <WindowOperations />
    </header>
  );
}
