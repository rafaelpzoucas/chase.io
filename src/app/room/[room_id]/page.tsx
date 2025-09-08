"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PlayerForm } from "@/app/form";
import { CanvasPartykit } from "@/components/canvas-partykit";
import { Button } from "@/components/ui/button";

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.room_id as string;

  const [nickname, setNickname] = useState<string | null>(null);

  // Estado para verificar se temos as informações necessárias
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("nickname");
    setNickname(stored);
    // Verifica se temos roomId e nickname
    if (roomId && nickname) {
      setIsReady(true);
    }
  }, [roomId, nickname]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Carregando sala...</h2>
          <p className="text-gray-600">Sala: {roomId}</p>
          {!nickname && <PlayerForm />}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <header className="flex flex-row justify-between w-full px-4">
        <div className="py-4">
          <h1 className="text-2xl font-bold mb-2">Sala: {roomId}</h1>
          <p className="text-lg text-muted-foreground">{nickname}</p>
        </div>

        <div className="mt-4 text-center">
          <Button type="button" onClick={() => router.push("/")}>
            Sair da Sala
          </Button>
        </div>
      </header>
      <div className="flex flex-col items-center justify-center p-4">
        <CanvasPartykit roomId={roomId} nickname={nickname} />

        <div className="mb-4">
          <p className="text-base text-gray-500 text-center">
            Use WASD para mover-se
          </p>
        </div>
      </div>
    </div>
  );
}
