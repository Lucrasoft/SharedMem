using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace SharedMemLib
{
    public class Simulator
    {
        private const int MaxRounds = 2000;
        private readonly int dimension;
        private readonly IThreadEngine engine1;
        private readonly IThreadEngine engine2;

        public List<GameState> Statehistory { get; } = new List<GameState>();
        public List<List<ThreadAction>> Actionhistory { get; } = new List<List<ThreadAction>>();
        public GameState State { get; }

        public Simulator(IThreadEngine engine1, IThreadEngine engine2, int dimension)
        {
            this.dimension = dimension;

            State = new GameState(dimension);
            this.engine1 = engine1;
            this.engine2 = engine2;

            //initialize positions of players.
            State.GetCell(0, 0).Owner = 1;
            State.GetCell(0, 0).Value = 1;
            State.GetCell(dimension - 1, dimension - 1).Owner = 2;
            State.GetCell(dimension - 1, dimension - 1).Value = 1;
        }

        public void PlayGame()
        {
            while (State.Winner == 0)
            {
                DoRound();
            }

            engine1.Dispose();
            engine2.Dispose();
        }

        public bool DoRound()
        {
            var actions = new List<ThreadAction>();
            
            //TODO forge prevention? in theorie kan iemand 
            actions.AddRange(engine1.GetActions(State));
            actions.AddRange(engine2.GetActions(State));

            //LOG state & action
            Statehistory.Add(State.Clone());
            Actionhistory.Add(actions);

            //make sure all actions are valid
            foreach (var action in actions)
            {
                if (!ValidateAction(action)) {
                    State.Winner = (action.ThreadId == 1 ? 2 : 1);
                }
            }

            //TODO make sure 
            //1. no two actions from the same source exists.
            

            // zat er een illegale move tussen? 
            if (State.Winner!=0) { return false; }

            // moves uitvoeren , hou een lijst bij met Cell 
            var touchedCells = new List<Cell>();

            foreach (var action in actions)
            {
                var c = State.GetCellByIndex(action.SourceIndex);
                c.Value -= action.Count;
                touchedCells.Add(c);
            }

            foreach (var action in actions)
            { 
                var c = State.GetCellByIndex(action.DestIndex);
                c.AddValue(action.Count, action.ThreadId);
                touchedCells.Add(c);
            }

            // upgrade untouched cells voltage;
            foreach (var cell in State.GetCells())
            {
                if (touchedCells.IndexOf(cell)==-1)
                {
                    cell.UpgradeValue();
                }
            }

            // ronde is klaar! iemand verslagen?
            var cells1 = State.GetCellsThread1Count();
            var cells2 = State.GetCellsThread2Count();
         
            if (cells1 == 0)
            {
                State.Winner = 2;
            }
            if (cells2 == 0)
            {
                State.Winner = 1;
            }

            State.Round++;

            if (State.Round>=MaxRounds)
            {
                //force a winner..
                if (State.Winner == 0)
                {
                    //step 1 ; look at max Cells
                    if (cells1==cells2)
                    {
                        //step 2 ; look at max Value
                        int val1 = State.CellsValue1();
                        int val2 = State.CellsValue2();
                        if (val1 == val2)
                        {
                            State.Winner = 2;
                        }
                        else
                        {
                            State.Winner = val1 > val2 ? 1 : 2;
                        }
                    } else
                    {
                        State.Winner = cells1 > cells2 ? 1 : 2;
                    }

                }
            }

            return (State.Winner == 0);

        }

        public bool ValidateAction(ThreadAction action)
        {
            var isValid = true;

            //  is bronplek van playerid
            if (State.GetCellByIndex(action.SourceIndex).Owner!=action.ThreadId) { isValid = false; }
            
            //  is voldoende aanwezig?
            if (State.GetCellByIndex(action.SourceIndex).Value<action.Count) { isValid = false; }
            

            //TODO  is bestemming in straal van 1 vakje ; fromCol en toCOl bestaan niet meer..
            //if (Math.Abs(action.fromCol - action.toCol) > 1) { isValid = false; }
            //if (Math.Abs(action.fromRow - action.toRow) > 1) { isValid = false; }

            return isValid;
        }
    }
}
