# gym101915G Robots 题解

## 题意
给一棵 $n$ 个点的树，根为 $1$，边权两两不同。有 $q$ 个机器人，第 $i$ 个带参数 $x_i$，从根出发，每一步在当前点到儿子的所有边中，选**权值小于 $x_i$ 的最大那条**走下去，没有这样的边就停下。求所有机器人终止节点编号之和。多组数据，$1 \le n, q \le 10^5$，$1 \le w_i, x_i \le 10^9$。

## 核心思路
**算法类型**：DFS + 树上问题，配合排序与双指针离线回答询问。

关键观察：**能到达某个节点的 $x$ 构成一个连续区间**，且所有节点的「停在这里」的 $x$ 区间恰好把 $[1, +\infty)$ 划分开。

在节点 $u$ 处，设能到达 $u$ 的 $x$ 区间为 $[L, R]$，儿子边按权值从大到小为 $w_1 > w_2 > \dots > w_k$：

- $x \in [w_1 + 1, +\infty)$ 走 $w_1$ 那条边（$w_1 < x$ 且它最大）；
- $x \in [w_2 + 1, w_1]$ 时 $w_1$ 不满足，$w_2$ 满足，走 $w_2$；
- 依此类推，$x \in [w_j + 1, w_{j-1}]$ 走第 $j$ 条边；
- $x \in [1, w_k]$ 时没有边比 $x$ 小，机器人停在 $u$。

每段再与 $[L, R]$ 取交，就是能到达对应儿子（或停在 $u$）的 $x$ 区间。代码里 `lim = val + 1` 是当前段左端点，`r = l - 1` 把上一段左端点减一作为当前段右端点，`segment[pos]` 存儿子的可达区间；处理完儿子后，`[1, l - 1]` 与 `u` 自己的可达区间取交，覆盖成「停在 $u$」的区间。叶子没有儿子，`l` 保持 `INF`，于是整个可达区间都是停留区间。

正确性：每个节点的可达区间被其儿子的可达区间和自身停留区间不重不漏地划分，从根的 $[1, \text{INF}]$ 递归下去，所有非空的停留区间恰好划分 $[1, \text{INF}]$，每个 $x$ 唯一对应一个终点。

于是把非空停留区间按左端点排序，询问也排序，用一个单调指针 `head` 扫过去：当前 $x$ 大于区间右端点就右移，否则这个区间的节点就是终点，累加编号即可。因为区间互不相交且覆盖全部 $x$，指针不会越界。答案最多 $10^5 \times 10^5$，用 `long long`。

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
vector<pair_int> G[MAXL];
pair_int segment[MAXL];

struct Line
{
    int l, r, pos;
    bool operator < (const Line &a) const {
        return l < a.l;
    }
};

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);

    int n, q;
    cin >> n >> q;

    for (int i = 1; i <= n; i ++) {
        G[i].clear();
        segment[i] = {0, 0};
    }

    for (int i = 0; i < n - 1; i ++) {
        int u, v, val;
        cin >> u >> v >> val;
        G[u].push_back({v, val});
        G[v].push_back({u, val});
    }

    auto dfs = [&](auto self, int now, int fa, int l1, int r1) -> void {
        vector<pair_int> s;
        for (auto x : G[now]) {
            int next = x.first;
            int val = x.second;
            if (next == fa) continue;
            s.push_back({val, next});
        }

        std::sort(s.begin(), s.end(), [&](pair_int a, pair_int b){
            return a.first > b.first;   
        });

        int l = INF_INT, r = INF_INT;
        for (auto x : s) {
            int pos = x.second;
            int lim = x.first + 1;
            r = l - 1;
            l = lim;

            l = std::max(l, l1);
            r = std::min(r, r1);

            segment[pos].first = l;
            segment[pos].second = r;
        }

        r = l - 1;
        l = 1;

        segment[now].first = std::max(segment[now].first, l);
        segment[now].second = std::min(segment[now].second, r);

        for (auto x : G[now]) {
            int next = x.first;
            int val = x.second;
            if (next == fa) continue;
            self(self, next, now, segment[next].first, segment[next].second);
        }
    };

    segment[1].first = 1;
    segment[1].second = INF_INT;
    dfs(dfs, 1, 0, 1, INF_INT);

    vector<Line> res;
    for (int i = 1; i <= n; i ++) {
        if (segment[i].first <= segment[i].second) {
            res.push_back({segment[i].first, segment[i].second, i});
        }
    }

    std::sort(res.begin(), res.end());

    vector<int> query;
    for (int i = 0; i < q; i ++) {
        int x;
        cin >> x;
        query.push_back(x);
    }

    std::sort(query.begin(), query.end());

    int head = 0;
    int l, r, u;
    LL ans = 0;

    for (int i = 0; i < query.size(); i ++) {
        u = query[i];
        l = res[head].l, r = res[head].r;

        while (u > r) {
            head ++;
            l = res[head].l, r = res[head].r;
        }

        //cout << head << " " << u << " : " << l << " - " << r << " ---> " << res[head].pos <<endl;
        ans += res[head].pos;
    }

    cout << ans << endl;

/*
1 3 1
4 4 2
5 7 3
8 9 5
10 1061109566 4
*/
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
每个节点对儿子排序，总计 $O(n \log n)$；区间排序 $O(n \log n)$，询问排序 $O(q \log q)$，双指针扫描 $O(n + q)$。总时间 $O((n + q)\log(n + q))$，空间 $O(n + q)$。

预估难度：CF 2100（约 2100*）。本题难度由 AI 预估，仅作为参考。
