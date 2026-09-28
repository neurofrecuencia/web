# Blog de Neurofrecuencia — esqueleto Jekyll

## Qué hay aquí

```
_config.yml              → configuración del sitio
_layouts/default.html    → header + footer, igual al index.html actual
_layouts/post.html       → plantilla de cada entrada de blog (+ SEO)
_posts/2026-10-01-...md  → tu primer post de ejemplo
blog/index.html          → la página /blog/ que lista todos los posts
robots.txt                → permisos para buscadores y bots de IA
llms.txt                  → ficha del sitio para agentes de IA
```

## Qué debes hacer

1. Copia estas carpetas y archivos a la raíz de tu repositorio de GitHub
   (al mismo nivel que tu `index.html` actual).
2. Sube los cambios (`git add . && git commit -m "blog" && git push`) —
   GitHub Pages detecta `_config.yml` automáticamente y construye el sitio
   con Jekyll, sin que tengas que instalar nada.
3. En 1-2 minutos, `neurofrecuencia.es/blog/` ya debería mostrar el post
   de ejemplo.

## Cómo publicas un post nuevo (esto es lo que harás cada semana)

1. Crea un archivo nuevo en `_posts/`, con el nombre:
   `AAAA-MM-DD-titulo-corto.md` (la fecha en el nombre es obligatoria).
2. Arriba del todo, entre `---`, pon:
   ```
   ---
   layout: post
   title: "Título de tu entrada"
   category: Procesamiento   (o Desmitificando, o Herramientas)
   date: 2026-10-08
   excerpt: "Una o dos frases que resumen el post — aparecen en la tarjeta."
   ---
   ```
3. Debajo, escribe el post normal, en Markdown (## para subtítulos,
   * para listas, así de simple).
4. Sube el archivo (`git add . && git commit && git push`) y listo — se
   integra solo, con su propia página, su SEO y su tarjeta en `/blog/`.

## Nota sobre el head de index.html

Ya te dejé insertados los meta tags de SEO/Open Graph/datos estructurados
directamente en tu `index.html` en la conversación — este README es solo
para la parte del blog.
