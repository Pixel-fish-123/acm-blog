# cf2261B What's the Capital of France? 题解

## 题意
一行 $n$ 家餐厅，评分 $a_i$。一次操作选相邻两家：若评分不同，把较小的那家加 $1$；相同则不变。可操作任意次。求所有评分按位或的最大值。

多测，$1\le t\le 10^4$，$1\le n\le 2\cdot 10^5$，$0\le a_i\le 10^9$，总 $n$ 不超过 $2\cdot 10^5$。

## 核心思路
**算法类型**：位运算 / 贪心 / 数学。

操作不会增大数组最大值 $M$，只会把较小的邻居往上抬，因此每个位置最终可以变成 $[a_i,M]$ 中的任意整数，且全局最大值始终是 $M$。目标变成：在每个位置各自选一个 $\le M$ 且 $\ge a_i$ 的数，使它们的按位或最大。

进一步观察：区间越宽越好抬，所以起决定作用的只有最小值 $\mathit{mn}$ 与最大值 $M$——答案等于
$$
\bigvee_{x=\mathit{mn}}^{M} x
$$
（用 $\mathit{mn}$ 所在位置抬到区间内合适的值，再与 $M$ 取或即可；中间元素的可达区间都是 $[\mathit{mn},M]$ 的子集）。

下面给出两种实现。

### 做法一：$O(1)$ 闭式
记 $M=\max a_i$，$\mathit{mn}=\min a_i$。

- 若 $\mathit{mn}=M$，无法做任何有意义的操作，答案就是 $M$。
- 否则令 $k=\mathrm{msb}(M\oplus \mathit{mn})$（异或后最高为 $1$ 的比特位，从 $0$ 起算），答案为
  $$
  M \lor (2^{k+1}-1).
  $$
  也就是把 $M$ 的第 $0\sim k$ 位全部置 $1$。

**为什么对**：$M$ 与 $\mathit{mn}$ 在高于 $k$ 的比特上完全相同，且在第 $k$ 位上 $M$ 为 $1$、$\mathit{mn}$ 为 $0$，因此 $M-\mathit{mn}\ge 2^k$，区间 $[\mathit{mn},M]$ 长度 $>2^k$。对任意 $j\le k$，任意连续 $2^j$ 个数里都有第 $j$ 位为 $1$ 的数，故区间内所有数的按位或会覆盖第 $0\sim k$ 位；高于 $k$ 的位则与 $M$ 一致、多不出来。于是
$$
\bigvee_{x=\mathit{mn}}^{M} x = M \lor (2^{k+1}-1).
$$
实现上扫一遍取 $\mathit{mn},M$ 即可。$k+1$ 可用 `32 - __builtin_clz(M ^ mn)` 得到；左移写成 `1LL << ...`，避免移位溢出。

### 做法二：按位贪心
本仓库代码的实现：先令 `res` 为全体 $a_i$ 的或（已含 $M$）。对每个下标 $i$，从高到低枚举缺失的比特 $k$，尝试把 $2^k$ 焊进 $a_i$：若 $a_i\lor 2^k\le M$，就把该比特并进 $a_i$ 和 `res`。这样贪心地把能加上的高位都加上，最终与闭式同解。

## 参考代码（做法一）

```cpp
#include <bits/stdc++.h>
using namespace std;
using LL = long long;

void solve() {
    int n;
    cin >> n;
    LL mn = LLONG_MAX, mx = 0;
    for (int i = 0; i < n; i++) {
        LL x;
        cin >> x;
        mn = min(mn, x);
        mx = max(mx, x);
    }
    if (mn == mx) {
        cout << mx << '\n';
        return;
    }
    // 32 - clz(mx ^ mn) = k + 1，其中 k = msb(mx ^ mn)
    cout << (mx | ((1LL << (32 - __builtin_clz((unsigned)(mx ^ mn)))) - 1)) << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T--) solve();
    return 0;
}
```

## 参考代码（做法二）

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
const int MAXL = 0;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int n;
    LL max_ = 0, res = 0;
    cin >> n;

    vector<LL> arr(n + 1, 0);

    for (int i = 1; i <= n; i ++) {
        cin >> arr[i];
        max_ = std::max(max_, arr[i]);
        res |= arr[i];
    }

    for (int i = 1; i <= n; i ++) {
        for (int k = 28; k >= 0; k --) {
            if (((res >> k) & 1) == 0) {
                LL now = arr[i] | (1 << k);
                if (now <= max_) {
                    arr[i] |= (1 << k);
                    res |= (1 << k);
                }
            }
        }
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

## 复杂度
- 做法一：扫一遍取最值，时间 $O(n)$，空间 $O(1)$。
- 做法二：对每个元素扫约 $29$ 个比特，时间 $O(n\log A)$，空间 $O(n)$；$A\le 10^9$。
