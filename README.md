# Mabast AI

A responsive, Sorani Kurdish, ChatGPT-inspired AI workspace frontend. Built with plain HTML, CSS, and JavaScript so it can be previewed as a static site.

## Included

- Responsive chat workspace with conversation history, search, delete, new chat, and keyboard shortcut (`Ctrl/⌘ + K`).
- Local browser storage for chat history and theme preference.
- Image Studio interface with prompt, style, and aspect-ratio controls.
- Library of prompt starters, settings page, light/dark theme, and image/video file attachment previews.
- Kurdish RTL-first design for desktop and mobile.

## Run locally

Open `index.html` in a browser or serve this directory with any static web server.

## Important: demo limitations

This repository currently contains a frontend prototype. It does **not** connect to an AI model, analyze uploaded media, or generate images. Those features need a backend and a provider API. Keep provider API keys on the server—never put secrets in `app.js` or other browser code. Chat history currently stays in this browser's local storage and is not synced or backed up.
