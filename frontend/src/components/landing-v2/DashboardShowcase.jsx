import React from 'react';
import { Terminal, Activity, Zap, CheckCircle2 } from 'lucide-react';

const DashboardShowcase = () => {
  return (
    <section className="w-full py-32 bg-slate-950 text-white relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">
          
          {/* Left: Typography Focus */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium mb-8">
              <Zap className="w-3 h-3" />
              <span>Scoring Engine V2</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-[1.1] mb-6">
              Precision metrics for modern systems.
            </h2>
            
            <p className="text-slate-400 text-lg leading-relaxed mb-10 font-light">
              We decompose your architecture into foundational vectors—evaluating fault tolerance, scalability constraints, and latency bottlenecks with deterministic accuracy.
            </p>

            <ul className="space-y-6 w-full border-l border-white/10 pl-6">
              {[
                { label: "Resilience Score", value: "98.4%", desc: "Evaluated across 4 availability zones" },
                { label: "Data Consistency", value: "Strict", desc: "CAP theorem compliance verified" },
                { label: "Throughput Limit", value: "12k TPS", desc: "Theoretical max before queuing delays" }
              ].map((item, i) => (
                <li key={i} className="flex flex-col gap-1">
                  <div className="flex items-end justify-between">
                    <span className="text-sm font-medium text-slate-300">{item.label}</span>
                    <span className="text-blue-400 font-mono text-lg">{item.value}</span>
                  </div>
                  <span className="text-xs text-slate-500">{item.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Mock Terminal / Data Table */}
          <div className="lg:col-span-7 w-full">
            <div className="rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl overflow-hidden">
              
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-mono text-slate-500">arch-eval --verbose --watch</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                </div>
              </div>

              {/* Data Density Area */}
              <div className="p-6 font-mono text-sm">
                <div className="flex items-center gap-3 mb-6 text-emerald-400 bg-emerald-400/10 px-3 py-2 rounded border border-emerald-400/20 w-fit">
                  <Activity className="w-4 h-4" />
                  <span>ANALYSIS COMPLETE [144ms]</span>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-500 text-xs">
                        <th className="pb-3 font-normal pr-4">NODE_ID</th>
                        <th className="pb-3 font-normal px-4">TYPE</th>
                        <th className="pb-3 font-normal px-4">STATUS</th>
                        <th className="pb-3 font-normal px-4">LATENCY</th>
                        <th className="pb-3 font-normal pl-4 text-right">METRIC_SCORE</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      {[
                        { id: "api-gateway-us-e", type: "ENTRY", status: "PASS", lat: "4ms", score: "0.99" },
                        { id: "auth-service-v2", type: "SERVICE", status: "PASS", lat: "12ms", score: "0.95" },
                        { id: "user-db-primary", type: "DATA", status: "WARN", lat: "45ms", score: "0.72", isWarn: true },
                        { id: "cache-layer-mem", type: "STORE", status: "PASS", lat: "1ms", score: "1.00" },
                        { id: "event-bus-kafka", type: "QUEUE", status: "PASS", lat: "8ms", score: "0.98" },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 pr-4 text-slate-400">{row.id}</td>
                          <td className="py-3 px-4 text-slate-500">{row.type}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 ${row.isWarn ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {row.isWarn ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                              {row.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">{row.lat}</td>
                          <td className={`py-3 pl-4 text-right ${row.isWarn ? 'text-amber-400' : 'text-blue-400'}`}>
                            {row.score}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-slate-500">
                  <span>System topology derived from terraform.tfstate</span>
                  <span>14 nodes evaluated</span>
                </div>
              </div>
              
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default DashboardShowcase;
