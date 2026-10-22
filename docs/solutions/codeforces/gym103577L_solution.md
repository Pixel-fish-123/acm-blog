# gym103577L Convert to heap 题解

## 题意
一棵 $n$ 个点的树（$1 \le n \le 10^5$），根为 $1$，点权 $a_i$（$0 \le a_i \le 10^9$）。可以做 $q$ 次更新（$1 \le q \le 1000$）：第 $i$ 次选一个点集，给其中每个点加上 $x_i$（$1 \le x_i \le 1000$）。要求最终满足堆性质：每个非根节点的值不超过其父亲；在所有合法方案中最小化 $\sum a_i$。有解输出最小值，否则输出 $-1$。

## 核心思路
**算法类型**：树形 DP + 背包 DP（bitset 求可达子集和）。

每次更新对每个点独立可选加或不加，因此每个点最终增加的量都是 $\{x_1,\ldots,x_q\}$ 的某个子集和，可达集合对所有点相同。先用 bitset 做 $0/1$ 背包，得到所有可达和，再预处理 `next[i]`：不小于 $i$ 的最小可达和（不存在则为 $-1$）。设全集和为 $S$，则 $0$ 与 $S$ 都可达。

设 $f[u]$ 为点 $u$ 的最终权值。堆约束要求对每个儿子 $c$ 有 $f[u] \ge f[c]$，即增量 $\mathrm{add}[u] \ge f[c] - a_u$。自底向上 DFS：先算完所有儿子，令
$$
\mathit{need} = \max(0,\max_c (f[c] - a_u)),
$$
再取 $\mathrm{add}[u] = \texttt{next}[\mathit{need}]$（若 $\mathit{need} > S$ 或不可达则无解），于是 $f[u] = a_u + \mathrm{add}[u]$。每个点都取满足约束的最小可达增量，总和即最小。

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
const int MAXL = 3e6 + 5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

std::bitset<MAXL> dp;
vector<int> G[MAXL];
void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);

    int n, q;
    cin >> n >> q;

    vector<LL> arr(n + 1, 0);
    vector<LL> next(MAXL, 0);
    
    for (int i = 1; i <= n; i ++) {
        cin >> arr[i];
    }

    for (int i = 0; i < n - 1; i ++) {
        int u, v;
        cin >> u >> v;
        G[u].push_back(v);
        G[v].push_back(u);
    }

    dp[0] = 1;
    LL S = 0;

    for (int i = 0; i < q; i ++) {
        int x;
        cin >> x;
        dp |= (dp << x);
        S += x;
    }

    LL pos = -1;
    for (int i = S; i >= 0; i --) {
        if (dp[i]) {
            pos = i;
        }
        next[i] = pos;
    }

    int root = 1;
    LL res = 0;
    vector<LL> f(n + 1, 0);

    bool ok = true;

    auto dfs = [&](auto self, int now, int fa) -> void {
        LL need = 0;
        for (auto c : G[now]) {
            if (c == fa) continue;
            self(self, c, now);
            need = std::max(need, f[c] - arr[now]);
        }

        if (need > S || next[need] == -1) {
            cout << -1 << endl;
            exit(0);
        }

        f[now] = arr[now] + next[need];
        res += f[now];
    };

    dfs(dfs, root, 0);

    cout << res << endl;
    
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
bitset 背包：$O(q \cdot S / w)$，其中 $S = \sum x_i \le 10^6$，$w$ 为字长。树上 DFS 为 $O(n)$。总时间 $O(qS/w + n)$，空间 $O(S + n)$（代码里邻接表开到 `MAXL` 偏大，实际只需 $n$）。
