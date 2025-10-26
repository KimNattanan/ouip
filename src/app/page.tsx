import { GameCanvas, GameContextProvider } from "@/components/game";

export default function Home() {
  return (
    <div className="w-dvw h-dvh overflow-hidden">
      <main className="w-full max-w-[600px] mx-auto relative">
        <GameContextProvider>
          <GameCanvas/>
        </GameContextProvider>
        <div className="text-xl font-semibold">Press space to play</div>
      </main>
    </div>
  );
}
