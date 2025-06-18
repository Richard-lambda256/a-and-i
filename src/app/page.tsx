import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sciFiBg to-sciFiBg/80">
      <Card className="w-full max-w-2xl p-8 border-[var(--primary)]">
        <h1 className="text-4xl font-bold mb-6 text-[var(--primary)] neon-glow text-center">
          A&I
        </h1>
        <p className="text-[var(--muted-foreground)] text-center mb-8">
          AI-powered learning mentor system for hackathons
        </p>
        <div className="flex flex-col gap-4">
          <Link href="/ai/key">
            <Button
              className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] font-[Orbitron] shadow-neon border border-[var(--primary)] hover:brightness-125"
            >
              START COACHING
            </Button>
          </Link>
          <Link href="/ai/chat">
            <Button
              variant="outline"
              className="w-full border-[var(--primary)] text-[var(--primary)] font-[Orbitron] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]"
            >
              CONTINUE SESSION
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
