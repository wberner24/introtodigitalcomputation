/* ============================================================
   WIDGET: binary-converter
   Bidirectional decimal ↔ binary converter with step-by-step
   ============================================================ */

(function () {

  function render(container) {
    container.innerHTML = `
      <div class="widget-card" data-widget-name="Interactive">
        <div class="widget-title">Binary ↔ Decimal Converter</div>
        <div class="widget-desc">Type a number in either field. See the conversion with step-by-step working.</div>

        <div class="converter-grid">
          <div class="converter-side binary">
            <label>Binary (base-2)</label>
            <input type="text" id="bin-input" placeholder="e.g. 1010" maxlength="16" autocomplete="off" spellcheck="false">
          </div>
          <div class="converter-arrow">⇄</div>
          <div class="converter-side decimal">
            <label>Decimal (base-10)</label>
            <input type="text" id="dec-input" placeholder="e.g. 42" maxlength="5" autocomplete="off" spellcheck="false">
          </div>
        </div>

        <div id="converter-error" class="converter-error" style="display:none;"></div>

        <div class="converter-steps" id="converter-steps">
          <span style="color:var(--ink-light);font-size:0.82rem;">Enter a number above to see step-by-step working.</span>
        </div>
      </div>
    `;

    const binInput = container.querySelector('#bin-input');
    const decInput = container.querySelector('#dec-input');
    const stepsEl  = container.querySelector('#converter-steps');
    const errorEl  = container.querySelector('#converter-error');

    binInput.addEventListener('input', () => {
      errorEl.style.display = 'none';
      const val = binInput.value.trim();
      if (!val) { decInput.value = ''; stepsEl.innerHTML = placeholder(); return; }
      if (!/^[01]+$/.test(val)) {
        showError('Binary numbers only contain 0s and 1s.');
        decInput.value = '';
        stepsEl.innerHTML = placeholder();
        return;
      }
      const result = binToDecSteps(val);
      decInput.value = result.decimal;
      stepsEl.innerHTML = result.html;
    });

    decInput.addEventListener('input', () => {
      errorEl.style.display = 'none';
      const val = decInput.value.trim();
      if (!val) { binInput.value = ''; stepsEl.innerHTML = placeholder(); return; }
      if (!/^\d+$/.test(val)) {
        showError('Decimal numbers only contain digits 0–9.');
        binInput.value = '';
        stepsEl.innerHTML = placeholder();
        return;
      }
      const n = parseInt(val, 10);
      if (n > 65535) {
        showError('Enter a value up to 65535 (16-bit max).');
        return;
      }
      const result = decToBinSteps(n);
      binInput.value = result.binary;
      stepsEl.innerHTML = result.html;
    });

    function showError(msg) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }

    function placeholder() {
      return `<span style="color:var(--ink-light);font-size:0.82rem;">Enter a number above to see step-by-step working.</span>`;
    }
  }

  // ── Binary → Decimal ──────────────────────────────────────
  function binToDecSteps(binStr) {
    // Pad to at least 4 bits for readability
    const bits = binStr.replace(/^0+/, '') || '0';
    const decimal = parseInt(bits, 2);
    const n = bits.length;

    let lines = [];
    let total = 0;
    const parts = [];

    for (let i = 0; i < n; i++) {
      const bit = parseInt(bits[i]);
      const place = Math.pow(2, n - 1 - i);
      const value = bit * place;
      total += value;
      if (bit === 1) parts.push(place);
      lines.push(
        `<span class="step-line">  ${bit} × ${place.toString().padStart(4)} = ${value.toString().padStart(4)}</span>`
      );
    }

    const sumLine = parts.length > 0
      ? `<span class="step-line highlight">  ${parts.join(' + ')} = ${decimal}</span>`
      : `<span class="step-line highlight">  0 = 0</span>`;

    const placeRow = bits.split('').map((b, i) => {
      const place = Math.pow(2, n - 1 - i);
      return `<span style="color:${b==='1'?'var(--accent-dark)':'var(--ink-light)';}">${b}</span>`;
    }).join(' ');

    return {
      decimal,
      html: `<span class="step-line" style="color:var(--ink-light);margin-bottom:4px;display:block;">Binary → Decimal:</span>` +
            lines.join('') +
            `<span class="step-line" style="display:block;margin-top:4px;border-top:1px solid var(--border);padding-top:4px;"></span>` +
            sumLine
    };
  }

  // ── Decimal → Binary ──────────────────────────────────────
  function decToBinSteps(n) {
    if (n === 0) return { binary: '0', html: `<span class="step-line highlight">0 in binary is simply 0.</span>` };

    // Find place values needed
    let places = [];
    let p = 1;
    while (p <= n) { places.push(p); p *= 2; }
    places.reverse();

    let remainder = n;
    let bits = [];
    let lines = [];

    for (const place of places) {
      if (place <= remainder) {
        bits.push(1);
        lines.push(`<span class="step-line highlight">  ${remainder} ≥ ${place} → place a 1  (${remainder} − ${place} = ${remainder - place})</span>`);
        remainder -= place;
      } else {
        bits.push(0);
        lines.push(`<span class="step-line">  ${remainder} < ${place} → place a 0</span>`);
      }
    }

    const binary = bits.join('');

    return {
      binary,
      html: `<span class="step-line" style="color:var(--ink-light);margin-bottom:4px;display:block;">Decimal → Binary (place values: ${places.join(', ')}):</span>` +
            lines.join('') +
            `<span class="step-line highlight" style="display:block;margin-top:4px;border-top:1px solid var(--border);padding-top:4px;">  Result: ${binary}</span>`
    };
  }

  // Register widget immediately so main.js can find it on DOMContentLoaded
  window.IDC = window.IDC || { widgets: {} };
  window.IDC.widgets['binary-converter'] = { render };

})();
