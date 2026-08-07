// Shared sample graphs for BFS / DFS / Dijkstra visualizers.
// Coordinates are SVG px, tuned for TreeSvg rendering.

export const GRAPH8 = {
  nodes: [
    { id: 0, label: 'A', x: 70,  y: 60 },
    { id: 1, label: 'B', x: 230, y: 40 },
    { id: 2, label: 'C', x: 390, y: 70 },
    { id: 3, label: 'D', x: 110, y: 190 },
    { id: 4, label: 'E', x: 270, y: 160 },
    { id: 5, label: 'F', x: 430, y: 200 },
    { id: 6, label: 'G', x: 200, y: 290 },
    { id: 7, label: 'H', x: 360, y: 300 },
  ],
  edges: [
    [0, 1], [0, 3], [1, 2], [1, 4], [2, 5], [3, 4], [3, 6], [4, 5], [4, 6], [5, 7], [6, 7],
  ],
}

export const WGRAPH = {
  nodes: GRAPH8.nodes,
  edges: [
    [0, 1, 4], [0, 3, 2], [1, 2, 5], [1, 4, 7], [2, 5, 3], [3, 4, 3],
    [3, 6, 8], [4, 5, 6], [4, 6, 2], [5, 7, 4], [6, 7, 5],
  ],
}

export function neighborsOf(edges, weighted = false) {
  const adj = {}
  for (const e of edges) {
    const [a, b, w] = e
    ;(adj[a] ||= []).push(weighted ? { to: b, w } : b)
    ;(adj[b] ||= []).push(weighted ? { to: a, w } : a)
  }
  // deterministic order so the traversal is predictable
  for (const k of Object.keys(adj)) adj[k].sort((x, y) => (weighted ? x.to - y.to : x - y))
  return adj
}
