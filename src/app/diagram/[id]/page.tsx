"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  Connection,
  useNodesState,
  useEdgesState,
  NodeChange,
  EdgeChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { getDiagram, updateDiagram } from "@/lib/firebase/firestore";
import { Diagram } from "@/lib/types";
import { Save, Plus, Share2, ArrowLeft } from "lucide-react";
import { nodeTypes } from "@/components/diagram/diagramNodes/nodeTypes";

export default function DiagramEditorPage() {
  const params = useParams();
  const diagramId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeLabel, setNodeLabel] = useState("");
  const [nodeShape, setNodeShape] = useState("rectangle");
  const [showShareModal, setShowShareModal] = useState(false);

  const permissions = usePermissions(user, diagram);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && diagramId) {
      loadDiagram();
    }
  }, [user, diagramId]);

  const loadDiagram = async () => {
    setLoading(true);
    try {
      const diagramData = await getDiagram(diagramId);

      if (!diagramData) {
        router.push("/dashboard");
        return;
      }
      setDiagram(diagramData);
      setNodes(diagramData.nodes);
      setEdges(diagramData.edges);
    } catch (error) {
      console.error("Error loading diagram:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!permissions.canEdit) return;

    setSaving(true);
    try {
      await updateDiagram(diagramId, { nodes, edges });
      alert("Diagram saved successfully!");
    } catch (error) {
      console.error("Error saving diagram:", error);
      alert("Failed to save diagram");
    } finally {
      setSaving(false);
    }
  };

  const handleAddNode = () => {
    if (!permissions.canEdit) return;

    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: nodeShape || "default",
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: nodeLabel || `Node ${nodes.length + 1}` },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeLabel("");
  };

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!permissions.canEdit) return;
      setEdges((eds) => addEdge(connection, eds));
    },
    [permissions.canEdit]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (!permissions.canEdit) {
        const viewOnlyChanges = changes.filter(
          (change) => change.type === "position" && !change.dragging
        );
        if (viewOnlyChanges.length === 0) return;
      }
      onNodesChange(changes);
    },
    [permissions.canEdit, onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (!permissions.canEdit) return;
      onEdgesChange(changes);
    },
    [permissions.canEdit, onEdgesChange]
  );

  const handleNodesDelete = useCallback(
    (deletedNodes) => {
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            !deletedNodes.some(
              (node) => node.id === edge.source || node.id === edge.target
            )
        )
      );
    },
    [setEdges]
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !diagram || !permissions.canView) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {diagram.title}
              </h1>
              <p className="text-sm text-gray-500">
                {permissions.isOwner
                  ? "Owner"
                  : `${permissions.userRole} access`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {permissions.canEdit && (
              <>
                <input
                  type="text"
                  value={nodeLabel}
                  onChange={(e) => setNodeLabel(e.target.value)}
                  placeholder="Node label"
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  onKeyPress={(e) => e.key === "Enter" && handleAddNode()}
                />
                <div className="w-full max-w-sm min-w-[200px]">
                  <div className="relative">
                    <select
                      value={nodeShape}
                      onChange={(e) => setNodeShape(e.target.value)}
                      className="w-full bg-transparent placeholder:text-slate-400 text-slate-400 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"
                    >
                      <option value="rectangle">Rectangle shape</option>
                      <option value="square">Square shape</option>
                      <option value="circle">Circle shape</option>
                      <option value="diamond">Diamond shape</option>
                    </select>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.2"
                      stroke="currentColor"
                      className="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-slate-700"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={handleAddNode}
                  className="flex w-full items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Plus size={16} />
                  Add Node
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save"}
                </button>
              </>
            )}
            {permissions.canShare && (
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Share2 size={16} />
                Share
              </button>
            )}
            {!permissions.canEdit && (
              <span className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm">
                View Only
              </span>
            )}
          </div>
        </div>
      </header>

      {/* React Flow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onNodesDelete={handleNodesDelete}
          onConnect={onConnect}
          nodesDraggable={permissions.canEdit}
          nodesConnectable={permissions.canEdit}
          elementsSelectable={permissions.canEdit}
          nodeTypes={nodeTypes}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Share Diagram
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Sharing functionality coming soon. You can share diagrams by
              inviting users via email.
            </p>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
