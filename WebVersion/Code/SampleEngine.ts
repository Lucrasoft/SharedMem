/// <reference path="IThreadEngine" />
/// <reference path="ThreadAction" />
/// <reference path="GameState" />
/// <reference path="Cell" />

class SimpleEngine implements IThreadEngine {

    private threadID: number;
    
    constructor(ThreadID: number) {
        this.threadID = ThreadID
    }


    public GetActions(state: GameState): ThreadAction[] {
        var result: ThreadAction[] = [];

        //bekijken eigen cellen
        var myCells = state.CellsOfThread(this.threadID);
        
        myCells.forEach((mycell) => {
            if (mycell.Value > 1) {
         
                if (Math.random() > 0.7) {
                    //get valid surrounding cells
                    var surroundingCells = state.GetCellsAround(mycell.Row, mycell.Col);
                    var dest: Cell = surroundingCells[0];
                    //pick random cell.
                    var ndx = Math.floor(Math.random() * surroundingCells.length);
                    dest = surroundingCells[ndx];
                    //transfer 50% of the current value
                    var transferValue = Math.floor(mycell.Value / 2);
                    //record our action
                    var sourceIndex: number = mycell.Row * state.dimension + mycell.Col;
                    var destIndex: number = dest.Row * state.dimension + dest.Col;
                    result.push(new ThreadAction(this.threadID, sourceIndex, destIndex, transferValue));
                }
            }
        });

        return result;
    }
}


class SampleEngine implements IThreadEngine {

    private threadID: number;

    constructor(ThreadID: number) {
        this.threadID = ThreadID      
    }

    static getDescription(): string {
        return "Per cell change of 1/value to get into action. Select destination strategy: 1.free 2.enemy 3.own cell. Random transfer value";
    }

    public GetActions(state: GameState): ThreadAction[] {
        //
        var result: ThreadAction[] = [];

        //bekijken eigen cellen
        var myCells = state.CellsOfThread(this.threadID);


        myCells.forEach((mycell) => {
            if (mycell.Value > 1) {
                //kans van 2 tot 255 
                if (Math.random() > (1.0 - (mycell.Value / 255.0))) {
                    //omliggende cellen opvragren en pick er eentje..
                    var surroundingCells = state.GetCellsAround(mycell.Row, mycell.Col);

                    var dest: Cell = surroundingCells[0];
                    //pick random cell.

                    var emptySourrce = surroundingCells.filter((c) => c.Owner == 0);
                    var otherPlayer: number = this.threadID == 1 ? 2 : 1;
                    if (emptySourrce.length > 0) {
                        var ndx = Math.floor(Math.random() * emptySourrce.length);
                        dest = emptySourrce[ndx];
                    }
                    else {
                        var enenySource = surroundingCells.filter((c) => c.Owner == otherPlayer);
                        if (enenySource.length > 0) {
                            var ndx = Math.floor(Math.random() * enenySource.length);
                            dest = enenySource[ndx];
                        } else {
                            var ndx = Math.floor(Math.random() * surroundingCells.length);
                            dest = surroundingCells[ndx];
                        }
                    }


                    //pick random value to transfer
                    var transferValue = Math.floor(Math.random() * (mycell.Value - 1)) + 1;

                    //leg de actie vast
                    var sourceIndex: number = mycell.Row * state.dimension + mycell.Col;
                    var destIndex: number = dest.Row * state.dimension + dest.Col;
                    result.push(new ThreadAction(this.threadID, sourceIndex, destIndex, transferValue));

                    
                }
            }
        });

        return result;
    }
}
