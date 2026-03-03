<script lang="ts">
    import GraphView from "$lib/components/GraphView.svelte";
    let { data }: { data: any } = $props();

    // Transformamos el backlinksMap a una lista plana de links para el Grafo
    let links = $derived.by(() => {
        const allLinks: { source: string; target: string }[] = [];
        Object.entries(data.backlinksMap || {}).forEach(
            ([target, sources]: [string, any]) => {
                sources.forEach((s: any) => {
                    allLinks.push({ source: s.slug, target: target });
                });
            },
        );
        return allLinks;
    });
</script>

<div class="max-w-5xl mx-auto px-6 py-12">
    <header class="mb-12">
        <h1 class="text-4xl font-bold text-brand mb-4">mapa del jardín</h1>
        <p class="text-muted font-mono text-sm uppercase tracking-widest">
            Visualización global de todas las conexiones entre notas.
        </p>
    </header>

    <div class="h-[600px] w-full">
        <GraphView nodes={data.notes} {links} isGlobal={true} />
    </div>

    <footer class="mt-8 text-muted font-mono opacity-60">
        <p>
            truco: Puedes arrastrar los nodos, hacer zoom con la rueda del ratón
            y hacer clic para viajar a una nota.
        </p>
    </footer>
</div>
