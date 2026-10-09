# gym101047D Random walks in Thailand 题解

## 题意

有 $N$ 个岛，编号 $1$ 到 $N$，岛之间有 $M$ 条无向船线，第 $i$ 条连接 $A_i$ 与 $B_i$，花费 $C_i$。每一步有两种走法：

- 坐船：沿一条船线走到相邻的岛，花费为该船线的价格；
- 坐飞机：花费 $K$，飞机会把人等概率地扔到 $N$ 个岛中的任意一个（包括出发的岛）。

求从岛 $1$ 到岛 $N$ 的最小期望花费，误差不超过 $10^{-4}$。共 $T$ 组数据。

数据范围：$1 \le T \le 20$，$1 \le N, M \le 10^5$，$1 \le C \le 10^3$，$1 \le K \le 10^3$。图不保证连通。

## 核心思路

**算法类型**：最短路 + 概率期望 + 排序。从 $N$ 反向跑 Dijkstra 得到每个岛只坐船到 $N$ 的最短距离 $d_i$，把「坐飞机的期望花费」写成一个关于自身的方程，排序后枚举「哪些岛坐船、哪些岛飞」的分界点求解。

**第一步：每个岛只有两种选择。**

设 $E_i$ 为从岛 $i$ 出发、按最优策略到 $N$ 的期望花费，$E_N = 0$。坐飞机的花费和落点都与起点无关，所以从任何岛起飞的期望花费都是同一个值

$$
F = K + \frac{1}{N}\sum_{j=1}^{N} E_j
$$

既然从哪起飞都一样，「先坐几段船再飞」不会比「直接飞」更好。于是每个岛要么一路坐船到 $N$，要么立刻飞：

$$
E_i = \min(d_i,\ F)
$$

其中 $d_i$ 是岛 $i$ 只坐船到 $N$ 的最短距离；坐船到不了 $N$ 的岛 $d_i = +\infty$，只能飞。答案为 $E_1 = \min(d_1, F)$。

**第二步：飞行期望是一个关于自身的方程。**

代入得

$$
F = K + \frac{1}{N}\sum_{j=1}^{N}\min(d_j,\ F)
$$

注意求和里是 $\min(d_j, F)$ 而不是 $d_j$：落地之后，人仍可以按最优策略继续走，包括再飞一次。只用 $K + \frac{1}{N}\sum d_j$ 相当于规定落地后只能坐船，会算大。

**第三步：排序后枚举分界点。**

把坐船能到达 $N$ 的岛的 $d$ 从小到大排序为 $d_{(1)} \le d_{(2)} \le \cdots \le d_{(cnt)}$，其中 $d_{(1)} = 0$ 就是岛 $N$ 自己。离 $N$ 越近越该坐船，所以最优策略一定形如「最近的 $p$ 个岛坐船，其余岛都飞」。固定 $p$ 后方程里的 $\min$ 都已确定：

$$
F = K + \frac{1}{N}\left(\sum_{t=1}^{p} d_{(t)} + (N - p)F\right)
$$

这 $p$ 个坐船的岛包含岛 $N$（贡献 $d_{(1)} = 0$），其余 $N - p$ 个岛（含坐船到不了 $N$ 的岛）各贡献 $F$。分母是 $N$，因为飞机在全部 $N$ 个岛中等概率落地，终点 $N$ 也在内。移项得

$$
F_p = \frac{NK + \sum_{t=1}^{p} d_{(t)}}{p}
$$

$F_p$ 是执行这一策略时的飞行期望，取所有策略中最好的一个：

$$
F = \min_{1 \le p \le cnt} F_p
$$

用前缀和可以 $O(1)$ 算出每个 $F_p$。

**第四步：样例验证。**

第一组：$N = 3$，$K = 1$，排序后 $d = 0, 5, 15$，$NK = 3$。

- $p = 1$：$F_1 = \frac{3 + 0}{1} = 3$；
- $p = 2$：$F_2 = \frac{3 + 0 + 5}{2} = 4$；
- $p = 3$：$F_3 = \frac{3 + 0 + 5 + 15}{3} = \frac{23}{3}$。

$F = 3$，答案 $\min(d_1, F) = \min(15, 3) = 3$。

第二组：$K = 100$，$NK = 300$，$F = \min(300, 152.5, 106.67) \approx 106.67$，答案 $\min(15, 106.67) = 15$。

**代码实现细节。**

- Dijkstra 用大根堆存 $(-dist, x)$ 模拟小根堆，`vis` 保证每个点只扩展一次；
- 只把 $dist < $ `INF_LL` 的岛放进数组 `dis`，坐船到不了 $N$ 的岛不参与枚举，也避免 `INF_LL` 相加溢出；
- `dis` 开头先放一个 $0$ 作为前缀和的哨兵，排序后两个 $0$ 都在最前面，不影响结果；
- `res` 初值为 `dist[1]`，即直接坐船的花费；岛 $1$ 坐船到不了 $N$ 时它是 `INF_LL`，会被某个 $F_p$ 取代；
- $NK \le 10^8$，前缀和不超过 $10^5 \times 10^8$，用 `long long` 不会溢出。

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

vector<pair_LL> G[MAXL];

void solve()
{
    std::cout << std::fixed << std::setprecision(10);
    // std::cout.unsetf(std::ios::fixed);
    LL n, m, k;
    cin >> n >> m >> k;

    for (int i = 1; i <= n; i ++) {
        G[i].clear();
    }

    for (int i = 0; i < m; i ++) {
        LL u, v, c;
        cin >> u >> v >> c;
        G[u].push_back({v, c});
        G[v].push_back({u, c});
    }

    vector<LL> dist(n + 1, INF_LL);
    vector<LL> vis(n + 1, 0);

    std::priority_queue<pair_LL> q;

    dist[n] = 0;
    q.push({0, n});

    while (q.size()) {
        LL x = q.top().second;
        q.pop();
        if (vis[x]) continue;
        vis[x] = 1;

        for (int i = 0; i < G[x].size(); i ++) {
            LL next = G[x][i].first;
            LL next_val = G[x][i].second;

            if (dist[next] > dist[x] + next_val) {
                dist[next] = dist[x] + next_val;
                q.push({-dist[next], next});
            }
        }
    }

    vector<LL> dis;

    dis.push_back(0);

    for (int i = 1; i <= n; i ++) {
        if (dist[i] < INF_LL) {
            dis.push_back(dist[i]);
        }
    }

    std::sort(dis.begin(), dis.end());

    int cnt = dis.size() - 1;

    for (int i = 1; i <= cnt; i ++) {
        dis[i] += dis[i - 1];
    }

    double res = (double)dist[1];

    for (int p = 1; p <= cnt; p ++) {
        double now = (n * k + dis[p]) * 1.0 / p;
        res = std::min(res, now);
    }

    cout << res << endl;

    return;
}

int main()
{
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cout.tie(nullptr);
    int _ = 1;
    cin >> _;
    for (int i = 0; i < _; i ++)
    {
        solve();
    }
    return 0;
}
```


:::

## 复杂度

- 时间复杂度：每组数据 Dijkstra 为 $O((N + M)\log M)$，排序为 $O(N \log N)$，枚举分界点为 $O(N)$，总计 $O(T(N + M)\log M)$。
- 空间复杂度：$O(N + M)$。
