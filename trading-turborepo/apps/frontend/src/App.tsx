import "@xyflow/react/dist/style.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Workflow from "./components/CreateWorkflow";
import WorkflowsList from "./components/WorkflowsList";

export default function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/workflows" replace />} />
          <Route path="/workflows" element={<WorkflowsList />} />
          <Route path="/create-workflow" element={<Workflow />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
