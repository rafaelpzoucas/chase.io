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

  const {
    socket,
    currentPlayer,
    activePlayers,
    eliminatedPlayers,
    isConnected,
  } = usePartyKit(roomId, nickname);

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

      // Se o jogador atual foi eliminado, não processa mais inputs
      if (currentPlayer && currentPlayer.caught_count >= 3) return;

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
        case "arrowup":
          direction = "up";
          break;
        case "arrowleft":
          direction = "left";
          break;
        case "arrowdown":
          direction = "down";
          break;
        case "arrowright":
          direction = "right";
          break;
        default:
          return;
      }

      sendMessage("game:playerInput", { input: direction, state: true });
    },
    [sendMessage, isConnected, socket, currentPlayer],
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (!socket || !isConnected) return;

      // Se o jogador atual foi eliminado, não processa mais inputs
      if (currentPlayer && currentPlayer.caught_count >= 3) return;

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
        case "arrowup":
          direction = "up";
          break;
        case "arrowleft":
          direction = "left";
          break;
        case "arrowdown":
          direction = "down";
          break;
        case "arrowright":
          direction = "right";
          break;
        default:
          return;
      }

      sendMessage("game:playerInput", { input: direction, state: false });
    },
    [sendMessage, isConnected, socket, currentPlayer],
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

      // Desenha o jogador atual (se ainda estiver ativo)
      if (currentPlayer && currentPlayer.caught_count < 3) {
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

      // Desenha jogadores ativos (exceto o jogador atual)
      activePlayers.forEach((activePlayer) => {
        // Não desenhar o jogador atual novamente se ele já foi desenhado acima
        if (currentPlayer && activePlayer.id === currentPlayer.id) return;

        ctx.fillStyle = getPlayerColor(activePlayer, false);
        ctx.fillRect(
          activePlayer.position.x,
          activePlayer.position.y,
          activePlayer.width,
          activePlayer.height,
        );

        // Desenha o nome do jogador ativo
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          activePlayer.nickname || `Player ${activePlayer.id.slice(0, 6)}`,
          activePlayer.position.x + activePlayer.width / 2,
          activePlayer.position.y - 5,
        );
      });

      // Opcional: Desenhar jogadores eliminados como "fantasmas" (com transparência)
      eliminatedPlayers.forEach((eliminatedPlayer) => {
        // Não desenhar o jogador atual novamente se ele foi eliminado
        if (currentPlayer && eliminatedPlayer.id === currentPlayer.id) return;

        ctx.save();
        ctx.globalAlpha = 0.3; // Transparência para jogadores eliminados

        ctx.fillStyle = getPlayerColor(eliminatedPlayer, false);
        ctx.fillRect(
          eliminatedPlayer.position.x,
          eliminatedPlayer.position.y,
          eliminatedPlayer.width,
          eliminatedPlayer.height,
        );

        // Desenha o nome do jogador eliminado
        ctx.fillStyle = "gray";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          `${eliminatedPlayer.nickname || `Player ${eliminatedPlayer.id.slice(0, 6)}`} (X)`,
          eliminatedPlayer.position.x + eliminatedPlayer.width / 2,
          eliminatedPlayer.position.y - 5,
        );

        ctx.restore();
      });

      // Se o jogador atual foi eliminado, mostrar mensagem
      if (currentPlayer && currentPlayer.caught_count >= 3) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          "VOCÊ FOI ELIMINADO!",
          canvas.width / 2,
          canvas.height / 2 - 30,
        );

        ctx.font = "24px Arial";
        ctx.fillText(
          "Assista o resto da partida",
          canvas.width / 2,
          canvas.height / 2 + 20,
        );

        ctx.restore();
      }

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
  }, [
    currentPlayer,
    activePlayers,
    eliminatedPlayers,
    handleKeyDown,
    handleKeyUp,
    nickname,
  ]);

  return (
    <div>
      <canvas
        {...props}
        ref={canvasRef}
        width={GAME_CONFIG.ARENA_WIDTH}
        height={GAME_CONFIG.ARENA_HEIGHT}
        className="border-4"
      />
    </div>
  );
}
