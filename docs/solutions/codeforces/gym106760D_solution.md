# gym106760D Arena Paths 题解

## 题意

多组数据。给定 $N$ 个点、$M$ 条双向边的无向图（不保证连通）。构造一张与原图同顶点集的新图 $H$，边数尽量少，使得对任意两点 $u, v$，若它们在原图中的最短路长度为 $d$（若不可达则无需考虑），则在 $H$ 中的最短路长度恰好为 $\lceil d/2 \rceil$。

输出 $H$ 的边数及每条边的端点（多解任输出）。

数据范围：$1 \le t \le 1000$，$1 \le N, M \le 1000$，$\sum N \le 2000$，$\sum M \le 10^4$。

## 核心思路

**算法类型**：构造 + DFS（求图的平方 $G^2$）。

先说明目标图的唯一最小答案就是原图的平方 $G^2$：在 $G$ 中距离不超过 $2$ 的点对之间连边（含原边）。

- **必要性**：若 $d_G(u,v)=1$，则需 $d_H(u,v)=1$，原边必须保留；若 $d_G(u,v)=2$，则需 $d_H(u,v)=1$，必须直接连边。故 $G^2$ 的每条边都不可或缺。
- **充分性**：在 $G^2$ 中沿原最短路每次跨越至多 $2$ 条原边，可将长度为 $d$ 的路径压成长度 $\lceil d/2 \rceil$ 的路径；同时不会把距离压得更短（否则会与上述必选边的刻画矛盾）。因此 $G^2$ 恰满足题面，且边数最少。

实现：对每个点 $s$ 做深度限制为 $2$ 的 DFS/BFS，把所有满足 $d(s,x)=2$ 的点与 $s$ 之间标记为需要连边；原边直接保留。最后枚举所有被标记的无序对输出即可。注意重边只需保留一次。

::: details 点击展开参考代码

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
#include <array>
// 支持lcm函数
#define LL long long
#define ULL unsigned long long
#define pair_int std::pair<int, int>
#define pair_LL std::pair<LL, LL>
const int INF_INT = 0x3f3f3f3f;
const LL INF_LL = 4e18;
const LL MOD1 = 998244353;
const LL MOD2 = 1e9 + 7;
const int MAXL = 2005;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

vector<int> G[MAXL];
void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int n, m;
    cin >> n >> m;

    vector<vector<int>> vis(n + 1, vector<int>(n + 1, 0));
    vector<int> dis(n + 1, INF_INT);

    for (int i = 0; i < m; i ++) {
        int u, v;
        cin >> u >> v;
        if (vis[u][v]) continue;
        vis[u][v] = vis[v][u] = 1;
        G[u].push_back(v);
        G[v].push_back(u);
    }

    std::stack<int> stk;

    auto dfs = [&](auto self, int now, int fa, int depth) -> void {
        if (depth > 2) return;
        if (depth < dis[now]) {
            dis[now] = depth;
            stk.push(now);
        }
        for (int i = 0; i < G[now].size(); i ++) {
            int next = G[now][i];
            if (next != fa) {
                self(self, next, now, depth + 1);
            }
        }
    };

    for (int i = 1; i <= n; i ++) {
        dfs(dfs, i, 0, 0);
        while (!stk.empty()) {
            int top = stk.top();
            stk.pop();
            if (dis[top] == 2) {
                int u = i, v = top;
                if (!vis[u][v]) {
                    vis[u][v] = vis[v][u] = 1;
                }
            }
            dis[top] = INF_INT;
        }
    }

    vector<pair_int> res;
    for (int i = 1; i <= n; i ++) {
        for (int j = i + 1; j <= n; j ++) {
            if (vis[i][j]) {
                res.push_back({i, j});
            }
        }
    }

    cout << res.size() << endl;
    for (auto x : res) {
        cout << x.first << " " << x.second << endl;
    }

    for (int i = 1; i <= n; i ++) {
        G[i].clear();
    }
    return;
}

int main()
{
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cout.tie(nullptr);
    int _ = 1;
    cin >> _;
    for (int i = 0; i < _; i ++)
    {
        solve();
    }
    return 0;
}
```


:::

## 复杂度

- 时间复杂度：每组对每个点做深度 $\le 2$ 的搜索，总代价约 $O\big(\sum_v (\deg(v) + \sum_{u \in N(v)} \deg(u))\big)$；在 $\sum N \le 2000$、$\sum M \le 10^4$ 下可通过。输出边数至多 $O(N^2)$，但本题 $N$ 总和很小。
- 空间复杂度：$O(N^2)$ 的邻接标记矩阵，外加 $O(N + M)$ 的邻接表。
