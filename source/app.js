// Número de nodos
const V = 6;

// Grafo representado como matriz de capacidades
const graph = [
    [0, 16, 13, 0, 0, 0],
    [0, 0, 10, 12, 0, 0],
    [0, 4, 0, 0, 14, 0],
    [0, 0, 9, 0, 0, 20],
    [0, 0, 0, 7, 0, 4],
    [0, 0, 0, 0, 0, 0]
];

// BFS para encontrar camino aumentante
function bfs(rGraph, s, t, parent) {
    const visited = new Array(V).fill(false);
    const queue = [];

    queue.push(s);
    visited[s] = true;
    parent[s] = -1;

    while (queue.length > 0) {
        const u = queue.shift();

        for (let v = 0; v < V; v++) {
            if (!visited[v] && rGraph[u][v] > 0) {
                queue.push(v);
                parent[v] = u;
                visited[v] = true;
            }
        }
    }
    return visited[t];
}

// Algoritmo Ford-Fulkerson
function fordFulkerson(graph, s, t) {
    const rGraph = graph.map(row => row.slice());
    const parent = new Array(V);
    let maxFlow = 0;

    while (bfs(rGraph, s, t, parent)) {
        let pathFlow = Infinity;

        for (let v = t; v !== s; v = parent[v]) {
            let u = parent[v];
            pathFlow = Math.min(pathFlow, rGraph[u][v]);
        }

        for (let v = t; v !== s; v = parent[v]) {
            let u = parent[v];
            rGraph[u][v] -= pathFlow;
            rGraph[v][u] += pathFlow;
        }

        maxFlow += pathFlow;
    }
    return maxFlow;
}

// Ejecutar desde la interfaz
function calcularFlujo() {
    const source = 0;
    const sink = 5;

    const flujoMaximo = fordFulkerson(graph, source, sink);
    document.getElementById("resultado").innerText =
        `Flujo máximo desde ${source} hasta ${sink}: ${flujoMaximo}`;
}
