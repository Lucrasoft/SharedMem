/// <reference path="GameState" />
/// <reference path="ThreadAction" />
/// <reference path="IThreadEngine" />
/// <reference path="Cell" />


class Simulator {

    private maxRounds: number = 2000;
    dimension: number = 8;
    public state: GameState;
    player1: IThreadEngine;
    player2: IThreadEngine;

    public statehistory: GameState[] = [];
    public actionhistory: ThreadAction[][] = [];

    constructor(player1: IThreadEngine, player2: IThreadEngine) {

        this.state = new GameState(this.dimension);
        this.player1 = player1;
        this.player2 = player2;

        //initialize positions of players.
        this.state.GetCell(0, 0).Owner = 1;
        this.state.GetCell(0, 0).Value = 1;
        this.state.GetCell(this.dimension - 1, this.dimension - 1).Owner = 2;
        this.state.GetCell(this.dimension - 1, this.dimension - 1).Value = 1;
    }



    public PlayGame(): void {
        while (this.state.winner == 0) {
            this.DoRound();
        }
    }

    public DoRound(): boolean {

        var actions: ThreadAction[] = [];

        //TODO forge prevention?
       
        this.player1.GetActions(this.state).forEach((a) => actions.push(a));
        this.player2.GetActions(this.state).forEach((a) => actions.push(a));

        //LOG state & action
        this.statehistory.push(this.state.Clone());
        this.actionhistory.push(actions);

        //make sure all actions are valid
        actions.forEach((action) => {
            if (!this.ValidateAction(action)) {
                this.state.winner = (action.threadID == 1 ? 2 : 1);
            }
        });

        // zat er een illegale move tussen? 
        if (this.state.winner != 0) { return false; }

        // moves uitvoeren , hou een lijst bij met Cell 
        // 

        var touchedCells: Cell[] = [];
        var c: Cell;
        //
        actions.forEach((action) => {
            c = this.state.GetCellByIndex(action.sourceIndex);
            c.Value -= action.count;
            touchedCells.push(c);
        });

        actions.forEach((action) => {
            c = this.state.GetCellByIndex(action.destIndex);
            c.AddValue(action.count, action.threadID);
            touchedCells.push(c);
        });
        // upgrade untouched cells voltage;

        this.state.GetCells().forEach((cell) => {
            if (touchedCells.indexOf(cell) == -1) {
                cell.UpgradeValue();
            }
        });

        // ronde is klaar! iemand verslagen?

        var cells1: number = this.state.CellsThread1();
        var cells2: number = this.state.CellsThread2();

        if (cells1 == 0) {
            this.state.winner = 2;
        }
        if (cells2 == 0) {
            this.state.winner = 1;
        }

        this.state.round++;

        if (this.state.round >= this.maxRounds) {
            //force a winner..
            if (this.state.winner == 0) {
                //step 1 ; look at max Cells
                if (cells1 == cells2) {
                    //step 2 ; look at max Value
                    var val1: number = this.state.CellsValue1();
                    var val2: number = this.state.CellsValue2();
                    if (val1 == val2) {
                        this.state.winner = 1;
                    }
                    else {
                        this.state.winner = val1 > val2 ? 1 : 2;
                    }
                } else {
                    this.state.winner = cells1 > cells2 ? 1 : 2;
                }

            }
        }

        return (this.state.winner == 0);

    }

    public ValidateAction(action: ThreadAction): boolean {
        var isValid = true;
        //  is bronplek van playerid
        if (this.state.GetCellByIndex(action.sourceIndex).Owner != action.threadID) { isValid = false; }
        //  is voldoende aanwezig?
        if (this.state.GetCellByIndex(action.sourceIndex).Value < action.count) { isValid = false; }

        //  is bestemming in straal van 1 vakje
        //if (Math.Abs(action.fromCol - action.toCol) > 1) { isValid = false; }
        //if (Math.Abs(action.fromRow - action.toRow) > 1) { isValid = false; }

        return isValid;
    }
    
}