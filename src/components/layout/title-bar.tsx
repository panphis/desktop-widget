import { ModeToggle } from "@/provider/mode-toggle";
import { Separator } from "@/components/ui"

export function TitleBar() {
  return (
    <header
      style={
        {
          WebkitAppRegion: "drag",
        } as React.CSSProperties
      }
      className="px-2 py-0.5 flex items-center select-none bg-foreground/20 backdrop-blur-md"
    >
      <div className="flex items-center gap-2 h-7">
        <p>My Custom Title Bar</p>
        <Separator orientation="vertical" />
        <ModeToggle />
      </div>
    </header>
  );
}
