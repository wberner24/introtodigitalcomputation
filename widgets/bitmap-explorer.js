/* ============================================================
   WIDGET: bitmap-explorer
   Interactive 8x8 monochrome bitmap — click pixels to toggle,
   see the binary row values update live.
   ============================================================ */

(function () {

  function render(container) {

    const ROWS = 8;
    const COLS = 8;

    // Default pattern: a simple "A" shape
    const defaultGrid = [
      [0,0,0,1,1,0,0,0],
      [0,0,1,0,0,1,0,0],
      [0,1,0,0,0,0,1,0],
      [0,1,1,1,1,1,1,0],
      [0,1,0,0,0,0,1,0],
      [0,1,0,0,0,0,1,0],
      [0,1,0,0,0,0,1,0],
      [0,0,0,0,0,0,0,0],
    ];

    let grid = defaultGrid.map(r => [...r]);

    container.innerHTML = `
      <div class="widget-card" data-widget-name="Interactive">
        <div class="widget-title">Monochrome Bitmap Explorer</div>
        <div class="widget-desc">Click any pixel to toggle it on or off. Each row is one byte — watch the binary value update as you paint.</div>

        <div class="bitmap-layout">
          <div class="bitmap-left">
            <div class="bitmap-label-row">
              <span class="bitmap-corner"></span>
              ${Array.from({length: COLS}, (_, i) =>
                `<span class="bitmap-col-label">${COLS - 1 - i}</span>`
              ).join('')}
              <span class="bitmap-col-label" style="opacity:0;width:8px;"></span>
            </div>
            <div class="bitmap-grid" id="bm-grid"></div>
            <div class="bitmap-actions">
              <button class="btn btn-ghost" onclick="IDC_bitmapClear()">Clear</button>
              <button class="btn btn-ghost" onclick="IDC_bitmapFill()">Fill</button>
              <button class="btn btn-accent" onclick="IDC_bitmapReset()">Reset (A)</button>
            </div>
          </div>

          <div class="bitmap-right">
            <div class="bitmap-binary-label">Row bytes (binary → decimal)</div>
            <div id="bm-bytes"></div>
            <div class="bitmap-total" id="bm-total"></div>
          </div>
        </div>
      </div>
    `;

    // Inject styles
    if (!document.getElementById('bitmap-styles')) {
      const style = document.createElement('style');
      style.id = 'bitmap-styles';
      style.textContent = `
        .bitmap-layout {
          display: flex;
          gap: 28px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .bitmap-left { flex: 0 0 auto; }
        .bitmap-right { flex: 1; min-width: 200px; }

        .bitmap-label-row {
          display: flex;
          align-items: center;
          margin-bottom: 4px;
          padding-left: 22px;
        }
        .bitmap-corner { width: 22px; flex-shrink: 0; }
        .bitmap-col-label {
          width: 32px;
          text-align: center;
          font-family: var(--font-mono);
          font-size: 0.6rem;
          color: var(--ink-light);
        }

        .bitmap-grid {
          display: flex;
          flex-direction: column;
          gap: 3px;
          border: 2px solid var(--border-dark);
          border-radius: var(--radius);
          padding: 6px;
          background: var(--bg-alt);
        }

        .bitmap-row {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .bitmap-row-label {
          font-family: var(--font-mono);
          font-size: 0.62rem;
          color: var(--ink-light);
          width: 16px;
          text-align: right;
          margin-right: 6px;
          flex-shrink: 0;
        }

        .bitmap-pixel {
          width: 28px;
          height: 28px;
          border-radius: 3px;
          border: 1px solid var(--border);
          background: white;
          cursor: pointer;
          transition: background 0.1s, border-color 0.1s, transform 0.08s;
          flex-shrink: 0;
        }

        .bitmap-pixel.on {
          background: var(--ink);
          border-color: var(--ink);
        }

        .bitmap-pixel:hover {
          transform: scale(1.12);
          border-color: var(--accent);
        }

        .bitmap-actions {
          display: flex;
          gap: 8px;
          margin-top: 10px;
          justify-content: center;
        }

        .bitmap-binary-label {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink-light);
          margin-bottom: 8px;
        }

        .bm-byte-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 5px 0;
          border-bottom: 1px solid var(--border);
          font-family: var(--font-mono);
          font-size: 0.82rem;
        }
        .bm-byte-row:last-child { border-bottom: none; }

        .bm-row-num {
          color: var(--ink-light);
          font-size: 0.7rem;
          width: 14px;
          flex-shrink: 0;
        }

        .bm-bits {
          color: var(--accent-dark);
          letter-spacing: 0.08em;
          flex: 1;
        }

        .bm-bits .bit-on { color: var(--ink); font-weight: 700; }
        .bm-bits .bit-off { color: var(--border-dark); }

        .bm-eq { color: var(--ink-light); }

        .bm-dec {
          color: var(--blue);
          font-weight: 600;
          width: 28px;
          text-align: right;
        }

        .bitmap-total {
          margin-top: 12px;
          padding: 10px 12px;
          background: var(--bg-alt);
          border-radius: var(--radius);
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--ink-mid);
          border: 1px solid var(--border);
          line-height: 1.6;
        }
      `;
      document.head.appendChild(style);
    }

    function buildGrid() {
      const gridEl = container.querySelector('#bm-grid');
      gridEl.innerHTML = '';
      for (let r = 0; r < ROWS; r++) {
        const rowEl = document.createElement('div');
        rowEl.className = 'bitmap-row';
        const label = document.createElement('span');
        label.className = 'bitmap-row-label';
        label.textContent = r;
        rowEl.appendChild(label);
        for (let c = 0; c < COLS; c++) {
          const px = document.createElement('div');
          px.className = 'bitmap-pixel' + (grid[r][c] ? ' on' : '');
          px.dataset.r = r;
          px.dataset.c = c;
          px.addEventListener('click', () => {
            grid[r][c] = grid[r][c] ? 0 : 1;
            px.classList.toggle('on', grid[r][c] === 1);
            updateBytes();
          });
          rowEl.appendChild(px);
        }
        gridEl.appendChild(rowEl);
      }
    }

    function updateBytes() {
      const bytesEl = container.querySelector('#bm-bytes');
      const totalEl = container.querySelector('#bm-total');
      let onCount = 0;
      bytesEl.innerHTML = '';
      for (let r = 0; r < ROWS; r++) {
        const bits = grid[r];
        const dec = bits.reduce((acc, b, i) => acc + b * Math.pow(2, COLS - 1 - i), 0);
        onCount += bits.filter(b => b).length;
        const bitsHtml = bits.map(b =>
          `<span class="bit-${b ? 'on' : 'off'}">${b}</span>`
        ).join('');
        const rowEl = document.createElement('div');
        rowEl.className = 'bm-byte-row';
        rowEl.innerHTML = `
          <span class="bm-row-num">${r}</span>
          <span class="bm-bits">${bitsHtml}</span>
          <span class="bm-eq">=</span>
          <span class="bm-dec">${dec}</span>
        `;
        bytesEl.appendChild(rowEl);
      }
      const totalBits = ROWS * COLS;
      totalEl.innerHTML = `
        <strong>${onCount}</strong> pixel${onCount !== 1 ? 's' : ''} on &nbsp;·&nbsp;
        <strong>${totalBits} bits</strong> total &nbsp;·&nbsp;
        <strong>${totalBits / 8} bytes</strong> of image data
      `;
    }

    // Global controls
    window.IDC_bitmapClear = function() {
      grid = Array.from({length: ROWS}, () => Array(COLS).fill(0));
      buildGrid(); updateBytes();
    };
    window.IDC_bitmapFill = function() {
      grid = Array.from({length: ROWS}, () => Array(COLS).fill(1));
      buildGrid(); updateBytes();
    };
    window.IDC_bitmapReset = function() {
      grid = defaultGrid.map(r => [...r]);
      buildGrid(); updateBytes();
    };

    buildGrid();
    updateBytes();
  }

  window.IDC = window.IDC || { widgets: {} };
  window.IDC.widgets['bitmap-explorer'] = { render };

})();
