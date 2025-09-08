import PartySocket from "partysocket";
import { useEffect, useRef, useState } from "react";
import type { Player } from "@/types/player";

interface UsePartyKitReturn {
  socket: PartySocket | null;
  currentPlayer: Player | null;
  otherPlayers: Map<string, Player>;
  isConnected: boolean;
  itPlayerId: string | null;
}

const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "localhost:1999";

export function usePartyKit(
  roomId: string,
  nickname: string | null,
): UsePartyKitReturn {
  const socketRef = useRef<PartySocket | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [otherPlayers, setOtherPlayers] = useState<Map<string, Player>>(
    new Map(),
  );
  const [isConnected, setIsConnected] = useState(false);
  const [itPlayerId, setItPlayerId] = useState<string | null>(null);

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
      setOtherPlayers(new Map());
    });

    socket.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "game:init": {
            console.log("Jogo inicializado:", message.payload);
            setCurrentPlayer(message.payload.player);

            // Adicionar outros jogadores (exceto o jogador atual)
            const others = new Map<string, Player>();
            message.payload.players.forEach((player: Player) => {
              if (player.id !== message.payload.playerId) {
                others.set(player.id, player);
              }
            });
            setOtherPlayers(others);
            break;
          }

          case "game:playerJoined":
            console.log("Jogador entrou:", message.payload);
            setOtherPlayers((prev) => {
              const newMap = new Map(prev);
              newMap.set(message.payload.id, message.payload);
              return newMap;
            });
            break;

          case "game:playersUpdate":
            setOtherPlayers((prev) => {
              const newMap = new Map(prev);

              message.payload.forEach((player: Player) => {
                if (player.id === socket.id) {
                  // Atualiza o jogador atual
                  setCurrentPlayer(player);
                } else {
                  // Atualiza outros jogadores
                  newMap.set(player.id, player);
                }
              });

              return newMap;
            });
            break;

          case "game:playerLeft":
            console.log("Jogador saiu:", message.payload);
            setOtherPlayers((prev) => {
              const newMap = new Map(prev);
              newMap.delete(message.payload);
              return newMap;
            });

            if (message.payload === itPlayerId) {
              setItPlayerId(null);
            }
            break;

          case "game:started":
            console.log("Jogo iniciado! Pique:", message.payload.itPlayerId);
            setItPlayerId(message.payload.itPlayerId);

            // Atualiza a cor do jogador atual se ele for o pique
            if (message.payload.itPlayerId === socket.id) {
              setCurrentPlayer((prev) =>
                prev ? { ...prev, isIt: true, color: "red" } : null,
              );
            }
            break;

          case "game:piqueChanged": {
            console.log("Pique mudou para:", message.payload.playerId);
            setItPlayerId(message.payload.playerId);

            // Atualiza o estado dos jogadores
            const piqueOthers = new Map<string, Player>();
            message.payload.players.forEach((player: Player) => {
              if (player.id !== socket.id) {
                piqueOthers.set(player.id, player);
              } else {
                // Atualiza o jogador atual
                setCurrentPlayer(player);
              }
            });
            setOtherPlayers(piqueOthers);
            break;
          }

          case "game:piqueTransferred": {
            console.log(
              `Pique transferido de ${message.payload.fromPlayerId} para ${message.payload.toPlayerId}`,
            );
            setItPlayerId(message.payload.toPlayerId);

            // Atualiza o estado dos jogadores
            const transferOthers = new Map<string, Player>();
            message.payload.players.forEach((player: Player) => {
              if (player.id !== socket.id) {
                transferOthers.set(player.id, player);
              } else {
                // Atualiza o jogador atual
                setCurrentPlayer(player);
              }
            });
            setOtherPlayers(transferOthers);

            // Mostra mensagem se o jogador atual foi envolvido na transferência
            if (message.payload.fromPlayerId === socket.id) {
              console.log("Você passou o pique!");
            } else if (message.payload.toPlayerId === socket.id) {
              console.log("Você está no pique agora!");
            }
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
    otherPlayers,
    isConnected,
    itPlayerId,
  };
}
