---
title: Chapter2-Operating System Structures
cover: https://source.fomal.cc/img/default_cover_65.webp
categories: [Lecture Notes, Operating System]
abbrlink: e6abb60
order: 2
date: 2023-03-16 22:47:21
tags:
description: 操作系统笔记
---

## Operating-System Services
* **User interface**. graphical user interface (***GUI***), touch-screen interface, command-line interface (***CLI***)
* **Program execution**
* **I/O operations**
* **File-system manipulation**
* **Communications**
* **Error detection**

Another set of operating-system functions exists not for helping the user but rather for ensuring the efficient operation of the system itself. 
* **Resource allocation**
* **Logging**
* **Protection and security**

<div align=center>
<img src="../../figure/operating-system/Chapter2-Operating%20System%20Structures/OS_services.png" width=600>
</div>

## System Calls
***System calls*** provide an **interface** to the services made available by an operating system. 

### Example
Let’s first use an example to illustrate how system calls are used: `cp in.txt out.txt`
<div align=center>
<img src="../../figure/operating-system/chapter2/../Chapter2-Operating%20System%20Structures/example_sys_call.png" width=500>
</div>

### Application Programming Interface
Typically, application developers design programs according to an ***application programming interface (API)*** .A programmer accesses an API via a library of code provided by the operating system. 

Behind the scenes, the functions that make up an API typically **invoke the actual system calls** on behalf of the application programmer. 

Another important factor in handling system calls is the ***run-time environment (RTE)*** (a full suite of software).The RTE provides a ***system-call interface*** that intercepts function calls in the API and invokes the necessary system calls within the operating system.Typically, a **number** is associated with each system call, and the system-call interface maintains a **table indexed** according to these numbers.
<div align=center>
<img src="../../figure/operating-system/Chapter2-Operating%20System%20Structures/API_sys_call.png" width=600>
</div>

## Operating-System Structure
### Monolithic Structure
The simplest structure, placing all of the functionality of the kernel into a single, static binary file that runs in a single address space.

Example: original UNIX operating system, which consists of two separable parts: the **kernel** and the **system programs**.
The kernel is further separated into a series of interfaces and device drivers, which have been added and expanded over the years as UNIX has evolved. 

<div align=center>
<img src="../../figure/operating-system/Chapter2-Operating%20System%20Structures/traditional_UNIX_structure.png" width=500>
</div>

### Layered Approach
***tightly coupled system***: changes to one part of the system can have wide-ranging effects on other parts.
***loosely coupled system***: Such a system is divided into separate, smaller components that have specific and limited functionality. 

The advantage of this **modular approach**: changes in one component affect only that component, and no others, allowing system implementers more freedom in creating and changing the inner workings of the system.

A system can be made modular in many ways. One method is the ***layered approach***.

<div align=center>
<img src="../../figure/operating-system/Chapter2-Operating%20System%20Structures/latyered_OS.png" width=350>
</div>

Advantage: simplicity of construction and debugging. 
Disadvantage: the overall performance of such systems is poor (due to the overhead of requiring a user program to traverse through multiple layers to obtain an operating-system service)

### Microkernels
***microkernel*** approach: structures the operating system by removing all nonessential components from the kernel and implementing them as user-level programs that reside in separate address spaces.(移除所有不必要的功能)

The main function of the microkernel is to provide **communication** between the **client program** and the various **services** that are also running in **user space**.

Advantage: 
* it makes extending the operating system easier.( The resulting operating system is easier to port from one hardware design to another.)
* provides more security and reliability.(most services are running as user—rather than kernel—processes.)

Disadvantage:
*  the performance of microkernels can suffer due to increased system-function overhead. 

## Building and Booting an Operating System
### System Boot
