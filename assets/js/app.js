(function () {
  'use strict';

  const THEME_KEY = 'onionsman_theme';
  const THEMES = ['system', 'light', 'dark'];

  function getStoredTheme() { return localStorage.getItem(THEME_KEY) || 'system'; }
  function applyTheme(theme) { document.documentElement.setAttribute('data-theme', theme); }
  function cycleTheme() {
    const next = THEMES[(THEMES.indexOf(getStoredTheme()) + 1) % THEMES.length];
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  applyTheme(getStoredTheme());

  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', cycleTheme);
  });

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function formatDateShort(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  }

  const POSTS = [
    { slug: "nigerians-vanity-obsessed", title: "Nigerians are Vanity obsessed", tag: "opinion", date: "2025-04-30", readTime: "5 min" },
    { slug: "bug-bounty-program", title: "Why Every Tech, Fintech, and Bank Needs a Bug Bounty Program — Immediately", tag: "tech", date: "2025-03-29", readTime: "7 min" },
    { slug: "value", title: "Value", tag: "opinion", date: "2025-02-18", readTime: "4 min" },
    { slug: "blockchainful24", title: "Over 600 students learnt \"Proof of Work\" during BlockchainFUL24 in Nigeria", tag: "event", date: "2024-08-01", readTime: "6 min" },
    { slug: "monierate-discussion", title: "A discussion about Monierate progress, future outlook and Blockchain regulation in Nigeria", tag: "update", date: "2024-06-07", readTime: "8 min" },
    { slug: "bitcoin-everyday-use", title: "How to use Bitcoin and blockchain for everyday use in Nigeria and Africa", tag: "guide", date: "2024-06-02", readTime: "9 min" },
    { slug: "african-bitcoin-day-2024", title: "African Bitcoin Day 2024", tag: "event", date: "2024-05-29", readTime: "4 min" },
    { slug: "monierate-200k", title: "Monierate hits 200,000 average Monthly visitors one year after launch", tag: "milestone", date: "2024-05-10", readTime: "7 min" },
    { slug: "fintech-week-2023", title: "Hosted Over 8,000 People at Fintech Week 2023", tag: "event", date: "2023-12-24", readTime: "5 min" },
    { slug: "survivor-mode", title: "'Survivor mode' will never let you build legacy that outlives you", tag: "opinion", date: "2023-11-24", readTime: "6 min" }
  ];

  const BASE_PATH = (function() {
    const scripts = document.querySelectorAll('script[src]');
    for (const s of scripts) {
      if (s.src.includes('app.js')) {
        return s.src.replace('assets/js/app.js', '');
      }
    }
    return window.location.href.replace(/[^/]*$/, '');
  })();

  function renderPostList(container, posts) {
    const loadingEl = container.querySelector('.loading-state') || document.getElementById('loadingState');
    if (loadingEl) loadingEl.remove();
    posts.forEach((post, i) => {
      const a = document.createElement('a');
      a.href = BASE_PATH + 'post.html?slug=' + post.slug;
      a.className = 'post-item';
      a.style.animationDelay = (i * 60) + 'ms';
      a.innerHTML = `
        <div class="post-left">
          <span class="post-tag">${post.tag}</span>
          <p class="post-title">${post.title}</p>
        </div>
        <div class="post-meta">
          <span class="post-date">${formatDateShort(post.date)}</span>
          <span class="post-read-time">${post.readTime}</span>
        </div>`;
      container.appendChild(a);
    });
  }

  const path = window.location.pathname;
  const isIndex = path === '/' || path.endsWith('/') || path.endsWith('index.html');
  const isPost = path.includes('post.html');
  const isProfile = path.includes('profile.html');

  document.addEventListener('DOMContentLoaded', () => {

    if (isIndex) {
      const list = document.getElementById('postList');
      if (list) renderPostList(list, POSTS);
    }

    if (isProfile) {
      const list = document.getElementById('profilePostList');
      if (list) renderPostList(list, POSTS.slice(0, 6));
    }

    if (isPost) {
      const contentEl = document.getElementById('postContent');
      if (!contentEl) return;

      const params = new URLSearchParams(window.location.search);
      const slug = params.get('slug');
      if (!slug) {
        contentEl.innerHTML = '<p class="error-state">No post found. <a href="' + BASE_PATH + '">Back to all posts</a></p>';
        return;
      }

      const meta = POSTS.find(p => p.slug === slug);
      if (meta) document.title = meta.title + ' · Onionsman';

      fetch(BASE_PATH + 'posts/' + slug + '.md')
        .then(r => { if (!r.ok) throw new Error('not found'); return r.text(); })
        .then(md => {
          const loadingEl = document.getElementById('loadingState');
          if (loadingEl) loadingEl.remove();
          const body = md.replace(/^#\s+.+\n/, '');
          const htmlContent = typeof marked !== 'undefined' ? marked.parse(body) : '<pre>' + body + '</pre>';
          const headerHTML = meta ? `
            <header class="post-article-header">
              <span class="post-article-tag">${meta.tag}</span>
              <h1 class="post-article-title">${meta.title}</h1>
              <div class="post-article-meta">
                <span>${formatDate(meta.date)}</span>
                <span>${meta.readTime}</span>
                <span>Onionsman</span>
              </div>
            </header>` : '';
          contentEl.innerHTML = headerHTML + '<div class="post-body">' + htmlContent + '</div>';
        })
        .catch(() => {
          const loadingEl = document.getElementById('loadingState');
          if (loadingEl) loadingEl.remove();
          contentEl.innerHTML = '<p class="error-state">Post not found. <a href="' + BASE_PATH + '">Back to all posts</a></p>';
        });
    }
  });
})();
