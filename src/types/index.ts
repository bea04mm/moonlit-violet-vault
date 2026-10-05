/**
 * Shared TypeScript type definitions for external API responses used throughout
 * the Moonlit Violet Vault. These are plain data-transfer shapes — no business
 * logic lives here. Add new external-API types in this file to keep imports tidy.
 * 
 * @packageDocumentation
 */

// ─── TMDB (The Movie Database) ───────────────────────────────────────────────

/**
 * A single result item returned by the TMDB /search/movie or /search/tv endpoint.
 */
export interface TmdbMovieResponse {
  id: number;
  /**
   * Movie title (only present for type=movie).
   */
  title?: string;
  /**
   * TV series name (only present for type=series).
   */
  name?: string;
  original_title?: string;
  original_name?: string;
  /**
   * Relative path to the poster image, e.g. "/abc123.jpg". Prepend the TMDB image base URL.
   */
  poster_path?: string | null;
  /**
   * ISO date string, e.g. "2024-03-01". Only for movies.
   */
  release_date?: string;
  /**
   * ISO date string for the first episode. Only for series.
   */
  first_air_date?: string;
  /**
   * Short plot synopsis.
   */
  overview?: string;
}

/**
 * Season-level metadata returned inside a TMDB series details response.
 */
export interface TmdbSeason {
  season_number: number;
  episode_count: number;
}

/**
 * Episode-level metadata returned by the TMDB /tv/{id}/season/{n} endpoint.
 */
export interface TmdbEpisode {
  episode_number: number;
  /**
   * Duration of this episode in minutes.
   */
  runtime?: number;
  name?: string;
  /**
   * Air date in "YYYY-MM-DD" format.
   */
  air_date?: string;
  overview?: string;
}

/**
 * Full details for a TV series returned by the TMDB /tv/{id} endpoint.
 */
export interface TmdbSeriesDetails {
  seasons: TmdbSeason[];
  /**
   * Array of average episode runtimes in minutes (e.g. [42, 45]).
   */
  episode_run_time?: number[];
  genres?: { name: string }[];
  overview?: string;
  number_of_episodes?: number;
  number_of_seasons?: number;
}

/**
 * Full details for a movie returned by the TMDB /movie/{id} endpoint.
 */
export interface TmdbMovieDetails {
  runtime?: number;
  genres?: { name: string }[];
  overview?: string;
}

// ─── Google Books ─────────────────────────────────────────────────────────────

/**
 * Volume metadata nested inside a Google Books API item.
 */
export interface GoogleBooksVolumeInfo {
  title?: string;
  authors?: string[];
  /**
   * Publication date string, may be partial e.g. "2023" or "2023-06".
   */
  publishedDate?: string;
  description?: string;
  categories?: string[];
  pageCount?: number | string;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
}

/**
 * A single item returned by the Google Books volumes API.
 */
export interface GoogleBooksItem {
  /**
   * Google Books volume ID, used as `google_books_id` in the database.
   */
  id: string;
  volumeInfo: GoogleBooksVolumeInfo;
}

// ─── TheMealDB ────────────────────────────────────────────────────────────────

/**
 * A meal record from the TheMealDB API.
 * The API uses dynamic keys like `strIngredient1`…`strIngredient20`, hence the index signature.
 */
export interface MealDbMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb?: string;
  strCategory?: string;
  strArea?: string;
  strSource?: string;
  strYoutube?: string;
  strInstructions?: string;
  /**
   * Dynamic ingredient/measure keys (e.g. strIngredient1, strMeasure1, ...).
   */
  [key: string]: string | undefined;
}

// ─── OCR / AI Extraction ──────────────────────────────────────────────────────

/**
 * A single title/recipe entry extracted from an image by the OCR action.
 */
export interface OcrTitleResult {
  title?: string;
  /**
   * Media type string: "movie", "series", "book", or "recipe".
   */
  type?: string;
  status?: string;
}

/**
 * Response envelope returned by `extractTitlesFromImage`.
 */
export interface OcrResponse {
  success: boolean;
  titles?: OcrTitleResult[];
  /**
   * Human-readable error description when success is false.
   */
  error?: string;
}
