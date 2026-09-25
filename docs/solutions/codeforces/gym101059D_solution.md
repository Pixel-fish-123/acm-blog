---
tags: [分块, 数论]
source: "https://codeforces.com/gym/101059/problem/D"
---
# gym101059D Impressive Queries 题解

## 题意

给定两个长度为 $N$ 的数组 $A$ 和 $B$。有 $Q$ 个询问，每个询问给出 $i, j, k$，要求输出多重集
$$S(i,j,k) = \{\, A_p \cdot B_q \;\mid\; i \le p,\, q \le j,\ A_p \cdot B_q \le k \,\}$$
的大小（按重数计，即满足 $i \le p \le j$、$i \le q \le j$ 且 $A_p \cdot B_q \le k$ 的有序下标对 $(p, q)$ 的个数）。

数据范围：$1 \le N, Q \le 10^5$，$1 \le A_i, B_i \le 10^9$，$1 \le i \le j \le N$，$1 \le k \le 10^5$。

## 核心思路

**第一步：把询问写成计数问题。** 一次询问要求的是满足 $i \le p \le j$、$i \le q \le j$ 且 $A_p B_q \le k$ 的有序下标对 $(p, q)$ 的个数。直接枚举所有下标对是 $O(N^2)$ 的，需要分别处理"区间"和"乘积"两个限制：区间限制用莫队维护，乘积限制用整除分块统计。

**第二步：乘积限制用整除分块。** 若已知当前区间内每个值出现的次数 $\mathrm{cnt}_A(\cdot), \mathrm{cnt}_B(\cdot)$，那么
$$\text{ans} = \sum_{a} \mathrm{cnt}_A(a) \cdot \mathrm{cnt}_B\!\left(\le \left\lfloor \frac{k}{a} \right\rfloor\right).$$
把 $a$ 按 $v = \lfloor k/a \rfloor$ 的取值分段：对每一段 $[L, R]$，其中 $R = \left\lfloor k / v \right\rfloor$，段内所有 $a$ 都给出同一个 $v$，于是
$$\text{ans} = \sum_{\text{段 } [L, R]} \mathrm{cnt}_A([L, R]) \cdot \mathrm{cnt}_B(\le v).$$
段数只有 $O(\sqrt{k})$：$a \le \sqrt{k}$ 时这样的 $a$ 至多 $\sqrt{k}$ 个，而 $a > \sqrt{k}$ 时 $v = \lfloor k/a \rfloor < \sqrt{k}$，$v$ 也至多有 $\sqrt{k}$ 种取值，两者合计给出 $O(\sqrt{k})$ 段。

**第三步：值域压缩到 $10^5$。** 因为 $k \le 10^5$，若某个 $a > 10^5$，则对任意 $b \ge 1$ 都有 $a b > 10^5 \ge k$，它在任何询问中都不会被统计到；$B$ 中大于 $10^5$ 的值同理。于是只需把值域开到 $[1, 10^5]$，加点、删点时遇到更大的值直接忽略。

**第四步：区间限制用莫队。** 用莫队维护当前下标区间 $[\text{now\_l}, \text{now\_r}]$：把询问按左端点所在块为第一关键字、右端点为第二关键字排序（块号奇偶性决定右端点升序或降序，即"奇偶排序"优化），然后按左右端点的移动逐步加入/删除元素。加入或删除一个元素时，在两棵以值域为下标的树状数组上做单点 $\pm 1$：一棵维护区间内 $A$ 值的出现次数，另一棵维护 $B$ 值的出现次数。块长取 $\sqrt{N}$。

**第五步：回答询问。** 到达某个询问的区间后，按第二步的整除分块累加：段内 $A$ 的个数用第一棵树状数组的区间和，$B$ 中不超过 $v$ 的个数用第二棵树状数组的前缀和，两者相乘累加即得答案。

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
const int MAXL = 1e5 + 10;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

struct P
{
    int l, r, k, p;
};

struct BIT
{
    int n;
    vector<LL> a;

    BIT(int _n) : n(_n) {
        a.resize(n + 2, 0);
    }

    void add(int p, LL v) {
        for (int i = p; i <= n; i += i & -i) {
            a[i] += v;
        }
    }

    LL qry(int p) const {
        LL res = 0;
        for (int i = p; i > 0; i -= i & -i) {
            res += a[i];
        }
        return res;
    }

    LL qry(int l, int r) const {
        if (l > r) return 0;
        return qry(r) - qry(l - 1);
    }
};


void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int n, q, blen;
    cin >> n >> q;

    vector<int> arr(n + 1, 0), brr(n + 1, 0);
    vector<int> pos(n + 1, 0);
    vector<LL> res(q + 1, 0);

    blen = (int)sqrt(n);

    for (int i = 1; i <= n; i ++) {
        pos[i] = (i - 1) / blen + 1;
    }

    for (int i = 1; i <= n; i ++) {
        cin >> arr[i];
    }

    for (int i = 1; i <= n; i ++) {
        cin >> brr[i];
    }

    vector<P> que_;
    BIT arr_(MAXL), brr_(MAXL);

    for (int i = 1; i <= q; i ++) {
        int l, r, k;
        cin >> l >> r >> k;
        que_.push_back({l, r, k, i});
    }

    std::sort(que_.begin(), que_.end(), [&](P a, P b) {
        if (pos[a.l] != pos[b.l]) {
            return pos[a.l] < pos[b.l];
        }
        else {
            if (pos[a.l] & 1) return a.r < b.r;
            else return a.r > b.r;
        }
    });

    auto add = [&](LL v, int x) {
        if (v > 1e5) return;
        if (x == 1) arr_.add(v, 1);
        else brr_.add(v, 1);
    };

    auto del = [&](LL v, int x) {
        if (v > 1e5) return;
        if (x == 1) arr_.add(v, -1);
        else brr_.add(v, -1);
    };


    int now_l = 1, now_r = 0;

    for (int i = 0; i < q; i ++) {
        int next_l = que_[i].l;
        int next_r = que_[i].r;
        int K = que_[i].k;

        while (now_l > next_l) {
            now_l --;
            add(arr[now_l], 1);
            add(brr[now_l], 2);
        }
        while (now_l < next_l) {
            del(arr[now_l], 1);
            del(brr[now_l], 2);
            now_l ++;
        }
        while (now_r < next_r) {
            ++ now_r;
            add(arr[now_r], 1);
            add(brr[now_r], 2);
        }
        while (now_r > next_r) {
            del(arr[now_r], 1);
            del(brr[now_r], 2);
            now_r --;
        }

        LL ans = 0;
        for (int L = 1, R; L <= K; L = R + 1) {
            int v = K / L;
            R = K / v;
            ans += arr_.qry(L, R) * brr_.qry(1, v);
        }

        res[que_[i].p] = ans;
    }

    for (int i = 1; i <= q; i ++) {
        cout << res[i] << endl;
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

## 复杂度

- 时间复杂度：莫队端点移动共 $O\big((N + Q)\sqrt{N}\big)$ 次，每次在两棵树状数组上单点修改，$O(\log V)$；每个询问的整除分块有 $O(\sqrt{k})$ 段，每段做两次树状数组查询，$O(\log V)$。总复杂度 $O\big((N + Q)\sqrt{N}\log V + Q\sqrt{k}\log V\big)$，其中 $V = 10^5$ 为压缩后的值域。
- 空间复杂度：$O(N + Q + V)$（两个数组、询问列表、两棵树状数组）。
