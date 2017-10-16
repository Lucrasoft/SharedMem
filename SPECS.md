# Specifications of SharedMem chips

## Cell working

Our memory chips comes in different sizes, but always regular square pattern. The default layout is a chip with 8x8 cells.

A *single cell* is capable of storing a complete *byte* of information.

The memory controller is limited but sufficient for this competition. The only operation possible is to move a part of the value of a cell to its neighbor cell. A neighbor cell must be horizontal, vertical or diagonal attached in the layout of the cells. 

The controller works as follows:

### Initialization phase
- Threads are notified of their ThreadID; Threads know their starting position based on this ThreadID, which is either 1 or 2.  
- Every thread gets a value of 1 in their starting cell.

### Running phase
The main loop of the controller is 
- Report the current state of memory to the threads
- Ask the threads for instructions
- Validate instructions
- Execute instructions of threads
- Upgrade untouched cells with additional value.
- Repeat until winning thread or maximum rounds achieved.



## Command

The memory controller only supports one instruction, which is called a `MOV` operation. This command moves some value from a source cell you own to a neighbour destination.

    MOV [source] [dest] [amount] 

Restrictions are:

- You must own the source cell.
- The destination cell must be directly near the source cell, either horizontal, vertical or diagonal.
- You cannot transfer more than the amount in the source cell.
- During a single clock cycle (or loop), you can use a source cell only once, for one transfer!

In case you give an illegal instruction, you will lose.

There is no limit on the number of operations besides the fact that you cannot give more `MOV` operations then you own cells, due to the restrictions above.

## Cell value 

Every cell, with at least a value above zero, and which is NOT used during a clock cycle, will automatically gain value. A cell is considered used (for one cycle) when it is part of a `MOV` command 
- either directly; as source or target of your thread
- indirectly; as being the target of your components thread.

The gain per round is defined as 'the bit-length of the byte value'. Which results in the following cell-value-gain table:

| Byte value | Growth
| - | -
| 128 - 255| 8+
| 64 - 127| 7+
| 32 - 64 | 6+
| 16 - 31| 5+
| 8 - 15 | 4+
| 4 -7 | 3+
| 2 -3 | 2+
| 1 | 1+

Cell value is limited to a maximum of 255 and a minimum of 0. 



## Initial value 

Two threads are supported by the controller. The assigned thread-id's are 1 or 2. 

- threadid 1 is assigned in the first cell of the chip. It is in column 0 and row 0. And mentioned as T1 Starting Position (SP) below.
- threadid 2 is assigned the last cell. In a 4x4 cell it would be column 3, row 3. In the diagram below it is T2

For a 4x4 memory chip, the location of the initial value per thread is:

|  | c0 | c1 | c2 | c3 
|-|-|-|-|-
| r0 | T1 SP | - | - | -
| r1 | - | - | - | -                                 
| r2 | - | - | - | -
| r3 | - | - | - | T2 SP  

*SP = Starting position*

## Operation details 

The order of your own commands is not important, however when two threads have the same destination, thread 1 operations will be executed before thread 2. This ordering is especially important in complex cases like: a cell is already owned and is used in a source command and is used as a  destination of both threads. This ruling gives a defense/offense bias between the threads.  

### Two phase
After receiving the commands from both threads, the controller will perform the mov operations in two phases. These phasing and ordering is important because of the value range [0-255] which can not exceed in any phase or command. 

Phase 1: The value of all source cells is changed at once. 

After the new values of, the second phase execute as follows:

Phase 2: All destination cells are updated; First thread 1 destinations are updated, followed by thread 2.


## Winning & Maximum rounds 

The maximum number of rounds is currently set to 5000.

In case none of the threads can gain full control of the memory chip within the maximum rounds, the winning thread is decided as follows:

1. The thread owning the most memory cells wins.
2. In case step 1 is a draw, the thread with the highest total cell value wins. 
3. In case step 2 is a draw, thread number 2 wins.

