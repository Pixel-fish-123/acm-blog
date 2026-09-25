# P3379(tarjan) 【模板】最近公共祖先（LCA）题解（Tarjan 离线做法）

## 题意

给定一棵有根多叉树（$1\le N,M\le 5\times 10^5$，根为 $S$），$M$ 次询问，每次求两个点的最近公共祖先。**不保证** $a\neq b$。

## 核心思路

**算法类型**：Tarjan 离线 LCA（DFS 后序 + 并查集）。

**离线存储询问**：把每个询问 $(x,y)$ 同时挂在 $x$ 和 $y$ 的询问链上（`Q[x]` 存 $(y,i)$，`Q[y]` 存 $(x,i)$）——这样无论哪个端点后被 DFS 访问到，询问都能被处理。

**DFS 的核心不变量**：`dfs(now)` 进入时令 `fa[now]=now`（自己是一身祖先链的暂时代表）。依次递归每个未访问的孩子 `c`；**孩子子树整体处理完后**，令 `fa[c]=now`——借助 `find` 的路径压缩，此时 `c` 子树内任何点的并查集代表都汇聚到 `now`。

**在回溯阶段（后序位置）回答挂在 `now` 上的询问**：对询问搭档 $y$，

- 若 `vis[y]=0`（$y$ 尚未被访问），跳过——这条询问会在之后访问到 $y$ 时从另一端得到处理；
- 若 $y$ 已访问，则 `find(y)` 即为 $\mathrm{LCA}(now,y)$。

**为什么 `find(y)` 恰是 LCA**：$y$ 已访问说明 $y$ 在当前 DFS 栈上某个"已完成分支"里。`dfs(now)` 处理到询问时，`now` 的祖先链上每一层要么还在递归中（其 `fa` 指向自身），要么……具体地，$y$ 所在子树已被完整回溯，其代表沿着 `fa` 链恰好停在"$now$ 的某个孩子"上——这个孩子正是 $\mathrm{LCA}$。形式地说：`find(y)` 返回的是**已访问部分中包含 $y$ 的、最深的一个"正在访问中"节点的孩子**，即 $y$ 与 `now` 的公共祖先中最深者。

两点相同的询问（$x=y$）：访问到 $x$ 时搭档就是自己且已标记访问，`find(x)` 返回 $x$ 自身（`fa[x]=x`），正确处理了 $a\neq b$ 不保证的边界。

全部 DFS 结束后按原顺序输出答案即可。

::: details 点击展开参考代码

## 参考代码

```cpp
#include<cmath>
#include<iostream>
#include<cstring>
#include<cstdio>
#include<algorithm>
#include<vector>
#include<queue>
#include<iomanip>
#include<string>
#include<map>
#include<stack>
#include<set>
#include<bitset>
#include<random>
#define LL long long
#define ULL unsigned long long
#define pair_int pair<int, int>
#define pair_LL pair<LL, LL>
const int INF_INT = 0x3f3f3f3f;
const LL INF_LL = 1e18;
const LL mod = 998244353;
const LL MAXL = 1e6;
using std::cin;
using std::cout;
using std::endl;

std::vector<int> G[MAXL];
std::vector<pair_int> Q[MAXL];
int fa[MAXL], vis[MAXL], ans[MAXL];
int N, M, rt;

inline int find(int x) 
{
    if (x == fa[x]) return x;
    return fa[x] = find(fa[x]);
}

void dfs(int now) 
{
    fa[now] = now;
    vis[now] = 1;
    for (int i = 0; i < G[now].size(); i ++) {
        int &next_ = G[now][i];
        if (vis[next_]) continue;
        dfs(next_);
        fa[next_] = now;
    }

    for(int i = 0; i < Q[now].size(); i ++) {
        pair_int &temp = Q[now][i];
        if (!vis[temp.first]) continue;
        ans[temp.second] = find(temp.first);
    }

}
void solve() 
{
    cin >> N >> M >> rt;
    for (int i = 0; i < N - 1; i ++) {
        int u, v;
        cin >> u >> v;
        G[u].push_back(v);
        G[v].push_back(u);
    }

    for (int i = 0; i < M; i ++) {
        int x, y;
        cin >> x >> y;
        Q[x].push_back(std::make_pair(y, i));
        Q[y].push_back(std::make_pair(x, i));
    }

    dfs(rt);

    for (int i = 0; i < M; i ++) {
        cout << ans[i] << endl;
    }

    return;
}
int main() 
{
    std::ios::sync_with_stdio(false); cin.tie(nullptr); cout.tie(nullptr);
    int _ = 1;
    for (int i = 0; i < _; i++) {
        solve();
    }
    return 0;
}
```


:::

## 复杂度

- 时间复杂度：$O\bigl((N+M)\alpha(N)\bigr)$——每个点进出 DFS 各一次，每条询问在两端各尝试一次，并查集带路径压缩近似常数。
- 空间复杂度：$O(N+M)$，邻接表、询问链与答案数组。
