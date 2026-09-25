---
tags: [最小生成树, DFS]
source: "https://codeforces.com/gym/104518/problem/F"
---
# gym104518F Vacation 题解

## 题意

有 $N$ 个城市（编号 $1 \sim N$，$1$ 号是家乡）和 $M$ 条**无向**道路，第 $i$ 条连接 $a_i, b_i$，花费为 $c_i$，保证图连通。需要给出一份旅行计划：从 $1$ 号城市出发、最终回到 $1$ 号，并且每个城市至少访问一次（可以重复经过某些城市）。

本题不要求计划最优，只要总花费不超过最优计划的 $2$ 倍即可。输出格式为：

- 第一行：你的计划总花费；
- 第二行：访问序列长度 $K$（要求 $K \le 2 \times 10^6$）；
- 第三行：$K$ 个城市编号 $p_1, \dots, p_K$，满足 $p_1 = p_K = 1$，且对每个 $1 \le i < K$ 都存在连接 $p_i$ 与 $p_{i+1}$ 的道路。

数据范围：$1 \le N \le 3 \times 10^5$，$1 \le M \le 5 \times 10^5$，$a_i \ne b_i$，$1 \le c_i \le 10^{12}$。

## 核心思路

**第一步：最优解的下界是最小生成树。** 任何合法计划都是一条从 $1$ 出发、回到 $1$ 的闭合游走，它经过了所有顶点，所以它经过的那些边构成一张连通的生成子图。游走的总花费等于各条边花费乘以经过次数之和，它不小于所用到的**不同边**的花费之和，而后者不小于最小生成树的权值 $W$。因此
$$W \le \text{OPT}.$$

**第二步：$2W$ 一定满足"不超过最优解 $2$ 倍"。** 把最小生成树的每条边正、反各走一次，就得到一条经过所有顶点的闭合游走，其花费恰好为 $2W \le 2\,\text{OPT}$。因此不需要求真正的最优游走：任取一棵最小生成树，输出它的欧拉环游即可。

**第三步：Kruskal 求最小生成树。** 把所有边按权值升序排序，用并查集依次尝试加入，若两端点不在同一连通块则选中该边；图保证连通，最终恰好选出 $N-1$ 条边，权值和为 $W$，输出的计划花费为 $2W$。

**第四步：输出欧拉环游。** 把选出的 $N-1$ 条树边建成邻接表，从 $1$ 号点开始 DFS：进入一个点时先输出它，递归完一棵子树后再输出一次它。这样每条树边在序列中恰好出现两次，序列长度为 $1 + 2(N-1) = 2N - 1 \le 6 \times 10^5 - 1 < 2 \times 10^6$，首尾都是 $1$，且相邻两项之间必定是树边。

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
const int MAXL = 3e5 + 5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

struct edge {
    LL x, y;
    LL val;
};

vector<pair_LL> G[MAXL];
vector<edge> mp;
LL fa[MAXL];

void add(LL x, LL y, LL val) {
    G[x].push_back({y, val});
    G[y].push_back({x, val});
}

LL get(LL x) {
    //cout << x << " " << fa[x] << endl;
    if (x == fa[x]) return x;
    return fa[x] = get(fa[x]);
}

void merge(LL x, LL y) {
    x = get(x), y = get(y);
    fa[x] = y;
}

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    LL n, m;
    cin >> n >> m;

    for (LL i = 1; i <= n; i ++) {
        fa[i] = i;
    }

    for (LL i = 0; i < m; i ++) {
        LL x, y;
        LL val;
        cin >> x >> y >> val;
        mp.push_back({x, y, val});
    }

    std::sort(mp.begin(), mp.end(), [&](edge a, edge b){
        return a.val < b.val;
    });

    LL res = 0;
    LL k = 1;

    for (LL i = 0 ; i < m; i ++) {
        LL x = mp[i].x, y = mp[i].y;
        LL val = mp[i].val;
        LL rot_x = get(x), rot_y = get(y);
        if (rot_x != rot_y) {
            add((LL)x, (LL)y, val);
            res += (val * 2);
            k += 2;
            merge(x, y);
        }
    }

    cout << res << endl;
    cout << k << endl;

    auto dfs = [&](auto self, LL now, LL fa) -> void {
        cout << now << " ";
        for (LL j = 0; j < G[now].size(); j ++) {
            LL next = G[now][j].first;
            if (next != fa) {
                self(self, next, now);
                cout << now << " ";
            }
        }
    };

    dfs(dfs, 1, 0);

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

## 复杂度

- 时间复杂度：边排序 $O(M \log M)$；Kruskal 的并查集部分近似 $O(M\,\alpha(N))$；DFS 输出 $O(N)$。
- 空间复杂度：$O(N + M)$（邻接表、边表与并查集）。
