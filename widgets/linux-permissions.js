(function () {
  'use strict';
  window.IDC = window.IDC || { widgets: {} };

  window.IDC.widgets['linux-permissions'] = {
    render(container) {
      const state = {
        u: { r: true,  w: true,  x: false },
        g: { r: true,  w: false, x: false },
        o: { r: true,  w: false, x: false },
      };
      const whoLabel = { u: 'User (Owner)', g: 'Group', o: 'Other' };

      function octalFor(w) {
        return (state[w].r ? 4 : 0) + (state[w].w ? 2 : 0) + (state[w].x ? 1 : 0);
      }

      function symbolic() {
        return ['u', 'g', 'o'].map(w =>
          (state[w].r ? 'r' : '-') + (state[w].w ? 'w' : '-') + (state[w].x ? 'x' : '-')
        ).join('');
      }

      function octal() {
        return ['u', 'g', 'o'].map(w => octalFor(w)).join('');
      }

      function describe() {
        return ['u', 'g', 'o'].map(w => {
          const perms = [];
          if (state[w].r) perms.push('read');
          if (state[w].w) perms.push('write');
          if (state[w].x) perms.push('execute');
          const label = w === 'u' ? 'Owner' : w === 'g' ? 'Group' : 'Others';
          return perms.length
            ? `<strong>${label}</strong> can ${perms.join(' + ')}`
            : `<strong>${label}</strong> has no access`;
        }).join(' &nbsp;·&nbsp; ');
      }

      function render() {
        container.innerHTML = `
          <div class="perm-widget">
            <div class="perm-grid">
              ${['u', 'g', 'o'].map(w => `
                <div class="perm-group">
                  <div class="perm-group-label">${whoLabel[w]}</div>
                  <div class="perm-toggles">
                    ${['r', 'w', 'x'].map(bit => `
                      <button class="perm-btn${state[w][bit] ? ' active' : ''}"
                              data-who="${w}" data-bit="${bit}">${bit}</button>
                    `).join('')}
                  </div>
                  <div class="perm-octal-val">${octalFor(w)}</div>
                </div>
              `).join('')}
            </div>

            <div class="perm-output">
              <div class="perm-notations">
                <div class="perm-notation">
                  <span class="perm-label-sm">Symbolic</span>
                  <code class="perm-symbolic">-${symbolic()}</code>
                </div>
                <div class="perm-notation">
                  <span class="perm-label-sm">Octal</span>
                  <code class="perm-octal-code">${octal()}</code>
                </div>
              </div>
              <div class="perm-desc">${describe()}</div>
            </div>

            <div class="perm-presets">
              <span class="perm-presets-label">Common presets:</span>
              <button class="perm-preset" data-preset="755">755 — scripts &amp; directories</button>
              <button class="perm-preset" data-preset="644">644 — documents &amp; configs</button>
              <button class="perm-preset" data-preset="600">600 — private key / secret file</button>
              <button class="perm-preset" data-preset="444">444 — read-only for everyone</button>
              <button class="perm-preset" data-preset="777">777 — fully open (avoid!)</button>
            </div>
          </div>`;

        container.querySelectorAll('.perm-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            state[btn.dataset.who][btn.dataset.bit] = !state[btn.dataset.who][btn.dataset.bit];
            render();
          });
        });

        container.querySelectorAll('.perm-preset').forEach(btn => {
          btn.addEventListener('click', () => {
            const d = btn.dataset.preset.split('').map(Number);
            ['u', 'g', 'o'].forEach((w, i) => {
              state[w].r = !!(d[i] & 4);
              state[w].w = !!(d[i] & 2);
              state[w].x = !!(d[i] & 1);
            });
            render();
          });
        });
      }

      render();
    }
  };
})();
