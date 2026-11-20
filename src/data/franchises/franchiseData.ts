/**
 * Master franchise catalog datasets and parsers for the Moonlit Violet Vault.
 * Sourced directly from curated chronological viewing checklists.
 *
 * @packageDocumentation
 */

/**
 * Represents a single title (movie, series season, animated film, or special)
 * in a franchise's chronological viewing checklist.
 */
export interface FranchiseItem {
  /** Unique identifier for the item (e.g. "mcu-001", "dc-042"). */
  id: string
  /** Official title of the film, series season, or release. */
  title: string
  /** Human-readable release date string (e.g. "May 2, 2008"). */
  releaseDate: string
  /** Calendar year of release used for sorting and era determination. */
  year: number
  /** Media type format (e.g. "Film", "Season 1", "Animated Series"). */
  type: string
  /** Timeline phase, era, or sub-universe grouping (e.g. "Phase 1: Avengers Assembled"). */
  era: string
  /** Approximate runtime in minutes. */
  runtime: number
  /** Whether the user has marked this item as watched. */
  watched: boolean
  /** Whether this title is an unreleased upcoming project. */
  isUpcoming?: boolean
  /** Remote URL for the official poster artwork cached from TMDB. */
  coverUrl?: string | null
  /** The Movie Database (TMDB) numeric identifier for linking and metadata sync. */
  tmdbId?: number | null
}

/**
 * Represents a cinematic universe or franchise catalog entity.
 */
export interface FranchiseUniverse {
  /** Slug/identifier for the franchise (e.g. "marvel", "dc", "wizarding-world"). */
  id: string
  /** Full official title of the franchise. */
  name: string
  /** Compact display name for badges and pills. */
  shortName: string
  /** Editorial tagline or description of the universe scope. */
  tagline: string
  /** Primary hex accent color associated with the franchise brand. */
  accentColor: string
  /** Chronological array of checklist items belonging to this universe. */
  items: FranchiseItem[]
  /** Flag indicating if this franchise was dynamically created by the user. */
  isCustom?: boolean
}

/**
 * Master DC Viewing Checklist — 143 Titles across Canon, Elseworlds, Arrowverse & Animated Universes.
 */
export const DC_MASTER_ITEMS: FranchiseItem[] = [
  {
    "id": "dc-001",
    "title": "Creature Commandos",
    "releaseDate": "December 5, 2024 – January 9, 2025",
    "year": 2024,
    "type": "Max Animated Series",
    "era": "James Gunn's DCU: Chapter One - Gods and Monsters (2024–Present)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-002",
    "title": "Superman",
    "releaseDate": "July 11, 2025",
    "year": 2025,
    "type": "Film",
    "era": "James Gunn's DCU: Chapter One - Gods and Monsters (2024–Present)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-003",
    "title": "Peacemaker",
    "releaseDate": "August 21, 2025",
    "year": 2025,
    "type": "Season 2",
    "era": "James Gunn's DCU: Chapter One - Gods and Monsters (2024–Present)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-004",
    "title": "Supergirl: Woman of Tomorrow",
    "releaseDate": "June 26, 2026",
    "year": 2026,
    "type": "Film",
    "era": "James Gunn's DCU: Chapter One - Gods and Monsters (2024–Present)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "dc-005",
    "title": "Lanterns",
    "releaseDate": "August 16, 2026",
    "year": 2026,
    "type": "HBO Series S1",
    "era": "James Gunn's DCU: Chapter One - Gods and Monsters (2024–Present)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "dc-006",
    "title": "Clayface",
    "releaseDate": "October 23, 2026",
    "year": 2026,
    "type": "Film",
    "era": "James Gunn's DCU: Chapter One - Gods and Monsters (2024–Present)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "dc-007",
    "title": "Man of Tomorrow",
    "releaseDate": "July 9, 2027",
    "year": 2027,
    "type": "Film",
    "era": "James Gunn's DCU: Chapter One - Gods and Monsters (2024–Present)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "dc-008",
    "title": "The People v. Gorilla Grodd",
    "releaseDate": "Late 2027",
    "year": 2027,
    "type": "Series",
    "era": "James Gunn's DCU: Chapter One - Gods and Monsters (2024–Present)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "dc-009",
    "title": "Blue Beetle",
    "releaseDate": "2027",
    "year": 2027,
    "type": "Animated Series",
    "era": "James Gunn's DCU: Chapter One - Gods and Monsters (2024–Present)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "dc-010",
    "title": "Creature Commandos",
    "releaseDate": "2027",
    "year": 2027,
    "type": "Season 2",
    "era": "James Gunn's DCU: Chapter One - Gods and Monsters (2024–Present)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "dc-011",
    "title": "Paradise Lost",
    "releaseDate": "In Development",
    "year": 2028,
    "type": "Series",
    "era": "James Gunn's DCU: Chapter One - Gods and Monsters (2024–Present)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "dc-012",
    "title": "Booster Gold",
    "releaseDate": "In Development",
    "year": 2028,
    "type": "Series",
    "era": "James Gunn's DCU: Chapter One - Gods and Monsters (2024–Present)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "dc-013",
    "title": "Waller",
    "releaseDate": "In Development",
    "year": 2028,
    "type": "Series",
    "era": "James Gunn's DCU: Chapter One - Gods and Monsters (2024–Present)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "dc-014",
    "title": "Swamp Thing",
    "releaseDate": "In Development",
    "year": 2028,
    "type": "Film",
    "era": "James Gunn's DCU: Chapter One - Gods and Monsters (2024–Present)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "dc-015",
    "title": "The Brave and the Bold",
    "releaseDate": "In Development",
    "year": 2028,
    "type": "Film",
    "era": "James Gunn's DCU: Chapter One - Gods and Monsters (2024–Present)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "dc-016",
    "title": "The Authority",
    "releaseDate": "In Development",
    "year": 2028,
    "type": "Film",
    "era": "James Gunn's DCU: Chapter One - Gods and Monsters (2024–Present)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "dc-017",
    "title": "Teen Titans",
    "releaseDate": "In Development",
    "year": 2028,
    "type": "Film",
    "era": "James Gunn's DCU: Chapter One - Gods and Monsters (2024–Present)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "dc-018",
    "title": "Sgt. Rock",
    "releaseDate": "In Development",
    "year": 2028,
    "type": "Film",
    "era": "James Gunn's DCU: Chapter One - Gods and Monsters (2024–Present)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "dc-019",
    "title": "Mister Terrific Series",
    "releaseDate": "In Development",
    "year": 2028,
    "type": "Series",
    "era": "James Gunn's DCU: Chapter One - Gods and Monsters (2024–Present)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "dc-020",
    "title": "Untitled Wonder Woman Project",
    "releaseDate": "In Development",
    "year": 2028,
    "type": "Film/Series",
    "era": "James Gunn's DCU: Chapter One - Gods and Monsters (2024–Present)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "dc-021",
    "title": "Joker",
    "releaseDate": "October 4, 2019",
    "year": 2019,
    "type": "Film",
    "era": "DC Elseworlds & Modern Standalones (2019–Present)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-022",
    "title": "Harley Quinn",
    "releaseDate": "2019–2023",
    "year": 2019,
    "type": "Animated Series S1–S4",
    "era": "DC Elseworlds & Modern Standalones (2019–Present)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-023",
    "title": "The Batman",
    "releaseDate": "March 4, 2022",
    "year": 2022,
    "type": "Film",
    "era": "DC Elseworlds & Modern Standalones (2019–Present)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-024",
    "title": "Merry Little Batman",
    "releaseDate": "December 8, 2023",
    "year": 2023,
    "type": "Animated Film",
    "era": "DC Elseworlds & Modern Standalones (2019–Present)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-025",
    "title": "My Adventures with Superman",
    "releaseDate": "2023–2024",
    "year": 2023,
    "type": "Animated Series S1–S2",
    "era": "DC Elseworlds & Modern Standalones (2019–Present)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-026",
    "title": "Batman: Caped Crusader",
    "releaseDate": "August 1, 2024",
    "year": 2024,
    "type": "Animated Series S1",
    "era": "DC Elseworlds & Modern Standalones (2019–Present)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-027",
    "title": "Kite Man: Hell Yeah!",
    "releaseDate": "July 18, 2024",
    "year": 2024,
    "type": "Animated Series",
    "era": "DC Elseworlds & Modern Standalones (2019–Present)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-028",
    "title": "The Penguin",
    "releaseDate": "Sept 19, 2024 – Nov 10, 2024",
    "year": 2024,
    "type": "HBO Limited Series",
    "era": "DC Elseworlds & Modern Standalones (2019–Present)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-029",
    "title": "Joker: Folie à Deux",
    "releaseDate": "October 4, 2024",
    "year": 2024,
    "type": "Film",
    "era": "DC Elseworlds & Modern Standalones (2019–Present)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-030",
    "title": "The Batman Part II",
    "releaseDate": "October 2, 2026",
    "year": 2026,
    "type": "Film",
    "era": "DC Elseworlds & Modern Standalones (2019–Present)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "dc-031",
    "title": "Dynamic Duo",
    "releaseDate": "September 22, 2028",
    "year": 2028,
    "type": "Animated Film",
    "era": "DC Elseworlds & Modern Standalones (2019–Present)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "dc-032",
    "title": "Man of Steel",
    "releaseDate": "June 14, 2013",
    "year": 2013,
    "type": "Film",
    "era": "DC Extended Universe (DCEU Core Slate | 2013–2023)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-033",
    "title": "Batman v Superman: Dawn of Justice",
    "releaseDate": "March 25, 2016",
    "year": 2016,
    "type": "Film",
    "era": "DC Extended Universe (DCEU Core Slate | 2013–2023)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-034",
    "title": "Suicide Squad",
    "releaseDate": "August 5, 2016",
    "year": 2016,
    "type": "Film",
    "era": "DC Extended Universe (DCEU Core Slate | 2013–2023)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-035",
    "title": "Wonder Woman",
    "releaseDate": "June 2, 2017",
    "year": 2017,
    "type": "Film",
    "era": "DC Extended Universe (DCEU Core Slate | 2013–2023)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-036",
    "title": "Justice League",
    "releaseDate": "November 17, 2017",
    "year": 2017,
    "type": "Theatrical Film",
    "era": "DC Extended Universe (DCEU Core Slate | 2013–2023)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-037",
    "title": "Aquaman",
    "releaseDate": "December 21, 2018",
    "year": 2018,
    "type": "Film",
    "era": "DC Extended Universe (DCEU Core Slate | 2013–2023)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-038",
    "title": "Shazam!",
    "releaseDate": "April 5, 2019",
    "year": 2019,
    "type": "Film",
    "era": "DC Extended Universe (DCEU Core Slate | 2013–2023)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-039",
    "title": "Birds of Prey (and the Fantabulous Emancipation of One Harley Quinn)",
    "releaseDate": "February 7, 2020",
    "year": 2020,
    "type": "Film",
    "era": "DC Extended Universe (DCEU Core Slate | 2013–2023)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-040",
    "title": "Wonder Woman 1984",
    "releaseDate": "December 25, 2020",
    "year": 2020,
    "type": "Film",
    "era": "DC Extended Universe (DCEU Core Slate | 2013–2023)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-041",
    "title": "Zack Snyder's Justice League",
    "releaseDate": "March 18, 2021",
    "year": 2021,
    "type": "Director's Cut",
    "era": "DC Extended Universe (DCEU Core Slate | 2013–2023)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-042",
    "title": "The Suicide Squad",
    "releaseDate": "August 5, 2021",
    "year": 2021,
    "type": "Film",
    "era": "DC Extended Universe (DCEU Core Slate | 2013–2023)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-043",
    "title": "Peacemaker",
    "releaseDate": "Jan 2022 – Feb 2022",
    "year": 2022,
    "type": "Season 1",
    "era": "DC Extended Universe (DCEU Core Slate | 2013–2023)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-044",
    "title": "Black Adam",
    "releaseDate": "October 21, 2022",
    "year": 2022,
    "type": "Film",
    "era": "DC Extended Universe (DCEU Core Slate | 2013–2023)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-045",
    "title": "Shazam! Fury of the Gods",
    "releaseDate": "March 17, 2023",
    "year": 2023,
    "type": "Film",
    "era": "DC Extended Universe (DCEU Core Slate | 2013–2023)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-046",
    "title": "The Flash",
    "releaseDate": "June 16, 2023",
    "year": 2023,
    "type": "Film",
    "era": "DC Extended Universe (DCEU Core Slate | 2013–2023)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-047",
    "title": "Blue Beetle",
    "releaseDate": "August 18, 2023",
    "year": 2023,
    "type": "Film",
    "era": "DC Extended Universe (DCEU Core Slate | 2013–2023)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-048",
    "title": "Aquaman and the Lost Kingdom",
    "releaseDate": "December 22, 2023",
    "year": 2023,
    "type": "Film",
    "era": "DC Extended Universe (DCEU Core Slate | 2013–2023)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-049",
    "title": "Arrow",
    "releaseDate": "2012–2020",
    "year": 2012,
    "type": "Seasons 1–8",
    "era": "The Arrowverse & CW Multiverse (2012–2024)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-050",
    "title": "The Flash",
    "releaseDate": "2014–2023",
    "year": 2014,
    "type": "Seasons 1–9",
    "era": "The Arrowverse & CW Multiverse (2012–2024)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-051",
    "title": "Constantine",
    "releaseDate": "2014–2015",
    "year": 2014,
    "type": "Season 1",
    "era": "The Arrowverse & CW Multiverse (2012–2024)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-052",
    "title": "Vixen",
    "releaseDate": "2015–2016",
    "year": 2015,
    "type": "Animated Web Series S1–S2",
    "era": "The Arrowverse & CW Multiverse (2012–2024)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-053",
    "title": "Supergirl",
    "releaseDate": "2015–2021",
    "year": 2015,
    "type": "Seasons 1–6",
    "era": "The Arrowverse & CW Multiverse (2012–2024)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-054",
    "title": "DC's Legends of Tomorrow",
    "releaseDate": "2016–2022",
    "year": 2016,
    "type": "Seasons 1–7",
    "era": "The Arrowverse & CW Multiverse (2012–2024)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-055",
    "title": "Freedom Fighters: The Ray",
    "releaseDate": "2017–2018",
    "year": 2017,
    "type": "Animated Series",
    "era": "The Arrowverse & CW Multiverse (2012–2024)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-056",
    "title": "Black Lightning",
    "releaseDate": "2018–2021",
    "year": 2018,
    "type": "Seasons 1–4",
    "era": "The Arrowverse & CW Multiverse (2012–2024)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-057",
    "title": "Batwoman",
    "releaseDate": "2019–2022",
    "year": 2019,
    "type": "Seasons 1–3",
    "era": "The Arrowverse & CW Multiverse (2012–2024)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-058",
    "title": "DC's Stargirl",
    "releaseDate": "2020–2022",
    "year": 2020,
    "type": "Seasons 1–3",
    "era": "The Arrowverse & CW Multiverse (2012–2024)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-059",
    "title": "Superman & Lois",
    "releaseDate": "2021–2024",
    "year": 2021,
    "type": "Seasons 1–4",
    "era": "The Arrowverse & CW Multiverse (2012–2024)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-060",
    "title": "Gotham Knights",
    "releaseDate": "2023",
    "year": 2023,
    "type": "Season 1",
    "era": "The Arrowverse & CW Multiverse (2012–2024)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-061",
    "title": "Adventures of Superman",
    "releaseDate": "1952–1958",
    "year": 1952,
    "type": "Series",
    "era": "Standalone Live-Action TV & Vertigo Adaptations",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-062",
    "title": "Batman",
    "releaseDate": "1966–1968",
    "year": 1966,
    "type": "Series",
    "era": "Standalone Live-Action TV & Vertigo Adaptations",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-063",
    "title": "Wonder Woman",
    "releaseDate": "1975–1979",
    "year": 1975,
    "type": "Series",
    "era": "Standalone Live-Action TV & Vertigo Adaptations",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-064",
    "title": "Superboy",
    "releaseDate": "1988–1992",
    "year": 1988,
    "type": "Series",
    "era": "Standalone Live-Action TV & Vertigo Adaptations",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-065",
    "title": "The Flash",
    "releaseDate": "1990–1991",
    "year": 1990,
    "type": "Series",
    "era": "Standalone Live-Action TV & Vertigo Adaptations",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-066",
    "title": "Lois & Clark: The New Adventures of Superman",
    "releaseDate": "1993–1997",
    "year": 1993,
    "type": "Series",
    "era": "Standalone Live-Action TV & Vertigo Adaptations",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-067",
    "title": "Smallville",
    "releaseDate": "2001–2011",
    "year": 2001,
    "type": "Seasons 1–10",
    "era": "Standalone Live-Action TV & Vertigo Adaptations",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-068",
    "title": "Birds of Prey",
    "releaseDate": "2002–2003",
    "year": 2002,
    "type": "Series",
    "era": "Standalone Live-Action TV & Vertigo Adaptations",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-069",
    "title": "Gotham",
    "releaseDate": "2014–2019",
    "year": 2014,
    "type": "Seasons 1–5",
    "era": "Standalone Live-Action TV & Vertigo Adaptations",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-070",
    "title": "Lucifer",
    "releaseDate": "2016–2021",
    "year": 2016,
    "type": "Seasons 1–6",
    "era": "Standalone Live-Action TV & Vertigo Adaptations",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-071",
    "title": "Krypton",
    "releaseDate": "2018–2019",
    "year": 2018,
    "type": "Seasons 1–2",
    "era": "Standalone Live-Action TV & Vertigo Adaptations",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-072",
    "title": "Titans",
    "releaseDate": "2018–2023",
    "year": 2018,
    "type": "Seasons 1–4",
    "era": "Standalone Live-Action TV & Vertigo Adaptations",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-073",
    "title": "Doom Patrol",
    "releaseDate": "2019–2023",
    "year": 2019,
    "type": "Seasons 1–4",
    "era": "Standalone Live-Action TV & Vertigo Adaptations",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-074",
    "title": "Swamp Thing",
    "releaseDate": "2019",
    "year": 2019,
    "type": "Season 1",
    "era": "Standalone Live-Action TV & Vertigo Adaptations",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-075",
    "title": "Pennyworth",
    "releaseDate": "2019–2022",
    "year": 2019,
    "type": "Seasons 1–3",
    "era": "Standalone Live-Action TV & Vertigo Adaptations",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-076",
    "title": "Watchmen",
    "releaseDate": "2019",
    "year": 2019,
    "type": "HBO Limited Series",
    "era": "Standalone Live-Action TV & Vertigo Adaptations",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-077",
    "title": "Sweet Tooth",
    "releaseDate": "2021–2024",
    "year": 2021,
    "type": "Seasons 1–3",
    "era": "Standalone Live-Action TV & Vertigo Adaptations",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-078",
    "title": "The Sandman",
    "releaseDate": "2022–Present",
    "year": 2022,
    "type": "Season 1–2",
    "era": "Standalone Live-Action TV & Vertigo Adaptations",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-079",
    "title": "Dead Boy Detectives",
    "releaseDate": "2024",
    "year": 2024,
    "type": "Season 1",
    "era": "Standalone Live-Action TV & Vertigo Adaptations",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-080",
    "title": "Batman: The Movie",
    "releaseDate": "July 30, 1966",
    "year": 1966,
    "type": "Film",
    "era": "Classic Legacy Era Film Franchises (1966–2012) — Batman & Superman Classic Film Legacies",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-081",
    "title": "Superman: The Movie",
    "releaseDate": "December 15, 1978",
    "year": 1978,
    "type": "Film",
    "era": "Classic Legacy Era Film Franchises (1966–2012) — Batman & Superman Classic Film Legacies",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-082",
    "title": "Superman II",
    "releaseDate": "June 19, 1981 / Richard Donner Cut 2006",
    "year": 1981,
    "type": "Film",
    "era": "Classic Legacy Era Film Franchises (1966–2012) — Batman & Superman Classic Film Legacies",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-083",
    "title": "Superman III",
    "releaseDate": "June 17, 1983",
    "year": 1983,
    "type": "Film",
    "era": "Classic Legacy Era Film Franchises (1966–2012) — Batman & Superman Classic Film Legacies",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-084",
    "title": "Supergirl",
    "releaseDate": "November 21, 1984",
    "year": 1984,
    "type": "Film",
    "era": "Classic Legacy Era Film Franchises (1966–2012) — Batman & Superman Classic Film Legacies",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-085",
    "title": "Superman IV: The Quest for Peace",
    "releaseDate": "July 24, 1987",
    "year": 1987,
    "type": "Film",
    "era": "Classic Legacy Era Film Franchises (1966–2012) — Batman & Superman Classic Film Legacies",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-086",
    "title": "Batman",
    "releaseDate": "June 23, 1989",
    "year": 1989,
    "type": "Film",
    "era": "Classic Legacy Era Film Franchises (1966–2012) — Batman & Superman Classic Film Legacies",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-087",
    "title": "Batman Returns",
    "releaseDate": "June 19, 1992",
    "year": 1992,
    "type": "Film",
    "era": "Classic Legacy Era Film Franchises (1966–2012) — Batman & Superman Classic Film Legacies",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-088",
    "title": "Batman Forever",
    "releaseDate": "June 16, 1995",
    "year": 1995,
    "type": "Film",
    "era": "Classic Legacy Era Film Franchises (1966–2012) — Batman & Superman Classic Film Legacies",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-089",
    "title": "Batman & Robin",
    "releaseDate": "June 20, 1997",
    "year": 1997,
    "type": "Film",
    "era": "Classic Legacy Era Film Franchises (1966–2012) — Batman & Superman Classic Film Legacies",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-090",
    "title": "Superman Returns",
    "releaseDate": "June 28, 2006",
    "year": 2006,
    "type": "Film",
    "era": "Classic Legacy Era Film Franchises (1966–2012) — Batman & Superman Classic Film Legacies",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-091",
    "title": "Batman Begins",
    "releaseDate": "June 15, 2005",
    "year": 2005,
    "type": "Film",
    "era": "Classic Legacy Era Film Franchises (1966–2012) — Christopher Nolan's Dark Knight Trilogy",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-092",
    "title": "The Dark Knight",
    "releaseDate": "July 18, 2008",
    "year": 2008,
    "type": "Film",
    "era": "Classic Legacy Era Film Franchises (1966–2012) — Christopher Nolan's Dark Knight Trilogy",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-093",
    "title": "The Dark Knight Rises",
    "releaseDate": "July 20, 2012",
    "year": 2012,
    "type": "Film",
    "era": "Classic Legacy Era Film Franchises (1966–2012) — Christopher Nolan's Dark Knight Trilogy",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-094",
    "title": "Steel",
    "releaseDate": "August 15, 1997",
    "year": 1997,
    "type": "Film",
    "era": "Classic Legacy Era Film Franchises (1966–2012) — Standalone Legacy Live-Action Films",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-095",
    "title": "Catwoman",
    "releaseDate": "July 23, 2004",
    "year": 2004,
    "type": "Film",
    "era": "Classic Legacy Era Film Franchises (1966–2012) — Standalone Legacy Live-Action Films",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-096",
    "title": "Constantine",
    "releaseDate": "February 18, 2005",
    "year": 2005,
    "type": "Film",
    "era": "Classic Legacy Era Film Franchises (1966–2012) — Standalone Legacy Live-Action Films",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-097",
    "title": "V for Vendetta",
    "releaseDate": "March 17, 2006",
    "year": 2006,
    "type": "Film",
    "era": "Classic Legacy Era Film Franchises (1966–2012) — Standalone Legacy Live-Action Films",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-098",
    "title": "Watchmen",
    "releaseDate": "March 6, 2009",
    "year": 2009,
    "type": "Film",
    "era": "Classic Legacy Era Film Franchises (1966–2012) — Standalone Legacy Live-Action Films",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-099",
    "title": "Jonah Hex",
    "releaseDate": "June 18, 2010",
    "year": 2010,
    "type": "Film",
    "era": "Classic Legacy Era Film Franchises (1966–2012) — Standalone Legacy Live-Action Films",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-100",
    "title": "Green Lantern",
    "releaseDate": "June 17, 2011",
    "year": 2011,
    "type": "Film",
    "era": "Classic Legacy Era Film Franchises (1966–2012) — Standalone Legacy Live-Action Films",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-101",
    "title": "Batman: The Animated Series",
    "releaseDate": "1992–1995",
    "year": 1992,
    "type": "Series",
    "era": "DC Animated Universes & Classics — DC Animated Universe (DCAU / Timmverse)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-102",
    "title": "Batman: Mask of the Phantasm",
    "releaseDate": "Dec 25, 1993",
    "year": 1993,
    "type": "Animated Film",
    "era": "DC Animated Universes & Classics — DC Animated Universe (DCAU / Timmverse)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-103",
    "title": "Superman: The Animated Series",
    "releaseDate": "1996–2000",
    "year": 1996,
    "type": "Series",
    "era": "DC Animated Universes & Classics — DC Animated Universe (DCAU / Timmverse)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-104",
    "title": "Batman & Mr. Freeze: SubZero",
    "releaseDate": "March 17, 1998",
    "year": 1998,
    "type": "Animated Film",
    "era": "DC Animated Universes & Classics — DC Animated Universe (DCAU / Timmverse)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-105",
    "title": "The New Batman Adventures",
    "releaseDate": "1997–1999",
    "year": 1997,
    "type": "Series",
    "era": "DC Animated Universes & Classics — DC Animated Universe (DCAU / Timmverse)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-106",
    "title": "Batman Beyond",
    "releaseDate": "1999–2001",
    "year": 1999,
    "type": "Series",
    "era": "DC Animated Universes & Classics — DC Animated Universe (DCAU / Timmverse)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-107",
    "title": "Batman Beyond: Return of the Joker",
    "releaseDate": "Dec 12, 2000",
    "year": 2000,
    "type": "Animated Film",
    "era": "DC Animated Universes & Classics — DC Animated Universe (DCAU / Timmverse)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-108",
    "title": "Static Shock",
    "releaseDate": "2000–2004",
    "year": 2000,
    "type": "Series",
    "era": "DC Animated Universes & Classics — DC Animated Universe (DCAU / Timmverse)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-109",
    "title": "The Zeta Project",
    "releaseDate": "2001–2002",
    "year": 2001,
    "type": "Series",
    "era": "DC Animated Universes & Classics — DC Animated Universe (DCAU / Timmverse)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-110",
    "title": "Justice League",
    "releaseDate": "2001–2004",
    "year": 2001,
    "type": "Series",
    "era": "DC Animated Universes & Classics — DC Animated Universe (DCAU / Timmverse)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-111",
    "title": "Justice League Unlimited",
    "releaseDate": "2004–2006",
    "year": 2004,
    "type": "Series",
    "era": "DC Animated Universes & Classics — DC Animated Universe (DCAU / Timmverse)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-112",
    "title": "Batman and Harley Quinn",
    "releaseDate": "August 14, 2017",
    "year": 2017,
    "type": "Animated Film",
    "era": "DC Animated Universes & Classics — DC Animated Universe (DCAU / Timmverse)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-113",
    "title": "Justice League vs. the Fatal Five",
    "releaseDate": "March 30, 2019",
    "year": 2019,
    "type": "Animated Film",
    "era": "DC Animated Universes & Classics — DC Animated Universe (DCAU / Timmverse)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-114",
    "title": "Justice League: The Flashpoint Paradox",
    "releaseDate": "2013",
    "year": 2013,
    "type": "Film",
    "era": "DC Animated Universes & Classics — DC Animated Movie Universe (DCAMU | 2013–2020)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-115",
    "title": "Justice League: War",
    "releaseDate": "2014",
    "year": 2014,
    "type": "Film",
    "era": "DC Animated Universes & Classics — DC Animated Movie Universe (DCAMU | 2013–2020)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-116",
    "title": "Son of Batman",
    "releaseDate": "2014",
    "year": 2014,
    "type": "Film",
    "era": "DC Animated Universes & Classics — DC Animated Movie Universe (DCAMU | 2013–2020)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-117",
    "title": "Justice League: Throne of Atlantis",
    "releaseDate": "2015",
    "year": 2015,
    "type": "Film",
    "era": "DC Animated Universes & Classics — DC Animated Movie Universe (DCAMU | 2013–2020)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-118",
    "title": "Batman vs. Robin",
    "releaseDate": "2015",
    "year": 2015,
    "type": "Film",
    "era": "DC Animated Universes & Classics — DC Animated Movie Universe (DCAMU | 2013–2020)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-119",
    "title": "Batman: Bad Blood",
    "releaseDate": "2016",
    "year": 2016,
    "type": "Film",
    "era": "DC Animated Universes & Classics — DC Animated Movie Universe (DCAMU | 2013–2020)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-120",
    "title": "Justice League vs. Teen Titans",
    "releaseDate": "2016",
    "year": 2016,
    "type": "Film",
    "era": "DC Animated Universes & Classics — DC Animated Movie Universe (DCAMU | 2013–2020)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-121",
    "title": "Batman: Bad Blood",
    "releaseDate": "2016",
    "year": 2016,
    "type": "Film",
    "era": "DC Animated Universes & Classics — DC Animated Movie Universe (DCAMU | 2013–2020)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-122",
    "title": "Justice League Dark",
    "releaseDate": "2017",
    "year": 2017,
    "type": "Film",
    "era": "DC Animated Universes & Classics — DC Animated Movie Universe (DCAMU | 2013–2020)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-123",
    "title": "Teen Titans: The Judas Contract",
    "releaseDate": "2017",
    "year": 2017,
    "type": "Film",
    "era": "DC Animated Universes & Classics — DC Animated Movie Universe (DCAMU | 2013–2020)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-124",
    "title": "Suicide Squad: Hell to Pay",
    "releaseDate": "2018",
    "year": 2018,
    "type": "Film",
    "era": "DC Animated Universes & Classics — DC Animated Movie Universe (DCAMU | 2013–2020)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-125",
    "title": "The Death of Superman",
    "releaseDate": "2018",
    "year": 2018,
    "type": "Film",
    "era": "DC Animated Universes & Classics — DC Animated Movie Universe (DCAMU | 2013–2020)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-126",
    "title": "Reign of the Supermen",
    "releaseDate": "2019",
    "year": 2019,
    "type": "Film",
    "era": "DC Animated Universes & Classics — DC Animated Movie Universe (DCAMU | 2013–2020)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-127",
    "title": "Batman: Hush",
    "releaseDate": "2019",
    "year": 2019,
    "type": "Film",
    "era": "DC Animated Universes & Classics — DC Animated Movie Universe (DCAMU | 2013–2020)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-128",
    "title": "Wonder Woman: Bloodlines",
    "releaseDate": "2019",
    "year": 2019,
    "type": "Film",
    "era": "DC Animated Universes & Classics — DC Animated Movie Universe (DCAMU | 2013–2020)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-129",
    "title": "Justice League Dark: Apokolips War",
    "releaseDate": "2020",
    "year": 2020,
    "type": "Film",
    "era": "DC Animated Universes & Classics — DC Animated Movie Universe (DCAMU | 2013–2020)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-130",
    "title": "Superman: Man of Tomorrow",
    "releaseDate": "2020",
    "year": 2020,
    "type": "Film",
    "era": "DC Animated Universes & Classics — Tomorrowverse Era (2020–2024)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-131",
    "title": "Justice Society: World War II",
    "releaseDate": "2021",
    "year": 2021,
    "type": "Film",
    "era": "DC Animated Universes & Classics — Tomorrowverse Era (2020–2024)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-132",
    "title": "Batman: The Long Halloween (Parts 1 & 2)",
    "releaseDate": "2021",
    "year": 2021,
    "type": "Film",
    "era": "DC Animated Universes & Classics — Tomorrowverse Era (2020–2024)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-133",
    "title": "Green Lantern: Beware My Power",
    "releaseDate": "2022",
    "year": 2022,
    "type": "Film",
    "era": "DC Animated Universes & Classics — Tomorrowverse Era (2020–2024)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-134",
    "title": "Legion of Super-Heroes",
    "releaseDate": "2023",
    "year": 2023,
    "type": "Film",
    "era": "DC Animated Universes & Classics — Tomorrowverse Era (2020–2024)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-135",
    "title": "Justice League: Crisis on Infinite Earths (Parts 1, 2, & 3)",
    "releaseDate": "2024",
    "year": 2024,
    "type": "Film",
    "era": "DC Animated Universes & Classics — Tomorrowverse Era (2020–2024)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-136",
    "title": "Teen Titans",
    "releaseDate": "2003–2006",
    "year": 2003,
    "type": "Series",
    "era": "DC Animated Universes & Classics — Fan-Favorite Standalone Animated Classics",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-137",
    "title": "The Batman",
    "releaseDate": "2004–2008",
    "year": 2004,
    "type": "Series",
    "era": "DC Animated Universes & Classics — Fan-Favorite Standalone Animated Classics",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-138",
    "title": "Batman: Under the Red Hood",
    "releaseDate": "July 27, 2010",
    "year": 2010,
    "type": "Animated Film",
    "era": "DC Animated Universes & Classics — Fan-Favorite Standalone Animated Classics",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-139",
    "title": "Young Justice",
    "releaseDate": "2010–2022",
    "year": 2010,
    "type": "Seasons 1–4",
    "era": "DC Animated Universes & Classics — Fan-Favorite Standalone Animated Classics",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-140",
    "title": "Batman: Year One",
    "releaseDate": "October 18, 2011",
    "year": 2011,
    "type": "Animated Film",
    "era": "DC Animated Universes & Classics — Fan-Favorite Standalone Animated Classics",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-141",
    "title": "Batman: The Dark Knight Returns (Parts 1 & 2)",
    "releaseDate": "2012–2013",
    "year": 2012,
    "type": "Film",
    "era": "DC Animated Universes & Classics — Fan-Favorite Standalone Animated Classics",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-142",
    "title": "The Lego Batman Movie",
    "releaseDate": "February 10, 2017",
    "year": 2017,
    "type": "Animated Film",
    "era": "DC Animated Universes & Classics — Fan-Favorite Standalone Animated Classics",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "dc-143",
    "title": "DC League of Super-Pets",
    "releaseDate": "July 29, 2022",
    "year": 2022,
    "type": "Animated Film",
    "era": "DC Animated Universes & Classics — Fan-Favorite Standalone Animated Classics",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  }
]

/**
 * Master Marvel Viewing Checklist — 167 Titles across MCU, SSU, X-Men Multiverse & Animated Icons.
 */
export const MARVEL_MASTER_ITEMS: FranchiseItem[] = [
  {
    "id": "marvel-001",
    "title": "Iron Man",
    "releaseDate": "May 2, 2008",
    "year": 2008,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 1: Avengers Assembled (2008–2012)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-002",
    "title": "The Incredible Hulk",
    "releaseDate": "June 13, 2008",
    "year": 2008,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 1: Avengers Assembled (2008–2012)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-003",
    "title": "Iron Man 2",
    "releaseDate": "May 7, 2010",
    "year": 2010,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 1: Avengers Assembled (2008–2012)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-004",
    "title": "Thor",
    "releaseDate": "May 6, 2011",
    "year": 2011,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 1: Avengers Assembled (2008–2012)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-005",
    "title": "Captain America: The First Avenger",
    "releaseDate": "July 22, 2011",
    "year": 2011,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 1: Avengers Assembled (2008–2012)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-006",
    "title": "Marvel One-Shot: The Consultant",
    "releaseDate": "September 13, 2011",
    "year": 2011,
    "type": "Short",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 1: Avengers Assembled (2008–2012)",
    "runtime": 15,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-007",
    "title": "Marvel One-Shot: A Funny Thing Happened on the Way to Thor's Hammer",
    "releaseDate": "October 25, 2011",
    "year": 2011,
    "type": "Short",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 1: Avengers Assembled (2008–2012)",
    "runtime": 15,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-008",
    "title": "The Avengers",
    "releaseDate": "May 4, 2012",
    "year": 2012,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 1: Avengers Assembled (2008–2012)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-009",
    "title": "Marvel One-Shot: Item 47",
    "releaseDate": "September 25, 2012",
    "year": 2012,
    "type": "Short",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 1: Avengers Assembled (2008–2012)",
    "runtime": 15,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-010",
    "title": "Iron Man 3",
    "releaseDate": "May 3, 2013",
    "year": 2013,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 2: Cosmic Expansion & Hydra's Shadow (2013–2015)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-011",
    "title": "Marvel One-Shot: Agent Carter",
    "releaseDate": "September 3, 2013",
    "year": 2013,
    "type": "Short",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 2: Cosmic Expansion & Hydra's Shadow (2013–2015)",
    "runtime": 15,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-012",
    "title": "Agents of S.H.I.E.L.D.",
    "releaseDate": "Sept 2013 – May 2014",
    "year": 2013,
    "type": "Season 1",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 2: Cosmic Expansion & Hydra's Shadow (2013–2015)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-013",
    "title": "Thor: The Dark World",
    "releaseDate": "November 8, 2013",
    "year": 2013,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 2: Cosmic Expansion & Hydra's Shadow (2013–2015)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-014",
    "title": "Marvel One-Shot: All Hail the King",
    "releaseDate": "February 4, 2014",
    "year": 2014,
    "type": "Short",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 2: Cosmic Expansion & Hydra's Shadow (2013–2015)",
    "runtime": 15,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-015",
    "title": "Captain America: The Winter Soldier",
    "releaseDate": "April 4, 2014",
    "year": 2014,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 2: Cosmic Expansion & Hydra's Shadow (2013–2015)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-016",
    "title": "Guardians of the Galaxy",
    "releaseDate": "August 1, 2014",
    "year": 2014,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 2: Cosmic Expansion & Hydra's Shadow (2013–2015)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-017",
    "title": "Agents of S.H.I.E.L.D.",
    "releaseDate": "Sept 2014 – May 2015",
    "year": 2014,
    "type": "Season 2",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 2: Cosmic Expansion & Hydra's Shadow (2013–2015)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-018",
    "title": "Agent Carter",
    "releaseDate": "Jan 2015 – Feb 2015",
    "year": 2015,
    "type": "Season 1",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 2: Cosmic Expansion & Hydra's Shadow (2013–2015)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-019",
    "title": "Daredevil",
    "releaseDate": "April 10, 2015",
    "year": 2015,
    "type": "Season 1",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 2: Cosmic Expansion & Hydra's Shadow (2013–2015)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-020",
    "title": "Avengers: Age of Ultron",
    "releaseDate": "May 1, 2015",
    "year": 2015,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 2: Cosmic Expansion & Hydra's Shadow (2013–2015)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-021",
    "title": "WHIH Newsfront",
    "releaseDate": "July 2015",
    "year": 2015,
    "type": "Season 1 Promo Web Series",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 2: Cosmic Expansion & Hydra's Shadow (2013–2015)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-022",
    "title": "Ant-Man",
    "releaseDate": "July 17, 2015",
    "year": 2015,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 2: Cosmic Expansion & Hydra's Shadow (2013–2015)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-023",
    "title": "Agents of S.H.I.E.L.D.",
    "releaseDate": "Sept 2015 – May 2016",
    "year": 2015,
    "type": "Season 3",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-024",
    "title": "Jessica Jones",
    "releaseDate": "November 20, 2015",
    "year": 2015,
    "type": "Season 1",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-025",
    "title": "Agent Carter",
    "releaseDate": "Jan 2016 – March 2016",
    "year": 2016,
    "type": "Season 2",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-026",
    "title": "Daredevil",
    "releaseDate": "March 18, 2016",
    "year": 2016,
    "type": "Season 2",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-027",
    "title": "WHIH Newsfront",
    "releaseDate": "April 2016",
    "year": 2016,
    "type": "Season 2 Promo Web Series",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-028",
    "title": "Captain America: Civil War",
    "releaseDate": "May 6, 2016",
    "year": 2016,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-029",
    "title": "Team Thor: Part 1",
    "releaseDate": "August 28, 2016",
    "year": 2016,
    "type": "Mockumentary Short",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 15,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-030",
    "title": "Agents of S.H.I.E.L.D.",
    "releaseDate": "Sept 2016 – May 2017",
    "year": 2016,
    "type": "Season 4",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-031",
    "title": "Luke Cage",
    "releaseDate": "September 30, 2016",
    "year": 2016,
    "type": "Season 1",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-032",
    "title": "Doctor Strange",
    "releaseDate": "November 4, 2016",
    "year": 2016,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-033",
    "title": "Agents of S.H.I.E.L.D.: Slingshot",
    "releaseDate": "December 13, 2016",
    "year": 2016,
    "type": "Web Series",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-034",
    "title": "Team Thor: Part 2",
    "releaseDate": "February 14, 2017",
    "year": 2017,
    "type": "Mockumentary Short",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 15,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-035",
    "title": "Iron Fist",
    "releaseDate": "March 17, 2017",
    "year": 2017,
    "type": "Season 1",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-036",
    "title": "Guardians of the Galaxy Vol. 2",
    "releaseDate": "May 5, 2017",
    "year": 2017,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-037",
    "title": "Spider-Man: Homecoming",
    "releaseDate": "July 7, 2017",
    "year": 2017,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-038",
    "title": "The Defenders",
    "releaseDate": "August 18, 2017",
    "year": 2017,
    "type": "Limited Series",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-039",
    "title": "Inhumans",
    "releaseDate": "Sept 2017 – Nov 2017",
    "year": 2017,
    "type": "Season 1",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-040",
    "title": "Thor: Ragnarok",
    "releaseDate": "November 3, 2017",
    "year": 2017,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-041",
    "title": "The Punisher",
    "releaseDate": "November 17, 2017",
    "year": 2017,
    "type": "Season 1",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-042",
    "title": "Runaways",
    "releaseDate": "Nov 2017 – Jan 2018",
    "year": 2017,
    "type": "Season 1",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-043",
    "title": "Agents of S.H.I.E.L.D.",
    "releaseDate": "Dec 2017 – May 2018",
    "year": 2017,
    "type": "Season 5",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-044",
    "title": "Black Panther",
    "releaseDate": "February 16, 2018",
    "year": 2018,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-045",
    "title": "Team Darryl",
    "releaseDate": "February 20, 2018",
    "year": 2018,
    "type": "Mockumentary Short",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 15,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-046",
    "title": "Jessica Jones",
    "releaseDate": "March 8, 2018",
    "year": 2018,
    "type": "Season 2",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-047",
    "title": "Avengers: Infinity War",
    "releaseDate": "April 27, 2018",
    "year": 2018,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-048",
    "title": "Cloak & Dagger",
    "releaseDate": "June 2018 – Aug 2018",
    "year": 2018,
    "type": "Season 1",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-049",
    "title": "Luke Cage",
    "releaseDate": "June 22, 2018",
    "year": 2018,
    "type": "Season 2",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-050",
    "title": "Ant-Man and the Wasp",
    "releaseDate": "July 6, 2018",
    "year": 2018,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-051",
    "title": "Iron Fist",
    "releaseDate": "September 7, 2018",
    "year": 2018,
    "type": "Season 2",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-052",
    "title": "Daredevil",
    "releaseDate": "October 19, 2018",
    "year": 2018,
    "type": "Season 3",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-053",
    "title": "Runaways",
    "releaseDate": "December 21, 2018",
    "year": 2018,
    "type": "Season 2",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-054",
    "title": "The Punisher",
    "releaseDate": "January 18, 2019",
    "year": 2019,
    "type": "Season 2",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-055",
    "title": "Captain Marvel",
    "releaseDate": "March 8, 2019",
    "year": 2019,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-056",
    "title": "Cloak & Dagger",
    "releaseDate": "April 2019 – May 2019",
    "year": 2019,
    "type": "Season 2",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-057",
    "title": "Avengers: Endgame",
    "releaseDate": "April 26, 2019",
    "year": 2019,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-058",
    "title": "Agents of S.H.I.E.L.D.",
    "releaseDate": "May 2019 – Aug 2019",
    "year": 2019,
    "type": "Season 6",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-059",
    "title": "Jessica Jones",
    "releaseDate": "June 14, 2019",
    "year": 2019,
    "type": "Season 3",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-060",
    "title": "Peter's To-Do List",
    "releaseDate": "July 2019",
    "year": 2019,
    "type": "Short Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 15,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-061",
    "title": "Spider-Man: Far From Home",
    "releaseDate": "July 2, 2019",
    "year": 2019,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-062",
    "title": "The Daily Bugle",
    "releaseDate": "Sept 2019 – March 2022",
    "year": 2019,
    "type": "Web Series",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-063",
    "title": "Runaways",
    "releaseDate": "December 13, 2019",
    "year": 2019,
    "type": "Season 3",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-064",
    "title": "Agents of S.H.I.E.L.D.",
    "releaseDate": "May 2020 – Aug 2020",
    "year": 2020,
    "type": "Season 7",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-065",
    "title": "Helstrom",
    "releaseDate": "October 16, 2020",
    "year": 2020,
    "type": "Season 1",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 3: Civil War & The Infinity Saga Finale (2015–2019)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-066",
    "title": "WandaVision",
    "releaseDate": "Jan 2021 – March 2021",
    "year": 2021,
    "type": "Disney+ Series",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 4: The Multiverse Unleashed (2021–2022)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-067",
    "title": "The Falcon and the Winter Soldier",
    "releaseDate": "March 2021 – April 2021",
    "year": 2021,
    "type": "Disney+ Series",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 4: The Multiverse Unleashed (2021–2022)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-068",
    "title": "Loki",
    "releaseDate": "June 2021 – July 2021",
    "year": 2021,
    "type": "Season 1",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 4: The Multiverse Unleashed (2021–2022)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-069",
    "title": "Black Widow",
    "releaseDate": "July 9, 2021",
    "year": 2021,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 4: The Multiverse Unleashed (2021–2022)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-070",
    "title": "What If...?",
    "releaseDate": "Aug 2021 – Oct 2021",
    "year": 2021,
    "type": "Season 1",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 4: The Multiverse Unleashed (2021–2022)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-071",
    "title": "Shang-Chi and the Legend of the Ten Rings",
    "releaseDate": "September 3, 2021",
    "year": 2021,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 4: The Multiverse Unleashed (2021–2022)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-072",
    "title": "Eternals",
    "releaseDate": "November 5, 2021",
    "year": 2021,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 4: The Multiverse Unleashed (2021–2022)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-073",
    "title": "Hawkeye",
    "releaseDate": "Nov 2021 – Dec 2021",
    "year": 2021,
    "type": "Disney+ Series",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 4: The Multiverse Unleashed (2021–2022)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-074",
    "title": "Spider-Man: No Way Home",
    "releaseDate": "December 17, 2021",
    "year": 2021,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 4: The Multiverse Unleashed (2021–2022)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-075",
    "title": "Moon Knight",
    "releaseDate": "March 2022 – May 2022",
    "year": 2022,
    "type": "Disney+ Series",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 4: The Multiverse Unleashed (2021–2022)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-076",
    "title": "Doctor Strange in the Multiverse of Madness",
    "releaseDate": "May 6, 2022",
    "year": 2022,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 4: The Multiverse Unleashed (2021–2022)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-077",
    "title": "Ms. Marvel",
    "releaseDate": "June 2022 – July 2022",
    "year": 2022,
    "type": "Disney+ Series",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 4: The Multiverse Unleashed (2021–2022)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-078",
    "title": "Thor: Love and Thunder",
    "releaseDate": "July 8, 2022",
    "year": 2022,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 4: The Multiverse Unleashed (2021–2022)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-079",
    "title": "I Am Groot",
    "releaseDate": "August 10, 2022",
    "year": 2022,
    "type": "Season 1 Shorts",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 4: The Multiverse Unleashed (2021–2022)",
    "runtime": 15,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-080",
    "title": "She-Hulk: Attorney at Law",
    "releaseDate": "Aug 2022 – Oct 2022",
    "year": 2022,
    "type": "Disney+ Series",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 4: The Multiverse Unleashed (2021–2022)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-081",
    "title": "Werewolf by Night",
    "releaseDate": "October 7, 2022",
    "year": 2022,
    "type": "Special Presentation",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 4: The Multiverse Unleashed (2021–2022)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-082",
    "title": "Black Panther: Wakanda Forever",
    "releaseDate": "November 11, 2022",
    "year": 2022,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 4: The Multiverse Unleashed (2021–2022)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-083",
    "title": "The Guardians of the Galaxy Holiday Special",
    "releaseDate": "November 25, 2022",
    "year": 2022,
    "type": "Special Presentation",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 4: The Multiverse Unleashed (2021–2022)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-084",
    "title": "Ant-Man and the Wasp: Quantumania",
    "releaseDate": "February 17, 2023",
    "year": 2023,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 5: Dynasties & Incursions (2023–2025)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-085",
    "title": "Guardians of the Galaxy Vol. 3",
    "releaseDate": "May 5, 2023",
    "year": 2023,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 5: Dynasties & Incursions (2023–2025)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-086",
    "title": "Secret Invasion",
    "releaseDate": "June 2023 – July 2023",
    "year": 2023,
    "type": "Disney+ Series",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 5: Dynasties & Incursions (2023–2025)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-087",
    "title": "I Am Groot",
    "releaseDate": "September 6, 2023",
    "year": 2023,
    "type": "Season 2 Shorts",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 5: Dynasties & Incursions (2023–2025)",
    "runtime": 15,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-088",
    "title": "Werewolf by Night in Color",
    "releaseDate": "October 20, 2023",
    "year": 2023,
    "type": "Special Presentation",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 5: Dynasties & Incursions (2023–2025)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-089",
    "title": "Loki",
    "releaseDate": "Oct 2023 – Nov 2023",
    "year": 2023,
    "type": "Season 2",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 5: Dynasties & Incursions (2023–2025)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-090",
    "title": "The Marvels",
    "releaseDate": "November 10, 2023",
    "year": 2023,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 5: Dynasties & Incursions (2023–2025)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-091",
    "title": "What If...?",
    "releaseDate": "Dec 2023",
    "year": 2023,
    "type": "Season 2",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 5: Dynasties & Incursions (2023–2025)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-092",
    "title": "Echo",
    "releaseDate": "January 9, 2024",
    "year": 2024,
    "type": "Disney+ Series",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 5: Dynasties & Incursions (2023–2025)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-093",
    "title": "Deadpool & Wolverine",
    "releaseDate": "July 26, 2024",
    "year": 2024,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 5: Dynasties & Incursions (2023–2025)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-094",
    "title": "Agatha All Along",
    "releaseDate": "Sept 2024 – Oct 2024",
    "year": 2024,
    "type": "Disney+ Series",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 5: Dynasties & Incursions (2023–2025)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-095",
    "title": "What If...?",
    "releaseDate": "December 22, 2024",
    "year": 2024,
    "type": "Season 3",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 5: Dynasties & Incursions (2023–2025)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-096",
    "title": "Your Friendly Neighborhood Spider-Man",
    "releaseDate": "January 29, 2025",
    "year": 2025,
    "type": "Season 1",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 5: Dynasties & Incursions (2023–2025)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-097",
    "title": "Captain America: Brave New World",
    "releaseDate": "February 14, 2025",
    "year": 2025,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 5: Dynasties & Incursions (2023–2025)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-098",
    "title": "Daredevil: Born Again",
    "releaseDate": "March 4, 2025",
    "year": 2025,
    "type": "Season 1",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 5: Dynasties & Incursions (2023–2025)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-099",
    "title": "Thunderbolts*",
    "releaseDate": "May 2, 2025",
    "year": 2025,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 5: Dynasties & Incursions (2023–2025)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-100",
    "title": "Ironheart",
    "releaseDate": "June 24, 2025",
    "year": 2025,
    "type": "Disney+ Series",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 5: Dynasties & Incursions (2023–2025)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-101",
    "title": "The Fantastic Four: First Steps",
    "releaseDate": "July 25, 2025",
    "year": 2025,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 6 & Multiverse Saga Slate (2025–2028+)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-102",
    "title": "Eyes of Wakanda",
    "releaseDate": "August 6, 2025",
    "year": 2025,
    "type": "Animated Series",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 6 & Multiverse Saga Slate (2025–2028+)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-103",
    "title": "Marvel Zombies",
    "releaseDate": "October 2025",
    "year": 2025,
    "type": "Animated Series",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 6 & Multiverse Saga Slate (2025–2028+)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-104",
    "title": "Wonder Man",
    "releaseDate": "January 2026",
    "year": 2026,
    "type": "Disney+ Series",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 6 & Multiverse Saga Slate (2025–2028+)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "marvel-105",
    "title": "Daredevil: Born Again",
    "releaseDate": "March 2026",
    "year": 2026,
    "type": "Season 2",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 6 & Multiverse Saga Slate (2025–2028+)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "marvel-106",
    "title": "Spider-Man: Brand New Day",
    "releaseDate": "July 31, 2026",
    "year": 2026,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 6 & Multiverse Saga Slate (2025–2028+)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "marvel-107",
    "title": "VisionQuest",
    "releaseDate": "October 2026",
    "year": 2026,
    "type": "Disney+ Series",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 6 & Multiverse Saga Slate (2025–2028+)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "marvel-108",
    "title": "Avengers: Doomsday",
    "releaseDate": "December 18, 2026",
    "year": 2026,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 6 & Multiverse Saga Slate (2025–2028+)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "marvel-109",
    "title": "Your Friendly Neighborhood Spider-Man",
    "releaseDate": "Early 2027",
    "year": 2027,
    "type": "Season 2",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 6 & Multiverse Saga Slate (2025–2028+)",
    "runtime": 300,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "marvel-110",
    "title": "Avengers: Secret Wars",
    "releaseDate": "December 17, 2027",
    "year": 2027,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 6 & Multiverse Saga Slate (2025–2028+)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "marvel-111",
    "title": "Armor Wars",
    "releaseDate": "In Development",
    "year": 2028,
    "type": "Film / Project",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 6 & Multiverse Saga Slate (2025–2028+)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "marvel-112",
    "title": "Blade",
    "releaseDate": "In Development",
    "year": 2028,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 6 & Multiverse Saga Slate (2025–2028+)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "marvel-113",
    "title": "X-Men Reboot Film",
    "releaseDate": "In Development",
    "year": 2028,
    "type": "Film",
    "era": "Marvel Cinematic Universe (MCU) Mainline Canon — Phase 6 & Multiverse Saga Slate (2025–2028+)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "marvel-114",
    "title": "Venom",
    "releaseDate": "October 5, 2018",
    "year": 2018,
    "type": "Film",
    "era": "Sony's Spider-Man Universe & Spider-Verse (Multiverse Canon) — Sony's Live-Action Universe (SSU)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-115",
    "title": "Venom: Let There Be Carnage",
    "releaseDate": "October 1, 2021",
    "year": 2021,
    "type": "Film",
    "era": "Sony's Spider-Man Universe & Spider-Verse (Multiverse Canon) — Sony's Live-Action Universe (SSU)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-116",
    "title": "Morbius",
    "releaseDate": "April 1, 2022",
    "year": 2022,
    "type": "Film",
    "era": "Sony's Spider-Man Universe & Spider-Verse (Multiverse Canon) — Sony's Live-Action Universe (SSU)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-117",
    "title": "Madame Web",
    "releaseDate": "February 14, 2024",
    "year": 2024,
    "type": "Film",
    "era": "Sony's Spider-Man Universe & Spider-Verse (Multiverse Canon) — Sony's Live-Action Universe (SSU)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-118",
    "title": "Venom: The Last Dance",
    "releaseDate": "October 25, 2024",
    "year": 2024,
    "type": "Film",
    "era": "Sony's Spider-Man Universe & Spider-Verse (Multiverse Canon) — Sony's Live-Action Universe (SSU)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-119",
    "title": "Kraven the Hunter",
    "releaseDate": "December 13, 2024",
    "year": 2024,
    "type": "Film",
    "era": "Sony's Spider-Man Universe & Spider-Verse (Multiverse Canon) — Sony's Live-Action Universe (SSU)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-120",
    "title": "Spider-Man: Into the Spider-Verse",
    "releaseDate": "December 14, 2018",
    "year": 2018,
    "type": "Film",
    "era": "Sony's Spider-Man Universe & Spider-Verse (Multiverse Canon) — Animated Spider-Verse Franchise",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-121",
    "title": "Spider-Ham: Caught in a Ham",
    "releaseDate": "December 3, 2019",
    "year": 2019,
    "type": "Short Film",
    "era": "Sony's Spider-Man Universe & Spider-Verse (Multiverse Canon) — Animated Spider-Verse Franchise",
    "runtime": 15,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-122",
    "title": "Spider-Man: Across the Spider-Verse",
    "releaseDate": "June 2, 2023",
    "year": 2023,
    "type": "Film",
    "era": "Sony's Spider-Man Universe & Spider-Verse (Multiverse Canon) — Animated Spider-Verse Franchise",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-123",
    "title": "The Spider Within: A Spider-Verse Story",
    "releaseDate": "March 27, 2024",
    "year": 2024,
    "type": "Short Film",
    "era": "Sony's Spider-Man Universe & Spider-Verse (Multiverse Canon) — Animated Spider-Verse Franchise",
    "runtime": 15,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-124",
    "title": "Spider-Man: Beyond the Spider-Verse",
    "releaseDate": "In Development",
    "year": 2028,
    "type": "Film",
    "era": "Sony's Spider-Man Universe & Spider-Verse (Multiverse Canon) — Animated Spider-Verse Franchise",
    "runtime": 120,
    "watched": false,
    "isUpcoming": true
  },
  {
    "id": "marvel-125",
    "title": "X-Men",
    "releaseDate": "July 14, 2000",
    "year": 2000,
    "type": "Film",
    "era": "20th Century Fox X-Men & Fantastic Four Multiverse — X-Men Film Series (Release Order)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-126",
    "title": "X2: X-Men United",
    "releaseDate": "May 2, 2003",
    "year": 2003,
    "type": "Film",
    "era": "20th Century Fox X-Men & Fantastic Four Multiverse — X-Men Film Series (Release Order)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-127",
    "title": "X-Men: The Last Stand",
    "releaseDate": "May 26, 2006",
    "year": 2006,
    "type": "Film",
    "era": "20th Century Fox X-Men & Fantastic Four Multiverse — X-Men Film Series (Release Order)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-128",
    "title": "X-Men Origins: Wolverine",
    "releaseDate": "May 1, 2009",
    "year": 2009,
    "type": "Film",
    "era": "20th Century Fox X-Men & Fantastic Four Multiverse — X-Men Film Series (Release Order)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-129",
    "title": "X-Men: First Class",
    "releaseDate": "June 3, 2011",
    "year": 2011,
    "type": "Film",
    "era": "20th Century Fox X-Men & Fantastic Four Multiverse — X-Men Film Series (Release Order)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-130",
    "title": "The Wolverine",
    "releaseDate": "July 26, 2013",
    "year": 2013,
    "type": "Film",
    "era": "20th Century Fox X-Men & Fantastic Four Multiverse — X-Men Film Series (Release Order)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-131",
    "title": "X-Men: Days of Future Past",
    "releaseDate": "May 23, 2014",
    "year": 2014,
    "type": "Film",
    "era": "20th Century Fox X-Men & Fantastic Four Multiverse — X-Men Film Series (Release Order)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-132",
    "title": "Deadpool",
    "releaseDate": "February 12, 2016",
    "year": 2016,
    "type": "Film",
    "era": "20th Century Fox X-Men & Fantastic Four Multiverse — X-Men Film Series (Release Order)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-133",
    "title": "X-Men: Apocalypse",
    "releaseDate": "May 27, 2016",
    "year": 2016,
    "type": "Film",
    "era": "20th Century Fox X-Men & Fantastic Four Multiverse — X-Men Film Series (Release Order)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-134",
    "title": "Logan",
    "releaseDate": "March 3, 2017",
    "year": 2017,
    "type": "Film",
    "era": "20th Century Fox X-Men & Fantastic Four Multiverse — X-Men Film Series (Release Order)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-135",
    "title": "Deadpool 2",
    "releaseDate": "May 18, 2018",
    "year": 2018,
    "type": "Film",
    "era": "20th Century Fox X-Men & Fantastic Four Multiverse — X-Men Film Series (Release Order)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-136",
    "title": "Dark Phoenix",
    "releaseDate": "June 7, 2019",
    "year": 2019,
    "type": "Film",
    "era": "20th Century Fox X-Men & Fantastic Four Multiverse — X-Men Film Series (Release Order)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-137",
    "title": "The New Mutants",
    "releaseDate": "August 28, 2020",
    "year": 2020,
    "type": "Film",
    "era": "20th Century Fox X-Men & Fantastic Four Multiverse — X-Men Film Series (Release Order)",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-138",
    "title": "Legion",
    "releaseDate": "2017–2019",
    "year": 2017,
    "type": "Seasons 1–3",
    "era": "20th Century Fox X-Men & Fantastic Four Multiverse — Fox TV Series & Fantastic Four",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-139",
    "title": "The Gifted",
    "releaseDate": "2017–2019",
    "year": 2017,
    "type": "Seasons 1–2",
    "era": "20th Century Fox X-Men & Fantastic Four Multiverse — Fox TV Series & Fantastic Four",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-140",
    "title": "Fantastic Four",
    "releaseDate": "July 8, 2005",
    "year": 2005,
    "type": "Film",
    "era": "20th Century Fox X-Men & Fantastic Four Multiverse — Fox TV Series & Fantastic Four",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-141",
    "title": "Fantastic Four: Rise of the Silver Surfer",
    "releaseDate": "June 15, 2007",
    "year": 2007,
    "type": "Film",
    "era": "20th Century Fox X-Men & Fantastic Four Multiverse — Fox TV Series & Fantastic Four",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-142",
    "title": "Fantastic Four",
    "releaseDate": "August 7, 2015",
    "year": 2015,
    "type": "Reboot Film",
    "era": "20th Century Fox X-Men & Fantastic Four Multiverse — Fox TV Series & Fantastic Four",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-143",
    "title": "Spider-Man",
    "releaseDate": "May 3, 2002",
    "year": 2002,
    "type": "Film",
    "era": "Classic Spider-Man Multiverse Franchises — Sam Raimi Trilogy",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-144",
    "title": "Spider-Man 2",
    "releaseDate": "June 30, 2004",
    "year": 2004,
    "type": "Film",
    "era": "Classic Spider-Man Multiverse Franchises — Sam Raimi Trilogy",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-145",
    "title": "Spider-Man 3",
    "releaseDate": "May 4, 2007",
    "year": 2007,
    "type": "Film",
    "era": "Classic Spider-Man Multiverse Franchises — Sam Raimi Trilogy",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-146",
    "title": "The Amazing Spider-Man",
    "releaseDate": "July 3, 2012",
    "year": 2012,
    "type": "Film",
    "era": "Classic Spider-Man Multiverse Franchises — Marc Webb Series",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-147",
    "title": "The Amazing Spider-Man 2",
    "releaseDate": "May 2, 2014",
    "year": 2014,
    "type": "Film",
    "era": "Classic Spider-Man Multiverse Franchises — Marc Webb Series",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-148",
    "title": "The Incredible Hulk",
    "releaseDate": "1977–1982 + TV Movies 1988–1990",
    "year": 1977,
    "type": "TV Series",
    "era": "Classic Legacy Marvel Films & Animated Icons — Pre-MCU Live-Action Legacy Highlights",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-149",
    "title": "Howard the Duck",
    "releaseDate": "August 1, 1986",
    "year": 1986,
    "type": "Film",
    "era": "Classic Legacy Marvel Films & Animated Icons — Pre-MCU Live-Action Legacy Highlights",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-150",
    "title": "The Punisher",
    "releaseDate": "October 5, 1989",
    "year": 1989,
    "type": "Film",
    "era": "Classic Legacy Marvel Films & Animated Icons — Pre-MCU Live-Action Legacy Highlights",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-151",
    "title": "Blade",
    "releaseDate": "August 21, 1998",
    "year": 1998,
    "type": "Film",
    "era": "Classic Legacy Marvel Films & Animated Icons — Pre-MCU Live-Action Legacy Highlights",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-152",
    "title": "Blade II",
    "releaseDate": "March 22, 2002",
    "year": 2002,
    "type": "Film",
    "era": "Classic Legacy Marvel Films & Animated Icons — Pre-MCU Live-Action Legacy Highlights",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-153",
    "title": "Daredevil",
    "releaseDate": "February 14, 2003",
    "year": 2003,
    "type": "Film",
    "era": "Classic Legacy Marvel Films & Animated Icons — Pre-MCU Live-Action Legacy Highlights",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-154",
    "title": "Hulk",
    "releaseDate": "June 20, 2003",
    "year": 2003,
    "type": "Film",
    "era": "Classic Legacy Marvel Films & Animated Icons — Pre-MCU Live-Action Legacy Highlights",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-155",
    "title": "The Punisher",
    "releaseDate": "April 16, 2004",
    "year": 2004,
    "type": "Film",
    "era": "Classic Legacy Marvel Films & Animated Icons — Pre-MCU Live-Action Legacy Highlights",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-156",
    "title": "Blade: Trinity",
    "releaseDate": "December 8, 2004",
    "year": 2004,
    "type": "Film",
    "era": "Classic Legacy Marvel Films & Animated Icons — Pre-MCU Live-Action Legacy Highlights",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-157",
    "title": "Elektra",
    "releaseDate": "January 14, 2005",
    "year": 2005,
    "type": "Film",
    "era": "Classic Legacy Marvel Films & Animated Icons — Pre-MCU Live-Action Legacy Highlights",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-158",
    "title": "Ghost Rider",
    "releaseDate": "February 16, 2007",
    "year": 2007,
    "type": "Film",
    "era": "Classic Legacy Marvel Films & Animated Icons — Pre-MCU Live-Action Legacy Highlights",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-159",
    "title": "Punisher: War Zone",
    "releaseDate": "December 5, 2008",
    "year": 2008,
    "type": "Film",
    "era": "Classic Legacy Marvel Films & Animated Icons — Pre-MCU Live-Action Legacy Highlights",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-160",
    "title": "Ghost Rider: Spirit of Vengeance",
    "releaseDate": "February 17, 2012",
    "year": 2012,
    "type": "Film",
    "era": "Classic Legacy Marvel Films & Animated Icons — Pre-MCU Live-Action Legacy Highlights",
    "runtime": 120,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-161",
    "title": "X-Men: The Animated Series",
    "releaseDate": "1992–1997",
    "year": 1992,
    "type": "Series",
    "era": "Classic Legacy Marvel Films & Animated Icons — Iconic Animated Series Highlights",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-162",
    "title": "Spider-Man: The Animated Series",
    "releaseDate": "1994–1998",
    "year": 1994,
    "type": "Series",
    "era": "Classic Legacy Marvel Films & Animated Icons — Iconic Animated Series Highlights",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-163",
    "title": "X-Men: Evolution",
    "releaseDate": "2000–2003",
    "year": 2000,
    "type": "Series",
    "era": "Classic Legacy Marvel Films & Animated Icons — Iconic Animated Series Highlights",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-164",
    "title": "The Spectacular Spider-Man",
    "releaseDate": "2008–2009",
    "year": 2008,
    "type": "Series",
    "era": "Classic Legacy Marvel Films & Animated Icons — Iconic Animated Series Highlights",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-165",
    "title": "Wolverine and the X-Men",
    "releaseDate": "2009",
    "year": 2009,
    "type": "Series",
    "era": "Classic Legacy Marvel Films & Animated Icons — Iconic Animated Series Highlights",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-166",
    "title": "The Avengers: Earth's Mightiest Heroes",
    "releaseDate": "2010–2012",
    "year": 2010,
    "type": "Series",
    "era": "Classic Legacy Marvel Films & Animated Icons — Iconic Animated Series Highlights",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  },
  {
    "id": "marvel-167",
    "title": "X-Men '97",
    "releaseDate": "March 20, 2024",
    "year": 2024,
    "type": "Season 1",
    "era": "Classic Legacy Marvel Films & Animated Icons — Iconic Animated Series Highlights",
    "runtime": 300,
    "watched": false,
    "isUpcoming": false
  }
]

export const FRANCHISES_CATALOG: Record<string, FranchiseUniverse> = {
  marvel: {
    id: "marvel",
    name: "Marvel Cinematic Universe & Multiverse",
    shortName: "Marvel",
    tagline: "From Iron Man to the Multiverse Saga, SSU, Fox X-Men and classic animation.",
    accentColor: "#8B6CE8",
    items: MARVEL_MASTER_ITEMS,
  },
  dc: {
    id: "dc",
    name: "DC Universe & Multiverse Chronicles",
    shortName: "DC",
    tagline: "From James Gunn's DCU to Elseworlds, DCEU, Arrowverse and DCAU classics.",
    accentColor: "#7579E7",
    items: DC_MASTER_ITEMS,
  },
}

/**
 * Parses markdown checklist text formatted according to Moonlit Violet Vault's
 * viewing checklist syntax:
 *
 * `## Major Era Heading`
 * `### Sub-Phase or Multiverse Era`
 * `- [ ] **Title** *(Type | Release Date)*`
 *
 * @param markdown - Raw markdown checklist string.
 * @param universeId - Identifier prefix to generate unique title IDs.
 * @returns Array of structured `FranchiseItem` objects ready for checklist display.
 */
export function parseChecklistMarkdown(markdown: string, universeId: string): FranchiseItem[] {
  const lines = markdown.split("\n")
  const results: FranchiseItem[] = []
  let majorEra = ""
  let currentEra = "General"
  let counter = 1

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    if (line.startsWith("## ")) {
      majorEra = line.replace(/^##\s+/, "").replace(/^[^\w\s]+\s+/, "").trim()
      currentEra = majorEra
      continue
    }

    if (line.startsWith("### ")) {
      const subEra = line.replace(/^###\s+/, "").replace(/^[^\w\s]+\s+/, "").trim()
      currentEra = majorEra ? `${majorEra} — ${subEra}` : subEra
      continue
    }

    const match = line.match(/^-\s+\[([ xX])\]\s+\*\*(.+?)\*\*\s+\*\((.+?)\)\*/)
    if (match) {
      const isChecked = match[1].toLowerCase() === "x"
      const title = match[2].trim()
      const meta = match[3].trim()

      const parts = meta.split("|").map((p) => p.trim())
      let type = parts[0] || "Film"
      let releaseDate = parts[1] || ""

      if (!releaseDate && parts.length === 1 && /^\d{4}/.test(parts[0])) {
        releaseDate = parts[0]
        type = "Film"
      }

      let year = 2026
      const yearMatch = (releaseDate + " " + meta).match(/\b(19\d{2}|20\d{2})\b/)
      if (yearMatch) {
        year = parseInt(yearMatch[1], 10)
      } else if (releaseDate.toLowerCase().includes("in development") || meta.toLowerCase().includes("in development")) {
        year = 2028
      }

      const isUpcoming = year >= 2026 || releaseDate.toLowerCase().includes("in development")
      const id = `${universeId}-${counter.toString().padStart(3, "0")}`
      counter++

      let runtime = 120
      const lowerType = type.toLowerCase()
      if (lowerType.includes("short")) {
        runtime = 15
      } else if (lowerType.includes("series") || lowerType.includes("season") || lowerType.includes("show")) {
        runtime = 300
      }

      results.push({
        id,
        title,
        releaseDate,
        year,
        type,
        era: currentEra,
        runtime,
        watched: isChecked,
        isUpcoming,
      })
    }
  }

  return results
}
