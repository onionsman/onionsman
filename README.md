# Onionsman — Personal Blog

> Vulnerable opinion shaping survival, experience, and humanity.

A clean, fast, static blog built with [oat.ink](https://oat.ink) CSS framework and vanilla JS. Designed to be hosted on **GitHub Pages** with the custom domain **onionsman.com**.

---

## Tech Stack

| Layer | Tool |
|---|---|
| CSS Framework | [oat.ink](https://oat.ink) via unpkg CDN |
| Markdown Rendering | [marked.js](https://marked.js.org) via CDN |
| Font | Geist (Soehne-inspired) via Bunny Fonts |
| Hosting | GitHub Pages |
| Domain | onionsman.com |

---

## Site Structure

```
onionsman/
├── index.html          ← Blog listing page
├── post.html           ← Individual post renderer (reads ?slug= param)
├── profile.html        ← About / profile page
├── CNAME               ← Custom domain for GitHub Pages
├── .nojekyll           ← Disables Jekyll, serves files as-is
├── assets/
│   ├── css/style.css   ← Linear-inspired custom theme
│   └── js/app.js       ← Theme toggle + post loading
└── posts/
    ├── manifest.json   ← Post index (metadata for all posts)
    └── *.md            ← Individual post files in Markdown
```

---

## How to add a new post

**Step 1 — Write the post**

Create a new `.md` file in `/posts/`:

```
posts/my-new-post-title.md
```

Write in standard Markdown. Start with an H1 (`# Title`) — the page will automatically render it as the post heading.

**Step 2 — Add to the manifest**

Open `posts/manifest.json` and add an entry at the top of the array:

```json
{
  "slug": "my-new-post-title",
  "title": "My New Post Title",
  "tag": "opinion",
  "date": "2026-03-01",
  "readTime": "5 min"
}
```

Available tags: `opinion`, `tech`, `event`, `guide`, `milestone`, `update` — or invent your own.

**Step 3 — Commit and push**

```bash
git add posts/my-new-post-title.md posts/manifest.json
git commit -m "post: my new post title"
git push origin main
```

GitHub Pages will deploy automatically within ~60 seconds.

---

## Local development

Because the site fetches JSON and Markdown files via `fetch()`, you need a local HTTP server (direct file:// access will block the requests).

**Quickest option:**

```bash
npx serve .
```

Then open `http://localhost:3000`.

Other options:
```bash
python3 -m http.server 3000
# or
php -S localhost:3000
```

---

## Setting up GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set Source: **Deploy from a branch → main → / (root)**
4. Add Custom Domain: `onionsman.com`
5. Enable **Enforce HTTPS** (after DNS propagates)

**DNS records to add at your domain registrar:**

```
A     @   185.199.108.153
A     @   185.199.109.153
A     @   185.199.110.153
A     @   185.199.111.153
CNAME www  your-github-username.github.io.
```

---

## Theme / Customisation

Edit `assets/css/style.css` to change:
- `--accent` — the purple accent colour (currently Linear's `#5e6ad2`)
- `--max-w` — content column width (currently `680px`)
- Font: swap Geist for any Google/Bunny Fonts face

Light/Dark/System mode cycles via the `○` button in the nav. Preference is saved to `localStorage`.

---

## Replacing the profile photo

In `profile.html`, find the `.profile-avatar` div and replace the placeholder initials with an `<img>` tag:

```html
<div class="profile-avatar">
  <img src="/assets/img/avatar.jpg" alt="Onionsman" width="80" height="80">
</div>
```

Upload your photo to `/assets/img/`.

---

*Built for [onionsman.com](https://onionsman.com)*
