# P8436 【模板】边双连通分量 题解

## 题意

给定 $n$ 个节点 $m$ 条无向边的图（$1\le n\le 5\times 10^5$，$1\le m\le 2\times 10^6$，**不保证简单图，可能有重边和自环**），输出边双连通分量的个数，并输出每个分量（第一行分量数 $x$；接下来 $x$ 行，每行第一个数是分量大小，后跟分量内的点，顺序任意）。

## 核心思路

**算法类型**：Tarjan 找桥 + 删桥后 DFS。

**第一步：Tarjan 标记所有桥**。边双连通分量的定义是"极大的无桥连通子图"，因此先找出全部桥：

- DFS 维护 `dfn` 与 `low`，树边 $(now, next)$ 回溯时若

  $$\mathrm{low}[next]>\mathrm{dfn}[now]$$

  说明 `next` 的子树没有任何边绕回 `now` 及其上方，树边 $(now,next)$ 是**桥**，标记 `bridge[id] = true`；
- 反向边的排除用**边编号** `id != in_edge` 判断而非比较顶点——这样两条**重边**不会被误判为桥（平行边的另一条提供了绕行路径，两端点仍属同一边双）；自环对 `low` 无影响，也不构成桥。

**第二步：删桥 DFS 划分分量**。重新从每个未访问的点出发 DFS，遍历时**跳过桥边**（`bridge[id]`）与已访问点。走不到桥的另一侧，每个 DFS 连通区域恰好就是一个边双连通分量，用 `bel` 记录归属、`ans` 收集成员。

由于输出顺序任意，按 DFS 序输出即可。

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
const int MAXL = 5e5 + 5;
const int MAXN = 2e6 + 5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

struct edge
{
    int to, id;
};

int N, M;

vector<edge> G[MAXL];
int dfn[MAXL], low[MAXL], bel[MAXL];
bool bridge[MAXN];

int num = 0, cnt = 0;
vector<int> ans[MAXL];

void tarjan(int now, int in_edge) {
    dfn[now] = low[now] = ++ num;

    for (int i = 0; i < G[now].size(); i ++) {
        int next = G[now][i].to;
        int id = G[now][i].id;

        if (!dfn[next]) {
            tarjan(next, id);
            low[now] = std::min(low[now], low[next]);
            if (low[next] > dfn[now]) {
                bridge[id] = true;
            }
        }
        else if (id != in_edge) {
            low[now] = std::min(low[now], dfn[next]);
        }
    }
}

void dfs(int now) {
    bel[now] = cnt;
    ans[cnt].push_back(now);

    for (int i = 0; i < G[now].size(); i ++) {
        int next = G[now][i].to;
        int id = G[now][i].id;

        if (bel[next] || bridge[id]) continue;

        dfs(next);
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
        if (!dfn[i]) tarjan(i, -1);
    }

    for (int i = 1; i <= N; i ++) {
        if (!bel[i]) {
            cnt ++;
            dfs(i);
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

- 时间复杂度：$O(n+m)$，两次 DFS（Tarjan 找桥、删桥划分）各访问每点每边一次。
- 空间复杂度：$O(n+m)$，邻接表、桥标记与各分量的点集。
