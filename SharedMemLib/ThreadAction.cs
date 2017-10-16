namespace SharedMemLib
{
    public class ThreadAction
    {
        public int ThreadId { get; }
        public int SourceIndex { get; }
        public int DestIndex { get; }
        public int Count { get; }

        public ThreadAction(int threadId, int sourceIndex,int destIndex, int count)
        {
            ThreadId = threadId;
            SourceIndex = sourceIndex;
            DestIndex = destIndex;

            Count = count;
        }

        public override string ToString()
        {
            return $"[{ThreadId}] : {SourceIndex}->{DestIndex} ({Count})";
        }
    }
}
