---
tags: [Tarjan]
difficulty: "普及+/提高-"
source: "https://www.luogu.com.cn/problem/P8435"
---
# P8435 【模板】点双连通分量 题解

## 题意

给定 $n$ 个节点 $m$ 条无向边的图（$1\le n\le 5\times 10^5$，$1\le m\le 2\times 10^6$，本题采用"不存在割点的图"作为点双连通的定义），输出点双连通分量的个数，并输出每个分量（第一行分量数 $x$；接下来 $x$ 行，每行第一个数是分量大小，后跟分量内的点，顺序任意）。

## 核心思路

**算法类型**：Tarjan 求点双连通分量（**边栈**实现）。

**DFS 与边栈**：邻接表中每条边带编号 `id`。DFS 时维护一个**边栈** `st`：

- **树边**（`next` 未访问）：先压栈再递归；
- **返祖边**（`next` 已访问、不是入边的反向、`dfn[next] < dfn[now]`）：压栈并用 `dfn[next]` 更新 `low`。用 `id != in_edge` 而不是"父亲顶点"来排除反向边，正确处理了**重边**（平行边的另一条仍算返祖边）；自环因 `dfn` 相等不满足严格小于，不会入栈。

**分量弹出条件**：回溯时若 `low[next] >= dfn[now]`，说明 `next` 的子树无法绕过 `now`——`now` 是割点（或 DFS 树根），此时从边栈顶不断弹边、把每条边的两端点收进当前分量，直到弹出树边 `(now, next)` 为止。弹出的这些边（及其端点）恰好构成一个极大的点双连通子图。

**关键细节**：

- **割点属于多个点双**：`now` 作为多个子树的"汇合点"会出现在多个分量中，各分量独立收集，不去重跨分量；分量内部用排序加 `unique` 去掉重复端点；
- **孤立点**：DFS 树根若无任何树孩子（`in_edge == -1 && child == 0`），该点自身单独构成一个分量；
- 每条边至多入栈出栈一次，每个点双连通分量至少含一个非割点，分量总数不超过 $n$。

## 参考代码

```cpp
// 
#include <iostream>
#include <cstring>
#include <cstdio>
#include <algorithm>
#include <vector>
#include <queue>
#include <iomanip>
#include <string>
#include <map>
#include <stack>
#include <set>
#include <bitset>
#include <random>
#include <unordered_map>
#include <cmath>
#include <numeric>
#include <sstream>
// 支持lcm函数
#define LL long long
#define ULL unsigned long long
#define pair_int std::pair<int, int>
#define pair_LL std::pair<LL, LL>
const int INF_INT = 0x3f3f3f3f;
const LL INF_LL = 1e18;
const LL mod = 998244353;
const int MAXL = 5e5 + 10; 
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

int N, M;

struct edge
{
    int to, id;
};

struct node
{
    int u, v;
};

vector<edge> G[MAXL];

int dfn[MAXL], low[MAXL];
int num = 0, cnt = 0;

vector<node> st;
vector<int> ans[MAXL];


void tarjan(int now, int in_edge) {
    dfn[now] = low[now] = ++ num;

    int child = 0;
    for (int i = 0; i < G[now].size(); i ++) {
        int next = G[now][i].to;
        int id = G[now][i].id;

        if (!dfn[next]) {
            child ++;
            st.push_back({now, next});

            tarjan(next, id);
            low[now] = std::min(low[now], low[next]);

            if (low[next] >= dfn[now]) {
                cnt ++;

                while (true) {
                    node e = st.back();
                    st.pop_back();

                    ans[cnt].push_back(e.u);
                    ans[cnt].push_back(e.v);

                    if (e.u == now && e.v == next) break;
                }
                std::sort(ans[cnt].begin(), ans[cnt].end());
                ans[cnt].erase(std::unique(ans[cnt].begin(), ans[cnt].end()), ans[cnt].end());
            }
        }
        else if (id != in_edge && dfn[next] < dfn[now]) {
            st.push_back({now, next});
            low[now] = std::min(low[now], dfn[next]);
        }
    }

    if (in_edge == -1 && child == 0) {
        cnt ++;
        ans[cnt].push_back(now);
    }
}

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    cin >> N >> M;

    for (int i = 0; i < M; i ++) {
        int u, v;
        cin >> u >> v;

        G[u].push_back({v, i});
        G[v].push_back({u, i});
    }

    for (int i = 1; i <= N; i ++) {
        if (!dfn[i]) {
            tarjan(i, -1);
        }
    }

    cout << cnt << endl;

    for (int i = 1; i <= cnt; i ++) {
        cout << ans[i].size();

        for (int j = 0; j < ans[i].size(); j ++) {
            cout << " " << ans[i][j];
        }

        cout << endl;
    }


    return;
}

int main()
{
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cout.tie(nullptr);
    int _ = 1;
    // cin >> _;
    for (int i = 0; i < _; i++)
    {
        solve();
    }
    return 0;
}
```

## 复杂度

- 时间复杂度：Tarjan 部分 $O(n+m)$；每个分量单独排序去重，总计 $O\bigl(n\log n+m\bigr)$ 级别。
- 空间复杂度：$O(n+m)$，邻接表、边栈与各分量的点集。
