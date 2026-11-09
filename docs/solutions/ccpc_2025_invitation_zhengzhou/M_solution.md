# M 川陀航空学院 题解

## 题意
给出 $n$ 个点、$m$ 条边的无向图（$1 \le n \le 10^6$，$0 \le m \le 10^6$，可能有重边和自环）。每次操作可以添加一条边或删除一条边，求把图变成一棵树（连通且无环）所需的最少操作次数。

## 核心思路
**算法类型**：DFS + 贪心（连通块计数 + 生成树/接边下界）。

设图中有 $c$ 个连通块（孤立点也算一个）。

- 一个大小为 $s$ 的连通块最终要变成树，只能保留 $s-1$ 条边，所以至少要删掉 $m-(n-c)$ 条边。每个连通块保留一棵生成树，恰好达到这个下界。
- 这些生成树彼此不连通，还需要 $c-1$ 条边把它们接成一整棵树。

两部分相加：
$$\bigl(m-n+c\bigr)+(c-1)=m-n+2c-1.$$

这也是下界：最终树只有 $n-1$ 条边，每个连通块内部至少要删 $e_i-(s_i-1)$ 条，合计 $m-n+c$；而连接 $c$ 个连通块至少要加 $c-1$ 条边。所以上述方案就是最优的。

代码里用 DFS 数出连通块个数 `node`，直接套公式输出。参考代码是递归 DFS，链状数据下递归深度会达到 $O(n)$。

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
const int MAXL = 1e6 + 5;
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
    int res = 0;
    int node = 0;
    
    cin >> n >> m;
    
    vector<int> vis(n + 1, 0);

    for (int i = 0; i < m; i ++) {
        int u, v;
        cin >> u >> v;
        G[u].push_back(v);
        G[v].push_back(u);
    }


    auto dfs = [&](auto self, int now, int fa) -> void {
        vis[now] = 1;
        int cnt = 1;
        for (int i = 0; i < G[now].size(); i ++) {
            int next = G[now][i];
            if (!vis[next]) {
                self(self, next, now);
            }
        }
    };

    for (int i = 1; i <= n; i ++) {
        if (!vis[i]) {
            dfs(dfs, i, 0);
            node ++;
        }
    }

    cout << m - n + 2 * node - 1 << endl;
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
- 时间复杂度：$O(n+m)$，每个点和每条边只访问一次。
- 空间复杂度：$O(n+m)$，用于存图和访问标记。

预估难度：CF 1200（约 1200*）。本题难度由 AI 预估，仅作为参考。
