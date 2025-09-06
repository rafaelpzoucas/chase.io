"use client";

import {
  type CanvasHTMLAttributes,
  type DetailedHTMLProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSocket } from "@/hooks/use-socket";
import { GAME_CONFIG, PLAYER_COLORS } from "@/utils/constants";

export function Canvas(
  props: DetailedHTMLProps<
    CanvasHTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  >,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const { socket, currentPlayer, otherPlayers, isConnected } = useSocket();

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

      socket.emit("game:playerInput", { input: direction, state: true });
    },
    [socket, isConnected],
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

      socket.emit("game:playerInput", { input: direction, state: false });
    },
    [socket, isConnected],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (isConnected && socket && canvas) {
      socket.emit("game:initRequest", {
        playerWidth: GAME_CONFIG.PLAYER_SIZE,
        playerHeight: GAME_CONFIG.PLAYER_SIZE,
      });
    }
  }, [isConnected, socket]);

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef?.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Desenha o jogador atual
      if (currentPlayer) {
        ctx.fillStyle = currentPlayer.isIt
          ? PLAYER_COLORS.PIQUE
          : PLAYER_COLORS.SELECTED;
        ctx.fillRect(
          currentPlayer.position.x,
          currentPlayer.position.y,
          currentPlayer.width,
          currentPlayer.height,
        );
      }

      // Desenha outros jogadores
      otherPlayers.forEach((otherPlayer) => {
        const color = otherPlayer.isIt
          ? PLAYER_COLORS.PIQUE
          : PLAYER_COLORS.NORMAL;

        ctx.fillStyle = color;
        ctx.fillRect(
          otherPlayer.position.x,
          otherPlayer.position.y,
          otherPlayer.width,
          otherPlayer.height,
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
  }, [currentPlayer, otherPlayers, handleKeyDown, handleKeyUp]);

  return (
    <canvas
      {...props}
      ref={canvasRef}
      width={GAME_CONFIG.ARENA_WIDTH}
      height={GAME_CONFIG.ARENA_HEIGHT}
      className="border-4"
    />
  );
}
