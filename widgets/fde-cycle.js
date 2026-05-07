/* ============================================================
   WIDGET: fde-cycle  (v3)
   Six-instruction program. Memory starts empty.
   All values written by the program itself.
   ============================================================ */

(function () {

  const PROG = [
    {
      addr: '0x00',
      asm:  'STORE 5,  [0x10]',
      pyLine: 0,
      fde: [
        {
          stage: 'FETCH', color: '#1D4E7A', bg: '#DDE8F2',
          desc: 'PC = <strong>0x00</strong>. The Control Unit reads the instruction at that address: <code>STORE 5, [0x10]</code>. PC advances to <strong>0x01</strong>.',
          regChange: { PC: '0x01' }, memChange: {},
        },
        {
          stage: 'DECODE', color: '#5b2d8e', bg: '#ede4f7',
          desc: 'Opcode = <strong>STORE</strong>. The CU identifies the constant value <strong>5</strong> and the destination address <strong>0x10</strong>. It prepares the memory write circuit.',
          regChange: {}, memChange: {},
        },
        {
          stage: 'EXECUTE', color: '#1a6b4a', bg: '#e0f2ea',
          desc: 'The value <strong>5</strong> is written to memory address <strong>0x10</strong>. Variable <code>a</code> now exists in memory.',
          regChange: {}, memChange: { '0x10': '5' },
        },
      ]
    },
    {
      addr: '0x01',
      asm:  'STORE 3,  [0x11]',
      pyLine: 1,
      fde: [
        {
          stage: 'FETCH', color: '#1D4E7A', bg: '#DDE8F2',
          desc: 'PC = <strong>0x01</strong>. The Control Unit fetches: <code>STORE 3, [0x11]</code>. PC advances to <strong>0x02</strong>.',
          regChange: { PC: '0x02' }, memChange: {},
        },
        {
          stage: 'DECODE', color: '#5b2d8e', bg: '#ede4f7',
          desc: 'Opcode = <strong>STORE</strong>. Constant value <strong>3</strong>, destination address <strong>0x11</strong>.',
          regChange: {}, memChange: {},
        },
        {
          stage: 'EXECUTE', color: '#1a6b4a', bg: '#e0f2ea',
          desc: 'The value <strong>3</strong> is written to memory address <strong>0x11</strong>. Variable <code>b</code> now exists in memory.',
          regChange: {}, memChange: { '0x11': '3' },
        },
      ]
    },
    {
      addr: '0x02',
      asm:  'LOAD  R1, [0x10]',
      pyLine: 2,
      fde: [
        {
          stage: 'FETCH', color: '#1D4E7A', bg: '#DDE8F2',
          desc: 'PC = <strong>0x02</strong>. Instruction fetched: <code>LOAD R1, [0x10]</code>. PC advances to <strong>0x03</strong>.',
          regChange: { PC: '0x03' }, memChange: {},
        },
        {
          stage: 'DECODE', color: '#5b2d8e', bg: '#ede4f7',
          desc: 'Opcode = <strong>LOAD</strong>. Destination register: <strong>R1</strong>. Source memory address: <strong>0x10</strong>.',
          regChange: {}, memChange: {},
        },
        {
          stage: 'EXECUTE', color: '#1a6b4a', bg: '#e0f2ea',
          desc: 'Memory address <strong>0x10</strong> is read. R1 is loaded with <strong>5</strong> — the value of <code>a</code> — ready for the ALU.',
          regChange: { R1: '5' }, memChange: {},
        },
      ]
    },
    {
      addr: '0x03',
      asm:  'LOAD  R2, [0x11]',
      pyLine: 2,
      fde: [
        {
          stage: 'FETCH', color: '#1D4E7A', bg: '#DDE8F2',
          desc: 'PC = <strong>0x03</strong>. Instruction fetched: <code>LOAD R2, [0x11]</code>. PC advances to <strong>0x04</strong>.',
          regChange: { PC: '0x04' }, memChange: {},
        },
        {
          stage: 'DECODE', color: '#5b2d8e', bg: '#ede4f7',
          desc: 'Opcode = <strong>LOAD</strong>. Destination register: <strong>R2</strong>. Source memory address: <strong>0x11</strong>.',
          regChange: {}, memChange: {},
        },
        {
          stage: 'EXECUTE', color: '#1a6b4a', bg: '#e0f2ea',
          desc: 'Memory address <strong>0x11</strong> is read. R2 is loaded with <strong>3</strong> — the value of <code>b</code>.',
          regChange: { R2: '3' }, memChange: {},
        },
      ]
    },
    {
      addr: '0x04',
      asm:  'ADD   R3, R1, R2',
      pyLine: 2,
      fde: [
        {
          stage: 'FETCH', color: '#1D4E7A', bg: '#DDE8F2',
          desc: 'PC = <strong>0x04</strong>. Instruction fetched: <code>ADD R3, R1, R2</code>. PC advances to <strong>0x05</strong>.',
          regChange: { PC: '0x05' }, memChange: {},
        },
        {
          stage: 'DECODE', color: '#5b2d8e', bg: '#ede4f7',
          desc: 'Opcode = <strong>ADD</strong>. The CU routes R1 and R2 as inputs to the ALU. Destination: register <strong>R3</strong>.',
          regChange: {}, memChange: {},
        },
        {
          stage: 'EXECUTE', color: '#1a6b4a', bg: '#e0f2ea',
          desc: 'The ALU computes <strong>R1 + R2 = 5 + 3 = 8</strong>. The result is written to <strong>R3</strong>.',
          regChange: { R3: '8' }, memChange: {},
        },
      ]
    },
    {
      addr: '0x05',
      asm:  'STORE R3, [0x12]',
      pyLine: 2,
      fde: [
        {
          stage: 'FETCH', color: '#1D4E7A', bg: '#DDE8F2',
          desc: 'PC = <strong>0x05</strong>. Instruction fetched: <code>STORE R3, [0x12]</code>. PC advances to <strong>0x06</strong>.',
          regChange: { PC: '0x06' }, memChange: {},
        },
        {
          stage: 'DECODE', color: '#5b2d8e', bg: '#ede4f7',
          desc: 'Opcode = <strong>STORE</strong>. Source: register <strong>R3</strong>. Destination address: <strong>0x12</strong>. The CU prepares the memory write circuit.',
          regChange: {}, memChange: {},
        },
        {
          stage: 'EXECUTE', color: '#1a6b4a', bg: '#e0f2ea',
          desc: 'R3\'s value (<strong>8</strong>) is written to memory address <strong>0x12</strong>. Variable <code>c</code> is now stored in memory. Program complete.',
          regChange: {}, memChange: { '0x12': '8' },
        },
      ]
    },
  ];

  const PYTHON_LINES = [
    { code: 'a = 5',     comment: '# address 0x10' },
    { code: 'b = 3',     comment: '# address 0x11' },
    { code: 'c = a + b', comment: '# address 0x12' },
  ];

  function freshState() {
    return {
      regs:  { R1: '—', R2: '—', R3: '—', PC: '0x00' },
      mem:   { '0x10': '—', '0x11': '—', '0x12': '—' },
      instrIdx: 0,
      stageIdx: 0,
      done: false,
    };
  }

  function render(container) {
    let state = freshState();

    container.innerHTML = `
      <div class="widget-card" data-widget-name="Interactive">
        <div class="widget-title">Fetch–Decode–Execute: A Real Program</div>
        <div class="widget-desc">A three-line Python program compiled to six assembly instructions. Memory starts completely empty — every value is written by the program itself. Step through each stage and watch registers and memory update from scratch.</div>

        <div class="fde2-source-row">
          <div class="fde2-panel">
            <div class="fde2-panel-label">Python Source</div>
            <div class="fde2-code-block" id="fde2-python">
              ${PYTHON_LINES.map((l, i) => `
                <div class="fde2-py-line" id="fde2-py-${i}">
                  <span class="fde2-code">${l.code}</span>
                  <span class="fde2-comment">${l.comment}</span>
                </div>`).join('')}
            </div>
          </div>
          <div class="fde2-panel">
            <div class="fde2-panel-label">Assembly Instructions</div>
            <div class="fde2-code-block" id="fde2-asm">
              ${PROG.map((p, i) => `
                <div class="fde2-asm-line" id="fde2-asm-${i}">
                  <span class="fde2-addr">${p.addr}</span>
                  <span class="fde2-code">${p.asm}</span>
                </div>`).join('')}
            </div>
          </div>
        </div>

        <div class="fde2-stage-row">
          <div class="fde2-stage-box" id="fde2-fetch-box"><div class="fde2-stage-name">FETCH</div></div>
          <div class="fde2-stage-arrow">→</div>
          <div class="fde2-stage-box" id="fde2-decode-box"><div class="fde2-stage-name">DECODE</div></div>
          <div class="fde2-stage-arrow">→</div>
          <div class="fde2-stage-box" id="fde2-execute-box"><div class="fde2-stage-name">EXECUTE</div></div>
        </div>

        <div class="fde2-desc" id="fde2-desc">Press <strong>Next Step</strong> to begin. All memory locations start empty.</div>

        <div class="fde2-state-row">
          <div class="fde2-state-panel">
            <div class="fde2-state-label">CPU Registers</div>
            <div class="fde2-reg-grid">
              <div class="fde2-reg" id="fde2-reg-PC"><span class="fde2-reg-name">PC</span><span class="fde2-reg-val" id="fde2-val-PC">0x00</span></div>
              <div class="fde2-reg" id="fde2-reg-R1"><span class="fde2-reg-name">R1</span><span class="fde2-reg-val" id="fde2-val-R1">—</span></div>
              <div class="fde2-reg" id="fde2-reg-R2"><span class="fde2-reg-name">R2</span><span class="fde2-reg-val" id="fde2-val-R2">—</span></div>
              <div class="fde2-reg" id="fde2-reg-R3"><span class="fde2-reg-name">R3</span><span class="fde2-reg-val" id="fde2-val-R3">—</span></div>
            </div>
          </div>
          <div class="fde2-state-panel">
            <div class="fde2-state-label">Memory</div>
            <div class="fde2-mem-grid">
              <div class="fde2-mem-cell" id="fde2-mem-0x10"><span class="fde2-mem-addr">0x10 (a)</span><span class="fde2-mem-val" id="fde2-mval-0x10">—</span></div>
              <div class="fde2-mem-cell" id="fde2-mem-0x11"><span class="fde2-mem-addr">0x11 (b)</span><span class="fde2-mem-val" id="fde2-mval-0x11">—</span></div>
              <div class="fde2-mem-cell" id="fde2-mem-0x12"><span class="fde2-mem-addr">0x12 (c)</span><span class="fde2-mem-val" id="fde2-mval-0x12">—</span></div>
            </div>
          </div>
        </div>

        <div class="fde2-controls">
          <button class="btn btn-accent" id="fde2-next" onclick="IDC_fde2Next()">Next Step →</button>
          <button class="btn btn-ghost" onclick="IDC_fde2Reset()">Reset</button>
          <div class="fde2-progress" id="fde2-progress">Instruction 1 of 6  ·  Stage: —</div>
        </div>
      </div>
    `;

    // Inject styles once
    if (!document.getElementById('fde2-styles')) {
      const s = document.createElement('style');
      s.id = 'fde2-styles';
      s.textContent = `
        .fde2-source-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px; }
        .fde2-panel { background:var(--bg-alt); border:1px solid var(--border); border-radius:var(--radius); overflow:hidden; }
        .fde2-panel-label { font-family:var(--font-mono); font-size:0.62rem; letter-spacing:0.12em; text-transform:uppercase; color:white; background:var(--ink); padding:5px 12px; }
        .fde2-code-block { padding:10px 12px; display:flex; flex-direction:column; gap:4px; }
        .fde2-py-line, .fde2-asm-line { display:flex; align-items:baseline; gap:10px; padding:5px 8px; border-radius:4px; border-left:3px solid transparent; transition:all 0.2s; font-family:var(--font-mono); font-size:0.82rem; }
        .fde2-py-line.active { background:var(--accent-light); border-left-color:var(--accent); }
        .fde2-asm-line.active { background:#DDE8F2; border-left-color:#1D4E7A; }
        .fde2-addr { color:var(--ink-light); font-size:0.72rem; min-width:36px; flex-shrink:0; }
        .fde2-code { color:var(--ink); font-weight:600; }
        .fde2-comment { color:var(--ink-light); font-size:0.75rem; font-style:italic; }
        .fde2-stage-row { display:flex; align-items:center; gap:8px; margin-bottom:12px; flex-wrap:wrap; }
        .fde2-stage-box { flex:1; min-width:80px; padding:10px 8px; border-radius:var(--radius); border:2px solid var(--border); background:var(--bg-alt); text-align:center; transition:all 0.2s; opacity:0.4; }
        .fde2-stage-box.active { opacity:1; transform:translateY(-2px); box-shadow:0 3px 10px rgba(0,0,0,0.1); }
        .fde2-stage-box.done { opacity:0.65; }
        .fde2-stage-name { font-family:var(--font-mono); font-size:0.72rem; font-weight:700; letter-spacing:0.08em; }
        .fde2-stage-arrow { color:var(--border-dark); font-size:1.2rem; flex-shrink:0; }
        .fde2-desc { background:var(--bg-alt); border:1px solid var(--border); border-radius:var(--radius); padding:12px 16px; font-size:0.9rem; color:var(--ink-mid); line-height:1.6; margin-bottom:14px; min-height:52px; }
        .fde2-desc code { font-family:var(--font-mono); font-size:0.85em; background:var(--bg); padding:1px 4px; border-radius:3px; border:1px solid var(--border); color:var(--accent-dark); }
        .fde2-state-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px; }
        .fde2-state-panel { border:1px solid var(--border); border-radius:var(--radius); overflow:hidden; }
        .fde2-state-label { font-family:var(--font-mono); font-size:0.62rem; letter-spacing:0.12em; text-transform:uppercase; color:white; background:var(--ink); padding:5px 12px; }
        .fde2-reg-grid, .fde2-mem-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; padding:10px; background:var(--bg-alt); }
        .fde2-reg, .fde2-mem-cell { display:flex; flex-direction:column; align-items:center; background:white; border:2px solid var(--border); border-radius:var(--radius); padding:8px 6px; transition:all 0.25s; }
        .fde2-reg.flash, .fde2-mem-cell.flash { border-color:var(--accent); background:var(--accent-light); }
        .fde2-reg-name, .fde2-mem-addr { font-family:var(--font-mono); font-size:0.65rem; color:var(--ink-light); margin-bottom:4px; text-align:center; }
        .fde2-reg-val, .fde2-mem-val { font-family:var(--font-mono); font-size:1.1rem; font-weight:700; color:var(--ink); transition:color 0.2s; }
        .fde2-reg-val.set, .fde2-mem-val.set { color:var(--accent-dark); }
        .fde2-controls { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
        .fde2-progress { font-family:var(--font-mono); font-size:0.7rem; color:var(--ink-light); margin-left:auto; }
        @media (max-width:560px) { .fde2-source-row, .fde2-state-row { grid-template-columns:1fr; } }
      `;
      document.head.appendChild(s);
    }

    function setStageUI(stageId, styleObj) {
      ['fetch','decode','execute'].forEach(id => {
        const el = container.querySelector(`#fde2-${id}-box`);
        el.classList.remove('active','done');
        el.style.borderColor = 'var(--border)';
        el.style.background  = 'var(--bg-alt)';
        el.querySelector('.fde2-stage-name').style.color = 'var(--ink-mid)';
      });
      if (!styleObj) return;
      const el = container.querySelector(`#fde2-${stageId}-box`);
      el.classList.add('active');
      el.style.borderColor = styleObj.color;
      el.style.background  = styleObj.bg;
      el.querySelector('.fde2-stage-name').style.color = styleObj.color;
      const order = ['fetch','decode','execute'];
      for (let i = 0; i < order.indexOf(stageId); i++) {
        container.querySelector(`#fde2-${order[i]}-box`).classList.add('done');
      }
    }

    function highlightLines(instrIdx) {
      PYTHON_LINES.forEach((_, i) => container.querySelector(`#fde2-py-${i}`).classList.remove('active'));
      PROG.forEach((_, i) => container.querySelector(`#fde2-asm-${i}`).classList.remove('active'));
      container.querySelector(`#fde2-py-${PROG[instrIdx].pyLine}`).classList.add('active');
      container.querySelector(`#fde2-asm-${instrIdx}`).classList.add('active');
    }

    function flashAndUpdate(regChanges, memChanges) {
      Object.entries(regChanges).forEach(([reg, val]) => {
        state.regs[reg] = val;
        const valEl = container.querySelector(`#fde2-val-${reg}`);
        const box   = container.querySelector(`#fde2-reg-${reg}`);
        valEl.textContent = val;
        valEl.classList.add('set');
        box.classList.add('flash');
        setTimeout(() => box.classList.remove('flash'), 600);
      });
      Object.entries(memChanges).forEach(([addr, val]) => {
        state.mem[addr] = val;
        const valEl = container.querySelector(`#fde2-mval-${addr}`);
        const box   = container.querySelector(`#fde2-mem-${addr}`);
        valEl.textContent = val;
        valEl.classList.add('set');
        box.classList.add('flash');
        setTimeout(() => box.classList.remove('flash'), 600);
      });
    }

    window.IDC_fde2Next = function () {
      if (state.done) return;
      const instr = PROG[state.instrIdx];
      const step  = instr.fde[state.stageIdx];
      const stageNames = ['fetch','decode','execute'];

      highlightLines(state.instrIdx);
      setStageUI(stageNames[state.stageIdx], step);
      container.querySelector('#fde2-desc').innerHTML = step.desc;
      flashAndUpdate(step.regChange, step.memChange);
      container.querySelector('#fde2-progress').textContent =
        `Instruction ${state.instrIdx + 1} of ${PROG.length}  ·  Stage: ${step.stage}`;

      state.stageIdx++;
      if (state.stageIdx >= instr.fde.length) {
        state.stageIdx = 0;
        state.instrIdx++;
        if (state.instrIdx >= PROG.length) {
          state.done = true;
          const btn = container.querySelector('#fde2-next');
          btn.disabled = true;
          btn.textContent = '✓ Program Complete';
          container.querySelector('#fde2-progress').textContent = 'All 6 instructions executed.';
        }
      }
    };

    window.IDC_fde2Reset = function () {
      state = freshState();
      PYTHON_LINES.forEach((_, i) => container.querySelector(`#fde2-py-${i}`).classList.remove('active'));
      PROG.forEach((_, i) => container.querySelector(`#fde2-asm-${i}`).classList.remove('active'));
      setStageUI(null, null);
      container.querySelector('#fde2-desc').innerHTML = 'Press <strong>Next Step</strong> to begin. All memory locations start empty.';
      ['R1','R2','R3'].forEach(r => {
        const v = container.querySelector(`#fde2-val-${r}`);
        if (v) { v.textContent = '—'; v.classList.remove('set'); }
        const b = container.querySelector(`#fde2-reg-${r}`);
        if (b) b.classList.remove('flash');
      });
      const pc = container.querySelector('#fde2-val-PC');
      if (pc) { pc.textContent = '0x00'; pc.classList.remove('set'); }
      ['0x10','0x11','0x12'].forEach(addr => {
        const v = container.querySelector(`#fde2-mval-${addr}`);
        const b = container.querySelector(`#fde2-mem-${addr}`);
        if (v) { v.textContent = '—'; v.classList.remove('set'); }
        if (b) b.classList.remove('flash');
      });
      const btn = container.querySelector('#fde2-next');
      btn.disabled = false;
      btn.textContent = 'Next Step →';
      container.querySelector('#fde2-progress').textContent = 'Instruction 1 of 6  ·  Stage: —';
    };
  }

  window.IDC = window.IDC || { widgets: {} };
  window.IDC.widgets['fde-cycle'] = { render };

})();
