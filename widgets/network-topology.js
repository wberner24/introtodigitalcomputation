(function () {
  'use strict';
  window.IDC = window.IDC || { widgets: {} };

  const DEVICES = {
    router: {
      name: 'Router',
      color: '#1A5E8B',
      role: 'A router connects networks together — most importantly, your local network to the internet. It reads the destination IP address of every outgoing packet and determines the best path to forward it. Data hops from router to router across the globe until it reaches its destination. The router is also where NAT happens: it translates your devices\' private IP addresses to the single public IP your ISP assigned.',
      location: 'At the edge of your network, between the firewall and the ISP. At home, your ISP-provided gateway is a router (usually combined with a switch and Wi-Fi). In an office, it\'s a dedicated device.',
      examples: 'Cisco ISR series, Juniper MX series; your home ISP gateway (Xfinity, AT&T, etc.)'
    },
    firewall: {
      name: 'Firewall',
      color: '#8B1A1A',
      role: 'A firewall inspects every packet crossing a network boundary and allows or blocks it based on a rule set. The default stance: allow outbound traffic, block unsolicited inbound traffic from the internet. Stateful inspection means the firewall tracks active sessions — when your workstation opens a connection to a web server, reply packets are automatically allowed back because the firewall knows they belong to a session you initiated.',
      location: 'Between the internet and your internal network. Enterprise firewalls are dedicated rack-mounted appliances. Individual PCs also have software firewalls (Windows Defender Firewall) as a second layer of protection.',
      examples: 'Cisco ASA, Palo Alto NGFW, Fortinet FortiGate, pfSense (open-source), Windows Defender Firewall (host-based)'
    },
    switch: {
      name: 'Switch',
      color: '#1A2F5E',
      role: 'A switch connects all the wired devices on your local network. It learns which device is plugged into which port by reading MAC addresses, then forwards each frame only to the correct destination port — so your traffic goes only where it needs to go, not broadcast to every device. The RJ-45 wall jack in your office connects through the wall to a switch in a nearby wiring closet. Many switches also supply Power over Ethernet (PoE) to power phones and access points without separate power adapters.',
      location: 'In wiring closets, connected to all the wall jacks in the area. All wired devices on the network connect to a switch. The switch uplinks to the router/firewall to reach the internet.',
      examples: 'Cisco Catalyst, HP Aruba, Juniper EX, Ubiquiti UniFi switches'
    },
    ap: {
      name: 'Wireless AP',
      color: '#1A6B5A',
      role: 'A wireless access point (AP) broadcasts a Wi-Fi signal and bridges wireless devices onto the wired network — think of it as a switch port, but wireless. Enterprise APs are separate ceiling-mounted devices (not built into the router). They support 802.1X authentication: instead of a shared password, each user authenticates with their Active Directory credentials, so IT knows exactly which user is on which AP and can revoke access individually.',
      location: 'Mounted on ceilings or walls, cabled back to the switch via a single Ethernet cable that also supplies PoE power. One AP covers roughly 1,500–3,000 sq ft depending on construction and interference.',
      examples: 'Cisco Meraki MR, Ubiquiti UniFi, Aruba Instant On — the disc-shaped devices on office ceilings'
    },
    server: {
      name: 'Server',
      color: '#7A4A1A',
      role: 'A server is any computer that provides a service to other devices. File servers store shared documents. Mail servers handle email. Domain controllers run Active Directory. DNS and DHCP servers handle name resolution and IP assignment. Database servers hold application data. Web servers deliver web pages. In an enterprise these run on dedicated rack hardware in a server room, built for 24/7 uptime with redundant power and remote management.',
      location: 'Physically in a server room or data center, or virtualized (multiple logical servers on one physical machine). Connected at high speed (10 Gbps+) directly to the switch.',
      examples: 'Windows Server (file/AD/DNS/DHCP), Microsoft Exchange (email), SQL Server (database), IIS/Apache/nginx (web)'
    },
    workstation: {
      name: 'Workstations',
      color: '#4A4A4A',
      role: 'Workstations and laptops are the clients — they initiate requests to servers and consume services. A domain-joined workstation receives its IP from DHCP, resolves names via DNS, authenticates through Active Directory, applies Group Policy at login, and mounts shared drives automatically. From the network\'s perspective, each workstation is simply a source and destination for traffic.',
      location: 'Connected to the switch via RJ-45 wall jacks (wired) or to the access point (wireless). End devices share the switch\'s bandwidth and uplink to reach the internet and servers.',
      examples: 'Windows 10/11 workstations, MacBooks, laptops — any end-user device on the network'
    }
  };

  // SVG layout constants
  const W = 520, H = 330, CX = 260;
  const BOX_W = 108, BOX_H = 38;

  // [id, cx, cy]
  const NODES = [
    ['router',      CX,   92],
    ['firewall',    CX,   160],
    ['switch',      CX,   228],
    ['ap',          80,   296],
    ['workstation', CX,   296],
    ['server',      440,  296],
  ];

  const LINES = [
    // straight trunk
    [CX, 42,  CX, 73],   // internet → router
    [CX, 111, CX, 141],  // router → firewall
    [CX, 179, CX, 209],  // firewall → switch
    [CX, 247, CX, 264],  // switch → junction
    // horizontal bus
    [80, 264, 440, 264],
    // drops
    [80,  264, 80,  277],
    [CX,  264, CX,  277],
    [440, 264, 440, 277],
  ];

  function buildSVG() {
    const lc = '#C8C2B6';
    let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;max-width:460px;margin:0 auto;">`;
    s += `<rect width="${W}" height="${H}" fill="#FDFAF4"/>`;

    // Internet label (non-interactive)
    s += `<rect x="206" y="10" width="108" height="32" rx="16" fill="#EAE5DA" stroke="#C5BFB0" stroke-width="1.2"/>`;
    s += `<text x="${CX}" y="31" text-anchor="middle" font-size="10.5" font-weight="600" fill="#6A6560" font-family="'Source Sans 3',sans-serif">Internet</text>`;

    // Connecting lines (drawn before boxes)
    LINES.forEach(([x1,y1,x2,y2]) => {
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${lc}" stroke-width="2"/>`;
    });

    // Device nodes
    NODES.forEach(([id, cx, cy]) => {
      const d = DEVICES[id];
      const rx = cx - BOX_W / 2;
      const ry = cy - BOX_H / 2;
      const label = d.name;
      s += `<g class="nt-node" data-id="${id}" role="button" tabindex="0" aria-label="${label}">`;
      s += `<rect class="nd-bg" x="${rx}" y="${ry}" width="${BOX_W}" height="${BOX_H}" rx="6" `
         + `fill="white" stroke="${d.color}" stroke-width="1.5"/>`;
      s += `<text class="nd-label" x="${cx}" y="${cy + 4}" text-anchor="middle" `
         + `font-size="10.5" font-weight="600" fill="${d.color}" `
         + `font-family="'Source Sans 3',sans-serif">${label}</text>`;
      s += `</g>`;
    });

    s += `</svg>`;
    return s;
  }

  window.IDC.widgets['network-topology'] = {
    render(container) {
      container.innerHTML = `
        <div class="nt-widget">
          <div class="nt-diagram">${buildSVG()}</div>
          <div class="nt-detail nt-placeholder"><span>Click any device to learn its role</span></div>
        </div>`;

      const detail = container.querySelector('.nt-detail');
      let activeNode = null;

      container.querySelectorAll('.nt-node').forEach(node => {
        const id    = node.dataset.id;
        const dev   = DEVICES[id];
        const bg    = node.querySelector('.nd-bg');
        const lbl   = node.querySelector('.nd-label');

        const activate = () => {
          // Reset previous
          if (activeNode && activeNode !== node) {
            const pb = activeNode.querySelector('.nd-bg');
            const pl = activeNode.querySelector('.nd-label');
            const prevDev = DEVICES[activeNode.dataset.id];
            pb.setAttribute('fill', 'white');
            pb.setAttribute('stroke-width', '1.5');
            pl.setAttribute('fill', prevDev.color);
          }
          // Activate this node
          bg.setAttribute('fill', dev.color);
          bg.setAttribute('stroke-width', '2.5');
          lbl.setAttribute('fill', 'white');
          activeNode = node;

          detail.className = 'nt-detail';
          detail.innerHTML = `
            <div class="nt-detail-header">
              <div class="nt-detail-title" style="color:${dev.color}">${dev.name}</div>
            </div>
            <div class="nt-detail-role">${dev.role}</div>
            <div class="nt-detail-section">Where It Sits</div>
            <div class="nt-detail-value">${dev.location}</div>
            <div class="nt-detail-section">Real-World Examples</div>
            <div class="nt-detail-examples">${dev.examples}</div>`;
        };

        node.addEventListener('click', activate);
        node.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
        });
      });
    }
  };
})();
