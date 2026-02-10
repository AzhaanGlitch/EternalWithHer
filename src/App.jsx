import { WaveAnimation } from "./components/ui/wave-animation";

export default function DemoBackground() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-black">

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