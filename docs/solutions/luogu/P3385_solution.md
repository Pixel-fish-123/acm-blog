# P3385 【模板】负环 题解

## 题意

给定一个 $n$ 个点的有向图（$1\le n\le 2\times 10^3$，$1\le m\le 3\times 10^3$，$1\le T\le 10$ 组数据），判断图中是否存在**从顶点 $1$ 出发能到达**的负环（边权之和为负数的回路）。每行边信息 $u,v,w$：$w\ge 0$ 时同时存在 $u\to v$ 与 $v\to u$ 两条权为 $w$ 的边；$w<0$ 时只存在 $u\to v$ 一条边。注意 $m$ **不是**图的边数。

## 核心思路

**算法类型**：SPFA + 入队次数计数判负环。

**建图**：按题意逐行加边——$w\ge 0$ 加双向两条边，$w<0$ 只加 $u\to v$ 的单向边。

**判定原理**：从源点 $1$ 出发跑 SPFA（队列优化的 Bellman-Ford）。额外维护 `cnt[x]` 表示点 $x$ 被压入队列的次数：

- **无负环时**：最短路边数不超过 $n-1$，每个点的最短路最多被松弛 $O(n)$ 次，入队次数有界；
- **存在从 $1$ 可达的负环时**：沿着负环每绕一圈，环上点的 `dist` 都会继续变小、无限次触发松弛，环上点会不断重新入队。

因此一旦某点入队次数超过 $n$（`cnt[next] > N`），即可断定存在从 $1$ 出发可达的负环，立即返回；SPFA 自然结束则说明无负环。由于松弛只发生在从 $1$ 可达的点上，判定范围恰好就是"从顶点 $1$ 出发能到达"的负环，与题意一致。

存在输出 `YES`，否则输出 `NO`。

::: details 点击展开参考代码

## 参考代码

```cpp
#include<math.h>
#include<iostream>
#include<cstring>
#include<stdio.h>
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
const LL MAXL = 3e3 + 5;
using std::cin;
using std::cout;
using std::endl;
struct edge{
    int u, v;
};
void add(int x, int y, int w, std::vector<edge> e[])
{
    edge next_ = {y, w};
    e[x].push_back(next_);
    return;
}
bool spfa(std::vector<edge> e[], int N)
{
    std::queue<int> q;
    std::vector<int> dist(N + 2, INF_INT);
    std::vector<int> cnt(N + 2, 0);
    std::vector<bool> v(N + 2, false);
    dist[1] = 0, v[1] = 1;
    //cnt[1] ++;
    q.push(1);
    while (!q.empty()) {
        int now = q.front();
        //cout << "now:" << now << endl;
        q.pop();
        v[now] = 0;
        for(int i = 0; i < e[now].size(); i ++) {
            int next_ = e[now][i].u, val = e[now][i].v;
            //cout << now << "--- >" << next_ << " " << cnt[now] << " " << cnt[next_] << endl;
            if(dist[next_] > dist[now] + val) {
                dist[next_] = dist[now] + val;
                if (!v[next_]) {
                    v[next_] = 1;
                    q.push(next_);
                    cnt[next_] ++;
                    if(cnt[next_] > N) return 1;
                }
            }
        }
    }
    return 0;
}
void solve() 
{
    int N, M;
    cin >> N >> M;
    std::vector<edge> e[N + 2];
    for(int i = 0; i < M; i ++) {
        int x, y, w;
        cin >> x >> y >> w;
        add(x, y, w, e);
        if(w >= 0) add(y, x, w, e);
    }
    if(spfa(e, N)) cout << "YES" << endl;
    else cout << "NO" << endl;
    return;
}
int main() 
{
    /*std::ios::sync_with_stdio(false); cin.tie(nullptr); cout.tie(nullptr);
    freopen("test.in", "r", stdin);
    freopen("output.out", "w", stdout);*/
    int _ = 1;
    cin >> _;
    for (int i = 0; i < _; i++) {
        solve();
    }
    return 0;
}
```


:::

## 复杂度

- 时间复杂度：单组数据最坏 $O(nm)$（SPFA 上界，本题规模 $n\le 2\times 10^3$、$m\le 3\times 10^3$ 完全可过）；负环被检出时往往远早于上界就会触发。
- 空间复杂度：$O(n+m)$。
