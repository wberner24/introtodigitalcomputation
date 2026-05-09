(function () {
  'use strict';
  window.IDC = window.IDC || { widgets: {} };

  const DEVICES = [
    {
      name: 'Firewall',
      tier: 'Perimeter',
      tierColor: '#8B1A1A',
      light: '#F2DADA',
      role: 'A firewall sits at the network edge and inspects every packet that crosses it. It enforces a rule set — allowing expected traffic and blocking everything else by default. Modern firewalls use stateful inspection: they track active TCP/UDP sessions so that reply packets for connections initiated internally are automatically permitted without a separate inbound rule. Without a firewall, the internal network would be directly exposed to the internet.',
      location: 'Between the internet and the internal network. Larger organizations add internal firewalls to segment sensitive zones — the server VLAN, finance systems, the DMZ — from the general employee network.',
      examples: 'Cisco ASA, Palo Alto NGFW, Fortinet FortiGate, pfSense (open-source), Windows Defender Firewall (host-based, on each endpoint)'
    },
    {
      name: 'Core Switch',
      tier: 'Core',
      tierColor: '#1A2F5E',
      light: '#D6DCF0',
      role: 'The core switch is the backbone of the network — it connects every distribution switch and carries the highest volume of traffic at the highest speed. Core switches operate at Layer 3 (they route as well as switch) and are built for maximum throughput with minimal latency. They never connect directly to end devices. Redundancy is critical: a failed core switch takes down the entire network, so core switches are typically deployed in pairs.',
      location: 'Top of the 3-tier hierarchy, physically in the main data center or central equipment room. All distribution switches have uplinks to the core.',
      examples: 'Cisco Catalyst 9500, Cisco Nexus (data center), Juniper EX9200, Aruba 8400'
    },
    {
      name: 'Distribution Switch',
      tier: 'Distribution',
      tierColor: '#1A5E8B',
      light: '#D6EAF2',
      role: 'Distribution switches aggregate traffic from multiple access switches and forward it to the core. They enforce inter-VLAN routing, access control lists (ACLs), and quality of service (QoS) policies between the access layer and the core. If you want to restrict which VLANs can reach which server segments, this is where those boundaries are enforced. Like core switches, they are Layer 3 devices that make routing decisions.',
      location: 'Middle tier. One distribution switch typically serves a floor or wing of a building, aggregating all access switches in that zone before passing traffic up to the core.',
      examples: 'Cisco Catalyst 9300, HP Aruba 3810, Juniper EX4300, Extreme Networks X465'
    },
    {
      name: 'Access Switch',
      tier: 'Access',
      tierColor: '#1A5E4A',
      light: '#D6F0E8',
      role: 'Access switches are the edge of the wired network — every RJ-45 wall port in an office connects back to an access switch in a nearby wiring closet. Access switches are typically Layer 2 devices that forward frames based on MAC address. They assign devices to VLANs based on port configuration and may supply Power over Ethernet (PoE) to power IP phones, wireless access points, and security cameras without separate power adapters.',
      location: 'Bottom of the 3-tier hierarchy, in wiring closets distributed throughout the building. Each access switch has a high-speed uplink to the distribution layer and 24–48 ports facing end devices.',
      examples: 'Cisco Catalyst 9200, HP Aruba 2530, Juniper EX2300, Ubiquiti UniFi US-48 (smaller deployments)'
    },
    {
      name: 'Wireless AP',
      tier: 'Access',
      tierColor: '#1A6B5A',
      light: '#D6EDEA',
      role: 'Wireless access points broadcast Wi-Fi SSIDs and bridge wireless clients onto the wired network. Enterprise APs support 802.1X authentication — users authenticate with their Active Directory credentials rather than a shared passphrase, giving IT individual visibility and per-user access control. APs are managed centrally by a wireless controller or cloud management platform, enabling consistent configuration, automatic channel management, and mass firmware updates from a single console.',
      location: 'Ceiling- or wall-mounted throughout the facility, each cabled back to an access switch via a single PoE Ethernet connection. One enterprise AP covers roughly 1,500–3,000 sq ft depending on construction and interference.',
      examples: 'Cisco Meraki MR, Aruba Instant On, Ubiquiti UniFi APs, Extreme Networks ExtremeWireless'
    },
    {
      name: 'Server',
      tier: 'Servers',
      tierColor: '#7A4A1A',
      light: '#EDE0D2',
      role: 'Servers provide the centralized services that clients consume. In a typical enterprise environment: the domain controller (Active Directory) handles authentication and Group Policy; the DHCP server assigns IP addresses; the DNS server resolves names; file servers provide shared storage; email servers handle messaging; database servers hold application data; and web/application servers run internal tools and public-facing sites. Servers live in a protected network segment with firewall rules controlling which clients can reach them.',
      location: 'Physically in a data center or server room, or virtualized on a hypervisor within that room. Connected at 10 Gbps or faster, typically uplinked to the distribution or core layer rather than an access switch.',
      examples: 'Active Directory Domain Controller, Microsoft Exchange, SQL Server, Windows Server file server, IIS / Apache / nginx web server, VMware ESXi hypervisor hosts'
    },
    {
      name: 'Workstation / Laptop',
      tier: 'Endpoints',
      tierColor: '#444',
      light: '#E8E8E8',
      role: 'End-user devices are the clients — they initiate requests to servers and consume services. A domain-joined workstation receives its IP from DHCP, resolves names via DNS, authenticates through Active Directory, applies Group Policy at login, and mounts file server shares automatically. IT manages endpoints via Group Policy, endpoint management platforms (Microsoft Intune, SCCM/ConfigMgr), and endpoint protection agents. From the network\'s perspective, each workstation is simply a source and destination for TCP/UDP flows.',
      location: 'Connected at the access layer — either via RJ-45 to an access switch port, or wirelessly to an AP. Devices on the same access switch and VLAN communicate at Layer 2 without involving a router.',
      examples: 'Windows 10/11 workstations, MacBooks, Windows laptops, IP phones (on a separate Voice VLAN at the access layer)'
    }
  ];

  const TIER_ORDER = ['Perimeter', 'Core', 'Distribution', 'Access', 'Servers', 'Endpoints'];

  window.IDC.widgets['network-topology'] = {
    render(container) {
      let activeEl = null;

      const grouped = {};
      DEVICES.forEach(d => {
        if (!grouped[d.tier]) grouped[d.tier] = [];
        grouped[d.tier].push(d);
      });

      container.innerHTML = `
        <div class="nt-widget">
          <div class="nt-sidebar"></div>
          <div class="nt-detail nt-placeholder"><span>← Select a device to explore its role</span></div>
        </div>`;

      const sidebar = container.querySelector('.nt-sidebar');
      const detail  = container.querySelector('.nt-detail');

      TIER_ORDER.forEach(tierName => {
        if (!grouped[tierName]) return;

        const label = document.createElement('div');
        label.className = 'nt-tier-label';
        label.textContent = tierName;
        sidebar.appendChild(label);

        grouped[tierName].forEach(device => {
          const el = document.createElement('div');
          el.className = 'nt-device';
          el.innerHTML = `
            <span class="nt-dot" style="background:${device.tierColor}"></span>
            <span class="nt-device-name">${device.name}</span>`;

          el.addEventListener('click', () => {
            if (activeEl) activeEl.classList.remove('active');
            el.classList.add('active');
            activeEl = el;

            detail.className = 'nt-detail';
            detail.innerHTML = `
              <div class="nt-detail-header">
                <div class="nt-detail-title" style="color:${device.tierColor}">${device.name}</div>
                <span class="nt-detail-tier" style="background:${device.light};color:${device.tierColor}">${device.tier}</span>
              </div>
              <div class="nt-detail-role">${device.role}</div>
              <div class="nt-detail-section">Where It Sits</div>
              <div class="nt-detail-value">${device.location}</div>
              <div class="nt-detail-section">Real-World Examples</div>
              <div class="nt-detail-examples">${device.examples}</div>`;
          });

          sidebar.appendChild(el);
        });
      });
    }
  };
})();
