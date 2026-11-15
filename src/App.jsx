import { lazy, Suspense, useCallback, useState } from "react";
import BootScreen from "./components/BootScreen";

// The 3D world is a big chunk (three.js) — start loading it while the boot screen runs
const loadWorld = () => import("./iso/IsoWorld");
const IsoWorld = lazy(loadWorld);
loadWorld();

export default function App() {
  const [booting, setBooting] = useState(true);
  const finishBoot = useCallback(() => setBooting(false), []);

  return (
    <div className={`${booting ? "crt " : ""}w-full h-dvh bg-black`}>
      {booting ? (
        <BootScreen onDone={finishBoot} />
      ) : (
        <Suspense fallback={<div className="h-full grid place-items-center font-mono text-green-400">loading island…</div>}>
          <IsoWorld />
        </Suspense>
      )}
    </div>
  );
}
