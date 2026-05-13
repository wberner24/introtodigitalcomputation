/* ============================================================
   WIDGET: transistor-toggle
   Transistor as a simple 3-lead switch: Output (top),
   Control (left), Ground (bottom).
   ============================================================ */

(function () {

  function render(container) {
    container.innerHTML = `
      <div class="widget-card" data-widget-name="Interactive">
        <div class="widget-title">Transistor: The Physical Bit</div>
        <div class="widget-desc">Click the button to flip the control signal and see how the transistor responds.</div>

        <div class="tt-wrap">

          <!-- SVG diagram -->
          <svg class="tt-svg" viewBox="-20 0 200 224" xmlns="http://www.w3.org/2000/svg">

            <!-- Output (top lead) -->
            <text x="96" y="13" text-anchor="middle" class="tt-lbl">Output</text>
            <text x="96" y="26" text-anchor="middle" class="tt-lbl tt-out-val" id="tt-out-val">HIGH → 1</text>

            <!-- Top wire: output → transistor -->
            <line x1="96" y1="30" x2="96" y2="80" class="tt-wire" id="tt-wire-top"/>

            <!-- Transistor body -->
            <rect x="66" y="80" width="60" height="48" rx="7" class="tt-body" id="tt-body"/>
            <text x="96" y="109" text-anchor="middle" class="tt-body-lbl">transistor</text>

            <!-- Control wire (left lead) -->
            <line x1="12" y1="104" x2="66" y2="104" class="tt-wire tt-wire-ctrl" id="tt-wire-ctrl"/>
            <text x="8" y="97" text-anchor="end" class="tt-lbl">Control</text>
            <text x="8" y="113" text-anchor="end" class="tt-lbl tt-ctrl-val" id="tt-ctrl-val">LOW</text>

            <!-- Bottom wire: transistor → ground -->
            <line x1="96" y1="128" x2="96" y2="178" class="tt-wire" id="tt-wire-bot"/>

            <!-- Ground symbol -->
            <line x1="74"  y1="178" x2="118" y2="178" class="tt-gnd"/>
            <line x1="80"  y1="185" x2="112" y2="185" class="tt-gnd"/>
            <line x1="87"  y1="192" x2="105" y2="192" class="tt-gnd"/>
            <text x="96" y="210" text-anchor="middle" class="tt-lbl">Ground</text>

          </svg>

          <!-- Readout + controls -->
          <div class="tt-panel">
            <div class="tt-readout">
              <div class="tt-stat">
                <div class="tt-stat-lbl">Control signal</div>
                <div class="tt-stat-val" id="tt-ctrl-disp">LOW</div>
              </div>
              <div class="tt-readout-arrow">→</div>
              <div class="tt-stat tt-stat-bit" id="tt-stat-bit">
                <div class="tt-stat-lbl">Bit value</div>
                <div class="tt-bit" id="tt-bit">1</div>
              </div>
            </div>

            <button class="btn btn-accent tt-btn" id="tt-btn">
              Set control signal HIGH
            </button>

            <p class="tt-explain" id="tt-explain">
              Control is <strong>LOW</strong> — the transistor is off. No current flows.
              The output stays high, which the computer reads as a <strong>1</strong>.
            </p>
          </div>

        </div>
      </div>
    `;

    /* ── Scoped styles ── */
    if (!document.getElementById('tt-styles')) {
      const s = document.createElement('style');
      s.id = 'tt-styles';
      s.textContent = `
        .tt-wrap {
          display: flex;
          gap: 28px;
          align-items: center;
          flex-wrap: wrap;
        }
        .tt-svg {
          width: 200px;
          max-width: 100%;
          height: auto;
          flex-shrink: 0;
          overflow: visible;
        }
        .tt-lbl {
          font-family: var(--font-mono);
          font-size: 10px;
          fill: var(--ink-mid);
        }
        .tt-out-val {
          font-weight: 700;
          fill: var(--accent-dark);
          transition: fill 0.3s;
        }
        .tt-out-val.low {
          fill: var(--blue);
        }
        .tt-ctrl-val {
          font-weight: 700;
          fill: var(--ink);
          transition: fill 0.3s;
        }
        .tt-body-lbl {
          font-family: var(--font-mono);
          font-size: 9px;
          fill: var(--ink-light);
        }
        .tt-wire {
          stroke: var(--border-dark);
          stroke-width: 2.5;
          stroke-linecap: round;
          transition: stroke 0.35s;
        }
        .tt-wire.live {
          stroke: var(--accent);
        }
        .tt-gnd {
          stroke: var(--ink-mid);
          stroke-width: 2;
          stroke-linecap: round;
        }
        .tt-body {
          fill: var(--bg-alt);
          stroke: var(--border-dark);
          stroke-width: 2;
          transition: fill 0.35s, stroke 0.35s;
        }
        .tt-body.on {
          fill: var(--accent-light);
          stroke: var(--accent);
        }
        .tt-panel {
          flex: 1;
          min-width: 200px;
        }
        .tt-readout {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .tt-readout-arrow {
          font-size: 1.2rem;
          color: var(--ink-light);
        }
        .tt-stat {
          background: var(--bg-alt);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 10px 16px;
          flex: 1;
          text-align: center;
          transition: background 0.3s, border-color 0.3s;
        }
        .tt-stat-bit {
          background: var(--accent-light);
          border-color: rgba(193,68,14,0.3);
        }
        .tt-stat-bit.zero {
          background: var(--blue-light);
          border-color: rgba(29,78,122,0.3);
        }
        .tt-stat-lbl {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-light);
          margin-bottom: 4px;
        }
        .tt-stat-val {
          font-family: var(--font-mono);
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--ink);
          transition: color 0.3s;
        }
        .tt-bit {
          font-family: var(--font-mono);
          font-size: 2rem;
          font-weight: 700;
          color: var(--accent-dark);
          line-height: 1;
          transition: color 0.3s;
        }
        .tt-bit.zero { color: var(--blue); }
        .tt-btn {
          width: 100%;
          margin-bottom: 14px;
          padding: 10px;
          font-size: 0.82rem;
        }
        .tt-explain {
          font-size: 0.88rem;
          color: var(--ink-mid);
          line-height: 1.6;
          padding: 12px 14px;
          background: var(--bg-alt);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          margin: 0;
          transition: all 0.3s;
        }
      `;
      document.head.appendChild(s);
    }

    /* ── State ── */
    let high = false;

    const btn      = container.querySelector('#tt-btn');
    const ctrlDisp = container.querySelector('#tt-ctrl-disp');
    const ctrlVal  = container.querySelector('#tt-ctrl-val');
    const outVal   = container.querySelector('#tt-out-val');
    const bitEl    = container.querySelector('#tt-bit');
    const statBit  = container.querySelector('#tt-stat-bit');
    const explain  = container.querySelector('#tt-explain');
    const body     = container.querySelector('#tt-body');
    const wireTop  = container.querySelector('#tt-wire-top');
    const wireBot  = container.querySelector('#tt-wire-bot');
    const wireCtrl = container.querySelector('#tt-wire-ctrl');

    function update() {
      if (high) {
        /* Control HIGH → transistor ON → current flows → output LOW → bit 0 */
        btn.textContent      = 'Set control signal LOW';
        ctrlDisp.textContent = 'HIGH';
        ctrlVal.textContent  = 'HIGH';
        outVal.textContent   = 'LOW → 0';
        bitEl.textContent    = '0';
        outVal.classList.add('low');
        bitEl.classList.add('zero');
        statBit.classList.add('zero');
        body.classList.add('on');
        wireTop.classList.add('live');
        wireBot.classList.add('live');
        wireCtrl.classList.add('live');
        explain.innerHTML = `Control is <strong>HIGH</strong> — the transistor is on. Current flows through to ground, pulling the output low. The computer reads that as a <strong>0</strong>.`;
      } else {
        /* Control LOW → transistor OFF → no current → output HIGH → bit 1 */
        btn.textContent      = 'Set control signal HIGH';
        ctrlDisp.textContent = 'LOW';
        ctrlVal.textContent  = 'LOW';
        outVal.textContent   = 'HIGH → 1';
        bitEl.textContent    = '1';
        outVal.classList.remove('low');
        bitEl.classList.remove('zero');
        statBit.classList.remove('zero');
        body.classList.remove('on');
        wireTop.classList.remove('live');
        wireBot.classList.remove('live');
        wireCtrl.classList.remove('live');
        explain.innerHTML = `Control is <strong>LOW</strong> — the transistor is off. No current flows. The output stays high, which the computer reads as a <strong>1</strong>.`;
      }
    }

    btn.addEventListener('click', () => { high = !high; update(); });
    update();
  }

  window.IDC = window.IDC || { widgets: {} };
  window.IDC.widgets['transistor-toggle'] = { render };

})();
