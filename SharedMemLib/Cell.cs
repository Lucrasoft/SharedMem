namespace SharedMemLib
{
    public class Cell
    {
        private const int MaxValue = 255;

        public int Owner { get; set; }           //0 = niemand; 1=engine1 ; 2=engine2;
        public int Value { get; set; }
        public int Row { get; set; }
        public int Col { get; set; }

        public Cell(int row, int col)
        {
            Row = row;
            Col = col;
            Owner = 0 ;
            Value = 0;
        }

        public Cell Clone()
        {
            var result = new Cell(Row, Col)
            {
                Value = Value,
                Owner = Owner
            };

            return result;
        }

        public void UpgradeValue()
        {
            //dit kan slimmer! je bent gewoon lui he?. even bitjes tellen man. 

            if (Value >= 128)
            {
                Value += 8;
                if (Value>MaxValue) { Value = MaxValue; }

                return; 
            }

            if (Value >= 64) { Value += 7; return; }
            if (Value >= 32) { Value += 6; return; }
            if (Value >= 16) { Value += 5; return; }
            if (Value >= 8) { Value += 4; return; }
            if (Value >= 4) { Value += 3; return; }
            if (Value >= 2) { Value += 2; return; }
            if (Value >= 1) { Value += 1; return; }
        }

        
        public void AddValue(int value, int playerId)
        {
            if ((Owner == 0) || (Owner == playerId))
            {
                Value += value;
                if (Value > MaxValue)
                    Value = MaxValue;

                Owner = playerId;
            }
            else
            {
                Value -= value;
                if (Value == 0)
                    Owner = 0;

                if (Value < 0)
                {
                    Value *= -1;
                    Owner = playerId;
                }
            }
        }
    }
}
