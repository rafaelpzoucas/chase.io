"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HeartSolid } from "@/components/icons/heart";
import { Logout } from "@/components/icons/logout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

  const [isFinished, setIsFinished] = useState(false);

  const playersArray = Array.from(otherPlayers.entries());
  const activePlayers = playersArray.filter(
    ([id, player]) => player.caught_count < 3,
  );
  const eliminatedPlayers = playersArray.filter(
    ([id, player]) => player.caught_count === 3,
  );

  console.log({ activePlayers: activePlayers.length });

  useEffect(() => {
    if (activePlayers.length === 1) {
      setIsFinished(true);
    } else {
      setIsFinished(false);
    }
  }, [activePlayers.length]);

  return (
    <>
      <Card className="p-4">
        <header className="flex flex-row items-start justify-between w-[400px] gap-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Sala: {roomId}</h1>
          </div>

          <Button type="button" onClick={() => router.push("/")} size={"icon"}>
            <Logout variant="solid" />
          </Button>
        </header>

        <div>
          <h2>Jogadores ativos</h2>
          <ul>
            {activePlayers.map(([id, player]) => {
              const isYou = player.nickname === nickname;

              return (
                <div
                  key={id}
                  className="flex flex-row items-center justify-between gap-2 text-2xl w-full"
                >
                  <span className="flex flex-row items-center gap-2">
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
                    {isYou ? (
                      <span className="text-muted-foreground">(você)</span>
                    ) : null}
                  </span>

                  <span className="flex flex-row gap-1">
                    {Array.from({ length: 3 }).map((_, i) => {
                      const filled = i < 3 - (player.caught_count ?? 1);

                      return (
                        <HeartSolid
                          // biome-ignore lint/suspicious/noArrayIndexKey: its necessary to use index
                          key={i}
                          className={cn(filled && "fill-[red]")}
                          variant={filled ? "solid" : "outline"}
                        />
                      );
                    })}
                  </span>
                </div>
              );
            })}
          </ul>
        </div>

        {eliminatedPlayers.length > 0 && (
          <div>
            <h2>Jogadores eliminados</h2>
            <ul>
              {eliminatedPlayers.map(([id, player]) => {
                const isYou = player.nickname === nickname;

                return (
                  <div
                    key={id}
                    className="flex flex-row items-center justify-between gap-2 text-2xl w-full"
                  >
                    <span className="flex flex-row items-center gap-2">
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
                      {isYou ? (
                        <span className="text-muted-foreground">(você)</span>
                      ) : null}
                    </span>

                    <span className="flex flex-row gap-1">
                      {Array.from({ length: 3 }).map((_, i) => {
                        const filled = i < 3 - player.caught_count;

                        return (
                          <HeartSolid
                            // biome-ignore lint/suspicious/noArrayIndexKey: its necessary to use index
                            key={i}
                            className={cn(filled && "fill-[red]")}
                            variant={filled ? "solid" : "outline"}
                          />
                        );
                      })}
                    </span>
                  </div>
                );
              })}
            </ul>
          </div>
        )}
      </Card>

      <AlertDialog open={isFinished} onOpenChange={setIsFinished}>
        <AlertDialogContent className="space-y-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-4xl text-muted-foreground uppercase">
              Ganhador
            </AlertDialogTitle>
            <AlertDialogDescription></AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col items-center text-center gap-4">
            {activePlayers.map(([id, player]) => {
              const isYou = player.nickname === nickname;

              return (
                <div
                  key={id}
                  className="flex flex-row items-center justify-between gap-2 text-5xl p-4 px-8 border bg-secondary/50"
                >
                  <span className="flex flex-row items-center gap-3">
                    <div
                      className={cn(`w-8 h-8 aspect-square`)}
                      style={{
                        backgroundColor: isYou
                          ? player.isIt
                            ? PLAYER_COLORS.PIQUE
                            : PLAYER_COLORS.SELECTED
                          : player.color,
                      }}
                    ></div>
                    {player.nickname}
                  </span>
                </div>
              );
            })}
          </div>

          <AlertDialogFooter className="!justify-center">
            <AlertDialogAction className="w-full">
              Reiniciar jogo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
