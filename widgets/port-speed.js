window.IDC = window.IDC || { widgets: {} };

window.IDC.widgets['port-speed'] = {
  render(container) {

    const ports = [
      {
        name: 'USB 2.0', group: 'USB',
        speed: '480 Mbps', connector: 'USB-A / USB-B / Micro / Mini',
        bar: 2, color: '#8A857C',
        detail: 'Still found on virtually every device for legacy compatibility. Fast enough for keyboards, mice, and similar input devices, but too slow for storage or video. Black plastic inside the connector usually indicates USB 2.0.'
      },
      {
        name: 'USB 3.2 Gen 1', group: 'USB',
        speed: '5 Gbps', connector: 'USB-A / USB-C',
        bar: 44, color: '#2564A0',
        note: 'Also called USB 3.0 or USB 3.1 Gen 1 on older hardware — the same interface was renamed twice.',
        detail: 'Look for a blue connector or the "SS" (SuperSpeed) logo. 5 Gbps = ~625 MB/s theoretical. Adequate for most external HDDs and mid-speed flash drives.'
      },
      {
        name: 'USB 3.2 Gen 2', group: 'USB',
        speed: '10 Gbps', connector: 'USB-A / USB-C',
        bar: 56, color: '#1D4E7A',
        note: 'Also called USB 3.1 Gen 2.',
        detail: 'Look for "SS+" or a "10Gbps" marking. Common on modern desktops and mid-range laptops as the faster of the USB-A ports. Handles fast external SSDs well.'
      },
      {
        name: 'USB4 Gen 3×2', group: 'USB',
        speed: '40 Gbps', connector: 'USB-C only',
        bar: 80, color: '#163E6B',
        detail: 'Current USB peak for data. USB-C only. Based on Thunderbolt technology. Supports DisplayPort and PCIe tunneling over a single cable. Backward compatible with USB 3.x and Thunderbolt 3/4 accessories.'
      },
      {
        name: 'Thunderbolt 4', group: 'Thunderbolt',
        speed: '40 Gbps', connector: 'USB-C (⚡ logo)',
        bar: 80, color: '#8C3009',
        detail: 'Same peak speed as USB4 Gen 3×2 but certified to stricter requirements: mandatory DisplayPort video output, mandatory 100W charging, and daisy-chaining up to 6 devices. Any TB4 port also works as a USB4/USB-C port. Identified by a lightning bolt icon.'
      },
      {
        name: 'Thunderbolt 5', group: 'Thunderbolt',
        speed: '120 Gbps', connector: 'USB-C (⚡ logo)',
        bar: 100, color: '#C1440E',
        detail: 'Current Thunderbolt peak — 120 Gbps upstream, 40 Gbps downstream (or 80/80 symmetric). Required for 8K 60Hz monitors and the fastest external NVMe enclosures. Found in flagship laptops and workstations as of 2025.'
      },
      {
        name: '1 Gigabit Ethernet', group: 'Ethernet',
        speed: '1 Gbps', connector: 'RJ-45',
        bar: 15, color: '#2E6B4F',
        detail: 'The universal standard for wired networking. 1 Gbps = 125 MB/s actual throughput. Sufficient for virtually all consumer internet connections and most office LAN traffic. Covered in depth in Chapter 10.'
      },
      {
        name: '2.5 Gigabit Ethernet', group: 'Ethernet',
        speed: '2.5 Gbps', connector: 'RJ-45',
        bar: 31, color: '#2E6B4F',
        detail: 'Increasingly common on consumer motherboards and mini-PCs. Runs on existing Cat 5e/6 cabling at full 100m range — no rewiring required. Worth choosing over 1GbE when building a new system today.'
      },
      {
        name: 'HDMI 2.1', group: 'Display',
        speed: '48 Gbps', connector: 'HDMI',
        bar: 83, color: '#5A5248',
        detail: 'Dominant display connector for TVs and most monitors. Supports 4K at up to 144Hz and 8K at 60Hz with Dynamic HDR. Older HDMI 2.0 ports (still common on mid-range hardware) cap at 4K/60Hz.'
      },
      {
        name: 'DisplayPort 2.1', group: 'Display',
        speed: '80 Gbps', connector: 'DP / USB-C (Alt Mode)',
        bar: 93, color: '#4A4640',
        detail: 'Preferred by PC monitors and high-refresh gaming displays. Higher bandwidth than HDMI 2.1. Supports daisy-chaining multiple monitors from one port. Can be carried over USB-C via DisplayPort Alt Mode.'
      },
    ];

    if (!document.getElementById('psw-styles')) {
      const style = document.createElement('style');
      style.id = 'psw-styles';
      style.textContent = `
        .psw-widget {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          margin: 28px 0;
          box-shadow: 0 2px 10px rgba(26,24,20,0.07);
        }
        .psw-header {
          padding: 16px 20px 14px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-alt);
        }
        .psw-title {
          font-family: var(--font-head);
          font-size: 1rem;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 3px;
        }
        .psw-subtitle {
          font-size: 0.82rem;
          color: var(--ink-light);
          font-family: var(--font-body);
        }
        .psw-col-headers {
          display: grid;
          grid-template-columns: 4px 1fr auto auto;
          gap: 0 14px;
          padding: 6px 16px 6px 0;
          border-bottom: 1px solid var(--border);
          background: var(--bg-alt);
        }
        .psw-col-headers span {
          font-family: var(--font-body);
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--ink-light);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          white-space: nowrap;
          text-align: right;
        }
        .psw-col-headers span:nth-child(2) { text-align: left; }
        .psw-row {
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
        .psw-row:last-child { border-bottom: none; }
        .psw-row:hover { background: var(--bg-alt); }
        .psw-row.active { background: var(--bg-alt); }
        .psw-indicator {
          width: 4px;
          align-self: stretch;
          border-radius: 0;
        }
        .psw-info {
          padding: 10px 0;
          min-width: 0;
        }
        .psw-name {
          font-family: var(--font-body);
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 5px;
        }
        .psw-group {
          font-size: 0.72rem;
          font-weight: 400;
          color: var(--ink-light);
          margin-left: 6px;
          font-family: var(--font-body);
        }
        .psw-bar-wrap {
          height: 6px;
          background: var(--border);
          border-radius: 3px;
          overflow: hidden;
          max-width: 280px;
        }
        .psw-bar {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }
        .psw-speed {
          font-family: var(--font-head);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--ink);
          white-space: nowrap;
          min-width: 90px;
          text-align: right;
        }
        .psw-connector {
          font-family: var(--font-mono);
          font-size: 0.73rem;
          color: var(--ink-light);
          white-space: nowrap;
          min-width: 90px;
          text-align: right;
        }
        .psw-detail {
          display: none;
          padding: 12px 20px 14px 20px;
          background: var(--bg-alt);
          border-bottom: 1px solid var(--border);
          font-size: 0.84rem;
          color: var(--ink-mid);
          font-family: var(--font-body);
          line-height: 1.6;
        }
        .psw-detail.open { display: block; }
        .psw-detail p { margin: 0 0 6px; }
        .psw-note {
          font-size: 0.78rem;
          color: var(--ink-light);
          font-style: italic;
          margin-top: 4px;
        }
        .psw-footer {
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
      <div class="psw-widget">
        <div class="psw-header">
          <div class="psw-title">Ports &amp; Interfaces</div>
          <div class="psw-subtitle">USB naming has changed several times — the same physical interface has been marketed under at least three different names. Click any row to see what to look for and when to use it.</div>
        </div>
        <div class="psw-col-headers">
          <span></span>
          <span></span>
          <span>Speed</span>
          <span>Connector</span>
        </div>
        ${ports.map((p, i) => `
          <div class="psw-row" data-idx="${i}">
            <div class="psw-indicator" style="background:${p.color}"></div>
            <div class="psw-info">
              <div class="psw-name">${p.name} <span class="psw-group">${p.group}</span></div>
              <div class="psw-bar-wrap">
                <div class="psw-bar" style="width:${p.bar}%;background:${p.color}99"></div>
              </div>
            </div>
            <div class="psw-speed">${p.speed}</div>
            <div class="psw-connector">${p.connector}</div>
          </div>
          <div class="psw-detail" id="psw-d-${i}">
            <p>${p.detail}</p>
            ${p.note ? `<div class="psw-note">Naming note: ${p.note}</div>` : ''}
          </div>
        `).join('')}
        <div class="psw-footer">Speeds are theoretical maximums. Real-world throughput is typically 70–80% of the listed figure.</div>
      </div>
    `;

    container.querySelectorAll('.psw-row').forEach(row => {
      row.addEventListener('click', () => {
        const idx    = row.dataset.idx;
        const detail = container.querySelector(`#psw-d-${idx}`);
        const isOpen = detail.classList.contains('open');
        container.querySelectorAll('.psw-detail').forEach(d => d.classList.remove('open'));
        container.querySelectorAll('.psw-row').forEach(r => r.classList.remove('active'));
        if (!isOpen) {
          detail.classList.add('open');
          row.classList.add('active');
        }
      });
    });
  }
};
