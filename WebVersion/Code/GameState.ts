/// <reference path="Cell.ts" />

 class GameState {

    private cells: Cell[];

    public dimension: number = 8;

    public round: number = 0;
    public winner: number = 0;

    public GetIndexFromPos(row: number, col: number): number {
        return row * this.dimension + col;
    }

    public GetCell(row: number, col: number): Cell {
        return this.cells[this.GetIndexFromPos(row, col)];
    }


    public GetCellByIndex(index: number): Cell {
        return this.cells[index];
    }


    public CellsOfThread(ThreadID: number): Cell[] {
        return this.cells.filter(c => c.Owner == ThreadID);
    }

    public GetCells(): Cell[] {
        return this.cells;
    }

    public GetCellsAround(row: number, col: number): Cell[] {
        var result: Cell[] = [];

        //NW, W, SW
        if (col > 0) {
            result.push(this.cells[this.GetIndexFromPos(row, col - 1)]);
            if (row > 0) { result.push(this.cells[this.GetIndexFromPos(row - 1, col - 1)]); }
            if (row < this.dimension - 1) { result.push(this.cells[this.GetIndexFromPos(row + 1, col - 1)]); }
        }
        //N , S
        if (row > 0) { result.push(this.cells[this.GetIndexFromPos(row - 1, col)]); }
        if (row < this.dimension - 1) { result.push(this.cells[this.GetIndexFromPos(row + 1, col)]); }
        //NE , E , SE
        if (col < this.dimension - 1) {
            result.push(this.cells[this.GetIndexFromPos(row, col + 1)]);
            if (row > 0) { result.push(this.cells[this.GetIndexFromPos(row - 1, col + 1)]); }
            if (row < this.dimension - 1) { result.push(this.cells[this.GetIndexFromPos(row + 1, col + 1)]); }
        }
        return result;

    }




    public Clone(): GameState {
        var result = new GameState(this.dimension);
        result.winner = this.winner;
        result.round = this.round;
        for (var i: number = 0; i < this.cells.length; i++) {
            result.cells[i] = this.cells[i].Clone();
        }
        return result;
    }

    constructor(dim: number) {
        this.dimension = dim;
        this.cells = new Array<Cell>(dim * dim);
        

        var counter: number = 0;

        for (var y: number = 0; y < this.dimension; y++) {
            for (var x: number = 0; x < this.dimension; x++) {
                this.cells[counter] = new Cell(y, x);
                counter++;
            }
        }
    }


    //stats helper functions
    public CellsOccupied(ThreadID: number): number {
        return this.CellsOfThread(ThreadID).length;
    }

    public CellsThread1(): number { return this.CellsOccupied(1); }
    public CellsThread2(): number { return this.CellsOccupied(2); }

    public CellsValue(ThreadID: number): number {
        var sum: number = 0;
        this.CellsOfThread(ThreadID).forEach((c) => sum += c.Value);
        return sum;
    }


    public CellsValue1(): number { return this.CellsValue(1); }
    public CellsValue2(): number { return this.CellsValue(2); }
    
}
