"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const SNAPSHOT_ID = "snap_ab3a2ad7e6f2181d"
const API_KEY = "vpod_pk_b165a23c286407665eeef5c11be968ef056a3e62766a609b"
const THEME = "apprentice"
const SRC = `https://preview.vpod.sh/${SNAPSHOT_ID}?key=${API_KEY}&theme=${THEME}`
const CHECK_CMD = "bash /home/admin/agent/check.sh"

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
    <div className="flex flex-col gap-6 max-w-4xl mx-auto p-10">

      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-bold mb-2">
          "Saint John": what is writing to this log file?
        </h1>
        <p className="text-sm text-foreground/70 mb-2">
          <strong>Level:</strong> Easy &nbsp;·&nbsp; <strong>Tags:</strong> python, bash &nbsp;·&nbsp; <strong>Root access:</strong> Yes
        </p>
        <p className="text-sm text-foreground/80">
          A developer created a testing program that is continuously writing to a log file
          <code className="mx-1 px-1 rounded text-xs">/var/log/bad.log</code>
          and filling up disk. You can check with
          <code className="mx-1 px-1 rounded text-xs">tail -f /var/log/bad.log</code>.
          <br />
          This program is no longer needed. <strong>Find it and terminate it.</strong> Do not delete the log file.
        </p>
        <p className="text-xs text-foreground/50 mt-2">
          ✓ Test: The log file size doesn't change. The "Check My Solution" button runs
          <code className="mx-1 px-1 rounded text-[10px]">/home/admin/agent/check.sh</code>.
        </p>
      </div>

      {/* Terminal iframe */}
      <iframe
        ref={frame}
        src={SRC}
        title="Terminal"
        allow="cross-origin-isolated"
        className="w-full h-[400px] border border-foreground/10 rounded"
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCheck}
            disabled={!ready || checking}
            className="px-5 py-2.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center min-w-[160px]"
          >
            {checking ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Checking...
              </span>
            ) : (
              "Check My Solution"
            )}
          </button>

          <button
            onClick={handleClearCache}
            disabled={clearingCache}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-black  rounded-lg hover:bg-gray-100  transition-colors flex items-center justify-center min-w-[120px]"
            title="Delete saved sandbox state"
          >
            {clearingCache ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Clearing...
              </span>
            ) : (
              "Clear Cache"
            )}
          </button>
        </div>

        {result !== null && (
          <div className={`px-4 py-2.5 rounded-lg text-sm font-medium flex-1 sm:flex-initial text-center sm:text-left transition-all ${
            result.includes("Correct")
              ? "bg-green-100 text-green-800 border border-green-200 "
              : "bg-red-100 text-red-800  border border-red-200"
          }`}>
            {result}
          </div>
        )}
      </div>
    </div>
  )
}
