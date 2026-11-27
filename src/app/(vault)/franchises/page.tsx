/**
 * Franchises viewing checklist archives — master list of cinematic universes.
 * Selecting a franchise opens its full chronological viewing checklist and vault integration.
 *
 * @packageDocumentation
 */
import { Suspense } from "react"
import type { Metadata } from "next"
import { FranchisesIndexView, type FranchiseCardData } from "@/components/franchises/FranchisesIndexView"
import { FranchisesIndexSkeleton } from "@/components/ui/Skeleton"
import {
  getAllFranchisesAction,
  getFranchiseItemsWithVault,
} from "@/lib/actions/franchiseAiActions"

export const metadata: Metadata = {
  title: "Franchises · Moonlit Violet Vault",
  description: "Chronological master franchise archives and viewing checklists.",
}

/**
 * Server Component loader that reads all available franchises, computes card metrics,
 * and passes the deduplicated list to {@link FranchisesIndexView}.
 */
async function FranchisesHubLoader() {
  const allFranchises = await getAllFranchisesAction()

  // Strict deduplication by ID
  const franchiseMap = new Map<string, (typeof allFranchises)[0]>()
  allFranchises.forEach((f) => franchiseMap.set(f.id, f))
  const uniqueFranchises = Array.from(franchiseMap.values())

  const cardDataList: FranchiseCardData[] = await Promise.all(
    uniqueFranchises.map(async (f) => {
      const data = await getFranchiseItemsWithVault(f.id)
      const items = data.items || []
      const watchedCount = items.filter((i) => i.watched).length
      const totalMinutes = items.reduce((acc, i) => acc + (i.runtime || 0), 0)
      const sampleCovers = items
        .filter((i) => Boolean(i.coverUrl))
        .slice(0, 4)
        .map((i) => i.coverUrl as string)

      return {
        ...f,
        totalCount: items.length,
        inVaultCount: data.inVaultCount || 0,
        watchedCount,
        totalMinutes,
        sampleCovers,
      }
    })
  )

  return <FranchisesIndexView initialFranchises={cardDataList} />
}

/**
 * Master Franchises Hub page displaying all available cinematic sagas.
 */
export default function FranchisesPage() {
  return (
    <div className="animate-fade-in">
      <Suspense fallback={<FranchisesIndexSkeleton />}>
        <FranchisesHubLoader />
      </Suspense>
    </div>
  )
}
