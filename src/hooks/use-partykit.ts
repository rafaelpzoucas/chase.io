import PartySocket from "partysocket";
import { useEffect, useRef, useState } from "react";
import type { Player } from "@/types/player";

interface UsePartyKitReturn {
  socket: PartySocket | null;
  currentPlayer: Player | null;
  activePlayers: Map<string, Player>;
  eliminatedPlayers: Map<string, Player>;
  isConnected: boolean;
  itPlayerId: string | null;
  isX1: boolean;
}

const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "localhost:1999";

export function usePartyKit(
  roomId: string,
  nickname: string | null,
): UsePartyKitReturn {
  const socketRef = useRef<PartySocket | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [activePlayers, setActivePlayers] = useState<Map<string, Player>>(
    new Map(),
  );
  const [eliminatedPlayers, setEliminatedPlayers] = useState<
    Map<string, Player>
  >(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [itPlayerId, setItPlayerId] = useState<string | null>(null);
  const [isX1, setIsX1] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies(itPlayerId): suppress dependency itPlayerId
  useEffect(() => {
    if (!roomId) return;

    // Conectar ao PartyKit com roomId específico
    const socket = new PartySocket({
      host,
      room: roomId, // Usa o roomId como identificador da sala
      // Passa o nickname como query parameter se disponível
      query: nickname ? { nickname } : undefined,
    });

    socketRef.current = socket;

    // Event listeners
    socket.addEventListener("open", () => {
      console.log(`Conectado ao PartyKit - Room: ${roomId}`);
      setIsConnected(true);
    });

    socket.addEventListener("close", () => {
      console.log(`Desconectado do PartyKit - Room: ${roomId}`);
      setIsConnected(false);
      setCurrentPlayer(null);
      setActivePlayers(new Map());
      setEliminatedPlayers(new Map());
    });

    socket.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "game:init": {
            console.log("Jogo inicializado:", message.payload);
            setCurrentPlayer(message.payload.player);

            // Separar jogadores ativos (exceto o jogador atual)
            const activeOthers = new Map<string, Player>();
            message.payload.activePlayers.forEach((player: Player) => {
              if (player.id !== message.payload.playerId) {
                activeOthers.set(player.id, player);
              }
            });
            setActivePlayers(activeOthers);

            // Adicionar jogadores eliminados
            const eliminated = new Map<string, Player>();
            message.payload.eliminatedPlayers.forEach((player: Player) => {
              eliminated.set(player.id, player);
            });
            setEliminatedPlayers(eliminated);
            break;
          }

          case "game:playerJoined": {
            console.log("Jogador entrou:", message.payload.player);

            // Atualizar ambas as listas com os dados do servidor
            const activeOthers = new Map<string, Player>();
            message.payload.activePlayers.forEach((player: Player) => {
              if (player.id !== socket.id) {
                activeOthers.set(player.id, player);
              }
            });
            setActivePlayers(activeOthers);

            const eliminated = new Map<string, Player>();
            message.payload.eliminatedPlayers.forEach((player: Player) => {
              eliminated.set(player.id, player);
            });
            setEliminatedPlayers(eliminated);
            break;
          }

          case "game:playersUpdate": {
            // Verificar se o payload tem a estrutura esperada
            if (
              message.payload.activePlayers &&
              message.payload.eliminatedPlayers
            ) {
              const activeOthers = new Map<string, Player>();
              const eliminated = new Map<string, Player>();

              message.payload.activePlayers.forEach((player: Player) => {
                if (player.id === socket.id) {
                  setCurrentPlayer(player);
                } else {
                  activeOthers.set(player.id, player);
                }
              });

              message.payload.eliminatedPlayers.forEach((player: Player) => {
                eliminated.set(player.id, player);
              });

              setActivePlayers(activeOthers);
              setEliminatedPlayers(eliminated);
            } else if (Array.isArray(message.payload)) {
              // Formato antigo - array de players
              const activeOthers = new Map<string, Player>();

              message.payload.forEach((player: Player) => {
                if (player.id === socket.id) {
                  setCurrentPlayer(player);
                } else if (player.caughtCount < 3) {
                  activeOthers.set(player.id, player);
                }
              });

              setActivePlayers(activeOthers);
            }
            break;
          }

          case "game:playerLeft": {
            console.log("Jogador saiu:", message.payload.playerId);

            // Atualizar ambas as listas com os dados do servidor
            const activeOthers = new Map<string, Player>();
            message.payload.activePlayers.forEach((player: Player) => {
              if (player.id !== socket.id) {
                activeOthers.set(player.id, player);
              }
            });
            setActivePlayers(activeOthers);

            const eliminated = new Map<string, Player>();
            message.payload.eliminatedPlayers.forEach((player: Player) => {
              eliminated.set(player.id, player);
            });
            setEliminatedPlayers(eliminated);

            if (message.payload.playerId === itPlayerId) {
              setItPlayerId(null);
            }
            break;
          }

          case "game:started": {
            console.log("Jogo iniciado! Pique:", message.payload.itPlayerId);
            setItPlayerId(message.payload.itPlayerId);

            // Atualizar listas com dados do servidor
            const activeOthers = new Map<string, Player>();
            message.payload.activePlayers.forEach((player: Player) => {
              if (player.id === socket.id) {
                setCurrentPlayer(player);
              } else {
                activeOthers.set(player.id, player);
              }
            });
            setActivePlayers(activeOthers);

            const eliminated = new Map<string, Player>();
            message.payload.eliminatedPlayers.forEach((player: Player) => {
              eliminated.set(player.id, player);
            });
            setEliminatedPlayers(eliminated);
            break;
          }

          case "game:piqueChanged": {
            console.log("Pique mudou para:", message.payload.playerId);
            setItPlayerId(message.payload.playerId);

            // Atualizar listas com dados do servidor
            const activeOthers = new Map<string, Player>();
            message.payload.activePlayers.forEach((player: Player) => {
              if (player.id === socket.id) {
                setCurrentPlayer(player);
              } else {
                activeOthers.set(player.id, player);
              }
            });
            setActivePlayers(activeOthers);

            const eliminated = new Map<string, Player>();
            message.payload.eliminatedPlayers.forEach((player: Player) => {
              eliminated.set(player.id, player);
            });
            setEliminatedPlayers(eliminated);
            break;
          }

          case "game:piqueTransferred": {
            console.log(
              `Pique transferido de ${message.payload.fromPlayerId} para ${message.payload.toPlayerId}`,
            );
            setItPlayerId(message.payload.toPlayerId);

            // Atualizar listas com dados do servidor
            const activeOthers = new Map<string, Player>();
            message.payload.activePlayers.forEach((player: Player) => {
              if (player.id === socket.id) {
                setCurrentPlayer(player);
              } else {
                activeOthers.set(player.id, player);
              }
            });
            setActivePlayers(activeOthers);

            const eliminated = new Map<string, Player>();
            message.payload.eliminatedPlayers.forEach((player: Player) => {
              eliminated.set(player.id, player);
            });
            setEliminatedPlayers(eliminated);

            // Mostra mensagem se o jogador atual foi envolvido na transferência
            if (message.payload.fromPlayerId === socket.id) {
              console.log("Você passou o pique!");
            } else if (message.payload.toPlayerId === socket.id) {
              console.log("Você está no pique agora!");
            }

            // Verificar se o jogador atual foi eliminado
            const currentPlayerEliminated =
              message.payload.eliminatedPlayers.find(
                (player: Player) => player.id === socket.id,
              );
            if (currentPlayerEliminated) {
              console.log("Você foi eliminado!");
              setCurrentPlayer(currentPlayerEliminated);
            }
            break;
          }

          case "game:twoPlayerModeStarted": {
            console.log("Modo x1");
            setIsX1(true);
            break;
          }

          case "game:game:twoPlayerModeFinished": {
            console.log("Modo x1 acabou");
            setIsX1(false);
            break;
          }

          case "pong":
            console.log("Pong recebido");
            break;

          default:
            console.log("Mensagem desconhecida:", message.type);
        }
      } catch (error) {
        console.error("Erro ao processar mensagem:", error);
      }
    });

    socket.addEventListener("error", (event) => {
      console.error("Erro na conexão PartyKit:", event);
    });

    // Cleanup na desmontagem
    return () => {
      socket.close();
    };
  }, [roomId, nickname]);

  return {
    socket: socketRef.current,
    currentPlayer,
    activePlayers,
    eliminatedPlayers,
    isConnected,
    itPlayerId,
    isX1,
  };
}
