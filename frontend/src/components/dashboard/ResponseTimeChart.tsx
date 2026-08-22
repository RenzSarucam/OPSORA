"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { HealthCheckPoint } from "@/types/health";

export function ResponseTimeChart({ points }: { points: HealthCheckPoint[] }) {
  const data = points.map((point) => ({
    time: new Date(point.checked_at).getTime(),
    responseTime: point.response_time,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="responseTimeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="time"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(t: number) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          stroke="var(--color-muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--color-muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={44}
          tickFormatter={(v: number) => `${v}ms`}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            color: "var(--color-popover-foreground)",
            fontSize: 12,
          }}
          labelFormatter={(t) => new Date(t as number).toLocaleString()}
          formatter={(value) => [`${value}ms`, "Response time"]}
        />
        <Area
          type="monotone"
          dataKey="responseTime"
          stroke="var(--color-primary)"
          strokeWidth={2}
          fill="url(#responseTimeFill)"
          connectNulls
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}