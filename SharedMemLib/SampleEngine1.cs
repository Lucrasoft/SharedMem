using System;
using System.Collections.Generic;
using System.Linq;

namespace SharedMemLib
{
    public class SampleEngine1 : IThreadEngine
    {
        private readonly int threadId;
        private readonly double threshold; 
        private readonly Random rnd = new Random(DateTime.Now.Millisecond);

        public SampleEngine1(int threadId, double threshold)
        {
            this.threadId = threadId;
            this.threshold = threshold;
        }
        
        public List<ThreadAction> GetActions(GameState state)
        {
            var result = new List<ThreadAction>();

            //bekijken eigen cellen
            var myCells = state.CellsOfThread(threadId);

            //Taktiek 1 
            //Beslis per cell wat er moet gebeuren...
            foreach (var mycell in myCells)
            {
                if (mycell.Value > 1)
                {
                    //kans van 20% dat we iets gaan doen..
                    if (rnd.NextDouble() > threshold)
                    {
                        //omliggende cellen opvragren en pick er eentje..
                        var surroundingCells = state.GetCellsAround(mycell.Row, mycell.Col).ToList();

                        //pick random cell.
                        var destCell = surroundingCells[rnd.Next(surroundingCells.Count)];

                        //pick random value to transfer
                        var transferValue = rnd.Next(1, mycell.Value - 1);

                        //leg de actie vast
                        int sourceIndex = mycell.Row * state.Dimension + mycell.Col;
                        int destIndex = destCell.Row * state.Dimension + destCell.Col;
                        result.Add(new ThreadAction(threadId, sourceIndex, destIndex, transferValue));

                        //Taktiek 2 : juist de lege cellen of de enemy cellen?

                    }
                }
            }

            
            return result;
        }

        public void Dispose()
        {
        }
    }
}
