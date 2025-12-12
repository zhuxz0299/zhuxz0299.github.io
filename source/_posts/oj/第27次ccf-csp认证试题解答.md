---
title: 第27次ccf-csp认证试题解答
cover: https://source.fomal.cc/img/default_cover_29.webp
description: 第27次ccf csp前3题的解答
categories: ccf-csp
katex: true
abbrlink: 4ac43c2e
date: 2023-09-15 16:23:00
tags:
---

### [题目1：如此编码](http://118.190.20.162/view.page?gpid=T153)
使用整数相除和取模即可。
```c++
#include <bits/stdc++.h>
using namespace std;

int main()
{
    int n, m;                      // n 为题目的数量，m 为加密后的数字
    int a[25], b[25], c[25] = {1}; // a[i] 为第 i 道题的选项数量
    scanf("%d %d", &n, &m);
    for (int i = 1; i <= n; i++)
    {
        scanf("%d", &(a[i]));
        c[i] = c[i - 1] * a[i];
    }

    for (int i = n; i > 0; i--)
    {
        b[i] = m / c[i - 1];
        m %= c[i - 1];
    }

    for (int i = 1; i <= n; i++)
        printf("%d ", b[i]);
}
```

### [题目2：何以包邮](http://118.190.20.162/view.page?gpid=T152)
类似背包问题，使用动态规划。要求花费最小，即删除的书价格最大。但是这里的动态规划无需计算所用情况，使用函数进行递归并且记忆一些情况即可。
```c++
#include <bits/stdc++.h>
using namespace std;

int cost[32][300002] = {0}; // 所有元素设为0

int drop(int a[], int n, int exc)
{

    if (cost[n][exc] == 0 && n > 0)
        if (exc >= a[n])
            cost[n][exc] = max(drop(a, n - 1, exc), drop(a, n - 1, exc - a[n]) + a[n]);
        else
            cost[n][exc] = drop(a, n - 1, exc);
    return cost[n][exc];
}

int main()
{
    int n, x;    // n 为挑选的书的数量，x为包邮最低价
    int a[35];   // a[i] 为第 i 本书的价格
    int sum = 0; // 用于记录书的总价
    scanf("%d %d", &n, &x);
    for (int i = 1; i <= n; i++)
    {
        scanf("%d", &a[i]);
        sum += a[i];
    }
    int excessive = sum - x;
    printf("%d", sum - drop(a, n, excessive));
}
```

### [题目3：防疫大数据](http://118.190.20.162/submitlist.page?gpid=T151)
本题如果完全按照题目的流程走，可以正好卡着时间线过。

由题目，我们知道一个用户进入风险名单，当且仅当：
>* 该用户在近 7 日内曾经出现在接收到的漫游数据中，并且近 7 日内有到访某个地区的记录；
>* 该用户在近 7 日内到访的地区在到访的那一日处于风险状态；
>* 上述存在风险的地区自到访日至生成名单当日持续处于风险状态。

那么我们只需要把7天之内哪些地区在哪些日期处于高风险状态储存起来，然后遍历时间在7天之内的漫游数据，就能找出所有的风险用户。更新高风险地区的时间复杂度为 $O(nr_{i}\log r_i)$，遍历漫游数据并且声称风险名单的时间复杂度为 $O(n m_{i}\log m_i)$，再考虑一下系数，时间复杂度基本能满足题目要求。

```c++
#include <bits/stdc++.h>
using namespace std;

struct roaming_data
{
    int u, r, d;

    roaming_data(int d, int u, int r)
    {
        this->u = u;
        this->r = r;
        this->d = d;
    }
    roaming_data() {}
};

set<pair<int, int>> affect_region; // 储存地址和时间
vector<roaming_data> items;

int main()
{
    int n;
    int ri, mi, pij;
    int d, u, r;
    scanf("%d", &n);

    for (int i = 0; i < n; i++)
    {

        for (set<pair<int, int>>::iterator iter = affect_region.begin(); iter != affect_region.end();)
        {
            const pair<int, int> &r = *iter;
            if (i >= r.second + 7)
                iter = affect_region.erase(iter);
            else
                iter++;
        }

        scanf("%d %d", &ri, &mi);
        for (int j = 0; j < ri; j++)
        {
            scanf("%d", &pij);
            for (int k = 0; k < 7; k++) // 输入风险地区信息
                affect_region.insert({pij, i + k});
        }

        for (int j = 0; j < mi; j++)
        {
            scanf("%d %d %d", &d, &u, &r); // 输入漫游数据信息
            items.push_back(roaming_data(d, u, r));
        }

        printf("%d ", i);

        vector<roaming_data> update_items;
        set<int> affect_users;
        for (roaming_data item : items)
        {
            bool flag = true;
            if (i - item.d >= 7)
                continue;
            for (int j = item.d; j <= i; j++) // 考虑用户到达当地至今日，该地区是否一直处于高风险状态
                if (affect_region.count({item.r, j}) == 0)
                {
                    flag = false;
                    break;
                }

            if (flag)
            {
                update_items.push_back(item);
                affect_users.insert(item.u);
            }
        }
        items.clear();
        items = update_items;
        
        for (int u : affect_users)
            printf("%d ", u);
        printf("\n");
    }
}
```

想要在遍历一个 `set` 的时候删除一些元素，可以利用 `iter` 指针，如果直接遍历会导致报错。