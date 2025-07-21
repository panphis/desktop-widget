'use client'

import type { FC } from "react"
import { LoadingButton } from "@/components";

import { useShortcut } from "@/hooks/use-shotcut";
import { useDeleteShortcut } from "@/hooks/use-shotcut";
import {
    Avatar, AvatarFallback, AvatarImage, ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui"
import { ShortcutType } from "@/types/shortcut";

type ShortcutItemProps = {
    shortcut: ShortcutType;
};

export const ShortcutItem: FC<ShortcutItemProps> = ({ shortcut }) => {

    const { openPath, icon, isLoading, name, error } = useShortcut(shortcut.path);
    const { mutate: deleteShortcut } = useDeleteShortcut();

    return (
        <ContextMenu>
            <ContextMenuTrigger className="items-center justify-center">

                {error ? '文件损坏或者不存在' : <LoadingButton
                    className="h-max w-max max-w-32 flex flex-col"
                    onClick={openPath}
                    variant={"outline"}
                    loading={isLoading}
                ><>
                        <Avatar>
                            <AvatarImage src={icon!} className="w-8 h-8" />
                            <AvatarFallback>
                                {name?.slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <p className="text-sm w-full text-muted-foreground truncate" title={shortcut.path}>
                            {name}
                        </p>
                    </></LoadingButton>}
            </ContextMenuTrigger>
            <ContextMenuContent className="w-52">
                <ContextMenuItem inset onClick={() => deleteShortcut(shortcut.id)}>
                    删除
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};
export default ShortcutItem