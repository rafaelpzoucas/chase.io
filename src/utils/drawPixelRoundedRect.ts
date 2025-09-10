export const drawPixelatedRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number = 6,
  pixelSize: number = 2, // Novo parâmetro para controlar o tamanho do pixel
) => {
  const r = Math.min(radius, Math.min(width, height) / 2);

  // Corpo principal
  ctx.fillRect(x + r, y, width - 2 * r, height);
  ctx.fillRect(x, y + r, r, height - 2 * r);
  ctx.fillRect(x + width - r, y + r, r, height - 2 * r);

  // Cantos pixelados com pixels maiores
  for (let i = 0; i < r; i += pixelSize) {
    const cornerSize = r - i;

    // Canto superior esquerdo
    ctx.fillRect(x + i, y + cornerSize - pixelSize, pixelSize, pixelSize);
    ctx.fillRect(x + cornerSize - pixelSize, y + i, pixelSize, pixelSize);

    // Canto superior direito
    ctx.fillRect(
      x + width - i - pixelSize,
      y + cornerSize - pixelSize,
      pixelSize,
      pixelSize,
    );
    ctx.fillRect(x + width - cornerSize, y + i, pixelSize, pixelSize);

    // Canto inferior esquerdo
    ctx.fillRect(x + i, y + height - cornerSize, pixelSize, pixelSize);
    ctx.fillRect(
      x + cornerSize - pixelSize,
      y + height - i - pixelSize,
      pixelSize,
      pixelSize,
    );

    // Canto inferior direito
    ctx.fillRect(
      x + width - i - pixelSize,
      y + height - cornerSize,
      pixelSize,
      pixelSize,
    );
    ctx.fillRect(
      x + width - cornerSize,
      y + height - i - pixelSize,
      pixelSize,
      pixelSize,
    );
  }
};
