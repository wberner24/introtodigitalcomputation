# Introduction to Digital Computation
### A First-Principles Approach

**Author:** Wade Berner  
**Institution:** Southern Illinois University Edwardsville  
**Course:** ITEC 121

---

## About

An open, interactive, web-based textbook for an introductory IT/Information Systems course. Built as a standalone static site — no frameworks, no build tools, no backend. Vanilla HTML, CSS, and JavaScript.

## Structure

```
introtodigitalcomputation/
├── index.html              ← Landing page / table of contents
├── css/
│   └── main.css            ← Full design system and component styles
├── js/
│   └── main.js             ← Shared utilities, widget loader, quiz helpers
├── chapters/
│   ├── ch01.html           ← Chapter 1: Binary
│   └── ...                 ← Chapters 2–14 (in progress)
└── widgets/
    ├── binary-converter.js ← Bidirectional binary ↔ decimal converter
    └── ...                 ← Additional interactive widgets per chapter
```

## Chapter Map

| Unit | Chapter | Title |
|------|---------|-------|
| 1 — Foundations | 1 | Binary |
| | 2 | Physical Bits |
| | 3 | Data Representation |
| 2 — Hardware | 4 | Processors |
| | 5 | Memory & Storage |
| | 6 | I/O & System Architecture |
| 3 — Software | 7 | System vs. Application Software |
| | 8 | Operating Systems |
| | 9 | File Systems & Directory Services |
| 4 — Networks | 10 | Networking Fundamentals |
| | 11 | Network Architecture & Communication |
| 5 — Administration | 12 | System Administration Fundamentals |
| | 13 | Virtualization & Cloud Computing |
| | 14 | Putting It All Together |

## Running Locally

No server required. Clone the repo and open `index.html` in any browser.

```bash
git clone git@github.com:wberner24/introtodigitalcomputation.git
cd introtodigitalcomputation
open index.html
```

## Live Site

Hosted via GitHub Pages:  
[https://wberner24.github.io/introtodigitalcomputation/](https://wberner24.github.io/introtodigitalcomputation/)

## License

&copy; 2025 Wade Berner. All rights reserved.
