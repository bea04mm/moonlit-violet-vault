import { getVaultWrappedStats } from "@/lib/services/mediaService";
import { WrappedPresentation } from "@/components/analytics/WrappedPresentation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vault Wrapped",
  description: "Your year in review.",
};

export default async function WrappedPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const yearParam = searchParams.year as string;
  const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
  
  const data = await getVaultWrappedStats(year);

  return <WrappedPresentation data={data} />;
}
