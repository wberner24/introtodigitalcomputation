/* ============================================================
   WIDGET: fde-cycle
   Fetch-Decode-Execute cycle animator.
   Student clicks Next to step through pipeline stages.
   ============================================================ */

(function () {

  const instructions = [
    { label: 'ADD R1, R2',  desc: 'Add the values in registers R1 and R2',        result: 'Stores sum back in R1' },
    { label: 'LOAD R3, 42', desc: 'Load the value at memory address 42 into R3',  result: 'R3 now holds that value' },
    { label: 'CMP R1, R3',  desc: 'Compare R1 and R3, set condition flags',        result: 'Flags updated for branch' },
    { label: 'JMP 0x04',    desc: 'Jump to instruction at memory address 0x04',    result: 'Program counter updated' },
    { label: 'STORE R1, 50',desc: 'Write the value in R1 to memory address 50',   result: 'Memory address 50 updated' },
  ];

  const stages = [
    {
      id: 'fetch',
      label: 'FETCH',
      color: '#1D4E7A',
      bg: '#DDE8F2',
      desc: (instr, cycle) =>
        `The control unit reads the next instruction (<strong>${instr.label}</strong>) from memory at the address stored in the program counter. Clock cycle: <strong>${cycle}</strong>.`
    },
    {
      id: 'decode',
      label: 'DECODE',
      color: '#5b2d8e',
      bg: '#ede4f7',
      desc: (instr) =>
        `The control unit interprets the instruction. It figures out: <em>${instr.desc}</em>. The right parts of the CPU are prepared.`
    },
    {
      id: 'execute',
      label: 'EXECUTE',
      color: '#1a6b4a',
      bg: '#e0f2ea',
      desc: (instr) =>
        `The ALU or other hardware carries out the operation. Result: <em>${instr.result}</em>. The program counter advances to the next instruction.`
    },
  ];

  function render(container) {

    let instrIdx = 0;
    let stageIdx = 0;
    let cycleCount = 1;
    let running = false;

    container.innerHTML = `
      <div class="widget-card" data-widget-name="Interactive">
        <div class="widget-title">Fetch–Decode–Execute Cycle</div>
        <div class="widget-desc">Step through the CPU's core loop one stage at a time. Every instruction your computer runs follows this exact sequence.</div>

        <div class="fde-layout">

          <!-- Pipeline stage boxes -->
          <div class="fde-stages">
            <div class="fde-stage" id="fde-fetch">
              <div class="fde-stage-label">FETCH</div>
              <div class="fde-stage-icon">📥</div>
            </div>
            <div class="fde-arrow">→</div>
            <div class="fde-stage" id="fde-decode">
              <div class="fde-stage-label">DECODE</div>
              <div class="fde-stage-icon">🔍</div>
            </div>
            <div class="fde-arrow">→</div>
            <div class="fde-stage" id="fde-execute">
              <div class="fde-stage-label">EXECUTE</div>
              <div class="fde-stage-icon">⚡</div>
            </div>
          </div>

          <!-- Current instruction + description -->
          <div class="fde-info">
            <div class="fde-info-top">
              <div class="fde-cycle-badge">Cycle <span id="fde-cycle-num">1</span></div>
              <div class="fde-instr-badge" id="fde-instr-badge">ADD R1, R2</div>
            </div>
            <div class="fde-desc" id="fde-desc"></div>
          </div>

        </div>

        <!-- Controls -->
        <div class="fde-controls">
          <button class="btn btn-accent" id="fde-next-btn" onclick="IDC_fdeNext()">Next Stage →</button>
          <button class="btn btn-ghost" onclick="IDC_fdeReset()">Reset</button>
          <div class="fde-progress">
            Instruction <span id="fde-instr-num">1</span> of ${instructions.length} &nbsp;·&nbsp;
            Stage: <span id="fde-stage-name">—</span>
          </div>
        </div>

      </div>
    `;

    // Styles
    if (!document.getElementById('fde-styles')) {
      const style = document.createElement('style');
      style.id = 'fde-styles';
      style.textContent = `
        .fde-layout {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 16px;
        }

        .fde-stages {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .fde-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 14px 20px;
          border-radius: var(--radius);
          border: 2px solid var(--border);
          background: var(--bg-alt);
          min-width: 100px;
          transition: all 0.25s ease;
          opacity: 0.45;
        }

        .fde-stage.active {
          opacity: 1;
          transform: translateY(-3px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }

        .fde-stage.done {
          opacity: 0.7;
        }

        .fde-stage-label {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
        }

        .fde-stage-icon {
          font-size: 1.4rem;
        }

        .fde-arrow {
          font-size: 1.4rem;
          color: var(--border-dark);
          font-weight: 300;
          flex-shrink: 0;
        }

        .fde-info {
          background: var(--bg-alt);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 16px 20px;
          min-height: 90px;
        }

        .fde-info-top {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }

        .fde-cycle-badge {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          background: var(--ink);
          color: white;
          padding: 3px 10px;
          border-radius: 4px;
        }

        .fde-instr-badge {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--accent-dark);
          background: var(--accent-light);
          border: 1px solid rgba(193,68,14,0.2);
          padding: 3px 12px;
          border-radius: 4px;
        }

        .fde-desc {
          font-size: 0.92rem;
          color: var(--ink-mid);
          line-height: 1.6;
        }

        .fde-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .fde-progress {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--ink-light);
          margin-left: auto;
        }

        @media (max-width: 500px) {
          .fde-stage { min-width: 80px; padding: 10px 12px; }
          .fde-progress { margin-left: 0; width: 100%; }
        }
      `;
      document.head.appendChild(style);
    }

    const stageColors = {
      fetch:   { border: '#1D4E7A', bg: '#DDE8F2', label: '#1D4E7A' },
      decode:  { border: '#5b2d8e', bg: '#ede4f7', label: '#5b2d8e' },
      execute: { border: '#1a6b4a', bg: '#e0f2ea', label: '#1a6b4a' },
    };

    function render_state() {
      const instr = instructions[instrIdx];
      const stage = stages[stageIdx];

      // Update stage boxes
      ['fetch','decode','execute'].forEach((s, i) => {
        const el = container.querySelector(`#fde-${s}`);
        el.classList.remove('active','done');
        const c = stageColors[s];
        if (i === stageIdx) {
          el.classList.add('active');
          el.style.borderColor = c.border;
          el.style.background  = c.bg;
          el.querySelector('.fde-stage-label').style.color = c.label;
        } else if (i < stageIdx) {
          el.classList.add('done');
          el.style.borderColor = 'var(--border)';
          el.style.background  = 'var(--bg-alt)';
          el.querySelector('.fde-stage-label').style.color = 'var(--ink-mid)';
        } else {
          el.style.borderColor = 'var(--border)';
          el.style.background  = 'var(--bg-alt)';
          el.querySelector('.fde-stage-label').style.color = 'var(--ink-mid)';
        }
      });

      // Update info panel
      container.querySelector('#fde-cycle-num').textContent = cycleCount;
      container.querySelector('#fde-instr-badge').textContent = instr.label;
      container.querySelector('#fde-desc').innerHTML = stage.desc(instr, cycleCount);
      container.querySelector('#fde-instr-num').textContent = instrIdx + 1;
      container.querySelector('#fde-stage-name').textContent = stage.label;
    }

    window.IDC_fdeNext = function() {
      stageIdx++;
      if (stageIdx >= stages.length) {
        stageIdx = 0;
        cycleCount += 3; // each full FDE = 3 clock cycles (simplified)
        instrIdx = (instrIdx + 1) % instructions.length;
      }
      render_state();
    };

    window.IDC_fdeReset = function() {
      instrIdx = 0; stageIdx = 0; cycleCount = 1;
      render_state();
    };

    render_state();
  }

  window.IDC = window.IDC || { widgets: {} };
  window.IDC.widgets['fde-cycle'] = { render };

})();
