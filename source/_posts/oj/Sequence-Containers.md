---
title: Sequence Containers
cover: https://source.fomal.cc/img/default_cover_27.webp
tags: stl
description: 'vector, deque, array in STL'
katex: true
abbrlink: ecd8965f
date: 2024-05-28 01:14:42
categories: [Algorithms, Online Judge]

---

## vector
使用动态数组实现

### 初始化
初始化方法有：
```c++
vector<dataType> name({ value1, value2, value3 ....}); // 逐个指定元素
vector<dataType> name(size, value);  // 指定有 size 个 value
vector<dataType> name(other_vec); // 从其他 vector 复制得到
```

如果要初始化二维的 vector，可以：
* 使用默认构造函数和嵌套的 `std::vector` 创建一个空的二维 `std::vector`，然后使用嵌套的 `push_back()` 方法逐行添加元素。
```c++
std::vector<std::vector<int>> myVector;  // 创建一个空的二维 vector
myVector.push_back({1, 2, 3});
myVector.push_back({4, 5, 6});
myVector.push_back({7, 8, 9});
```
* 使用初始化列表和嵌套的初始化列表初始化二维 `std::vector`。
```c++
std::vector<std::vector<int>> myVector = {
        {1, 2, 3},  // 第一行
        {4, 5, 6},  // 第二行
        {7, 8, 9}   // 第三行 
    };
```
* 使用构造函数和嵌套的 `std::vector`，并指定行数和列数。
```c++
std::vector<std::vector<int>> myVector(3, std::vector<int>(3, 0));
// 创建一个 3x3 的二维 vector，每个元素的初始值为 0
```

### 方法
* `.begin()` 返回 vector 中第一个元素的 iterator
* `.end()` 返回 vector 中最后一个元素后面的 iterator
* `.front()`, `.back()` 分别返回第一个和最后一个元素的值
* `.size()` 返回 vector 大小
* `.max_size()` 返回目前最多能装多少元素
* `.empty()` 是否为空
* `.reserve(n)` 将动态数组的大小扩充至 $n$
* `.resize(n)` 将当前 `.size()` 变成 $n$，会填充或删除某些元素
* `.at(i)` 返回第 $i$ 个位置的值
* `push_back(value)` 将 `value` 塞至最后
* `emplace_back(value)` 在某些情况下同上。理想情况能省空间。
* `insert()` 有多种用法
  * 插入单个元素 `insert(position, value)`，例如
  ```c++
  vector_name.insert(vector_name.begin() + 3, 100); 
  ```
  * 或者插入一个范围的元素 `insert (const_iterator position, InputIterator first, InputIterator last)`，例如
  ```c++
    std::vector<int> vec1 = {1, 2, 3};
    std::vector<int> vec2 = {4, 5, 6};
    vec1.insert(vec1.end(), vec2.begin(), vec2.end());
  ```
* `erase()` 分两种情况
  ```c++
  vector_name.erase(position);    // for deletion at specific position
  vector_name.erase(starting_position, ending_position);    // for deletion in range
  ```
  同样 `position` 也要是 `iterator`。删除一个范围时，`starting_position` 位置的元素被删除，`ending_position` 位置不被删除
* `.clear()` 删除所有元素
* `.find()`

### 时间复杂度
* 访问：$O(1)$
* 修改最后一个元素：平均为 $O(1)$
* 修改任意元素：$O(N)$
* 调整大小：$O(N)$
  

## array
就是一个固定大小的数组。
### 初始化
在构建的时候指定大小
```c++
array<int, 5> myArray; 
array<int,6> ar = {1, 2, 3, 4, 5, 6}; // 指定初始化元素
```

### 方法
* `.at(i)`,`.get(i)` 返回第 $i$ 个位置的值
* `.front()`, `back()` 分别返回第一个和最后一个元素的值
* `.size()`, `.max_size()` 返回的都是数组大小(因为是固定的)
* `.fill()` 将整个数组赋予某个值
* `.empty()` 是否为空