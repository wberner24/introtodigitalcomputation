(function () {
  'use strict';
  window.IDC = window.IDC || { widgets: {} };

  const LAYERS = [
    {
      num: 5, name: 'Application',
      color: '#1D4E7A', light: '#DDE8F2',
      pdu: 'Data',
      role: 'Provides network services directly to applications. HTTP, DNS, email, SSH — every protocol that end-user software relies on lives here. This is the only layer most developers ever consciously interact with.',
      protocols: 'HTTP, HTTPS, DNS, SMTP, IMAP, SSH, FTP, DHCP, RDP, SNMP',
      hardware: 'Web browsers, email clients, DNS resolvers, application servers — the software itself is the "hardware" at this layer',
      example: 'Your browser sends an HTTP GET request for a web page. The URL, method, and request headers are all Application-layer concerns.'
    },
    {
      num: 4, name: 'Transport',
      color: '#1A7A6B', light: '#D6EFEB',
      pdu: 'Segment (TCP) or Datagram (UDP)',
      role: 'End-to-end delivery between specific processes on two hosts. Port numbers identify which application receives each message. TCP adds reliable, ordered delivery with retransmission; UDP trades reliability for lower overhead and speed.',
      protocols: 'TCP (Transmission Control Protocol), UDP (User Datagram Protocol)',
      hardware: 'Firewalls and load balancers commonly inspect Transport-layer headers to make forwarding decisions',
      example: 'TCP breaks a large file download into numbered segments, detects any lost in transit, requests retransmission, and hands the complete file to the application in the correct order.'
    },
    {
      num: 3, name: 'Network',
      color: '#2E6B4F', light: '#D6E8DF',
      pdu: 'Packet',
      role: 'Logical addressing and routing — moves packets from the source host to the destination host across multiple networks. IP addresses live here. This layer is what allows the internet to span the globe.',
      protocols: 'IPv4, IPv6, ICMP (used by ping and traceroute), OSPF, BGP',
      hardware: 'Routers, Layer 3 switches',
      example: 'A router reads the destination IP address in each packet header and consults its routing table to forward the packet one hop closer to its destination — repeating this across every router in the path.'
    },
    {
      num: 2, name: 'Data Link',
      color: '#7A5C1A', light: '#EDE4D2',
      pdu: 'Frame',
      role: 'Node-to-node delivery on a single network segment. MAC addresses — 48-bit hardware identifiers burned into every NIC — address devices on the local network. ARP resolves IP addresses to MAC addresses so Layer 3 can hand off to Layer 2.',
      protocols: 'Ethernet (IEEE 802.3), Wi-Fi (IEEE 802.11), ARP',
      hardware: 'Switches, NICs, wireless access points',
      example: 'A switch reads the destination MAC address in a frame and forwards it out only the correct port — unlike a hub, which broadcasts every frame to every port regardless of destination.'
    },
    {
      num: 1, name: 'Physical',
      color: '#7A3A3A', light: '#EDD8D8',
      pdu: 'Bits',
      role: 'Transmits raw bits as physical signals. No addressing, no error correction at this layer — just the conversion of 1s and 0s into voltage transitions, light pulses, or radio waves, and back again at the other end.',
      protocols: 'Ethernet physical specs (1000BASE-T, 10GBASE-SR), IEEE 802.11 radio, USB physical layer',
      hardware: 'Cables, RJ-45 jacks, fiber optic transceivers, NICs, hubs, repeaters, antennas',
      example: 'A Cat6 Ethernet cable carries a Gigabit signal as differential voltage on twisted copper pairs, toggling between high and low one billion times per second.'
    }
  ];

  window.IDC.widgets['layer-explorer'] = {
    render(container) {
      let activeEl = null;

      container.innerHTML = `
        <div class="le-widget">
          <div class="le-stack"></div>
          <div class="le-detail le-detail-placeholder">
            <span>← Click a layer to explore it</span>
          </div>
        </div>`;

      const stack  = container.querySelector('.le-stack');
      const detail = container.querySelector('.le-detail');

      LAYERS.forEach(layer => {
        const el = document.createElement('div');
        el.className = 'le-layer';
        el.innerHTML = `
          <span class="le-num" style="background:${layer.color}">${layer.num}</span>
          <span class="le-layer-name">${layer.name}</span>`;

        el.addEventListener('click', () => {
          if (activeEl) activeEl.classList.remove('active');
          el.classList.add('active');
          activeEl = el;

          detail.className = 'le-detail';
          detail.innerHTML = `
            <div class="le-detail-header">
              <div class="le-detail-title" style="color:${layer.color}">Layer ${layer.num} — ${layer.name}</div>
              <span class="le-detail-pdu" style="background:${layer.light};color:${layer.color}">PDU: ${layer.pdu}</span>
            </div>
            <div class="le-detail-role">${layer.role}</div>
            <div class="le-detail-section">Protocols &amp; Standards</div>
            <div class="le-detail-value">${layer.protocols}</div>
            <div class="le-detail-section">Hardware / Software</div>
            <div class="le-detail-value">${layer.hardware}</div>
            <div class="le-detail-section">Example</div>
            <div class="le-detail-example">${layer.example}</div>`;
        });

        stack.appendChild(el);
      });
    }
  };
})();
