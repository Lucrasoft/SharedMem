using SharedMemLib;
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace SharedMemGUI
{

    //implementatie van de IThreadEngine, die via Standard IO zijn opdrachten uitwisselt.
    public class ConsoleEngine : IThreadEngine
    {
        private readonly Process process;
        private readonly int threadId;

        public ConsoleEngine(int threadId, int dimension, string appname, string args, string workingDirectory)
        {
            this.threadId = threadId;

            process = new Process
            {
                StartInfo =
                {
                    FileName = appname,
                    Arguments = args,
                    WorkingDirectory = (string.IsNullOrEmpty(workingDirectory) ? 
                                                System.IO.Path.GetDirectoryName(appname) : workingDirectory) ,
                    CreateNoWindow = true,
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardInput = true,
                    LoadUserProfile = false
                }
            };
            
            process.Start();

            //send initialize line
            process.StandardInput.WriteLine(dimension + " " + threadId);
        }
        
        public List<ThreadAction> GetActions(GameState state)
        {
            //send state to Process
            for (var row = 0; row < state.Dimension; row++)
            {
                process.StandardInput.WriteLine(state.GetCellValues(row));
            }

            //receive as much data as possible, until ENTER..
            var result = new List<ThreadAction>();
            var line = process.StandardOutput.ReadLine();
            while (line?.Length > 0)
            {
                //usefull line consists of source cell, dest cell, transfervalue
                var lineparts = line.Split(' ');
                int sourIndex = int.Parse(lineparts[0]);
                int destIndex = int.Parse(lineparts[1]);
                int transfer = int.Parse(lineparts[2]);

                result.Add(new ThreadAction(threadId, sourIndex, destIndex, transfer));
                line = process.StandardOutput.ReadLine();
            }
            
            return result;
        }

        public void Dispose()
        {
            if (process?.HasExited == false)
                process?.Kill();

            process?.Dispose();
        }
    }
}
