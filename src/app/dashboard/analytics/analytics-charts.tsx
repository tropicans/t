"use client";

import { useMemo } from "react";
import { format, subDays } from "date-fns";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";

interface ClickRecord {
    createdAt: Date;
}

export function AnalyticsCharts({ rawData }: { rawData: ClickRecord[] }) {
    const chartData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = subDays(new Date(), 6 - i);
            return {
                date: format(d, "MMM dd"),
                rawDate: format(d, "yyyy-MM-dd"),
                clicks: 0,
            };
        });

        rawData.forEach((click) => {
            const clickDate = format(new Date(click.createdAt), "yyyy-MM-dd");
            const day = last7Days.find((d) => d.rawDate === clickDate);
            if (day) {
                day.clicks += 1;
            }
        });

        return last7Days;
    }, [rawData]);

    return (
        <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                    <XAxis
                        dataKey="date"
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fff", borderRadius: "8px" }}
                        itemStyle={{ color: "#3b82f6" }}
                    />
                    <Area
                        type="monotone"
                        dataKey="clicks"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorClicks)"
                        animationDuration={1000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
