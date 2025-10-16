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
// @ts-expect-error: allow importing CSS side-effect without type declarations
import "reactflow/dist/style.css";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import {
  getDiagram,
  shareDiagram,
  updateDiagram,
} from "@/lib/firebase/firestore";
import { ConfirmToastProps, DeletedNode, Diagram, UserRole } from "@/lib/types";
import { Save, Plus, Share2, ArrowLeft, Trash2 } from "lucide-react";
import { nodeTypes } from "@/components/diagram/diagramNodes/nodeTypes";
import { getUserByEmail } from "@/lib/firebase/auth";
import { toast } from "react-toastify";
import ConfirmToast from "@/components/toastProvider/ConfirmToast";

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
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("editor");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

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
      toast.success("Diagram saved successfully!");
    } catch (error) {
      console.error("Error saving diagram:", error);
      toast.error("Failed to save diagram!");
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
    (deletedNodes: DeletedNode[]): void => {
      setEdges((eds: Edge[]) =>
        eds.filter(
          (edge: Edge) =>
            !deletedNodes.some(
              (node: DeletedNode) =>
                node.id === edge.source || node.id === edge.target
            )
        )
      );
    },
    [setEdges]
  );

  const handleShareDiagramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (email) {
        const user = await getUserByEmail(email);
        if (!user) {
          toast.error("No user found with that email!");
        }
        if (user?.uid === diagram?.ownerId) {
          toast.error("Cannot share diagram with the owner!");
          return;
        }
        if (diagram?.collaborators[user!.uid] === role) {
          toast.error(`User already has ${role} access`);
          return;
        }
        if (diagram) {
          await shareDiagram(diagramId, user!.uid, role);
          toast.success(`Diagram shared with ${email} as ${role}`);
          setShowShareModal(false);
          setEmail("");
        }
      }
    } catch (err) {
      console.error("Error sharing diagram:", err);
      setEmail("");
      setShowShareModal(false);
    } finally {
      setEmail("");
      setShowShareModal(false);
    }
  };
  const handleDeleteSelectedNode = () => {
    if (!permissions.canEdit || !selectedNodeId) return;
    setNodes((nds) => nds.filter((node) => node.id !== selectedNodeId));
    setEdges((eds) =>
      eds.filter(
        (edge) =>
          edge.source !== selectedNodeId && edge.target !== selectedNodeId
      )
    );
    setSelectedNodeId(null);
  };
  const showDeleteSelectedNode = () => {
    toast(
      <ConfirmToast
        onConfirm={() => handleDeleteSelectedNode()}
        onCancel={() => console.log("Canceled!")}
        icon={<Trash2 size={16} className="text-red-500" />}
        title="Delete Node"
        subTitle="Are you sure you want to delete the node."
        primaryButton="Delete"
        secondaryButton="Not now"
        color="red"
      />,
      {
        autoClose: false, // Prevent auto-closing
        closeOnClick: false, // Prevent closing on click outside buttons
      }
    );
  };

  const handleSaveNodes = async () => {
    if (!permissions.canEdit) return;

    setSaving(true);
    try {
      await updateDiagram(diagramId, { nodes, edges });
      toast.success("Diagram saved successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving diagram:", error);
      toast.error("Failed to save diagram!");
    } finally {
      setSaving(false);
    }
  };

  const showBackToDashboard = () => {
    toast(
      <ConfirmToast
        onConfirm={() => handleSaveNodes()}
        onCancel={() => router.push("/dashboard")}
        icon={<Save size={16} className="text-blue-500" />}
        title="Save Nodes"
        subTitle="Are you want to save existing changes."
        primaryButton="Save"
        secondaryButton="Go Back"
        color="blue"
      />,
      {
        autoClose: false, // Prevent auto-closing
        closeOnClick: false, // Prevent closing on click outside buttons
      }
    );
  };

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
              onClick={() => showBackToDashboard()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
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
                  className="flex w-full items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer"
                >
                  <Plus size={16} />
                  Add Node
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save"}
                </button>
              </>
            )}
            {permissions.canShare && (
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
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
          deleteKeyCode={["Backspace", "Delete"]}
          onNodesDelete={handleNodesDelete}
          onPaneClick={() => setSelectedNodeId(null)}
          onConnect={onConnect}
          onNodeClick={(event, node) => setSelectedNodeId(node.id)}
          nodesDraggable={permissions.canEdit}
          nodesConnectable={permissions.canEdit}
          elementsSelectable={permissions.canEdit}
          nodeTypes={nodeTypes}
        >
          <Background />
          <Controls>
            {selectedNodeId && (
              <button
                onClick={showDeleteSelectedNode}
                className="px-1 py-1 mt-1 w-[25px] h-[30px] bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            )}
          </Controls>
        </ReactFlow>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Share Diagram
            </h2>
            <div>
              <form
                className="mt-8 space-y-6"
                onSubmit={handleShareDiagramSubmit}
              >
                <div className="rounded-md shadow-sm space-y-4">
                  <div>
                    <label htmlFor="email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Account Type
                    </label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="w-full px-4 py-2 mt-3 bg-red-600 hover:bg-red-700  text-white rounded-md cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ConfirmDeleteNodeToast = ({
  closeToast = () => {},
  onConfirm,
  onCancel,
}: ConfirmToastProps) => (
  <div>
    <div className="flex">
      <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg ">
        <Trash2 size={16} />
        <span className="sr-only">Delete icon</span>
      </div>
      <div className="ms-3 text-sm font-normal">
        <span className="mb-1 text-sm font-medium text-gray-900">
          Delete Node
        </span>
        <div className="mb-2 text-sm font-normal">
          Are you sure you want to delete the node.
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <a
              href="#"
              onClick={() => {
                onConfirm();
                closeToast();
              }}
              className="inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-white bg-red-600 rounded-lg focus:ring-4 focus:outline-none focus:ring-blue-300"
            >
              Delete
            </a>
          </div>
          <div>
            <a
              href="#"
              onClick={() => {
                onCancel();
                closeToast();
              }}
              className="inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700"
            >
              Not now
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ConfirmBackToDashboardToast = ({
  closeToast = () => {},
  onConfirm,
  onCancel,
}: ConfirmToastProps) => (
  <div>
    <div className="flex">
      <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-blue-500 bg-blue-100 rounded-lg ">
        <Save size={16} />
        <span className="sr-only">Save icon</span>
      </div>
      <div className="ms-3 text-sm font-normal">
        <span className="mb-1 text-sm font-medium text-gray-900">
          Save Nodes
        </span>
        <div className="mb-2 text-sm font-normal">
          Are you want to save existing changes.
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <a
              href="#"
              onClick={() => {
                onConfirm();
                closeToast();
              }}
              className="inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-white bg-blue-600 rounded-lg focus:ring-4 focus:outline-none focus:ring-blue-300"
            >
              Save
            </a>
          </div>
          <div>
            <a
              href="#"
              onClick={() => {
                onCancel();
                closeToast();
              }}
              className="inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700"
            >
              Go Back
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
);
