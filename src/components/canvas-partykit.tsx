"use client";

import {
  type CanvasHTMLAttributes,
  type DetailedHTMLProps,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { usePartyKit } from "@/hooks/use-partykit";
import { GAME_CONFIG, PLAYER_COLORS } from "@/utils/constants";
import { getPlayerColor } from "@/utils/getPlayerColors";

interface CanvasPartykitProps
  extends DetailedHTMLProps<
    CanvasHTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  > {
  roomId: string;
  nickname: string | null;
}

export function CanvasPartykit({
  roomId,
  nickname,
  ...props
}: CanvasPartykitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);

  const { socket, currentPlayer, otherPlayers, isConnected } = usePartyKit(
    roomId,
    nickname,
  );

  // Função helper para enviar mensagens
  const sendMessage = useCallback(
    (type: string, payload?: any) => {
      if (socket && isConnected) {
        socket.send(JSON.stringify({ type, payload }));
      }
    },
    [socket, isConnected],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!socket || !isConnected) return;

      const key = e.key.toLowerCase();
      let direction = "";

      switch (key) {
        case "w":
          direction = "up";
          break;
        case "a":
          direction = "left";
          break;
        case "s":
          direction = "down";
          break;
        case "d":
          direction = "right";
          break;
        default:
          return;
      }

      sendMessage("game:playerInput", { input: direction, state: true });
    },
    [sendMessage, isConnected, socket],
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (!socket || !isConnected) return;

      const key = e.key.toLowerCase();
      let direction = "";

      switch (key) {
        case "w":
          direction = "up";
          break;
        case "a":
          direction = "left";
          break;
        case "s":
          direction = "down";
          break;
        case "d":
          direction = "right";
          break;
        default:
          return;
      }

      sendMessage("game:playerInput", { input: direction, state: false });
    },
    [sendMessage, isConnected, socket],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (isConnected && socket && canvas) {
      sendMessage("game:initRequest");
    }
  }, [isConnected, socket, sendMessage]);

  useEffect(() => {
    const canvas = canvasRef?.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // // Desenha informações da sala no canto superior esquerdo
      // ctx.fillStyle = "black";
      // ctx.font = "16px Arial";
      // ctx.fillText(`Sala: ${roomId}`, 10, 25);
      // ctx.fillText(`Jogador: ${nickname}`, 10, 45);
      // ctx.fillText(`Conectado: ${isConnected ? "Sim" : "Não"}`, 10, 65);
      // ctx.fillText(
      //   `Total Jogadores: ${otherPlayers.size + (currentPlayer ? 1 : 0)}`,
      //   10,
      //   85,
      // );

      // Desenha o jogador atual
      if (currentPlayer) {
        ctx.fillStyle = getPlayerColor(currentPlayer, true);
        ctx.fillRect(
          currentPlayer.position.x,
          currentPlayer.position.y,
          currentPlayer.width,
          currentPlayer.height,
        );

        // Desenha o nome do jogador atual
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          nickname ?? `Unknown Player`,
          currentPlayer.position.x + currentPlayer.width / 2,
          currentPlayer.position.y - 5,
        );
      }

      // Desenha outros jogadores
      otherPlayers.forEach((otherPlayer) => {
        ctx.fillStyle = getPlayerColor(otherPlayer, false);
        ctx.fillRect(
          otherPlayer.position.x,
          otherPlayer.position.y,
          otherPlayer.width,
          otherPlayer.height,
        );

        // Desenha o nome do outro jogador (se disponível)
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          otherPlayer.nickname || `Player ${otherPlayer.id.slice(0, 6)}`,
          otherPlayer.position.x + otherPlayer.width / 2,
          otherPlayer.position.y - 5,
        );
      });

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [currentPlayer, otherPlayers, handleKeyDown, handleKeyUp, nickname]);

  return (
    <canvas
      {...props}
      ref={canvasRef}
      width={GAME_CONFIG.ARENA_WIDTH}
      height={GAME_CONFIG.ARENA_HEIGHT}
      className="border-4 rounded-lg shadow-lg"
    />
  );
}
