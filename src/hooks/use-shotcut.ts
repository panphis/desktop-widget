import { useEffect, useState, useMemo } from "react";
import { openPath, getFileIcon, getShortcuts, createShortcut, deleteShortcut } from "@/service";
import { useMutation, useQuery , useQueryClient} from "@tanstack/react-query";


export const useShortcut = (path: string) => {

    const [icon, setIcon] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const name = useMemo(() => {
        const normalized = path.replace(/\\/g, '/').replace(/\/+$/, '');
        return normalized.split('/').pop();
    }, [path]);

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                const icon = await getFileIcon(path);
                setIcon(`data:image/png;base64,${icon}`);
            } catch (error) {
                setError(error as Error);
            }
            setIsLoading(false);
        }
        init();
    }, [path]);

    return {
        openPath: () => openPath(path),
        icon,
        isLoading,
        name,
        error,
    }
}

export const useShortcuts = () => {
    return useQuery({
        queryKey: ["shortcuts"],
        queryFn: () => getShortcuts(),
    });
}


export const useCreateShortcut = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (path: string) => createShortcut(path),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shortcuts"] });
        },
    });
}


export const useDeleteShortcut = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteShortcut(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shortcuts"] });
        },
    });
}