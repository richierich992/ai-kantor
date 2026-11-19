/* Agent Navigation — obstacle-aware indoor walking for the 3D office.
 * Builds a lightweight 2D walkability grid from visible scene meshes and routes
 * every agent waypoint around walls, desks, chairs, tables and GLB furniture.
 */
export function createAgentNavigation({
  THREE,
  scene,
  characters = {},
  bounds = { minX: -43.5, maxX: 43.5, minZ: -27, maxZ: 18.5 },
  cellSize = 0.45,
  clearance = 0.42
}) {
  if (!THREE || !scene) return null;

  const roots = new Set(Object.values(characters).map(character => character?.g).filter(Boolean));
  let blocked = null;
  let columns = 0;
  let rows = 0;
  let version = 0;
  let colliderCount = 0;
  let blockedCellCount = 0;
  let routeCount = 0;
  let failedRouteCount = 0;
  let lastRoute = null;

  const point = value => value?.isVector3 ? value.clone() : new THREE.Vector3(
    Number(value?.x) || 0, Number(value?.y) || 0, Number(value?.z) || 0
  );
  const worldX = ix => bounds.minX + (ix + 0.5) * cellSize;
  const worldZ = iz => bounds.minZ + (iz + 0.5) * cellSize;
  const inGrid = (ix, iz) => ix >= 0 && iz >= 0 && ix < columns && iz < rows;
  const indexOf = (ix, iz) => iz * columns + ix;
  const toCell = position => ({
    x: Math.floor((position.x - bounds.minX) / cellSize),
    z: Math.floor((position.z - bounds.minZ) / cellSize)
  });
  const cellCenter = cell => new THREE.Vector3(worldX(cell.x), 0, worldZ(cell.z));
  const isBlocked = (ix, iz) => !inGrid(ix, iz) || blocked[indexOf(ix, iz)] === 1;

  function belongsToCharacter(object) {
    for (let parent = object; parent; parent = parent.parent) {
      if (roots.has(parent)) return true;
    }
    return false;
  }

  function isVisible(object) {
    for (let parent = object; parent; parent = parent.parent) {
      if (parent.visible === false) return false;
    }
    return true;
  }

  function rebuild() {
    scene.updateMatrixWorld(true);
    columns = Math.ceil((bounds.maxX - bounds.minX) / cellSize);
    rows = Math.ceil((bounds.maxZ - bounds.minZ) / cellSize);
    blocked = new Uint8Array(columns * rows);
    colliderCount = 0;

    const box = new THREE.Box3();
    scene.traverse(object => {
      if (!object.isMesh || !object.geometry || !isVisible(object)) return;
      if (belongsToCharacter(object) || object.userData?.navIgnore === true) return;

      box.setFromObject(object);
      if (box.isEmpty()) return;

      /* Ignore floor decals, rugs and ground slabs, plus overhead signs/lights. */
      if (box.max.y < 0.28 || box.min.y > 2.15) return;
      if (box.max.x - box.min.x > 88 && box.max.z - box.min.z > 45) return;

      const minX = Math.max(0, Math.floor((box.min.x - clearance - bounds.minX) / cellSize));
      const maxX = Math.min(columns - 1, Math.floor((box.max.x + clearance - bounds.minX) / cellSize));
      const minZ = Math.max(0, Math.floor((box.min.z - clearance - bounds.minZ) / cellSize));
      const maxZ = Math.min(rows - 1, Math.floor((box.max.z + clearance - bounds.minZ) / cellSize));
      if (minX > maxX || minZ > maxZ) return;

      colliderCount++;
      for (let iz = minZ; iz <= maxZ; iz++) {
        const z = worldZ(iz);
        if (z < box.min.z - clearance || z > box.max.z + clearance) continue;
        for (let ix = minX; ix <= maxX; ix++) {
          const x = worldX(ix);
          if (x < box.min.x - clearance || x > box.max.x + clearance) continue;
          blocked[indexOf(ix, iz)] = 1;
        }
      }
    });

    /* Keep agents inside the walkable building footprint. */
    for (let ix = 0; ix < columns; ix++) {
      blocked[indexOf(ix, 0)] = 1;
      blocked[indexOf(ix, rows - 1)] = 1;
    }
    for (let iz = 0; iz < rows; iz++) {
      blocked[indexOf(0, iz)] = 1;
      blocked[indexOf(columns - 1, iz)] = 1;
    }

    blockedCellCount = 0;
    for (let i = 0; i < blocked.length; i++) if (blocked[i]) blockedCellCount++;
    version++;
    return diagnostics();
  }

  function nearestWalkable(position, maxDistance = 2.4) {
    const origin = toCell(position);
    const maxRing = Math.ceil(maxDistance / cellSize);
    let best = null;
    let bestDistance = Infinity;

    for (let ring = 0; ring <= maxRing; ring++) {
      for (let dz = -ring; dz <= ring; dz++) {
        for (let dx = -ring; dx <= ring; dx++) {
          if (ring && Math.max(Math.abs(dx), Math.abs(dz)) !== ring) continue;
          const ix = origin.x + dx;
          const iz = origin.z + dz;
          if (isBlocked(ix, iz)) continue;
          const x = worldX(ix) - position.x;
          const z = worldZ(iz) - position.z;
          const distance = x * x + z * z;
          if (distance < bestDistance) {
            bestDistance = distance;
            best = { x: ix, z: iz };
          }
        }
      }
      if (best && Math.sqrt(bestDistance) <= (ring + 1) * cellSize) break;
    }
    return best && Math.sqrt(bestDistance) <= maxDistance ? best : null;
  }

  function lineClear(a, b) {
    const start = point(a), end = point(b);
    const dx = end.x - start.x, dz = end.z - start.z;
    const distance = Math.hypot(dx, dz);
    const steps = Math.max(1, Math.ceil(distance / (cellSize * 0.35)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const cell = toCell(new THREE.Vector3(start.x + dx * t, 0, start.z + dz * t));
      if (isBlocked(cell.x, cell.z)) return false;
    }
    return true;
  }

  class MinHeap {
    constructor() { this.items = []; }
    push(item) {
      const a = this.items;
      a.push(item);
      let i = a.length - 1;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (a[p].f <= item.f) break;
        a[i] = a[p]; i = p;
      }
      a[i] = item;
    }
    pop() {
      const a = this.items;
      if (!a.length) return null;
      const root = a[0], tail = a.pop();
      if (a.length) {
        let i = 0;
        while (true) {
          const left = i * 2 + 1, right = left + 1;
          if (left >= a.length) break;
          let child = left;
          if (right < a.length && a[right].f < a[left].f) child = right;
          if (a[child].f >= tail.f) break;
          a[i] = a[child]; i = child;
        }
        a[i] = tail;
      }
      return root;
    }
    get length() { return this.items.length; }
  }

  const heuristic = (x, z, gx, gz) => {
    const dx = Math.abs(gx - x), dz = Math.abs(gz - z);
    return 10 * (dx + dz) + (14 - 20) * Math.min(dx, dz);
  };

  function findGridPath(start, goal) {
    if (!start || !goal) return null;
    const startIndex = indexOf(start.x, start.z);
    const goalIndex = indexOf(goal.x, goal.z);
    if (startIndex === goalIndex) return [start];

    const size = columns * rows;
    const costs = new Float32Array(size);
    costs.fill(Infinity);
    const parents = new Int32Array(size);
    parents.fill(-1);
    const closed = new Uint8Array(size);
    const open = new MinHeap();
    costs[startIndex] = 0;
    open.push({ index: startIndex, x: start.x, z: start.z,
      f: heuristic(start.x, start.z, goal.x, goal.z) });

    const directions = [
      [1, 0, 10], [-1, 0, 10], [0, 1, 10], [0, -1, 10],
      [1, 1, 14], [1, -1, 14], [-1, 1, 14], [-1, -1, 14]
    ];

    let visited = 0;
    while (open.length && visited < size) {
      const current = open.pop();
      if (!current || closed[current.index]) continue;
      if (current.index === goalIndex) {
        const result = [];
        let cursor = goalIndex;
        while (cursor !== -1) {
          result.push({ x: cursor % columns, z: Math.floor(cursor / columns) });
          if (cursor === startIndex) break;
          cursor = parents[cursor];
        }
        if (result[result.length - 1]?.x !== start.x || result[result.length - 1]?.z !== start.z) return null;
        return result.reverse();
      }

      closed[current.index] = 1;
      visited++;
      for (const [dx, dz, baseCost] of directions) {
        const nx = current.x + dx, nz = current.z + dz;
        if (isBlocked(nx, nz)) continue;
        if (dx && dz && (isBlocked(current.x + dx, current.z) || isBlocked(current.x, current.z + dz))) continue;
        const ni = indexOf(nx, nz);
        if (closed[ni]) continue;
        const nextCost = costs[current.index] + baseCost;
        if (nextCost >= costs[ni]) continue;
        costs[ni] = nextCost;
        parents[ni] = current.index;
        open.push({ index: ni, x: nx, z: nz, f: nextCost + heuristic(nx, nz, goal.x, goal.z) });
      }
    }
    return null;
  }

  function smoothPath(cells) {
    if (!cells || cells.length <= 1) return [];
    const result = [];
    let anchor = 0;
    while (anchor < cells.length - 1) {
      let next = cells.length - 1;
      while (next > anchor + 1 && !lineClear(cellCenter(cells[anchor]), cellCenter(cells[next]))) next--;
      result.push(cellCenter(cells[next]));
      anchor = next;
    }
    return result;
  }

  function routePath(startPosition, waypoints = [], options = {}) {
    if (!blocked) rebuild();
    routeCount++;
    const raw = (waypoints || []).filter(Boolean).map(point);
    const result = [];
    let cursor = point(startPosition);
    let routeFailed = false;

    raw.forEach((target, waypointIndex) => {
      const isLast = waypointIndex === raw.length - 1;
      if (Math.hypot(target.x - cursor.x, target.z - cursor.z) < 0.18) return;

      const startCell = nearestWalkable(cursor, 2.8);
      const allowGoal = isLast && options.allowBlockedGoal === true;
      const goalCell = nearestWalkable(target, allowGoal ? 1.15 : 2.4);
      if (!startCell || !goalCell) {
        routeFailed = true;
        return;
      }

      const cells = findGridPath(startCell, goalCell);
      if (!cells) {
        routeFailed = true;
        return;
      }

      const smoothed = smoothPath(cells);
      smoothed.forEach(next => {
        if (Math.hypot(next.x - cursor.x, next.z - cursor.z) > 0.22) result.push(next);
        cursor = next;
      });

      const safeEnd = cellCenter(goalCell);
      if (allowGoal && Math.hypot(target.x - safeEnd.x, target.z - safeEnd.z) <= 1.15) {
        if (Math.hypot(target.x - cursor.x, target.z - cursor.z) > 0.18) result.push(new THREE.Vector3(target.x, 0, target.z));
        cursor = target.clone();
      } else {
        cursor = safeEnd;
      }
    });

    if (routeFailed) failedRouteCount++;
    lastRoute = {
      waypointCount: raw.length,
      plannedPointCount: result.length,
      failed: routeFailed
    };
    return result;
  }

  function diagnostics() {
    return {
      ready: !!blocked,
      version,
      colliderCount,
      blockedCellCount,
      grid: { columns, rows, cellSize, clearance },
      routeCount,
      failedRouteCount,
      lastRoute
    };
  }

  return { rebuild, routePath, lineClear, diagnostics, get version() { return version; } };
}
