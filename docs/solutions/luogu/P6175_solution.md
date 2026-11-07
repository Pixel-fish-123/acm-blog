# P6175 无向图的最小环问题 题解

## 题意

给定一张 $n$ 个点、$m$ 条边的无向带权图，求图中一个至少包含 $3$ 个点、节点不重复的环，使得环上边权之和最小。输出最小环的边权和；若无环，输出 `No solution.`。

数据范围：$1 \le n \le 100$，$1 \le m \le 5 \times 10^3$，边权 $1 \le d \le 10^5$，两点之间可能存在多条边，重边取最小边权。

## 核心思路

**算法类型**：最短路 + 枚举（Floyd 外层枚举环上最大编号顶点求无向图最小环）。

设 $dist[i][j]$ 表示当前只允许经过编号不超过 $k$ 的中转点时 $i \to j$ 的最短路，$len[i][j]$ 表示两点间直接边的最小权值。外层枚举环上的"最大编号顶点" $k$：

1. 在把 $k$ 加入中转点集合**之前**，$dist[i][j]$ 只经过编号 $< k$ 的点。此时若存在边 $i \to k$ 和 $k \to j$（$i,j < k$），就用 $dist[i][j] + len[i][k] + len[k][j]$ 更新答案。边权均为正，因此最短路可取为简单路径；该路径与这两条边拼成一个经过 $k$、其余点编号均小于 $k$ 的简单环；
2. 之后再用 $k$ 作为中转点松弛 $dist$，即执行 Floyd 的一轮更新。

设全局最小环上的最大编号顶点为 $k$，与 $k$ 相邻的两个顶点为 $i,j<k$。删去边 $(i,k)$ 与 $(k,j)$ 后，环上剩余的 $i\leadsto j$ 路径只经过编号小于 $k$ 的点，其长度不小于把 $k$ 加入中转集合之前的 $dist[i][j]$。因此候选值 $dist[i][j]+len[i][k]+len[k][j]$ 不超过这个最小环的边权和；另一方面，每个候选都对应一条只含小于 $k$ 的中间点的简单路径，与两条边拼成合法简单环，其边权和不可能低于全局最小值。两边夹逼可知，所有候选的最小值恰好就是最小环的边权和。无环时答案为 $+\infty$，输出 `No solution.`。

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
const LL INF_LL = 1e18;
const LL mod = 998244353;
const int MAXL = 0;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);

    int N, M;
    cin >> N >> M;

    vector<vector<int>> dist(N + 1, vector<int>(N + 1, INF_INT));
    vector<vector<int>> len(N + 1, vector<int>(N + 1, INF_INT));

    for (int i = 1; i <= N; i ++) {
        dist[i][i] = 0;
    }

    for (int i = 0; i < M; i ++) {
        int u, v, w;
        cin >> u >> v >> w;
        len[u][v] = len[v][u] = std::min(len[u][v], w);
        dist[u][v] = dist[v][u] = len[u][v];
    }

    int res = INF_INT;

    for (int k = 1; k <= N; k ++) {
        for (int i = 1; i < k; i ++) {
            for (int j = i + 1; j < k; j ++) {
                if (len[i][k] < INF_INT && len[k][j] < INF_INT)
                    res = std::min(res, dist[i][j] + len[i][k] + len[k][j]);
            }
        }

        for (int i = 1; i <= N; i ++) {
            for (int j = 1; j <= N; j ++) {
                dist[i][j] = std::min(dist[i][j], dist[i][k] + dist[k][j]);
            }
        }
    }

    if (res == INF_INT) {
        cout << "No solution." << endl;
    }
    else {
        cout << res << endl;
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
    for (int i = 0; i < _; i ++)
    {
        solve();
    }
    return 0;
}
```


:::

## 复杂度

- 时间复杂度：$O(n^3)$（三重循环的 Floyd 松弛与最小环统计）。
- 空间复杂度：$O(n^2)$（`dist` 与 `len` 两个邻接矩阵）。
