# SharedMemory Code Competition



Welcome to the Lucrasoft 2017 Code Competition challenge. 

Quick links are
- [Specification of memory chip](SPECS.md)
- [Communication protocol](COMMUNICATION.md)
- [Competition details](COMPETITION.md)
- [Web demo](https://lucrasoft.github.io/SharedMem/)

## Introduction

After the presentation of our [CPU500x processor](https://github.com/Lucrasoft/CPU500x) in 2015, we bring you the next step of innovation: Lucrasoft's 64-cell memory chip with integrated controller and byte-per-cell capacity. 

Our custom-designed controller can support 2 threads simultaneously. Due to the 2D  structured layout of our cells (8x8 cells in our default configuration) we plan to support even bigger chips as well. Research Department is looking into a 12x12 and 16x16 structures.

## Specifications

You can find the details and specifications of our memory chip [here](SPECS.md), as well as the communication protocol between your code and the memory controller.

## Competition

In this competition your code/thread must compete with another thread to gain the complete capacity of the memory! 

Both threads start with the ownership of a single cell. By smart planning of your instructions to the controller, your thread must get full ownership of all the cells.

Other competitions exists as well. [Competition details](COMPETITION.md)





