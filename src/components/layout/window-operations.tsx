"use client"


import { useEffect, useState, type FC } from "react"
import { Button } from "@/components/ui";
import { Minimize, Maximize, X } from "lucide-react";
import { getCurrentWindow } from '@tauri-apps/api/window';


export const WindowOperations: FC = () => {

    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    useEffect(() => {
        const window = getCurrentWindow();
        window.isFullscreen().then((isFullscreen) => {
            setIsFullscreen(isFullscreen);
        });
    }, []);

    const toggleFullscreen = async () => {
        const window = getCurrentWindow();
        const fullscreen = await getCurrentWindow().isFullscreen();
        await window.setFullscreen(!fullscreen);
        setIsFullscreen(!fullscreen);
    }

    const handleClose = async () => {
        const window = await getCurrentWindow();
        window.close();
    }

    return (<div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            {
                isFullscreen ? <Minimize /> : <Maximize />
            }
        </Button>
        <Button variant="ghost" size="icon" onClick={handleClose}>
            <X />
        </Button>
    </div>);
};
export default WindowOperations