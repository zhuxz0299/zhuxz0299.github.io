---
title: ccf csp考试解题注意事项
cover: https://source.fomal.cc/img/default_cover_25.webp
abbrlink: b76167e5
date: 2023-09-17 01:20:55
tags:
categories: ccf-csp
katex: true
description: 记录一下在写模拟题时遇到的一些问题
---

### 关于输入输出
假如一定需要使用 `cin` 和 `cout`，那么在 `main()` 函数开头加上
```c++
ios::sync_with_stdio(false);
cin.tie(0);
cout.tie(0);
```

能够加速读写速度。

### 关于浮点数
浮点数相除如果除数和被除数都是整数，一定要加小数点，否则会执行整数相除。例如：
```c++
return u == 0 ? sqrt((double)1.0 / 2.0) : 1;
```
### string类型字符串的读取
使用 `getline(cin, ___)` 读取字符串的时候，需要注意该函数可能会读取换行符。

### char[]类型字符串的读取
使用 `scanf("%s", &__)` 读取字符串时，`char[]` 的长度一定要大于字符串最长长度，否则可能会出问题。

### sort排序
对 `vector` 排序：
```c++
std::vector<int> myVector = {5, 2, 8, 1, 9};
std::sort(myVector.begin(), myVector.end()); // 默认按升序排序
```

对 `array` 排序：
```c++
std::array<int, 5> myArray = {5, 2, 8, 1, 9};
std::sort(myArray.begin(), myArray.end()); // 默认按升序排序
```

对数组排序：
```c++
int myArray[] = {5, 2, 8, 1, 9};
int size = sizeof(myArray) / sizeof(myArray[0]);
std::sort(myArray, myArray + size); // 默认按升序排序
```

自定义排序
```c++
struct MyStruct {
    int num;
    std::string name;
};

// 自定义比较函数，按照 num 属性进行升序排序
bool compareByNum(const MyStruct& a, const MyStruct& b) {
    return a.num < b.num;
}

int main() {
    std::vector<MyStruct> myVector = {
        {5, "John"},
        {2, "Alice"},
        {8, "Bob"},
        {1, "David"},
        {9, "Eve"}
    };
    
    std::sort(myVector.begin(), myVector.end(), compareByNum);
}
```