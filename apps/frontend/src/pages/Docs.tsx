import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Database,
  Webhook,
  Server,
  Radio,
  Layout,
  Cpu,
  Layers,
  ArrowRight,
  Activity,
  ExternalLink
} from "lucide-react";

export default function Docs() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#020617] text-white font-sans min-h-screen">

      {/* GRID BACKGROUND */}
      <div className="fixed inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#fff1_1px,transparent_1px),linear-gradient(to_bottom,#fff1_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* NAV */}
      <nav className="fixed w-full z-50 top-0 bg-[#020617]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">

          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <img src="/exness-logo.png" className="h-6" />
            <span className="text-yellow-400 font-semibold">exness</span>
          </div>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </nav>

      <main className="pt-32 max-w-7xl mx-auto px-6">

        {/* HERO */}
        <section className="mb-24">

          <p className="text-sm text-blue-400 mb-4">
            SYSTEM DOCS
          </p>

          <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-6">
            System{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Architecture
            </span>
          </h1>

          <p className="text-gray-400 max-w-3xl text-lg leading-relaxed">
            A distributed trading system built for speed. Execution happens in-memory,
            powered by Redis streams and a custom matching engine.
          </p>

        </section>

        {/* PIPELINE */}
        <section className="mb-32">

          <h2 className="text-3xl font-semibold mb-10 flex items-center gap-2">
            <Activity className="text-cyan-400" />
            Execution Pipeline
          </h2>

          <div className="bg-[#0f172a]/60 border border-white/10 rounded-2xl p-10 backdrop-blur-xl">

            <div className="grid md:grid-cols-5 gap-6 text-center text-sm">

              {["Poller", "Redis", "WebSocket", "Frontend", "Engine"].map((item, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl bg-[#020617]/60 border border-white/10 hover:border-cyan-400 transition"
                >
                  {item}
                </div>
              ))}

            </div>
          </div>
        </section>

        {/* COMPONENTS */}
        <section className="mb-32">

          <h2 className="text-3xl font-semibold mb-12">
            System Components
          </h2>

          <div className="grid md:grid-cols-2 gap-8">

            {[
              {
                title: "Frontend",
                desc: "React + WebSockets UI for real-time trading."
              },
              {
                title: "Backend",
                desc: "Handles validation and request routing."
              },
              {
                title: "Engine",
                desc: "In-memory execution engine (<1ms latency)."
              },
              {
                title: "Redis",
                desc: "Central messaging layer."
              },
              {
                title: "WebSocket",
                desc: "Broadcasts real-time updates."
              },
              {
                title: "Databases",
                desc: "Postgres + Mongo for persistence."
              }
            ].map((item, i) => (
              <div
                key={i}
                className="group relative p-6 bg-[#0f172a]/60 border border-white/10 rounded-2xl backdrop-blur-xl hover:border-cyan-400 transition"
              >
                <h3 className="text-xl font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {item.desc}
                </p>
              </div>
            ))}

          </div>
        </section>

      </main>
    </div>
  );
}