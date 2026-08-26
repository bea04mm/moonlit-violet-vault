import type { Metadata } from "next";
import { getAnalyticsData } from "@/lib/services/mediaService";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import BarChartIcon from "@mui/icons-material/BarChart";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Visualize media consumption.",
};

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <BarChartIcon fontSize="large" sx={{ color: "var(--color-violet-400)" }} />
          <h1
            className="text-4xl font-display font-bold text-gradient-violet"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Analytics
          </h1>
        </div>
        <p className="text-sm" style={{ color: "var(--color-lunar-500)" }}>
          A deep dive into the library and consumption habits.
        </p>
      </div>
      
      <AnalyticsCharts data={data} />
    </div>
  );
}
