import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuthCheck } from "@/lib/useAuthCheck";
import { useSessionStore } from "@/lib/session";

export default function Login() {
  const [email, setEmail] = useState("");

  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: async () => {
      const cleanEmail = email.trim();
      await api.post("/auth/signup", { email: cleanEmail });
    }
  });

  const { isSuccess: isAuthSuccess } = useAuthCheck();
  const navigate = useNavigate();
  const isGuest = useSessionStore((s) => s.isGuest);

  useEffect(() => {
    if (isAuthSuccess && !isGuest) {
      navigate("/trade", { replace: true });
    }
  }, [isAuthSuccess, isGuest, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white relative overflow-hidden">

      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#fff1_1px,transparent_1px),linear-gradient(to_bottom,#fff1_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* GLOW */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-cyan-500/20 blur-3xl" />

      {/* CARD */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-[#0f172a]/70 backdrop-blur-xl border border-white/10 shadow-2xl">

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <img src="/exness-logo.png" className="h-6" />
        </div>

        {/* TITLE */}
        <h1 className="text-3xl font-semibold text-center mb-2">
          Secure Access
        </h1>

        <p className="text-gray-400 text-center mb-8 text-sm">
          Enter your email to receive a magic login link.
        </p>

        {/* FORM */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutate();
          }}
          className="space-y-6"
        >
          <div>
            <label className="text-xs text-gray-400 mb-2 block">
              Email Address
            </label>

            <input
              type="email"
              required
              placeholder="trader@exness.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#020617] border border-white/10 focus:border-cyan-400 outline-none transition placeholder:text-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 font-medium hover:opacity-90 transition shadow-lg shadow-blue-500/30"
          >
            {isPending ? "Authenticating..." : "Send Magic Link"}
          </button>
        </form>

        {/* SUCCESS */}
        {isSuccess && (
          <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
            Magic link sent. Check your inbox.
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {(error as Error).message || "Something went wrong"}
          </div>
        )}
      </div>
    </div>
  );
}