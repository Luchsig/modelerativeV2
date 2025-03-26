import {Route, Routes} from "react-router-dom";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import AboutPage from "@/pages/about";
import RoomsPage from "@/pages/rooms/rooms.tsx";
import Canvas from "@/pages/canvas/canvas.tsx";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<DocsPage />} path="/docs" />
      <Route element={<AboutPage />} path="/about" />
      <Route element={<RoomsPage />} path="/rooms" />
      <Route element={<Canvas />} path="/rooms/:id" />
    </Routes>
  );
}

export default App;
