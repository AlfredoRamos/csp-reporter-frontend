# About

Frontend for the **CSP Reporter** REST API using [Vue](https://vuejs.org), [Pinia](https://pinia.vuejs.org) and [Tailwind](https://tailwindcss.com).

[![Build Status - Main branch](https://img.shields.io/github/actions/workflow/status/AlfredoRamos/csp-reporter-frontend/ci.yml?branch=main&style=flat-square&label=main)](https://github.com/AlfredoRamos/csp-reporter-frontend/actions/workflows/ci.yml)
[![Build Status - Dev branch](https://img.shields.io/github/actions/workflow/status/AlfredoRamos/csp-reporter-frontend/ci.yml?branch=dev&style=flat-square&label=dev)](https://github.com/AlfredoRamos/csp-reporter-frontend/actions/workflows/ci.yml)
[![Latest Stable Version](https://img.shields.io/github/v/tag/AlfredoRamos/csp-reporter-frontend?sort=semver&style=flat-square&label=stable)](https://github.com/AlfredoRamos/csp-reporter-frontend/tags)

# Setup

## Requirements

- [Node](https://nodejs.org/en/download) >= 25.9.0

### VSCode extensions

- [Vue Language Features (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Markdown All in One](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one)

## Install Dependencies

```shell
npm ci --omit dev
```

# Run app

## Production

```shell
npm run build
```

## Development

```shell
npm run dev
```
