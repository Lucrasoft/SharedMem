using System;
using System.Collections.Generic;
using System.Linq;

namespace SharedMemLib
{
    public class SampleEngine2 : IThreadEngine
    {
        private readonly int playerId;
        private readonly double threshold;
        private readonly Random rnd = new Random(DateTime.Now.Millisecond);

        public SampleEngine2(int playerId, double threshold)
        {
            this.playerId = playerId;
            this.threshold = threshold; 
        }
        
        public List<ThreadAction> GetActions(GameState state)
        {
            //
            var result = new List<ThreadAction>();

            //bekijken eigen cellen
            var myCells = state.CellsOfThread(playerId);
            
            foreach (var mycell in myCells)
            {
                if (mycell.Value > 1)
                {
                    //kans van 2 / 255 
                    if (rnd.NextDouble() > (1.0-(mycell.Value/255.0)))
                    {
                        //omliggende cellen opvragren en pick er eentje..
                        var surroundingCells = state.GetCellsAround(mycell.Row, mycell.Col).ToList();

                        Cell dest = surroundingCells[0];
                        //pick random cell.
                        var emptySourrce = surroundingCells.Where(c => c.Owner == 0).ToList();
                        int otherPlayer = playerId == 1 ? 2 : 1;
                        if (emptySourrce.Count() > 0)
                        {
                            dest= emptySourrce[rnd.Next(emptySourrce.Count())];
                        }
                        else
                        {
                            var enenySource = surroundingCells.Where(c => c.Owner == otherPlayer).ToList();
                            if (enenySource.Count()>0)
                            {
                                dest = enenySource[rnd.Next(enenySource.Count())];
                            } else
                            {
                                dest = surroundingCells[rnd.Next(surroundingCells.Count)];
                            }
                        }
                        
                        //pick random value to transfer
                        var transferValue = rnd.Next(1, mycell.Value - 1);

                        //leg de actie vast
                        int sourceIndex  = mycell.Row * state.Dimension + mycell.Col;
                        int destIndex = dest.Row * state.Dimension + dest.Col;
                        result.Add(new ThreadAction(playerId, sourceIndex,destIndex, transferValue));

                        
                        //Taktiek 2 : juist de lege cellen of de enemy cellen?
                        //Taktiek 3 : richting de sterktste van de tegenstander sturen?
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
