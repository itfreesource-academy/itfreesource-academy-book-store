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
              background-color: #0b0f17;
              color: #f8fafc;
            }
            .card {
              background: #0f172a;
              border: 1px solid #1e293b;
              border-radius: 12px;
              padding: 16px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            }
            .badge {
              display: inline-block;
              background: #4f46e5;
              color: #ffffff;
              font-size: 10px;
              font-weight: 700;
              padding: 3px 8px;
              border-radius: 9999px;
              margin-bottom: 8px;
            }
            h4 { margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #ffffff; }
            p { margin: 0 0 12px 0; font-size: 11px; color: #94a3b8; }
            code { background: #1e293b; padding: 2px 4px; border-radius: 4px; color: #818cf8; }
            .row { display: flex; gap: 8px; }
            input {
              flex: 1;
              padding: 6px 10px;
              background: #020617;
              border: 1px solid #334155;
              border-radius: 6px;
              font-size: 12px;
              color: #ffffff;
              outline: none;
            }
            input:focus { border-color: #6366f1; }
            button {
              background: #4f46e5;
              color: white;
              border: none;
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
            }
            button:hover { background: #4338ca; }
            #iframe-msg {
              margin-top: 10px;
              font-size: 11px;
              color: #34d399;
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
      className="w-full h-44 border border-slate-800 rounded-2xl bg-[#0b0f17]"
    />
  );
};
