import "@xyflow/react/dist/style.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Workflow from "./components/CreateWorkflow";

export default function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/create-workflow" element={<Workflow />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
