/**
 * Client hook for persisting selected sort options in localStorage without SSR hydration mismatches.
 *
 * @packageDocumentation
 */
"use client"

import { useCallback, useSyncExternalStore } from "react"

const SORT_CHANGE_EVENT = "vault-sort-change"
const memoryFallback = new Map<string, string>()

function subscribeSort(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(SORT_CHANGE_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(SORT_CHANGE_EVENT, onStoreChange)
  }
}

/**
 * Reads and persists a sort selection in `localStorage` under `storageKey`.
 *
 * @param storageKey - Unique `localStorage` key for the view's sort preference
 * @param defaultValue - Fallback sort value used on the server and when nothing is stored
 * @param validValues - Allowed sort option literals for validating stored values
 * @returns Tuple of the active sort value and a setter that persists it
 */
export function usePersistedSort<T extends string>(
  storageKey: string,
  defaultValue: T,
  validValues: readonly T[]
): [T, (next: T) => void] {
  const getSnapshot = useCallback((): T => {
    try {
      const saved = localStorage.getItem(storageKey) ?? memoryFallback.get(storageKey)
      if (saved && (validValues as readonly string[]).includes(saved)) {
        return saved as T
      }
    } catch {
      const fallback = memoryFallback.get(storageKey)
      if (fallback && (validValues as readonly string[]).includes(fallback)) {
        return fallback as T
      }
    }
    return defaultValue
  }, [storageKey, defaultValue, validValues])

  const value = useSyncExternalStore(subscribeSort, getSnapshot, () => defaultValue)

  const setValue = useCallback(
    (next: T) => {
      memoryFallback.set(storageKey, next)
      try {
        localStorage.setItem(storageKey, next)
      } catch {}
      window.dispatchEvent(new Event(SORT_CHANGE_EVENT))
    },
    [storageKey]
  )

  return [value, setValue]
}
