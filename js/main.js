/* ============================================================
   INTRODUCTION TO DIGITAL COMPUTATION
   main.js — Shared utilities and widget loader
   ============================================================ */

'use strict';

// ── Widget Registry ──────────────────────────────────────────
const widgets = {};

// ── Init on DOM Ready ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  highlightCurrentChapter();
  renderAllWidgets();
  initSectionAnchors();
});

// ── Sidebar: Highlight current chapter ───────────────────────
function highlightCurrentChapter() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-chapter').forEach(link => {
    const href = link.getAttribute('href');
    if (href && path.endsWith(href)) {
      link.classList.add('active');
    }
  });
}

// ── Widget Loader ─────────────────────────────────────────────
function renderAllWidgets() {
  document.querySelectorAll('[data-widget]').forEach(el => {
    const name = el.dataset.widget;
    if (widgets[name] && typeof widgets[name].render === 'function') {
      widgets[name].render(el);
    } else {
      el.innerHTML = `<div class="widget-card" style="opacity:0.5;font-family:var(--font-mono);font-size:0.8rem;color:var(--ink-light);">
        Widget <strong>${name}</strong> not loaded.
      </div>`;
    }
  });
}

// ── Section Anchors ───────────────────────────────────────────
function initSectionAnchors() {
  document.querySelectorAll('.prose h2, .prose h3').forEach(heading => {
    if (!heading.id) {
      heading.id = heading.textContent
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim();
    }
    const anchor = document.createElement('a');
    anchor.href = '#' + heading.id;
    anchor.className = 'section-anchor';
    anchor.setAttribute('aria-label', 'Link to section');
    anchor.innerHTML = ' #';
    anchor.style.cssText = `
      font-family: var(--font-mono);
      font-size: 0.75em;
      color: var(--border-dark);
      text-decoration: none;
      margin-left: 8px;
      opacity: 0;
      transition: opacity 0.15s;
    `;
    heading.addEventListener('mouseenter', () => anchor.style.opacity = '1');
    heading.addEventListener('mouseleave', () => anchor.style.opacity = '0');
    heading.appendChild(anchor);
  });
}

// ── Quiz Helper ───────────────────────────────────────────────
// Normalizes answers for comparison
function normalizeAnswer(str) {
  return str.trim().toLowerCase().replace(/\s+/g, '');
}

// Checks a single text-input quiz question
// el: the question container div.quiz-question
// correctAnswers: array of acceptable strings
function checkTextAnswer(el, correctAnswers) {
  const input = el.querySelector('input[type="text"]');
  const feedback = el.querySelector('.q-feedback');
  if (!input || !feedback) return;

  const userVal = normalizeAnswer(input.value);
  const accepted = correctAnswers.map(a => normalizeAnswer(String(a)));

  feedback.classList.remove('correct', 'incorrect', 'hint');

  if (!userVal) {
    feedback.className = 'q-feedback hint';
    feedback.textContent = 'Enter an answer above.';
    return;
  }

  if (accepted.includes(userVal)) {
    feedback.className = 'q-feedback correct';
    feedback.textContent = '✓ Correct!';
  } else {
    feedback.className = 'q-feedback incorrect';
    feedback.textContent = `✗ Not quite. Try again.`;
  }
}

// Reveals the correct answer after a wrong attempt
function revealAnswer(el, answer) {
  const feedback = el.querySelector('.q-feedback');
  if (!feedback) return;
  feedback.className = 'q-feedback hint';
  feedback.textContent = `Answer: ${answer}`;
}

// Export helpers for widget scripts
window.IDC = { widgets, checkTextAnswer, revealAnswer, normalizeAnswer };
