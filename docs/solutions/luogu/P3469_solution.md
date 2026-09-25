# P3469 [POI 2008] BLO-Blockade 题解

## 题意

$n$ 个城镇、$m$ 条双向道路构成连通无向图（无重边自环，$n\le 10^5$，$m\le 5\times 10^5$）。对每个节点 $i$，去掉与 $i$ 关联的所有边（**保留节点 $i$ 本身**）后，求有多少个有序点对 $(x,y)$（$x\neq y$）满足 $x$ 与 $y$ 不连通。

## 核心思路

**算法类型**：Tarjan 割点 + 连通块大小统计（一遍 DFS）。

**删除节点 $i$ 的邻边后的连通块结构**：节点 $i$ 自己成为孤立块；对 $i$ 在 DFS 树上的每个孩子 $c$，若 $c$ 的子树**没有返祖边跳到 $i$ 之上**（即 $\mathrm{low}[c]\ge \mathrm{dfn}[i]$，这正是割点判定条件），该子树（大小 $\mathrm{Tsize}[c]$）自成一块；其余部分（$N-1-\sum \mathrm{Tsize}$ 个点）连成"上方块"。

**有序不连通点对数的计数**：设各块大小为 $c_1,c_2,\dots$（$\sum c_i=N$），则不连通的有序点对数

$$N^2-\sum_i c_i^2$$

（总有序对 $N(N-1)$ 减去同块有序对 $\sum c_i(c_i-1)$）。代码把它拆成分块累加：每个"逃不上去"的子树贡献 $\mathrm{Tsize}[c]\cdot(N-\mathrm{Tsize}[c])$（该块与块外所有点的有序对，块间对会从两侧各计一次），上方块 $u$ 贡献 $u\cdot(\text{sum}+1)+u+\text{sum}$（与子树们及 $i$ 本身的对），恰好等于 $2\bigl[u\cdot\mathrm{sum}+u+\mathrm{sum}\bigr]$，与公式一致。非割点时只剩 $\{i\}$ 与其余 $N-1$ 个点两块，答案直接为 $2(N-1)$。

**割点判定**：非根点 $v$ 是割点当且仅当存在孩子 $c$ 使 $\mathrm{low}[c]\ge \mathrm{dfn}[v]$；根（DFS 起点 $1$）是割点当且仅当 DFS 孩子数 $\ge 2$（代码中 `now != 1 || flag > 1`）。注意本实现未显式跳过父边，但由于树边使 $\mathrm{low}[c]\le\mathrm{dfn}[v]$ 恒成立，条件 $\mathrm{low}[c]\ge\mathrm{dfn}[v]$ 等价于 $\mathrm{low}[c]=\mathrm{dfn}[v]$，与标准写法判定结果一致。

图连通，一次 `tarjan(1)` 即覆盖全图。

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
// 支持lcm函数
#define LL long long
#define ULL unsigned long long
#define pair_int std::pair<int, int>
#define pair_LL std::pair<LL, LL>
const int INF_INT = 0x3f3f3f3f;
const LL INF_LL = 1e18;
const LL mod = 998244353;
const LL MAXL = 1e5 + 5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

vector<int> G[MAXL];
int dfn[MAXL], low[MAXL];
int Tsize[MAXL];
bool cut[MAXL];
LL ans[MAXL];
LL num = 0;
int N, M;
void tarjan(int now) {
    dfn[now] = low[now] = ++ num;
    Tsize[now] = 1;

    LL flag = 0, sum = 0;
    for (int i = 0; i < G[now].size(); i ++) {
        int next = G[now][i];

        if (dfn[next] == 0) {
            tarjan(next);
            Tsize[now] += Tsize[next];
            low[now] = std::min(low[now], low[next]);
            if (low[next] >= dfn[now]) {
                flag ++;
                ans[now] += (LL)Tsize[next] * (N - Tsize[next]);
                sum += Tsize[next];
                if (now != 1 || flag > 1) cut[now] = true;
            }
        }
        else low[now] = std::min(low[now], dfn[next]);
    }
    if (cut[now]) {
        ans[now] += (LL)(N - sum - 1) * (sum + 1) + (N - 1);
    }
    else {
        ans[now] = 2 * (N - 1);
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
        G[u].push_back(v);
        G[v].push_back(u);
    }

    tarjan(1);

    for (int i = 1; i <= N; i ++) {
        cout << ans[i] << endl;
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


:::

## 复杂度

- 时间复杂度：$O(n+m)$，一次 DFS 遍历所有边并顺手完成统计。
- 空间复杂度：$O(n+m)$，邻接表与各辅助数组（答案最大约 $10^{10}$，用 `long long`）。
