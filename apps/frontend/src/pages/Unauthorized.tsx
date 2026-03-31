import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white relative overflow-hidden">

      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#fff1_1px,transparent_1px),linear-gradient(to_bottom,#fff1_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* GLOW */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-blue-500/20 blur-3xl" />

      {/* CONTENT */}
      <div className="relative z-10 text-center px-6 max-w-md">

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <img src="/exness-logo.png" className="h-6 opacity-80" />
        </div>

        {/* CODE */}
        <h1 className="text-6xl font-bold mb-4">
          401
        </h1>

        {/* TITLE */}
        <h2 className="text-2xl font-semibold mb-3">
          Unauthorized Access
        </h2>

        {/* DESCRIPTION */}
        <p className="text-gray-400 mb-8">
          You don’t have permission to access this page.
        </p>

        {/* ACTIONS */}
        <div className="flex justify-center gap-4">

          <Link
            to="/login"
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 font-medium shadow-lg shadow-blue-500/30 hover:scale-105 transition"
          >
            Go to Login
          </Link>

          <Link
            to="/"
            className="px-6 py-3 rounded-lg border border-white/20 hover:bg-white/5 transition"
          >
            Home
          </Link>

        </div>

        {/* EXTRA */}
        <p className="mt-10 text-xs text-gray-500">
          Error Code: 401_UNAUTHORIZED
        </p>
      </div>
    </div>
  );
}