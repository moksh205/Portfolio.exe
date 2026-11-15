import { lazy, Suspense } from "react";
import Page from "./site/Page";
import FestivalFX from "./site/FestivalFX";

// three.js is a big chunk: the page renders straight away and the 3D world fades in once loaded
const World = lazy(() => import("./site/World"));

export default function App() {
  return (
    <>
      <div aria-hidden className="page-bg" />
      <Suspense fallback={null}>
        <World />
      </Suspense>
      <FestivalFX />
      <Page />
    </>
  );
}
