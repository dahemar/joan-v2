# Joan Colomer Portfolio - v2

Portfolio de video editor con videos embebidos localmente.

## 🚀 Deploy en Vercel

Este repo usa **Vite glob imports** para cargar videos desde `media/edits/`.

### Setup
```bash
npm install
npm run dev
```

### Variables de Entorno (Opcionales)
Si quieres usar Google Sheets en lugar de archivos locales:
- `VITE_GOOGLE_SHEETS_API_KEY`
- `VITE_GOOGLE_SHEETS_SHEET_ID`

**Por defecto:** Usa archivos locales (deshabilitado Google Sheets).

### Deploy
```bash
npm run build
```

Los archivos grandes usan **Git LFS**.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
