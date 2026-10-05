/**
 * Data-access layer (Repository pattern) for the `media_items` Supabase table.
 * This is the only place in the codebase that talks directly to the database.
 * All server actions and service functions must go through this repository
 * instead of importing the Supabase client directly.
 *
 * Architecture:
 *   Pages/Components → mediaService → mediaRepository → Supabase
 * 
 * @packageDocumentation
 */
import { createClient } from "@/lib/supabase/server";
import type { MediaItem, MediaType, MediaStatus } from "@/lib/supabase/database.types";

/**
 * Optional filter / sort / pagination parameters accepted by `findAll` and related queries.
 */
export interface MediaFilters {
  /**
   * Narrow results to a specific media type.
   */
  type?: MediaType;
  /**
   * Narrow results to a specific status.
   */
  status?: MediaStatus;
  /**
   * Full-text substring search across title, original_title, and author.
   */
  search?: string;
  /**
   * Filter items that contain this genre string in their `genres` array.
   */
  genre?: string;
  /**
   * When true, only return items marked as favourites.
   */
  isFavorite?: boolean;
  /**
   * Column to sort by. Defaults to "date_added".
   */
  sortBy?: "date_added" | "release_year" | "user_rating" | "title";
  /**
   * Sort direction. Defaults to "desc".
   */
  sortOrder?: "asc" | "desc";
  /**
   * Maximum number of rows to return.
   */
  limit?: number;
  /**
   * Number of rows to skip (for pagination).
   */
  offset?: number;
}

/**
 * Typed interface for the media repository.
 * Swap the implementation (e.g. for testing) by providing a mock that satisfies this shape.
 */
export interface MediaRepository {
  findAll(filters?: MediaFilters): Promise<MediaItem[]>;
  findById(id: string): Promise<MediaItem | null>;
  findByType(type: MediaType, filters?: Omit<MediaFilters, "type">): Promise<MediaItem[]>;
  count(filters?: MediaFilters): Promise<number>;
  insert(item: Partial<MediaItem>): Promise<MediaItem>;
  update(id: string, updates: Partial<MediaItem>): Promise<MediaItem>;
  delete(id: string): Promise<void>;
}

/**
 * Data access layer — single source of truth for all media_items queries.
 * All database interactions live here; never import Supabase directly in pages/components.
 */
export async function getMediaRepository(): Promise<MediaRepository> {
  /**
   * The server-side Supabase client instance.
   */
  const supabase = await createClient();

  /**
   * Helper function to construct a query builder based on provided filters.
   */
  function buildQuery(filters?: MediaFilters) {
    /**
     * The initial Supabase query fetching all columns from the media_items table.
     */
    let query = supabase.from("media_items").select("*");

    if (filters?.type) query = query.eq("type", filters.type);
    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.genre) query = query.contains("genres", [filters.genre]);
    if (filters?.isFavorite !== undefined) query = query.eq("is_favorite", filters.isFavorite);
    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,original_title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`
      );
    }

    /**
     * The column to sort the results by, defaulting to "date_added".
     */
    const sortBy = filters?.sortBy ?? "date_added";
    /**
     * Boolean flag indicating whether the sort order is ascending.
     */
    const ascending = filters?.sortOrder === "asc";
    query = query.order(sortBy, { ascending, nullsFirst: false });

    if (filters?.limit) query = query.limit(filters.limit);
    if (filters?.offset) query = query.range(filters.offset, (filters.offset ?? 0) + (filters?.limit ?? 50) - 1);

    return query;
  }

  /**
   * The media repository object implementing the data access layer interfaces.
   */
  const repo: MediaRepository = {
    async findAll(filters) {
      const { data, error } = await buildQuery(filters);
      if (error) throw new Error(`[MediaRepository] findAll: ${error.message}`);
      return (data as MediaItem[]) ?? [];
    },

    async findById(id) {
      const { data, error } = await supabase
        .from("media_items")
        .select("*")
        .eq("id", id)
        .single();
      if (error && error.code !== "PGRST116") {
        throw new Error(`[MediaRepository] findById: ${error.message}`);
      }
      return (data as MediaItem | null) ?? null;
    },

    async findByType(type, filters) {
      return repo.findAll({ ...filters, type });
    },

    async count(filters) {
      let query = supabase
        .from("media_items")
        .select("*", { count: "exact", head: true });

      if (filters?.type) query = query.eq("type", filters.type);
      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.genre) query = query.contains("genres", [filters.genre]);

      const { count, error } = await query;
      if (error) throw new Error(`[MediaRepository] count: ${error.message}`);
      return count ?? 0;
    },

    async insert(item) {
      const { data, error } = await supabase
        .from("media_items")
        // @ts-expect-error Supabase insert types can be overly strict
        .insert(item)
        .select()
        .single();
        
      if (error) {
        throw new Error(`[MediaRepository] insert: ${error.message}`);
      }
      return data as MediaItem;
    },

    async update(id, updates) {
      const { data, error } = await supabase
        .from("media_items")
        // @ts-expect-error Supabase update types can be overly strict with JSONb objects
        .update(updates)
        .eq("id", id)
        .select()
        .single();
        
      if (error) {
        throw new Error(`[MediaRepository] update: ${error.message}`);
      }
      return data as MediaItem;
    },

    async delete(id) {
      const { error } = await supabase
        .from("media_items")
        .delete()
        .eq("id", id);
      
      if (error) {
        throw new Error(`[MediaRepository] delete: ${error.message}`);
      }
    },
  };

  return repo;
}
