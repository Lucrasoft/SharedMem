var Cell = (function () {
    function Cell(row, col) {
        this.maxValue = 255;
        this.Row = row;
        this.Col = col;
        this.Owner = 0;
        this.Value = 0;
    }
    Cell.prototype.Clone = function () {
        var result = new Cell(this.Row, this.Col);
        result.Value = this.Value;
        result.Owner = this.Owner;
        return result;
    };
    Cell.prototype.UpgradeValue = function () {
        //dit kan slimmer! je bent gewoon lui he?. even bitjes tellen man. 
        if (this.Value >= 128) {
            this.Value += 8;
            if (this.Value > this.maxValue) {
                this.Value = this.maxValue;
            }
            return;
        }
        if (this.Value >= 64) {
            this.Value += 7;
            return;
        }
        if (this.Value >= 32) {
            this.Value += 6;
            return;
        }
        if (this.Value >= 16) {
            this.Value += 5;
            return;
        }
        if (this.Value >= 8) {
            this.Value += 4;
            return;
        }
        if (this.Value >= 4) {
            this.Value += 3;
            return;
        }
        if (this.Value >= 2) {
            this.Value += 2;
            return;
        }
        if (this.Value >= 1) {
            this.Value += 1;
            return;
        }
    };
    Cell.prototype.AddValue = function (value, playerID) {
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
    };
    return Cell;
}());
/// <reference path="Cell.ts" />
var GameState = (function () {
    function GameState(dim) {
        this.dimension = 8;
        this.round = 0;
        this.winner = 0;
        this.dimension = dim;
        this.cells = new Array(dim * dim);
        var counter = 0;
        for (var y = 0; y < this.dimension; y++) {
            for (var x = 0; x < this.dimension; x++) {
                this.cells[counter] = new Cell(y, x);
                counter++;
            }
        }
    }
    GameState.prototype.GetIndexFromPos = function (row, col) {
        return row * this.dimension + col;
    };
    GameState.prototype.GetCell = function (row, col) {
        return this.cells[this.GetIndexFromPos(row, col)];
    };
    GameState.prototype.GetCellByIndex = function (index) {
        return this.cells[index];
    };
    GameState.prototype.CellsOfThread = function (ThreadID) {
        return this.cells.filter(function (c) { return c.Owner == ThreadID; });
    };
    GameState.prototype.GetCells = function () {
        return this.cells;
    };
    GameState.prototype.GetCellsAround = function (row, col) {
        var result = [];
        //NW, W, SW
        if (col > 0) {
            result.push(this.cells[this.GetIndexFromPos(row, col - 1)]);
            if (row > 0) {
                result.push(this.cells[this.GetIndexFromPos(row - 1, col - 1)]);
            }
            if (row < this.dimension - 1) {
                result.push(this.cells[this.GetIndexFromPos(row + 1, col - 1)]);
            }
        }
        //N , S
        if (row > 0) {
            result.push(this.cells[this.GetIndexFromPos(row - 1, col)]);
        }
        if (row < this.dimension - 1) {
            result.push(this.cells[this.GetIndexFromPos(row + 1, col)]);
        }
        //NE , E , SE
        if (col < this.dimension - 1) {
            result.push(this.cells[this.GetIndexFromPos(row, col + 1)]);
            if (row > 0) {
                result.push(this.cells[this.GetIndexFromPos(row - 1, col + 1)]);
            }
            if (row < this.dimension - 1) {
                result.push(this.cells[this.GetIndexFromPos(row + 1, col + 1)]);
            }
        }
        return result;
    };
    GameState.prototype.Clone = function () {
        var result = new GameState(this.dimension);
        result.winner = this.winner;
        result.round = this.round;
        for (var i = 0; i < this.cells.length; i++) {
            result.cells[i] = this.cells[i].Clone();
        }
        return result;
    };
    //stats helper functions
    GameState.prototype.CellsOccupied = function (ThreadID) {
        return this.CellsOfThread(ThreadID).length;
    };
    GameState.prototype.CellsThread1 = function () { return this.CellsOccupied(1); };
    GameState.prototype.CellsThread2 = function () { return this.CellsOccupied(2); };
    GameState.prototype.CellsValue = function (ThreadID) {
        var sum = 0;
        this.CellsOfThread(ThreadID).forEach(function (c) { return sum += c.Value; });
        return sum;
    };
    GameState.prototype.CellsValue1 = function () { return this.CellsValue(1); };
    GameState.prototype.CellsValue2 = function () { return this.CellsValue(2); };
    return GameState;
}());
var ThreadAction = (function () {
    function ThreadAction(threadID, sourceIndex, destIndex, count) {
        this.threadID = threadID;
        this.sourceIndex = sourceIndex;
        this.destIndex = destIndex;
        this.count = count;
    }
    return ThreadAction;
}());
/// <reference path="ThreadAction" />
/// <reference path="GameState" />
/// <reference path="GameState" />
/// <reference path="ThreadAction" />
/// <reference path="IThreadEngine" />
/// <reference path="Cell" />
var Simulator = (function () {
    function Simulator(player1, player2) {
        this.maxRounds = 2000;
        this.dimension = 8;
        this.statehistory = [];
        this.actionhistory = [];
        this.state = new GameState(this.dimension);
        this.player1 = player1;
        this.player2 = player2;
        //initialize positions of players.
        this.state.GetCell(0, 0).Owner = 1;
        this.state.GetCell(0, 0).Value = 1;
        this.state.GetCell(this.dimension - 1, this.dimension - 1).Owner = 2;
        this.state.GetCell(this.dimension - 1, this.dimension - 1).Value = 1;
    }
    Simulator.prototype.PlayGame = function () {
        while (this.state.winner == 0) {
            this.DoRound();
        }
    };
    Simulator.prototype.DoRound = function () {
        var _this = this;
        var actions = [];
        //TODO forge prevention?
        this.player1.GetActions(this.state).forEach(function (a) { return actions.push(a); });
        this.player2.GetActions(this.state).forEach(function (a) { return actions.push(a); });
        //LOG state & action
        this.statehistory.push(this.state.Clone());
        this.actionhistory.push(actions);
        //make sure all actions are valid
        actions.forEach(function (action) {
            if (!_this.ValidateAction(action)) {
                _this.state.winner = (action.threadID == 1 ? 2 : 1);
            }
        });
        // zat er een illegale move tussen? 
        if (this.state.winner != 0) {
            return false;
        }
        // moves uitvoeren , hou een lijst bij met Cell 
        // 
        var touchedCells = [];
        var c;
        //
        actions.forEach(function (action) {
            c = _this.state.GetCellByIndex(action.sourceIndex);
            c.Value -= action.count;
            touchedCells.push(c);
        });
        actions.forEach(function (action) {
            c = _this.state.GetCellByIndex(action.destIndex);
            c.AddValue(action.count, action.threadID);
            touchedCells.push(c);
        });
        // upgrade untouched cells voltage;
        this.state.GetCells().forEach(function (cell) {
            if (touchedCells.indexOf(cell) == -1) {
                cell.UpgradeValue();
            }
        });
        // ronde is klaar! iemand verslagen?
        var cells1 = this.state.CellsThread1();
        var cells2 = this.state.CellsThread2();
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
                    var val1 = this.state.CellsValue1();
                    var val2 = this.state.CellsValue2();
                    if (val1 == val2) {
                        this.state.winner = 1;
                    }
                    else {
                        this.state.winner = val1 > val2 ? 1 : 2;
                    }
                }
                else {
                    this.state.winner = cells1 > cells2 ? 1 : 2;
                }
            }
        }
        return (this.state.winner == 0);
    };
    Simulator.prototype.ValidateAction = function (action) {
        var isValid = true;
        //  is bronplek van playerid
        if (this.state.GetCellByIndex(action.sourceIndex).Owner != action.threadID) {
            isValid = false;
        }
        //  is voldoende aanwezig?
        if (this.state.GetCellByIndex(action.sourceIndex).Value < action.count) {
            isValid = false;
        }
        //  is bestemming in straal van 1 vakje
        //if (Math.Abs(action.fromCol - action.toCol) > 1) { isValid = false; }
        //if (Math.Abs(action.fromRow - action.toRow) > 1) { isValid = false; }
        return isValid;
    };
    return Simulator;
}());
/// <reference path="Simulator" />
var Runner = (function () {
    function Runner(element) {
        this.activeState = null;
        this.activeActions = null;
        this.activeAction = null;
        this.element = element;
        this.element.innerHTML = "<h5>Memory chip</h5>";
        this.sim = new Simulator(new SampleEngine(1), new SampleEngine(2));
        //built initial output
        var te = document.createElement("table");
        te.className = "simulator";
        for (var row = 0; row < this.sim.dimension; row++) {
            var tr = te.insertRow();
            for (var col = 0; col < this.sim.dimension; col++) {
                var tc = tr.insertCell();
                tc.id = "r" + row.toString() + "c" + col.toString();
            }
        }
        this.element.appendChild(te);
    }
    Runner.prototype.setStep = function (step) {
        this.activeAction = null;
        this.curStep = parseInt(step);
        this.activeState = this.sim.statehistory[step];
        this.activeActions = this.sim.actionhistory[step];
        this.output();
    };
    Runner.prototype.incStep = function () {
        if (this.curStep < this.sim.state.round) {
            this.setStep(this.curStep + 1);
        }
    };
    Runner.prototype.decStep = function () {
        var step = this.curStep - 1;
        if (step < 0) {
            step = 0;
        }
        this.setStep(step);
    };
    Runner.prototype.lastStep = function () {
        var step = this.sim.state.round - 1;
        this.setStep(step);
    };
    Runner.prototype.output = function () {
        if (this.activeState != null) {
            this.activeState.GetCells().forEach(function (c) {
                var tc = document.getElementById("r" + c.Row + "c" + c.Col);
                tc.innerText = c.Value.toString();
                tc.className = "";
                if (c.Owner == 1) {
                    tc.className = "td1";
                }
                if (c.Owner == 2) {
                    tc.className = "td2";
                }
            });
        }
        //update actions
        var act1 = document.getElementById("actions1");
        var act2 = document.getElementById("actions2");
        act1.innerHTML = "";
        act2.innerHTML = "";
        if (this.activeActions != null) {
            this.activeActions.forEach(function (action) {
                var x = document.createElement("option");
                x.value = JSON.stringify(action);
                x.text = action.sourceIndex + " -> " + action.destIndex + " = " + action.count;
                if (action.threadID == 1) {
                    act1.add(x);
                }
                else {
                    act2.add(x);
                }
            });
        }
        act1.size = act1.children.length + 1;
        act2.size = act2.children.length + 1;
        act1.value = null;
        act2.value = null;
        //update debug info
        var dbg = document.getElementById("debuginfo");
        if (dbg != null) {
            dbg.innerText = this.curStep.toString() + " of " + this.sim.state.round.toString();
        }
        //
        if (this.activeAction != null) {
            //source 
            var row = Math.floor(this.activeAction.sourceIndex / this.sim.dimension);
            var col = this.activeAction.sourceIndex - row * this.sim.dimension;
            var tc = document.getElementById("r" + row + "c" + col);
            tc.className += " tdselect";
            //tc.innerText += "->";
            //dest
            var row = Math.floor(this.activeAction.destIndex / this.sim.dimension);
            var col = this.activeAction.destIndex - row * this.sim.dimension;
            var tc = document.getElementById("r" + row + "c" + col);
            tc.className += " tdselect";
        }
    };
    Runner.prototype.start = function () {
        var _this = this;
        //
        clearTimeout(this.timerToken);
        var e1 = this.getEngineByName(this.getSelectedEngineName(1), 1);
        var e2 = this.getEngineByName(this.getSelectedEngineName(2), 2);
        this.sim = new Simulator(e1, e2);
        //var e = <HTMLInputElement>document.getElementById("currentRound");
        //e.value = "0";
        //e.max = "0";
        this.activeState = null;
        this.activeActions = null;
        this.activeAction = null;
        this.curStep = 0;
        this.timerToken = setInterval(function () {
            _this.sim.DoRound();
            _this.setStep(_this.sim.state.round - 1);
            //this.output();
            if (_this.sim.state.winner != 0) {
                _this.stop();
            }
        }, 10);
    };
    Runner.prototype.showAction = function (id, value) {
        if (value != null) {
            var act1 = document.getElementById("actions" + id);
            if (act1 != null) {
                this.activeAction = JSON.parse(act1.value);
            }
            this.output();
        }
    };
    Runner.prototype.stop = function () {
        clearTimeout(this.timerToken);
    };
    Runner.prototype.getSelectedEngineName = function (id) {
        var e = document.getElementById("engine" + id);
        return e.value;
    };
    Runner.prototype.getEngineByName = function (name, id) {
        if (name == "v1") {
            return new SimpleEngine(id);
        }
        if (name == "v2") {
            return new SampleEngine(id);
        }
        return null;
    };
    return Runner;
}());
/// <reference path="IThreadEngine" />
/// <reference path="ThreadAction" />
/// <reference path="GameState" />
/// <reference path="Cell" />
var SimpleEngine = (function () {
    function SimpleEngine(ThreadID) {
        this.threadID = ThreadID;
    }
    SimpleEngine.prototype.GetActions = function (state) {
        var _this = this;
        var result = [];
        //bekijken eigen cellen
        var myCells = state.CellsOfThread(this.threadID);
        myCells.forEach(function (mycell) {
            if (mycell.Value > 1) {
                if (Math.random() > 0.7) {
                    //get valid surrounding cells
                    var surroundingCells = state.GetCellsAround(mycell.Row, mycell.Col);
                    var dest = surroundingCells[0];
                    //pick random cell.
                    var ndx = Math.floor(Math.random() * surroundingCells.length);
                    dest = surroundingCells[ndx];
                    //transfer 50% of the current value
                    var transferValue = Math.floor(mycell.Value / 2);
                    //record our action
                    var sourceIndex = mycell.Row * state.dimension + mycell.Col;
                    var destIndex = dest.Row * state.dimension + dest.Col;
                    result.push(new ThreadAction(_this.threadID, sourceIndex, destIndex, transferValue));
                }
            }
        });
        return result;
    };
    return SimpleEngine;
}());
var SampleEngine = (function () {
    function SampleEngine(ThreadID) {
        this.threadID = ThreadID;
    }
    SampleEngine.getDescription = function () {
        return "Per cell change of 1/value to get into action. Select destination strategy: 1.free 2.enemy 3.own cell. Random transfer value";
    };
    SampleEngine.prototype.GetActions = function (state) {
        var _this = this;
        //
        var result = [];
        //bekijken eigen cellen
        var myCells = state.CellsOfThread(this.threadID);
        myCells.forEach(function (mycell) {
            if (mycell.Value > 1) {
                //kans van 2 tot 255 
                if (Math.random() > (1.0 - (mycell.Value / 255.0))) {
                    //omliggende cellen opvragren en pick er eentje..
                    var surroundingCells = state.GetCellsAround(mycell.Row, mycell.Col);
                    var dest = surroundingCells[0];
                    //pick random cell.
                    var emptySourrce = surroundingCells.filter(function (c) { return c.Owner == 0; });
                    var otherPlayer = _this.threadID == 1 ? 2 : 1;
                    if (emptySourrce.length > 0) {
                        var ndx = Math.floor(Math.random() * emptySourrce.length);
                        dest = emptySourrce[ndx];
                    }
                    else {
                        var enenySource = surroundingCells.filter(function (c) { return c.Owner == otherPlayer; });
                        if (enenySource.length > 0) {
                            var ndx = Math.floor(Math.random() * enenySource.length);
                            dest = enenySource[ndx];
                        }
                        else {
                            var ndx = Math.floor(Math.random() * surroundingCells.length);
                            dest = surroundingCells[ndx];
                        }
                    }
                    //pick random value to transfer
                    var transferValue = Math.floor(Math.random() * (mycell.Value - 1)) + 1;
                    //leg de actie vast
                    var sourceIndex = mycell.Row * state.dimension + mycell.Col;
                    var destIndex = dest.Row * state.dimension + dest.Col;
                    result.push(new ThreadAction(_this.threadID, sourceIndex, destIndex, transferValue));
                }
            }
        });
        return result;
    };
    return SampleEngine;
}());
//# sourceMappingURL=app.js.map