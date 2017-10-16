declare class Cell {
    private maxValue;
    Owner: number;
    Value: number;
    Row: number;
    Col: number;
    constructor(row: number, col: number);
    Clone(): Cell;
    UpgradeValue(): void;
    AddValue(value: number, playerID: number): void;
}
declare class GameState {
    private cells;
    dimension: number;
    round: number;
    winner: number;
    GetIndexFromPos(row: number, col: number): number;
    GetCell(row: number, col: number): Cell;
    GetCellByIndex(index: number): Cell;
    CellsOfThread(ThreadID: number): Cell[];
    GetCells(): Cell[];
    GetCellsAround(row: number, col: number): Cell[];
    Clone(): GameState;
    constructor(dim: number);
    CellsOccupied(ThreadID: number): number;
    CellsThread1(): number;
    CellsThread2(): number;
    CellsValue(ThreadID: number): number;
    CellsValue1(): number;
    CellsValue2(): number;
}
declare class ThreadAction {
    threadID: number;
    sourceIndex: number;
    destIndex: number;
    count: number;
    constructor(threadID: number, sourceIndex: number, destIndex: number, count: number);
}
interface IThreadEngine {
    GetActions(state: GameState): ThreadAction[];
}
declare class Simulator {
    private maxRounds;
    dimension: number;
    state: GameState;
    player1: IThreadEngine;
    player2: IThreadEngine;
    statehistory: GameState[];
    actionhistory: ThreadAction[][];
    constructor(player1: IThreadEngine, player2: IThreadEngine);
    PlayGame(): void;
    DoRound(): boolean;
    ValidateAction(action: ThreadAction): boolean;
}
declare class Runner {
    element: HTMLElement;
    timerToken: number;
    sim: Simulator;
    curStep: number;
    activeState: GameState;
    activeActions: ThreadAction[];
    activeAction: ThreadAction;
    constructor(element: HTMLElement);
    setStep(step: any): void;
    incStep(): void;
    decStep(): void;
    lastStep(): void;
    output(): void;
    start(): void;
    showAction(id: number, value: string): void;
    stop(): void;
    getSelectedEngineName(id: number): string;
    getEngineByName(name: string, id: number): IThreadEngine;
}
declare class SimpleEngine implements IThreadEngine {
    private threadID;
    constructor(ThreadID: number);
    GetActions(state: GameState): ThreadAction[];
}
declare class SampleEngine implements IThreadEngine {
    private threadID;
    constructor(ThreadID: number);
    static getDescription(): string;
    GetActions(state: GameState): ThreadAction[];
}
