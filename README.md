# VolcanoesGT

Plataforma informativa sobre los volcanes de Guatemala.

## Stack

- Vue 3 (Composition API + `<script setup>`)
- Vite 8
- Vue Router 4
- SCSS (estilos globales vía `src/styles/`)
- CSS nativo por componente (`HomeView.css`)
- `fetch` nativo — sin librerías HTTP externas

## Variables de entorno

Copia `.env.example` a `.env` y configura:

```
VITE_API_URL=http://localhost:8080/api/v1
```

## Comandos

```bash
pnpm dev       # Servidor de desarrollo en http://localhost:3000
pnpm build     # Build de producción
pnpm preview   # Preview del build
pnpm lint      # Linting con ESLint
```

## Estructura

```
src/
├── pages/
│   ├── HomeView.vue   # Vista principal (única página)
│   └── HomeView.css   # Estilos del componente
├── router/
│   └── index.js       # Configuración de rutas
├── styles/
│   ├── main.scss      # Punto de entrada global
│   ├── _reset.scss    # Reset CSS
│   └── _typography.scss # Base tipográfica
├── App.vue            # Root component
└── main.js            # Bootstrap de la aplicación
```
