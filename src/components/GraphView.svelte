<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import type { GraphNode, GraphLink } from '../lib/types';

  let {
    nodes = [] as GraphNode[],
    links = [] as GraphLink[],
    currentSlug = '',
    isGlobal = false,
  } = $props<{
    nodes: GraphNode[]
    links: GraphLink[]
    currentSlug?: string
    isGlobal?: boolean
  }>()

  let containerEl: HTMLDivElement
  let svgElement: SVGSVGElement
  let width = $state(0)
  // FIX 1: height arranca en 250, no en 0 — evita que el SVG sea invisible al montar
  let height = $state(250)

  const BASE_RADIUS = 4
  const getRadius = (degree: number): number =>
    BASE_RADIUS + Math.sqrt(degree) * 1.5

  // Modo local: solo currentSlug y vecinos directos a 1 grado
  const localNodes = $derived.by((): GraphNode[] => {
    if (isGlobal) return nodes

    const neighbors = new Set([currentSlug])
    for (const l of links as any[]) {
      const s = typeof l.source === 'string' ? l.source : (l.source as any).id
      const t = typeof l.target === 'string' ? l.target : (l.target as any).id
      if (s === currentSlug) neighbors.add(t)
      if (t === currentSlug) neighbors.add(s)
    }
    return nodes.filter((n: GraphNode) => neighbors.has(n.id))
  })

  const localLinks = $derived.by(() => {
    if (isGlobal) return links
    const ids = new Set(localNodes.map((n: GraphNode) => n.id))
    return (links as any[]).filter(l => {
      const s = typeof l.source === 'string' ? l.source : (l.source as any).id
      const t = typeof l.target === 'string' ? l.target : (l.target as any).id
      return ids.has(s) && ids.has(t)
    })
  })

  $effect(() => {
    if (!svgElement) return

    // FIX 2: si width todavía no se midió via bind:clientWidth,
    // lo medimos manualmente — resuelve la race condition de montaje
    if (!width && containerEl) {
      width = containerEl.getBoundingClientRect().width
    }

    if (!width) return

    // FIX 3: leer CSS vars aquí dentro del effect, no en onMount separado
    // Garantiza que los colores estén disponibles cuando D3 dibuja
    const style = getComputedStyle(document.documentElement)
    const COLOR_BRAND      = style.getPropertyValue('--brand-primary').trim() || '#ff5d62'
    const COLOR_FG_PRIMARY = style.getPropertyValue('--fg-primary').trim() || '#ebdbb2'
    const COLOR_FG_MUTED   = style.getPropertyValue('--fg-muted').trim() || '#928374'
    const COLOR_FG_DIM     = style.getPropertyValue('--fg-dim').trim() || '#665c54'
    const COLOR_BG_PRIMARY = style.getPropertyValue('--bg-primary').trim() || '#1d2021'
    const COLOR_LINK       = style.getPropertyValue('--fg-dim').trim() || '#665c54'

    // Si no hay nodos, no hay nada que dibujar
    if (localNodes.length === 0) return

    height = isGlobal ? window.innerHeight - 80 : 250

    // FIX: inicializar x/y cerca del centro ANTES de pasarlos a D3.
    // Sin esto, los nodos arrancan en (0,0) — esquina superior izquierda —
    // que es exactamente donde el mask-image los oculta.
    ;(localNodes as any[]).forEach(n => {
      if (n.x === undefined) {
        n.x = width / 2 + (Math.random() - 0.5) * 20
        n.y = height / 2 + (Math.random() - 0.5) * 20
      }
    })

    const svg = d3.select(svgElement)
    svg.selectAll('*').remove()

    // Nodo huérfano: sin vecinos, no necesita simulación.
    // Lo centramos directo y salimos — sin D3 force loop.
    if (localNodes.length === 1) {
      const n = localNodes[0] as any
      let ox = width / 2, oy = height / 2
      const g0 = svg.append('g').attr('transform', `translate(${ox},${oy})`)

      g0.append('circle')
        .attr('r', getRadius(n.degree))
        .attr('fill', COLOR_BRAND)
        .attr('stroke', COLOR_BG_PRIMARY)
        .attr('stroke-width', 1.5)
        .style('cursor', 'grab')
        .on('click', () => { window.location.href = `/${n.id}` })

      g0.append('text')
        .text(n.title)
        .attr('x', getRadius(n.degree) + 4)
        .attr('y', 4)
        .attr('class', 'node-label')
        .attr('opacity', 1)

      // Drag para el nodo huerfano
      g0.call(d3.drag<SVGGElement, unknown>()
        .on('start', function() { d3.select(this).style('cursor', 'grabbing') })
        .on('drag', function(e) {
          ox += e.dx; oy += e.dy
          d3.select(this).attr('transform', `translate(${ox},${oy})`)
        })
        .on('end', function() { d3.select(this).style('cursor', 'grab') })
      )

      return () => {}
    }

    const g = svg.append('g')

    // 1. Simulación — solo corre cuando hay más de un nodo
    const simulation = d3.forceSimulation<GraphNode>(localNodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(localLinks)
        .id(d => d.id)
        .distance(isGlobal ? 80 : 60))
      .force('charge', d3.forceManyBody<GraphNode>()
        .strength(d => -60 - d.degree * 8))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.05))
      .force('x', d3.forceX(width / 2).strength(0.04))
      .force('y', d3.forceY(height / 2).strength(0.04))
      .force('collision', d3.forceCollide<GraphNode>()
        .radius(d => getRadius(d.degree) + 6))

    // 2. Zoom (solo modo global)
    if (isGlobal) {
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 8])
        .on('zoom', e => g.attr('transform', e.transform))
      svg.call(zoom)

      document.getElementById('graph-reset-zoom')?.addEventListener('click', () => {
        svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity)
      })
    }

    // 3. Dibujar Links
    const linkLines = g.append('g')
      .selectAll('line')
      .data(localLinks)
      .join('line')
      .attr('stroke', COLOR_LINK)
      .attr('opacity', 0.4)
      .attr('stroke-width', 1)

    // 4. Dibujar Nodos
    const nodeGroups = g.append('g')
      .selectAll('g')
      .data(localNodes)
      .join('g') as d3.Selection<SVGGElement, GraphNode, any, any>

    nodeGroups.call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (e: any, d: GraphNode) => {
          if (!e.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x; d.fy = d.y
        })
        .on('drag', (e: any, d: GraphNode) => { d.fx = e.x; d.fy = e.y })
        .on('end', (e: any, d: GraphNode) => {
          if (!e.active) simulation.alphaTarget(0)
          d.fx = null; d.fy = null
        })
      )

    // Vecinos del nodo actual para resaltado base
    const currentNeighbors = new Set<string>()
    localLinks.forEach((l: any) => {
      const s = typeof l.source === 'string' ? l.source : (l.source as any).id
      const t = typeof l.target === 'string' ? l.target : (l.target as any).id
      if (s === currentSlug) currentNeighbors.add(t)
      if (t === currentSlug) currentNeighbors.add(s)
    })

    function getNodeColor(d: GraphNode): string {
      if (d.id === currentSlug) return COLOR_BRAND
      if (currentNeighbors.has(d.id)) return COLOR_FG_PRIMARY
      if (d.degree === 0) return COLOR_FG_DIM
      return COLOR_FG_MUTED
    }

    function getNodeOpacity(d: GraphNode): number {
      if (d.id === currentSlug) return 1
      if (currentNeighbors.has(d.id)) return 0.9
      if (d.degree === 0) return 0.4
      return 0.6
    }

    const nodeCircles = nodeGroups.append('circle')
      .attr('r', (d: GraphNode) => getRadius(d.degree))
      .attr('fill', (d: GraphNode) => getNodeColor(d))
      .attr('opacity', (d: GraphNode) => getNodeOpacity(d))
      .attr('stroke', COLOR_BG_PRIMARY)
      .attr('stroke-width', 1.5)

    // Label siempre visible para orphans (solo 1 nodo), oculto por defecto para el resto
    const nodeLabels = nodeGroups.append('text')
      .text((d: GraphNode) => d.title)
      .attr('x', (d: GraphNode) => getRadius(d.degree) + 4)
      .attr('y', 4)
      .attr('class', 'node-label')
      // Si es el único nodo o es el nodo actual, mostrar label siempre
      .attr('opacity', (d: GraphNode) =>
        (d.id === currentSlug || localNodes.length === 1) ? 1 : 0
      )

    // 5. Hover behavior
    function onNodeHover(hoveredId: string | null): void {
      if (!hoveredId) {
        nodeCircles.transition().duration(150)
          .attr('fill', (d: GraphNode) => getNodeColor(d))
          .attr('opacity', (d: GraphNode) => getNodeOpacity(d))
        nodeLabels.transition().duration(150)
          .attr('opacity', (d: GraphNode) =>
            (d.id === currentSlug || localNodes.length === 1) ? 1 : 0
          )
        linkLines.transition().duration(150)
          .attr('opacity', 0.4)
          .attr('stroke-width', 1)
        return
      }

      const hoverNeighbors = new Set([hoveredId])
      localLinks.forEach((l: any) => {
        const s = typeof l.source === 'string' ? l.source : (l.source as any).id
        const t = typeof l.target === 'string' ? l.target : (l.target as any).id
        if (s === hoveredId) hoverNeighbors.add(t)
        if (t === hoveredId) hoverNeighbors.add(s)
      })

      nodeCircles.transition().duration(150)
        .attr('opacity', (d: GraphNode) => hoverNeighbors.has(d.id) ? 1 : 0.1)
      nodeLabels.transition().duration(150)
        .attr('opacity', (d: GraphNode) => hoverNeighbors.has(d.id) ? 1 : 0)
      linkLines.transition().duration(150)
        .attr('opacity', (l: any) => {
          const s = typeof l.source === 'string' ? l.source : (l.source as any).id
          const t = typeof l.target === 'string' ? l.target : (l.target as any).id
          return hoverNeighbors.has(s) && hoverNeighbors.has(t) ? 0.8 : 0.05
        })
        .attr('stroke-width', (l: any) => {
          const s = typeof l.source === 'string' ? l.source : (l.source as any).id
          const t = typeof l.target === 'string' ? l.target : (l.target as any).id
          return hoverNeighbors.has(s) && hoverNeighbors.has(t) ? 2 : 1
        })
    }

    nodeGroups
      .on('mouseenter', (_: any, d: GraphNode) => onNodeHover(d.id))
      .on('mouseleave', () => onNodeHover(null))
      .on('click', (_: any, d: GraphNode) => { window.location.href = `/${d.id}` })
      .style('cursor', 'pointer')

    // 6. Fade-in simple — sin delay por nodo
    nodeCircles
      .attr('r', (d: GraphNode) => getRadius(d.degree))
      .attr('opacity', 0)
      .transition().duration(300)
        .attr('opacity', (d: GraphNode) => getNodeOpacity(d))

    nodeLabels
      .attr('opacity', 0)
      .transition().delay(200).duration(200)
        .attr('opacity', (d: GraphNode) =>
          (d.id === currentSlug || localNodes.length === 1) ? 1 : 0
        )

    // 7. Tick animado — mueve nodos a sus posiciones finales
    simulation.on('tick', () => {
      linkLines
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)
      nodeGroups.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    })

    return () => simulation.stop()
  })
</script>

<!-- FIX 2: bind:this en el div para poder medir el ancho manualmente si hace falta -->
<div
  bind:this={containerEl}
  bind:clientWidth={width}
  class="graph-container"
  class:is-global={isGlobal}
>
  <svg bind:this={svgElement} {width} {height} />

  {#if isGlobal}
    <button id="graph-reset-zoom" class="reset-zoom-btn">
      reset zoom
    </button>
  {/if}
</div>

<style lang="postcss">
  @reference "../styles/global.css";

  .graph-container {
    @apply w-full relative overflow-hidden;
    height: var(--graph-height, 250px);
  }

  .graph-container:not(.is-global) {
    @apply rounded-xl;
    mask-image: radial-gradient(ellipse at center, black 55%, transparent 90%);
  }

  .graph-container.is-global {
    height: calc(100vh - var(--nav-height));
  }

  .reset-zoom-btn {
    @apply absolute bottom-4 right-4 text-xs font-mono text-muted
           border border-border-subtle rounded px-2 py-1
           hover:text-foreground transition-colors;
    background-color: var(--bg-secondary);
  }

  :global(.node-label) {
    @apply text-[10px] font-mono pointer-events-none;
    fill: var(--fg-primary);
  }
</style>