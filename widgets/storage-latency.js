window.IDC = window.IDC || { widgets: {} };

window.IDC.widgets['storage-latency'] = {
  render(container) {

    const tiers = [
      {
        name: 'Registers', zone: 'On-chip',
        raw: '~0.3 ns', human: '1 second',
        bar: 2, color: '#1D4E7A',
        capacity: '< 1 KB', costGB: '—', volatile: true,
        detail: 'Registers live directly on the CPU core — the absolute fastest memory in the system. There are only a few dozen of them, and they hold exactly the values the processor is working with right now.'
      },
      {
        name: 'L1 Cache', zone: 'On-chip',
        raw: '~1 ns', human: '3 seconds',
        bar: 5, color: '#1D4E7A',
        capacity: '32–128 KB', costGB: '—', volatile: true,
        detail: 'L1 cache is dedicated to each CPU core and is the first place the processor looks after its registers. Tiny but blazing fast — a hit here means almost no waiting.'
      },
      {
        name: 'L2 Cache', zone: 'On-chip',
        raw: '~5 ns', human: '17 seconds',
        bar: 11, color: '#2564A0',
        capacity: '256 KB–2 MB', costGB: '—', volatile: true,
        detail: 'L2 is larger than L1 but a little slower. Often one per core. A miss here sends the CPU hunting in L3.'
      },
      {
        name: 'L3 Cache', zone: 'On-chip',
        raw: '~20 ns', human: '1 minute',
        bar: 17, color: '#2564A0',
        capacity: '4–64 MB', costGB: '—', volatile: true,
        detail: 'L3 is shared across all cores on the chip. A cache miss here means going all the way to RAM — a significant penalty. Modern CPUs invest heavily in large L3 caches to avoid this.'
      },
      {
        name: 'RAM (DRAM)', zone: 'Main Memory',
        raw: '~100 ns', human: '5 minutes',
        bar: 23, color: '#2E6B4F',
        capacity: '4 GB–2 TB', costGB: '~$5–10/GB', volatile: true,
        detail: 'Main memory holds the OS, running applications, and active data. Fast enough for active work, but volatile — cut the power and it all disappears. Adding RAM is often the single highest-ROI hardware upgrade for a sluggish machine.'
      },
      {
        name: 'NVMe SSD', zone: 'Storage',
        raw: '~100 μs', human: '4 days',
        bar: 51, color: '#C1440E',
        capacity: '256 GB–8 TB', costGB: '~$0.10/GB', volatile: false,
        detail: 'The fastest non-volatile storage available in consumer hardware. Connects directly to the CPU via PCIe, bypassing the slower SATA bus. The gap between RAM and NVMe SSD is roughly 1,000× — the largest single jump in the hierarchy.'
      },
      {
        name: 'HDD', zone: 'Storage',
        raw: '~10 ms', human: '1 year',
        bar: 69, color: '#8C3009',
        capacity: '500 GB–20 TB', costGB: '~$0.02/GB', volatile: false,
        detail: 'Hard drives are slow because they are mechanical — a physical head must move to the right position on a spinning platter. But cost per gigabyte is far below SSDs, making HDDs the rational choice for bulk storage, archival, and backups.'
      },
      {
        name: 'Magnetic Tape', zone: 'Archive',
        raw: 'seconds', human: '3,000 years',
        bar: 100, color: '#8A857C',
        capacity: 'TB–PB', costGB: '~$0.001/GB', volatile: false,
        detail: 'Tape has the lowest cost per gigabyte of any storage medium and is still used at massive scale for long-term archival and disaster recovery. Access requires physically loading the tape cartridge and seeking to the right position — hence the extreme latency. Not for active use, but hard to beat for cold storage at scale.'
      },
    ];

    // Inject CSS once
    if (!document.getElementById('slw-styles')) {
      const style = document.createElement('style');
      style.id = 'slw-styles';
      style.textContent = `
        .slw-widget {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          margin: 28px 0;
          box-shadow: 0 2px 10px rgba(26,24,20,0.07);
        }
        .slw-header {
          padding: 16px 20px 14px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-alt);
        }
        .slw-title {
          font-family: var(--font-head);
          font-size: 1rem;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 3px;
        }
        .slw-subtitle {
          font-size: 0.82rem;
          color: var(--ink-light);
          font-family: var(--font-body);
        }
        .slw-subtitle strong { color: var(--ink-mid); }
        .slw-row {
          display: grid;
          grid-template-columns: 4px 1fr auto auto;
          align-items: center;
          gap: 0 14px;
          padding: 0 16px 0 0;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: background 0.12s;
          min-height: 52px;
        }
        .slw-row:last-child { border-bottom: none; }
        .slw-row:hover { background: var(--bg-alt); }
        .slw-row.active { background: var(--bg-alt); }
        .slw-indicator {
          width: 4px;
          align-self: stretch;
          border-radius: 0;
        }
        .slw-info {
          padding: 10px 0;
          min-width: 0;
        }
        .slw-name {
          font-family: var(--font-body);
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 5px;
        }
        .slw-zone {
          font-size: 0.72rem;
          font-weight: 400;
          color: var(--ink-light);
          margin-left: 6px;
          font-family: var(--font-body);
        }
        .slw-bar-wrap {
          height: 6px;
          background: var(--border);
          border-radius: 3px;
          overflow: hidden;
          max-width: 280px;
        }
        .slw-bar {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }
        .slw-human {
          font-family: var(--font-head);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--ink);
          white-space: nowrap;
          min-width: 90px;
          text-align: right;
        }
        .slw-raw {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--ink-light);
          white-space: nowrap;
          min-width: 72px;
          text-align: right;
        }
        .slw-detail {
          display: none;
          padding: 12px 20px 14px 20px;
          background: var(--bg-alt);
          border-bottom: 1px solid var(--border);
          font-size: 0.84rem;
          color: var(--ink-mid);
          font-family: var(--font-body);
          line-height: 1.6;
        }
        .slw-detail.open { display: block; }
        .slw-detail p { margin: 0 0 8px; }
        .slw-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 20px;
          margin-top: 6px;
          font-size: 0.78rem;
          color: var(--ink-light);
        }
        .slw-stats strong { color: var(--ink-mid); }
        .slw-footer {
          padding: 8px 16px;
          font-size: 0.74rem;
          color: var(--border-dark);
          font-family: var(--font-body);
          font-style: italic;
          background: var(--bg-alt);
          border-top: 1px solid var(--border);
        }
      `;
      document.head.appendChild(style);
    }

    container.innerHTML = `
      <div class="slw-widget">
        <div class="slw-header">
          <div class="slw-title">The Latency Scale</div>
          <div class="slw-subtitle">If a CPU register access took <strong>1 second</strong>, everything else would take&hellip; &nbsp;Click any row to explore.</div>
        </div>
        ${tiers.map((t, i) => `
          <div class="slw-row" data-idx="${i}">
            <div class="slw-indicator" style="background:${t.color}"></div>
            <div class="slw-info">
              <div class="slw-name">${t.name} <span class="slw-zone">${t.zone}</span></div>
              <div class="slw-bar-wrap">
                <div class="slw-bar" style="width:${t.bar}%;background:${t.color}99"></div>
              </div>
            </div>
            <div class="slw-human">${t.human}</div>
            <div class="slw-raw">${t.raw}</div>
          </div>
          <div class="slw-detail" id="slw-d-${i}">
            <p>${t.detail}</p>
            <div class="slw-stats">
              <span><strong>Capacity:</strong> ${t.capacity}</span>
              <span><strong>Cost/GB:</strong> ${t.costGB}</span>
              <span><strong>Volatile:</strong> ${t.volatile ? 'Yes — data lost on power off' : 'No — data persists'}</span>
            </div>
          </div>
        `).join('')}
        <div class="slw-footer">Latency values are approximate order-of-magnitude figures. Human-scale: register access ≈ 0.3 ns = 1 second.</div>
      </div>
    `;

    container.querySelectorAll('.slw-row').forEach(row => {
      row.addEventListener('click', () => {
        const idx    = row.dataset.idx;
        const detail = container.querySelector(`#slw-d-${idx}`);
        const isOpen = detail.classList.contains('open');
        container.querySelectorAll('.slw-detail').forEach(d => d.classList.remove('open'));
        container.querySelectorAll('.slw-row').forEach(r => r.classList.remove('active'));
        if (!isOpen) {
          detail.classList.add('open');
          row.classList.add('active');
        }
      });
    });
  }
};
