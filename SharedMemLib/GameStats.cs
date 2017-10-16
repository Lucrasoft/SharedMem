using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedMemLib
{

    //TODO voegt niets toe, de paar helper functies kunnen beter naar de GameState zelf
    class GameStats
    {

        GameState state;
        public GameStats(GameState state)
        {
            this.state = state;
        }
        
        public int CellsOccupied(int ThreadID)
        {
            return state.CellsOfThread(ThreadID).Count();
        }

        public int CellsThread1() { return CellsOccupied(1);  }
        public int CellsThread2() { return CellsOccupied(2); }

        public int CellsValue(int ThreadID)
        {
            return state.CellsOfThread(ThreadID).Sum(c => c.Value);
        }

        public int CellsValue1() { return CellsValue(1); }
        public int CellsValue2() { return CellsValue(2); }

    }
}
