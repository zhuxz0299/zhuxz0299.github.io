---
title: 第30次ccf csp认证试题解答
cover: https://source.fomal.cc/img/default_cover_32.webp
categories: ccf-csp
katex: true
abbrlink: 7608075b
date: 2023-09-15 12:45:51
tags:
description: 第30次ccf csp前3题的解答
---

### [问题1：重复局面](http://118.190.20.162/view.page?gpid=T170)

本题只需读取数据然后直接比较即可。读取 `string` 类型可以直接使用 `cin>>`，或者使用 `getline(cin, ___)`，在使用后者时需要注意，`getline` 会读取缓存区中的 `\n`，因此读取之前可能需要先用一个 `cin.get()` 读取一下换行符。

如果是读取 `char[]` 类型的字符串，使用 `scanf` 即可。

```c++
#include <bits/stdc++.h>
using namespace std;

int main()
{
    string chess[100][8];
    int count[100];
    int n;
    bool flag = true;

    scanf("%d", &n);
    cin.get();
    for (int i = 0; i < n; i++)
    {
        count[i] = 1;
        for (int j = 0; j < 8; j++)
            getline(cin, chess[i][j]);
        for (int k = i - 1; k >= 0; k--) // 检查之前的所有棋盘
        {
            flag = true;
            for (int j = 0; j < 8; j++) // 检查每个棋盘的某一行是否相同
                if (chess[i][j] != chess[k][j])
                {
                    flag = false;
                    break;
                }
            if (flag)
            {
                count[i] = count[k] + 1;
                break;
            }
        }
    }

    for (int i = 0; i < n; i++)
        printf("%d\n", count[i]);
}
```

* 代码中的 `getline(cin, chess[i][j]);` 换成 `cin>>chess[i][j]`，并且删除 `cin.get()`，效果相同。
* 如果想要使用 `scanf`，则需将 `string chess[100][8]` 改为 `char chess[100][8][10]`(最后一个维度的大小只要比8大就行，如果正好等于8会出现字符串输出问题)，同时将 `chess[i][j] != chess[k][j]` 改为 `strcmp(chess[i][j], chess[k][j]) != 0`。

### [问题2：矩阵运算](http://118.190.20.162/view.page?gpid=T169)
本题需要注意矩阵乘法可以进行交换，可以通过这种方法降低计算复杂度。比如有三个矩阵，形状分别为 $m\times n, n\times l, l\times p$，那么乘法运行的次数共为 $m\times n\times l+n\times l\times p$。

在本题中，假如按照题目给定的 $(W\cdot (Q\times K^{\mathrm{T}})\times V)$ 进行矩阵相乘，计算的复杂度为 $O(n^{2}d)$，考虑到 $n\le 10^{4}, d\le 20$，计算复杂度太大。因此可以利用结合律，将运算顺序改为 $(W\cdot Q)\times (K^{\mathrm{T}}\times V)$，计算复杂度降为 $O(d^{2}n)$。

```c++
#include <bits/stdc++.h>
#include <vector>
using namespace std;

int main()
{
    int n, d;
    scanf("%d%d", &n, &d);

    vector<vector<int>> Q(n, vector<int>(d));
    vector<vector<int>> K(n, vector<int>(d));
    vector<vector<int>> V(n, vector<int>(d));
    vector<int> W(n);

    for (int i = 0; i < n; i++)
        for (int j = 0; j < d; j++)
            scanf("%d", &Q[i][j]);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < d; j++)
            scanf("%d", &K[i][j]);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < d; j++)
            scanf("%d", &V[i][j]);
    for (int i = 0; i < n; i++)
        scanf("%d", &W[i]);

    vector<vector<long long>> res(n, vector<long long>(d));
    vector<vector<long long>> tmp_small(d, vector<long long>(d));

    // Q = W · Q
    for (int i = 0; i < n; i++)
        for (int j = 0; j < d; j++)
            Q[i][j] *= W[i];

    // KT × V
    for (int i = 0; i < d; i++)
        for (int j = 0; j < d; j++)
            for (int k = 0; k < n; k++)
                tmp_small[i][j] += K[k][i] * V[k][j];

    // Q × (KT × V)
    for (int i = 0; i < n; i++)
        for (int j = 0; j < d; j++)
            for (int k = 0; k < d; k++)
                res[i][j] += Q[i][k] * tmp_small[k][j];

    // 输出结果
    for (int i = 0; i < n; i++)
        for (int j = 0; j < d; j++)
            printf("%lld%c", res[i][j], j == d - 1 ? '\n' : ' ');
}
```

此处因为 `n` 和 `d` 都是在输入之后才知道的量，因此使用 `vector` 进行数据的存储。`vector<vector<int>> Q(n, vector<int>(d));` 是 `vector` 初始化的一种方式，表示创建了一个大小为 `n` 的 `vector`，其中每个元素都是一个大小为 `d` 的 `vector<int>`。

### [问题3：解压缩](http://118.190.20.162/view.page?gpid=T168)
按照题目的要求做就行。

```c++
#include <bits/stdc++.h>
using namespace std;

int num_unzip = 0; // 表示已经解压缩的字节数
char unzip_data[1 << 22];

void get_character(char &c)
{
    c = '\n';
    while (c == '\n')
        c = getchar();
}

void get_byte(char &c1, char &c2)
{
    get_character(c1);
    get_character(c2);
}

void print_byte(char c1, char c2)
{
    unzip_data[num_unzip * 2] = c1;
    unzip_data[num_unzip * 2 + 1] = c2;
    num_unzip++;
}

int byte_to_int(char &c1, char &c2)
{
    int n1, n2;
    n1 = c1 <= '9' ? c1 - '0' : c1 - 'a' + 10;
    n2 = c2 <= '9' ? c2 - '0' : c2 - 'a' + 10;
    return n1 * 16 + n2;
}

int read_boot_domain(int &length)
{
    char char1, char2;
    int base = 1, num_byte = 0; // base为基，num_byte为现在已经读取的字节数
    while (true)                // 读取引导区
    {
        get_byte(char1, char2);
        int num = byte_to_int(char1, char2);
        if (num < 128)
        {
            length += num * base;
            break;
        }
        length += (num - 128) * base;
        base *= 128;
        num_byte += 1;
    }
    return num_byte + 1; // 在break的地方还要加1
}

int read_literal(int type)
{
    int l = 0, extend_type = 0; // l是字面量的长度，extend_type是表示后面有几个字节用来存储字面量长度
    char c1, c2;
    // 获得字面量长度
    if (type / 4 <= 59)
        l = type / 4 + 1;
    else
    {
        extend_type = type / 4 - 59;
        int base = 1;
        for (int i = 0; i < extend_type; i++)
        {
            get_byte(c1, c2);
            l += byte_to_int(c1, c2) * base;
            base *= 256;
        }
        l += 1;
    }
    // 读取字面量
    for (int i = 0; i < l; i++)
    {
        get_byte(c1, c2);
        print_byte(c1, c2);
    }
    return l + extend_type + 1; // 返回的数表示这个元素占用的字节数
}

void read_trace_helper(int o, int l)
{
    int start_point = num_unzip - o;
    if (o >= l)
        for (int i = 0; i < l; i++)
            print_byte(unzip_data[(start_point + i) * 2], unzip_data[(start_point + i) * 2 + 1]);
    else
        for (int i = 0; i < l; i++)
            print_byte(unzip_data[(start_point + i % o) * 2], unzip_data[(start_point + i % o) * 2 + 1]);
}

int read_trace1(int type)
{
    char c1, c2;
    int l = (type / 4) % 8 + 4;
    int o = type / 32;
    get_byte(c1, c2);
    o = o * 256 + byte_to_int(c1, c2);
    read_trace_helper(o, l);
    return 2; // 返回的数表示这个元素占用的字节数
}

int read_trace2(int type)
{
    char c1, c2;
    int l = type / 4 + 1;
    get_byte(c1, c2);
    int o = byte_to_int(c1, c2);
    get_byte(c1, c2);
    o = o + byte_to_int(c1, c2) * 256;
    read_trace_helper(o, l);
    return 3; // 返回的数表示这个元素占用的字节数
}

int main()
{
    char char1, char2;                 // 一个字节的两个字符
    int length = 0;                    // length为原始数据的长度
    int input;                         // 输入的字节数
    scanf("%d", &input);               // 读取接下来要输入的字节数
    input -= read_boot_domain(length); // 读取引导域，获得原始数据长度

    while (input > 0)
    {
        get_byte(char1, char2);
        int type = byte_to_int(char1, char2); // 读取每个元素的第一个字节
        switch (type % 4)
        {
        case 0:                          // 假如末两位为00
            input -= read_literal(type); // 元素为字面量，函数返回输入字节的个数
            break;

        case 1: // 假如末两位为01
            input -= read_trace1(type);
            break;

        case 2:
            input -= read_trace2(type);
            break;

        default:
            printf("DEBUG: something went wrong!\n");
            break;
        }
    }

    for (int i = 0; i < num_unzip; i++)
    {
        printf("%c%c", unzip_data[i * 2], unzip_data[i * 2 + 1]);
        if (i % 8 == 7)
            printf("\n");
    }

    return 0;
}
```