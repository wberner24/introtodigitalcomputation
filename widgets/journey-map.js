(function () {
  'use strict';

  window.IDC = window.IDC || { widgets: {} };

  const nodes = [
    {
      id: 'keyboard',
      abbr: 'KEY',
      label: 'Keyboard',
      chapters: ['Ch. 01', 'Ch. 02'],
      title: 'Binary & Physical Bits',
      desc: 'Every keypress generates an electrical signal — on or off, 1 or 0. The character "E" is 01000101 in binary (ASCII). At the physical level, a bit is a transistor switching between two voltage states. Nothing in the entire chain that follows is more fundamental than this: digital means two states, and everything is built from them. Chapters 1 and 2 explain what "digital" means and how bits exist in the physical world.'
    },
    {
      id: 'cpu',
      abbr: 'CPU',
      label: 'Processor',
      chapters: ['Ch. 04'],
      title: 'Processors',
      desc: 'The CPU runs the fetch-decode-execute cycle billions of times per second. Pressing Enter triggers OS code that the CPU fetches from RAM, decodes into micro-operations, and executes — reading the keypress, passing it to the browser, and initiating a cascade of system calls that starts the network request. Clock speed, core count, and cache size all determine how fast this happens. Chapter 4 covers how processors work.'
    },
    {
      id: 'ram',
      abbr: 'RAM',
      label: 'Memory',
      chapters: ['Ch. 05'],
      title: 'Memory & Storage',
      desc: 'The OS, browser, and all running applications live in RAM — volatile, fast, and directly accessible to the CPU. The browser\'s executable and user data reside in long-term storage (SSD or HDD). L1/L2/L3 cache holds the most recently used instructions for near-instant access. The storage hierarchy exists because fast memory is expensive and slow memory is cheap; the system exploits locality to keep the right data in the right tier. Chapter 5 covers all of this.'
    },
    {
      id: 'os',
      abbr: 'OS',
      label: 'OS & Login',
      chapters: ['Ch. 07', 'Ch. 08', 'Ch. 09'],
      title: 'Software Stack & Operating System',
      desc: 'Windows booted from UEFI, loaded the kernel, and now manages every process, hardware resource, and file on the machine. When Alex types a password, Windows authenticates the credentials against Active Directory and applies Group Policy to the session — enforcing software restrictions, drive mappings, and security settings configured by IT. The browser is an application sitting on top of the OS, using system calls to read files, display graphics, and reach the network. Chapters 7 through 9 cover the full software stack.'
    },
    {
      id: 'nic',
      abbr: 'NIC',
      label: 'NIC',
      chapters: ['Ch. 06'],
      title: 'I/O & System Architecture',
      desc: 'The network interface card is a peripheral connected to the motherboard via a PCIe slot. When the browser sends a network request, the OS hands the data to the NIC driver, which frames it as an Ethernet frame (adding MAC address headers) and transmits it as electrical signals on the cable. The NIC is one of dozens of I/O devices the chipset manages — along with USB controllers, the storage controller, the display adapter, and the audio interface. Chapter 6 covers how I/O devices connect to and communicate with the rest of the system.'
    },
    {
      id: 'switch',
      abbr: 'SW',
      label: 'Switch',
      chapters: ['Ch. 11'],
      title: 'Network Architecture',
      desc: 'The Ethernet frame arrives at the office network switch. The switch reads the destination MAC address, consults its MAC address table (built by observing which devices send frames from which ports), and forwards the frame out the correct port — toward the DNS server first, then later toward the router. Switches operate at the data link level and are the backbone of every enterprise LAN. Chapter 11 covers network devices and enterprise architecture in depth.'
    },
    {
      id: 'dns',
      abbr: 'DNS',
      label: 'DNS',
      chapters: ['Ch. 10', 'Ch. 12'],
      title: 'Networking & Sysadmin',
      desc: 'Before the HTTP request can go anywhere, the browser asks: "What is the IP address for app.company.com?" The DNS query goes to the company\'s internal DNS server — a server maintained by IT (Chapter 12). If the answer isn\'t cached, the DNS server queries a public resolver, which walks the hierarchy: root servers → TLD servers → authoritative server → answer. Without DNS, users would type IP addresses. Chapters 10 and 12 cover DNS from both the protocol and the administration perspective.'
    },
    {
      id: 'firewall',
      abbr: 'FW',
      label: 'Router / Firewall',
      chapters: ['Ch. 11', 'Ch. 12'],
      title: 'Network Architecture & Security',
      desc: 'Now knowing the destination IP, the browser opens a TCP connection and performs a TLS handshake — negotiating an encrypted channel so the HTTP traffic cannot be read in transit (Chapter 12, encryption). The HTTPS request passes through the corporate router (which selects the best path toward Azure\'s IP) and the firewall (which checks that outbound port 443 to this destination is permitted). The packet leaves the company network and enters the ISP. Chapters 11 and 12 cover routing, firewalls, and network security.'
    },
    {
      id: 'cloud',
      abbr: 'VM',
      label: 'Cloud VM',
      chapters: ['Ch. 13'],
      title: 'Virtualization & Cloud',
      desc: 'The request reaches Azure\'s network edge and is distributed by a load balancer to one of several web server VMs. Each VM runs on a Type 1 hypervisor (Microsoft Hyper-V) in a data center. The VM believes it has exclusive hardware — but dozens of VMs share the same physical server, each in strict isolation. Whether this is IaaS (the company manages the OS) or PaaS (Azure manages the OS) depends on the service model chosen. Chapter 13 covers hypervisors, VMs, and cloud service models.'
    },
    {
      id: 'webapp',
      abbr: 'APP',
      label: 'Web App',
      chapters: ['Ch. 12', 'Ch. 13'],
      title: 'Sysadmin & Cloud',
      desc: 'The web server process receives Alex\'s authenticated request, queries a managed cloud database, assembles an HTML/CSS/JavaScript response, and sends it back. Somewhere in a monitoring dashboard, this event is logged — response time, status code, user ID. Patches are applied by Azure automatically at the infrastructure level; the app team handles the application layer. The response travels back through every step in reverse. Alex\'s browser receives the bytes, parses the HTML, and renders pixels on the screen. Total round-trip time: under 200 milliseconds.'
    }
  ];

  window.IDC.widgets['journey-map'] = {
    render(container) {
      let flowHTML = '';
      nodes.forEach(function (node, i) {
        flowHTML +=
          '<div class="jm-node" data-id="' + node.id + '" tabindex="0" role="button" aria-label="' + node.label + '">' +
            '<div class="jm-node-box">' +
              '<div class="jm-node-abbr">' + node.abbr + '</div>' +
              '<div class="jm-node-label">' + node.label + '</div>' +
            '</div>' +
          '</div>';
        if (i < nodes.length - 1) {
          flowHTML += '<div class="jm-arrow" aria-hidden="true">&#8594;</div>';
        }
      });

      container.innerHTML =
        '<div class="jm-widget">' +
          '<div class="jm-flow">' + flowHTML + '</div>' +
          '<div class="jm-detail" id="jm-detail">' +
            '<div class="jm-placeholder">Click any node to see how it fits into the journey.</div>' +
          '</div>' +
        '</div>';

      const detail = container.querySelector('#jm-detail');

      function showNode(id) {
        const node = nodes.find(function (n) { return n.id === id; });
        if (!node) return;

        container.querySelectorAll('.jm-node').forEach(function (el) {
          el.classList.toggle('active', el.dataset.id === id);
        });

        const chipsHTML = node.chapters.map(function (ch) {
          return '<span class="jm-detail-ch">' + ch + '</span>';
        }).join('');

        detail.innerHTML =
          '<div class="jm-detail-title">' + node.title + '</div>' +
          '<div class="jm-detail-chapters">' + chipsHTML + '</div>' +
          '<div class="jm-detail-desc">' + node.desc + '</div>';
      }

      container.querySelectorAll('.jm-node').forEach(function (el) {
        el.addEventListener('click', function () { showNode(this.dataset.id); });
        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showNode(this.dataset.id); }
        });
      });
    }
  };

})();
