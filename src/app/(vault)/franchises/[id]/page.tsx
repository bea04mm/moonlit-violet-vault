/**
 * Franchise viewing checklist detail page.
 * Displays the complete chronological checklist, era filters, and vault integration
 * for a specific cinematic universe (e.g. Marvel, DC, Wizarding World).
 *
 * @packageDocumentation
 */
import { Suspense } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { FranchiseDashboard } from "@/components/franchises/FranchiseDashboard"
import {
  getAllFranchisesAction,
  getFranchiseItemsWithVault,
} from "@/lib/actions/franchiseAiActions"

/**
 * Dynamic route parameters for a franchise viewing checklist page.
 */
export interface FranchisePageProps {
  /** Next.js dynamic route parameters promise resolving to the franchise slug */
  params: Promise<{ id: string }>
}

/**
 * Dynamically generates SEO metadata for a franchise viewing checklist page.
 *
 * @param props - Page route properties
 * @returns Metadata object with custom title and franchise tagline
 */
export async function generateMetadata({ params }: FranchisePageProps): Promise<Metadata> {
  const { id } = await params
  const allFranchises = await getAllFranchisesAction()
  const franchise = allFranchises.find((f) => f.id === id)

  if (!franchise) {
    return { title: "Franchise Not Found · Moonlit Violet Vault" }
  }

  return {
    title: `${franchise.shortName} Viewing Checklist · Moonlit Violet Vault`,
    description: franchise.tagline || `Master chronological viewing guide for ${franchise.name}.`,
  }
}

/**
 * Server Component loader fetching all franchise metadata, catalog items,
 * and Vault integration state for the active franchise.
 *
 * @param props - Loader properties with franchise ID
 */
async function FranchiseDetailLoader({ id }: { id: string }) {
  const allFranchises = await getAllFranchisesAction()
  const targetFranchise = allFranchises.find((f) => f.id === id)

  if (!targetFranchise) {
    notFound()
  }

  const franchiseData = await getFranchiseItemsWithVault(targetFranchise.id)

  return (
    <FranchiseDashboard
      initialUniverse={targetFranchise.id}
      initialFranchises={allFranchises}
      initialData={{ [targetFranchise.id]: franchiseData.items }}
      initialInVaultCounts={{ [targetFranchise.id]: franchiseData.inVaultCount }}
    />
  )
}

/**
 * Franchise viewing checklist detail page component.
 *
 * @param props - Page route properties
 */
export default async function FranchiseDetailPage({ params }: FranchisePageProps) {
  const { id } = await params

  return (
    <div className="animate-fade-in">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface/50" />}>
        <FranchiseDetailLoader id={id} />
      </Suspense>
    </div>
  )
}
