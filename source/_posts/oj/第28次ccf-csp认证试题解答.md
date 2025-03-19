---
title: 第28次ccf-csp认证试题解答
cover: https://source.fomal.cc/img/default_cover_30.webp
categories: ccf-csp
katex: true
abbrlink: 167ef031
date: 2023-09-15 15:58:48
tags:
description: 第28次ccf csp前3题的解答
---

### [题目1：现值计算](http://118.190.20.162/view.page?gpid=T160)
直接算
```c++
#include <bits/stdc++.h>
using namespace std;

int main()
{
    int n;
    double interest, power = 1, profit = 0, earning;
    scanf("%d %lf", &n, &interest);
    for (int i = 0; i < n + 1; i++)
    {
        scanf("%lf", &earning);
        profit += earning * power;
        power /= (1 + interest);
    }
    printf("%.3lf", profit);
}
```

### [题目2：训练计划](http://118.190.20.162/view.page?gpid=T159)
利用题目已知条件：
> 每项科目最多只依赖一项别的科目，且满足依赖科目的编号小于自己

我们以在输入每项科目需要时间的时候直接计算出该科目能够开始的最早时间。如果想要知道最晚开始时间，则可以从后开始扫描，计算每一项后面的项目需要多长时间才能完成。

```c++
#include <bits/stdc++.h>
using namespace std;

struct node
{
    int time, finish_time; // time 表示完成这个科目的时间，finish_time 表示完成这个任务加上后面所有任务的时间
    int start_time = 1;    // 最早的开始的时间
    node *depend = nullptr;
};

int main()
{
    int n, m;
    int pre, time;
    bool pass = true; // 表示是否能完成所有科目，如果能，pass为true
    node sub[105];
    scanf("%d %d", &n, &m);
    for (int i = 1; i <= m; i++)
    {
        scanf("%d", &pre);
        if (pre != 0)
            sub[i].depend = &sub[pre];
    }
    for (int i = 1; i <= m; i++)
    {
        scanf("%d", &time);
        sub[i].time = time;
        if (sub[i].depend) // 更新start_time
            sub[i].start_time = sub[i].depend->start_time + sub[i].depend->time;

        sub[i].finish_time = time; // 初始化finish_time
    }
    for (int i = m; i >= 1; i--)                                                       // 更新 finish_time
        if (sub[i].depend && pass)                                                     // 如果某个结点有父节点而且有必要计算
            if (sub[i].depend->finish_time < sub[i].depend->time + sub[i].finish_time) // 如果这条线路是最慢的
            {
                sub[i].depend->finish_time = sub[i].depend->time + sub[i].finish_time; // 更新
                if (sub[i].depend->finish_time > n)                                    // 超过总时间了
                    pass = false;
            }
    for (int i = 1; i <= m; i++)
        printf("%d ", sub[i].start_time);
    printf("\n");
    if (pass)
        for (int i = 1; i <= m; i++)
            printf("%d ", n - sub[i].finish_time + 1);
    printf("\n");
}
```

### [题目3：JPEG解码](http://118.190.20.162/view.page?gpid=T158)
在读取矩阵内容的时候注意一下顺序即可。

```c++
#include <bits/stdc++.h>
using namespace std;

int Q[8][8] = {0};          // 量化矩阵
int M[8][8] = {0};          // 图像矩阵
double transformed_M[8][8]; // 经过余弦变换之后的图像矩阵
const double pi = acos(-1);

void scan_data(int n);
void print_matrix(int matrix[][8]);
void print_matrix(double matrix[][8]);
void quantify_matrix();
double alpha(int u);
void transform_matrix();

int main()
{
    int n, T;

    for (int i = 0; i < 8; ++i) // 读取量化矩阵
        for (int j = 0; j < 8; ++j)
            scanf("%d", &(Q[i][j]));
    scanf("%d", &n); // 扫描数据的个数
    scanf("%d", &T); // 要进行的任务
    scan_data(n);    // 读取压缩后的矩阵

    switch (T)
    {
    case 0:
        break;
    case 1:
        quantify_matrix();
        break;
    case 2:
        quantify_matrix();
        transform_matrix();
        break;
    default:
        printf("DEBUG: get invalid T!");
        break;
    }

    print_matrix(M);
}

void scan_data(int n)
{
    for (int i = 0, p = 0, q = 0; i < n; i++)
    {
        scanf("%d", &(M[p][q]));
        if ((p + q) % 2 == 1)
        {
            if (p == 7)
                q++;
            else if (q == 0)
                p++;
            else
                q--, p++;
        }
        else
        {
            if (p == 0)
                q++;
            else if (q == 7)
                p++;
            else
                q++, p--;
        }
    }
}

void print_matrix(int matrix[][8])
{
    for (int i = 0; i < 8; ++i)
    {
        for (int j = 0; j < 8; ++j)
            printf("%d ", matrix[i][j]);
        printf("\n");
    }
}

void print_matrix(double matrix[][8])
{
    for (int i = 0; i < 8; ++i)
    {
        for (int j = 0; j < 8; ++j)
            printf("%.2lf\t", matrix[i][j]);
        printf("\n");
    }
}

void quantify_matrix()
{
    for (int i = 0; i < 8; ++i)
        for (int j = 0; j < 8; ++j)
            M[i][j] *= Q[i][j];
}

double alpha(int u)
{
    return u == 0 ? sqrt((double)1.0 / 2.0) : 1;
}

void transform_matrix()
{

    for (int i = 0; i < 8; ++i)
        for (int j = 0; j < 8; ++j)
        {
            transformed_M[i][j] = 0;
            for (int u = 0; u < 8; ++u)
                for (int v = 0; v < 8; ++v)
                {
                    transformed_M[i][j] += alpha(u) * alpha(v) * M[u][v] * cos(pi / 8 * (i + (double)1.0 / 2.0) * u) * cos(pi / 8 * (j + (double)1.0 / 2.0) * v);
                }
            transformed_M[i][j] = 1.0 / 4.0 * transformed_M[i][j];
        }

    for (int i = 0; i < 8; ++i)
        for (int j = 0; j < 8; ++j)
        {
            M[i][j] = round(transformed_M[i][j] + 128);
            M[i][j] = min(M[i][j], 255);
            M[i][j] = max(M[i][j], 0);
        }
}
```

C++在进行浮点数运算的时候，记得将运算过程中的常数都用浮点数表示，否则编译器会将其是为整数，相除时也执行整数相除。