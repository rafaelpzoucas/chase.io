"use client";

import {
  type CanvasHTMLAttributes,
  type DetailedHTMLProps,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Player } from "@/classes/Player";
import { useSocket } from "@/hooks/use-socket";
import { GAME_CONFIG, PLAYER_COLORS } from "@/utils/constants";

const keys = {
  up: false,
  left: false,
  down: false,
  right: false,
};

const handleKeyDown = (e: KeyboardEvent) => {
  const key = e.key.toLowerCase();

  switch (key) {
    case "w": {
      keys.up = true;
      break;
    }
    case "a": {
      keys.left = true;
      break;
    }
    case "s": {
      keys.down = true;
      break;
    }
    case "d": {
      keys.right = true;
      break;
    }

    default: {
      console.log(key);
    }
  }
};

const handleKeyUp = (e: KeyboardEvent) => {
  const key = e.key.toLowerCase();

  switch (key) {
    case "w": {
      keys.up = false;
      break;
    }
    case "a": {
      keys.left = false;
      break;
    }
    case "s": {
      keys.down = false;
      break;
    }
    case "d": {
      keys.right = false;
      break;
    }

    default: {
      console.log(key);
    }
  }
};

const directions: { [key: string]: { dx: number; dy: number } } = {
  up: { dx: 0, dy: -GAME_CONFIG.PLAYER_SPEED },
  down: { dx: 0, dy: GAME_CONFIG.PLAYER_SPEED },
  left: { dx: -GAME_CONFIG.PLAYER_SPEED, dy: 0 },
  right: { dx: GAME_CONFIG.PLAYER_SPEED, dy: 0 },
};

export function Canvas(
  props: DetailedHTMLProps<
    CanvasHTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  >,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  const playerRef = useRef<Player>(null);
  const lastMovementTime = useRef<number>(0);

  const { socket, currentPlayer, otherPlayers, isConnected } = useSocket();

  const sendPlayerPosition = useCallback(
    (position: { x: number; y: number }) => {
      if (socket && currentPlayer) {
        const now = Date.now();

        if (now - lastMovementTime.current > 16) {
          socket.emit("game:playerMove", { position });
          lastMovementTime.current = now;
        }
      }
    },
    [socket, currentPlayer],
  );

  const canMove = useCallback(
    (player: Player, deltaX: number, deltaY: number) => {
      const canvas = canvasRef.current;
      if (!canvas)
        return { x: player.position.x, y: player.position.y, blocked: false };

      let nextX = player.position.x + deltaX;
      let nextY = player.position.y + deltaY;

      // Limites do canvas
      const maxX = canvas.width - player.width;
      const maxY = canvas.height - player.height;

      // Clamp horizontal
      if (nextX < 0) nextX = 0;
      if (nextX > maxX) nextX = maxX;

      // Clamp vertical
      if (nextY < 0) nextY = 0;
      if (nextY > maxY) nextY = maxY;

      // Checa colisão com outros players
      for (const otherPlayer of otherPlayers.values()) {
        const overlapMargin = 10;
        const overlapX =
          nextX < otherPlayer.position.x + otherPlayer.width - overlapMargin &&
          nextX + player.width - overlapMargin > otherPlayer.position.x;

        const overlapY =
          nextY < otherPlayer.position.y + otherPlayer.height - overlapMargin &&
          nextY + player.height - overlapMargin > otherPlayer.position.y;

        if (overlapX && overlapY) {
          // Ajusta posição para encostar sem atravessar
          if (deltaX > 0) nextX = otherPlayer.position.x - player.width;
          if (deltaX < 0) nextX = otherPlayer.position.x + otherPlayer.width;
          if (deltaY > 0) nextY = otherPlayer.position.y - player.height;
          if (deltaY < 0) nextY = otherPlayer.position.y + otherPlayer.height;

          return {
            x: nextX,
            y: nextY,
            blocked: true,
            collidedWith: otherPlayer,
          };
        }
      }

      return { x: nextX, y: nextY, blocked: false };
    },
    [otherPlayers],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (isConnected && socket && canvas) {
      socket.emit("game:initRequest", {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        playerWidth: GAME_CONFIG.PLAYER_SIZE,
        playerHeight: GAME_CONFIG.PLAYER_SIZE,
      });
    }
  }, [isConnected, socket]);

  useEffect(() => {
    const canvas = canvasRef?.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    canvas.width = innerWidth;
    canvas.height = innerHeight;

    const player = new Player();
    playerRef.current = player;

    if (currentPlayer && player) {
      player.position.x = currentPlayer.position.x;
      player.position.y = currentPlayer.position.y;
      player.color = currentPlayer.isIt
        ? PLAYER_COLORS.PIQUE
        : PLAYER_COLORS.SELECTED;
    }

    const gameLoop = () => {
      let moved = false;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (currentPlayer) {
        player.color = currentPlayer.isIt
          ? PLAYER_COLORS.PIQUE
          : PLAYER_COLORS.SELECTED;
      }

      for (const [key, { dx, dy }] of Object.entries(directions) as [
        keyof typeof keys,
        { dx: number; dy: number },
      ][]) {
        if (keys[key]) {
          const { x, y, blocked, collidedWith } = canMove(player, dx, dy);
          player.position.x = x;
          player.position.y = y;

          if (blocked && collidedWith) {
            console.log(`Colidiu com: ${collidedWith.id}`);
          }

          if (!blocked) moved = true;
        }
      }

      if (moved && isConnected) {
        sendPlayerPosition(player.position);
      }

      player.draw(ctx);

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

    addEventListener("keydown", handleKeyDown);
    addEventListener("keyup", handleKeyUp);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      removeEventListener("keydown", handleKeyDown);
      removeEventListener("keyup", handleKeyUp);
    };
  }, [currentPlayer, otherPlayers, isConnected, sendPlayerPosition, canMove]);

  return <canvas {...props} ref={canvasRef} />;
}
