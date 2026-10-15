'use client';

import { useEffect } from 'react';

export function AnnouncementStyles() {
  useEffect(() => {
    const styleId = 'gws-announcement-styles';
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .announcement {
        position: relative;
        min-height: 100dvh;
        background: radial-gradient(120% 120% at 50% 0%, rgba(89,212,255,0.08), rgba(5,8,12,1) 70%) #05080c;
        color: #f5f9ff;
      }
      .announcement__hero {
        max-width: min(90vw, 74ch);
        margin: 0 auto;
        padding: clamp(2rem, 4vw, 4rem) clamp(1.25rem, 3vw, 2rem);
        display: flex;
        flex-direction: column;
        gap: clamp(2rem, 3vw, 3rem);
      }
      .announcement__header {
        display: flex;
        flex-direction: column;
        gap: clamp(0.5rem, 1.5vw, 0.85rem);
      }
      .announcement__eyebrow {
        margin: 0;
        font-size: clamp(0.68rem, 1.4vw, 0.78rem);
        letter-spacing: clamp(0.16em, 1.2vw, 0.24em);
        text-transform: uppercase;
        color: rgba(245,249,255,0.72);
      }
      .announcement__title {
        margin: 0;
        font-size: clamp(1.6rem, 5vw, 2.75rem);
        line-height: 1.05;
        letter-spacing: -0.02em;
      }
      .announcement__effective {
        margin: 0;
        font-size: clamp(0.85rem, 1.8vw, 0.95rem);
        color: rgba(245,249,255,0.64);
      }
      .announcement__lead {
        display: flex;
        flex-direction: column;
        gap: clamp(1rem, 2vw, 1.35rem);
        padding: clamp(1.5rem, 3vw, 2.25rem);
        border-radius: clamp(14px, 2vw, 20px);
        border: 1px solid rgba(89,212,255,0.28);
        background: radial-gradient(120% 140% at 50% 0%, rgba(89,212,255,0.16), rgba(5,8,12,0.82) 100%);
        box-shadow: 0 80px 220px -100px rgba(89,212,255,0.55);
      }
      .announcement__lead p {
        margin: 0;
        font-size: clamp(1.02rem, 2.1vw, 1.22rem);
        line-height: 1.85;
        color: rgba(245,249,255,0.94);
      }
      .announcement__body {
        display: flex;
        flex-direction: column;
        gap: clamp(1.5rem, 2.5vw, 2.25rem);
      }
      .announcement__section {
        display: flex;
        flex-direction: column;
        gap: clamp(0.65rem, 1.5vw, 0.85rem);
        padding: clamp(1.25rem, 2.5vw, 1.75rem);
        border-radius: clamp(12px, 2vw, 16px);
        border: 1px solid rgba(89,212,255,0.18);
        background: radial-gradient(120% 140% at 50% 0%, rgba(89,212,255,0.12), rgba(5,8,12,0.78) 100%);
        box-shadow: 0 60px 180px -80px rgba(89,212,255,0.45);
      }
      .announcement__section h2 {
        margin: 0;
        font-size: clamp(1.05rem, 2.2vw, 1.4rem);
      }
      .announcement__section p {
        margin: 0;
        line-height: 1.78;
        color: rgba(245,249,255,0.88);
      }
      .announcement__section ul {
        margin: 0;
        padding-left: clamp(1rem, 2vw, 1.5rem);
        display: flex;
        flex-direction: column;
        gap: clamp(0.5rem, 1.5vw, 0.75rem);
        color: rgba(245,249,255,0.9);
      }
      .announcement__section li {
        line-height: 1.72;
      }
      .announcement__list {
        display: grid;
        gap: clamp(1rem, 2vw, 1.5rem);
      }
      .announcement-card {
        display: flex;
        flex-direction: column;
        gap: clamp(0.5rem, 1.5vw, 0.75rem);
        padding: clamp(1.25rem, 2.5vw, 1.75rem);
        border-radius: clamp(12px, 2vw, 16px);
        border: 1px solid rgba(89,212,255,0.2);
        background: radial-gradient(120% 140% at 50% 0%, rgba(89,212,255,0.12), rgba(5,8,12,0.78) 100%);
        color: inherit;
        text-decoration: none;
        transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
      }
      .announcement-card:hover {
        transform: translateY(-2px);
        border-color: rgba(89,212,255,0.5);
        box-shadow: 0 60px 180px -80px rgba(89,212,255,0.6);
      }
      .announcement-card:focus-visible {
        outline: 2px solid rgba(89,212,255,0.85);
        outline-offset: 3px;
      }
      .announcement-card__eyebrow {
        font-size: clamp(0.65rem, 1.3vw, 0.75rem);
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: rgba(245,249,255,0.66);
      }
      .announcement-card__title {
        font-size: clamp(1.15rem, 2.6vw, 1.6rem);
        line-height: 1.2;
        color: #f5f9ff;
      }
      .announcement-card__excerpt {
        line-height: 1.7;
        color: rgba(245,249,255,0.82);
      }
      .announcement-card__meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        margin-top: 0.25rem;
        font-size: clamp(0.8rem, 1.6vw, 0.9rem);
        color: rgba(245,249,255,0.62);
      }
      .announcement-card__cta {
        color: rgba(89,212,255,0.96);
      }
      .announcement__closing {
        margin: 0;
        padding: clamp(1.25rem, 2.5vw, 1.75rem);
        border-radius: clamp(12px, 2vw, 16px);
        border-left: 3px solid rgba(89,212,255,0.72);
        background: rgba(5,8,12,0.6);
        font-size: clamp(1.05rem, 2.2vw, 1.3rem);
        line-height: 1.6;
        color: #f5f9ff;
      }
      .announcement__signature {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        color: rgba(245,249,255,0.9);
      }
      .announcement__signature strong {
        color: #f5f9ff;
      }
      .announcement__signature a {
        color: rgba(89,212,255,0.96);
        text-decoration: none;
        width: fit-content;
      }
      .announcement__signature a:hover {
        text-decoration: underline;
      }
      .announcement__footer {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: clamp(0.75rem, 1.5vw, 1rem);
      }
      .announcement__nav {
        display: flex;
        flex-wrap: wrap;
        gap: clamp(0.5rem, 1.5vw, 0.75rem);
      }
      .announcement__nav a {
        padding: 0.4rem 0.85rem;
        border-radius: 999px;
        border: 1px solid rgba(89,212,255,0.28);
        background: rgba(5,8,12,0.56);
        color: #f5f9ff;
        text-decoration: none;
        transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
      }
      .announcement__nav a:hover {
        transform: translateY(-1px);
        border-color: rgba(89,212,255,0.52);
        background: rgba(5,8,12,0.72);
      }
      .announcement__nav a:focus-visible {
        outline: 2px solid rgba(89,212,255,0.85);
        outline-offset: 2px;
      }
      @media (prefers-reduced-motion: reduce) {
        .announcement__nav a,
        .announcement-card {
          transition: none;
        }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return null;
}
