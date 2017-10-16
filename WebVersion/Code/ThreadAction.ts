class ThreadAction {
    public threadID: number;
    public sourceIndex: number;
    public destIndex: number;
    public count: number;

    constructor(threadID: number, sourceIndex: number, destIndex: number, count: number) {
        this.threadID = threadID;
        this.sourceIndex = sourceIndex;
        this.destIndex = destIndex;
        this.count = count;
    }


}


