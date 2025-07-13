"use client"

import { invoke } from "@tauri-apps/api/core";

import { Button } from "@/components/ui";

export const GreetButton = () =>{
    const handleClick = () => {
        invoke('greet', { name: '世界' }).then((res) => {
            console.log(res)
        })
    }
    return (
        <Button onClick={handleClick}>问候</Button>
    )
}