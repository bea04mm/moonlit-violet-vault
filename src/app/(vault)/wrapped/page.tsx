/**
 * Vault Wrapped page — reads the ?year= query param, fetches annual stats,
 * and renders the WrappedPresentation full-screen slideshow.
 * 
 * @packageDocumentation
 */
import { getVaultWrappedStats } from "@/lib/services/mediaService";
import { WrappedPresentation } from "@/components/analytics/WrappedPresentation";
import type { Metadata } from "next";

/**
 * Metadata configuration for the Vault Wrapped page.
 */
export const metadata: Metadata = {
  title: "Vault Wrapped",
  description: "Year in review.",
};

/**
 * Renders the Vault Wrapped dashboard for a given year, processing query parameters and fetching annual statistics.
 */
export default async function WrappedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  /**
   * Awaited URL search parameters.
   */
  const params = await searchParams;
  /**
   * Extracted year string from query parameters.
   */
  const yearParam = params.year as string;
  /**
   * The parsed year integer to compute stats for, defaulting to the current year.
   */
  const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
  
  /**
   * Aggregated media statistics for the specified year.
   */
  const data = await getVaultWrappedStats(year);

  return <WrappedPresentation data={data} />;
}
