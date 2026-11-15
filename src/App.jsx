import { lazy, Suspense } from "react";
import Page from "./site/Page";

// three.js is a big chunk: the page renders straight away and the 3D scene fades in once loaded
const Scene = lazy(() => import("./site/Scene"));

export default function App() {
  return (
    <>
      <div aria-hidden className="page-bg" />
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <Page />
    </>
  );
}
