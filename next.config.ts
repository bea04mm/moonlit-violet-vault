import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // TMDB poster images
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
      {
        // Google Books cover images
        protocol: "https",
        hostname: "books.google.com",
      },
      {
        // Google Books (alternate CDN)
        protocol: "https",
        hostname: "*.googleapis.com",
      },
      {
        // Placeholder images (development)
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
