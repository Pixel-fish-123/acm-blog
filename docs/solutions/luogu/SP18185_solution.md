# SP18185 GIVEAWAY - Give Away 题解

## 题意

给定一个 $1$ 下标、长度为 $N$ 的数组 $X$（$N\le 5\times 10^5$），$Q$ 个询问：`0 a b c` 查询区间 $[a,b]$ 中值 $\ge c$ 的元素个数；`1 a b` 把第 $a$ 个元素改为 $b$。

## 核心思路

**算法类型**：值域分块（每块维护有序副本，支持单点修改的区间 $\ge c$ 计数）。

**建块（`bulid`）**：按 $\sqrt n$ 的大小把序列分成 $\sqrt n$ 级别个块，记录每块的左右端点 `bl/br` 与元素所属块 `bi`；另外为每块维护一份**排好序的副本** `sortv`（块内独立排序）。

**查询 `query(l, r, val)`**（统计 $[l,r]$ 内 $\ge val$ 的元素数）分三种情况：

- 两端散块：直接暴力扫 $[l,\text{块尾}]$ 与 $[\text{块首},r]$，逐个比较；
- 中间整块：对每个完整块在有序副本 `sortv` 上**二分**（`getCnt` 手写二分统计 $\ge val$ 的个数），单块 $O(\log\sqrt n)$。

**修改 `update(now, val)`**：改动原数组 `arr[now]`，然后把该元素所在块的副本重新拷贝并排序（块长 $\sqrt n$，代价 $O(\sqrt n\log\sqrt n)$）。

> ⚠️ **一处值得注意的实现细节**：代码中"查询两端点同块"的分支写的是 `for (int i = 1; i <= r; i ++)`——起点是 $1$ 而非 $l$，严格来说统计的是 $[1,r]$ 而非 $[l,r]$，疑似笔误（正确写法应从 `l` 起）。该写法通过了 SPOJ 的评测数据，但复用这段代码时建议改为从 `l` 开始。

洛谷镜像页未给出 $Q$ 的上界，按分块复杂度估算即可。

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
#define LL long long
#define ULL unsigned long long
#define pair_int std::pair<int, int>
#define pair_LL std::pair<LL, LL>
const int INF_INT = 0x3f3f3f3f;
const LL INF_LL = 1e18;
const LL mod = 998244353;
const int MAXL = 5e5 + 5;
const int MAXB = 1001;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

int n, m;
int arr[MAXL];
int sortv[MAXL];

int blen, bnum;
int bi[MAXL];
int bl[MAXB];
int br[MAXB];

void bulid() {
    blen = (int)sqrt(n);
    bnum = (n + blen - 1) / blen;
    for (int i = 1; i <= n; i ++) {
        bi[i] = (i - 1) / blen + 1;
    }

    for (int i = 1; i <= bnum; i ++) {
        bl[i] = (i - 1) * blen + 1;
        br[i] = std::min(i * blen, n);
    }

    for (int i = 1; i <= n; i ++) {
        sortv[i] = arr[i];
    }
    
    for (int i = 1; i <= bnum; i ++) {
        std::sort(sortv + bl[i], sortv + br[i] + 1);
    }
}

int getCnt(int now, int val) {
    int l = bl[now], r = br[now], mid = 0, ans = 0;
    while (l <= r) {
        mid = (l + r) >> 1;
        if (sortv[mid] >= val) {
            ans += r - mid + 1;
            r = mid - 1;
        }
        else {
            l = mid + 1;
        }
    }
    return ans;
}

int query(int l, int r, int val) {
    int ans = 0;
    if (bi[l] == bi[r]) {
        for (int i = 1; i <= r; i ++) {
            if (arr[i] >= val) {
                ans ++;
            }
        }
    }
    else {
        for (int i = l; i <= br[bi[l]]; i ++) {
            if (arr[i] >= val) {
                ans ++;
            }
        }
        for (int i = bl[bi[r]]; i <= r; i ++) {
            if (arr[i] >= val) {
                ans ++;
            }
        }
        for (int i = bi[l] + 1; i <= bi[r] - 1; i ++) {
            ans += getCnt(i, val);
        }
    }
    return ans;
}

void update(int now, int val) {
    int l = bl[bi[now]];
    int r = br[bi[now]];

    arr[now] = val;
    for (int j = l; j <= r; j ++) {
        sortv[j] = arr[j];
    }

    std::sort(sortv + l, sortv + r + 1);
    return;
}


void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    cin >> n;

    for (int i = 1; i <= n; i ++) {
        cin >> arr[i];
    }

    bulid();
    cin >> m;
    int op, a, b, c;

    for (int i = 0; i < m; i ++) {
        cin >> op >> a >> b;
        if (op == 0) {
            cin >> c;
            cout << query(a, b, c) << endl;
        }
        else {
            update(a, b);
        }
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
    for (int i = 0; i < _; i++)
    {
        solve();
    }
    return 0;
}
```

## 复杂度

- 时间复杂度：建块 $O(n\log\sqrt n)$；单次查询 $O(\sqrt n\log\sqrt n)$（散块暴力 $O(\sqrt n)$ + 至多 $\sqrt n$ 个整块各一次二分）；单次修改 $O(\sqrt n\log\sqrt n)$（块内重排序）。总计 $O\bigl((n+Q)\sqrt n\log\sqrt n\bigr)$。
- 空间复杂度：$O(n)$（原数组与有序副本）。
