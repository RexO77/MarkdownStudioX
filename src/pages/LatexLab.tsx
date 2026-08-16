import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BusyTexRunner, PdfLatex } from 'texlyre-busytex';
import { LATEX_HANDOFF_KEY } from '@/lib/latex';
import * as pdfjs from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Browser-native PDF viewers don't work in every embed context (in-app
// browser panes, some webviews), so pages are rasterized with pdf.js
// instead of trusting an <iframe> plugin.
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/**
 * PROTOTYPE — LaTeX compile lab. Not linked from the app chrome; visit /latex.
 * Measures what a full in-browser TeX engine actually costs before we commit
 * to the feature: asset downloads, init time, compile time, cache behavior.
 *
 * Engine: busytex (TeX Live 2026 WASM). Assets served from /core/busytex
 * (gitignored; fetch via `npx texlyre-busytex download-assets ./public/core`).
 * Packages beyond texlive-basic stream on demand from the TeXlyre endpoint.
 */

const ASSET_BASE = '/core/busytex';
const REMOTE_TEXLIVE = 'https://texlive2026.texlyre.org';

// Exercises the same packages as a real resume: geometry, enumitem,
// titlesec, xcolor, hyperref, parskip, newunicodechar (the last three
// live outside texlive-basic, so they exercise the on-demand path).
const SAMPLE = String.raw`\documentclass[a4paper,10pt]{article}
\usepackage[margin=0.5in, top=0.5in, bottom=0.5in]{geometry}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage{xcolor}
\usepackage{hyperref}
\usepackage{parskip}
\usepackage{newunicodechar}
\newunicodechar{₹}{Rs. }
\pagestyle{empty}

\titleformat{\section}{\large\bfseries\scshape}{}{0em}{}[\titlerule]

\setlist[itemize]{left=0em, itemsep=2pt, topsep=0pt, parsep=0pt, partopsep=0pt}

\begin{document}
\begin{center}
    {\LARGE \bfseries Jane Doe}\\
    Product Designer\\
    Bengaluru, India \textbar\ +91 00000 00000\\
    \href{mailto:jane@example.com}{jane@example.com} \textbar\
    \href{https://example.com}{example.com}
\end{center}

\section*{Career Summary}
Product designer with a computer science background. Budgets around ₹250 (tests the unicode mapping).

\section*{Experience}
\textbf{Acme Corp} \hfill \textit{Jul 2025 \textendash\ Present} \\
\textit{Product Designer} \hfill \textit{Bengaluru, India}
\begin{itemize}
    \item Shipped production-ready interaction specs and prototypes with PM, FE, BE, and QA.
    \item Built reusable design-system patterns for enterprise UIs.
\end{itemize}

\section*{Skills}
\begin{itemize}
    \item \textbf{Product Design:} Enterprise workflows, interaction design, hi-fi prototyping
    \item \textbf{Systems:} Design systems, components, tokens, documentation
\end{itemize}
\end{document}
`;

const KNOWN_ASSETS = [
  'busytex.js',
  'busytex.wasm',
  'busytex_pipeline.js',
  'busytex_worker.js',
  'texlive-basic.js',
  'texlive-basic.data',
];

type Phase = 'idle' | 'initializing' | 'compiling' | 'done' | 'error';

interface Metrics {
  assetSizes: { name: string; bytes: number }[];
  initMs?: number;
  compileMs?: number;
  pdfBytes?: number;
  storageBeforeMB?: number;
  storageAfterMB?: number;
}

const fmtMB = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
const fmtS = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

// Module-level singleton: the engine survives route re-renders, so repeat
// compiles measure warm-engine time rather than re-initialization.
let runnerPromise: Promise<BusyTexRunner> | null = null;

function getRunner(onProgress: (line: string) => void): Promise<BusyTexRunner> {
  if (!runnerPromise) {
    const runner = new BusyTexRunner({
      busytexBasePath: ASSET_BASE,
      engineMode: 'combined',
      preloadDataPackages: [`${ASSET_BASE}/texlive-basic.js`],
      catalogDataPackages: [],
      onDownloadProgress: (p) =>
        onProgress(`downloading engine assets… ${p.percent.toFixed(0)}% (${fmtMB(p.loaded)} of ${fmtMB(p.total)})`),
    });
    runnerPromise = runner.initialize(true).then(() => runner);
    runnerPromise.catch(() => {
      runnerPromise = null;
    });
  }
  return runnerPromise;
}

async function storageUsageMB(): Promise<number | undefined> {
  try {
    const est = await navigator.storage?.estimate?.();
    return est?.usage ? est.usage / (1024 * 1024) : undefined;
  } catch {
    return undefined;
  }
}

const LatexLab = () => {
  // A document handed off from the markdown editor wins over the sample.
  // The initializer must stay pure (StrictMode runs it twice) — the
  // consumed key is cleared in the mount effect below instead.
  const [source, setSource] = useState(
    () => sessionStorage.getItem(LATEX_HANDOFF_KEY) ?? SAMPLE
  );
  useEffect(() => {
    sessionStorage.removeItem(LATEX_HANDOFF_KEY);
  }, []);
  const [phase, setPhase] = useState<Phase>('idle');
  const [status, setStatus] = useState('Engine not loaded. Nothing downloads until you compile.');
  const [metrics, setMetrics] = useState<Metrics>({ assetSizes: [] });
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [log, setLog] = useState('');
  const pdfUrlRef = useRef<string | null>(null);
  const pagesRef = useRef<HTMLDivElement>(null);

  const renderPdfPages = async (data: Uint8Array) => {
    const doc = await pdfjs.getDocument({ data }).promise;
    const container = pagesRef.current;
    if (!container) return;
    container.replaceChildren();
    const dpr = window.devicePixelRatio || 1;
    for (let i = 1; i <= doc.numPages; i += 1) {
      const page = await doc.getPage(i);
      const baseWidth = page.getViewport({ scale: 1 }).width;
      const scale = (container.clientWidth / baseWidth) * dpr;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = '100%';
      canvas.style.display = 'block';
      canvas.className = 'mb-3 border border-border bg-white';
      container.appendChild(canvas);
      await page.render({ canvas, viewport }).promise;
    }
  };

  // Static asset inventory via HEAD requests — what a first visit would pull.
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      KNOWN_ASSETS.map(async (name) => {
        try {
          const res = await fetch(`${ASSET_BASE}/${name}`, { method: 'HEAD' });
          return { name, bytes: Number(res.headers.get('content-length') ?? 0) };
        } catch {
          return { name, bytes: 0 };
        }
      })
    ).then((assetSizes) => {
      if (!cancelled) setMetrics((m) => ({ ...m, assetSizes }));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(
    () => () => {
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
    },
    []
  );

  const compile = async () => {
    setPhase('initializing');
    setLog('');
    const storageBeforeMB = await storageUsageMB();

    try {
      setStatus('Initializing engine (downloads on first run, cached after)…');
      const initStart = performance.now();
      const runner = await getRunner(setStatus);
      const initMs = performance.now() - initStart;

      setPhase('compiling');
      setStatus('Compiling with pdfLaTeX… (missing packages stream from TeX Live on demand)');
      const compileStart = performance.now();
      const pdflatex = new PdfLatex(runner);
      const result = await pdflatex.compile({
        input: source,
        driver: 'pdftex_bibtex8',
        rerun: true,
        remoteEndpoint: REMOTE_TEXLIVE,
      });
      const compileMs = performance.now() - compileStart;
      const storageAfterMB = await storageUsageMB();

      setMetrics((m) => ({ ...m, initMs, compileMs, storageBeforeMB, storageAfterMB, pdfBytes: result.pdf?.length }));
      setLog(result.log ?? '');

      if (result.success && result.pdf) {
        if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
        const buffer = new Uint8Array(result.pdf);
        // Blob copies the bytes, so pdf.js is free to consume `buffer` after.
        const url = URL.createObjectURL(new Blob([buffer], { type: 'application/pdf' }));
        pdfUrlRef.current = url;
        setPdfUrl(url);
        await renderPdfPages(buffer);
        setPhase('done');
        setStatus(`Compiled in ${fmtS(compileMs)} (engine init ${fmtS(initMs)}).`);
      } else {
        setPhase('error');
        setStatus(`Compile failed (exit code ${result.exitCode}). See log below.`);
      }
    } catch (err) {
      setPhase('error');
      setStatus(`Engine error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const clearCache = async () => {
    runnerPromise = null;
    const dbs = (await indexedDB.databases?.()) ?? [];
    await Promise.all(dbs.map((db) => db.name && indexedDB.deleteDatabase(db.name)));
    setStatus('Engine cache cleared. Next compile is a cold start — reload the page first.');
  };

  const totalAssetBytes = metrics.assetSizes.reduce((sum, a) => sum + a.bytes, 0);
  const busy = phase === 'initializing' || phase === 'compiling';

  return (
    <div className="min-h-screen bg-background text-foreground p-6 font-mono text-sm">
      <header className="mb-4 flex items-baseline gap-3">
        <h1 className="text-base font-bold uppercase tracking-wide">LaTeX Lab</h1>
        <span className="text-muted-foreground">compile full LaTeX documents to PDF, entirely in your browser</span>
        <Link to="/" className="ml-auto border border-border px-3 py-1 uppercase tracking-wide">
          Back to editor
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="flex flex-col gap-3">
          <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            spellCheck={false}
            aria-label="LaTeX source"
            className="h-[420px] w-full resize-y border border-border bg-transparent p-3 outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={compile}
              disabled={busy}
              className="border border-border px-4 py-1.5 font-bold uppercase tracking-wide disabled:opacity-50"
            >
              {busy ? 'Working…' : 'Compile PDF'}
            </button>
            <button onClick={() => setSource(SAMPLE)} disabled={busy} className="border border-border px-4 py-1.5 disabled:opacity-50">
              Reset sample
            </button>
            <button onClick={clearCache} disabled={busy} className="border border-border px-4 py-1.5 disabled:opacity-50">
              Clear engine cache
            </button>
          </div>
          <p aria-live="polite" className="text-muted-foreground">{status}</p>

          <div className="border border-border p-3">
            <h2 className="font-bold mb-2">First-visit download (served locally, cached by the browser)</h2>
            <ul>
              {metrics.assetSizes.map((a) => (
                <li key={a.name} className="flex justify-between">
                  <span>{a.name}</span>
                  <span>{fmtMB(a.bytes)}</span>
                </li>
              ))}
              <li className="flex justify-between border-t border-border mt-1 pt-1 font-bold">
                <span>total</span>
                <span>{fmtMB(totalAssetBytes)}</span>
              </li>
            </ul>
          </div>

          <div className="border border-border p-3">
            <h2 className="font-bold mb-2">Measured</h2>
            <ul>
              <li className="flex justify-between"><span>engine init (download + boot)</span><span>{metrics.initMs !== undefined ? fmtS(metrics.initMs) : '—'}</span></li>
              <li className="flex justify-between"><span>compile</span><span>{metrics.compileMs !== undefined ? fmtS(metrics.compileMs) : '—'}</span></li>
              <li className="flex justify-between"><span>PDF size</span><span>{metrics.pdfBytes !== undefined ? fmtMB(metrics.pdfBytes) : '—'}</span></li>
              <li className="flex justify-between">
                <span>browser storage (before → after)</span>
                <span>
                  {metrics.storageBeforeMB !== undefined && metrics.storageAfterMB !== undefined
                    ? `${metrics.storageBeforeMB.toFixed(0)} → ${metrics.storageAfterMB.toFixed(0)} MB`
                    : '—'}
                </span>
              </li>
            </ul>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="relative h-[620px] overflow-auto border border-border p-3">
            <div ref={pagesRef} />
            {!pdfUrl && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center border border-dashed border-border text-muted-foreground">
                PDF output appears here
              </div>
            )}
          </div>
          {pdfUrl && (
            <a href={pdfUrl} download="document.pdf" className="self-start border border-border px-4 py-1.5 font-bold uppercase tracking-wide">
              Download PDF
            </a>
          )}
          {log && (
            <details open={phase === 'error'} className="border border-border p-3">
              <summary className="cursor-pointer font-bold">Compile log</summary>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-xs">{log.split('\n').slice(-80).join('\n')}</pre>
            </details>
          )}
        </section>
      </div>
    </div>
  );
};

export default LatexLab;
