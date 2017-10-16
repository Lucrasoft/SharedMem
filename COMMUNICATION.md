# Communication

Communication between our memory controller and your thread is done by Standard I/O alias the Console. So you can use any standard i/o enabled language to develop your thread.

## Boot proces

Communication is initialized and the controller will send one line containing essential information about the dimension of the actual memory chip and the thread-id that is assigned to you.

Example:

    8   2

Which you can interpret as a 8x8 chip and your active thread id is 2. See chip specifications for the different ThreadID's and their initial cell locations. 

## Controller loop

Controller sends the actual memory information in the following format to both of the threads:

- a line per row
- each line contains the values, separated by space, of the cells in the columns.
- thread 1 owned cells are displayed as positive values
- thread 2 owned cells negative. 

Based on a 4x4 memory cell, just after the initialisation, the output of the controller is:

    1 0 0 0
    0 0 0 0
    0 0 0 0
    0 0 0 -1

Your thread can respond with `mov` commands in the following format, without the mov, separated by spaces:

    [sourceindex] [destindex] [values]

You must *end* your list of commands with an empty line!

Example 

    0 5 4
    12 13 200
    <empty line>

Moves 4 value from cell 0 to cell 5 and move 200 value from cell 12 to cell 13. 

Keep in mind the restrictions of the mov command as mentioned in the specifications! A single false command results in loosing.

Your thread must response in 'fair' amount of time (decided later, but for now, keep a maximum of 500 ms)

## Starterkit

A C# sample implementation is provided in the repository. See: ThreadSample1





