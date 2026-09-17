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
  Radio,
  Webhook,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Copy,
  Plus,
  Trash2,
  Play,
  ShieldCheck,
  Search
} from 'lucide-react';
import {
  MicroserviceHealth,
  KafkaTopicInfo,
  KafkaMessage,
  KafkaConsumerGroup,
  WebhookSubscription,
  WebhookDelivery,
  MockWebhookEvent
} from '../types/index.js';

export const PlaygroundPage: React.FC = () => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'edge-cases' | 'microservices' | 'kafka' | 'webhooks'>('edge-cases');

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

  // -------------------------------------------------------------
  // Kafka State
  // -------------------------------------------------------------
  const [kafkaTopics, setKafkaTopics] = useState<KafkaTopicInfo[]>([]);
  const [selectedKafkaTopic, setSelectedKafkaTopic] = useState<string>('bookstore.orders.created');
  const [kafkaMessages, setKafkaMessages] = useState<KafkaMessage[]>([]);
  const [consumerGroups, setConsumerGroups] = useState<KafkaConsumerGroup[]>([]);
  const [loadingKafka, setLoadingKafka] = useState(false);

  // -------------------------------------------------------------
  // Webhooks State
  // -------------------------------------------------------------
  const [subscriptions, setSubscriptions] = useState<WebhookSubscription[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [mockEvents, setMockEvents] = useState<MockWebhookEvent[]>([]);
  const [mockChaos, setMockChaos] = useState<{ shouldFail: boolean; statusCode: number }>({ shouldFail: false, statusCode: 500 });
  const [loadingWebhooks, setLoadingWebhooks] = useState(false);

  // New Subscription Form Modal
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [newSubUrl, setNewSubUrl] = useState('http://localhost:5000/api/v1/webhooks/mock-receiver');
  const [newSubEvents, setNewSubEvents] = useState('order:created,borrow:created');
  const [newSubSecret, setNewSubSecret] = useState('whsec_custom_qa_key_2026');

  // Signature Verifier Tool
  const [verifySecret, setVerifySecret] = useState('whsec_itfreesource_test_secret_2026');
  const [verifyPayload, setVerifyPayload] = useState('{"event":"order:created","total":49.99}');
  const [verifySig, setVerifySig] = useState('');
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);

  const { addToast } = useToast();

  // Load microservices
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

  // Load Kafka data
  const fetchKafkaData = async () => {
    setLoadingKafka(true);
    try {
      const [topicsRes, groupsRes] = await Promise.all([
        apiClient.get('/kafka/topics'),
        apiClient.get('/kafka/consumer-groups')
      ]);
      setKafkaTopics(topicsRes.data.data || []);
      setConsumerGroups(groupsRes.data.data || []);

      // Fetch messages for active topic
      const topicToFetch = selectedKafkaTopic || (topicsRes.data.data?.[0]?.name ?? 'bookstore.orders.created');
      const msgRes = await apiClient.get(`/kafka/topics/${topicToFetch}/messages?limit=25`);
      setKafkaMessages(msgRes.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch Kafka state:', err);
    } finally {
      setLoadingKafka(false);
    }
  };

  // Load Webhooks data
  const fetchWebhookData = async () => {
    setLoadingWebhooks(true);
    try {
      const [subsRes, delRes, mockRes] = await Promise.all([
        apiClient.get('/webhooks/subscriptions'),
        apiClient.get('/webhooks/deliveries'),
        apiClient.get('/webhooks/mock-receiver/events')
      ]);
      setSubscriptions(subsRes.data.data || []);
      setDeliveries(delRes.data.data || []);
      setMockEvents(mockRes.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch Webhook data:', err);
    } finally {
      setLoadingWebhooks(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (activeTab === 'kafka') {
      fetchKafkaData();
    } else if (activeTab === 'webhooks') {
      fetchWebhookData();
    }
  }, [activeTab, selectedKafkaTopic]);

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
      await apiClient.get(`/system/simulate-error?status=${statusCode}`);
      setSimulatedResult({ status: 200, message: 'Unexpected success' });
    } catch (err: any) {
      const res = err.response;
      setSimulatedResult({
        status: res?.status || statusCode,
        statusText: res?.statusText || 'Error',
        data: res?.data || { error: err.message }
      });
      addToast(`Simulated HTTP ${statusCode} received!`, 'error');
    } finally {
      setIsLoadingError(false);
    }
  };

  const handleNativeAlert = () => {
    window.alert('Automation Test Alert: Click OK to proceed.');
    setDialogResult('User acknowledged alert() modal.');
  };

  const handleNativeConfirm = () => {
    const ok = window.confirm('Automation Test Confirm: Do you wish to continue?');
    setDialogResult(ok ? 'User confirmed: OK (true)' : 'User dismissed: Cancel (false)');
  };

  const handleNativePrompt = () => {
    const val = window.prompt('Automation Test Prompt: Enter test confirmation code:', 'QA-TEST-2026');
    setDialogResult(val !== null ? `User input received: "${val}"` : 'User cancelled prompt modal.');
  };

  // Kafka Handlers
  const handleInjectPoisonPill = async () => {
    try {
      const res = await apiClient.post('/kafka/chaos/poison-pill', {
        topic: selectedKafkaTopic || 'bookstore.orders.created',
        reason: 'MALFORMED_CORRUPTED_JSON_SCHEMA_FAULT'
      });
      addToast(`Poison pill injected! Dead-Letter Queue (DLQ) intercepted message.`, 'error');
      fetchKafkaData();
    } catch (err: any) {
      addToast('Failed to inject poison pill: ' + err.message, 'error');
    }
  };

  const handleReplayDlq = async (dlqMessageId: string) => {
    try {
      const res = await apiClient.post('/kafka/dlq/replay', { dlqMessageId });
      addToast(`DLQ message replayed back to topic: ${res.data.data.topic}`, 'success');
      fetchKafkaData();
    } catch (err: any) {
      addToast('Failed to replay DLQ: ' + err.message, 'error');
    }
  };

  const handleCommitOffset = async (groupId: string, topic: string, offset: number) => {
    try {
      await apiClient.post(`/kafka/consumer-groups/${groupId}/commit`, { topic, offset });
      addToast(`Consumer group ${groupId} committed offset ${offset}. Lag cleared!`, 'success');
      fetchKafkaData();
    } catch (err: any) {
      addToast('Failed to commit offset: ' + err.message, 'error');
    }
  };

  const handleResetKafka = async () => {
    try {
      await apiClient.post('/kafka/reset');
      addToast('Kafka broker state and consumer groups reset to initial seeds!', 'success');
      fetchKafkaData();
    } catch (err: any) {
      addToast('Failed to reset Kafka: ' + err.message, 'error');
    }
  };

  // Webhook Handlers
  const handleDispatchPing = async () => {
    try {
      const res = await apiClient.post('/webhooks/test-ping', {
        event: 'order:created',
        customPayload: {
          orderId: `ord_qa_${Date.now()}`,
          orderNumber: `ORD-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
          customer: 'alex_wright_admin',
          total: 89.95,
          currency: 'USD',
          status: 'paid'
        }
      });
      addToast(`Test webhook dispatched! Delivered to ${res.data.deliveriesCount} subscribers.`, 'success');
      fetchWebhookData();
    } catch (err: any) {
      addToast('Failed to dispatch webhook: ' + err.message, 'error');
    }
  };

  const handleToggleMockChaos = async () => {
    const nextState = !mockChaos.shouldFail;
    try {
      const res = await apiClient.post('/webhooks/mock-receiver/chaos', {
        shouldFail: nextState,
        statusCode: 503
      });
      setMockChaos(res.data.chaos);
      addToast(
        nextState
          ? 'Mock Receiver Outage Enabled (Returns HTTP 503 for retry testing)'
          : 'Mock Receiver Outage Disabled (Returns HTTP 200 OK)',
        nextState ? 'error' : 'success'
      );
    } catch (err: any) {
      addToast('Failed to toggle receiver chaos: ' + err.message, 'error');
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/webhooks/subscriptions', {
        url: newSubUrl,
        events: newSubEvents.split(',').map(s => s.trim()),
        secret: newSubSecret,
        active: true,
        description: 'Custom Automation Webhook Endpoint'
      });
      addToast('New webhook subscription registered successfully!', 'success');
      setShowAddSubModal(false);
      fetchWebhookData();
    } catch (err: any) {
      addToast('Failed to register webhook: ' + err.message, 'error');
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    try {
      await apiClient.delete(`/webhooks/subscriptions/${id}`);
      addToast('Webhook subscription deleted', 'info');
      fetchWebhookData();
    } catch (err: any) {
      addToast('Failed to delete webhook: ' + err.message, 'error');
    }
  };

  const handleRedeliver = async (id: string) => {
    try {
      const res = await apiClient.post(`/webhooks/deliveries/${id}/redeliver`);
      addToast(`Redelivered past event. HTTP Status: ${res.data.data.statusCode}`, 'info');
      fetchWebhookData();
    } catch (err: any) {
      addToast('Failed to redeliver webhook: ' + err.message, 'error');
    }
  };

  const handleVerifyHmac = async () => {
    try {
      let parsed = {};
      try {
        parsed = JSON.parse(verifyPayload);
      } catch {
        parsed = verifyPayload;
      }

      const res = await apiClient.post('/webhooks/verify-signature', {
        secret: verifySecret,
        payload: parsed,
        signature: verifySig
      });

      setVerifyResult(res.data.isValid);
      if (res.data.isValid) {
        addToast('Valid HMAC-SHA256 signature verified!', 'success');
      } else {
        addToast('Invalid or tampered HMAC signature!', 'error');
      }
    } catch (err: any) {
      addToast('Verification failed: ' + err.message, 'error');
    }
  };

  const getTestId = (base: string) => {
    return useDynamicIds ? `${base}-${Math.random().toString(36).substring(2, 6)}` : base;
  };

  return (
    <div className="space-y-8 pb-16" data-testid="playground-page">
      <Breadcrumbs items={[{ label: 'QA Automation Sandbox' }]} />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-purple-50 via-white to-indigo-50 dark:from-purple-900 dark:via-indigo-900 dark:to-slate-900 rounded-3xl p-6 md:p-8 text-slate-900 dark:text-white border border-purple-200 dark:border-purple-800/50 shadow-sm dark:shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
              Automation Engineering & SDET Lab
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white" data-testid="playground-title">
            QA Automation Testing Playground
          </h1>
          <p className="text-xs text-purple-900/80 dark:text-purple-200 leading-relaxed">
            Enterprise QA sandbox with 7-microservice fault injection, Apache Kafka event streaming with consumer lag and poison-pill DLQ, Enterprise Webhook HMAC verification, and complex UI automation edge cases.
          </p>
        </div>

        {/* Dynamic ID Toggle Switch */}
        <div className="bg-white/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 p-4 rounded-2xl flex items-center gap-4 flex-shrink-0 shadow-sm">
          <div>
            <h5 className="font-bold text-xs text-slate-900 dark:text-white">Dynamic Test IDs</h5>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Append random hash to data-testid</p>
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

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('edge-cases')}
          data-testid="tab-edge-cases"
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'edge-cases'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>UI & Network Edge Cases</span>
        </button>

        <button
          onClick={() => setActiveTab('microservices')}
          data-testid="tab-microservices"
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'microservices'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Microservices Chaos Lab (7 Services)</span>
        </button>

        <button
          onClick={() => setActiveTab('kafka')}
          data-testid="tab-kafka"
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'kafka'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Radio className="w-4 h-4 text-emerald-400" />
          <span>Apache Kafka Event Streaming</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-black">
            LIVE
          </span>
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          data-testid="tab-webhooks"
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'webhooks'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Webhook className="w-4 h-4 text-amber-400" />
          <span>Enterprise Webhooks Lab</span>
          <span className="px-1.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-black">
            HMAC-SHA256
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: UI & Network Edge Cases                             */}
      {/* ========================================================= */}
      {activeTab === 'edge-cases' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Widget 1: Network Latency Simulation Slider */}
            <div
              data-testid="latency-simulator-card"
              className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-4 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Network Latency Simulator</h3>
              </div>
              <p className="text-xs text-slate-400">
                Inject artificial server response delay into every <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded border border-slate-800">/api</code> endpoint to test loading spinners, skeleton states, and timeout handling.
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

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                <span className="text-slate-400">Active Delay Header:</span>
                <code className="font-mono text-indigo-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  x-mock-delay: {latencyMs}ms
                </code>
              </div>
            </div>

            {/* Widget 2: HTTP Status Code Fault Injector */}
            <div
              data-testid="error-simulator-card"
              className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-4 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-white text-sm">HTTP Error Simulation Triggers</h3>
              </div>
              <p className="text-xs text-slate-400">
                Trigger simulated backend faults to verify client toast popups and error fallback handling.
              </p>

              <div className="flex flex-wrap gap-2" data-testid="error-trigger-buttons">
                {[400, 401, 403, 404, 429, 500, 503].map((code) => (
                  <button
                    key={code}
                    onClick={() => handleSimulateError(code)}
                    data-testid={`trigger-error-${code}`}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 hover:border-rose-700 border border-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-all"
                  >
                    {code}
                  </button>
                ))}
              </div>

              {isLoadingError && (
                <div className="text-xs text-slate-400 animate-pulse">Requesting simulated error...</div>
              )}

              {simulatedResult && (
                <div
                  data-testid="simulated-error-response"
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-1"
                >
                  <div className="text-rose-400 font-bold">
                    Response Status: {simulatedResult.status} {simulatedResult.statusText}
                  </div>
                  <pre className="text-slate-400 overflow-x-auto text-[11px]">
                    {JSON.stringify(simulatedResult.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Widget 3: Native Browser Dialogs */}
            <div
              data-testid="native-dialogs-card"
              className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-4 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">Native Browser Dialogs</h3>
              </div>
              <p className="text-xs text-slate-400">
                Test Selenium/Playwright capabilities handling window.alert, window.confirm, and window.prompt.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleNativeAlert}
                  data-testid={getTestId('btn-native-alert')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white font-bold text-xs transition-colors border border-slate-700"
                >
                  Trigger alert()
                </button>
                <button
                  onClick={handleNativeConfirm}
                  data-testid={getTestId('btn-native-confirm')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white font-bold text-xs transition-colors border border-slate-700"
                >
                  Trigger confirm()
                </button>
                <button
                  onClick={handleNativePrompt}
                  data-testid={getTestId('btn-native-prompt')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white font-bold text-xs transition-colors border border-slate-700"
                >
                  Trigger prompt()
                </button>
              </div>

              {dialogResult && (
                <div
                  data-testid="dialog-result-text"
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400"
                >
                  {dialogResult}
                </div>
              )}
            </div>

            {/* Widget 4: File Download Simulation */}
            <div
              data-testid="file-download-card"
              className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-4 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">File Download & Export Sandbox</h3>
              </div>
              <p className="text-xs text-slate-400">
                Validate browser download events, filename parsing, and automated artifact assertions.
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="data:text/csv;charset=utf-8,id,title,price%0A1,Clean%20Code,42.50%0A2,Pragmatic%20Programmer,44.99"
                  download="bookstore-catalog-sample.csv"
                  data-testid={getTestId('download-csv-btn')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white font-bold text-xs transition-colors border border-slate-700 inline-flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Sample CSV</span>
                </a>
              </div>
            </div>
          </div>

          {/* Complex DOM Elements */}
          <div className="space-y-6">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <span>Complex Web Components & Isolation Boundaries</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <ShadowDomWidget />
              <IFrameWidget />
              <DragDropList />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: Microservices Chaos Lab                             */}
      {/* ========================================================= */}
      {activeTab === 'microservices' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Server className="w-6 h-6 text-indigo-400" />
                  <h2 className="text-xl font-black text-white">
                    7 Microservices Architecture Chaos Lab
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Simulate individual microservice outages to test distributed failure isolation. Verify that non-impacted business flows (e.g. borrowing books or checking out) remain 100% operational when isolated services fail.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={fetchServices}
                  disabled={loadingServices}
                  data-testid="refresh-services-btn"
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors border border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingServices ? 'animate-spin' : ''}`} />
                  <span>Poll Status</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetServices}
                  data-testid="reset-services-btn"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-emerald-600/30"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Restore All Healthy</span>
                </button>
              </div>
            </div>

            {/* Grid of 7 Microservices */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {services.map((svc) => {
                const isFailing = svc.status === 'down';
                return (
                  <div
                    key={svc.name}
                    data-testid={`service-card-${svc.name}`}
                    className={`p-4 rounded-2xl border transition-all ${
                      isFailing
                        ? 'bg-rose-950/40 border-rose-900/60 shadow-lg'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-black uppercase tracking-wider text-white">
                        {svc.name} Service
                      </span>
                      <span
                        data-testid={`service-status-${svc.name}`}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          isFailing
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {isFailing ? (
                          <>
                            <AlertCircle className="w-2.5 h-2.5 text-rose-400" />
                            <span>FAULT 503</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
                            <span>HEALTHY</span>
                          </>
                        )}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mb-3 min-h-[32px] leading-snug">
                      {svc.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-3 pt-2 border-t border-slate-800">
                      <span>Latency: {svc.latencyMs}ms</span>
                      <span>Error: {svc.errorRate}%</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleService(svc.name)}
                      data-testid={`toggle-service-${svc.name}`}
                      className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isFailing
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                          : 'bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-800/60'
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
      )}

      {/* ========================================================= */}
      {/* TAB 3: Apache Kafka Event Streaming Lab                   */}
      {/* ========================================================= */}
      {activeTab === 'kafka' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Kafka Control Bar */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h2 className="text-lg font-black text-white">Apache Kafka Event Broker Console</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time asynchronous messaging bus connecting Order, Inventory, Notification, and Audit services.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleInjectPoisonPill}
                data-testid="inject-poison-pill-btn"
                className="px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-rose-600/30"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Inject Poison Pill (DLQ Test)</span>
              </button>

              <button
                type="button"
                onClick={fetchKafkaData}
                disabled={loadingKafka}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingKafka ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={handleResetKafka}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors border border-slate-700"
                title="Reset Kafka cluster state to default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Consumer Groups & Lag Metric Card */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Consumer Groups & Lag Monitor</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Consumer Group ID</th>
                    <th className="py-2.5 px-3">Subscribed Topic</th>
                    <th className="py-2.5 px-3 text-center">Committed Offset</th>
                    <th className="py-2.5 px-3 text-center">Topic Offset</th>
                    <th className="py-2.5 px-3 text-center">Consumer Lag</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {consumerGroups.map((cg) => {
                    const hasLag = cg.lag > 0;
                    return (
                      <tr key={cg.groupId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-white">{cg.groupId}</td>
                        <td className="py-2.5 px-3 text-slate-400">{cg.topic}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-indigo-300">{cg.committedOffset}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-400">{cg.latestOffset}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              hasLag ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {cg.lag} msgs
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase ${
                              hasLag ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {hasLag ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                            <span>{cg.status}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleCommitOffset(cg.groupId, cg.topic, cg.latestOffset)}
                            disabled={!hasLag}
                            className="px-2.5 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-600 disabled:opacity-30 disabled:pointer-events-none text-indigo-200 hover:text-white border border-indigo-800 text-[11px] font-bold transition-colors"
                          >
                            Commit to Latest
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Topics Selector and Live Message Stream */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Kafka Topic Partition Stream</h3>
                <p className="text-xs text-slate-400">Select a topic to inspect real-time published event payloads.</p>
              </div>

              {/* Topic Pills */}
              <div className="flex flex-wrap gap-2">
                {kafkaTopics.map((t) => {
                  const isSelected = selectedKafkaTopic === t.name;
                  const isDlq = t.name.includes('dlq');
                  return (
                    <button
                      key={t.name}
                      onClick={() => setSelectedKafkaTopic(t.name)}
                      data-testid={`select-topic-${t.name}`}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? isDlq
                            ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                            : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                          : isDlq
                          ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {isDlq && <AlertTriangle className="w-3 h-3" />}
                      <span>{t.name}</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
                        {t.messageCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message Feed */}
            <div className="space-y-3">
              {kafkaMessages.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No messages found on topic <code className="text-indigo-300 font-mono">{selectedKafkaTopic}</code>.
                </div>
              ) : (
                kafkaMessages.map((msg) => {
                  const isDlqMsg = msg.topic.includes('dlq');
                  return (
                    <div
                      key={msg.id}
                      data-testid={`kafka-msg-${msg.offset}`}
                      className={`p-4 rounded-2xl border transition-all ${
                        isDlqMsg
                          ? 'bg-rose-950/20 border-rose-900/60'
                          : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono mb-2 pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                            Offset: {msg.offset}
                          </span>
                          <span className="text-slate-400">Partition: {msg.partition}</span>
                          {msg.key && (
                            <span className="text-slate-400">Key: <strong className="text-slate-200">{msg.key}</strong></span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-slate-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                          {isDlqMsg && (
                            <button
                              onClick={() => handleReplayDlq(msg.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-bold transition-colors flex items-center gap-1 shadow-md shadow-emerald-600/30"
                            >
                              <Play className="w-3 h-3" />
                              <span>Replay from DLQ</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                        {JSON.stringify(msg.value, null, 2)}
                      </pre>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: Enterprise Webhooks Automation Lab                 */}
      {/* ========================================================= */}
      {activeTab === 'webhooks' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Top Webhooks Control Bar */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Webhook className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-black text-white">Enterprise Webhooks Dispatcher & Verification Engine</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Outbound webhook delivery with HMAC-SHA256 signature verification, exponential retry backoff, and mock receiver sandbox.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDispatchPing}
                data-testid="dispatch-test-webhook-btn"
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Test Ping</span>
              </button>

              <button
                type="button"
                onClick={handleToggleMockChaos}
                data-testid="toggle-mock-chaos-btn"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  mockChaos.shouldFail
                    ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{mockChaos.shouldFail ? 'Mock Receiver Outage Active (503)' : 'Simulate 503 Outage'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddSubModal(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Webhook</span>
              </button>
            </div>
          </div>

          {/* Webhook Subscriptions Registry */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Registered Subscriptions</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  data-testid={`webhook-sub-${sub.id}`}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-300">{sub.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        sub.active
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {sub.active ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>

                  <div className="font-mono text-xs text-white truncate" title={sub.url}>
                    {sub.url}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {sub.events.map((ev) => (
                      <span
                        key={ev}
                        className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-mono"
                      >
                        {ev}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-500 font-mono">Secret: {sub.secret.slice(0, 12)}...</span>
                    {sub.id !== 'wh_sub_mock_receiver' && (
                      <button
                        onClick={() => handleDeleteWebhook(sub.id)}
                        className="text-rose-400 hover:text-rose-300 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HMAC Signature Verification Tool */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cryptographic HMAC-SHA256 Signature Verifier</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Shared Secret</label>
                <input
                  type="text"
                  value={verifySecret}
                  onChange={(e) => setVerifySecret(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">X-BookStore-Signature Header</label>
                <input
                  type="text"
                  placeholder="sha256=..."
                  value={verifySig}
                  onChange={(e) => setVerifySig(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Raw Payload JSON</label>
                <input
                  type="text"
                  value={verifyPayload}
                  onChange={(e) => setVerifyPayload(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleVerifyHmac}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/30"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Cryptographic Signature</span>
              </button>

              {verifyResult !== null && (
                <div
                  className={`px-3 py-1 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 ${
                    verifyResult
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {verifyResult ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>{verifyResult ? 'SIGNATURE VALID (Authentic)' : 'SIGNATURE INVALID (Forged/Tampered)'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Audit Logs */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Outbound Delivery Audit History</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Delivery ID</th>
                    <th className="py-2.5 px-3">Event</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Latency</th>
                    <th className="py-2.5 px-3">Attempts</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {deliveries.map((del) => {
                    const isSuccess = del.statusCode >= 200 && del.statusCode < 300;
                    return (
                      <tr key={del.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-indigo-300">{del.id}</td>
                        <td className="py-2.5 px-3 text-white font-bold">{del.event}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              isSuccess
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            HTTP {del.statusCode}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{del.latencyMs}ms</td>
                        <td className="py-2.5 px-3 text-slate-400">{del.attempts}</td>
                        <td className="py-2.5 px-3 text-slate-500">{new Date(del.timestamp).toLocaleTimeString()}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleRedeliver(del.id)}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-bold transition-colors"
                          >
                            Redeliver
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Webhook Subscription Modal */}
      {showAddSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 max-w-md w-full p-6 space-y-4 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white">Register Webhook Subscription</h3>
            <form onSubmit={handleCreateWebhook} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Target Endpoint URL</label>
                <input
                  type="url"
                  required
                  value={newSubUrl}
                  onChange={(e) => setNewSubUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Subscribed Events (comma separated)</label>
                <input
                  type="text"
                  required
                  value={newSubEvents}
                  onChange={(e) => setNewSubEvents(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">HMAC Signing Secret</label>
                <input
                  type="text"
                  required
                  value={newSubSecret}
                  onChange={(e) => setNewSubSecret(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSubModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
                >
                  Register Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
