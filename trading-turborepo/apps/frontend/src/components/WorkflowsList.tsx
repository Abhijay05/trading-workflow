import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

type Workflow = {
  _id: string;
  name?: string;
  strategy?: "smart" | "normal";
  createdAt?: string;
  updatedAt?: string;
};

export default function WorkflowsList() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

  const authHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { authorization: token } : {};
  };

  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        const res = await fetch(`${apiBase}/workflow`, {
          headers: { ...authHeader() },
        });
        if (!res.ok) {
          if (res.status === 403) {
            navigate("/signin");
            return;
          }
          return;
        }
        const json = await res.json();
        setWorkflows(json.workflows ?? []);
      } catch (e) {
        console.error("loadWorkflows error", e);
      } finally {
        setLoading(false);
      }
    };
    loadWorkflows();
  }, [apiBase, navigate]);

  const deleteWorkflow = async (id: string) => {
    if (!confirm("Delete this workflow?")) return;
    try {
      const res = await fetch(`${apiBase}/workflow/${id}`, {
        method: "DELETE",
        headers: { ...authHeader() },
      });
      if (res.ok) {
        setWorkflows(workflows.filter((w) => w._id !== id));
      }
    } catch (e) {
      console.error("deleteWorkflow error", e);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center text-white">
        <div>Loading workflows...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">My Workflows</h1>
          <Button
            onClick={() => navigate("/create-workflow")}
            className="bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg"
          >
            + New Workflow
          </Button>
        </div>

        {workflows.length === 0 ? (
          <div className="bg-white/5 backdrop-blur rounded-xl border border-white/10 p-8 text-center text-white/70">
            <p className="text-lg mb-4">No workflows yet</p>
            <Button
              onClick={() => navigate("/create-workflow")}
              className="bg-indigo-500 hover:bg-indigo-400 text-white"
            >
              Create Your First Workflow
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((wf) => (
              <div
                key={wf._id}
                className="bg-white/5 backdrop-blur rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    {wf.name ?? "Untitled Workflow"}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      wf.strategy === "smart"
                        ? "bg-purple-500/20 text-purple-300"
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {wf.strategy === "smart" ? "Smart" : "Normal"}
                  </span>
                </div>
                <div className="text-xs text-white/60 mb-4">
                  {wf.updatedAt
                    ? `Updated ${new Date(wf.updatedAt).toLocaleDateString()}`
                    : wf.createdAt
                    ? `Created ${new Date(wf.createdAt).toLocaleDateString()}`
                    : ""}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/create-workflow?id=${wf._id}`)}
                    variant="outline"
                    className="flex-1 bg-white/10 border-white/15 text-white hover:bg-white/15"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => deleteWorkflow(wf._id)}
                    variant="outline"
                    className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
