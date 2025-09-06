"use client";

import { Canvas } from "@/components/canvas";

export default function Home() {
  return (
    <main className="flex items-center justify-center h-screen">
      <div className="flex flex-row items-start gap-4">
        <Canvas />
      </div>
    </main>
  );
}
