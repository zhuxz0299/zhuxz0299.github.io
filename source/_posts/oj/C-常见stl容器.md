---
title: C++常见stl容器
cover: https://source.fomal.cc/img/default_cover_24.webp
katex: true
abbrlink: 3476ed94
date: 2023-09-16 21:35:53
tags: stl
description: 关于一些常用的stl库
categories: [Algorithms, Online Judge]

---

## 常用stl容器的常用操作及其时间复杂度
### map
基于红黑树实现

* 插入键值对，时间为 $O(\log n)$。使用 `operator[]` 或 `insert` 函数可以插入键-值对。如果键已经存在，`operator[]` 会更新对应的值，而 `insert` 则不会更新。
    ```c++
    std::map<std::string, int> myMap;
    // 使用 operator[]
    myMap["Alice"] = 95;
    myMap["Bob"] = 85;
    // 使用 insert
    myMap.insert(std::make_pair("Charlie", 90));
    myMap.insert(std::pair<std::string, int>("Dave", 80));
    ```
* 访问和修改值，时间为 $O(\log n)$。使用 `operator[]` 可以通过键访问和修改对应的值。
    ```c++
    std::cout << myMap["Alice"] << std::endl;  // 访问值
    myMap["Bob"] = 90;  // 修改值
    ```
* 检查键是否存在，时间为 $O(\log n)$。
  * 使用 `count` 函数可以检查给定键在 `std::map` 中的出现次数。如果键存在，返回值大于 $0$；不存在则返回 $0$。
  * 使用 `find` 函数可以检查给定键是否存在。如果键存在，返回指向该键-值对的迭代器；不存在则返回 `std::map::end()`。
    ```c++
    if (myMap.count("Alice") > 0) {
        std::cout << "Alice's score exists." << std::endl;
    }
    auto it = myMap.find("Alice");
    if (it != myMap.end()) {
        std::cout << "Alice's score exists." << std::endl;
    }
    ```
* 删除键-值对，时间为 $O(\log n)$。使用 `erase` 函数可以删除给定键的键-值对。
    ```c++
    myMap.erase("Alice");
    ```
* 获取键-值对个数，时间为 $O(1)$。使用 `size` 函数可以获取 `std::map` 中键-值对的个数。
  ```c++
  std::cout << "Number of elements: " << myMap.size() << std::endl;
  ```
* 清空 `std::map`，时间为 $O(n)$。使用 `clear` 函数可以清空 `std::map`，将其变为空。
  ```c++
  myMap.clear();
  ```
* 遍历 `std::map`，时间为 $O(n)$。使用迭代器可以遍历 `std::map` 中的所有键-值对。
    ```c++
    for (const auto& pair : myMap) {
        std::cout << "Name: " << pair.first << ", Score: " << pair.second << std::endl;
    }

    for (std::map<std::string, int>::iterator it = myMap.begin(); it != myMap.end(); ++it) {
        std::cout << "Name: " << it->first << ", Score: " << it->second << std::endl;
    }
    ```

### set
基于红黑树实现

* 插入元素（`insert`）：平均时间复杂度为 $O(log n)$
* 删除元素（`erase`）：平均时间复杂度为 $O(log n)$
* 查找元素（`find`）：平均时间复杂度为 $O(log n)$
* 获取元素个数（`size`）：$O(1)$。
* 判断容器是否为空（`empty`）：$O(1)$。
* 遍历所有元素（使用迭代器）：$O(n)$。

### vector
* 插入元素（`push_back()`）
  * 平均时间复杂度: $O(1)$
  * 最坏时间复杂度: $O(n)$，当需要重新分配内存时
* 访问元素（使用索引）,平均时间复杂度: $O(1)$
* 删除元素（`pop_back()` 或 `erase()`），时间复杂度分别为 $O(1)$ 和 $O(n)$
    ```c++
    myVector.pop_back();  // 移除最后一个元素
    myVector.erase(myVector.begin() + 1);  // 移除索引为 1 的元素
    ```
* 获取元素个数（`size()`）：$O(1)$。
* 判断容器是否为空（`empty()`）：$O(1)$。
* 遍历所有元素（使用迭代器）：$O(n)$。
* 在指定位置插入元素（`insert()`），平均时间复杂度: $O(n)$
    ```c++
    std::vector<int>::iterator it = myVector.begin() + 1;
    myVector.insert(it, 20);  // 在索引为 1 的位置插入元素 20
    ```
* 清空容器（`clear()`）：时间复杂度: $O(1)$

`vector` 的创建与初始化
* 创建一维 `vector`
  * 使用默认构造函数创建空的 `std::vector`，然后使用 `push_back()` 方法逐个添加元素。
  * 使用初始化列表初始化 `std::vector`。
    ```c++
    std::vector<int> myVector = {10, 20, 30};  // 创建并初始化一维 vector
    ```
  * 使用构造函数并指定元素数量和默认值。
    ```c++
    std::vector<int> myVector(5, 0);  // 创建包含 5 个元素，每个元素的值为 0 的一维 vector
    ```
* 创建二维 `vector`
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

### array
* 访问元素：使用下标操作符 `[]` 或 `at()` 方法可以访问指定位置的元素。时间复杂度：$O(1)$
    ```cpp
    std::array<int, 5> myArray = {1, 2, 3, 4, 5};
    int element1 = myArray[0];       // 使用下标操作符访问第一个元素
    int element2 = myArray.at(2);    // 使用 at() 方法访问第三个元素
    ```
* 获取元素个数（`size()`）：$O(1)$。
* 遍历所有元素（使用迭代器）：$O(n)$。
* 填充数组：`fill()` 方法可以将数组的所有元素设置为指定的值。时间复杂度：$O(n)$
    ```c++
    std::array<int, 5> myArray;
    myArray.fill(0);  // 将数组的所有元素设置为 0
    ```
* 比较操作：`==` 和 `!=` 操作符可用于比较两个数组是否相等。
    ```c++
    std::array<int, 5> array1 = {1, 2, 3, 4, 5};
    std::array<int, 5> array2 = {1, 2, 3, 4, 5};
    bool isEqual = (array1 == array2);  // 比较两个数组是否相等
    ```

## 其他操作
### 遍历时删除元素
需要使用指针进行遍历，否则删除时会出现问题
```c++
for (set<pair<int, int>>::iterator iter = affect_region.begin(); iter != affect_region.end();)
    {
        const pair<int, int> &r = *iter;
        if (i >= r.second + 7)
            iter = affect_region.erase(iter);
        else
            iter++;
    }
```