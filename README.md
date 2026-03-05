# ecomecanico

Un jardín digital personal construido con SvelteKit y Tailwind CSS, inspirado en la filosofía de Quartz/Obsidian pero con la flexibilidad de componentes de Svelte. Diseñado para organizar, visualizar y conectar notas de manera intuitiva.

## Funcionamiento

### Sistema de Notas
El proyecto transforma archivos Markdown en un sistema de conocimiento interconectado:

1. **Fuente de contenido**: Notas en formato Markdown almacenadas en `src/lib/notes/`
2. **Procesamiento**: El script `scripts/generate-notes.js` analiza las notas y genera:
   - `notes.json`: Índice completo de todas las notas
   - `search-index.json`: Estructura optimizada para búsqueda rápida
   - `backlinks.json`: Mapa de conexiones entre notas para el grafo y backlinks

3. **Visualización**: Los componentes Svelte renderizan dinámicamente:
   - Contenido Markdown con soporte para wikilinks (`[[nota]]`)
   - Grafo de conexiones entre notas
   - Sistema de backlinks automáticos
   - Búsqueda full-text instantánea

### Características Principales

** Conexiones Inteligentes**
- Wikilinks automáticos (`[[nota]]` o `<WikiLink path="nota"/>`)
- Grafo interactivo que muestra relaciones entre notas
- Backlinks contextuales en cada nota

** Búsqueda Avanzada**
- Índice de búsqueda pre-generado para resultados instantáneos
- Búsqueda por contenido, títulos y tags
- Acceso rápido con `Ctrl+K`

** Organización Flexible**
- Sistema de tags para categorización
- Ordenamiento cronológico automático
- Páginas especiales (como `/about`) con componentes Svelte personalizados

** Experiencia de Usuario**
- Modo oscuro/claro con toggle persistente
- Diseño responsive (móvil, tablet, desktop)
- Previsualización de enlaces al hover
- Navegación fluida entre notas

## Comandos Esenciales

### Desarrollo Local
```bash
# Ingresar al entorno Nix (requerido)
nix develop

# Instalar dependencias
pnpm install

# Modo desarrollo con hot-reload
pnpm dev

# Construir para producción
pnpm build
```

### Verificación de Calidad
```bash
# Ejecutar pruebas unitarias
pnpm test

# Verificar formato de código
pnpm format:check

# Aplicar formato automático
pnpm format

# Revisión de tipos TypeScript
pnpm check
```

### Deployment
```bash
# Construir y preparar para GitLab Pages
pnpm build

# El deployment se activa automáticamente en GitLab CI
# (configurado en .gitlab-ci.yml)
```

### Generación de Índices
```bash
# Regenerar índices de notas (ejecutado automáticamente en build)
node scripts/generate-notes.js
```

## Arquitectura Técnica

**Frontend**: SvelteKit con:
- TypeScript para tipado estricto
- Tailwind CSS para estilos
- D3.js para visualización del grafo
- Markdown rendering con componentes personalizados

**Backend**: SvelteKit endpoint API para búsqueda

**Datos**: Archivos Markdown + JSON generados estáticamente

**Entorno**: Nix Flakes para dependencias reproducibles

## Filosofía

Este proyecto sigue los principios KISS y DRY, con enfoque en:
- **Simplicidad**: Interfaz minimalista sin distracciones
- **Flexibilidad**: Componentes Svelte personalizables
- **Conexión**: Visualización de relaciones entre ideas
- **Accesibilidad**: Navegación intuitiva y diseño inclusivo

> [!NOTE]
> Inspirado en herramientas como Obsidian y Quartz, pero construido para superar sus limitaciones de personalización.

### Sobre el Desarrollo
Proyecto creado con asistencia de IA (Gemini 3 Flash) como herramienta de aprendizaje en desarrollo web moderno. El objetivo principal es compartir conocimiento de manera organizada y visualmente atractiva.


