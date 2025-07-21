import { useEffect, useState, useMemo } from "react";
import { openPath, getFileIcon } from "@/service";


export const useShortcut = (path: string) => {

    const [icon, setIcon] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const name = useMemo(() => {
        const normalized = path.replace(/\\/g, '/').replace(/\/+$/, '');
        return normalized.split('/').pop();
    }, [path]);

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            const icon = await getFileIcon(path);
            setIcon(`data:image/png;base64,${icon}`);
            setIsLoading(false);
        }
        init();
    }, [path]);

    return {
        openPath: () => openPath(path),
        icon,
        isLoading,
        name,
    }
}



