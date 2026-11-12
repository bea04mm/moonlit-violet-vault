/**
 * Renders the dashboard charts (Recharts) for library breakdown and time invested,
 * styled with the Moonlit Violet Vault design system.
 *
 * @packageDocumentation
 */
"use client"

import { useMemo } from "react"
import Link from "next/link"
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
} from "recharts"
import type { AnalyticsData } from "@/lib/services/mediaService"
import MovieIcon from "@mui/icons-material/Movie"
import TvIcon from "@mui/icons-material/Tv"
import MenuBookIcon from "@mui/icons-material/MenuBook"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import { useTheme } from "@/lib/mui/MuiProvider"

/**
 * Props for the AnalyticsCharts component.
 */
export interface Props {
  /**
   * Aggregated analytics data prepared by the server.
   */
  data: AnalyticsData
}

interface TooltipPayloadItem {
  name: string
  value: number
  payload?: { fill?: string }
  color?: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
}

/**
 * Custom tooltip component for rendering Recharts data.
 * Displays the name and value of the hovered chart segment in a styled glass-morphism container.
 *
 * @param props - Tooltip props provided by Recharts.
 * @returns The formatted tooltip element, or null if inactive.
 */
function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0]
    const fill = item.payload?.fill || item.color || "var(--chart-violet-primary, #8b5cf6)"
    return (
      <div className="border-border bg-surface/95 text-foreground flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-xs shadow-xl backdrop-blur-md">
        <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: fill }} />
        <span className="text-muted">{item.name}:</span>
        <span className="text-foreground font-semibold">{item.value}</span>
      </div>
    )
  }
  return null
}

/**
 * Renders interactive Recharts pie/bar charts and the entry point
 * button for the Vault Wrapped slideshow.
 */
export function AnalyticsCharts({ data }: Props) {
  /**
   * The current year used to pre-fill the vault wrapped link.
   */
  const currentYear = new Date().getFullYear()
  const { getCategoryColor } = useTheme()

  const libraryDistribution = useMemo(() => {
    return data.libraryDistribution.map((entry) => ({
      ...entry,
      fill: getCategoryColor(entry.name) || entry.fill,
    }))
  }, [data.libraryDistribution, getCategoryColor])

  const statusDistribution = useMemo(() => {
    return data.statusDistribution.map((entry) => ({
      ...entry,
      fill: getCategoryColor(entry.name) || entry.fill,
    }))
  }, [data.statusDistribution, getCategoryColor])

  const totalLibraryItems = useMemo(
    () => libraryDistribution.reduce((acc, curr) => acc + curr.value, 0),
    [libraryDistribution]
  )

  return (
    <div className="animate-fade-in space-y-6">
      {/* Vault Wrapped Launcher */}
      <Link href={`/wrapped?year=${currentYear}`} className="group block">
        <div className="bg-surface hover:bg-surface-hover border-border hover:border-primary shadow-card hover:shadow-card-hover flex items-center justify-between rounded-xl border p-5 transition-all duration-300 hover:-translate-y-0.5 sm:p-6">
          <div className="flex flex-col">
            <div className="mb-1 flex items-baseline gap-2">
              <h2 className="font-display text-foreground group-hover:text-primary text-xl font-semibold tracking-tight transition-colors sm:text-2xl">
                {currentYear} Vault Wrapped
              </h2>
              <span className="font-handwriting text-accent text-base select-none">
                annual review
              </span>
            </div>
            <p className="text-muted max-w-sm text-xs">
              Discover your top discoveries, genres, and reading & viewing time for the year.
            </p>
          </div>
          <div className="bg-primary hidden h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white transition-transform group-hover:scale-105 sm:flex">
            <ArrowForwardIcon sx={{ fontSize: 18 }} />
          </div>
        </div>
      </Link>

      {/* Time Invested Row */}
      <section className="pt-2">
        <h2 className="text-muted mb-3 font-mono text-[11px] font-semibold tracking-wider uppercase">
          Time Invested
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox
            label="Movies"
            value={`${data.timeInvested.moviesHours}h`}
            icon={<MovieIcon fontSize="small" />}
          />
          <StatBox
            label="Series"
            value={`${data.timeInvested.seriesHours}h`}
            icon={<TvIcon fontSize="small" />}
          />
          <StatBox
            label="Books (Time)"
            value={`${data.timeInvested.booksHours}h`}
            icon={<AccessTimeIcon fontSize="small" />}
          />
          <StatBox
            label="Books (Pages)"
            value={data.timeInvested.booksPages.toString()}
            icon={<MenuBookIcon fontSize="small" />}
          />
        </div>
      </section>

      {/* Charts Row */}
      <section>
        <h2 className="text-muted mt-6 mb-3 font-mono text-[11px] font-semibold tracking-wider uppercase">
          Distributions
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Library Distribution (Donut Chart) */}
          <div className="bg-surface hover:bg-surface-hover border-border hover:border-primary/40 shadow-card flex flex-col justify-between rounded-xl border p-5 transition-all duration-300 ease-out hover:shadow-md">
            <div>
              <h3 className="text-foreground mb-4 font-mono text-xs font-semibold tracking-wider uppercase">
                Library Breakdown
              </h3>
              <div className="relative h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={libraryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={78}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="transparent"
                    >
                      {libraryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-1">
                  <span className="font-display text-foreground text-2xl font-semibold tracking-tight">
                    {totalLibraryItems}
                  </span>
                  <span className="text-muted font-mono text-[10px] tracking-wider uppercase">
                    vault items
                  </span>
                </div>
              </div>
            </div>

            <div className="border-border-subtle mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5 border-t pt-3">
              {libraryDistribution.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: entry.fill }}
                  />
                  <span className="text-muted">{entry.name}</span>
                  <span className="text-foreground font-mono text-[11px] font-semibold">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution (Bar Chart) */}
          <div className="bg-surface hover:bg-surface-hover border-border hover:border-primary/40 shadow-card flex flex-col justify-between rounded-xl border p-5 transition-all duration-300 ease-out hover:shadow-md">
            <div>
              <h3 className="text-foreground mb-4 font-mono text-xs font-semibold tracking-wider uppercase">
                Status Overview
              </h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statusDistribution}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--color-border-subtle)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="var(--color-muted)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="var(--color-muted)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "rgba(180, 112, 255, 0.08)", radius: 6 }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="border-border-subtle mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5 border-t pt-3">
              {statusDistribution.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: entry.fill }}
                  />
                  <span className="text-muted">{entry.name}</span>
                  <span className="text-foreground font-mono text-[11px] font-semibold">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
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
    <div className="bg-surface hover:bg-surface-hover border-border hover:border-primary shadow-card hover:shadow-card-hover flex flex-col justify-between rounded-xl border p-4 transition-all duration-300 ease-out hover:-translate-y-0.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-muted text-xs">{label}</span>
        <span className="text-primary">{icon}</span>
      </div>
      <p className="font-display text-foreground font-mono text-2xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  )
}
