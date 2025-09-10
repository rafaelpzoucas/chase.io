export const drawPlayerBadge = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number = 12,
) => {
  // Salva o estado atual do contexto
  ctx.save();

  // Define a fonte para medir o texto
  ctx.font = `${fontSize}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Mede o texto para definir o tamanho do badge
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const textHeight = fontSize;

  // Padding do badge
  const paddingX = 4;
  const paddingY = 2;

  // Dimensões do badge
  const badgeWidth = textWidth + paddingX * 2;
  const badgeHeight = textHeight + paddingY * 2;

  // Posição do badge (centralizado)
  const badgeX = x - badgeWidth / 2;
  const badgeY = y - badgeHeight / 2;

  // Desenha o fundo do badge (branco com transparência)
  ctx.fillStyle = "rgba(255, 255, 255, 0.20)";
  ctx.beginPath();
  ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
  ctx.fill();

  // Desenha o texto
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillText(text, x, y);

  // Restaura o estado do contexto
  ctx.restore();
};
