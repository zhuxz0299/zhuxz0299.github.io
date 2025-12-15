---
title: 第29次ccf-csp认证试题解答
cover: https://source.fomal.cc/img/default_cover_31.webp
categories: [Algorithms, Online Judge]
katex: true
abbrlink: '75792915'
date: 2023-09-15 14:45:16
tags:
description: 第29次ccf csp前3题的解答
---

### [题目1：土地丈量](http://118.190.20.162/view.page?gpid=T165)
本题的重点在于计算两个矩形相交的面积。经过分析和观察可以发现，假如两个矩形左下角和右上角的坐标分别为 $(x_1,y_1), (x_2,y_2)$ 和 $(x_3,y_3), (x_4, y_4)$，同时两矩形相交，那么相交得到的矩形左下角坐标为：$(\max(x_1,x_3), \max(y_1, y_3))$，右上角为 $(\min(x_2,x_4), \min(y_2,y_4))$。

```c++
#include <bits/stdc++.h>
using namespace std;

struct rectangle
{
    rectangle() {}
    rectangle(int left, int bottom, int right, int top)
    {
        this->left = left, this->right = right;
        this->bottom = bottom, this->top = top;
    }

    int get_area()
    {
        return (right - left) * (top - bottom);
    }

    void resize(int left, int bottom, int right, int top)
    {
        this->left = left, this->right = right;
        this->bottom = bottom, this->top = top;
    }
    
    int left, right, bottom, top;
};

bool is_insert(rectangle r1, rectangle r2)
{
    if (r1.left >= r2.right || r2.left >= r1.right || r1.bottom >= r2.top || r2.bottom >= r1.top)
        return false;
    return true;
}

int insert_area(rectangle r1, rectangle r2)
{
    if (!is_insert(r1, r2))
        return 0;
    rectangle insert_r(max(r1.left, r2.left), max(r1.bottom, r2.bottom), min(r1.right, r2.right), min(r1.top, r2.top));
    return insert_r.get_area();
}

int main()
{
    int n, a, b;
    scanf("%d %d %d", &n, &a, &b);
    
    int left, bottom, right, top;
    int area = 0;
    rectangle new_r(0, 0, a, b), r;

    for (int i = 0; i < n; i++)
    {
        scanf("%d %d %d %d", &left, &bottom, &right, &top);
        r.resize(left, bottom, right, top);
        area += insert_area(r, new_r);
    }

    printf("%d", area);
}
```

对于一个结构体，假如需要定义其构造函数，有时需要注意重载一个默认构造函数。

### [题目2：垦田计划](http://118.190.20.162/view.page?gpid=T164)
本题只需假设一个最短的时间，然后不断计算查看已有资源是否足够即可。同时假定的最短时间使用二分法进行不断尝试。

```c++
#include <bits/stdc++.h>
#include <vector>
using namespace std;

int n, m, k;
vector<int> times;
vector<int> com_resources;

bool satisfy(int guess_time) // 手上的资源足够让总时间减少到guess_time
{
    long long require_resource = 0;
    for (int i = 0; i < n; i++)
    {
        if (times[i] <= guess_time)
            continue;
        require_resource += (times[i] - guess_time) * com_resources[i];
    }
    if (require_resource <= m)
        return true;
    else
        return false;
}

int main()
{
    int time, com_resource;
    int max_time = 0;

    scanf("%d %d %d", &n, &m, &k);

    for (int i = 0; i < n; i++) // 读取数据，并且获得最长时间
    {
        scanf("%d %d", &time, &com_resource);
        if (time > max_time)
            max_time = time;
        times.push_back(time);
        com_resources.push_back(com_resource);
    }

    if (satisfy(k))
    {
        printf("%d", k);
        return 0;
    }

    int left_bound = k, right_bound = max_time;
    int guess_time = (left_bound + right_bound) / 2;
    while (left_bound < right_bound)
    {
        if (satisfy(guess_time))
            right_bound = guess_time;
        else
            left_bound = guess_time + 1;
        guess_time = (left_bound + right_bound) / 2;
    }
    printf("%d", guess_time);
    return 0;
}
```

这里因为 `n` 的不确定性使用了 `vector`，事实上直接开一个足够大的数组也是可以的。

### [题目3：LDAP](http://118.190.20.162/view.page?gpid=T163)
本题只要使用递归来解析语法即可。

```c++
#include <bits/stdc++.h>
using namespace std;

struct user_attr
{
    int label = 0; // 属性的编号
    int value = 0; // 属性的值
};

struct user
{
    int dn = 0;
    int attr_num = 0;
    user_attr attr[500];
};

user usr[2500];          // 定义用户
string expr[500];        // 定义表达式
vector<int> matched_usr; // 用于储存最终输出的用户
int n, m;                // n为用户的数量，m为表达式的数量

vector<int> translate_base_expr(string expr);                  // 处理简单语句
vector<int> translate_expr(string expr);                       // 处理一般语句
bool match_expr(int usr, int label, int value, bool positive); // 判断某个用户的某个属性是否具有该值
vector<int> get_union(const vector<int> &vec1, const vector<int> &vec2);
vector<int> get_intersection(vector<int> vec1, vector<int> vec2);

int main()
{
    int attr_num;               // 要输入的属性值的个数
    scanf("%d", &n);            // 输入用户的数目
    for (int i = 0; i < n; i++) // 输入用户的dn值和属性
    {
        scanf("%d%d", &(usr[i].dn), &(usr[i].attr_num));
        for (int j = 0; j < usr[i].attr_num; j++)
            scanf("%d%d", &(usr[i].attr[j].label), &(usr[i].attr[j].value));
    }

    scanf("%d", &m);
    cin.get();
    for (int i = 0; i < m; i++)
        getline(cin, expr[i]);

    for (int i = 0; i < m; i++)
    {
        matched_usr = translate_expr(expr[i]);
        sort(matched_usr.begin(), matched_usr.end());
        for (int usr_dn : matched_usr)
            printf("%d ", usr_dn);
        printf("\n");
    }
}

bool match_expr(int usr_id, int label, int value, bool positive) // 这里的usr_id和dn不同
{
    int left = 0, right = usr[usr_id].attr_num - 1;
    int i = (left + right) / 2;
    while (true)
    {
        if (usr[usr_id].attr[i].label == label) // 找到正确的attr了
            break;
        else if (usr[usr_id].attr[i].label > label)
            right = i - 1;
        else
            left = i + 1;
        if (left > right) // 该用户没有该属性
            return false;
        i = (left + right) / 2;
    }

    if (positive)
    {
        if (usr[usr_id].attr[i].value == value)
            return true;
        else
            return false;
    }
    else
    {
        if (usr[usr_id].attr[i].value == value)
            return false;
        else
            return true;
    }
}

vector<int> translate_base_expr(string expr)
{
    vector<int> selected_usr;
    selected_usr.reserve(2500);
    bool positive, overturn = false; // overturn决定现在在读取label还是value
    int value = 0, label = 0;
    for (int i = 0; i < expr.length(); ++i) // 处理base_expr，读取label和value
        if (expr[i] >= '0' && expr[i] <= '9')
        {
            if (overturn)
                value = value * 10 + (expr[i] - '0');
            else
                label = label * 10 + (expr[i] - '0');
        }
        else
        {
            overturn = true;
            if (expr[i] == ':')
                positive = true;
            else if (expr[i] == '~')
                positive = false;
            else
                printf("DEBUG: something go wrong in operater!\n");
        }

    for (int i = 0; i < n; i++)
        if (match_expr(i, label, value, positive))
            selected_usr.push_back(usr[i].dn);
    return selected_usr;
}

vector<int> translate_expr(string expr)
{
    vector<int> selected_usr;
    selected_usr.reserve(2500);
    bool vec_union; // 如果是|，则就是union；如果是&，则为intersection
    int left_brac_cnt = 0;
    int second_expr_start, second_expr_len, first_expr_len, first_expr_start = 2;

    if (expr[0] != '&' && expr[0] != '|')
        return translate_base_expr(expr);
    if (expr[0] == '&')
        vec_union = false;
    else if (expr[0] == '|')
        vec_union = true;

    for (int i = 2; i < expr.length(); i++)
        if (expr[i] == '(')
            left_brac_cnt++;
        else if (expr[i] == ')')
            if (left_brac_cnt > 0)
                left_brac_cnt--;
            else if (left_brac_cnt == 0 && expr[i + 1] == '(')
                second_expr_start = i + 2;
            else
                printf("DEBUG: something went wrong in bracket paring!\n");

    first_expr_len = (second_expr_start - 2) - first_expr_start;
    second_expr_len = (expr.length() - 1) - second_expr_start;

    string sub_expr1 = expr.substr(first_expr_start, first_expr_len);
    string sub_expr2 = expr.substr(second_expr_start, second_expr_len);

    vector<int> selected_usr1 = translate_expr(sub_expr1);
    vector<int> selected_usr2 = translate_expr(sub_expr2);
    if (vec_union)
        return get_union(selected_usr1, selected_usr2);
    else
        return get_intersection(selected_usr1, selected_usr2);
}

vector<int> get_union(const vector<int> &vec1, const vector<int> &vec2)
{
    vector<int> result;
    result.reserve(vec1.size() + vec2.size());

    result.insert(result.end(), vec1.begin(), vec1.end());
    result.insert(result.end(), vec2.begin(), vec2.end());

    sort(result.begin(), result.end());
    result.erase(unique(result.begin(), result.end()), result.end());

    return result;
}

vector<int> get_intersection(vector<int> vec1, vector<int> vec2)
{
    vector<int> result;
    result.reserve(min(vec1.size(), vec2.size()));
    sort(vec1.begin(), vec1.end());
    sort(vec2.begin(), vec2.end());

    int pointer1 = 0, pointer2 = 0;
    while (pointer1 < vec1.size() && pointer2 < vec2.size())
    {
        if (vec1[pointer1] == vec2[pointer2])
        {
            result.push_back(vec1[pointer1]);
            pointer1++;
            pointer2++;
        }
        else if (vec1[pointer1] > vec2[pointer2])
            pointer2++;
        else
            pointer1++;
    }
    return result;
}
```