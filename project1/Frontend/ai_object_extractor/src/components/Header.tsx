"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  if (!session) {
    return null;
  }

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            AI Object Extractor
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              Welcome, {session.user?.name || session.user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
