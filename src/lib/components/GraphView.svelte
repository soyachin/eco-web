<script lang="ts">
    import { onMount } from "svelte";
    import * as d3 from "d3";
    import { goto } from "$app/navigation";

    interface Node extends d3.SimulationNodeDatum {
        id: string;
        title: string;
        isCurrent?: boolean;
        x?: number;
        y?: number;
        fx?: number | null;
        fy?: number | null;
    }

    interface Link extends d3.SimulationLinkDatum<Node> {
        source: string | Node;
        target: string | Node;
    }

    import type { Note } from "$lib/types";

    let {
        nodes = [] as Note[],
        links = [] as { source: string; target: string }[],
        currentSlug = "",
        isGlobal = false,
    } = $props<{
        nodes: Note[];
        links: { source: string; target: string }[];
        currentSlug?: string;
        isGlobal?: boolean;
    }>();

    let svgElement: SVGSVGElement;
    let width = $state(0);
    let height = $state(300);

    // --- Data Filtering ---
    const filteredNodes = $derived.by((): Node[] => {
        if (isGlobal)
            return nodes.map((n: Note) => ({
                id: n.slug,
                title: n.meta?.title || n.slug,
                isCurrent: n.slug === currentSlug,
            }));

        const neighbors = new Set([currentSlug]);
        links.forEach((l: { source: string; target: string }) => {
            if (l.source === currentSlug) neighbors.add(l.target);
            if (l.target === currentSlug) neighbors.add(l.source);
        });

        return nodes
            .filter((n: Note) => neighbors.has(n.slug))
            .map((n: Note) => ({
                id: n.slug,
                title: n.meta?.title || n.slug,
                isCurrent: n.slug === currentSlug,
            }));
    });

    const filteredLinks = $derived.by(() => {
        const nodeIds = new Set(filteredNodes.map((n) => n.id));
        return links
            .filter(
                (l: { source: string; target: string }) =>
                    nodeIds.has(l.source) && nodeIds.has(l.target),
            )
            .map((l: { source: string; target: string }) => ({
                source: l.source,
                target: l.target,
            }));
    });

    // --- Simulation ---
    $effect(() => {
        if (!svgElement || !width) return;

        const simulation = d3
            .forceSimulation<Node>(filteredNodes)
            .force(
                "link",
                d3
                    .forceLink<Node, Link>(filteredLinks)
                    .id((d) => d.id)
                    .distance(isGlobal ? 100 : 80),
            )
            .force(
                "charge",
                d3.forceManyBody().strength(isGlobal ? -150 : -200),
            )
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(30));

        const svg = d3.select(svgElement);
        svg.selectAll("*").remove();
        const g = svg.append("g");

        const zoom = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.5, 4])
            .on("zoom", (e) => g.attr("transform", e.transform));
        svg.call(zoom);

        const linkLines = g
            .append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(filteredLinks)
            .join("line")
            .attr("stroke", "var(--fg-dim)")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1.5);

        const nodeGroups = g
            .append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(filteredNodes)
            .join("g")
            .call(
                d3
                    .drag<any, Node>()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended),
            )
            .on("click", (_, d) => goto(`/${d.id}`));

        nodeGroups
            .append("circle")
            .attr("r", (d) => (d.isCurrent ? 7 : 5))
            .attr("fill", (d) =>
                d.isCurrent ? "var(--brand-primary)" : "var(--fg-muted)",
            )
            .attr("stroke", "var(--bg-primary)")
            .attr("stroke-width", 2);

        nodeGroups
            .append("text")
            .text((d) => d.title)
            .attr("x", 10)
            .attr("y", 4)
            .attr("class", "node-label")
            .style("font-weight", (d) => (d.isCurrent ? "bold" : "normal"));

        simulation.on("tick", () => {
            linkLines
                .attr("x1", (d: any) => (d.source as Node).x!)
                .attr("y1", (d: any) => (d.source as Node).y!)
                .attr("x2", (d: any) => (d.target as Node).x!)
                .attr("y2", (d: any) => (d.target as Node).y!);
            nodeGroups.attr(
                "transform",
                (d: any) => `translate(${(d as Node).x},${(d as Node).y})`,
            );
        });

        function dragstarted(e: d3.D3DragEvent<SVGGElement, Node, Node>) {
            if (!e.active) simulation.alphaTarget(0.3).restart();
            e.subject.fx = e.subject.x;
            e.subject.fy = e.subject.y;
        }
        function dragged(e: d3.D3DragEvent<SVGGElement, Node, Node>) {
            e.subject.fx = e.x;
            e.subject.fy = e.y;
        }
        function dragended(e: d3.D3DragEvent<SVGGElement, Node, Node>) {
            if (!e.active) simulation.alphaTarget(0);
            e.subject.fx = null;
            e.subject.fy = null;
        }

        return () => simulation.stop();
    });
</script>

<div
    bind:clientWidth={width}
    bind:clientHeight={height}
    class="graph-container"
>
    <svg bind:this={svgElement} {width} {height} class="cursor-move"></svg>
</div>

<style lang="postcss">
    @reference "../../app.css";
    .graph-container {
        @apply w-full h-full min-h-[250px] relative overflow-hidden rounded-xl border;
        background-color: color-mix(
            in srgb,
            var(--bg-secondary) 20%,
            transparent
        );
        border-color: color-mix(in srgb, var(--bg-tertiary) 30%, transparent);
        mask-image: radial-gradient(circle, black 60%, transparent 95%);
    }

    :global(.node-label) {
        @apply text-[11px] font-mono fill-foreground pointer-events-none opacity-80;
    }
</style>
