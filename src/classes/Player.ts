export class Player {
  width: number;
  height: number;
  color: "red" | "green" | "grey";
  position: { x: number; y: number };

  constructor() {
    this.width = 30;
    this.height = 30;
    this.color = "green";
    this.position = {
      x: Math.random() * innerWidth - this.width / 2,
      y: Math.random() * innerHeight - this.height / 2,
    };
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  move(deltaX: number, deltaY: number) {
    this.position.x += deltaX;
    this.position.y += deltaY;

    this.position.x = Math.max(
      0,
      Math.min(innerWidth - this.width, this.position.x),
    );
    this.position.y = Math.max(
      0,
      Math.min(innerHeight - this.height, this.position.y),
    );
  }
}
