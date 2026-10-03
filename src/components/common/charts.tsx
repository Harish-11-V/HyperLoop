import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

const AXIS = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-popover)",
    border: "1px solid var(--color-border)",
    borderRadius: "10px",
    fontSize: "12px",
    color: "var(--color-popover-foreground)",
  },
  labelStyle: { color: "var(--color-muted-foreground)", fontSize: "11px" },
  itemStyle: { color: "var(--color-popover-foreground)" },
};

export const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export function UsageAreaChart({
  data,
  height = 260,
  projected = false,
}: {
  data: object[];
  height?: number;
  projected?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="usedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="projFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="date" {...AXIS} />
        <YAxis {...AXIS} unit=" GB" width={66} />
        <Tooltip {...tooltipStyle} />
        <Area
          type="monotone"
          dataKey="usedGb"
          name="Used"
          stroke="var(--color-chart-1)"
          strokeWidth={2}
          fill="url(#usedFill)"
          connectNulls={false}
        />
        {projected && (
          <Area
            type="monotone"
            dataKey="projectedGb"
            name="Projected"
            stroke="var(--color-chart-3)"
            strokeWidth={2}
            strokeDasharray="5 4"
            fill="url(#projFill)"
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function TypeDonut({
  data,
  height = 240,
}: {
  data: Array<{ type: string; sizeGb: number }>;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="sizeGb"
          nameKey="type"
          innerRadius="58%"
          outerRadius="85%"
          paddingAngle={3}
          stroke="var(--color-background)"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} formatter={(v: number) => `${v} GB`} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          formatter={(value) => (
            <span style={{ color: "var(--color-muted-foreground)", fontSize: 11 }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function FolderBarChart({
  data,
  height = 260,
}: {
  data: Array<{ folder: string; sizeGb: number }>;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 24, bottom: 0 }}
      >
        <CartesianGrid stroke="var(--color-border)" horizontal={false} />
        <XAxis type="number" {...AXIS} unit=" GB" />
        <YAxis type="category" dataKey="folder" {...AXIS} width={140} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
        <Bar dataKey="sizeGb" name="Size" radius={[0, 6, 6, 0]} fill="var(--color-chart-2)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ActivityLineChart({
  data,
  height = 240,
}: {
  data: object[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="day" {...AXIS} />
        <YAxis {...AXIS} width={44} />
        <Tooltip {...tooltipStyle} />
        <Line type="monotone" dataKey="uploads" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="changes" stroke="var(--color-chart-3)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="deletions" stroke="var(--color-chart-4)" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
