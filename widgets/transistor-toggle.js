/* ============================================================
   WIDGET: transistor-toggle
   Interactive transistor switch — click to toggle ON/OFF,
   watch voltage state and bit value update live.
   ============================================================ */

(function () {

  function render(container) {
    container.innerHTML = `
      <div class="widget-card" data-widget-name="Interactive">
        <div class="widget-title">Transistor: The Physical Bit</div>
        <div class="widget-desc">Click the switch to open or close the circuit. Watch what happens to the voltage — and the bit value it represents.</div>

        <div class="transistor-demo">

          <!-- Circuit diagram -->
          <div class="circuit-wrap">
            <svg class="circuit-svg" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">

              <!-- Power supply label -->
              <text x="160" y="18" text-anchor="middle" class="svg-label">+V (Power)</text>

              <!-- Top wire from power to transistor -->
              <line x1="160" y1="24" x2="160" y2="72" class="wire wire-top" id="wire-top"/>

              <!-- Transistor body -->
              <rect x="130" y="72" width="60" height="40" rx="6" class="transistor-body" id="transistor-body"/>
              <text x="160" y="97" text-anchor="middle" class="svg-transistor-label">transistor</text>

              <!-- Switch / Gate input (left side) -->
              <line x1="60" y1="92" x2="130" y2="92" class="wire wire-gate" id="wire-gate"/>
              <text x="52" y="88" text-anchor="end" class="svg-label" id="gate-label">OPEN</text>
              <text x="52" y="100" text-anchor="end" class="svg-label svg-label-small">(gate)</text>

              <!-- Bottom wire from transistor to ground -->
              <line x1="160" y1="112" x2="160" y2="160" class="wire wire-bottom" id="wire-bottom"/>

              <!-- Ground symbol -->
              <line x1="136" y1="160" x2="184" y2="160" class="wire ground-line"/>
              <line x1="143" y1="167" x2="177" y2="167" class="wire ground-line"/>
              <line x1="150" y1="174" x2="170" y2="174" class="wire ground-line"/>
              <text x="160" y="192" text-anchor="middle" class="svg-label">Ground (0V)</text>

              <!-- Output tap (right side) -->
              <line x1="190" y1="92" x2="260" y2="92" class="wire wire-output" id="wire-output"/>
              <text x="264" y="88" class="svg-label">Output</text>
              <text x="264" y="100" class="svg-label svg-label-small" id="output-label">HIGH (1)</text>

              <!-- Voltage indicator circle -->
              <circle cx="160" cy="92" r="0" fill="none"/>
            </svg>
          </div>

          <!-- State readout -->
          <div class="transistor-readout">
            <div class="readout-row">
              <div class="readout-item">
                <div class="readout-label">Switch</div>
                <div class="readout-value" id="switch-state">OPEN</div>
              </div>
              <div class="readout-item">
                <div class="readout-label">Transistor</div>
                <div class="readout-value" id="transistor-state">OFF</div>
              </div>
              <div class="readout-item">
                <div class="readout-label">Output Voltage</div>
                <div class="readout-value" id="voltage-state">HIGH</div>
              </div>
              <div class="readout-item highlight" id="bit-readout">
                <div class="readout-label">Bit Value</div>
                <div class="readout-value bit-value" id="bit-value">1</div>
              </div>
            </div>

            <button class="btn btn-accent toggle-btn" id="toggle-btn" onclick="IDC_transistorToggle()">
              Close Switch (Turn ON)
            </button>

            <div class="transistor-explain" id="transistor-explain">
              The switch is <strong>open</strong> — no current flows through the transistor. The output line reads <strong>HIGH voltage</strong>, which the computer interprets as a <strong>1</strong>.
            </div>
          </div>

        </div>
      </div>
    `;

    // Inject scoped styles
    if (!document.getElementById('transistor-styles')) {
      const style = document.createElement('style');
      style.id = 'transistor-styles';
      style.textContent = `
        .transistor-demo {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .circuit-wrap {
          flex: 0 0 auto;
        }
        .circuit-svg {
          width: 320px;
          max-width: 100%;
          height: auto;
          display: block;
        }
        .svg-label {
          font-family: var(--font-mono);
          font-size: 10px;
          fill: var(--ink-mid);
        }
        .svg-label-small {
          font-size: 9px;
          fill: var(--ink-light);
        }
        .svg-transistor-label {
          font-family: var(--font-mono);
          font-size: 9px;
          fill: var(--ink-light);
        }
        .wire {
          stroke: var(--border-dark);
          stroke-width: 2.5;
          stroke-linecap: round;
          transition: stroke 0.4s ease, stroke-width 0.4s ease;
        }
        .wire.active {
          stroke: var(--accent);
          stroke-width: 3.5;
        }
        .ground-line {
          stroke: var(--ink-mid);
          stroke-width: 2;
          stroke-linecap: round;
        }
        .transistor-body {
          fill: var(--bg-alt);
          stroke: var(--border-dark);
          stroke-width: 2;
          transition: fill 0.4s ease, stroke 0.4s ease;
        }
        .transistor-body.active {
          fill: var(--accent-light);
          stroke: var(--accent);
        }
        .transistor-readout {
          flex: 1;
          min-width: 220px;
        }
        .readout-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 16px;
        }
        .readout-item {
          background: var(--bg-alt);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 10px 14px;
          transition: background 0.3s, border-color 0.3s;
        }
        .readout-item.highlight {
          background: var(--accent-light);
          border-color: rgba(193,68,14,0.3);
        }
        .readout-item.highlight.off {
          background: var(--blue-light);
          border-color: rgba(29,78,122,0.3);
        }
        .readout-label {
          font-family: var(--font-mono);
          font-size: 0.62rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-light);
          margin-bottom: 4px;
        }
        .readout-value {
          font-family: var(--font-mono);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--ink);
          transition: color 0.3s;
        }
        .bit-value {
          font-size: 1.6rem;
          color: var(--accent-dark);
          transition: color 0.3s;
        }
        .bit-value.zero {
          color: var(--blue);
        }
        .toggle-btn {
          width: 100%;
          margin-bottom: 14px;
          padding: 11px;
          font-size: 0.82rem;
        }
        .transistor-explain {
          font-size: 0.88rem;
          color: var(--ink-mid);
          line-height: 1.6;
          padding: 12px 14px;
          background: var(--bg-alt);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          min-height: 60px;
          transition: all 0.3s;
        }
      `;
      document.head.appendChild(style);
    }

    // State
    let isOn = false;
    window.IDC_transistorToggle = function() { toggle(); };

    function toggle() {
      isOn = !isOn;

      const btn         = container.querySelector('#toggle-btn');
      const switchState = container.querySelector('#switch-state');
      const transState  = container.querySelector('#transistor-state');
      const voltState   = container.querySelector('#voltage-state');
      const bitValue    = container.querySelector('#bit-value');
      const bitReadout  = container.querySelector('#bit-readout');
      const explain     = container.querySelector('#transistor-explain');
      const transBody   = container.querySelector('#transistor-body');
      const gateLabel   = container.querySelector('#gate-label');
      const outputLabel = container.querySelector('#output-label');
      const wireTop     = container.querySelector('#wire-top');
      const wireBottom  = container.querySelector('#wire-bottom');
      const wireOutput  = container.querySelector('#wire-output');

      if (isOn) {
        // Switch closed — transistor ON — current flows — output LOW — bit = 0
        btn.textContent = 'Open Switch (Turn OFF)';
        switchState.textContent = 'CLOSED';
        transState.textContent = 'ON';
        voltState.textContent = 'LOW';
        bitValue.textContent = '0';
        bitValue.classList.add('zero');
        bitReadout.classList.add('off');
        gateLabel.textContent = 'CLOSED';
        outputLabel.textContent = 'LOW (0)';
        transBody.classList.add('active');
        wireTop.classList.add('active');
        wireBottom.classList.add('active');
        wireOutput.classList.remove('active');
        explain.innerHTML = `The switch is <strong>closed</strong> — current flows through the transistor to ground. The output line is pulled <strong>LOW</strong> (near 0V), which the computer interprets as a <strong>0</strong>.`;
      } else {
        // Switch open — transistor OFF — no current — output HIGH — bit = 1
        btn.textContent = 'Close Switch (Turn ON)';
        switchState.textContent = 'OPEN';
        transState.textContent = 'OFF';
        voltState.textContent = 'HIGH';
        bitValue.textContent = '1';
        bitValue.classList.remove('zero');
        bitReadout.classList.remove('off');
        gateLabel.textContent = 'OPEN';
        outputLabel.textContent = 'HIGH (1)';
        transBody.classList.remove('active');
        wireTop.classList.remove('active');
        wireBottom.classList.remove('active');
        wireOutput.classList.remove('active');
        explain.innerHTML = `The switch is <strong>open</strong> — no current flows through the transistor. The output line reads <strong>HIGH voltage</strong>, which the computer interprets as a <strong>1</strong>.`;
      }
    }
  }

  // Register immediately
  window.IDC = window.IDC || { widgets: {} };
  window.IDC.widgets['transistor-toggle'] = { render };

})();
