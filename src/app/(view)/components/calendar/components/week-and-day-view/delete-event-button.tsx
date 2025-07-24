import { Fragment } from "react";
import type { FC } from "react"
import type { IEvent } from "@/types";


import {
    Button,
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui"
import { Trash2 } from "lucide-react";
import { useDeleteTodo } from "@/hooks/use-event";
import { cn } from "@/lib/utils";
import { useDisclosure } from "@/hooks/use-disclosure";


type DeleteEventButtonProps = {
    event: IEvent;
    className?: string;
};

export const DeleteEventButton: FC<DeleteEventButtonProps> = ({ event, className }) => {

    const { mutateAsync: deleteEvent } = useDeleteTodo();

    const { isOpen, onClose, onToggle } = useDisclosure();

    const handleDeleteEvent = async () => {
        await deleteEvent(event.id);
        onClose();
    }

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    }

    return (<Fragment>
        <div className={cn("relative", className)} onClick={handleClick}>
            <Dialog open={isOpen} onOpenChange={onToggle}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>移除待办</DialogTitle>
                        <DialogDescription>
                            确定要移除待办吗？
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">取消</Button>
                        </DialogClose>
                        <Button onClick={handleDeleteEvent}>确定</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

    </Fragment>);
};
export default DeleteEventButton