using SharedMemLib;
using System;
using System.Linq;

namespace ThreadSample1
{
    class Program
    {

        static Random rnd = new Random(DateTime.Now.Millisecond);

        static void Main(string[] args)
        {


            //First line contains integers of [Dimension] [Your ThreadID 1 or 2] [  
            var inputs = Console.ReadLine().Split(' ');

            var Dimension = int.Parse(inputs[0]);
            var ThreadID = int.Parse(inputs[1]);

            while (true)
            {
                //Every round, a number of lines with some integer values are given. 
                // dimension number of lines
                // dimension number of values 
                //Representing the memory cell values.
                //Positive values are for ThreadID 1
                //Negative values are for ThreadID 2

                GameState state = new GameState(Dimension);
                for (int i = 0; i < Dimension; i++)
                {
                    var line = Console.ReadLine();
                    state.SetCellValues(i, line);
                }

                //stupid random engine..
                var myCells = state.CellsOfThread(ThreadID).Where(c => c.Value > 1);
                foreach (var mycell in myCells)
                {
                    if (rnd.NextDouble() > 0.8)
                    {
                        //get surrounding cells.
                        var surroundingCells = state.GetCellsAround(mycell.Row, mycell.Col).ToList();

                        //pick random destination cell.
                        var destCell = surroundingCells[rnd.Next(surroundingCells.Count)];

                        //pick random value to transfer
                        var transferValue = rnd.Next(1, mycell.Value - 1);

                        //Send action 
                        int sourIndex = mycell.Row * Dimension + mycell.Col;
                        int destIndex = destCell.Row * Dimension + destCell.Col;
                        Console.WriteLine(sourIndex + " " + destIndex + " " + transferValue);
                    }
                }

                //
                Console.WriteLine();
            }

        }
    }
}
