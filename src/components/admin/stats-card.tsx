import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string; // e.g., "vs last month"
        positive?: boolean;
    };
    className?: string; // Add className prop
}

export function StatsCard({ title, value, description, icon: Icon, trend, className }: StatsCardProps) {
    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(description || trend) && (
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                        {trend && (
                            <span className={`font-medium mr-2 ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
                                {trend.positive ? '+' : ''}{trend.value}%
                            </span>
                        )}
                        <span>{trend ? trend.label : description}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
