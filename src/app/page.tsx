import { Card } from "@/components/ui/card";
import { PlayerForm } from "./form";

export default function Home() {
  return (
    <main className="flex items-center justify-center h-screen">
      <Card className="p-4">
        <PlayerForm />
      </Card>
    </main>
  );
}
