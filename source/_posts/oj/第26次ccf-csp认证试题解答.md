---
title: 第26次ccf-csp认证试题解答
cover: https://source.fomal.cc/img/default_cover_28.webp
description: 第26次ccf csp前3题的解答
categories: [Algorithms, Online Judge]
katex: true
abbrlink: 29c3e50a
date: 2023-09-16 10:45:05
tags:
---

### [题目1：归一化处理](http://118.190.20.162/view.page?gpid=T148)
```c++
#include <bits/stdc++.h>
using namespace std;

int a[1000];

int main(int argc, char const *argv[])
{
    int n, sum = 0;
    scanf("%d", &n);
    double avg, var = 0;
    for (int i = 0; i < n; ++i)
    {
        scanf("%d", &a[i]);
        sum += a[i];
    }
    avg = double(sum) / n;
    for (int i = 0; i < n; ++i)
        var += (a[i] - avg) * (a[i] - avg);
    var /= n;
    for (int i = 0; i < n; ++i)
        printf("%f\n", (a[i] - avg) / sqrt(var));
    return 0;
}
```

### [题目2：寻宝！大冒险！](http://118.190.20.162/view.page?gpid=T147)
由于绿化覆盖的范围可能非常大($L<10^{9}$)，因此直接将整幅图存下来是不现实的，我们只能将种有树的那些点存下来，数据规模为 $n<1000$。

然后为了找到所有可能有宝藏的点，我们需要遍历所有的种树的点，然后检查附近区域能否与藏宝图一一对应。一次检查需要验证 $S^{2}$ 个点，完成整张绿化图的检查则需要验证 $O(nS^{2})$ 个点。如果验证每个点都需要遍历所有树，那时间复杂度为 $O(n^{2}S^{2})$，会出现问题。因此这里将每棵树的坐标从二维映射到一维，并且进行排序，查找时利用二分法，这样就能将时间复杂度降为 $O(S^{2}n \log n)$。

```c++
#include <bits/stdc++.h>
using namespace std;

const long long base = 1000000000;
struct point
{
    int x, y;
};

point tree[1000];
long long tree_to_num[1000];
int treasure[50][50];

bool have_tree(long long num_compare, int n);
bool is_possible_point(int x, int y, int n, int S);

int main()
{
    int n, L, S;
    scanf("%d %d %d", &n, &L, &S);
    int possible_point = 0;     // 可能的藏宝的地点的数量
    for (int i = 0; i < n; ++i) // 读取绿化图中所有的树
    {
        scanf("%d %d", &(tree[i].x), &(tree[i].y));
        tree_to_num[i] = tree[i].x * base + tree[i].y;
    }
    sort(tree_to_num, tree_to_num + n); // 对绿化图中的数进行排序，方便查找

    for (int i = 0; i <= S; ++i) // 读取藏宝图
        for (int j = 0; j <= S; ++j)
            scanf("%d", &(treasure[S - i][j]));

    for (int i = 0; i < n; ++i)
    {
        if (tree[i].x + S > L || tree[i].y + S > L) // 不能超出边界
            continue;
        if (is_possible_point(tree[i].x, tree[i].y, n, S))
            ++possible_point;
    }

    printf("%d\n", possible_point);

    return 0;
}

bool is_possible_point(int x, int y, int n, int S) // 判断x，y这个点是不是可能的藏宝点
{
    long long num_compare;
    for (int i = 0; i <= S; ++i)
        for (int j = 0; j <= S; ++j)
        {
            num_compare = (x + i) * base + (y + j);
            if (treasure[i][j] && !have_tree(num_compare, n))
                return false;
            if (!treasure[i][j] && have_tree(num_compare, n))
                return false;
        }
    return true;
}

bool have_tree(long long num_compare, int n) // 给定一个long long值，判断这个位置有没有tree
{
    int left = 0, right = n - 1;
    int mid = (left + right) / 2;
    while (left <= right)
    {
        if (num_compare == tree_to_num[mid])
            return true;
        else if (num_compare > tree_to_num[mid])
            left = mid + 1;
        else
            right = mid - 1;
        mid = (left + right) / 2;
    }
    return false;
}
```

当然如果直接使用 `set` 类型储存数据的话，也是同样的计算速度，代码会更简单一些。
```c++
#include <bits/stdc++.h>
using namespace std;

set<pair<int, int>> trees;
int treasure[55][55];
bool is_possible_point(pair<int, int> tree, int S);

int main()
{
    int n, L, S;
    int x, y;
    scanf("%d %d %d", &n, &L, &S);
    int possible_point = 0;     // 可能的藏宝的地点的数量
    for (int i = 0; i < n; ++i) // 读取绿化图中所有的树
    {
        scanf("%d %d", &x, &y);
        trees.insert(make_pair(x, y));
    }

    for (int i = 0; i <= S; ++i) // 读取藏宝图
        for (int j = 0; j <= S; ++j)
            scanf("%d", &(treasure[S - i][j]));

    for (pair<int, int> tree : trees)
    {
        if (tree.first + S > L || tree.second + S > L) // 不能超出边界
            continue;
        if (is_possible_point(tree, S))
            possible_point++;
    }

    printf("%d\n", possible_point);

    return 0;
}

bool is_possible_point(pair<int, int> tree, int S)
{
    for (int i = 0; i <= S; i++)
        for (int j = 0; j <= S; j++)
            if (trees.count(make_pair(tree.first + i, tree.second + j)) ^ treasure[i][j]) // 这里没问题
                return false;
    return true;
}
```

### [题目3：角色授权](http://118.190.20.162/view.page?gpid=T146)
本题可以先将存储角色及其属性，然后再存储每个用户所关联的角色。角色的数量为 $O(n)$，用户的数量为 $O(nm)$。

然后在进行查询时，查询所有的用户和用户组，查询次数为 $O(qn_{s})$，每次查询时都要遍历用户或用户组关联的所有角色，数量为 $O(n)$，查询每个角色是否具有权限的时间为 $O(\log n_{v})$，因此总时间为 $O(qn n_s \log n_v)$。时间复杂度虽然较大，但最后还是能过。

```c++
#include <bits/stdc++.h>
using namespace std;

struct role_attr
{
    set<string> oprt;          // 操作类型
    set<string> resource_cate; // 资源种类
    set<string> resource_name; // 资源名称
};

map<string, role_attr> role;   // 角色，key为名称，value为属性
map<string, set<string>> user; // 用户，key为名称，value为绑定的角色名称的集合

bool have_access(string user_name, string oprt, string resource_cate, string resource_name);

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(0);
    cout.tie(0);

    int n, m, q;
    cin >> n >> m >> q;

    int nv, no, nn;
    string name, oprt, resource_cate, resource_name;
    for (int i = 0; i < n; ++i) // 输入角色信息
    {
        cin >> name; // 输入角色名
        // 接下来给角色各种属性
        cin >> nv;
        for (int j = 0; j < nv; ++j)
        {
            cin >> oprt;
            role[name].oprt.insert(oprt);
        }
        cin >> no;
        for (int j = 0; j < no; ++j)
        {
            cin >> resource_cate;
            role[name].resource_cate.insert(resource_cate);
        }
        cin >> nn;
        for (int j = 0; j < nn; ++j)
        {
            cin >> resource_name;
            role[name].resource_name.insert(resource_name);
        }
    }

    int ns;
    string role_name, user_name;
    for (int i = 0; i < m; ++i) // 进行角色关联
    {
        cin >> role_name;
        cin >> ns;
        for (int j = 0; j < ns; ++j)
        {
            cin >> user_name;                  // 用户类型直接忽略
            cin >> user_name;                  // 输入用户姓名
            user[user_name].insert(role_name); // 将角色名与用户名关联
        }
    }

    int ng;
    for (int i = 0; i < q; ++i)
    {
        bool authorized = false; // 某个用户是否被授权了某种行为
        queue<string> user_list;

        cin >> user_name;
        user_list.push(user_name);
        cin >> ng;
        for (int j = 0; j < ng; ++j)
        {
            cin >> user_name;
            user_list.push(user_name);
        }
        cin >> oprt >> resource_cate >> resource_name;
        while (!user_list.empty())
        {
            if (have_access(user_list.front(), oprt, resource_cate, resource_name))
            {
                authorized = true;
                break;
            }
            user_list.pop();
        }
        if (authorized)
            cout << 1 << endl;
        else
            cout << 0 << endl;
    }
}

bool have_access(string user_name, string oprt, string resource_cate, string resource_name)
{
    for (string role_name : user[user_name])
    {
        if (role[role_name].oprt.count(oprt) || role[role_name].oprt.count("*"))
            if (role[role_name].resource_cate.count(resource_cate) || role[role_name].resource_cate.count("*"))
                if (role[role_name].resource_name.count(resource_name) || role[role_name].resource_name.empty())
                    return true;
    }
    return false;
}
```

代码开头的 `ios::sync_with_stdio(false); cin.tie(0); cout.tie(0);` 是用于加速读写的。因为这里需要以空格为划分读取字符串，所以使用 `scanf` 不太方便，于是使用了 `cin`。