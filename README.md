# ecomecanico

sitio personal emulando el diseño de quartz/obsidian con sveltekit y tailwindcss. se construyó porque quería manejar mis notas y representarlas con la flexibilidad de componentes de svelte (cosa que carece quartz). 

## cómo funciona
cada nota es un archivo markdown que se encuentra en la carpeta `src/lib/notes/`. 
estas notas se leen con el componente `Note.svelte` y se muestran en la página de notas. para el manejo de notas se utilizan archivos JSON que tienen como función principal ser un índice de las notas. estos se generan por `script/generate-notes.js` que es ejecutado al ser construido el sitio.

```ts
// script/generate-notes.js
// cada JSON tiene su propósito:
// notes.json: lista de notas
// search-index.json: índice de búsqueda
// backlinks.json: enlaces para el componente Backlinks.svelte y Graph.svelte
fs.writeFileSync(path.join(OUTPUT_DIR, 'notes.json'), JSON.stringify(notes, null, 2));
fs.writeFileSync(path.join(OUTPUT_DIR, 'search-index.json'), JSON.stringify(searchIndex, null, 2));
fs.writeFileSync(path.join(OUTPUT_DIR, 'backlinks.json'), JSON.stringify(backlinksMap, null, 2));

```

>[!info] de todas formas existen páginas "especiales" como la de "about" que no es un 
archivo markdown si no un archivo .svelte directamente.

### nota importante
este sitio fue hecho guiando a Gemini 3 Flash. quisiera aprender web-dev más a profundidad pero mi objetivo principal ahora es compartir mis notas.


