import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { GameInitData } from "@/types/game";
import type { Player } from "@/types/player";

interface UseSocketReturn {
  socket: Socket | null;
  currentPlayer: Player | null;
  otherPlayers: Map<string, Player>;
  isConnected: boolean;
  itPlayerId: string | null;
}

export function useSocket(
  serverUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [otherPlayers, setOtherPlayers] = useState<Map<string, Player>>(
    new Map(),
  );
  const [isConnected, setIsConnected] = useState(false);
  const [itPlayerId, setItPlayerId] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies(itPlayerId): suppress dependency itPlayerId
  useEffect(() => {
    // Conectar ao servidor
    const socket = io(serverUrl, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    // Event listeners
    socket.on("connect", () => {
      console.log("Conectado ao servidor:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Desconectado do servidor");
      setIsConnected(false);
      setCurrentPlayer(null);
      setOtherPlayers(new Map());
    });

    socket.on("game:init", (data: GameInitData) => {
      console.log("Jogo inicializado:", data);
      setCurrentPlayer(data.player);

      // Adicionar outros jogadores (exceto o jogador atual)
      const others = new Map<string, Player>();
      data.players.forEach((player) => {
        if (player.id !== data.playerId) {
          others.set(player.id, player);
        }
      });
      setOtherPlayers(others);
    });

    socket.on("game:playerJoined", (player: Player) => {
      console.log("Jogador entrou:", player);
      setOtherPlayers((prev) => {
        const newMap = new Map(prev);
        newMap.set(player.id, player);
        return newMap;
      });
    });

    socket.on(
      "game:playerMoved",
      (data: { playerId: string; position: { x: number; y: number } }) => {
        setOtherPlayers((prev) => {
          const newMap = new Map(prev);
          const player = newMap.get(data.playerId);
          if (player) {
            newMap.set(data.playerId, { ...player, position: data.position });
          }
          return newMap;
        });
      },
    );

    socket.on("game.playerLeft", (playerId: string) => {
      console.log("Jogador saiu:", playerId);
      setOtherPlayers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(playerId);
        return newMap;
      });

      if (playerId === itPlayerId) {
        setItPlayerId(null);
      }
    });

    socket.on(
      "game:started",
      (data: { itPlayerId: string; players: Player[] }) => {
        console.log("Jogo iniciado! Pique:", data.itPlayerId);
        setItPlayerId(data.itPlayerId);

        // Atualiza a cor do jogador atual se ele for o pique
        if (data.itPlayerId === socket.id) {
          setCurrentPlayer((prev) =>
            prev ? { ...prev, isIt: true, color: "red" } : null,
          );
        }
      },
    );

    // Novo evento: quando o pique muda
    socket.on(
      "game:piqueChanged",
      (data: { playerId: string; players: Player[] }) => {
        console.log("Pique mudou para:", data.playerId);
        setItPlayerId(data.playerId);

        // Atualiza o estado dos jogadores
        const others = new Map<string, Player>();
        data.players.forEach((player) => {
          if (player.id !== socket.id) {
            others.set(player.id, player);
          } else {
            // Atualiza o jogador atual
            setCurrentPlayer(player);
          }
        });
        setOtherPlayers(others);
      },
    );

    // Novo evento: quando o pique é transferido
    socket.on(
      "game:piqueTransferred",
      (data: {
        fromPlayerId: string;
        toPlayerId: string;
        players: Player[];
      }) => {
        console.log(
          `Pique transferido de ${data.fromPlayerId} para ${data.toPlayerId}`,
        );
        setItPlayerId(data.toPlayerId);

        // Atualiza o estado dos jogadores
        const others = new Map<string, Player>();
        data.players.forEach((player) => {
          if (player.id !== socket.id) {
            others.set(player.id, player);
          } else {
            // Atualiza o jogador atual
            setCurrentPlayer(player);
          }
        });
        setOtherPlayers(others);

        // Mostra mensagem se o jogador atual foi envolvido na transferência
        if (data.fromPlayerId === socket.id) {
          console.log("Você passou o pique!");
        } else if (data.toPlayerId === socket.id) {
          console.log("Você está no pique agora!");
        }
      },
    );

    socket.on("pong", () => {
      console.log("Pong recebido");
    });

    // Cleanup na desmontagem
    return () => {
      socket.disconnect();
    };
  }, [serverUrl]);

  return {
    socket: socketRef.current,
    currentPlayer,
    otherPlayers,
    isConnected,
    itPlayerId,
  };
}
