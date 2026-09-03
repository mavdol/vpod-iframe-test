"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const SNAPSHOT_ID = "snap_ab3a2ad7e6f2181d"
const API_KEY = "vpod_pk_b165a23c286407665eeef5c11be968ef056a3e62766a609b"
const THEME = "apprentice"
const SRC = `https://preview.vpod.sh/${SNAPSHOT_ID}?key=${API_KEY}&theme=${THEME}`
const CHECK_CMD = "bash /home/admin/agent/check.sh"

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

export default function Home() {
  const frame = useRef<HTMLIFrameElement>(null)
  const [checking, setChecking] = useState(false)
  const [ready, setReady] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [clearingCache, setClearingCache] = useState(false)

  useEffect(() => {

    function onMessage(e: MessageEvent) {
      console.log(e)
      if (!SRC.startsWith(e.origin)) return
      const data = e.data


      if (!data || data.vpod !== 1) return

      if (data.type === "ready"){
        setReady(true)
      }

      if (data.type === "exit") {
        console.log("exit data: ", data)
        setChecking(false)
        const { code } = data

        if(code === 42) {
          setResult("Correct!")
        }

        if(code === 41) {
          setResult("Wrong!")
        }
      }
    }

    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  const handleCheck = useCallback(() => {
    const win = frame.current?.contentWindow
    if (!win) return
    setChecking(true)
    setResult(null)

    win.postMessage({ vpod: 1, type: "run", command: CHECK_CMD }, new URL(SRC).origin)
  }, [])

  const handleClearCache = useCallback(() => {
    const win = frame.current?.contentWindow
    if (!win) return
    setClearingCache(true)
    win.postMessage({ vpod: 1, type: "clearCache" }, new URL(SRC).origin)

    try {
      localStorage.clear()
      sessionStorage.clear()
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name))
        })
      }
      if ('indexedDB' in window && indexedDB.databases) {
        indexedDB.databases().then((dbs) => {
          dbs.forEach((db) => {
            if (db.name) indexedDB.deleteDatabase(db.name)
          })
        })
      }
    } catch (e) {
      console.error("Failed to clear local storage:", e)
    }

    setTimeout(() => {
      setClearingCache(false)
    }, 800)
  }, [])

  return (
    <div className="flex-1 bg-[#121212] text-white">
      <div className="mx-auto min-h-full max-w-[900px] border-x border-[#222222]">

        {/* Brief */}
        <section className="relative overflow-hidden border-b border-[#222222]">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.01) 1px,transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
          <div className="pointer-events-none absolute left-6 top-6 h-3.5 w-3.5 border-l border-t border-[#454545]" />
          <div className="pointer-events-none absolute right-6 top-6 h-3.5 w-3.5 border-r border-t border-[#454545]" />
          <div className="pointer-events-none absolute bottom-6 left-6 h-3.5 w-3.5 border-b border-l border-[#454545]" />
          <div className="pointer-events-none absolute bottom-6 right-6 h-3.5 w-3.5 border-b border-r border-[#454545]" />

          <div className="relative flex flex-col gap-6 px-6 py-14 sm:px-12">
            <h2 className="m-0 text-xs font-normal text-[#5a5a5a]">// scenario</h2>

            <h1 className="m-0 text-balance text-[26px] font-bold leading-[1.12] tracking-[-0.04em] sm:text-[32px]">
              &quot;Saint John&quot;: what is writing to this log file?
            </h1>

            <p className="m-0 max-w-[62ch] text-[13px] leading-[1.8] text-[#737373]">
              A developer created a testing program that is continuously writing to a log file
              <code className="mx-1.5 border border-[#2a2a2a] bg-[#161616] px-1.5 py-0.5 text-[12px] text-[#c4c4c4]">/var/log/bad.log</code>
              and filling up disk. You can check with
              <code className="mx-1.5 border border-[#2a2a2a] bg-[#161616] px-1.5 py-0.5 text-[12px] text-[#c4c4c4]">tail -f /var/log/bad.log</code>.
              <br />
              This program is no longer needed. <strong className="font-bold text-[#c4c4c4]">Find it and terminate it.</strong> Do not delete the log file.
            </p>

            <div className="flex flex-wrap gap-x-[26px] gap-y-2 text-[11.5px] text-[#5a5a5a]">
              <span>↗ level: easy</span>
              <span>↗ tags: python, bash</span>
              <span>↗ root access: yes</span>
            </div>
          </div>
        </section>

        {/* Terminal iframe */}
        <section className="border-b border-[#222222] bg-[#0f0f0f] px-6 py-12 sm:px-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="m-0 text-xs font-normal text-[#5a5a5a]">// terminal</h2>
            <span className="text-[11.5px] text-[#5a5a5a]">
              {ready ? "connected" : "Ready"}
            </span>
          </div>

          <iframe
            ref={frame}
            src={SRC}
            title="Terminal"
            allow="cross-origin-isolated"
            className="block h-[440px] w-full border border-[#222222] bg-[#0c0c0c]"
          />

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCheck}
                disabled={!ready || checking}
                className="flex min-w-[180px] items-center justify-center border border-white bg-white px-5 py-3 text-[13px] font-semibold text-[#121212] transition-colors hover:border-[#c4c4c4] hover:bg-[#c4c4c4] disabled:cursor-not-allowed disabled:border-[#454545] disabled:bg-transparent disabled:text-[#5a5a5a]"
              >
                {checking ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-3.5 w-3.5" />
                    checking…
                  </span>
                ) : (
                  "check my solution"
                )}
              </button>

              <button
                onClick={handleClearCache}
                disabled={clearingCache}
                className="flex min-w-[140px] items-center justify-center border border-[#454545] px-5 py-3 text-[13px] text-[#a8a8a8] transition-colors hover:border-[#a8a8a8] hover:text-white disabled:cursor-not-allowed disabled:border-[#2a2a2a] disabled:text-[#5a5a5a]"
                title="Delete saved sandbox state"
              >
                {clearingCache ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-3.5 w-3.5" />
                    clearing…
                  </span>
                ) : (
                  "clear cache"
                )}
              </button>
            </div>

            {result !== null && (
              <div
                className={`border border-l-2 border-[#222222] bg-[#161616] px-4 py-3 text-[13px] font-bold ${
                  result.includes("Correct")
                    ? "border-l-emerald-400 text-emerald-300"
                    : "border-l-red-400 text-red-300"
                }`}
              >
                {result.includes("Correct") ? "✓ correct" : "✗ wrong"}
              </div>
            )}
          </div>
        </section>

        <section className="border-b border-[#222222] px-6 py-10 sm:px-12">
          <h2 className="m-0 mb-4 text-xs font-normal text-[#5a5a5a]">// test</h2>
          <p className="m-0 max-w-[62ch] text-[12px] leading-[1.8] text-[#737373]">
            The log file size doesn't change. The
            <span className="mx-1 text-[#c4c4c4]">check my solution</span>
            button runs
            <code className="mx-1.5 border border-[#2a2a2a] bg-[#161616] px-1.5 py-0.5 text-[11px] text-[#c4c4c4]">/home/admin/agent/check.sh</code>
            inside the sandbox.
          </p>
        </section>

        {/* More scenarios */}
        <section className="px-6 py-12 sm:px-12">
          <h2 className="m-0 mb-6 text-xs font-normal text-[#5a5a5a]">// more scenarios</h2>

          <a
            href="https://sadservers.com/scenarios"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-6 border border-[#222222] px-8 py-9 transition-colors hover:bg-[#161616] sm:flex-row sm:items-center sm:justify-between sm:gap-10"
          >
            <div className="flex flex-col gap-3">
              <span className="text-lg font-bold">sadservers</span>
              <span className="max-w-[52ch] text-[13px] leading-[1.8] text-[#737373]">
                more linux troubleshooting scenarios like this one.
              </span>
            </div>
            <span className="shrink-0 self-start border border-[#454545] px-5 py-3 text-[13px] text-[#a8a8a8] transition-colors group-hover:border-[#a8a8a8] group-hover:text-white sm:self-auto">
              browse scenarios ↗
            </span>
          </a>
        </section>

      </div>
    </div>
  )
}
