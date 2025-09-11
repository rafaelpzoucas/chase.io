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
import { drawPixelatedRoundedRect } from "@/utils/drawPixelRoundedRect";
import { drawPlayerBadge } from "@/utils/drawPlayerBadge";
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
  // Referência para o estado da animação do x1
  const x1AnimationState = useRef({
    isActive: false,
    fade: 0,
    scale: 1,
  });

  const { socket, currentPlayer, activePlayers, isConnected, isX1 } =
    usePartyKit(roomId, nickname);

  // Função helper para enviar mensagens
  const sendMessage = useCallback(
    (type: string, payload?: any) => {
      if (socket && isConnected) {
        socket.send(JSON.stringify({ type, payload }));
      }
    },
    [socket, isConnected],
  );

  // Função para resetar todos os inputs
  const resetAllInputs = useCallback(() => {
    if (!socket || !isConnected) return;

    const directions = ["up", "down", "left", "right"];

    directions.forEach((direction) => {
      sendMessage("game:playerInput", { input: direction, state: false });
    });
  }, [sendMessage, isConnected, socket]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!socket || !isConnected) return;

      // Pausa a movimentação se a animação do x1 estiver ativa
      if (x1AnimationState.current.isActive) return;

      // Se o jogador atual foi eliminado, não processa mais inputs
      if (currentPlayer && currentPlayer.caughtCount >= 3) return;

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

      // Pausa a movimentação se a animação do x1 estiver ativa
      if (x1AnimationState.current.isActive) return;

      // Se o jogador atual foi eliminado, não processa mais inputs
      if (currentPlayer && currentPlayer.caughtCount >= 3) return;

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

  // Novo useEffect para controlar a animação "x1"
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isX1) {
      // RESET TODOS OS INPUTS QUANDO O X1 COMEÇAR
      resetAllInputs();

      // Ativa a animação
      x1AnimationState.current.isActive = true;
      x1AnimationState.current.fade = 0;
      x1AnimationState.current.scale = 1;

      // Desativa a animação após 2 segundos
      timeout = setTimeout(() => {
        x1AnimationState.current.isActive = false;
      }, 2000);
    } else {
      // Se isX1 for false, garante que a animação está desativada
      x1AnimationState.current.isActive = false;
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isX1, resetAllInputs]);

  useEffect(() => {
    const canvas = canvasRef?.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;

      // Desenha o jogador atual (se ainda estiver ativo)
      if (currentPlayer && currentPlayer.caughtCount < 3) {
        ctx.fillStyle = getPlayerColor(currentPlayer, true);

        drawPixelatedRoundedRect(
          ctx,
          currentPlayer.position.x,
          currentPlayer.position.y,
          currentPlayer.width,
          currentPlayer.height,
          6,
          3,
        );
      }

      // Desenha jogadores ativos (exceto o jogador atual)
      activePlayers.forEach((activePlayer) => {
        if (currentPlayer && activePlayer.id === currentPlayer.id) return;

        ctx.fillStyle = getPlayerColor(activePlayer, false);

        drawPixelatedRoundedRect(
          ctx,
          activePlayer.position.x,
          activePlayer.position.y,
          activePlayer.width,
          activePlayer.height,
          6,
          3,
        );
      });

      // --- LÓGICA DE ANIMAÇÃO DO X1 ---
      if (x1AnimationState.current.isActive) {
        // Animação de entrada: escala e opacidade aumentam
        x1AnimationState.current.fade = Math.min(
          1,
          x1AnimationState.current.fade + 0.05,
        );
        x1AnimationState.current.scale = Math.min(
          2.5,
          x1AnimationState.current.scale + 0.05,
        );

        ctx.font = `800 ${x1AnimationState.current.scale * 40}px sans-serif`;
        ctx.fillStyle = `rgba(255, 255, 255, ${x1AnimationState.current.fade})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText("x1", canvas.width / 2, canvas.height / 2);
      }

      // SEGUNDA FASE: Desenha todos os badges por último
      // Badge do jogador atual
      if (currentPlayer && currentPlayer.caughtCount < 3) {
        drawPlayerBadge(
          ctx,
          nickname ?? `Unknown Player`,
          currentPlayer.position.x + currentPlayer.width / 2,
          currentPlayer.position.y - 15,
        );
      }

      // Badges dos jogadores ativos
      activePlayers.forEach((activePlayer) => {
        if (currentPlayer && activePlayer.id === currentPlayer.id) return;

        drawPlayerBadge(
          ctx,
          activePlayer.nickname || `Player ${activePlayer.id.slice(0, 6)}`,
          activePlayer.position.x + activePlayer.width / 2,
          activePlayer.position.y - 15,
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
  }, [currentPlayer, activePlayers, handleKeyDown, handleKeyUp, nickname]);

  return (
    <div>
      <canvas
        {...props}
        ref={canvasRef}
        width={GAME_CONFIG.ARENA_WIDTH}
        height={GAME_CONFIG.ARENA_HEIGHT}
        className="border-4 border-secondary"
      />
    </div>
  );
}
