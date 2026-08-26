// src/lib/repositories/mediaRepository.ts
// Data access layer — single source of truth for all media_items queries.
// All database interactions live here; never import Supabase directly in pages/components.

import { createClient } from "@/lib/supabase/server";
import type { MediaItem, MediaType, MediaStatus } from "@/lib/supabase/database.types";

export interface MediaFilters {
  type?: MediaType;
  status?: MediaStatus;
  search?: string;
  genre?: string;
  sortBy?: "date_added" | "release_year" | "user_rating" | "title";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface MediaRepository {
  findAll(filters?: MediaFilters): Promise<MediaItem[]>;
  findById(id: string): Promise<MediaItem | null>;
  findByType(type: MediaType, filters?: Omit<MediaFilters, "type">): Promise<MediaItem[]>;
  count(filters?: MediaFilters): Promise<number>;
  insert(item: Partial<MediaItem>): Promise<MediaItem>;
  update(id: string, updates: Partial<MediaItem>): Promise<MediaItem>;
  delete(id: string): Promise<void>;
}

export async function getMediaRepository(): Promise<MediaRepository> {
  const supabase = await createClient();

  function buildQuery(filters?: MediaFilters) {
    let query = supabase.from("media_items").select("*");

    if (filters?.type) query = query.eq("type", filters.type);
    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.genre) query = query.contains("genres", [filters.genre]);
    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,original_title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`
      );
    }

    const sortBy = filters?.sortBy ?? "date_added";
    const ascending = filters?.sortOrder === "asc";
    query = query.order(sortBy, { ascending, nullsFirst: false });

    if (filters?.limit) query = query.limit(filters.limit);
    if (filters?.offset) query = query.range(filters.offset, (filters.offset ?? 0) + (filters?.limit ?? 50) - 1);

    return query;
  }

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
        .insert(item as any) // Cast required due to Supabase type inference on optional UUIDs/dates
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
        .update(updates as any)
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
