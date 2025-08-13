import { ModeToggle } from "@/provider/mode-toggle";
import { Separator } from "@/components/ui"
import { WindowOperations } from "@/components/layout/window-operations";
import styles from "./title-bar.module.css";
import { cn } from "@/lib/utils";


export function TitleBar() {
	return (
		<header
			className={cn(
				"px-2 py-0.5 sticky top-0 flex items-center select-none shadow-md backdrop-blur-md justify-between",
				styles.titlebar
			)}
			data-tauri-drag-region
		>
			<div className="flex items-center gap-2 h-7">
				<p>桌面小组件</p>
				<Separator orientation="vertical" />
				<ModeToggle />
			</div>
			<WindowOperations />
		</header>
	);
}
