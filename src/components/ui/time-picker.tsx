"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TimePickerProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
}

export function TimePicker({ date, setDate }: TimePickerProps) {
    const [selectedHour, setSelectedHour] = React.useState<number>(date ? date.getHours() : 12);
    const [selectedMinute, setSelectedMinute] = React.useState<number>(date ? date.getMinutes() : 0);

    // Update internal state when date prop changes
    React.useEffect(() => {
        if (date) {
            setSelectedHour(date.getHours());
            setSelectedMinute(date.getMinutes());
        }
    }, [date]);

    const handleTimeChange = (type: "hour" | "minute", value: number) => {
        let newDate = date ? new Date(date) : new Date();
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);

        if (type === "hour") {
            setSelectedHour(value);
            newDate.setHours(value);
        } else {
            setSelectedMinute(value);
            newDate.setMinutes(value);
        }

        setDate(newDate);
    };

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

    return (
        <div className="flex flex-col gap-2 p-3 border-t bg-background/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Label className="text-xs font-semibold text-muted-foreground">Time</Label>
            </div>
            <div className="flex gap-2 h-32">
                <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-wider">Hour</span>
                    <ScrollArea className="h-full border rounded-md bg-background/50">
                        <div className="flex flex-col p-1 gap-1">
                            {hours.map((hour) => (
                                <Button
                                    key={hour}
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-8 w-full justify-center font-normal shrink-0",
                                        selectedHour === hour && "bg-primary text-primary-foreground font-bold"
                                    )}
                                    onClick={() => handleTimeChange("hour", hour)}
                                >
                                    {hour.toString().padStart(2, '0')}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-wider">Minute</span>
                    <ScrollArea className="h-full border rounded-md bg-background/50">
                        <div className="flex flex-col p-1 gap-1">
                            {minutes.map((minute) => (
                                <Button
                                    key={minute}
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-8 w-full justify-center font-normal shrink-0",
                                        selectedMinute === minute && "bg-primary text-primary-foreground font-bold"
                                    )}
                                    onClick={() => handleTimeChange("minute", minute)}
                                >
                                    {minute.toString().padStart(2, '0')}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
