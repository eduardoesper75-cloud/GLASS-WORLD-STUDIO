'use client';

import { useEffect } from 'react';

export function LegalStyles() {
  useEffect(() => {
    const styleId = 'gws-legal-styles';
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .legal {
        position: relative;
        min-height: 100dvh;
        background: radial-gradient(120% 120% at 50% 0%, rgba(89,212,255,0.08), rgba(5,8,12,1) 70%) #05080c;
        color: #f5f9ff;
      }
      .legal__hero {
        max-width: min(90vw, 72ch);
        margin: 0 auto;
        padding: clamp(2rem, 4vw, 4rem) clamp(1.25rem, 3vw, 2rem);
        display: flex;
        flex-direction: column;
        gap: clamp(2rem, 3vw, 3rem);
      }
      .legal__header {
        display: flex;
        flex-direction: column;
        gap: clamp(0.5rem, 1.5vw, 0.85rem);
      }
      .legal__eyebrow {
        margin: 0;
        font-size: clamp(0.68rem, 1.4vw, 0.78rem);
        letter-spacing: clamp(0.16em, 1.2vw, 0.24em);
        text-transform: uppercase;
        color: rgba(245,249,255,0.72);
      }
      .legal__title {
        margin: 0;
        font-size: clamp(1.5rem, 4.5vw, 2.5rem);
        line-height: 1.05;
        letter-spacing: -0.02em;
      }
      .legal__subtitle {
        margin: 0;
        font-size: clamp(0.95rem, 2vw, 1.15rem);
        color: rgba(245,249,255,0.86);
      }
      .legal__effective {
        margin: 0;
        font-size: clamp(0.85rem, 1.8vw, 0.95rem);
        color: rgba(245,249,255,0.64);
      }
      .legal__body {
        display: flex;
        flex-direction: column;
        gap: clamp(1.5rem, 2.5vw, 2.25rem);
      }
      .legal__section {
        display: flex;
        flex-direction: column;
        gap: clamp(0.65rem, 1.5vw, 0.85rem);
        padding: clamp(1.25rem, 2.5vw, 1.75rem);
        border-radius: clamp(12px, 2vw, 16px);
        border: 1px solid rgba(89,212,255,0.18);
        background: radial-gradient(120% 140% at 50% 0%, rgba(89,212,255,0.12), rgba(5,8,12,0.78) 100%);
        box-shadow: 0 60px 180px -80px rgba(89,212,255,0.45);
      }
      .legal__section h2 {
        margin: 0;
        font-size: clamp(1.05rem, 2.2vw, 1.35rem);
      }
      .legal__section p {
        margin: 0;
        line-height: 1.75;
        color: rgba(245,249,255,0.88);
      }
      .legal__section ul {
        margin: 0;
        padding-left: clamp(1rem, 2vw, 1.5rem);
        display: flex;
        flex-direction: column;
        gap: clamp(0.5rem, 1.5vw, 0.75rem);
        color: rgba(245,249,255,0.88);
      }
      .legal__section li {
        line-height: 1.7;
      }
      .legal__footer {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: clamp(0.75rem, 1.5vw, 1rem);
      }
      .legal__nav {
        display: flex;
        flex-wrap: wrap;
        gap: clamp(0.5rem, 1.5vw, 0.75rem);
      }
      .legal__nav a {
        padding: 0.4rem 0.85rem;
        border-radius: 999px;
        border: 1px solid rgba(89,212,255,0.28);
        background: rgba(5,8,12,0.56);
        color: #f5f9ff;
        text-decoration: none;
        transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
      }
      .legal__nav a:hover {
        transform: translateY(-1px);
        border-color: rgba(89,212,255,0.52);
        background: rgba(5,8,12,0.72);
      }
      .legal__nav a:focus-visible {
        outline: 2px solid rgba(89,212,255,0.85);
        outline-offset: 2px;
      }
      .privacy-consent {
        position: fixed;
        inset: 0;
        z-index: 50;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding: clamp(1rem, 2vw, 1.5rem);
      }
      .privacy-consent__backdrop {
        position: absolute;
        inset: 0;
        background: rgba(5,8,12,0.72);
        backdrop-filter: blur(4px);
      }
      .privacy-consent__panel {
        position: relative;
        width: min(96vw, 880px);
        max-height: min(92dvh, 720px);
        overflow: auto;
        border-radius: clamp(16px, 2vw, 20px);
        border: 1px solid rgba(89,212,255,0.28);
        background: radial-gradient(120% 140% at 50% 0%, rgba(89,212,255,0.16), rgba(5,8,12,0.96) 100%);
        box-shadow: 0 120px 320px -120px rgba(89,212,255,0.65);
      }
      .privacy-consent__header {
        padding: clamp(1.25rem, 2vw, 1.75rem) clamp(1.25rem, 2vw, 1.75rem) 0;
      }
      .privacy-consent__header h2 {
        margin: 0;
        font-size: clamp(1.05rem, 2vw, 1.35rem);
      }
      .privacy-consent__body {
        padding: clamp(1rem, 2vw, 1.25rem) clamp(1.25rem, 2vw, 1.75rem) clamp(1.25rem, 2vw, 1.75rem);
        display: flex;
        flex-direction: column;
        gap: clamp(1rem, 2vw, 1.5rem);
      }
      .privacy-consent__body p {
        margin: 0;
        line-height: 1.7;
        color: rgba(245,249,255,0.88);
      }
      .privacy-consent__links {
        display: flex;
        flex-wrap: wrap;
        gap: clamp(0.4rem, 1.5vw, 0.6rem);
      }
      .privacy-consent__links a {
        color: rgba(89,212,255,0.96);
        text-decoration: none;
      }
      .privacy-consent__links a:hover {
        text-decoration: underline;
      }
      .privacy-consent__form {
        display: flex;
        flex-direction: column;
        gap: clamp(1rem, 2vw, 1.25rem);
      }
      .privacy-consent__group {
        display: flex;
        flex-direction: column;
        gap: clamp(0.5rem, 1.5vw, 0.75rem);
        border: 1px solid rgba(89,212,255,0.18);
        border-radius: clamp(12px, 2vw, 14px);
        padding: clamp(0.75rem, 2vw, 1rem);
        background: rgba(5,8,12,0.48);
      }
      .privacy-consent__group legend {
        padding: 0 0.4rem;
        font-weight: 600;
      }
      .privacy-consent__item {
        display: flex;
        align-items: flex-start;
        gap: clamp(0.5rem, 1.5vw, 0.75rem);
      }
      .privacy-consent__item input {
        margin-top: clamp(0.15rem, 0.4vw, 0.25rem);
      }
      .privacy-consent__item span {
        line-height: 1.65;
        color: rgba(245,249,255,0.92);
      }
      .privacy-consent__actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: clamp(0.5rem, 1.5vw, 0.75rem);
      }
      @media (max-width: 640px) {
        .privacy-consent {
          align-items: flex-end;
        }
        .privacy-consent__actions {
          justify-content: stretch;
        }
        .privacy-consent__actions .btn {
          flex: 1 1 auto;
          justify-content: center;
        }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return null;
}
