import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: path.join(__dirname),
  },
  // Next's dev server blocks cross-origin requests for its own _next/*
  // assets by default (anti DNS-rebinding) — without this, opening the app
  // via a LAN IP for device testing 403s on every static chunk.
  allowedDevOrigins: ["10.10.88.33"],
};

export default nextConfig;
