/* ============================================================
   WIDGET: rgb-mixer
   Three sliders (R, G, B) 0–255 each.
   Live readouts: decimal, binary, hex per channel.
   Live color swatch + full hex code.
   ============================================================ */

(function () {

  function render(container) {

    const defaults = { R: 193, G: 68, B: 14 }; // textbook orange
    const state = { ...defaults };

    container.innerHTML = `
      <div class="widget-card" data-widget-name="Interactive">
        <div class="widget-title">RGB Color Mixer</div>
        <div class="widget-desc">Drag the sliders to mix your color. Each channel is one byte — watch the binary, decimal, and hex values update live.</div>

        <div class="rgb-mixer-layout">

          <!-- Color preview -->
          <div class="rgb-preview-col">
            <div class="rgb-swatch" id="rgb-swatch"></div>
            <div class="rgb-hex-badge" id="rgb-hex-badge">#C1440E</div>
            <div class="rgb-label-note">1 pixel · 3 bytes · 24 bits</div>
          </div>

          <!-- Sliders -->
          <div class="rgb-sliders-col">

            <div class="rgb-channel" id="ch-R">
              <div class="rgb-ch-header">
                <span class="rgb-ch-name rgb-r">Red</span>
                <div class="rgb-ch-values">
                  <span class="rgb-val-dec" id="R-dec">193</span>
                  <span class="rgb-val-hex rgb-r" id="R-hex">C1</span>
                  <span class="rgb-val-bin" id="R-bin">11000001</span>
                </div>
              </div>
              <input type="range" min="0" max="255" value="193" class="rgb-slider rgb-slider-r" id="slider-R"
                oninput="IDC_rgbUpdate('R', this.value)">
              <div class="rgb-track-ends"><span>0</span><span>255</span></div>
            </div>

            <div class="rgb-channel" id="ch-G">
              <div class="rgb-ch-header">
                <span class="rgb-ch-name rgb-g">Green</span>
                <div class="rgb-ch-values">
                  <span class="rgb-val-dec" id="G-dec">68</span>
                  <span class="rgb-val-hex rgb-g" id="G-hex">44</span>
                  <span class="rgb-val-bin" id="G-bin">01000100</span>
                </div>
              </div>
              <input type="range" min="0" max="255" value="68" class="rgb-slider rgb-slider-g" id="slider-G"
                oninput="IDC_rgbUpdate('G', this.value)">
              <div class="rgb-track-ends"><span>0</span><span>255</span></div>
            </div>

            <div class="rgb-channel" id="ch-B">
              <div class="rgb-ch-header">
                <span class="rgb-ch-name rgb-b">Blue</span>
                <div class="rgb-ch-values">
                  <span class="rgb-val-dec" id="B-dec">14</span>
                  <span class="rgb-val-hex rgb-b" id="B-hex">0E</span>
                  <span class="rgb-val-bin" id="B-bin">00001110</span>
                </div>
              </div>
              <input type="range" min="0" max="255" value="14" class="rgb-slider rgb-slider-b" id="slider-B"
                oninput="IDC_rgbUpdate('B', this.value)">
              <div class="rgb-track-ends"><span>0</span><span>255</span></div>
            </div>

          </div>
        </div>

        <!-- Presets -->
        <div class="rgb-presets">
          <span class="rgb-preset-label">Presets:</span>
          <button class="rgb-preset-btn" onclick="IDC_rgbPreset(255,0,0)"     style="background:#f00;border-color:#f00;color:white;">Red</button>
          <button class="rgb-preset-btn" onclick="IDC_rgbPreset(0,200,0)"     style="background:#00c800;border-color:#00a000;color:white;">Green</button>
          <button class="rgb-preset-btn" onclick="IDC_rgbPreset(0,80,200)"    style="background:#0050c8;border-color:#0040a0;color:white;">Blue</button>
          <button class="rgb-preset-btn" onclick="IDC_rgbPreset(255,255,255)" style="background:#fff;border-color:#ccc;color:#333;">White</button>
          <button class="rgb-preset-btn" onclick="IDC_rgbPreset(0,0,0)"       style="background:#000;border-color:#000;color:white;">Black</button>
          <button class="rgb-preset-btn" onclick="IDC_rgbPreset(255,165,0)"   style="background:#ffa500;border-color:#cc8400;color:white;">Orange</button>
          <button class="rgb-preset-btn" onclick="IDC_rgbPreset(193,68,14)"   style="background:#c1440e;border-color:#8c3009;color:white;">Textbook</button>
        </div>

      </div>
    `;

    // Inject styles
    if (!document.getElementById('rgb-mixer-styles')) {
      const style = document.createElement('style');
      style.id = 'rgb-mixer-styles';
      style.textContent = `
        .rgb-mixer-layout {
          display: flex;
          gap: 24px;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        /* ── Preview col ── */
        .rgb-preview-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          flex: 0 0 auto;
        }

        .rgb-swatch {
          width: 100px;
          height: 100px;
          border-radius: 10px;
          border: 2px solid var(--border-dark);
          transition: background 0.12s ease;
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
        }

        .rgb-hex-badge {
          font-family: var(--font-mono);
          font-size: 1rem;
          font-weight: 700;
          background: var(--ink);
          color: white;
          padding: 5px 14px;
          border-radius: 6px;
          letter-spacing: 0.08em;
          transition: color 0.12s;
        }

        .rgb-label-note {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          color: var(--ink-light);
          text-align: center;
          line-height: 1.5;
        }

        /* ── Sliders col ── */
        .rgb-sliders-col {
          flex: 1;
          min-width: 260px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .rgb-channel {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .rgb-ch-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 8px;
        }

        .rgb-ch-name {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .rgb-r { color: #c0392b; }
        .rgb-g { color: #1a6b4a; }
        .rgb-b { color: #1D4E7A; }

        .rgb-ch-values {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .rgb-val-dec {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--blue);
          background: var(--blue-light);
          border: 1px solid rgba(29,78,122,0.2);
          border-radius: 3px;
          padding: 1px 7px;
          min-width: 36px;
          text-align: center;
          transition: all 0.1s;
        }

        .rgb-val-hex {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          font-weight: 700;
          background: #e0f2ea;
          border: 1px solid rgba(26,107,74,0.22);
          border-radius: 3px;
          padding: 1px 7px;
          min-width: 30px;
          text-align: center;
          transition: all 0.1s;
        }

        .rgb-val-hex.rgb-r { background: #fdf0f0; border-color: rgba(192,57,43,0.22); color: #c0392b; }
        .rgb-val-hex.rgb-g { background: #e0f2ea; border-color: rgba(26,107,74,0.22); color: #1a6b4a; }
        .rgb-val-hex.rgb-b { background: var(--blue-light); border-color: rgba(29,78,122,0.22); color: #1D4E7A; }

        .rgb-val-bin {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          font-weight: 600;
          color: #8C3009;
          background: #F0E6DF;
          border: 1px solid rgba(193,68,14,0.2);
          border-radius: 3px;
          padding: 1px 7px;
          letter-spacing: 0.04em;
          transition: all 0.1s;
        }

        /* ── Sliders ── */
        .rgb-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 4px;
          outline: none;
          cursor: pointer;
          transition: opacity 0.15s;
        }

        .rgb-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.1s;
        }

        .rgb-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }

        .rgb-slider-r {
          background: linear-gradient(to right, #000, #ff0000);
        }
        .rgb-slider-r::-webkit-slider-thumb { background: #c0392b; }

        .rgb-slider-g {
          background: linear-gradient(to right, #000, #00cc00);
        }
        .rgb-slider-g::-webkit-slider-thumb { background: #1a6b4a; }

        .rgb-slider-b {
          background: linear-gradient(to right, #000, #0055ff);
        }
        .rgb-slider-b::-webkit-slider-thumb { background: #1D4E7A; }

        .rgb-track-ends {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-mono);
          font-size: 0.6rem;
          color: var(--ink-light);
          margin-top: 2px;
        }

        /* ── Presets ── */
        .rgb-presets {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          padding-top: 4px;
          border-top: 1px solid var(--border);
          margin-top: 4px;
        }

        .rgb-preset-label {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-light);
          flex-shrink: 0;
        }

        .rgb-preset-btn {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          font-weight: 600;
          padding: 4px 11px;
          border-radius: 4px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
          letter-spacing: 0.04em;
        }

        .rgb-preset-btn:hover { transform: scale(1.06); box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
      `;
      document.head.appendChild(style);
    }

    function decToBin(n) {
      return n.toString(2).padStart(8, '0');
    }

    function decToHex(n) {
      return n.toString(16).toUpperCase().padStart(2, '0');
    }

    function refresh() {
      const { R, G, B } = state;
      const color = `rgb(${R},${G},${B})`;
      const hexFull = `#${decToHex(R)}${decToHex(G)}${decToHex(B)}`;

      container.querySelector('#rgb-swatch').style.background = color;
      container.querySelector('#rgb-hex-badge').textContent = hexFull;

      ['R','G','B'].forEach(ch => {
        const v = state[ch];
        container.querySelector(`#${ch}-dec`).textContent = v;
        container.querySelector(`#${ch}-hex`).textContent = decToHex(v);
        container.querySelector(`#${ch}-bin`).textContent = decToBin(v);
        container.querySelector(`#slider-${ch}`).value = v;
      });
    }

    window.IDC_rgbUpdate = function(ch, val) {
      state[ch] = parseInt(val, 10);
      refresh();
    };

    window.IDC_rgbPreset = function(r, g, b) {
      state.R = r; state.G = g; state.B = b;
      refresh();
    };

    refresh();
  }

  window.IDC = window.IDC || { widgets: {} };
  window.IDC.widgets['rgb-mixer'] = { render };

})();
