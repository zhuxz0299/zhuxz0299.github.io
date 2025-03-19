---
title: Associative Containers
cover: https://source.fomal.cc/img/default_cover_23.webp
tags: stl
description: 'set, map in STL, implement sorted data structures that can be quickly searched'
katex: true
abbrlink: 597ff9ab
date: 2024-05-28 10:39:56
---

## set
通常使用自平衡二叉搜索树（例如红黑树）来实现
 
### 初始化
```c++
set<int> val; // 定义空集合
set<int> val = {6, 10, 5, 1}; // 定义集合并初始化，递增顺序
std::set <data_type, greater<data_type>> set_name; // 递减顺序
```

### 方法
* `.begin()` 返回 vector 中第一个元素的 iterator
* `.end()` 返回 vector 中最后一个元素后面的 iterator
* `.size()` 返回 vector 大小
* `.max_size()` 返回目前最多能装多少元素
* `.empty()` 是否为空
* `.insert(g)` 将元素 $g$ 插入集合
* `.erase(g)` 将元素 $g$ 从集合中移除
* `.find(g)` 返回元素 $g$ 对应的 iterator
* `.count(g)` 根据是否存在对应元素返回 $1$ 或 $0$
* `.lower_bound(g)` 找到第一个不小于 $g$ 的元素的 iterator
* `.upper_bound(g)` 找到第一个大于 $g$ 的元素的 iterator

### 时间复杂度
插入、删除、查找: $O(\log N)$
创建或清除: $O(N)$

## multiset
同样基于红黑树实现，和 `set` 基本相同，仅仅是允许有重复元素。

### 方法
基本与 `set` 相同
* `.erase(g)` 将所有元素 $g$ 从集合中移除
* `.erase(it)` 将 iterator `it` 指向的元素移除
* `.count(g)` 返回元素 $g$ 的数量
* `.find(g)` 返回第一个元素 $g$ 对应的 iterator
* `.equal_range(g)` 返回一对 iterator，分别指向第一个等于 5 的元素和第一个大于 5 的元素。

## map
### 插入数据方式
```c++
map<int, std::string> mymap;
// 使用 insert
mymap.insert(make_pair(1, "one")); 
mymap.insert(pair<int, string>(1, "one"));
mymap.insert({1, "one"});
// 直接插入
mymap[1] = "one";
// 使用 emplace
mymap.emplace(1, "one");
```
### 特殊用法
如果创建的 map 为 `map<template, int>` 的形式，那么即使在 map 中没有插入 key-value pair，直接访问某个不存在的 key，可以正常返回，返回值为 $0$。例如：
```c++
map<int, int> tail_val_count;
tail_val_count[prefix_sum[n - 1]]++;
for (int i = n - 2; i >= 0; i--)
{
    count += tail_val_count[prefix_sum[i] + k];
    tail_val_count[prefix_sum[i]]++;
}
```

## multimap
也就是 map 允许 key 相同的数据结构。