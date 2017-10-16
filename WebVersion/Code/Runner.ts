/// <reference path="Simulator" />

class Runner {
    element: HTMLElement;
    timerToken: number;

    sim: Simulator;

    curStep: number;
    activeState: GameState = null;
    activeActions: ThreadAction[] = null;
    activeAction: ThreadAction= null;

    constructor(element: HTMLElement) {
        this.element = element;
        this.element.innerHTML = "<h5>Memory chip</h5>";
        this.sim = new Simulator(new SampleEngine(1), new SampleEngine(2));
        //built initial output

        var te: HTMLTableElement = document.createElement("table");
        te.className = "simulator";
   
        for (var row = 0; row < this.sim.dimension; row++) {
            var tr = te.insertRow();
            for (var col = 0; col < this.sim.dimension; col++) {
                var tc = tr.insertCell();
                tc.id = "r" + row.toString() + "c"  +col.toString();
            }
        }

        this.element.appendChild(te);
    }

 
     setStep(step) {
         this.activeAction = null;
        this.curStep = parseInt(step);
        this.activeState = this.sim.statehistory[step];
        this.activeActions = this.sim.actionhistory[step];
        this.output();
    }

     incStep() {
         if (this.curStep < this.sim.state.round) {
             this.setStep(this.curStep + 1);
         }
    }

    decStep() {
        var step = this.curStep - 1;
        if (step < 0) {
            step = 0;
        }
        this.setStep(step);
    }

    lastStep() {
        var step = this.sim.state.round - 1;
        this.setStep(step);
    }


    output() {
        if (this.activeState != null) {
            this.activeState.GetCells().forEach((c) => {
                var tc: HTMLTableCellElement = <HTMLTableCellElement>document.getElementById("r" + c.Row + "c" + c.Col);
                tc.innerText = c.Value.toString();
                tc.className = "";
             
                if (c.Owner == 1) { tc.className = "td1"; } 
                if (c.Owner == 2) { tc.className = "td2"; } 
            });
        }

        //update actions
        var act1 = <HTMLSelectElement>document.getElementById("actions1");
        var act2 = <HTMLSelectElement>document.getElementById("actions2");
        act1.innerHTML = "";
        act2.innerHTML = "";

        if (this.activeActions != null) {
            this.activeActions.forEach((action) => {
                var x = document.createElement("option");
                x.value = JSON.stringify(action);
                x.text = action.sourceIndex + " -> " + action.destIndex + " = " + action.count;

                if (action.threadID == 1) { act1.add(x); } else { act2.add(x); }
            });
        }
        act1.size = act1.children.length+1;
        act2.size = act2.children.length+1;

        act1.value = null;
        act2.value = null;

        //update debug info

        var dbg = <HTMLSpanElement>document.getElementById("debuginfo");
        if (dbg != null) {
            dbg.innerText = this.curStep.toString() + " of " + this.sim.state.round.toString();
        }

        //
        if (this.activeAction != null) {
            //source 
            var row = Math.floor(this.activeAction.sourceIndex / this.sim.dimension);
            var col = this.activeAction.sourceIndex - row * this.sim.dimension;
            var tc: HTMLTableCellElement = <HTMLTableCellElement>document.getElementById("r" + row + "c" + col);
            tc.className += " tdselect";
            //tc.innerText += "->";
            //dest
            var row = Math.floor(this.activeAction.destIndex / this.sim.dimension);
            var col = this.activeAction.destIndex - row * this.sim.dimension;
            var tc: HTMLTableCellElement = <HTMLTableCellElement>document.getElementById("r" + row + "c" + col);
            tc.className += " tdselect";
            //tc.innerText = "->" + tc.innerText;

        }
      
    }

    start() {
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
        
        this.timerToken = setInterval(() => {
            this.sim.DoRound();
            this.setStep(this.sim.state.round-1);
            //this.output();
            if (this.sim.state.winner != 0) {
                this.stop();
            }
        }, 10);
    }

    showAction(id: number, value: string) {
        if (value != null) {
            var act1 = <HTMLSelectElement>document.getElementById("actions" + id);
            if (act1 != null) {
                this.activeAction = JSON.parse(act1.value)
            }
            this.output();
        }
    }


    stop() {
        clearTimeout(this.timerToken);
    }

    getSelectedEngineName(id: number): string {
        var e = <HTMLSelectElement>document.getElementById("engine" + id);
        return e.value;
    }

    getEngineByName(name: string, id: number): IThreadEngine {
        if (name == "v1") {
            return new SimpleEngine(id);
        }
        if (name == "v2") {
            return new SampleEngine(id);
        }
        return null;
    }

}
