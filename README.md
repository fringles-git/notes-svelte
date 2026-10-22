# Quick Notes

PWA de prise de notes rapide construite avec SvelteKit + Svelte 5 + TypeScript.

## Installation

```bash
npm install
npm run dev -- --host 0.0.0.0
```

## Production

```bash
npm run build
npm run preview -- --host 0.0.0.0
```

## Checklist de test PWA

- Vérifier l'installation du manifeste
- Vérifier le service worker en mode production
- Vérifier les écrans hors ligne depuis le navigateur
- Vérifier le mode standalone sur mobile
- Vérifier les performances Lighthouse (Performance, Accessibility, Best Practices, PWA)
- Vérifier la navigation et les interactions de notes sur mobile
