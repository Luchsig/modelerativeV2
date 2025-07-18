import {Route, Routes} from "react-router-dom";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import AboutPage from "@/pages/about";
import RoomsPage from "@/pages/rooms/rooms.tsx";
import {CanvasPage} from "@/pages/canvas/canvas-page.tsx";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<DocsPage />} path="/docs" />
      <Route element={<AboutPage />} path="/about" />
      <Route element={<RoomsPage />} path="/rooms" />
      <Route element={<CanvasPage />} path="/rooms/:roomId" />
    </Routes>
  );
}

export default App;
