(function () {
  'use strict';
  window.IDC = window.IDC || { widgets: {} };

  window.IDC.widgets['shell-sim'] = {
    render(container) {

      // ── Virtual Filesystem ────────────────────────────────────────
      const vfs = {
        type:'dir', name:'/',
        children:{
          home:{type:'dir',name:'home',children:{
            student:{type:'dir',name:'student',children:{
              'readme.txt':{type:'file',name:'readme.txt',size:72,perms:'-rw-r--r--',
                content:'Welcome to your Linux home directory.\nThis is where your personal files live.'},
              documents:{type:'dir',name:'documents',children:{
                'report.txt':{type:'file',name:'report.txt',size:89,perms:'-rw-r--r--',
                  content:'Q1 Sales Report\n===============\nTotal revenue: $142,000\nNew accounts: 17\nRegion: Midwest'},
                'notes.txt':{type:'file',name:'notes.txt',size:114,perms:'-rw-r--r--',
                  content:'Meeting notes — 2026-04-15\n--------------------------\n- Update server configs\n- Review backup logs\n- Schedule maintenance window'},
              }},
              downloads:{type:'dir',name:'downloads',children:{
                'ubuntu-24.04.iso':{type:'file',name:'ubuntu-24.04.iso',size:1257963520,perms:'-rw-r--r--',
                  content:'[Binary ISO image — not a text file]'},
              }},
              scripts:{type:'dir',name:'scripts',children:{
                'backup.sh':{type:'file',name:'backup.sh',size:78,perms:'-rwxr-xr-x',
                  content:'#!/bin/bash\n# Daily backup script\ntar -czf /backup/home.tar.gz /home/student\necho "Backup complete."'},
              }},
            }}
          }},
          etc:{type:'dir',name:'etc',children:{
            'hosts':{type:'file',name:'hosts',size:58,perms:'-rw-r--r--',
              content:'127.0.0.1     localhost\n192.168.1.10  fileserver\n192.168.1.20  webserver'},
            'passwd':{type:'file',name:'passwd',size:72,perms:'-rw-r--r--',
              content:'root:x:0:0:root:/root:/bin/bash\nstudent:x:1000:1000::/home/student:/bin/bash'},
          }},
          var:{type:'dir',name:'var',children:{
            log:{type:'dir',name:'log',children:{
              'syslog':{type:'file',name:'syslog',size:2048,perms:'-rw-r-----',
                content:'May  8 09:14:01 linux systemd[1]: Started Daily apt upgrade.\nMay  8 09:22:44 linux sshd[2891]: Accepted publickey for student from 10.0.0.5\nMay  8 09:55:18 linux kernel: eth0: Link is Up'},
            }}
          }},
          usr:{type:'dir',name:'usr',children:{
            bin:{type:'dir',name:'bin',children:{}},
            local:{type:'dir',name:'local',children:{}},
          }},
        }
      };

      let cwd = ['home', 'student'];

      // ── Filesystem helpers ────────────────────────────────────────
      function getNode(pathArr) {
        let node = vfs;
        for (const p of pathArr) {
          if (!node.children || !(p in node.children)) return null;
          node = node.children[p];
        }
        return node;
      }

      function resolvePath(raw) {
        if (!raw || raw === '~') return ['home', 'student'];
        let parts;
        if (raw.startsWith('/')) {
          parts = raw.split('/').filter(Boolean);
        } else if (raw.startsWith('~/')) {
          parts = ['home', 'student', ...raw.slice(2).split('/').filter(Boolean)];
        } else {
          parts = [...cwd, ...raw.split('/').filter(Boolean)];
        }
        const out = [];
        for (const p of parts) {
          if (p === '.') continue;
          if (p === '..') { out.pop(); }
          else out.push(p);
        }
        return out;
      }

      function cwdStr() {
        const full = '/' + cwd.join('/');
        if (full === '/home/student') return '~';
        if (full.startsWith('/home/student/')) return '~' + full.slice('/home/student'.length);
        return full || '/';
      }

      function ps1() { return 'student@linux:' + cwdStr() + '$ '; }

      // ── Commands ──────────────────────────────────────────────────
      function runCmd(raw) {
        const tokens = raw.trim().split(/\s+/);
        const cmd = tokens[0];

        switch (cmd) {
          case 'pwd': {
            return '/' + cwd.join('/') || '/';
          }

          case 'ls': {
            const longFmt = tokens.some(t => t.startsWith('-') && t.includes('l'));
            const argParts = tokens.slice(1).filter(t => !t.startsWith('-'));
            const targetPath = argParts.length ? resolvePath(argParts[0]) : cwd;
            const node = getNode(targetPath);
            if (!node) return `ls: cannot access '${argParts[0]}': No such file or directory`;
            if (node.type === 'file') {
              if (longFmt) return `${node.perms}  1 student student  ${String(node.size).padStart(7)}  May  8 09:14  ${node.name}`;
              return node.name;
            }
            const entries = Object.values(node.children || {}).sort((a, b) => a.name.localeCompare(b.name));
            if (!entries.length) return '';
            if (longFmt) {
              const lines = ['total ' + entries.length];
              for (const e of entries) {
                const p = e.perms || (e.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--');
                const s = e.type === 'dir' ? 4096 : (e.size || 0);
                lines.push(`${p}  1 student student  ${String(s).padStart(7)}  May  8 09:14  ${e.name}`);
              }
              return lines.join('\n');
            }
            return entries.map(e => e.type === 'dir' ? e.name + '/' : e.name).join('  ');
          }

          case 'cd': {
            const arg = tokens[1];
            const targetPath = arg ? resolvePath(arg) : ['home', 'student'];
            const node = getNode(targetPath);
            if (!node) return `cd: ${arg}: No such file or directory`;
            if (node.type !== 'dir') return `cd: ${arg}: Not a directory`;
            cwd = targetPath;
            return '';
          }

          case 'cat': {
            if (tokens.length < 2) return 'cat: missing operand';
            const node = getNode(resolvePath(tokens[1]));
            if (!node) return `cat: ${tokens[1]}: No such file or directory`;
            if (node.type === 'dir') return `cat: ${tokens[1]}: Is a directory`;
            return node.content || '';
          }

          case 'mkdir': {
            if (tokens.length < 2) return 'mkdir: missing operand';
            const tp = resolvePath(tokens[1]);
            const parent = getNode(tp.slice(0, -1));
            const name = tp[tp.length - 1];
            if (!parent || parent.type !== 'dir') return `mkdir: cannot create directory '${tokens[1]}': No such file or directory`;
            if (parent.children[name]) return `mkdir: cannot create directory '${tokens[1]}': File exists`;
            parent.children[name] = { type: 'dir', name, children: {} };
            return '';
          }

          case 'touch': {
            if (tokens.length < 2) return 'touch: missing file operand';
            const tp = resolvePath(tokens[1]);
            const parent = getNode(tp.slice(0, -1));
            const name = tp[tp.length - 1];
            if (!parent || parent.type !== 'dir') return `touch: cannot touch '${tokens[1]}': No such file or directory`;
            if (!parent.children[name]) {
              parent.children[name] = { type: 'file', name, size: 0, perms: '-rw-r--r--', content: '' };
            }
            return '';
          }

          case 'cp': {
            if (tokens.length < 3) return 'cp: missing operand';
            const srcPath = resolvePath(tokens[1]);
            const src = getNode(srcPath);
            if (!src) return `cp: cannot stat '${tokens[1]}': No such file or directory`;
            if (src.type === 'dir') return `cp: omitting directory '${tokens[1]}' — use -r to copy directories`;
            const dstPath = resolvePath(tokens[2]);
            const dstNode = getNode(dstPath);
            let dstParent, dstName;
            if (dstNode && dstNode.type === 'dir') {
              dstParent = dstNode; dstName = src.name;
            } else {
              dstParent = getNode(dstPath.slice(0, -1));
              dstName = dstPath[dstPath.length - 1];
            }
            if (!dstParent) return `cp: cannot create file '${tokens[2]}': No such file or directory`;
            dstParent.children[dstName] = { ...src, name: dstName };
            return '';
          }

          case 'mv': {
            if (tokens.length < 3) return 'mv: missing operand';
            const srcPath = resolvePath(tokens[1]);
            const srcParent = getNode(srcPath.slice(0, -1));
            const srcName = srcPath[srcPath.length - 1];
            if (!srcParent || !srcParent.children[srcName]) return `mv: cannot stat '${tokens[1]}': No such file or directory`;
            const src = srcParent.children[srcName];
            const dstPath = resolvePath(tokens[2]);
            const dstNode = getNode(dstPath);
            let dstParent, dstName;
            if (dstNode && dstNode.type === 'dir') {
              dstParent = dstNode; dstName = srcName;
            } else {
              dstParent = getNode(dstPath.slice(0, -1));
              dstName = dstPath[dstPath.length - 1];
            }
            if (!dstParent) return `mv: cannot move '${tokens[1]}' to '${tokens[2]}': No such file or directory`;
            dstParent.children[dstName] = { ...src, name: dstName };
            delete srcParent.children[srcName];
            return '';
          }

          case 'rm': {
            if (tokens.length < 2) return 'rm: missing operand';
            const hasR = tokens.some(t => t.startsWith('-') && t.includes('r'));
            const tgt = tokens.find(t => !t.startsWith('-') && t !== 'rm');
            if (!tgt) return 'rm: missing operand';
            const tp = resolvePath(tgt);
            const parent = getNode(tp.slice(0, -1));
            const name = tp[tp.length - 1];
            if (!parent || !parent.children[name]) return `rm: cannot remove '${tgt}': No such file or directory`;
            const node = parent.children[name];
            if (node.type === 'dir' && !hasR) return `rm: cannot remove '${tgt}': Is a directory (use -r to remove)`;
            delete parent.children[name];
            return '';
          }

          case 'echo':
            return tokens.slice(1).join(' ');

          case 'whoami':
            return 'student';

          case 'hostname':
            return 'linux';

          case 'clear':
            return '__CLEAR__';

          case 'help':
            return [
              'Available commands:',
              '  pwd              print working directory',
              '  ls [-l] [path]   list directory contents',
              '  cd [path]        change directory  (cd ~ returns home)',
              '  cat <file>       print file contents to screen',
              '  mkdir <dir>      create a new directory',
              '  touch <file>     create an empty file',
              '  cp <src> <dst>   copy a file',
              '  mv <src> <dst>   move or rename a file',
              '  rm [-r] <path>   remove a file or directory',
              '  echo <text>      print text',
              '  whoami           print current username',
              '  clear            clear the terminal',
              '  help             show this message',
            ].join('\n');

          default:
            return `${cmd}: command not found — type 'help' for available commands`;
        }
      }

      // ── Build UI ──────────────────────────────────────────────────
      const uid = 'ss-' + Math.random().toString(36).slice(2, 7);
      container.innerHTML = `
        <div class="shell-sim" id="${uid}-wrap">
          <div class="shell-titlebar">
            <span class="shell-dot" style="background:#FF5F57"></span>
            <span class="shell-dot" style="background:#FFBD2E"></span>
            <span class="shell-dot" style="background:#28C840"></span>
            <span class="shell-title" id="${uid}-title">student@linux: ~</span>
          </div>
          <div class="shell-output" id="${uid}-out"></div>
          <div class="shell-input-row">
            <span class="shell-ps1" id="${uid}-ps1"></span>
            <input class="shell-input" id="${uid}-in" type="text"
              autocomplete="off" spellcheck="false" autocorrect="off" autocapitalize="none" />
          </div>
        </div>`;

      const wrap    = document.getElementById(uid + '-wrap');
      const outEl   = document.getElementById(uid + '-out');
      const ps1El   = document.getElementById(uid + '-ps1');
      const inEl    = document.getElementById(uid + '-in');
      const titleEl = document.getElementById(uid + '-title');

      const hist = []; let hi = -1;

      function updatePs1() {
        ps1El.textContent = ps1();
        titleEl.textContent = 'student@linux: ' + cwdStr();
      }

      function addLine(text, cls) {
        const d = document.createElement('div');
        d.className = 'shell-line' + (cls ? ' ' + cls : '');
        d.textContent = text;
        outEl.appendChild(d);
      }

      function submit(raw) {
        addLine(ps1() + raw, 'shell-echo');
        if (raw.trim()) {
          hist.unshift(raw); hi = -1;
          const result = runCmd(raw);
          if (result === '__CLEAR__') {
            outEl.innerHTML = '';
          } else if (result) {
            result.split('\n').forEach(l => addLine(l, 'shell-result'));
          }
        }
        updatePs1();
        outEl.scrollTop = outEl.scrollHeight;
      }

      addLine('Linux Shell Simulator — type "help" for available commands', 'shell-info');
      addLine('Tip: start with  ls  or  cat readme.txt', 'shell-info');
      updatePs1();

      inEl.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          const v = inEl.value; inEl.value = ''; submit(v);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (hi < hist.length - 1) { hi++; inEl.value = hist[hi]; }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (hi > 0) { hi--; inEl.value = hist[hi]; }
          else { hi = -1; inEl.value = ''; }
        }
      });

      wrap.addEventListener('click', () => inEl.focus());
      inEl.focus();
    }
  };
})();
