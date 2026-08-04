"use client";

import { useMemo } from "react";
import { format, subDays, subHours } from "date-fns";
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

export function AnalyticsCharts({
    rawData,
    range = "7d",
}: {
    rawData: ClickRecord[];
    range?: string;
}) {
    const chartData = useMemo(() => {
        if (range === "24h") {
            const last24Hours = Array.from({ length: 24 }, (_, i) => {
                const d = subHours(new Date(), 23 - i);
                return {
                    date: format(d, "HH:00"),
                    rawHour: format(d, "yyyy-MM-dd HH"),
                    clicks: 0,
                };
            });

            rawData.forEach((click) => {
                const clickHour = format(new Date(click.createdAt), "yyyy-MM-dd HH");
                const hourBin = last24Hours.find((h) => h.rawHour === clickHour);
                if (hourBin) {
                    hourBin.clicks += 1;
                }
            });

            return last24Hours;
        }

        const dayCount = range === "30d" ? 30 : range === "all" ? 30 : 7;
        const days = Array.from({ length: dayCount }, (_, i) => {
            const d = subDays(new Date(), (dayCount - 1) - i);
            return {
                date: format(d, dayCount > 10 ? "dd MMM" : "MMM dd"),
                rawDate: format(d, "yyyy-MM-dd"),
                clicks: 0,
            };
        });

        rawData.forEach((click) => {
            const clickDate = format(new Date(click.createdAt), "yyyy-MM-dd");
            const day = days.find((d) => d.rawDate === clickDate);
            if (day) {
                day.clicks += 1;
            }
        });

        return days;
    }, [rawData, range]);

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
