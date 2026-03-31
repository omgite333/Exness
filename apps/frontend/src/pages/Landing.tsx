import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bolt,
  Lock,
  ChartNoAxesCombined,
  Headset
} from "lucide-react";
import { FaGithub, FaLinkedin, FaXTwitter, FaGlobe, FaEnvelope } from "react-icons/fa6";

export default function Landing() {
  const navigate = useNavigate();
  const [emailCopied, setEmailCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("support@exness.com");
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <div className="bg-[#020617] text-white font-sans overflow-x-hidden">

      {/* NAVBAR */}
      <nav className="fixed w-full z-50 top-0 bg-[#020617]/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">

          <div className="flex items-center gap-3 cursor-pointer"
         onClick={() => navigate("/")} >  
            <img src="/exness-logo.png" className="h-6" />
            <span className="text-yellow-400 font-semibold text-lg tracking-wide">
              Exness
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <button onClick={() => navigate("/docs")} className="hover:text-white transition">
              Docs
            </button>
            <button onClick={() => navigate("/trade")} className="hover:text-white transition">
              Demo
            </button>
          </div>

          <button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90"
          >
            Start Trading
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">

        <div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Trade the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Markets
            </span>
          </h1>

          <p className="mt-6 text-gray-400 text-lg max-w-xl">
            Lightning-fast execution, institutional-grade liquidity, and a
            modern trading interface designed for serious traders.
          </p>

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              Open Account <ArrowRight size={16} />
            </button>

            <button
              onClick={() => navigate("/trade")}
              className="border border-gray-700 px-6 py-3 rounded-lg hover:bg-gray-800"
            >
              Try Demo
            </button>
          </div>
        </div>

        {/* HERO CARD */}
        <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-6 shadow-xl backdrop-blur-lg">
          <div className="flex justify-between mb-6">
            <div>
              <p className="text-sm text-gray-400">BTC/USD</p>
              <p className="text-3xl font-bold">$48,291</p>
            </div>
            <span className="text-green-400">+5.2%</span>
          </div>

          <div className="h-40 bg-gradient-to-t from-blue-500/10 to-transparent rounded-lg"></div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-[#020617] border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {[
            { icon: Bolt, title: "Fast Execution", desc: "Ultra-low latency trades" },
            { icon: Lock, title: "Secure Funds", desc: "Top-tier security" },
            { icon: ChartNoAxesCombined, title: "Advanced Charts", desc: "Professional tools" },
            { icon: Headset, title: "24/7 Support", desc: "Always available" }
          ].map((item, i) => (
            <div key={i} className="bg-[#0f172a] border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition">
              <item.icon className="text-blue-400 mb-4" />
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-gray-400 text-sm mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center bg-gradient-to-r from-blue-600 to-cyan-500">
        <h2 className="text-4xl font-bold mb-4">Ready to Trade?</h2>
        <button
          onClick={() => navigate("/login")}
          className="bg-white text-black px-8 py-3 rounded-lg font-semibold"
        >
          Create Account
        </button>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#020617] border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">

          <div className="flex items-center gap-2">
            <img src="/exness-logo.png" className="h-5" />
            <span className="text-yellow-400">exness</span>
          </div>

          <div className="flex gap-4">
            <FaGithub />
            <FaLinkedin />
            <FaXTwitter />
            <FaGlobe />
            <button onClick={handleCopyEmail}>
              <FaEnvelope />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}