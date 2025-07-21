'use client'

import { Fragment } from "react";
import type { FC } from "react"
import { LoadingButton } from "@/components";

import { useShortcut } from "@/hooks/use-shotcut";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type ShortcutItemProps = {
    path: string;
};

export const ShortcutItem: FC<ShortcutItemProps> = ({ path }) => {

    const { openPath, icon, isLoading, name } = useShortcut(path);

    return (<Fragment>
        <LoadingButton
            className="h-max w-max max-w-32 flex flex-col"
            onClick={openPath}
            variant={"outline"}
            loading={isLoading}
        >
            <Avatar>
                <AvatarImage src={icon!} className="w-8 h-8" />
                <AvatarFallback>{name?.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <p className="text-sm w-full text-muted-foreground truncate" title={path}>
                {name}
            </p>
        </LoadingButton>
    </Fragment>);
};
export default ShortcutItem