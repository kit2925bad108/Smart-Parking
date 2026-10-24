import React, { useState, useEffect } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Terminal, 
  Database, 
  GraduationCap, 
  Sparkles, 
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { apiFetch } from '../api/config';

interface BackendFile {
  path: string;
  name: string;
  content: string;
  language: string;
}

interface JavaInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JavaInspectorModal: React.FC<JavaInspectorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [files, setFiles] = useState<BackendFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<BackendFile | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'viva' | 'curl'>('files');

  useEffect(() => {
    if (isOpen) {
      apiFetch<BackendFile[]>('/backend-files')
        .then((data) => {
          setFiles(data);
          if (data.length > 0 && !selectedFile) {
            const defaultFile = data.find(f => f.name === 'ParkingService.java') || data[0];
            setSelectedFile(defaultFile);
          }
        })
        .catch((err) => console.error('Failed to load backend files', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyContent = () => {
    if (selectedFile) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-6xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Modal Top Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Java Spring Boot &amp; MySQL Project Architecture</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  College Viva Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Explore Spring Boot controllers, JDBC repositories, MySQL DDL, and data structure mechanics.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2">
            <div className="bg-slate-900 rounded-xl p-1 border border-slate-800 flex space-x-1 text-xs font-medium">
              <button
                onClick={() => setActiveTab('files')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'files'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Source Files
              </button>
              <button
                onClick={() => setActiveTab('viva')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'viva'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Viva Cheat-Sheet
              </button>
              <button
                onClick={() => setActiveTab('curl')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'curl'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                cURL / REST
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab 1: Source Files Explorer */}
        {activeTab === 'files' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar File Tree */}
            <div className="w-72 bg-slate-950/60 border-r border-slate-800 p-3 overflow-y-auto shrink-0 text-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                Project Files ({files.length})
              </div>
              <div className="space-y-1">
                {files.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-mono text-[11px] flex items-center justify-between transition cursor-pointer ${
                      selectedFile?.path === file.path
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="truncate">{file.name}</span>
                    <span className="text-[9px] uppercase px-1 rounded bg-slate-800 text-slate-400">
                      {file.language}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Code Content Viewer */}
            <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
              {selectedFile ? (
                <>
                  <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-300 font-semibold truncate">
                      {selectedFile.path}
                    </span>
                    <button
                      onClick={copyContent}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="flex-1 p-4 overflow-auto text-xs font-mono text-slate-300 leading-relaxed selection:bg-indigo-500/30">
                    <code>{selectedFile.content}</code>
                  </pre>
                </>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Select a file from the left to inspect its code.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Viva Q&A Cheat Sheet */}
        {activeTab === 'viva' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm">
            <div className="bg-indigo-950/20 border border-indigo-500/30 p-4 rounded-2xl">
              <h3 className="font-bold text-indigo-300 text-base mb-1">
                College Viva Technical Explanation
              </h3>
              <p className="text-xs text-slate-400">
                Direct answers to anticipated questions regarding data structures, complexity, and database architecture.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Queue */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 font-mono">1. Queue&lt;Vehicle&gt; waitingQueue</span>
                <h4 className="font-semibold text-white">Why use Queue for Waiting Vehicles?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When all 20 parking slots (P01 - P20) are full, newly arriving vehicles enter a FIFO (First-In, First-Out) line. Using <code className="text-amber-300 font-mono">waitingQueue.offer(vehicle)</code> enqueues vehicles in order of arrival. When an occupied slot becomes available, <code className="text-amber-300 font-mono">waitingQueue.poll()</code> immediately retrieves the vehicle waiting the longest, ensuring fairness without starvation.
                </p>
              </div>

              {/* HashMap */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 font-mono">2. HashMap&lt;String, Vehicle&gt; parkedVehicles</span>
                <h4 className="font-semibold text-white">Why use HashMap for Parked Vehicles?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Vehicles exit randomly. If we stored parked vehicles in a simple list or array, finding a vehicle by registration number would take $O(n)$ linear scan time. By indexing by registration number (e.g. <code className="text-emerald-300 font-mono">"TN38AB1234"</code>), HashMap guarantees $O(1)$ constant time lookup to check in/out and compute duration and fees instantaneously.
                </p>
              </div>

              {/* ArrayList */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-indigo-400 font-mono">3. ArrayList&lt;Integer&gt; availableSlots</span>
                <h4 className="font-semibold text-white">Why use ArrayList for Available Slots?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We maintain available slots as integer IDs `[1, 2, ..., 20]`. When allocating a slot, <code className="text-indigo-300 font-mono">availableSlots.remove(0)</code> grants the lowest available slot number (P01, P02...). When released, the slot ID is added back and sorted with <code className="text-indigo-300 font-mono">Collections.sort()</code>, keeping slot assignments clean and contiguous.
                </p>
              </div>

              {/* JDBC */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-purple-400 font-mono">4. Spring JdbcTemplate &amp; MySQL</span>
                <h4 className="font-semibold text-white">Why JDBC instead of JPA/Hibernate?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  JDBC eliminates ORM abstraction overhead and N+1 query surprises. Using Spring's <code className="text-purple-300 font-mono">JdbcTemplate</code> ensures clean parameterized queries (e.g., <code className="text-purple-300 font-mono">"WHERE vehicle_number = ?"</code>) to defend against SQL Injection, while writing raw DDL/DML for total transparency.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: cURL & REST APIs */}
        {activeTab === 'curl' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs font-mono">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold">1. Vehicle Entry</span>
              <pre className="bg-slate-900 p-3 rounded-xl text-slate-300 overflow-x-auto">
{`curl -X POST http://localhost:8080/api/vehicles/entry \\
  -H "Content-Type: application/json" \\
  -d '{
    "vehicleNumber": "TN38AB1234",
    "vehicleType": "Car",
    "ownerName": "Muthukrishnan"
  }'`}
              </pre>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-rose-400 font-bold">2. Vehicle Exit</span>
              <pre className="bg-slate-900 p-3 rounded-xl text-slate-300 overflow-x-auto">
{`curl -X POST http://localhost:8080/api/vehicles/exit \\
  -H "Content-Type: application/json" \\
  -d '{
    "vehicleNumber": "TN38AB1234"
  }'`}
              </pre>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-indigo-400 font-bold">3. Get Parking Slots</span>
              <pre className="bg-slate-900 p-3 rounded-xl text-slate-300 overflow-x-auto">
{`curl http://localhost:8080/api/slots`}
              </pre>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-amber-400 font-bold">4. Get Waiting Queue</span>
              <pre className="bg-slate-900 p-3 rounded-xl text-slate-300 overflow-x-auto">
{`curl http://localhost:8080/api/queue`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
