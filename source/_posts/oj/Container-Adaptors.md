---
title: Container Adaptors
cover: https://source.fomal.cc/img/default_cover_26.webp
tags: stl
description: >-
  queue, priority_queue, stack in STL, provide a different interface for
  sequential containers
katex: true
abbrlink: ccea3865
date: 2024-05-28 10:06:16
---

## queue
由 `deque` 或者 `list` 实现。

### 初始化
```c++
std::queue<int> myQueue {1, 2, 3, 4, 5};
std::queue<int> anotherQueue(myQueue); // 拷贝函数
```

### 方法
`.empty()`
`.size()`
`.front()`：返回队首元素
`.back()`：返回队尾元素
`.push(g)`：在队尾塞入元素
`.emplace()`：同上，但是不会构造临时变量
`.pop()`：从队首弹出元素

上述方法操作的时间复杂度均为 $O(1)$

## priority_queue
使用堆来实现，底层容器为 `vector` 或其他支持 `front()`, `push_back()` 和 `pop_back()` 的容器。

### 初始化
```c++
priority_queue<int> pq; // 默认构造的是最大堆
priority_queue <int, vector<int>, greater<int>> gq; // 构造最小堆

struct MyComparator {
    bool operator()(int a, int b) {
        return a > b; // 这里定义的是大顶堆，也可以根据需要定义小顶堆
    }
};
priority_queue<int, vector<int>, MyComparator> myPriorityQueue; // 使用自定义比较函数初始化优先级队列

priority_queue<int> myPriorityQueue {3, 1, 4, 1, 5}; // 使用初始化列表

int arr[6] = { 10, 2, 4, 8, 6, 9 };
priority_queue<int, vector<int>, greater<int> > gq(arr, arr + 6); // 使用数组
```

### 方法
* `.empty()`
* `.size()`
* `.top()` 返回堆顶元素，$O(1)$
* `.push()` 加入元素，$O(\log N)$
* `.emplace()` 
* `.pop()` 弹出堆顶元素，$O(\log N)$

## stack
底层容器可以为 `vector`, `deque`(default), `list`。

### 方法
* `.empty()`
* `.size()`
* `.top()` 
* `.push()` 
* `.pop()` 


