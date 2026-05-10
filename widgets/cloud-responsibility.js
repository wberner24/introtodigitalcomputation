(function () {
  'use strict';

  window.IDC = window.IDC || { widgets: {} };

  const LAYERS = [
    { id: 'data',       label: 'Data & Content',        iaas: 'customer', paas: 'customer', saas: 'customer'  },
    { id: 'app',        label: 'Application',            iaas: 'customer', paas: 'customer', saas: 'provider'  },
    { id: 'runtime',    label: 'Runtime & Middleware',   iaas: 'customer', paas: 'provider', saas: 'provider'  },
    { id: 'os',         label: 'Operating System',       iaas: 'customer', paas: 'provider', saas: 'provider'  },
    { id: 'hypervisor', label: 'Virtualization',         iaas: 'provider', paas: 'provider', saas: 'provider'  },
    { id: 'network',    label: 'Network Infrastructure', iaas: 'provider', paas: 'provider', saas: 'provider'  },
    { id: 'hardware',   label: 'Physical Hardware',      iaas: 'provider', paas: 'provider', saas: 'provider'  },
  ];

  const DETAIL = {
    data: {
      desc: 'The actual information stored and processed — files, databases, records, and intellectual property.',
      customer: 'You are always responsible for your data regardless of service model: what you store, how you classify it, who can access it, and how long you retain it. The provider secures the infrastructure; you own the content and the compliance obligations that come with it.',
    },
    app: {
      desc: 'The software that delivers business value — code, APIs, user interfaces, and business logic.',
      customer: 'You write, deploy, test, and maintain the application. The cloud gives you infrastructure to run it on, but the software itself — and its bugs — are yours.',
      provider: 'The SaaS vendor develops, operates, and updates the entire application. You configure and use it; you never deploy code or worry about application bugs in the platform itself.',
    },
    runtime: {
      desc: 'The execution environment — language runtimes (Node.js, Python, Java), web servers (nginx, IIS), caching layers, and message queues.',
      customer: 'You install, configure, and patch the runtime stack. A security vulnerability in your version of Node.js is your problem to fix.',
      provider: 'The platform manages runtimes. You deploy code; the platform ensures a compatible, patched environment for it to run in.',
    },
    os: {
      desc: 'The operating system running on the virtual machine — Windows Server, Ubuntu, RHEL — including security patching and hardening.',
      customer: 'You choose the OS, apply patches, configure security settings, and manage updates. A missed OS patch is your vulnerability to own.',
      provider: 'The provider manages the OS layer entirely. You never SSH into a server or approve update cycles — it is handled for you.',
    },
    hypervisor: {
      desc: 'The software that creates and manages virtual machines, enforcing isolation between customers sharing the same physical hardware.',
      provider: 'Always provider-managed across all three models. This is the foundational technology of cloud computing — you rent slices of it but never configure or interact with it directly.',
    },
    network: {
      desc: 'Physical switches, routers, load balancers, and fiber connecting data center facilities — the underlying physical network fabric.',
      provider: 'Always provider-managed. You configure virtual networks (VPCs, subnets, security groups) in software, but never touch the physical hardware underneath.',
    },
    hardware: {
      desc: 'The physical servers, storage arrays, and facilities — the actual computers and the buildings they live in.',
      provider: "Always provider-managed. Hardware procurement, installation, maintenance, and replacement are entirely the provider's responsibility. You never see it.",
    },
  };

  const MODELS = ['iaas', 'paas', 'saas'];
  const MODEL_LABELS = { iaas: 'IaaS', paas: 'PaaS', saas: 'SaaS' };

  window.IDC.widgets['cloud-responsibility'] = {
    render(container) {
      let activeModel = 'iaas';
      let selectedLayerId = null;

      // ── Root
      const root = document.createElement('div');
      root.className = 'cr-widget';

      // ── Tabs
      const tabBar = document.createElement('div');
      tabBar.className = 'cr-tabs';
      const tabEls = {};
      MODELS.forEach(model => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cr-tab' + (model === activeModel ? ' active' : '');
        btn.textContent = MODEL_LABELS[model];
        btn.addEventListener('click', () => activateModel(model));
        tabBar.appendChild(btn);
        tabEls[model] = btn;
      });

      // ── Stack
      const stack = document.createElement('div');
      stack.className = 'cr-stack';
      const layerEls = {};
      LAYERS.forEach(layer => {
        const div = document.createElement('div');
        div.className = 'cr-layer';
        div.setAttribute('data-owner', layer[activeModel]);
        div.setAttribute('role', 'button');
        div.setAttribute('tabindex', '0');

        const labelSpan = document.createElement('span');
        labelSpan.className = 'cr-layer-label';
        labelSpan.textContent = layer.label;

        const badge = document.createElement('span');
        badge.className = 'cr-badge';
        badge.textContent = layer[activeModel] === 'provider' ? 'Provider' : 'You';

        div.appendChild(labelSpan);
        div.appendChild(badge);

        div.addEventListener('click', () => selectLayer(layer.id));
        div.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectLayer(layer.id); }
        });

        stack.appendChild(div);
        layerEls[layer.id] = { el: div, badge };
      });

      // ── Detail panel
      const detail = document.createElement('div');
      detail.className = 'cr-detail';
      showPlaceholder();

      // ── Legend
      const legend = document.createElement('div');
      legend.className = 'cr-legend';

      const legendItems = [
        { color: '#1A2F5E', label: 'Provider' },
        { color: 'var(--accent)', label: 'You' },
      ];
      legendItems.forEach(({ color, label }) => {
        const item = document.createElement('div');
        item.className = 'cr-legend-item';
        const swatch = document.createElement('span');
        swatch.className = 'cr-legend-swatch';
        swatch.style.background = color;
        const text = document.createElement('span');
        text.textContent = label;
        item.appendChild(swatch);
        item.appendChild(text);
        legend.appendChild(item);
      });

      root.appendChild(tabBar);
      root.appendChild(stack);
      root.appendChild(detail);
      root.appendChild(legend);
      container.appendChild(root);

      // ── Helpers

      function activateModel(model) {
        if (model === activeModel) return;
        // Update tab buttons
        tabEls[activeModel].classList.remove('active');
        activeModel = model;
        tabEls[activeModel].classList.add('active');
        // Update layers
        LAYERS.forEach(layer => {
          const { el, badge } = layerEls[layer.id];
          const owner = layer[activeModel];
          el.setAttribute('data-owner', owner);
          badge.textContent = owner === 'provider' ? 'Provider' : 'You';
          el.classList.remove('selected');
        });
        // Reset detail
        selectedLayerId = null;
        showPlaceholder();
      }

      function selectLayer(id) {
        // Deselect previous
        if (selectedLayerId && layerEls[selectedLayerId]) {
          layerEls[selectedLayerId].el.classList.remove('selected');
        }
        if (selectedLayerId === id) {
          // Toggle off
          selectedLayerId = null;
          showPlaceholder();
          return;
        }
        selectedLayerId = id;
        layerEls[id].el.classList.add('selected');
        showDetail(id);
      }

      function showPlaceholder() {
        detail.textContent = '';
        const p = document.createElement('div');
        p.className = 'cr-placeholder';
        p.textContent = 'Click a layer to see details.';
        detail.appendChild(p);
      }

      function showDetail(id) {
        const layer = LAYERS.find(l => l.id === id);
        const info = DETAIL[id];
        const owner = layer[activeModel];

        detail.textContent = '';

        const nameEl = document.createElement('div');
        nameEl.className = 'cr-detail-layer';
        nameEl.textContent = layer.label;

        const descEl = document.createElement('div');
        descEl.className = 'cr-detail-desc';
        descEl.textContent = info.desc;

        const ownerLabelEl = document.createElement('div');
        ownerLabelEl.className = 'cr-detail-owner-label';
        ownerLabelEl.textContent = owner === 'provider' ? 'Managed by: Provider' : 'Managed by: You';

        const noteEl = document.createElement('div');
        noteEl.className = 'cr-detail-note';
        noteEl.textContent = owner === 'provider' ? info.provider : info.customer;

        detail.appendChild(nameEl);
        detail.appendChild(descEl);
        detail.appendChild(ownerLabelEl);
        detail.appendChild(noteEl);
      }
    },
  };
})();
