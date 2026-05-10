(function () {
  'use strict';
  window.IDC = window.IDC || { widgets: {} };

  const RECORDS = [
    {
      abbr: 'A',
      name: 'Address',
      color: '#1D4E7A',
      purpose: 'Maps a hostname to an IPv4 address. This is the most fundamental record type — it\'s what makes typing a name actually work. Without an A record, a hostname resolves to nothing.',
      example: 'fileserver.corp.local.   IN  A    10.0.1.20\nwww.example.com.         IN  A    93.184.216.34',
      notes: 'Every device you want reachable by name needs an A record. When a server moves to a new IP, update this record and every service that references it by name updates automatically.'
    },
    {
      abbr: 'AAAA',
      name: 'IPv6 Address',
      color: '#2564A0',
      purpose: 'Same as an A record but for 128-bit IPv6 addresses. The name is \'quad-A\' because IPv6 addresses are four times longer than IPv4.',
      example: 'www.example.com.  IN  AAAA  2606:2800:220:1:248:1893:25c8:1946',
      notes: 'Most public-facing services publish both A and AAAA records so IPv4 and IPv6 clients can reach them. If only an AAAA record exists, IPv4-only clients cannot connect.'
    },
    {
      abbr: 'CNAME',
      name: 'Canonical Name (Alias)',
      color: '#2E6B4F',
      purpose: 'An alias that points one hostname to another. The \'canonical name\' is the authoritative hostname; a CNAME is just a nickname. Resolvers follow the chain until they reach an A record.',
      example: 'www.example.com.    IN  CNAME  example.com.\nftp.example.com.    IN  CNAME  files.example.com.',
      notes: 'A CNAME cannot exist at the zone apex (the bare domain itself must have an A record). You also cannot point an MX record at a CNAME — mail servers require a direct hostname.'
    },
    {
      abbr: 'MX',
      name: 'Mail Exchanger',
      color: '#7A4A1A',
      purpose: 'Tells the internet which server accepts incoming email for a domain. When a mail server delivers to user@example.com, it queries the MX record to find the destination server.',
      example: 'example.com.  IN  MX  10  mail.example.com.\nexample.com.  IN  MX  20  backup-mail.example.com.',
      notes: 'The number is a priority — lower is preferred. Multiple MX records provide redundancy: if the primary mail server is unreachable, delivery attempts the next priority. Missing or misconfigured MX records cause inbound email to fail.'
    },
    {
      abbr: 'PTR',
      name: 'Pointer (Reverse Lookup)',
      color: '#6B2E6B',
      purpose: 'The reverse of an A record — maps an IP address back to a hostname. While A records live in the forward DNS zone, PTR records live in the special in-addr.arpa reverse zone.',
      example: '20.1.0.10.in-addr.arpa.  IN  PTR  fileserver.corp.local.',
      notes: 'PTR records are used by spam filters, security logging, and some authentication checks. A missing or mismatched PTR record for your mail server\'s IP is one of the most common reasons outbound email is flagged as spam.'
    },
    {
      abbr: 'TXT',
      name: 'Text',
      color: '#5E5E1A',
      purpose: 'Free-form text attached to a domain name. Originally intended for human-readable information, TXT records are now primarily used for email authentication (SPF, DKIM, DMARC) and domain ownership verification.',
      example: 'example.com.  IN  TXT  "v=spf1 include:_spf.google.com ~all"\nexample.com.  IN  TXT  "google-site-verification=abc123..."',
      notes: 'SPF records specify which IP addresses are authorized to send email for your domain. Without a correct SPF record, much of your outbound email will be rejected or quarantined by recipients.'
    },
    {
      abbr: 'NS',
      name: 'Name Server',
      color: '#4A4A4A',
      purpose: 'Identifies which DNS servers are authoritative for a domain — the servers that have the definitive, final-answer records. Every domain must have at least two NS records for redundancy.',
      example: 'example.com.  IN  NS  ns1.example.com.\nexample.com.  IN  NS  ns2.example.com.',
      notes: 'NS records are configured at your domain registrar and delegate control of the domain to those name servers. Changing NS records takes up to 48 hours to propagate globally.'
    }
  ];

  function activate(record, el, detail, activeRef) {
    if (activeRef.el) activeRef.el.classList.remove('active');
    el.classList.add('active');
    activeRef.el = el;

    const exampleLines = record.example
      .split('\n')
      .map(l => escapeHTML(l))
      .join('\n');

    detail.className = 'dr-detail';
    detail.innerHTML =
      '<div class="dr-detail-header">' +
        '<span class="dr-detail-type" style="color:' + record.color + '">' + escapeHTML(record.abbr) + '</span>' +
        '<span class="dr-detail-full">' + escapeHTML(record.name) + '</span>' +
      '</div>' +
      '<div class="dr-detail-purpose">' + escapeHTML(record.purpose) + '</div>' +
      '<div class="dr-detail-section">Example Record</div>' +
      '<pre class="dr-detail-example">' + exampleLines + '</pre>' +
      '<div class="dr-detail-section">Practical Notes</div>' +
      '<div class="dr-detail-notes">' + escapeHTML(record.notes) + '</div>';
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  window.IDC.widgets['dns-records'] = {
    render(container) {
      const activeRef = { el: null };

      container.innerHTML =
        '<div class="dr-widget">' +
          '<div class="dr-stack"></div>' +
          '<div class="dr-detail dr-placeholder">&#8592; Click a record type to explore it</div>' +
        '</div>';

      const stack  = container.querySelector('.dr-stack');
      const detail = container.querySelector('.dr-detail');

      RECORDS.forEach(function (record) {
        const el = document.createElement('div');
        el.className = 'dr-item';
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', record.abbr + ' — ' + record.name);
        el.innerHTML =
          '<span class="dr-badge" style="background:' + record.color + '">' + escapeHTML(record.abbr) + '</span>' +
          '<span class="dr-name">' + escapeHTML(record.name) + '</span>';

        el.addEventListener('click', function () {
          activate(record, el, detail, activeRef);
        });

        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            activate(record, el, detail, activeRef);
          }
        });

        stack.appendChild(el);
      });
    }
  };
})();
