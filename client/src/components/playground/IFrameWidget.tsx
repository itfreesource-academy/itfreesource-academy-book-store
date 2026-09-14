import React, { useRef, useEffect } from 'react';

export const IFrameWidget: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              margin: 0;
              padding: 16px;
              background-color: #f8fafc;
              color: #0f172a;
            }
            .card {
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 16px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .badge {
              display: inline-block;
              background: #0284c7;
              color: #ffffff;
              font-size: 10px;
              font-weight: 700;
              padding: 3px 8px;
              border-radius: 9999px;
              margin-bottom: 8px;
            }
            h4 { margin: 0 0 6px 0; font-size: 14px; font-weight: 700; }
            p { margin: 0 0 12px 0; font-size: 11px; color: #64748b; }
            .row { display: flex; gap: 8px; }
            input {
              flex: 1;
              padding: 6px 10px;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              font-size: 12px;
              outline: none;
            }
            input:focus { border-color: #0284c7; }
            button {
              background: #0284c7;
              color: white;
              border: none;
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
            }
            button:hover { background: #0369a1; }
            #iframe-msg {
              margin-top: 10px;
              font-size: 11px;
              color: #059669;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge" data-testid="iframe-badge">IFRAME SANDBOX</span>
            <h4 data-testid="iframe-heading">Isolated Nested Frame</h4>
            <p>Target this frame in Playwright via: <code>page.frameLocator('#qa-test-iframe')</code></p>
            <div class="row">
              <input type="text" id="iframe-input" data-testid="iframe-input" placeholder="Type test string inside frame..." />
              <button type="button" id="iframe-btn" data-testid="iframe-btn">Verify</button>
            </div>
            <div id="iframe-msg" data-testid="iframe-msg"></div>
          </div>
          <script>
            document.getElementById('iframe-btn').addEventListener('click', function() {
              var val = document.getElementById('iframe-input').value;
              document.getElementById('iframe-msg').textContent = val ? 'Verified frame value: ' + val : 'Frame input is empty';
            });
          </script>
        </body>
      </html>
    `);
    doc.close();
  }, []);

  return (
    <iframe
      ref={iframeRef}
      id="qa-test-iframe"
      data-testid="qa-test-iframe"
      title="QA Automation Frame Sandbox"
      className="w-full h-44 border border-slate-200 rounded-2xl bg-white"
    />
  );
};
