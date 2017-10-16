using System.Collections.Generic;
using System.Linq;

namespace SharedMemLib
{
    public class GameState
    {
        private readonly Cell[] cells;

        public int Dimension { get; }
        public int Round { get; internal set; }
        public int Winner { get; internal set; }

        public GameState(int dim)
        {
            Dimension = dim;
            cells = new Cell[Dimension * Dimension];

            var counter = 0;

            for (var y = 0; y < Dimension; y++)
            {
                for (var x = 0; x < Dimension; x++)
                {
                    cells[counter] = new Cell(y, x);
                    counter++;
                }
            }
        }

        public int GetIndexFromPos(int row, int col)
        {
            return row * Dimension + col;
        }

        public Cell GetCell(int row, int col)
        {
            return cells[GetIndexFromPos(row, col)];
        }

        public Cell GetCellByIndex(int index)
        {
            return cells[index];
        }

        public IEnumerable<Cell> CellsOfThread(int threadId)
        {
            return cells.Where(c => c.Owner == threadId);
        }

        public IEnumerable<Cell> GetCells()
        {
            return cells;
        }

        public IEnumerable<Cell> GetCellsAround(int row, int col)
        {
            //NW, W, SW
            if (col>0)
            {
                yield return cells[GetIndexFromPos(row , col-1)];
                if (row>0) { yield return cells[GetIndexFromPos(row - 1, col-1)]; }
                if (row<Dimension-1) { yield return cells[GetIndexFromPos(row + 1, col -1)]; }
            }

            //N , S
            if (row > 0) { yield return cells[GetIndexFromPos(row-1, col )]; }
            if (row < Dimension-1) { yield return cells[GetIndexFromPos(row+1, col )]; }

            //NE , E , SE
            if (col < Dimension-1)
            {
                yield return cells[GetIndexFromPos(row, col + 1)];
                if (row > 0) { yield return cells[GetIndexFromPos(row - 1, col + 1)]; }
                if (row < Dimension - 1) { yield return cells[GetIndexFromPos(row + 1, col + 1)]; }
            }
        }

   
       // gebruikt om een string line met values in te lezen.
       // neg values zijn voor engine2, pos values voor engine1
        public void SetCellValues(int row, string columnValues)
        {
            //shortcut: complete unchecked execution..
            var col = 0;
            foreach (var item in columnValues.Split(' '))
            {
                var val = int.Parse(item);
                var c = GetCell(row, col);

                //fix owner;
                c.Owner = 0;
                if (val<0) { c.Owner = 2; }
                if (val>0) { c.Owner = 1; }

                //fix value;
                val = (val < 0) ? val * -1 : val;
                c.Value = val;
        
                col++;
            }
        }

        //engine2 moet negvalues krijgen; 
        public string GetCellValues(int row)
        {
            var results = new List<int>(Dimension);

            for (var col = 0; col < Dimension; col++)
            {
                var cell = cells[row * Dimension + col];
                if (cell.Owner==2)
                    results.Add(cell.Value * -1);
                else
                    results.Add(cell.Value);
            }

            return string.Join(" ", results);
        }

        public int CellsOccupied(int threadId) => CellsOfThread(threadId).Count();
        public int GetCellsThread1Count() => CellsOccupied(1); 
        public int GetCellsThread2Count() => CellsOccupied(2);
        public int CellsValue(int threadId) => CellsOfThread(threadId).Sum(c => c.Value);
        public int CellsValue1() => CellsValue(1);
        public int CellsValue2() => CellsValue(2);

        public GameState Clone()
        {
            var result = new GameState(Dimension)
            {
                Winner = Winner,
                Round = Round
            };

            for (var i = 0; i < cells.Length; i++)
            {
                result.cells[i] = cells[i].Clone();
            }

            return result;
        }
    }
}
