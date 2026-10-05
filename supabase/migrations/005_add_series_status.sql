/*
  Adds the series_status string column. Used to track whether a TV series is Returning Series, Ended, or Canceled from TMDB.
*/

ALTER TABLE public.media_items
ADD COLUMN tmdb_status VARCHAR(50) DEFAULT NULL,
ADD COLUMN next_episode_air_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;
