class Cell {

    private maxValue: number = 255;

    public Owner: number; 
    public Value: number;

    public Row: number;
    public Col: number

    constructor(row: number, col: number) {
        this.Row = row;
        this.Col = col;
        this.Owner = 0;
        this.Value = 0;
    }

    public Clone(): Cell {
        var result = new Cell(this.Row, this.Col);
        result.Value = this.Value;
        result.Owner = this.Owner;
        return result;
    }

    public UpgradeValue(): void {

        //dit kan slimmer! je bent gewoon lui he?. even bitjes tellen man. 

        if (this.Value >= 128) {
            this.Value += 8;
            if (this.Value > this.maxValue) { this.Value = this.maxValue; }
            return;
        }
        if (this.Value >= 64) { this.Value += 7; return; }
        if (this.Value >= 32) { this.Value += 6; return; }
        if (this.Value >= 16) { this.Value += 5; return; }
        if (this.Value >= 8) { this.Value += 4; return; }
        if (this.Value >= 4) { this.Value += 3; return; }
        if (this.Value >= 2) { this.Value += 2; return; }
        if (this.Value >= 1) { this.Value += 1; return; }
    }


    public AddValue(value: number, playerID: number): void {
        if ((this.Owner == 0) || (this.Owner == playerID)) {
            this.Value += value;
            if (this.Value > this.maxValue) {
                this.Value = this.maxValue;
            }
            this.Owner = playerID;
        }
        else {
            this.Value -= value;
            if (this.Value == 0) {
                this.Owner = 0;
            }

            if (this.Value < 0) {
                this.Value *= -1;
                this.Owner = playerID;
            }
        }

    }
}
