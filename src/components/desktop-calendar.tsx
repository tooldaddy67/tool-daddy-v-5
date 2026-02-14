"use client";

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
    Menu,
    Calendar as CalendarIcon,
    ChevronDown,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { addMonths, format, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';

interface DesktopCalendarProps {
    tasks?: { id: string, dueDate?: any, completed: boolean }[];
}

export function DesktopCalendar({ tasks }: DesktopCalendarProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [month, setMonth] = useState<Date>(new Date());

    // Identify days with tasks
    const daysWithTasks = tasks?.filter(t => t.dueDate && !t.completed).map(t => {
        if (t.dueDate instanceof Timestamp) return t.dueDate.toDate();
        return new Date(t.dueDate);
    }) || [];

    const isDayWithTask = (day: Date) => {
        return daysWithTasks.some(d =>
            d.getDate() === day.getDate() &&
            d.getMonth() === day.getMonth() &&
            d.getFullYear() === day.getFullYear()
        );
    };

    const handleMonthChange = (newMonth: Date) => {
        setMonth(newMonth);
    };

    return (
        <div className="flex flex-col h-full bg-card/0">
            {/* Custom Header */}
            <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" className="group rounded-full bg-muted/40 hover:bg-muted/60 h-10 w-10">
                    <Menu className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Button>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="rounded-full bg-muted/40 border-0 hover:bg-muted/60 h-10 gap-2 px-4 font-semibold">
                                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                <span>{format(month, 'MMM')}</span>
                                <ChevronDown className="w-4 h-4 text-muted-foreground opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[150px]">
                            {Array.from({ length: 12 }).map((_, i) => {
                                const d = new Date(new Date().getFullYear(), i, 1);
                                return (
                                    <DropdownMenuItem key={i} onClick={() => setMonth(d)}>
                                        {format(d, 'MMMM')}
                                    </DropdownMenuItem>
                                )
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Calendar Component */}
            <div className="flex-1 w-full flex justify-center">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    month={month}
                    onMonthChange={setMonth}
                    className="p-0 w-full"
                    classNames={{
                        month: "space-y-4 w-full",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex w-full justify-between mb-2",
                        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
                        row: "flex w-full mt-2 justify-between",
                        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-transparent focus-within:relative focus-within:z-20",
                        day: cn(
                            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full hover:bg-muted/50 transition-colors",
                            "data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground data-[selected=true]:hover:bg-primary data-[selected=true]:hover:text-primary-foreground",
                        ),
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-md",
                        day_today: "bg-muted/30 text-foreground font-bold border border-border/50",
                        day_outside: "text-muted-foreground opacity-30",
                        nav: "hidden", // Hide default nav as we implement our own if needed, or rely on month dropdown
                        caption: "hidden", // Hide default caption
                    }}
                    modifiers={{
                        hasTask: (date) => isDayWithTask(date),
                    }}
                    modifiersClassNames={{
                        hasTask: "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full"
                    }}
                    components={{
                        // We are hiding default caption and nav, so no need to override icons here specifically for that
                    }}
                />
            </div>

            {/* Custom Nav overlay if needed, or just let user click months. 
                The image shows just a month dropdown. 
                But standard UX usually expects prev/next. 
                I'll add small subtle prev/next buttons next to the dropdown or in the corner if it feels right, 
                but for now sticking to the image (Menu + Dropdown).
            */}
        </div>
    );
}
