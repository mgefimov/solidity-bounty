export function toAdjacencyList(adjacencyMatrix) {
  return adjacencyMatrix.map((row) => {
    const res = [];
    for (let i = 0; i < row.length; i++) {
      if (row[i]) {
        res.push(i);
      }
    }
    return res;
  });
}

export function toAdjacencyMatrix(adjacencyList) {
  const n = adjacencyList.length;
  const res = [];
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < n; j++) {
      row.push(0);
    }
    res.push(row);
  }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < adjacencyList[i].length; j++) {
      res[i][parseInt(adjacencyList[i][j])] = 1;
    }
  }
  return res;
}
