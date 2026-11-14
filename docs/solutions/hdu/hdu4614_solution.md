# hdu4614 Vases and Flowers 题解

## 题意
有 $n$ 个花瓶，编号为 $0 \sim n - 1$，初始时所有花瓶都是空的，每个花瓶最多只能插 $1$ 朵花。给定 $m$ 次操作（$1 \le n, m \le 50000$），操作分为两种：
1. `1 A F`：从编号 $A$ 的花瓶开始，依次往后遍历到 $n - 1$，遇到空花瓶就插上 $1$ 朵花，直到插完 $F$ 朵花或者走到最后一个花瓶为止（剩余没插完的花直接丢弃）。输出本次插花的第一朵和最后一朵花所在的花瓶编号；若一朵花都插不进去，输出 `Can not put any one.`。
2. `2 A B`：清空编号在 $[A, B]$ 区间内的所有花瓶，并输出本次被清理掉的花朵总数。

每组测试数据输出结束后需要额外输出一个空行。

## 核心思路
**算法类型**：线段树 + 二分（区间赋值求和线段树 + 二分查找第 $k$ 个空位）。

将编号 $0 \sim n - 1$ 平移为 $1 \sim n$，用 `0` 表示空花瓶、`1` 表示有花的花瓶。我们需要维护一个支持**区间求和**与**区间赋值（全置 $0$ 或全置 $1$）**的线段树：
- **对于操作 $2$（清空区间 $[l, r]$）**：
  先在线段树上查询区间 $[l, r]$ 的和（即区间内原有的花朵数），再将该区间整体赋值为 $0$。
- **对于操作 $1$（从 $\textit{from}$ 开始插 $\textit{cnt}$ 朵花）**：
  1. 先查询后缀 $[\textit{from}, n]$ 内的空花瓶总数 $\textit{zero} = (n - \textit{from} + 1) - \text{query}(\textit{from}, n)$。
  2. 若 $\textit{zero} = 0$，说明从 $\textit{from}$ 到末尾全满，一朵也插不进去，直接输出 `Can not put any one.`。
  3. 若 $\textit{zero} > 0$，实际能插进的花朵数为 $c = \min(\textit{zero}, \textit{cnt})$。由于前缀空花瓶数量随右端点单调不减，可以封装一个函数 `findZero(from, k)`，在 $[\textit{from}, n]$ 上**二分**最小的下标 $\textit{mid}$，使得区间 $[\textit{from}, \textit{mid}]$ 内的空花瓶数量 $( \textit{mid} - \textit{from} + 1 - \text{query}(\textit{from}, \textit{mid}) ) \ge k$：
     - 第一朵花的位置就是 `st = findZero(from, 1)`；
     - 最后一朵花的位置就是 `ed = findZero(from, min(zero, cnt))`。
  4. 找到 `[st, ed]` 后，区间 `[st, ed]` 内的所有空花瓶都会被插满（原本有花的依然有花），因此直接在线段树上将区间 `[st, ed]` 整体赋值为 $1$，并输出平移回 $0$-based 的 `st - 1` 和 `ed - 1`。

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
// const int INF_INT = INT_MAX - 5;
// const LL INF_LL = LONG_LONG_MAX - 5;
const LL MOD1 = 998244353;
const LL MOD2 = 1e9 + 7;
const int MAXL = 50005;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉


int sum[MAXL << 2];
int change[MAXL << 2];
bool has_update[MAXL << 2];

int n;

void up(int i) {
    sum[i] = sum[i << 1] + sum[i << 1 | 1];
}

void lazy(int i, int v,int len) {
    sum[i] = v * len;
    change[i] = v;
    has_update[i] = true;
}

void down(int i, int ln, int rn) {
    if (has_update[i]) {
        lazy(i << 1, change[i], ln);
        lazy(i << 1 | 1, change[i], rn);
        has_update[i] = false;
    }
}

void build(int l, int r, int i) {
    if (l < r) {
        int mid = (l + r) >> 1;
        build(l, mid, i << 1);
        build(mid + 1, r, i << 1 | 1);
    }
    sum[i] = 0;
    has_update[i] = false;
}

void update(int jobl, int jobr, int jobv, int l, int r, int i) {
    if (jobl <= l && r <= jobr) {
        lazy(i, jobv, r - l + 1);
    }
    else {
        int mid = (l + r) >> 1;
        down(i, mid - l + 1, r - mid);
        if (jobl <= mid) {
            update(jobl, jobr, jobv, l, mid, i << 1);
        }
        if (jobr > mid) {
            update(jobl, jobr, jobv, mid + 1, r, i << 1 | 1);
        }
        up(i);
    }
}

int query(int jobl, int jobr, int l, int r, int i) {
    if (jobl <= l && r <= jobr) {
        return sum[i];
    }
    int mid = (l + r) >> 1;
    down(i, mid - l + 1, r - mid);
    int ans = 0;
    if (jobl <= mid) {
        ans += query(jobl, jobr, l, mid, i << 1);
    }
    if (jobr > mid) {
        ans += query(jobl, jobr, mid + 1, r, i << 1 | 1);
    }
    return ans;
}

int findZero(int s, int k) {
    int l = s, r = n;
    int ans = 0;
    while (l <= r) {
        int mid = (l + r) >> 1;
        if (mid - s + 1 - query(s, mid, 1, n, 1) >= k) {
            ans = mid;
            r = mid - 1;
        } else {
            l = mid + 1;
        }
    }
    return ans;
}

pair_int insertFlowers(int from, int cnt) {
    from ++;
    int st, ed;
    int zero = n - from + 1 - query(from, n, 1, n, 1);
    if (zero == 0) {
        st = 0;
        ed = 0;
    }
    else {
        st = findZero(from, 1);
        ed = findZero(from, std::min(zero, cnt));
        update(st, ed, 1, 1, n, 1);
    }
    st --;
    ed --;
    return {st, ed};
}

int clearVases(int l, int r) {
    l ++;
    r ++;
    int ans = query(l, r, 1, n, 1);
    update(l, r, 0, 1, n, 1);
    return ans;
}

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int m;
    cin >> n >> m;
    build(1, n, 1);
    for (int i = 0; i < m; i ++) {
        int op;
        cin >> op;

        if (op == 1) {
            int st, cnt;
            cin >> st >> cnt;
            pair_int tmp = insertFlowers(st, cnt);
            int &l = tmp.first, &r = tmp.second;
            if (l == -1) {
                cout << "Can not put any one." << endl;
            }
            else {
                cout << l << " " << r << endl;
            }
        }
        else {
            int l, r;
            cin >> l >> r;
            cout << clearVases(l, r) << endl;
        }
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


:::

## 复杂度
- 时间复杂度：每组数据建树 $O(n)$；每次操作 $2$ 为一次区间查询与一次区间修改，耗时 $O(\log n)$；每次操作 $1$ 在二分过程中调用线段树查询，耗时 $O(\log^2 n)$。单组数据总时间复杂度为 $O(n + m \log^2 n)$。
- 空间复杂度：$O(n)$，用于存储 $4$ 倍大小的线段树数组。

预估难度：CF 1600（约 1600*）。本题难度由 AI 预估，仅作为参考。
