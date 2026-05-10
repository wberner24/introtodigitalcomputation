(function () {
  'use strict';

  window.IDC = window.IDC || { widgets: {} };

  /* ── Crypto helpers ──────────────────────────────────────── */

  async function sha256hex(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function deriveKey(passphrase) {
    const raw = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('idc-v1'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      raw,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async function aesEncrypt(passphrase, plaintext) {
    const key = await deriveKey(passphrase);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(plaintext)
    );
    const combined = new Uint8Array(12 + ct.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ct), 12);
    return Array.from(combined).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function aesDecrypt(passphrase, hex) {
    const bytes = new Uint8Array(hex.match(/.{2}/g).map(h => parseInt(h, 16)));
    const iv = bytes.slice(0, 12);
    const ct = bytes.slice(12);
    const key = await deriveKey(passphrase);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return new TextDecoder().decode(pt);
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Widget registry entry ───────────────────────────────── */

  window.IDC.widgets['crypto-explorer'] = {
    render(container) {
      /* Check WebCrypto availability */
      if (!window.crypto || !window.crypto.subtle) {
        container.innerHTML =
          '<p style="color:#c14040;font-family:var(--font-mono);padding:16px;">WebCrypto not available in this browser.</p>';
        return;
      }

      container.innerHTML = `
<div class="cx-widget">

  <!-- ── Hashing section ─────────────────────────────────── -->
  <div class="cx-section">
    <div class="cx-section-hd">SHA-256 Hashing</div>
    <div class="cx-section-bd">

      <div class="cx-row">
        <label for="cx-hash-input">Input</label>
        <input id="cx-hash-input" type="text" placeholder="Type anything…" autocomplete="off" spellcheck="false">
      </div>

      <div class="cx-hash-output" id="cx-hash-output">
        <span class="cx-hash-placeholder">Hash will appear here…</span>
      </div>
      <div class="cx-hash-meta">256 bits &middot; 64 hex characters &middot; output is always this length</div>

      <div class="cx-avalanche">
        <div class="cx-av-label">Avalanche effect — one character difference, completely different hash:</div>
        <div class="cx-av-grid">
          <div class="cx-av-item">
            <div class="cx-av-input" id="cx-av-input-a"></div>
            <div class="cx-av-hash" id="cx-av-hash-a">computing…</div>
          </div>
          <div class="cx-av-item">
            <div class="cx-av-input" id="cx-av-input-b"></div>
            <div class="cx-av-hash" id="cx-av-hash-b">computing…</div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- ── Encryption section ──────────────────────────────── -->
  <div class="cx-section">
    <div class="cx-section-hd">AES-256 Encryption</div>
    <div class="cx-section-bd">
      <div class="cx-enc-grid">

        <!-- Left: Encrypt -->
        <div>
          <div class="cx-row">
            <label for="cx-pass">Passphrase</label>
            <input id="cx-pass" type="text" placeholder="Enter a passphrase" autocomplete="off" spellcheck="false">
          </div>
          <div class="cx-row">
            <label for="cx-plain">Plaintext</label>
            <textarea id="cx-plain" placeholder="Type a message to encrypt…" spellcheck="false"></textarea>
          </div>
          <button class="cx-btn" id="cx-enc-btn">Encrypt &rarr;</button>
          <div class="cx-cipher-out" id="cx-cipher-out"></div>
          <div class="cx-enc-note">Uses AES-256-GCM with PBKDF2 key derivation. The 24-character prefix is the IV (initialization vector).</div>
        </div>

        <!-- Right: Decrypt -->
        <div>
          <div class="cx-row">
            <label for="cx-dpass">Passphrase</label>
            <input id="cx-dpass" type="text" placeholder="Same passphrase" autocomplete="off" spellcheck="false">
          </div>
          <div class="cx-row">
            <label for="cx-cipher-in">Ciphertext (hex)</label>
            <textarea id="cx-cipher-in" placeholder="Paste ciphertext here…" spellcheck="false"></textarea>
          </div>
          <button class="cx-btn" id="cx-dec-btn">&larr; Decrypt</button>
          <div class="cx-plain-out" id="cx-plain-out"></div>
        </div>

      </div>
    </div>
  </div>

</div>`;

      /* ── Hash section wiring ───────────────────────────── */

      const hashInput  = container.querySelector('#cx-hash-input');
      const hashOutput = container.querySelector('#cx-hash-output');

      hashInput.addEventListener('input', function () {
        const val = this.value;
        if (!val) {
          hashOutput.innerHTML = '<span class="cx-hash-placeholder">Hash will appear here…</span>';
          return;
        }
        sha256hex(val).then(function (h) {
          hashOutput.innerHTML = '<span class="cx-hash-value">' + h + '</span>';
        });
      });

      /* Avalanche demo — computed once at render time */
      const avInputA  = 'Hello, World!';
      const avInputB  = 'Hello, world!';

      container.querySelector('#cx-av-input-a').textContent = avInputA;
      container.querySelector('#cx-av-input-b').textContent = avInputB;

      sha256hex(avInputA).then(function (h) {
        container.querySelector('#cx-av-hash-a').textContent = h;
      });
      sha256hex(avInputB).then(function (h) {
        container.querySelector('#cx-av-hash-b').textContent = h;
      });

      /* ── Encryption section wiring ────────────────────── */

      const passInput    = container.querySelector('#cx-pass');
      const plainInput   = container.querySelector('#cx-plain');
      const cipherOut    = container.querySelector('#cx-cipher-out');
      const encBtn       = container.querySelector('#cx-enc-btn');

      const dpassInput   = container.querySelector('#cx-dpass');
      const cipherIn     = container.querySelector('#cx-cipher-in');
      const plainOut     = container.querySelector('#cx-plain-out');
      const decBtn       = container.querySelector('#cx-dec-btn');

      encBtn.addEventListener('click', function () {
        const pass = passInput.value.trim();
        const plain = plainInput.value;

        if (!pass || !plain) {
          cipherOut.innerHTML = '<span class="cx-error">Please enter both a passphrase and a message.</span>';
          return;
        }

        encBtn.disabled = true;
        encBtn.textContent = 'Encrypting…';

        aesEncrypt(pass, plain).then(function (hex) {
          cipherOut.textContent = hex;
          /* Auto-copy to decrypt panel for easy round-trip demo */
          cipherIn.value  = hex;
          dpassInput.value = pass;
          encBtn.disabled = false;
          encBtn.innerHTML = 'Encrypt &rarr;';
        }).catch(function (err) {
          cipherOut.innerHTML = '<span class="cx-error">Encryption failed: ' + escapeHTML(String(err)) + '</span>';
          encBtn.disabled = false;
          encBtn.innerHTML = 'Encrypt &rarr;';
        });
      });

      decBtn.addEventListener('click', function () {
        const pass = dpassInput.value.trim();
        const hex  = cipherIn.value.trim();

        if (!pass || !hex) {
          plainOut.innerHTML = '<span class="cx-error">Please enter a passphrase and ciphertext.</span>';
          return;
        }

        decBtn.disabled = true;
        decBtn.textContent = 'Decrypting…';

        aesDecrypt(pass, hex).then(function (text) {
          plainOut.textContent = text;
          decBtn.disabled = false;
          decBtn.innerHTML = '&larr; Decrypt';
        }).catch(function () {
          plainOut.innerHTML = '<span class="cx-error">Decryption failed — check the passphrase and ciphertext.</span>';
          decBtn.disabled = false;
          decBtn.innerHTML = '&larr; Decrypt';
        });
      });
    }
  };

})();
