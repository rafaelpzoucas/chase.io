"use client";

import { CanvasPartykit } from "@/components/canvas-partykit";

export default function Home() {
  return (
    <main className="flex items-center justify-center h-screen">
      <div className="flex flex-row items-start gap-4">
        <CanvasPartykit />
      </div>
    </main>
  );
}
