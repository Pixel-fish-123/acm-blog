# gym101879C Promenade by the lake 题解

## 题意

湖中有 $N$ 座岛，已建好 $M$ 座桥，图连通（可能有重边）。另有 $K$ 座可选桥，可任选其中若干座加入。

问能否加入若干可选桥（也可不加入），使得游客能从湖外出发、恰好经过每座桥一次并回到出发点，即最终图存在欧拉回路。若可以，输出 `YES`、加入的桥数量及具体端点；否则输出 `NO`。

数据范围：$1 \le N \le 3 \cdot 10^5$，$0 \le M, K \le 3 \cdot 10^5$，保证已建桥连通。

## 核心思路

**算法类型**：构造 + DFS（在可选边森林上配对奇度点）。

无向连通图存在欧拉回路当且仅当所有顶点度数均为偶数。已建桥形成的度数记为 $\deg(v)$。加入一条可选边 $\{u,v\}$ 会使 $\deg(u)$、$\deg(v)$ 的奇偶性同时翻转。因此问题化为：在可选边集合中选一个子集，使所有奇度点的奇偶性被翻成偶数。

把可选边看成另一张图 $G'$。一条可选边只能影响其所在连通分量内的顶点，故不同连通分量相互独立。对 $G'$ 的每个连通分量：

- 若该分量内、在原图中度为奇数的顶点个数为奇数，则无法配对，答案为 `NO`（奇度点必须两两配对）；
- 若为偶数，则一定可以：在该连通分量内任取一棵生成树，从叶子向根做 DFS——若当前点仍为奇度，就把「当前点—父亲」这条树边加入答案，并翻转二者奇偶。由于奇度点个数为偶数，处理完子树后根的奇偶性一定变为偶数，不会真正需要向虚拟父亲连边。

正确性：每加入一条树边等价于把路径两端的奇偶一起翻转；上述过程恰把分量内奇度点两两用树路径连起来，最终全体变偶。原图本已连通，加边后仍连通，故得到欧拉回路。

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
const int MAXL = 3e5 + 5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

vector<int> G[MAXL];
vector<int> G_[MAXL];

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int n, m, k;
    cin >> n >> m >> k;

    vector<int> deg(n + 1, 0);

    for (int i = 1; i <= m; i ++) {
        int u, v;
        cin >> u >> v;
        G[u].push_back(v);
        G[v].push_back(u);
    }

    for (int i = 1; i <= n; i ++) {
        deg[i] = G[i].size();
    }

    vector<int> vis(n + 1, 0);

    for (int i = 0; i < k; i ++) {
        int u, v;
        cin >> u >> v;
        G_[u].push_back(v);
        G_[v].push_back(u);
    }

    auto dfs = [&](auto self, int now, int fa) -> int {
        vis[now] = 1;
        int cnt = 0;
        for (int i = 0; i < G_[now].size(); i ++) {
            int next = G_[now][i];
            if (!vis[next] && next != fa) {
                cnt += self(self, next, now);
            }
        }

        if (deg[now] % 2 == 1) {
            cnt ++;
        }

        return cnt;
    };

    for (int i = 1; i <= n; i ++) {
        if (!vis[i]) {
            int cnt = dfs(dfs, i, 0);
            if (cnt % 2 == 1) {
                cout << "NO" << endl;
                return;
            }
        }
    }

    cout << "YES" << endl; 

    vector<int> vis2(n + 1, 0);
    vector<pair_int> res;

    auto dfs2 = [&](auto self, int now, int fa) -> void {
        vis2[now] = 1;
        for (int i = 0; i < G_[now].size(); i ++) {
            int next = G_[now][i];
            if (!vis2[next] && next != fa) {
                self(self, next, now);
            }
        }

        if (deg[now] % 2 == 1) {
            deg[now] ^= 1;
            deg[fa] ^= 1;
            res.push_back({now, fa});
        }

    };

    for (int i = 1; i <= n; i ++) {
        if (!vis2[i]) {
            dfs2(dfs2, i, 0);
        }
    }

    cout << res.size() << endl;
    for (auto x : res) {
        cout << x.first << " " << x.second << endl;
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

- 时间复杂度：$O(N + M + K)$（遍历已建边与可选边，每个连通分量 DFS 两次）。
- 空间复杂度：$O(N + M + K)$。

预估难度：CF 1800（约 1800*）。本题难度由 AI 预估，仅作为参考。
