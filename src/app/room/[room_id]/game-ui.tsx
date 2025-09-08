"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePartyKit } from "@/hooks/use-partykit";
import { cn } from "@/lib/utils";
import { PLAYER_COLORS } from "@/utils/constants";

export function GameUI({
  roomId,
  nickname,
}: {
  roomId: string;
  nickname: string;
}) {
  const router = useRouter();

  const { otherPlayers } = usePartyKit(roomId, nickname);

  const playersArray = Array.from(otherPlayers.entries());

  return (
    <Card className="p-4">
      <header className="flex flex-row items-start justify-between w-[400px] gap-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Sala: {roomId}</h1>
        </div>

        <Button type="button" onClick={() => router.push("/")}>
          Sair da Sala
        </Button>
      </header>

      <div>
        <h2>Jogadores</h2>
        <ul>
          {playersArray.map(([id, player]) => {
            const isYou = player.nickname === nickname;

            return (
              <div
                key={id}
                className="flex flex-row items-center gap-2 text-2xl"
              >
                <div
                  className={cn(`w-4 h-4 aspect-square`)}
                  style={{
                    backgroundColor: isYou
                      ? player.isIt
                        ? PLAYER_COLORS.PIQUE
                        : PLAYER_COLORS.SELECTED
                      : player.color,
                  }}
                ></div>
                {player.nickname}
                <span className="text-muted-foreground">
                  {isYou ? " (você)" : null}
                </span>

                {player.caught_count}
              </div>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}
