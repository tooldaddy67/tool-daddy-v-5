"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
    const { setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <Sun className="h-[1.2rem] w-[1.2rem]" />
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full transition-all" aria-label="Toggle Theme">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-md border-white/10 rounded-xl shadow-2xl">
                <DropdownMenuItem onClick={() => setTheme("light")} className="rounded-lg transition-colors cursor-pointer capitalize font-bold text-xs uppercase tracking-tighter">
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="rounded-lg transition-colors cursor-pointer capitalize font-bold text-xs uppercase tracking-tighter">
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("grayscale")} className="rounded-lg transition-colors cursor-pointer capitalize font-bold text-xs uppercase tracking-tighter">
                    Grayscale
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
