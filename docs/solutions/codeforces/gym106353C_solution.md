# gym106353C Canal Crossing 题解

## 题意
给定 $n$（$3 \le n \le 10^5$）个地点和 $n - 1$ 条带正权 $w$（$1 \le w \le 10^6$）的街道，街道构成一棵树。另外给定 $m$（$1 \le m \le 5 \cdot 10^5$）座长度为 $0$ 的桥。要求寻找一条起点和终点相同的回路（Tour），使得**每座桥恰好经过 $1$ 次**，且**每条街道最多经过 $1$ 次**。题目保证至少存在一条合法的回路，求最短回路的长度。

## 核心思路
**算法类型**：树上差分 + 欧拉回路 + DFS（欧拉回路度数奇偶性 / 树上异或差分）。

我们要从树中选择一个街道子集，与全部 $m$ 座桥共同构成一条欧拉回路：
1. **树边选法唯一确定**：
   在任何回路中，跨越任意一个割的边数总和必须为**偶数**。考虑树上的任意一条街道 $e$，删去 $e$ 会将树分成子树 $T_e$ 和外部 $V \setminus T_e$ 两部分，且连接这两部分的街道只有 $e$ 这一条。
   - 若跨越 $T_e$ 与外部的桥的数量为**奇数**，为了让跨割总边数为偶数，街道 $e$ **必须被选中**（经过 $1$ 次）；
   - 若跨越 $T_e$ 与外部的桥的数量为**偶数**，由于每条街道最多走 $1$ 次，街道 $e$ **一定不能被选中**（经过 $0$ 次）。
   因此，满足所有顶点度数为偶数的树边选法是**唯一**的。又因为题目保证至少存在一条合法回路，这个唯一满足度数奇偶性要求的边集必然天然连通，无需额外添加街道去连通不同分量。
2. **子树异或和统计跨割奇偶性**：
   一座桥若两个端点都在 $T_e$ 内，对 $T_e$ 内度数和贡献为 $2$（偶）；若恰有一个端点在 $T_e$ 内，贡献为 $1$（奇）。因此跨越 $T_e$ 的桥数奇偶性等于 $T_e$ 内所有节点所连桥数的奇偶性异或和。
   用 `deg[u]` 记录每个点连接桥数的奇偶性（每读入一座桥 `(u, v)` 就令 `deg[u] ^= 1, deg[v] ^= 1`），然后从根节点 $1$ 开始做一次树上 DFS 自底向上累加子树异或和：若 `deg[now] == 1`，则 `now` 到父节点 `fa` 的街道必须走，将其边权累加进答案即可。

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
const int INF_INT = INT_MAX - 5;
const LL INF_LL = LONG_LONG_MAX - 5;
const LL MOD1 = 998244353;
const LL MOD2 = 1e9 + 7;
const int MAXL = 1e5 + 5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

vector<pair_int> G[MAXL];

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int n;
    cin >> n;

    for (int i = 1; i < n; i ++) {
        int u, v, w;
        cin >> u >> v >> w;

        G[u].push_back({v, w});
        G[v].push_back({u, w});
    }

    vector<int> deg(n + 1, 0);

    int m;
    cin >> m;

    for (int i = 0; i < m; i ++) {
        int u, v;
        cin >> u >> v;

        deg[u] ^= 1;
        deg[v] ^= 1;
    }

    LL res = 0;
    auto dfs = [&](auto& self, int now, int fa) -> void {
        int fa_val = 0;
        for (int i = 0; i < G[now].size(); i ++) {
            int next = G[now][i].first;
            if (next != fa) self(self, next, now);
            else {
                fa_val = G[now][i].second;
            }
        }

        if (deg[now] == 1) {
            res += fa_val;
            deg[fa] ^= 1;
        }

    };

    dfs(dfs, 1, 0);

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
- 时间复杂度：$O(n + m)$，读入桥并做一次树上 DFS 遍历。
- 空间复杂度：$O(n)$，用于存储树邻接表、节点奇偶性数组与递归栈。

预估难度：CF 1500（约 1500*）。本题难度由 AI 预估，仅作为参考。
