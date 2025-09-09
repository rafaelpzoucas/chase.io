"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { PlayerForm } from "./form";

export default function Home() {
  const [nickname, setNickname] = useState<string | null>(null);

  useEffect(() => {
    // Garantir que está no client
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("nickname");
      setNickname(stored);
    }
  }, []);

  return (
    <main className="flex items-center justify-center h-screen">
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col text-center gap-4">
          <h2 className="text-4xl font-semibold mb-2 uppercase">
            Crie uma sala
          </h2>
          <Card className="p-4">
            <PlayerForm nickname={nickname} />
          </Card>
        </div>
      </div>
    </main>
  );
}
