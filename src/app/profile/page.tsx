"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, LogOut, User, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
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
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <User size={40} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Profile</h1>
                <p className="text-indigo-100">
                  Manage your account information
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="px-6 py-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <User size={18} className="text-gray-500 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {user.email}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Role
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <Shield
                  size={18}
                  className="text-gray-500 dark:text-gray-400"
                />
                <span className="text-gray-900 dark:text-white capitalize">
                  {user.role}
                </span>
                <span
                  className={`ml-auto text-xs px-3 py-1 rounded-full ${
                    user.role === "editor"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  }`}
                >
                  {user.role === "editor" ? "Can Edit & Create" : "View Only"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Created
              </label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <span className="text-gray-900 dark:text-white">
                  {user.createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Account Actions
              </h3>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <LogOut size={18} />
                Logout from Account
              </button>
            </div>
          </div>

          {/* Role Description */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              What can {user.role}s do?
            </h4>
            {user.role === "editor" ? (
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Create new diagrams</li>
                <li>• Edit and modify existing diagrams</li>
                <li>• Delete diagrams you own</li>
                <li>• Share diagrams with others</li>
                <li>• Add and remove nodes and edges</li>
              </ul>
            ) : (
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• View diagrams shared with you</li>
                <li>• Browse diagram content in read-only mode</li>
                <li>• Cannot create or edit diagrams</li>
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
