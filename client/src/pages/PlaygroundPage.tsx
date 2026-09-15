import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs.js';
import { ShadowDomWidget } from '../components/playground/ShadowDomWidget.js';
import { IFrameWidget } from '../components/playground/IFrameWidget.js';
import { DragDropList } from '../components/playground/DragDropList.js';
import { SingleSlider } from '../components/common/Slider.js';
import { apiClient } from '../api/client.js';
import { useToast } from '../context/ToastContext.js';
import {
  FlaskConical,
  Clock,
  AlertTriangle,
  Layers,
  MessageSquare,
  FileDown,
  Upload,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Server,
  Zap,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { MicroserviceHealth } from '../types/index.js';

export const PlaygroundPage: React.FC = () => {
  // Microservices Health & Chaos State
  const [services, setServices] = useState<MicroserviceHealth[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Latency Simulator
  const [latencyMs, setLatencyMs] = useState<number>(() => {
    const saved = localStorage.getItem('mock_latency');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Dynamic IDs Toggle
  const [useDynamicIds, setUseDynamicIds] = useState(false);

  // Error simulation state
  const [simulatedResult, setSimulatedResult] = useState<any>(null);
  const [isLoadingError, setIsLoadingError] = useState(false);

  // Native Dialog Result
  const [dialogResult, setDialogResult] = useState<string>('');

  const { addToast } = useToast();

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const res = await apiClient.get('/system/services');
      setServices(res.data.services || []);
    } catch (err: any) {
      console.error('Failed to load services:', err);
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleToggleService = async (serviceName: string) => {
    try {
      const res = await apiClient.post(`/system/services/${serviceName}/toggle`);
      addToast(`Microservice "${serviceName}" status toggled to: ${res.data.service.status.toUpperCase()}`, 'info');
      fetchServices();
    } catch (err: any) {
      addToast('Failed to toggle service fault: ' + err.message, 'error');
    }
  };

  const handleResetServices = async () => {
    try {
      await apiClient.post('/system/services/reset');
      addToast('All 7 microservices restored to operational state!', 'success');
      fetchServices();
    } catch (err: any) {
      addToast('Failed to reset services: ' + err.message, 'error');
    }
  };

  const handleLatencyChange = async (ms: number) => {
    setLatencyMs(ms);
    localStorage.setItem('mock_latency', String(ms));
    try {
      await apiClient.post('/system/latency', { delayMs: ms });
      addToast(`Simulated latency set to ${ms}ms.`, 'info');
    } catch (err: any) {
      addToast('Failed to update latency on server: ' + err.message, 'error');
    }
  };

  const handleSimulateError = async (statusCode: number) => {
    setIsLoadingError(true);
    setSimulatedResult(null);
    try {
      const res = await apiClient.get(`/system/simulate-error?status=${statusCode}`);
      setSimulatedResult(res.data);
    } catch (err: any) {
      setSimulatedResult({
        status: err.status || statusCode,
        message: err.message,
        data: err.data
      });
    } finally {
      setIsLoadingError(false);
    }
  };

  const triggerAlert = () => {
    alert('QA Test Automation: Native Browser alert() invoked!');
    setDialogResult('User acknowledged alert() popup.');
  };

  const triggerConfirm = () => {
    const accepted = confirm('QA Test Automation: Do you confirm this high-stakes action?');
    setDialogResult(accepted ? 'User clicked OK on confirm()' : 'User clicked Cancel on confirm()');
  };

  const triggerPrompt = () => {
    const response = prompt('QA Test Automation: Please enter a secret test verification code:');
    setDialogResult(
      response !== null
        ? `User entered into prompt(): "${response}"`
        : 'User dismissed prompt()'
    );
  };

  const handleDownloadSampleCsv = () => {
    const csvContent =
      'id,title,isbn,author,price,stock\n' +
      'book_001,Clean Code,978-0132350884,Robert C. Martin,44.99,48\n' +
      'book_002,Refactoring,978-0134757599,Martin Fowler,54.50,22\n' +
      'book_003,Dune Deluxe,978-0441172719,Frank Herbert,36.00,65\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-book-catalog-dataset.csv';
    a.click();
    addToast('Downloaded sample CSV test dataset.', 'success');
  };

  // Helper for dynamic test ID generation
  const getTestId = (base: string) => {
    return useDynamicIds ? `${base}-${Math.random().toString(36).substring(2, 6)}` : base;
  };

  return (
    <div className="space-y-8 pb-16" data-testid="playground-page">
      <Breadcrumbs items={[{ label: 'QA Automation Sandbox' }]} />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white border border-purple-800/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Automation Engineering Lab
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight" data-testid="playground-title">
            QA Automation Testing Playground
          </h1>
          <p className="text-xs text-purple-200 leading-relaxed">
            A purpose-built suite of complex UI edge cases, shadow DOM components, iFrames, network latency throttlers, native dialogs, and HTTP fault injectors designed to validate automated test resilience.
          </p>
        </div>

        {/* Dynamic ID Toggle Switch */}
        <div className="bg-slate-950/60 border border-white/10 p-4 rounded-2xl flex items-center gap-4 flex-shrink-0">
          <div>
            <h5 className="font-bold text-xs text-white">Dynamic Test IDs</h5>
            <p className="text-[10px] text-slate-400">Append random hash to data-testid</p>
          </div>
          <button
            onClick={() => setUseDynamicIds(!useDynamicIds)}
            data-testid="toggle-dynamic-ids-btn"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            {useDynamicIds ? (
              <ToggleRight className="w-8 h-8 text-brand-400" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {/* Grid of QA Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Widget 1: Network Latency Simulation Slider */}
        <div
          data-testid="latency-simulator-card"
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-sm">Network Latency Simulator</h3>
          </div>
          <p className="text-xs text-slate-500">
            Inject artificial server response delay into every <code className="text-brand-600 bg-brand-50 px-1 py-0.5 rounded">/api</code> endpoint to test loading spinners, skeleton states, and timeout handling.
          </p>

          <SingleSlider
            label="Simulated Delay (Milliseconds)"
            min={0}
            max={5000}
            step={250}
            unit=""
            value={latencyMs}
            onChange={handleLatencyChange}
            testId="playground-latency-slider"
          />

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500">Active Delay Header:</span>
            <code className="font-mono text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
              x-mock-delay: {latencyMs}ms
            </code>
          </div>
        </div>

        {/* Widget 2: HTTP Status Code Fault Injector */}
        <div
          data-testid="error-simulator-card"
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-slate-900 text-sm">HTTP Error Simulation Triggers</h3>
          </div>
          <p className="text-xs text-slate-500">
            Trigger simulated backend faults to verify client toast popups and error fallback handling.
          </p>

          <div className="flex flex-wrap gap-2" data-testid="error-trigger-buttons">
            {[400, 401, 403, 404, 429, 500, 503].map((code) => (
              <button
                key={code}
                onClick={() => handleSimulateError(code)}
                data-testid={`trigger-error-${code}`}
                className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
              >
                {code}
              </button>
            ))}
          </div>

          {/* Response Inspector Box */}
          {simulatedResult && (
            <div
              data-testid="error-inspector-output"
              className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto"
            >
              <pre>{JSON.stringify(simulatedResult, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Widget 3: Native Browser Dialog Triggers */}
        <div
          data-testid="native-dialogs-card"
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-slate-900 text-sm">Native Browser Dialogs</h3>
          </div>
          <p className="text-xs text-slate-500">
            Test Playwright dialog handlers: <code className="text-brand-600 bg-brand-50 px-1 py-0.5 rounded">page.on('dialog', dialog =&gt; dialog.accept())</code>
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={triggerAlert}
              data-testid="trigger-alert-btn"
              className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 text-xs font-bold rounded-lg transition-colors"
            >
              window.alert()
            </button>
            <button
              onClick={triggerConfirm}
              data-testid="trigger-confirm-btn"
              className="px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-200 text-xs font-bold rounded-lg transition-colors"
            >
              window.confirm()
            </button>
            <button
              onClick={triggerPrompt}
              data-testid="trigger-prompt-btn"
              className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-xs font-bold rounded-lg transition-colors"
            >
              window.prompt()
            </button>
          </div>

          {dialogResult && (
            <div
              data-testid="dialog-result-text"
              className="text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200"
            >
              Result: {dialogResult}
            </div>
          )}
        </div>

        {/* Widget 4: File Download and Data Export */}
        <div
          data-testid="file-download-card"
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2">
            <FileDown className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-900 text-sm">File Export & Download Automations</h3>
          </div>
          <p className="text-xs text-slate-500">
            Automate file download verification using Playwright: <code className="text-brand-600 bg-brand-50 px-1 py-0.5 rounded">page.waitForEvent('download')</code>
          </p>

          <button
            onClick={handleDownloadSampleCsv}
            data-testid="download-csv-btn"
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow transition-all"
          >
            <FileDown className="w-4 h-4" />
            <span>Download Sample Catalog CSV</span>
          </button>
        </div>

        {/* Widget 5: Shadow DOM Encapsulation */}
        <div className="lg:col-span-1 space-y-2">
          <ShadowDomWidget />
        </div>

        {/* Widget 6: Embedded iFrame Sandbox */}
        <div className="lg:col-span-1 space-y-2">
          <IFrameWidget />
        </div>

        {/* Widget 7: HTML5 Drag and Drop Reorder List */}
        <div className="lg:col-span-2">
          <DragDropList />
        </div>

        {/* Widget 8: Microservices Architecture & Chaos Fault Injection Lab */}
        <div
          data-testid="microservices-chaos-card"
          className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Server className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Monorepo Microservices & Chaos Engineering Lab
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Test service resilience and circuit breaking. Inject simulated outages or latency into individual microservices while the rest of the application remains fully functional.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetServices}
              data-testid="reset-all-services-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restore All 7 Services</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {services.map((svc) => {
              const isFailing = svc.status === 'down';
              return (
                <div
                  key={svc.name}
                  data-testid={`service-card-${svc.name}`}
                  className={`p-4 rounded-2xl border transition-all ${
                    isFailing
                      ? 'bg-rose-50/70 border-rose-200 shadow-sm'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-black uppercase tracking-wider text-slate-800">
                      {svc.name} Service
                    </span>
                    <span
                      data-testid={`service-status-${svc.name}`}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        isFailing
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {isFailing ? (
                        <>
                          <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                          <span>FAULT 503</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                          <span>HEALTHY</span>
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mb-3 min-h-[32px] leading-snug">
                    {svc.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-3 pt-2 border-t border-slate-200/50">
                    <span>Latency: {svc.latencyMs}ms</span>
                    <span>Error: {svc.errorRate}%</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleService(svc.name)}
                    data-testid={`toggle-service-${svc.name}`}
                    className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isFailing
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow'
                        : 'bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isFailing ? 'Restore Service' : 'Inject Failure (503)'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
