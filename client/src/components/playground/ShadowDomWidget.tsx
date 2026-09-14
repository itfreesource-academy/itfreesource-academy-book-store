import React, { useEffect, useRef } from 'react';

export const ShadowDomWidget: React.FC = () => {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hostRef.current) return;

    // Attach Shadow DOM if not already attached
    let shadowRoot = hostRef.current.shadowRoot;
    if (!shadowRoot) {
      shadowRoot = hostRef.current.attachShadow({ mode: 'open' });
    }

    shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: inherit;
        }
        .shadow-box {
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
          color: #ffffff;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid #4338ca;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
        }
        .badge {
          display: inline-block;
          background: #4f46e5;
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 9999px;
          margin-bottom: 10px;
        }
        h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 700;
        }
        p {
          margin: 0 0 14px 0;
          font-size: 12px;
          color: #c7d2fe;
          line-height: 1.5;
        }
        .input-group {
          display: flex;
          gap: 8px;
        }
        input {
          flex: 1;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #6366f1;
          background: #312e81;
          color: #ffffff;
          font-size: 12px;
          outline: none;
        }
        input:focus {
          border-color: #a5b4fc;
          box-shadow: 0 0 0 2px rgba(165, 180, 252, 0.3);
        }
        button {
          background: #6366f1;
          color: #ffffff;
          border: none;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        button:hover {
          background: #818cf8;
        }
        .result-text {
          margin-top: 12px;
          font-size: 12px;
          color: #34d399;
          font-weight: 600;
          min-height: 18px;
        }
      </style>
      <div class="shadow-box" id="shadow-container" data-testid="shadow-container">
        <span class="badge">SHADOW ROOT (OPEN)</span>
        <h4>Shadow DOM Test Boundary</h4>
        <p>This element is encapsulated inside a Shadow Root. Use Playwright / Cypress piercing selectors to test.</p>
        <div class="input-group">
          <input type="text" id="shadow-input" placeholder="Type secret payload..." data-testid="shadow-input" />
          <button type="button" id="shadow-submit-btn" data-testid="shadow-submit-btn">Submit</button>
        </div>
        <div class="result-text" id="shadow-output" data-testid="shadow-output"></div>
      </div>
    `;

    const input = shadowRoot.getElementById('shadow-input') as HTMLInputElement;
    const btn = shadowRoot.getElementById('shadow-submit-btn') as HTMLButtonElement;
    const output = shadowRoot.getElementById('shadow-output') as HTMLDivElement;

    const handleSubmit = () => {
      if (input && output) {
        output.textContent = input.value
          ? `✓ Received shadow payload: "${input.value}"`
          : '⚠️ Please enter text into the shadow input.';
      }
    };

    btn?.addEventListener('click', handleSubmit);

    return () => {
      btn?.removeEventListener('click', handleSubmit);
    };
  }, []);

  return <div ref={hostRef} id="shadow-host" data-testid="shadow-host" className="w-full" />;
};
