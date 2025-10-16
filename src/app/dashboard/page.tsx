"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  getUserDiagrams,
  createDiagram,
  deleteDiagram,
} from "@/lib/firebase/firestore";
import { Diagram } from "@/lib/types";
import { Plus, Trash2, Edit, Eye } from "lucide-react";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [isLoadingDiagrams, setIsLoadingDiagrams] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDiagramTitle, setNewDiagramTitle] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadDiagrams();
    }
  }, [user]);

  const loadDiagrams = async () => {
    if (!user) return;
    setIsLoadingDiagrams(true);
    try {
      const userDiagrams = await getUserDiagrams(user.uid);
      setDiagrams(userDiagrams);
    } catch (error) {
      console.error("Error loading diagrams:", error);
    } finally {
      setIsLoadingDiagrams(false);
    }
  };

  const handleCreateDiagram = async () => {
    if (!user || !newDiagramTitle.trim()) return;

    try {
      const diagramId = await createDiagram(user.uid, user.email, {
        title: newDiagramTitle,
        nodes: [],
        edges: [],
      });
      setShowCreateModal(false);
      setNewDiagramTitle("");
      router.push(`/diagram/${diagramId}`);
    } catch (error) {
      console.error("Error creating diagram:", error);
    }
  };

  const handleDeleteDiagram = async (diagramId: string) => {
    if (!confirm("Are you sure you want to delete this diagram?")) return;

    try {
      await deleteDiagram(diagramId);
      await loadDiagrams();
    } catch (error) {
      console.error("Error deleting diagram:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading || isLoadingDiagrams) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Diagrams
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user.email} ({user.role})
            </span>
            <button
              onClick={() => router.push("/profile")}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Button */}
        {user.role === "editor" && (
          <div className="mb-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus size={20} />
              Create New Diagram
            </button>
          </div>
        )}

        {/* Diagrams Grid */}
        {diagrams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No diagrams found.{" "}
              {user.role === "editor" && "Create your first diagram!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diagrams.map((diagram) => {
              const isOwner = diagram.ownerId === user.uid;
              const userRole = isOwner
                ? "owner"
                : diagram.collaborators[user.uid];

              return (
                <div
                  key={diagram.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {diagram.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        isOwner
                          ? "bg-green-100 text-green-800"
                          : userRole === "editor"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {isOwner ? "Owner" : userRole}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {diagram.nodes.length} nodes, {diagram.edges.length} edges
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                    Updated: {diagram.updatedAt.toLocaleDateString()}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/diagram/${diagram.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                    >
                      {userRole === "viewer" ? (
                        <>
                          <Eye size={16} />
                          View
                        </>
                      ) : (
                        <>
                          <Edit size={16} />
                          Edit
                        </>
                      )}
                    </button>
                    {isOwner && (
                      <button
                        onClick={() => handleDeleteDiagram(diagram.id)}
                        className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Diagram Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Create New Diagram
            </h2>
            <input
              type="text"
              value={newDiagramTitle}
              onChange={(e) => setNewDiagramTitle(e.target.value)}
              placeholder="Diagram title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 text-gray-900"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateDiagram}
                disabled={!newDiagramTitle.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewDiagramTitle("");
                }}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
