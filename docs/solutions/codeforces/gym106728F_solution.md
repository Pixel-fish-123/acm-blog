# gym106728F Escape Route 题解

## 题意

群岛有 $n$ 个岛和 $m$ 座双向桥。第 $i$ 座桥连接 $u_i$ 和 $v_i$，通过需要 $t_i$ 分钟，高度为 $h_i$ 厘米。

灾难发生后海平面每分钟上涨 $1$ 厘米，第 $i$ 座桥在第 $h_i$ 分钟被淹没。从时刻 $T$ 开始过第 $i$ 座桥，必须满足 $T + t_i \le h_i$。

岛 $1$ 是避难中心。对每个岛 $k$，判断它上面的居民能否从时刻 $0$ 出发安全到达岛 $1$，输出一个长度为 $n$ 的 `01` 串。

数据范围：$1 \le n \le 10^5$，$1 \le m \le 3 \times 10^5$，$u_i \ne v_i$，$1 \le t_i \le h_i \le 10^9$。

## 核心思路

**算法类型**：最短路。从岛 $1$ 反向求每个岛「最晚的出发时刻」，用以最大值为目标的 Dijkstra 求解；最晚出发时刻不小于 $0$ 的岛输出 `1`。

**第一步：定义最晚出发时刻。**

记 $L(v)$ 为在岛 $v$ 最晚什么时刻出发还能安全到达岛 $1$，$L(1) = +\infty$。桥只会越来越不能走，所以等待没有好处，居民能逃生当且仅当 $L(k) \ge 0$。

**第二步：转移。**

若从 $u$ 在时刻 $T$ 出发，经过桥 $(u, v, t, h)$ 到达 $v$，需要 $T + t \le h$；之后还要从 $v$ 继续走，所以到达时刻还需满足 $T + t \le L(v)$。于是

$$L(u) = \max_{(u, v, t, h)} \big( \min(h, L(v)) - t \big).$$

**第三步：为什么 Dijkstra 成立。**

转移函数 $g(L) = \min(h, L) - t$ 关于 $L$ 单调不减，并且 $t \ge 1$ 使得 $g(L) < L$，即沿路径走值只会变小。这和非负边权最短路的结构一样，只是把「最小」换成「最大」：用大根堆每次取出 $L$ 最大的点，它的值不会再被更新。

代码中 `dist` 就是 $L$，初值为 $-\infty$，`dist[1]` 设为 $+\infty$（`INF_LL = 4e18`，比任何 $h$ 都大，$\min(h, \infty) = h$）。出堆时用内层 `while` 跳过过期的堆元素；即使堆空了还剩一个过期元素，它也只是用当前已经确定的 `dist[x]` 再松弛一次，不会得到错误的值。

**样例验证。** 第一组：桥 $(1, 3, 2, 4)$ 和 $(2, 3, 3, 5)$。$L(3) = \min(4, \infty) - 2 = 2$，$L(2) = \min(5, 2) - 3 = -1 < 0$，输出 `101`。

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
const int MAXL = 1e5 + 5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

struct M
{
    LL v;
    LL height, time;
};

vector<M> G[MAXL];
void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    LL N, M, S = 1;

    cin >> N >> M;

    vector<LL> dist(N + 1, -INF_LL);

    for (int i = 0; i < M; i ++) {
        LL u, v;
        LL t, h;
        cin >> u >> v >> t >> h;
        G[u].push_back({v, h, t});
        G[v].push_back({u, h, t});
    }

    std::priority_queue<std::pair<LL, LL>> q;

    dist[S] = INF_LL;
    q.push({dist[S], S});

    while (q.size()) {
        LL x = q.top().second;
        LL val = q.top().first;
        q.pop();
        while (q.size() && dist[x] != val) {
            x = q.top().second;
            val = q.top().first;
            q.pop();
        }
        //if (val != dist[x]) break;

        for (int i = 0; i < G[x].size(); i ++) {
            LL y = G[x][i].v;
            LL t = G[x][i].time, h = G[x][i].height;
            LL tmp = std::min(h, dist[x]) - t;
            if (tmp > dist[y]) {
                dist[y] = tmp;
                q.push({dist[y], y});
            }
        }
    }

    for (int i = 1; i <= N; i ++) {
        if (dist[i] >= 0) cout << "1";
        else cout << "0";
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

- 时间复杂度：堆优化 Dijkstra，$O((n + m) \log m)$。
- 空间复杂度：$O(n + m)$。
