# gym104381L Walking to School 题解

## 题意
$n$ 个路口、$m$ 条无向边（$1 \le n \le 1000$，$m \le \min(1000, n^2/3)$），从 $1$ 走到 $T$。每条边权 $x_i$（$0 \le x_i \le 100$）：$x_i=0$ 表示已清雪，否则为积雪深度。设当前「疲惫值」为 $d$（初始为 $0$）：走积雪边时能量消耗为 $d \times x_i$，然后 $d$ 加 $1$；走清雪边不耗能、$d$ 不变。求到 $T$ 的最小能量，不可达输出 $-1$。

## 核心思路
**算法类型**：最短路（状态为「点 + 已走积雪边数」的 SPFA）+ 数学（代价与积雪边条数成线性关系）。

定义状态 $\mathrm{dp}[u][k]$：从 $1$ 走到点 $u$，且**已经走过恰好 $k$ 条积雪边**时的最小能量。这里的 $k$ 是到达 $u$ **之后**、准备走下一条边**之前**已经计入的积雪边条数，因此当前疲惫值 $d$ 恰好等于 $k$。

初始状态：$\mathrm{dp}[1][0] = 0$（仍在起点，未走过积雪边），其余为 $+\infty$。把 $(1,0)$ 入队。

从状态 $(u,k)$ 枚举出边 $u\to v$，权值为 $w$，统一用公式「新代价 $= \mathrm{dp}[u][k] + w\cdot k$」松弛（与代码 `nd = dp[x][k] + w * k` 一致）：
- **清雪边**（$w=0$）：$d$ 不变。转移到 $(v,\,k)$，$nk=k$，代价增量 $0$。
- **积雪边**（$w>0$）：先按当前 $d=k$ 付费，再把 $d$ 加 $1$。转移到 $(v,\,k+1)$，$nk=k+1$，代价增量 $w\cdot k$。

为什么乘的是 $k$ 而不是 $k+1$：题面规定走积雪边时「先按当前疲惫值消耗，再 $d\leftarrow d+1$」。因此走这条边时用的是**走之前**的 $d=k$；第一条积雪边贡献为 $0$，第二条为 $1\cdot w$，以此类推。$k$ 的上界取 $n$ 即可（代码里 `nk > n` 直接丢弃）。

用队列做 SPFA 松弛全部可达状态；答案为 $\min_{0\le k\le n}\mathrm{dp}[T][k]$，若全为 $+\infty$ 则输出 $-1$。
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
const LL MOD1 = 998244353;
const LL MOD2 = 1e9 + 7;
const int MAXL = 1e3 + 5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

vector<pair_LL> G[MAXL];

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int n, m, T;
    cin >> n >> m >> T;

    vector<vector<LL>> dp(n + 5, vector<LL>(n + 5, INF_LL));
    vector<vector<char>> inq(n + 1, vector<char>(n + 1, 0));
    std::queue<pair_int> q;

    for (int i = 0; i < m; i ++) {
        LL u, v, w;
        cin >> u >> v >> w;
        G[u].push_back({v, w});
        G[v].push_back({u, w});
    }
    
   dp[1][0] = 0;
   q.push({1, 0});
   inq[1][0] = 1;

    while (q.size()) {
        auto [x, k] = q.front();
        q.pop();
        inq[x][k] = 0;
        for (auto [v, w] : G[x]) {
            int nk = (w == 0) ? k : k + 1;
            if (nk > n) continue;
            LL nd = dp[x][k] + w * k;
            if (nd < dp[v][nk]) {
                dp[v][nk] = nd;
                if (!inq[v][nk]) {
                    inq[v][nk] = 1;
                    q.push({v, nk});
                }
            }
        }
    }

    LL minn = INF_LL;

    for (int k = 0; k <= n; k ++) {
        minn = std::min(minn, dp[T][k]);
    }

    if (minn != INF_LL) cout << minn << endl;
    else {
        cout << -1 << endl;
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
状态数 $O(n^2)$，边扩展 $O(mn)$，SPFA 最坏接近该量级。时间 $O(n^2 + mn)$ 量级，空间 $O(n^2 + m)$。

预估难度：CF 1900（约 1900*）。本题难度由 AI 预估，仅作为参考。
