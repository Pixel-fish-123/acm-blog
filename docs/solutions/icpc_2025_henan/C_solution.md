# C 点对统计 题解

## 题意

小 X 和小 Y 各有一张无向图，点都编号为 $1 \sim n$，分别有 $m_1$、$m_2$ 条边。统计满足以下条件的点对 $[x, y]$ 个数：

- $1 \le x < y \le n$；
- 在小 X 的图中 $x, y$ 可以互相到达；
- 在小 Y 的图中 $x, y$ 可以互相到达。

数据范围：$1 \le n \le 2 \times 10^6$，$0 \le m_1, m_2 \le 2 \times 10^6$，$1 \le x_i, y_i \le n$。

## 核心思路

**算法类型**：并查集 + 排序。两张图各用一个并查集求出每个点的连通块编号 $(r_1(x), r_2(x))$；二元组相同的点两两配对，再用计数排序在线性时间内分组计数。

**第一步：化成二元组相同。**

$$x, y \text{ 在两张图中都连通} \iff r_1(x) = r_1(y) \ \text{且}\ r_2(x) = r_2(y).$$

若某个二元组出现 $c$ 次，它贡献 $\binom{c}{2}$ 对，答案是所有二元组的贡献之和。

两张图必须**各自完整地**求连通块，不能用一张图的连通性去筛另一张图的边。例如图一只有边 $1\text{-}2$，图二有边 $1\text{-}3$、$3\text{-}2$：点 $3$ 在图一中是孤立点，但在图二中 $1$ 到 $2$ 的路径必须经过它。若因为「$1, 3$ 在图一不连通」就丢掉边 $1\text{-}3$，会漏掉合法点对 $[1, 2]$。

**第二步：计数排序分组。**

`Disjoint` 的 `operator[]` 返回连通块的代表点 `top`，取值在 $1..n$ 内，可以直接当数组下标。

1. `head[u1[i]] ++` 统计图一每个连通块的大小，做前缀和后，`head[r]` 就是代表点为 $r$ 的块在数组中的结束位置。
2. 从 $n$ 到 $1$ 倒序执行 `order_[-- head[u1[i]]] = i`，把点放进各自块的区间。于是图一同一块的点在 `order_` 中连续。

**第三步：逐块计数。**

对 `order_` 中的每个图一块 $[l, r)$，用 `cnt[u2[x]]` 记录「这个图二编号在本块中已经出现几次」。每加入一个点，先 `ans += cnt[k]`，再 `cnt[k] ++`。同一组的第 $j$ 个点贡献 $j - 1$，一组 $c$ 个点合计

$$0 + 1 + \cdots + (c - 1) = \binom{c}{2}.$$

扫完一块后，只把本块用到的 `cnt` 位置清零。这样一个块的计数不会带到下一个块里（保证 $r_1$ 相同），总清零代价也只有 $O(n)$。

**样例验证。** 样例二中图一的连通块为 $\{1, 2, 3\}, \{4\}$，图二为 $\{1\}, \{2, 3, 4\}$。二元组相同的只有点 $2$ 和 $3$，答案为 $1$。

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
const LL INF_LL = 1e18;
const LL MOD1 = 998244353;
const LL MOD2 = 1e9 + 7;
const int MAXL = 2e6 + 5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

int head[MAXL], order_[MAXL], cnt[MAXL];

struct Disjoint
{
    std::vector<int> fa, siz, top;
    int cnt = 0;
    Disjoint(int n = 0) {
        init(n);
    }
    void init(int n = 0) {
        fa.resize(n + 1);
        top.resize(n + 1);
        siz.assign(n + 1, 1);
        std::iota(fa.begin(), fa.end(), 0);
        std::iota(top.begin(), top.end(), 0);
        cnt = n;
    }
    void operator()(int head, int ele) {
        head = root(head), ele = root(ele);
        if (head == ele) return;
        top[ele] = top[head];
        if (siz[head] < siz[ele]) std::swap(head, ele);
        siz[head] += siz[ele];
        fa[ele] = head;
    }
    int operator[](int index) {
        return top[root(index)];
    }
    int size(int x) {
        return siz[root(x)];
    }
    private:
        int root(int x) {
            return fa[x] = fa[x] == x ? x : root(fa[x]);
        }
};

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int n, m1, m2;
    cin >> n >> m1 >> m2;
    Disjoint u1(n), u2(n);

    for (int i = 0; i < m1; i ++) {
        int u, v;
        cin >> u >> v;
        u1(u, v);
    }

    for (int i = 0; i < m2; i ++) {
        int u, v;
        cin >> u >> v;
        u2(u, v);
    }

    for (int i = 1; i <= n; i ++) {
        head[u1[i]] ++;
    }

    for (int i = 1; i <= n; i ++) {
        head[i] += head[i - 1];
    }

    for (int i = n; i >= 1; i --) {
        int pos = -- head[u1[i]];
        order_[pos] = i; 
    }

    LL ans = 0;
    for (int l = 0, r; l < n; l = r) {
        int root = u1[order_[l]];
        r = l;
        while (r < n && u1[order_[r]] == root) {
            int k = u2[order_[r]];
            ans += cnt[k];
            cnt[k] ++;
            r ++;
        }
        for (int i = l; i < r; i ++) {
            cnt[u2[order_[i]]] = 0;
        }
    }

    cout << ans << endl;

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

- 时间复杂度：并查集按大小合并加路径压缩，处理全部边为 $O\big((n + m_1 + m_2)\,\alpha(n)\big)$；计数排序和逐块计数都是 $O(n)$。
- 空间复杂度：$O(n)$，两个并查集各 $3$ 个数组，加上 `head`、`order_`、`cnt`，共约 $9 \times 2 \times 10^6$ 个 `int`（约 72 MB），在 1024 MB 限制内。
- 数值范围：答案最大为 $\binom{2 \times 10^6}{2} \approx 2 \times 10^{12}$，需要 `long long`。
- 递归版 `root` 的深度：按大小合并保证树高不超过 $\log_2 n \approx 21$，不会爆栈。
