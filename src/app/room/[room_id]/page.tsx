"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PlayerForm } from "@/app/form";
import { CanvasPartykit } from "@/components/canvas-partykit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePartyKit } from "@/hooks/use-partykit";
import { cn } from "@/lib/utils";
import { PLAYER_COLORS } from "@/utils/constants";
import { GameUI } from "./game-ui";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.room_id as string;

  const [nickname, setNickname] = useState<string | null>(null);

  useEffect(() => {
    // Garantir que está no client
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("nickname");
      setNickname(stored);
    }
  }, []);

  if (!nickname) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col text-center gap-4">
          <h2 className="text-4xl font-semibold mb-2">
            {roomId ? `Entrar na sala: ${roomId}` : "Carregando sala..."}
          </h2>
          <Card className="p-4">
            <PlayerForm setNickname={setNickname} />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center justify-center min-h-screen">
      <div className="flex items-start gap- p-4 scale-90 2xl:scale-100">
        <GameUI nickname={nickname} roomId={roomId} />

        <div className="flex flex-col items-center justify-center">
          <CanvasPartykit roomId={roomId} nickname={nickname} />

          <div>
            <p className="text-base text-gray-500 text-center">
              Use WASD ou SETAS para mover-se
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
