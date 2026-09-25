---
tags: [LCA, 树上问题]
difficulty: "普及"
source: "https://www.luogu.com.cn/problem/P3379"
---
# P3379 【模板】最近公共祖先（LCA）题解

## 题意

给定一棵有根多叉树（$1\le N,M\le 5\times 10^5$，根为 $S$），$M$ 次询问，每次求两个点的最近公共祖先。**不保证** $a\neq b$。

## 核心思路

**算法类型**：倍增求 LCA（在线算法）。

**预处理**：从根出发一次 DFS，记录每个点的深度 `depth` 与直接父亲 `anc[x][0]`；再通过递推

$$anc[i][j]=anc\bigl[anc[i][j-1]\bigr][j-1]$$

预处理出每个点向上跳 $2^j$ 步到达的祖先。$N\le 5\times 10^5<2^{19}$，$j$ 取到 $18$ 已足够覆盖任意深度差。注意代码中 `depth[root]=1`、`anc[root][0]=root`——根的祖先指向自身，使"跳出根"的跳跃自动失效（深度不再变化），不需要额外判界。

**查询 `LCA(u, v)` 分三步**：

1. **深度对齐**：保证 $u$ 是较深的点，从高位到低位枚举 $j$，只要 $anc[u][i]$ 的深度仍 $\ge depth[v]$ 就把 $u$ 上跳 $2^i$ 步，最终 $u,v$ 同深；
2. **特判重合**：若此时 $u=v$（含询问两点相同的情形），$u$ 本身就是 LCA，直接返回——这一步覆盖了"不保证 $a\neq b$"的边界；
3. **同步上跳**：再次从高位到低位，只要 $anc[u][i]\neq anc[v][i]$ 就把两点同时上跳。循环结束后两点恰好位于 LCA 的下一层，答案为 $anc[u][0]$。

从高位枚举是为了用二进制拆分精确凑出任意步数；"跳到不同点才跳"保证了不会越过 LCA。

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
const LL MAXL = 5e5 + 10;
using std::cin;
using std::cout;
using std::endl;

int N, M, root;
std::vector<int> G[MAXL];
int depth[MAXL], fa[MAXL];
int anc[MAXL][20];

void init()
{
    for (int j = 1; j <= 18; j ++) {
        for (int i = 1; i <= N ; i ++) {
            anc[i][j] = anc[anc[i][j - 1]][j - 1];
        }
    }
    return;
}

void dfs (int now, int fa) 
{
    for (int i = 0; i < G[now].size(); i ++) {
        int next_ = G[now][i];
        if (next_ == fa) continue;
        depth[next_] = depth[now] + 1;
        anc[next_][0] = now;
        dfs(next_, now);
    }
}

int LCA(int u, int v)
{
    if(depth[u] < depth[v]) std::swap(u, v);
    if(depth[u] > depth[v]) {
        for (int i = 18 ; i >= 0; i --) {
            if (depth[anc[u][i]] >= depth[v]) {
                u = anc[u][i];
            }
        }
    }
    if(u == v) return u;
    for(int i = 18 ; i >= 0; i --) {
        if(anc[u][i] != anc[v][i]) {
            u = anc[u][i];
            v = anc[v][i];
        }
    }
    return anc[u][0];
}

void solve() 
{
    cin >> N >> M >> root;
    for(int i = 0; i < N - 1; i ++) {
        int u, v;
        cin >> u >> v;
        G[u].emplace_back(v);
        G[v].emplace_back(u);
    }
    depth[root] = 1;
    anc[root][0] = root; 
    dfs(root, 0);
    init();
    for(int i = 0; i < M; i ++) {
        int u, v;
        cin >> u >> v;
        cout << LCA(u, v) << endl;
    }
    return;
}

int main() 
{
    //std::ios::sync_with_stdio(false); cin.tie(nullptr); cout.tie(nullptr);
    int _ = 1;
    for (int i = 0; i < _; i++) {
        solve();
    }
    return 0;
}
```

## 复杂度

- 时间复杂度：预处理 $O(N\log N)$，单次询问 $O(\log N)$，总计 $O\bigl((N+M)\log N\bigr)$。
- 空间复杂度：$O(N\log N)$，倍增表 `anc`。
