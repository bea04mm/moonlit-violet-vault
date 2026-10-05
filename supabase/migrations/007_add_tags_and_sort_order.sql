/*
  Adds custom categorization and ordering. Introduces the tags text array for custom labeling, and sort_order integer for manual drag-and-drop ordering.
*/

-- Adds support for Custom Collections (Tags) and Drag & Drop sorting

ALTER TABLE public.media_items
ADD COLUMN tags text[] DEFAULT '{}'::text[],
ADD COLUMN sort_order integer;

-- Optional: Create an index on tags if you plan to query heavily by tag in the future
CREATE INDEX idx_media_items_tags ON public.media_items USING GIN (tags);

-- Optional: Create an index on sort_order
CREATE INDEX idx_media_items_sort_order ON public.media_items (sort_order);
