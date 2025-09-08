import { nanoid } from "nanoid";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nickname = searchParams.get("nickname");

  if (!nickname) {
    return new Response(JSON.stringify({ error: "Nickname is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const roomId = nanoid(6);

  return new Response(JSON.stringify({ roomId }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
