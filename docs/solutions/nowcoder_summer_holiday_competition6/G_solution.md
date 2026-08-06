# G 题解

## 题意

给定一个简单连通无向图 $G$，有 $n$ 个顶点、$m$ 条边，其中 $k$ 个顶点是特殊顶点。保证所有顶点度数不超过 $3$。

Alice 从某个非特殊顶点 $s$ 出发，Alice 先手，双方轮流行动：

- **Alice 回合**：若她当前位于特殊顶点，游戏结束，Alice 获胜；否则她必须沿一条剩余边移动到相邻顶点。若当前顶点没有剩余边可走，游戏结束，Bob 获胜。
- **Bob 回合**：Bob 删除任意一条剩余边（没有剩余边则什么都不做）。

双方都采取最优策略，Alice 的位置双方都已知。称一个顶点 $u$ 是**必胜顶点**，当且仅当 $u$ 不是特殊顶点，且 Alice 初始站在 $u$ 时必胜。求所有必胜顶点。

数据范围：$1 \le k < n \le 2\cdot 10^5$，$n-1 \le m \le \min(3n/2, 2\cdot 10^5)$，多组数据，$\sum n, \sum m \le 2 \cdot 10^5$。

## 核心思路

**算法类型**：图论博弈 + 多源 BFS 标记传播。

**关键观察 1（终点）**：Alice 一旦移动到一个特殊顶点，Bob 删边无法改变这一事实，Alice 在自己的下一回合开始时站在特殊顶点即获胜。因此特殊顶点是"已验证"的终点。

**关键观察 2（双出路必胜）**：游戏节奏是"Alice 走一步、Bob 删一条边"。考虑 Alice 站在顶点 $v$ 的情形：若 $v$ 邻接两个**已验证**顶点，则 Bob 一回合只能删一条边，无法同时切断 $v$ 的两条出路，Alice 必能沿另一条走。递归定义：特殊顶点是已验证的；邻接至少两个已验证顶点的顶点也是已验证的。沿已验证顶点走下去，"验证等级"严格下降，最终必然到达特殊顶点获胜。

**关键观察 3（单出路必败）**：若从起点出发的所有顶点都至多邻接一个已验证顶点，Bob 采用如下必胜策略：每当 Alice 到达顶点 $w$，若 $w$ 恰好邻接唯一一条通往已验证顶点的边 $w-x$，Bob 立即删掉 $w-x$。这样 Alice 永远无法进入已验证区域，只能在普通顶点间游荡，而 Bob 不断删边，最终 Alice 被孤立到无路可走而输。

**结论**：必胜顶点 = 非特殊顶点且**邻接至少一个已验证顶点**的顶点。

**传播算法**：用标记 $spc[u]$ 刻画"被已验证顶点邻接的次数"：

1. 特殊顶点赋标记 $10$（本身是已验证源，不计入答案）。
2. 每个特殊顶点向其所有非特殊邻居传播一个标记（$spc[next]++$）。
3. 任何累计标记达到 $2$ 的顶点（即邻接两个已验证顶点）本身成为新的已验证源，继续向其非特殊邻居传播标记；用队列 BFS 逐层扩散，每个顶点只会入队一次。
4. 最终所有满足 $1 \le spc[u] \le 9$ 的顶点即为必胜顶点。

**为什么标记达到 $2$ 才作为源传播**：收到 $1$ 个标记只说明"有一条路可走"，Bob 可以删掉这唯一的路，故该点不能作为新的源；收到 $2$ 个标记说明有两条独立出路，Bob 一回合删不完，该点本身是"已验证"的。度数不超过 $3$ 保证每个顶点最多收到 $3$ 个标记，传播过程线性收敛。

**实现细节**（对应代码）：先对所有特殊顶点做一轮初始传播，邻居标记变为 $2$ 时入队；BFS 中出队顶点对其非特殊邻居同样传播，标记变为 $2$ 时入队；传播时跳过特殊顶点（$spc \ge 10$），防止特殊顶点被改写。最后收集标记在 $[1, 9]$ 的顶点输出。

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
const LL INF_LL = 1e18;
const LL mod = 998244353;
const int MAXL = 1e5 + 5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

int N, M, K;
vector<int> G[MAXL];
void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    
    cin >> N >> M >> K;

    vector<int> spc(N + 1, 0); //  3 2 1

    for (int i = 0; i <= N; i ++) {
        G[i].clear();
    }

    for (int i = 0; i < M; i ++) {
        int u, v;
        cin >> u >> v;
        G[u].push_back(v);
        G[v].push_back(u);
    }

    vector<int> op;
    std::queue<int> q;

    for (int i = 0; i < K; i ++) {
        int x;
        cin >> x;
        spc[x] = 10;
        op.push_back(x);
    }

    for (auto &x : op) {
        for (int next : G[x]) {
            if (spc[next] >= 10) continue;  
            spc[next] ++;
            if (spc[next] == 2) q.push(next);
        }
    }

    while (q.size()) {
        int now = q.front();
        q.pop();
        for (int next : G[now]) {
            if (spc[next] >= 10) continue;
            spc[next] ++;
            if (spc[next] == 2) q.push(next);
        }
    }

    vector<int> res;
    for (int i = 1; i <= N; i ++) {
        if (spc[i] >= 1 && spc[i] < 10) res.push_back(i);
    }

    cout << res.size() << endl;

    for (auto &x : res) {
        cout << x << " ";
    }

    cout << endl;
    
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

## 复杂度

- **时间复杂度**：初始传播遍历所有特殊顶点的邻边，总量 $O(m)$；BFS 中每个顶点至多入队一次、每条边被访问常数次，为 $O(n + m)$。多组数据下 $\sum (n + m) \le 4 \cdot 10^5$，总复杂度 $O(\sum n + \sum m)$。
- **空间复杂度**：邻接表 $O(n + m)$，标记数组 $O(n)$。
