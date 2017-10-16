/// <reference path="ThreadAction" />
/// <reference path="GameState" />


interface IThreadEngine {

    GetActions(state: GameState): ThreadAction[];
    
}
