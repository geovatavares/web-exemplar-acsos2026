# Web Exemplar Extension

The Web Exemplar is a browser-based implementation designed to instantiate the Human Safeguard Principle within the domain of web accessibility. It integrates automated adaptation with human-in-the-loop interaction to support runtime mitigation of accessibility issues directly on existing web pages.

The system follows a self-adaptive architecture inspired by the MAPE-K model, enabling continuous monitoring, analysis, planning, and execution of accessibility improvements over the Document Object Model (DOM).

---

## Overview

Many websites do not fully comply with accessibility requirements defined by the Web Content Accessibility Guidelines (WCAG 2.2).

The Web Exemplar addresses this problem by combining:

- automated accessibility adaptations
- human validation and refinement
- transparent interaction with the user

This approach enables adaptive accessibility improvements without requiring changes to the original application source code.

---

## Adaptation Model

The system operates using two complementary modes derived from the Human Safeguard Principle:

| Mode | Description |
|------|------------|
| Autonomous Mode | The system automatically detects and applies accessibility adaptations |
| Human-in-the-Loop Mode | The system requests user validation or allows manual refinement of adaptations |

This dual-mode approach ensures both efficiency and reliability in handling accessibility issues.

---

## Architecture

The Web Exemplar is implemented as a Chrome Extension (Manifest V3) and follows a modular architecture aligned with the conceptual model.
