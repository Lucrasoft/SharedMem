using System;
using System.Collections.Generic;

namespace SharedMemLib
{
    public interface IThreadEngine : IDisposable
    {
        List<ThreadAction> GetActions(GameState state);
    }
}
