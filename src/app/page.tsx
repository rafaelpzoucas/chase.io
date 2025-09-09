import { Card } from "@/components/ui/card";
import { PlayerForm } from "./form";

export default function Home() {
  return (
    <main className="flex items-center justify-center h-screen">
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col text-center gap-4">
          <h2 className="text-4xl font-semibold mb-2 uppercase">
            Crie uma sala
          </h2>
          <Card className="p-4">
            <PlayerForm />
          </Card>
        </div>
      </div>
    </main>
  );
}
