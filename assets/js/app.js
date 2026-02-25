/* ============================================================
   ONIONSMAN — app.js
   · Theme management (light / dark / system cycle)
   · Blog post list rendering from manifest.json
   · Markdown post loading + rendering via marked.js
   ============================================================ */

(function () {
  'use strict';

  /* ── Helpers ─────────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ── Theme ───────────────────────────────────────────────── */
  const THEME_KEY = 'onionsman_theme';
  const THEMES = ['system', 'light', 'dark'];

  function getStoredTheme() {
    return localStorage.getItem(THEME_KEY) || 'system';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function cycleTheme() {
    const current = getStoredTheme();
    const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  // Apply immediately to prevent flash
  applyTheme(getStoredTheme());

  /* ── Year ────────────────────────────────────────────────── */
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Theme toggle button ─────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', cycleTheme);
  });

  /* ── Format helpers ──────────────────────────────────────── */
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function formatDateShort(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });
  }

  /* ── Determine current page ──────────────────────────────── */
  const path = window.location.pathname;
  const isIndex = path === '/' || path.endsWith('index.html') || path === '';
  const isPost = path.includes('post.html');
  const isProfile = path.includes('profile.html');

  /* ── Manifest base path (works on both root and subpaths) ── */
  const BASE = window.location.origin;

  /* ──────────────────────────────────────────────────────────
     BLOG LISTING
  ─────────────────────────────────────────────────────────── */
  if (isIndex) {
    document.addEventListener('DOMContentLoaded', () => {
      const list = document.getElementById('postList');
      if (!list) return;

      fetch('/posts/manifest.json')
        .then(r => r.json())
        .then(posts => {
          const loadingEl = document.getElementById('loadingState');
          if (loadingEl) loadingEl.remove();

          if (!posts.length) {
            list.innerHTML = '<p class="error-state">No posts yet. Check back soon.</p>';
            return;
          }

          posts.forEach((post, i) => {
            const a = document.createElement('a');
            a.href = `/post.html?slug=${post.slug}`;
            a.className = 'post-item';
            a.style.animationDelay = `${i * 60}ms`;
            a.setAttribute('aria-label', `${post.title} — ${post.tag}, ${formatDate(post.date)}, ${post.readTime} read`);

            a.innerHTML = `
              <div class="post-left">
                <span class="post-tag">${post.tag}</span>
                <p class="post-title">${post.title}</p>
              </div>
              <div class="post-meta">
                <span class="post-date">${formatDateShort(post.date)}</span>
                <span class="post-read-time">${post.readTime}</span>
              </div>
            `;

            list.appendChild(a);
          });
        })
        .catch(() => {
          const loadingEl = document.getElementById('loadingState');
          if (loadingEl) loadingEl.remove();
          list.innerHTML = `
            <p class="error-state">
              Could not load posts. Please try refreshing.
              <br>If you're running this locally, use a local server (e.g., <code>npx serve .</code>).
            </p>
          `;
        });
    });
  }

  /* ──────────────────────────────────────────────────────────
     PROFILE PAGE — recent posts
  ─────────────────────────────────────────────────────────── */
  if (isProfile) {
    document.addEventListener('DOMContentLoaded', () => {
      const list = document.getElementById('profilePostList');
      if (!list) return;

      fetch('/posts/manifest.json')
        .then(r => r.json())
        .then(posts => {
          const loadingEl = document.getElementById('loadingState');
          if (loadingEl) loadingEl.remove();

          const recent = posts.slice(0, 6);

          recent.forEach((post, i) => {
            const a = document.createElement('a');
            a.href = `/post.html?slug=${post.slug}`;
            a.className = 'post-item';
            a.style.animationDelay = `${i * 60}ms`;

            a.innerHTML = `
              <div class="post-left">
                <span class="post-tag">${post.tag}</span>
                <p class="post-title">${post.title}</p>
              </div>
              <div class="post-meta">
                <span class="post-date">${formatDateShort(post.date)}</span>
                <span class="post-read-time">${post.readTime}</span>
              </div>
            `;

            list.appendChild(a);
          });
        })
        .catch(() => {
          const loadingEl = document.getElementById('loadingState');
          if (loadingEl) loadingEl.remove();
          list.innerHTML = '<p class="error-state">Could not load posts.</p>';
        });
    });
  }

  /* ──────────────────────────────────────────────────────────
     INDIVIDUAL POST PAGE
  ─────────────────────────────────────────────────────────── */
  if (isPost) {
    document.addEventListener('DOMContentLoaded', () => {
      const contentEl = document.getElementById('postContent');
      if (!contentEl) return;

      const params = new URLSearchParams(window.location.search);
      const slug = params.get('slug');

      if (!slug) {
        contentEl.innerHTML = `
          <p class="error-state">
            No post found. <a href="/">Back to all posts</a>
          </p>`;
        return;
      }

      // Load manifest to get post metadata
      fetch('/posts/manifest.json')
        .then(r => r.json())
        .then(posts => {
          const meta = posts.find(p => p.slug === slug);

          // Load markdown file
          return fetch(`/posts/${slug}.md`).then(r => {
            if (!r.ok) throw new Error('Post not found');
            return r.text();
          }).then(md => ({ md, meta }));
        })
        .then(({ md, meta }) => {
          // Update page title
          if (meta) {
            document.title = `${meta.title} · Onionsman`;
          }

          // Remove loading state
          const loadingEl = document.getElementById('loadingState');
          if (loadingEl) loadingEl.remove();

          // Parse markdown — strip the H1 if present (we render it in the header)
          let body = md;
          // Remove leading h1 if the markdown starts with it
          body = body.replace(/^#\s+.+\n/, '');

          const htmlContent = typeof marked !== 'undefined'
            ? marked.parse(body)
            : `<pre>${body}</pre>`;

          const headerHTML = meta ? `
            <header class="post-article-header">
              <span class="post-article-tag">${meta.tag}</span>
              <h1 class="post-article-title">${meta.title}</h1>
              <div class="post-article-meta">
                <span>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
                    <path d="M5 1v3M11 1v3M2 7h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                  </svg>
                  ${formatDate(meta.date)}
                </span>
                <span>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.4"/>
                    <path d="M8 5v3.5l2 1.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                  </svg>
                  ${meta.readTime}
                </span>
                <span>Onionsman</span>
              </div>
            </header>
          ` : '';

          contentEl.innerHTML = `
            ${headerHTML}
            <div class="post-body">${htmlContent}</div>
          `;
        })
        .catch(() => {
          const loadingEl = document.getElementById('loadingState');
          if (loadingEl) loadingEl.remove();
          contentEl.innerHTML = `
            <p class="error-state">
              Post not found. <a href="/">Back to all posts</a>
            </p>`;
        });
    });
  }

})();
