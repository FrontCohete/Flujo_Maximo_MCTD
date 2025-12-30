const canvas = document.getElementById('canvas');
const svg = document.getElementById('connections-svg');
const tableBody = document.querySelector('#connections_table tbody');
const resultsContainer = document.getElementById('results-container');
const nodes = new Map();
let nodeCount = 0;

// --- GESTIÓN DE NODOS Y UI ---
document.getElementById('add_node').addEventListener('click', () => {
nodeCount++;
const node = document.createElement('div');
node.className = 'node';
node.innerText = nodeCount;
node.style.left = '50px'; node.style.top = '50px';
node.addEventListener('mousedown', onMouseDown);
canvas.appendChild(node);
nodes.set(nodeCount, node);
redrawConnections();
});

function onMouseDown(e) {
const node = e.currentTarget;
let offsetX = e.clientX - node.getBoundingClientRect().left;
let offsetY = e.clientY - node.getBoundingClientRect().top;
function onMouseMove(e) {
    node.style.left = (e.clientX - offsetX - document.getElementById('sidebar').offsetWidth) + 'px';
    node.style.top = (e.clientY - offsetY) + 'px';
    redrawConnections();
}
function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}
document.addEventListener('mousemove', onMouseMove);
document.addEventListener('mouseup', onMouseUp);
}

document.getElementById('add_row').addEventListener('click', () => {
const row = document.createElement('tr');
row.innerHTML = `
    <td><input type="number" class="input-origin"></td>
    <td><input type="number" class="input-dest"></td>
    <td><input type="number" class="input-pf" value="0"></td>
    <td><button class="btn btn-del-row">×</button></td>
`;
row.querySelectorAll('input').forEach(i => i.addEventListener('input', redrawConnections));
row.querySelector('.btn-del-row').addEventListener('click', () => { row.remove(); redrawConnections(); });
tableBody.appendChild(row);
});

function redrawConnections() {
while (svg.lastChild && svg.lastChild.tagName !== 'defs') svg.removeChild(svg.lastChild);
const sw = document.getElementById('sidebar').offsetWidth;

tableBody.querySelectorAll('tr').forEach(row => {
    const oId = parseInt(row.querySelector('.input-origin').value);
    const dId = parseInt(row.querySelector('.input-dest').value);
    const pf = row.querySelector('.input-pf').value;

    if (nodes.has(oId) && nodes.has(dId)) {
        const r1 = nodes.get(oId).getBoundingClientRect();
        const r2 = nodes.get(dId).getBoundingClientRect();
        const x1 = r1.left + r1.width/2 - sw, y1 = r1.top + r1.height/2;
        const x2 = r2.left + r2.width/2 - sw, y2 = r2.top + r2.height/2;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1); line.setAttribute('y1', y1);
        line.setAttribute('x2', x2); line.setAttribute('y2', y2);
        line.setAttribute('class', 'connection-line');
        svg.appendChild(line);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (x1+x2)/2); text.setAttribute('y', (y1+y2)/2 - 10);
        text.setAttribute('class', 'pf-label'); text.setAttribute('text-anchor', 'middle');
        text.textContent = pf;
        svg.appendChild(text);
    }
});
}

// --- ALGORITMO DE BÚSQUEDA DE RUTAS ---
document.getElementById('calc_routes').addEventListener('click', () => {
const start = parseInt(document.getElementById('start_node').value);
const end = parseInt(document.getElementById('end_node').value);

if (!nodes.has(start) || !nodes.has(end)) {
    alert("Asegúrate de que los IDs de Fuente y Sumidero existan.");
    return;
}

// Construir lista de adyacencia
const adj = new Map();
tableBody.querySelectorAll('tr').forEach(row => {
    const u = parseInt(row.querySelector('.input-origin').value);
    const v = parseInt(row.querySelector('.input-dest').value);
    const cap = parseFloat(row.querySelector('.input-pf').value);
    if (!isNaN(u) && !isNaN(v)) {
        if (!adj.has(u)) adj.set(u, []);
        adj.get(u).push({ to: v, cap: cap });
    }
});

const allPaths = [];
findPaths(start, end, [], new Set(), allPaths, adj);

// Mostrar resultados
resultsContainer.innerHTML = "";
if (allPaths.length === 0) {
    resultsContainer.innerHTML = "No se encontraron rutas.";
} else {
    allPaths.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = 'route-item';
        div.innerHTML = `<strong>R${i+1}:</strong> ${p.path.join('→')} <br><small>Capacidad limitante: ${p.minCap}</small>`;
        resultsContainer.appendChild(div);
    });
}
});

function findPaths(current, target, path, visited, allPaths, adj) {
visited.add(current);
path.push(current);

if (current === target) {
    // Calcular la capacidad mínima del camino (Cuello de botella)
    let minCap = Infinity;
    for (let i = 0; i < path.length - 1; i++) {
        const edges = adj.get(path[i]);
        const edge = edges.find(e => e.to === path[i+1]);
        if (edge.cap < minCap) minCap = edge.cap;
    }
    allPaths.push({ path: [...path], minCap: minCap });
} else {
    const neighbors = adj.get(current) || [];
    for (const edge of neighbors) {
        if (!visited.has(edge.to)) {
            findPaths(edge.to, target, path, visited, allPaths, adj);
        }
    }
}

path.pop();
visited.delete(current);
}