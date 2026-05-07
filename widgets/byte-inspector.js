/* ============================================================
   WIDGET: byte-inspector
   8 clickable bits → live decimal, ASCII character, RGB color channel
   User selects which channel (R, G, or B) the byte controls.
   ============================================================ */

(function () {

  function render(container) {

    let bits = [0,1,0,0,0,0,0,1]; // 65 = 'A'
    let activeChannel = 'R';

    container.innerHTML = `
      <div class="widget-card" data-widget-name="Interactive">
        <div class="widget-title">Byte Inspector</div>
        <div class="widget-desc">Click any bit to flip it. One pattern of 8 bits — three different interpretations, depending on context.</div>

        <div class="byte-inspector-layout">
          <div class="bi-bits-section">
            <div class="bi-place-labels" id="bi-places"></div>
            <div class="bi-bit-buttons" id="bi-buttons"></div>
            <div class="bi-power-labels" id="bi-powers"></div>
          </div>

          <div class="bi-outputs">
            <div class="bi-output-card">
              <div class="bi-output-type">Integer</div>
              <div class="bi-output-value" id="bi-dec">65</div>
              <div class="bi-output-note">Unsigned 8-bit integer<br>Range: 0 – 255</div>
            </div>

            <div class="bi-output-card">
              <div class="bi-output-type">ASCII Character</div>
              <div class="bi-output-value" id="bi-char">A</div>
              <div class="bi-output-note" id="bi-char-note">Printable character</div>
            </div>

            <div class="bi-output-card">
              <div class="bi-output-type">Color Channel</div>
              <div class="bi-channel-select">
                <button class="bi-ch-btn active" data-ch="R" onclick="IDC_byteSetChannel('R')">R</button>
                <button class="bi-ch-btn" data-ch="G" onclick="IDC_byteSetChannel('G')">G</button>
                <button class="bi-ch-btn" data-ch="B" onclick="IDC_byteSetChannel('B')">B</button>
              </div>
              <div class="bi-output-value bi-color-preview">
                <div class="bi-color-swatch" id="bi-swatch"></div>
                <span id="bi-hex"></span>
              </div>
              <div class="bi-output-note" id="bi-color-note"></div>
            </div>
          </div>
        </div>

        <div class="bi-equation" id="bi-equation"></div>
      </div>
    `;

    if (!document.getElementById('byte-inspector-styles')) {
      const style = document.createElement('style');
      style.id = 'byte-inspector-styles';
      style.textContent = `
        .byte-inspector-layout { display:flex; flex-direction:column; gap:20px; }
        .bi-bits-section { display:flex; flex-direction:column; align-items:center; gap:4px; }
        .bi-place-labels, .bi-bit-buttons, .bi-power-labels { display:flex; gap:6px; align-items:center; }
        .bi-place-label { width:40px; text-align:center; font-family:var(--font-mono); font-size:0.68rem; color:var(--ink-light); }
        .bi-bit-btn { width:40px; height:40px; font-family:var(--font-mono); font-size:1.1rem; font-weight:700; border:2px solid var(--border-dark); border-radius:var(--radius); background:white; color:var(--ink-light); cursor:pointer; transition:all 0.15s; flex-shrink:0; }
        .bi-bit-btn.on { background:var(--ink); border-color:var(--ink); color:white; }
        .bi-bit-btn:hover { border-color:var(--accent); transform:scale(1.08); }
        .bi-power-label { width:40px; text-align:center; font-family:var(--font-mono); font-size:0.62rem; color:var(--border-dark); }
        .bi-outputs { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        .bi-output-card { background:var(--bg-alt); border:1px solid var(--border); border-radius:var(--radius); padding:14px 12px; text-align:center; }
        .bi-output-type { font-family:var(--font-mono); font-size:0.62rem; letter-spacing:0.1em; text-transform:uppercase; color:var(--ink-light); margin-bottom:8px; }
        .bi-output-value { font-family:var(--font-mono); font-size:1.6rem; font-weight:700; color:var(--ink); margin-bottom:8px; min-height:42px; display:flex; align-items:center; justify-content:center; }
        .bi-output-note { font-size:0.72rem; color:var(--ink-light); line-height:1.4; }
        .bi-channel-select { display:flex; gap:5px; justify-content:center; margin-bottom:8px; }
        .bi-ch-btn { font-family:var(--font-mono); font-size:0.75rem; font-weight:700; padding:3px 10px; border-radius:4px; border:2px solid var(--border-dark); background:white; cursor:pointer; color:var(--ink-mid); transition:all 0.15s; }
        .bi-ch-btn[data-ch="R"].active { background:#f7e0e0; border-color:#c0392b; color:#c0392b; }
        .bi-ch-btn[data-ch="G"].active { background:#e0f2ea; border-color:#1a6b4a; color:#1a6b4a; }
        .bi-ch-btn[data-ch="B"].active { background:var(--blue-light); border-color:var(--blue); color:var(--blue); }
        .bi-ch-btn:hover:not(.active) { border-color:var(--ink-mid); }
        .bi-color-preview { display:flex; flex-direction:column; align-items:center; gap:6px; font-size:1rem; }
        .bi-color-swatch { width:52px; height:52px; border-radius:6px; border:1px solid var(--border-dark); transition:background 0.2s; flex-shrink:0; }
        .bi-equation { font-family:var(--font-mono); font-size:0.78rem; color:var(--ink-mid); background:var(--bg-alt); border:1px solid var(--border); border-radius:var(--radius); padding:10px 14px; line-height:1.7; margin-top:4px; }
        @media (max-width:600px) { .bi-outputs { grid-template-columns:1fr; } .bi-bit-btn { width:34px; height:34px; font-size:0.95rem; } .bi-place-label,.bi-power-label { width:34px; } }
      `;
      document.head.appendChild(style);
    }

    function toSuperscript(n) { return ['⁰','¹','²','³','⁴','⁵','⁶','⁷'][n] || n; }

    function buildBits() {
      const places  = container.querySelector('#bi-places');
      const buttons = container.querySelector('#bi-buttons');
      const powers  = container.querySelector('#bi-powers');
      const pv      = [128,64,32,16,8,4,2,1];
      places.innerHTML = ''; buttons.innerHTML = ''; powers.innerHTML = '';
      pv.forEach((val, i) => {
        const pl = document.createElement('span');
        pl.className = 'bi-place-label'; pl.textContent = val;
        places.appendChild(pl);
        const btn = document.createElement('button');
        btn.className = 'bi-bit-btn' + (bits[i] ? ' on' : '');
        btn.textContent = bits[i];
        btn.addEventListener('click', () => {
          bits[i] = bits[i] ? 0 : 1;
          btn.textContent = bits[i];
          btn.classList.toggle('on', bits[i] === 1);
          update();
        });
        buttons.appendChild(btn);
        const pw = document.createElement('span');
        pw.className = 'bi-power-label'; pw.textContent = '2' + toSuperscript(7 - i);
        powers.appendChild(pw);
      });
    }

    function update() {
      const dec = bits.reduce((acc, b, i) => acc + b * Math.pow(2, 7 - i), 0);
      const hex = dec.toString(16).toUpperCase().padStart(2, '0');

      container.querySelector('#bi-dec').textContent = dec;

      const charEl = container.querySelector('#bi-char');
      const noteEl = container.querySelector('#bi-char-note');
      if (dec >= 32 && dec <= 126) {
        charEl.textContent = String.fromCharCode(dec); charEl.style.fontSize = '1.8rem';
        noteEl.textContent = 'Printable character (code ' + dec + ')';
      } else if (dec === 0) {
        charEl.textContent = 'NUL'; charEl.style.fontSize = '1rem';
        noteEl.textContent = 'Null — string terminator';
      } else if (dec < 32) {
        charEl.textContent = 'CTRL'; charEl.style.fontSize = '1rem';
        noteEl.textContent = 'Control character (code ' + dec + ')';
      } else {
        charEl.textContent = 'EXT'; charEl.style.fontSize = '1rem';
        noteEl.textContent = 'Extended/non-ASCII (code ' + dec + ')';
      }

      const r = activeChannel === 'R' ? dec : 0;
      const g = activeChannel === 'G' ? dec : 0;
      const b = activeChannel === 'B' ? dec : 0;
      container.querySelector('#bi-swatch').style.background = 'rgb(' + r + ',' + g + ',' + b + ')';
      container.querySelector('#bi-hex').textContent = hex;
      const chLabels = { R:'Red channel', G:'Green channel', B:'Blue channel' };
      const intensity = dec === 0 ? 'off (none)' : dec === 255 ? 'full intensity' : Math.round(dec/255*100) + '% intensity';
      container.querySelector('#bi-color-note').textContent = chLabels[activeChannel] + ': ' + intensity;

      const pv = [128,64,32,16,8,4,2,1];
      const parts = bits.map((b,i) => b ? pv[i] : null).filter(v => v !== null);
      const eqStr = parts.length > 0 ? parts.join(' + ') + ' = ' + dec : '0 (no bits set)';
      const fullHex = activeChannel==='R' ? '#'+hex+'0000' : activeChannel==='G' ? '#00'+hex+'00' : '#0000'+hex;
      container.querySelector('#bi-equation').innerHTML =
        '<strong>Bit math:</strong> ' + eqStr + '<br>' +
        '<strong>Binary:</strong> ' + bits.join('') + ' &nbsp;·&nbsp; ' +
        '<strong>Decimal:</strong> ' + dec + ' &nbsp;·&nbsp; ' +
        '<strong>Hex:</strong> ' + hex + ' &nbsp;·&nbsp; ' +
        '<strong>As full hex color:</strong> ' + fullHex;
    }

    window.IDC_byteSetChannel = function(ch) {
      activeChannel = ch;
      container.querySelectorAll('.bi-ch-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.ch === ch);
      });
      update();
    };

    buildBits();
    update();
  }

  window.IDC = window.IDC || { widgets: {} };
  window.IDC.widgets['byte-inspector'] = { render };

})();
