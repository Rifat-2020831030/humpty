"use client";

import { useSession } from "@/hooks/useSession";
import {
  ArrowRight,
  Compass,
  MapPin,
  Radio,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function RoleSplashPage() {
  let router: ReturnType<typeof useRouter> | null = null;
  try {
    // Next.js App Router navigation context
    router = useRouter();
  } catch {
    router = null;
  }

  const { sessionId, role, setRole } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectRole = (newRole: "RIDER" | "DRIVER") => {
    setRole(newRole);
    if (router) {
      router.push(newRole === "RIDER" ? "/rider" : "/driver");
    } else if (typeof window !== "undefined") {
      window.location.href = newRole === "RIDER" ? "/rider" : "/driver";
    }
  };

  const handleResetSession = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col justify-between p-5 max-w-lg mx-auto selection:bg-emerald-600">
      {/* Top Header */}
      <header className="pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white">
                  GariKoi
                </h1>
                <span className="text-xs text-neutral-400 font-medium font-bengali">
                  (গাড়ী কই?)
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium">
                Dhaka Rideshare Demo
              </p>
            </div>
          </div>

          <div className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Dhaka Live</span>
          </div>
        </div>
      </header>

      {/* Hero Welcome & Value Proposition */}
      <section className="my-auto py-6 space-y-6">
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
            Ridesharing App Demo
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
            How would you like to use GariKoi today?
          </h2>
        </div>

        {/* Feature Pillars */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-300">
          <div className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl flex items-start gap-2">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">
                Flexible Location
              </span>
              <span className="text-neutral-500 text-[10px]">
                Search, manual pin, or live GPS
              </span>
            </div>
          </div>

          <div className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">AI Search</span>
              <span className="text-neutral-500 text-[10px]">
                Describe e.g. "3 buildings past school"
              </span>
            </div>
          </div>

          <div className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl flex items-start gap-2">
            <Compass className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Dhaka Roads</span>
              <span className="text-neutral-500 text-[10px]">
                Real street coordinates simulation
              </span>
            </div>
          </div>

          <div className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl flex items-start gap-2">
            <Radio className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">
                Live Demand Heatmap
              </span>
              <span className="text-neutral-500 text-[10px]">
                Real-time driver density analytics
              </span>
            </div>
          </div>
        </div>

        {/* Big Role Selection Cards */}
        <div className="space-y-3 pt-2">
          {/* Rider Button */}
          <button
            type="button"
            onClick={() => handleSelectRole("RIDER")}
            className="w-full p-4 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 border border-neutral-800 hover:border-emerald-600 transition-all text-left flex items-center justify-between group active:scale-[0.98] cursor-pointer shadow-lg"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 border border-emerald-500/50 flex items-center justify-center text-white text-2xl group-hover:scale-105 transition-transform shadow-md">
                🙋
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-white">
                    I need a Ride
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                    Rider
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Book Bike, CNG, or Car with flexible pickup & AI search
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-neutral-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </button>

          {/* Driver Button */}
          <button
            type="button"
            onClick={() => handleSelectRole("DRIVER")}
            className="w-full p-4 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 border border-neutral-800 hover:border-emerald-600 transition-all text-left flex items-center justify-between group active:scale-[0.98] cursor-pointer shadow-lg"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white text-2xl group-hover:scale-105 transition-transform shadow-md">
                🚗
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-white">
                    I'm a Driver
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                    Captain
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Go online, view rider demand heatmap & receive ride alerts
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-neutral-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </section>

      {/* Session Footer Info & Reset Action */}
      <footer className="pt-4 border-t border-neutral-900 text-[11px] text-neutral-500 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <ShieldCheck className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
          <span className="truncate">
            Session:{" "}
            <span className="font-mono text-neutral-400">
              {mounted && sessionId
                ? `${sessionId.slice(0, 8)}...`
                : "Ephemeral"}
            </span>
          </span>
        </div>

        <button
          type="button"
          onClick={handleResetSession}
          className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          title="Clear session and start fresh"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Session</span>
        </button>
      </footer>
    </main>
  );
}
