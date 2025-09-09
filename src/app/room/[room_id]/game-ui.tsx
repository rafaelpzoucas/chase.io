"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HeartSolid } from "@/components/icons/heart";
import { Logout } from "@/components/icons/logout";
import { Trophy } from "@/components/icons/trophy";
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

  const {
    socket,
    isConnected,
    activePlayers,
    eliminatedPlayers,
    currentPlayer,
  } = usePartyKit(roomId, nickname);

  const [isFinished, setIsFinished] = useState(false);

  // Converter Maps para arrays e incluir o jogador atual se necessário
  const activePlayersArray = Array.from(activePlayers.entries());
  const eliminatedPlayersArray = Array.from(eliminatedPlayers.entries());

  // Adicionar o jogador atual na lista apropriada se ele não estiver lá
  let finalActivePlayers = activePlayersArray;
  let finalEliminatedPlayers = eliminatedPlayersArray;

  if (currentPlayer) {
    const isCurrentPlayerInActive = activePlayersArray.some(
      ([id]) => id === currentPlayer.id,
    );
    const isCurrentPlayerInEliminated = eliminatedPlayersArray.some(
      ([id]) => id === currentPlayer.id,
    );

    if (!isCurrentPlayerInActive && !isCurrentPlayerInEliminated) {
      // Adiciona o jogador atual na lista apropriada baseado no caught_count
      if (currentPlayer.caught_count >= 3) {
        finalEliminatedPlayers = [
          ...eliminatedPlayersArray,
          [currentPlayer.id, currentPlayer],
        ];
      } else {
        finalActivePlayers = [
          ...activePlayersArray,
          [currentPlayer.id, currentPlayer],
        ];
      }
    }
  }

  function handleRestartGame() {
    if (socket && isConnected) {
      socket.send(
        JSON.stringify({
          type: "game:restart",
          payload: {},
        }),
      );
    }
  }

  // Verificar se o jogo terminou (apenas 1 jogador ativo restante)
  useEffect(() => {
    if (finalActivePlayers.length === 1 && finalEliminatedPlayers.length > 0) {
      setIsFinished(true);
    }
  }, [finalActivePlayers.length, finalEliminatedPlayers.length]);

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
          <h2>Jogadores ativos ({finalActivePlayers.length})</h2>
          <ul>
            {finalActivePlayers.map(([id, player]) => {
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
                    {player.isIt && (
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                        PIQUE
                      </span>
                    )}
                  </span>

                  <span className="flex flex-row gap-1">
                    {Array.from({ length: 3 }).map((_, i) => {
                      const filled = i < 3 - (player.caught_count ?? 0);

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

        {finalEliminatedPlayers.length > 0 && (
          <div className="mt-4">
            <h2>Jogadores eliminados ({finalEliminatedPlayers.length})</h2>
            <ul>
              {finalEliminatedPlayers.map(([id, player]) => {
                const isYou = player.nickname === nickname;

                return (
                  <div
                    key={id}
                    className="flex flex-row items-center justify-between gap-2 text-2xl w-full opacity-50"
                  >
                    <span className="flex flex-row items-center gap-2">
                      <div
                        className={cn(`w-4 h-4 aspect-square`)}
                        style={{
                          backgroundColor: isYou
                            ? PLAYER_COLORS.SELECTED
                            : player.color,
                        }}
                      ></div>
                      {player.nickname}
                      {isYou ? (
                        <span className="text-muted-foreground">(você)</span>
                      ) : null}
                      <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded">
                        ELIMINADO
                      </span>
                    </span>

                    <span className="flex flex-row gap-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <HeartSolid
                          // biome-ignore lint/suspicious/noArrayIndexKey: its necessary to use index
                          key={i}
                          className="fill-gray-400"
                          variant="outline"
                        />
                      ))}
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
              Vencedor!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Parabéns ao último jogador sobrevivente!
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col items-center text-center gap-4">
            {finalActivePlayers.map(([id, player]) => {
              const isYou = player.nickname === nickname;

              return (
                <div
                  key={id}
                  className="flex flex-row items-center justify-center gap-3 text-5xl p-4 px-8 border rounded-lg shadow-lg"
                >
                  <Trophy
                    variant="solid"
                    className="w-12 h-12 fill-amber-500"
                  />{" "}
                  <span>{player.nickname}</span>
                  {isYou && <span className="text-3xl">(VOCÊ!)</span>}
                </div>
              );
            })}
          </div>

          <AlertDialogFooter className="!justify-center">
            <AlertDialogAction
              className="w-full"
              onClick={() => {
                setIsFinished(false);
                handleRestartGame();
              }}
            >
              Reiniciar jogo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
