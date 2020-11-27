export const genCoords = () => {
    return [Math.floor(Math.random() * 20) * 5, Math.floor(Math.random() * 20) * 5];
}

export const delay = ms => new Promise(res => setTimeout(res, ms));

export const manhattanDist = (p1, p2) => {
    return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
}

export const createQTable = () => {
    var arr = [];
    for (var i = 0; i < 8; i++) {
        var oth = [];
        for (var j = 0; j < 16; j++) {
            oth.push([0, 0, 0, 0]);
        }
        arr.push(oth);
    }
    return arr;
}

export const createVisited = (valor) => {
    if (valor === undefined)
      valor = false;

    var arr = [];
    for (var i = 0; i < 8; i++) {
        var oth = [];
        for (var j = 0; j < 16; j++) {
            oth.push(valor);
        }
        arr.push(oth);
    }
    return arr;
}

export const createQTableTreinada = () => {
    const best_moves = [
            [2, 1, 2, 3, 1, 1, 0, 3, 2, 2, 2, 2, 1, 1, 0, 4],
            [1, 1, 2, 3, 1, 1, 0, 3, 1, 1, 2, 2, 1, 1, 0, 4],
            [1, 1, 2, 3, 0, 1, 0, 3, 1, 1, 0, 2, 1, 1, 0, 4],
            [0, 3, 0, 3, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4],
            [3, 3, 3, 3, 0, 3, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4],
            [3, 3, 3, 3, 3, 3, 3, 3, 0, 1, 0, 2, 0, 1, 0, 4],
            [3, 2, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 0, 1, 0, 4],
            [2, 2, 2, 2, 3, 3, 0, 3, 2, 2, 2, 2, 0, 1, 0, 4]
        ];
        var arr = [];
        for (var i = 0; i < 8; i++) {
            var oth = [];
            for (var j = 0; j < 16; j++) {
                var position = best_moves[i][j];
                var novo = [0, 0, 0, 0];
                novo[position] = 5;
                oth.push(novo);
            }
            arr.push(oth);
        }
    return arr;
}