import { WaveAnimation } from "./components/ui/wave-animation";

export default function DemoBackground() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-black">
      {/* IMPORTANT: z-10 ensures the text is on top. 
         pointer-events-none lets you click "through" the text to the canvas.
      */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <h1 className="text-7xl font-bold tracking-tighter text-white uppercase drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">
          Red Wave
        </h1>
      </div>

      <WaveAnimation 
        waveSpeed={1.5}
        waveIntensity={45} 
        particleColor="#ff0000" 
        pointSize={2.5}
        gridDistance={5}
        className="absolute inset-0"
      /> 
    </main>
  );
}