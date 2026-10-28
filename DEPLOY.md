# Guía de publicación (producción)

## Qué hace cada archivo

| Archivo | Para qué sirve | ¿Se publica? |
|---|---|---|
| `.env` | Variables del entorno de despliegue (carpeta de salida, URL pública). **No se sube al repo.** | No |
| `.env.example` | Plantilla de `.env` sin datos reales, sí se versiona. | No |
| `.gitignore` | Evita versionar `tests/`, `docs/`, `node_modules/`, `.env`, `dist/` y temporales. | No |
| `scripts/build.mjs` | Copia a `dist/` solo los archivos que la app necesita. | No |
| `dist/` | Resultado listo para subir al hosting. | **Sí** |

> `.env` no “oculta” carpetas: solo guarda variables. Lo que excluye archivos del
> repositorio es `.gitignore`, y lo que los excluye del sitio publicado es el build.

## Desarrollo y pruebas

```bash
npm install          # dependencias (una sola vez)
npm test             # 55 pruebas con Vitest
```

## Generar la versión de producción

```bash
npm run build
```

Se crea `dist/` con solo esto:

```
dist/
├── index.html
├── css/
│   ├── style.css
│   └── bootstrap.min.css
├── js/
│   ├── app.js
│   ├── bootstrap.min.js
│   ├── jquery.js
│   └── jquery-ui/jquery-ui.js
└── audio/
    ├── alert.mp3
    ├── click.mp3
    └── error.mp3
```

Quedan fuera `tests/`, `docs/`, `node_modules/`, `package.json`, `package-lock.json`,
`vitest.config.mjs`, `.env` y los archivos temporales.

## Publicar

La app es 100 % estática, así que basta con subir el **contenido** de `dist/`:

- **GitHub Pages** (el demo actual): publicar la carpeta `dist` en la rama `gh-pages`, por ejemplo
  `npx gh-pages -d dist`.
- **Netlify / Vercel / Cloudflare Pages**: directorio de publicación = `dist`, sin comando de build
  (o comando `npm run build` y salida `dist`).
- **Hosting clásico (cPanel, FTP)**: subir el contenido de `dist/` a `public_html/`.

## Seguridad

- `.env` no se envía al navegador en una app estática. Si algún día necesitas una clave
  que uses en el cliente, recuerda que cualquiera podrá verla: esas claves van a un backend.
- No subas `node_modules/` ni la carpeta de pruebas al hosting: no aportan nada y exponen
  información del proyecto.

## Nota sobre `node_modules` en el repositorio

Este repositorio ya tenía `node_modules/` versionado antes de crear el `.gitignore`.
Ignorarlo no basta con archivos ya rastreados: hay que sacarlos del índice (sin borrarlos
del disco) una sola vez y hacer commit:

```bash
git rm -r --cached node_modules
git add .gitignore .env.example DEPLOY.md scripts/
git commit -m "Prepara el proyecto para producción"
```

GitHub Pages debe publicar el contenido de `dist/`, no la raíz del repositorio.
