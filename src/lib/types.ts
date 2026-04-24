/** Metadatos del frontmatter de una nota del blog */
export interface NoteMeta {
  title?: string;
  tags?: string[];
  date?: string | Date;
  description?: string;
}

/** Representación ligera de una nota para el layout y el grafo */
export interface Note {
  slug: string;
  snippet?: string;
  meta: NoteMeta;
}

/** Estado del link preview al hacer hover sobre un enlace interno */
export interface PreviewState {
  active: boolean;
  x: number;
  y: number;
  note: Note | null;
}

/** Backlink: nota que apunta a otra nota */
export interface Backlink extends Note {
  date?: string;
}

/** Nodo del grafo D3. degree = número de conexiones (0 = orphan) */
export interface GraphNode extends d3.SimulationNodeDatum {
  id: string
  title: string
  degree: number
}

/** Link del grafo D3 — deduplicado, sin bidireccionales repetidos */
export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode
  target: string | GraphNode
}

/** Resultado de buildGraphData() */
export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}
