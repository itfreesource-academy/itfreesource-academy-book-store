import React, { useEffect, useState, useRef } from 'react';
import { FileCode2, ExternalLink, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

declare global {
  interface Window {
    SwaggerUIBundle?: any;
    SwaggerUIStandalonePreset?: any;
    ui?: any;
  }
}

export const SwaggerPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const initSwagger = () => {
    setIsLoading(true);
    setLoadError(null);

    // If SwaggerUIBundle already exists on window
    if (window.SwaggerUIBundle) {
      try {
        window.ui = window.SwaggerUIBundle({
          url: '/api/swagger.json',
          dom_id: '#swagger-ui-container',
          deepLinking: true,
          presets: [
            window.SwaggerUIBundle.presets.apis,
            window.SwaggerUIStandalonePreset
          ],
          layout: 'StandaloneLayout',
          persistAuthorization: true,
          tryItOutEnabled: true,
          displayRequestDuration: true,
          filter: true
        });
        setIsLoading(false);
      } catch (err: any) {
        setLoadError(err?.message || 'Failed to initialize Swagger UI.');
        setIsLoading(false);
      }
      return;
    }

    // Load CSS
    const cssId = 'swagger-ui-css-cdn';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css';
      document.head.appendChild(link);
    }

    // Load Bundle Script
    const bundleScriptId = 'swagger-ui-bundle-js';
    const presetScriptId = 'swagger-ui-preset-js';

    const loadScript = (id: string, src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.crossOrigin = 'anonymous';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(script);
      });
    };

    Promise.all([
      loadScript(bundleScriptId, 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.min.js'),
      loadScript(presetScriptId, 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-standalone-preset.min.js')
    ])
      .then(() => {
        if (window.SwaggerUIBundle) {
          window.ui = window.SwaggerUIBundle({
            url: '/api/swagger.json',
            dom_id: '#swagger-ui-container',
            deepLinking: true,
            presets: [
              window.SwaggerUIBundle.presets.apis,
              window.SwaggerUIStandalonePreset
            ],
            layout: 'StandaloneLayout',
            persistAuthorization: true,
            tryItOutEnabled: true,
            displayRequestDuration: true,
            filter: true
          });
          setIsLoading(false);
        } else {
          setLoadError('SwaggerUIBundle was not found after loading scripts.');
          setIsLoading(false);
        }
      })
      .catch((err) => {
        setLoadError(err.message || 'Error loading Swagger UI assets.');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    initSwagger();
  }, []);

  return (
    <div className="space-y-6 pb-12" data-testid="swagger-page">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                OpenAPI 3.0.3 Live Specification
              </span>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-[11px] font-bold">
                JWT Auth Enabled
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <FileCode2 className="w-8 h-8 text-emerald-400" />
              Interactive API Documentation
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Test and explore all ITFreeSource Academy RESTful endpoints directly from this interactive console. Authorize using your JWT token to run authenticated routes.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={initSwagger}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-white/10"
              title="Reload Swagger UI"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Reload Console</span>
            </button>
            <a
              href="/api/swagger.json"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Raw JSON Spec</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="/api/swagger"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <span>Full Window View</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-12 text-center shadow-2xl backdrop-blur-xl">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-sm font-bold text-white">Initializing Interactive Swagger UI...</h3>
          <p className="text-xs text-slate-400 mt-1">Loading OpenAPI 3.0 definitions & schema components</p>
        </div>
      )}

      {/* Error state */}
      {loadError && (
        <div className="bg-rose-950/40 border border-rose-900/60 rounded-3xl p-6 text-rose-300 flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white">Failed to load Swagger UI Console</h4>
            <p className="text-xs text-rose-300">{loadError}</p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={initSwagger}
                className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-500 transition-colors"
              >
                Retry Loading
              </button>
              <a
                href="/api/swagger.json"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors"
              >
                View OpenAPI JSON Directly
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Swagger UI Mount Target */}
      <div className={`bg-slate-900/90 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl overflow-hidden backdrop-blur-xl ${isLoading ? 'hidden' : 'block'}`}>
        <style>{`
          .swagger-ui .topbar { display: none !important; }
          .swagger-ui .wrapper { padding: 0 !important; max-width: 100% !important; }
          .swagger-ui .info { margin: 20px 0 !important; }
          .swagger-ui .info .title { color: #f8fafc !important; }
          .swagger-ui .info p, .swagger-ui .info li { color: #94a3b8 !important; }
          .swagger-ui .scheme-container { background: #020617 !important; padding: 15px !important; border-radius: 12px; margin-bottom: 20px !important; border: 1px solid #1e293b !important; }
          .swagger-ui .schemes-title { color: #cbd5e1 !important; }
          .swagger-ui select { background: #0f172a !important; color: #f8fafc !important; border: 1px solid #334155 !important; }
          .swagger-ui .opblock { border-radius: 10px !important; }
          .swagger-ui .opblock-tag { color: #f8fafc !important; border-bottom: 1px solid #1e293b !important; }
          .swagger-ui .btn.authorize { background-color: #4f46e5 !important; border-color: #4f46e5 !important; color: white !important; border-radius: 8px !important; font-weight: 700 !important; }
          .swagger-ui .btn.authorize svg { fill: white !important; }
        `}</style>
        <div id="swagger-ui-container" ref={containerRef} />
      </div>
    </div>
  );
};