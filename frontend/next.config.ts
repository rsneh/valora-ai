import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // i18n: {
  //   locales: ['en', 'he'],
  //   defaultLocale: 'en',
  //   // This is a list of locale domains and the default locale they
  //   // should handle (these are only required when setting up domain routing)
  //   // Note: subdomains must be included in the domain value to be matched e.g. "fr.example.com".
  //   // domains: [
  //   // ],
  //   localeDetection: false,
  // },
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
