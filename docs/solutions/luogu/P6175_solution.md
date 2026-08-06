# P6175 无向图的最小环问题 题解

## 题意

给定一张 $n$ 个点、$m$ 条边的无向带权图，求图中一个至少包含 $3$ 个点、节点不重复的环，使得环上边权之和最小。输出最小环的边权和；若无环，输出 `No solution.`。

数据范围：$1 \le n \le 100$，$1 \le m \le 5 \times 10^3$，边权 $1 \le d \le 10^5$，两点之间可能存在多条边，重边取最小边权。

## 核心思路

最小环问题，采用基于 Floyd 求最短路过程中维护最小环的经典做法。

设 $dist[i][j]$ 表示当前只允许经过编号不超过 $k$ 的中转点时 $i \to j$ 的最短路，$len[i][j]$ 表示两点间直接边的最小权值。外层枚举环上的"最大编号顶点" $k$：

1. 在把 $k$ 加入中转点集合**之前**，$dist[i][j]$ 只经过编号 $< k$ 的点。此时若存在边 $i \to k$ 和 $k \to j$（$i,j < k$），则 $dist[i][j] + len[i][k] + len[k][j]$ 恰好构成一个经过 $k$、其余点编号均小于 $k$ 的简单环（其中 $dist[i][j]$ 对应的路径与边 $k \to j$ 不相交，否则会出现更早被统计的环），用它对答案取最小值；
2. 之后再用 $k$ 作为中转点松弛 $dist$，即执行 Floyd 的一轮更新。

由于枚举 $k$ 时，环上其余点的编号都严格小于 $k$，每个简单环都会在它最大编号的顶点被枚举到的那一轮恰好被统计一次，不会重复也不会遗漏。无环时答案为 $+\infty$，输出 `No solution.`。

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

## 复杂度

- 时间复杂度：$O(n^3)$（三重循环的 Floyd 松弛与最小环统计）。
- 空间复杂度：$O(n^2)$（`dist` 与 `len` 两个邻接矩阵）。
