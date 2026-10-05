/**
 * Renders the dashboard charts (Recharts) for library breakdown and time invested.
 * 
 * @packageDocumentation
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { AnalyticsData } from "@/lib/services/mediaService";
import MovieIcon from "@mui/icons-material/Movie";
import TvIcon from "@mui/icons-material/Tv";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

/**
 * Props for the AnalyticsCharts component.
 */
export interface Props {
  /**
   * Aggregated analytics data prepared by the server.
   */
  data: AnalyticsData;
}

/**
 * Custom tooltip component for rendering Recharts data.
 * Displays the name and value of the hovered chart segment in a styled glass-morphism container.
 *
 * @param props - Tooltip props provided by Recharts.
 * @returns The formatted tooltip element, or null if inactive.
 */
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-4 py-2 rounded-xl backdrop-blur-md text-sm border"
        style={{
          background: "rgba(17, 14, 31, 0.9)",
          borderColor: "rgba(255, 255, 255, 0.1)",
          boxShadow: "var(--shadow-card)",
          color: "var(--color-lunar-200)",
        }}
      >
        <p className="font-semibold">{`${payload[0].name} : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

/**
 * Renders interactive Recharts pie/bar charts and the entry point
 * button for the Vault Wrapped slideshow.
 */
export function AnalyticsCharts({ data }: Props) {
  /**
   * The current year used to pre-fill the vault wrapped link.
   */
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Vault Wrapped Launcher */}
      <Link href={`/wrapped?year=${currentYear}`} className="block">
        <div className="glass-card rounded-3xl p-6 sm:p-8 border-2 border-(--color-violet-500)/30 bg-linear-to-r from-violet-900/20 to-(--color-starlight-900)/10 flex items-center justify-between group hover:border-(--color-violet-500) transition-all overflow-hidden relative shadow-[0_0_30px_rgba(157,77,255,0.1)] hover:shadow-[0_0_50px_rgba(157,77,255,0.2)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-(--color-violet-500)/10 blur-[80px] rounded-full transform translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 flex flex-col">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white flex items-center gap-2">
              <AutoAwesomeIcon sx={{ color: "var(--color-violet-400)" }} /> 
              {currentYear} Vault Wrapped
            </h2>
            <p className="text-lunar-300 mt-2 max-w-sm">
              Discover top genres, favorite titles, and how much time was spent escaping reality this year.
            </p>
          </div>
          <div className="relative z-10 hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-violet-600 text-white group-hover:scale-110 transition-transform">
            <span className="font-bold text-xl">→</span>
          </div>
        </div>
      </Link>

      {/* Time Invested Row */}
      <section className="pt-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-lunar-600)" }}>
          Time Invested
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatBox label="Movies" value={`${data.timeInvested.moviesHours}h`} icon={<MovieIcon fontSize="small" />} />
          <StatBox label="Series" value={`${data.timeInvested.seriesHours}h`} icon={<TvIcon fontSize="small" />} />
          <StatBox label="Books (Time)" value={`${data.timeInvested.booksHours}h`} icon={<AccessTimeIcon fontSize="small" />} />
          <StatBox label="Books (Pages)" value={data.timeInvested.booksPages.toString()} icon={<MenuBookIcon fontSize="small" />} />
        </div>
      </section>

      {/* Charts Row */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-4 mt-8" style={{ color: "var(--color-lunar-600)" }}>
          Distributions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Library Distribution (Pie Chart) */}
          <div className="glass-card rounded-3xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="text-sm font-semibold mb-6" style={{ color: "var(--color-lunar-200)" }}>Library Breakdown</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.libraryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="transparent"
                  >
                    {data.libraryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center gap-4 mt-4">
              {data.libraryDistribution.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                  <span style={{ color: "var(--color-lunar-400)" }}>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution (Bar Chart) */}
          <div className="glass-card rounded-3xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="text-sm font-semibold mb-6" style={{ color: "var(--color-lunar-200)" }}>Status Overview</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.statusDistribution} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--color-lunar-600)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="var(--color-lunar-600)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    allowDecimals={false}
                  />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {data.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

/**
 * Reusable component for displaying an individual statistic in a stylized box.
 * Features an icon, the primary value, and a descriptive label.
 *
 * @param props - The properties for the StatBox component.
 * @param props.label - A short description of the statistic.
 * @param props.value - The statistic's value (e.g., hours or count).
 * @param props.icon - The Material UI icon element to display.
 */
function StatBox({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-1" style={{ boxShadow: "var(--shadow-card)" }}>
      <span className="mb-1 flex items-center justify-center w-8 h-8 rounded-lg bg-[color-mix(in_srgb,var(--color-violet-500)_15%,transparent)] text-violet-400">{icon}</span>
      <p className="text-2xl font-display font-bold" style={{ color: "var(--color-violet-300)", fontFamily: "var(--font-display)" }}>
        {value}
      </p>
      <p className="text-xs font-medium" style={{ color: "var(--color-lunar-400)" }}>
        {label}
      </p>
    </div>
  );
}
