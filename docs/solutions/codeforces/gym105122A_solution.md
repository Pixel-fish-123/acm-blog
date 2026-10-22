# gym105122A Generator 题解

## 题意
实现均匀伪随机生成器：每次等概率生成一对整数 $(a,b)$ 满足 $1 \le a \le b \le k$。输入 $k$（$2 \le k \le 10^9$）与次数 $n$（$1 \le n \le 10^4$），输出 $n$ 对。评测只检查样本是否服从均匀分布。

## 核心思路
**算法类型**：数学（秩映射）+ 二分。

合法对数 $M = k(k+1)/2$。先在 $[0,M)$ 上均匀取整数秩 $r$，再把 $r$ 唯一解码成一对 $(a,b)$，即得均匀分布。

按 $a$ 从小到大、同 $a$ 时 $b$ 从 $a$ 到 $k$ 排列。前缀个数（$a' \le a$ 的对数）为
$$
\mathrm{pref}(a) = a(k+1) - \frac{a(a+1)}{2}.
$$
二分最小的 $a$ 使 $\mathrm{pref}(a) > r$，再令
$$
b = a + \bigl(r - \mathrm{pref}(a-1)\bigr),
$$
即在该 $a$ 的一段里按偏移取出 $b$。$k$ 可达 $10^9$，乘法用 $64$ 位整数；`random_below` 用拒绝采样保证 $[0,M)$ 均匀。

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
#include <chrono>

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
using u64 = uint64_t;

static std::mt19937_64 rng_engine;

void init_rng() {
    std::random_device rd;
    u64 seed = (u64(rd()) << 32) ^ (u64)rd();
    seed ^= (u64)std::chrono::steady_clock::now().time_since_epoch().count();
    seed ^= (u64)(uintptr_t)&seed;
    rng_engine.seed(seed);
}

u64 random_u64() {
    return rng_engine();
}

u64 random_below(u64 bound) {
    const u64 limit = UINT64_MAX - UINT64_MAX % bound;
    u64 x;
    do {
        x = random_u64();
    } while (x >= limit);
    return x % bound;
}

u64 prefix_count(u64 a, u64 k) {
    u64 res = a * (k + 1) - a * (a + 1) / 2;
    return res;
}

std::pair<u64, u64> to_pair(u64 r, u64 k) {
    u64 lo = 1, hi = k, res = 0;
    while (lo <= hi) {
        u64 mid = lo + (hi - lo) / 2;
        if (prefix_count(mid, k) > r) {
            res = mid;
            hi = mid - 1;
        }
        else {
            lo = mid + 1;
        }
    }

    u64 a = res;
    u64 b = a + (r - prefix_count(a - 1, k));
    return {a, b};
} 

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);

    u64 n, k;
    cin >> k >> n;

    u64 M = k * (k + 1) / 2;
    init_rng();

    for (int i = 0; i < n; i ++) {
        u64 r = random_below(M);
        auto [a, b] = to_pair(r, k);
        cout << a << " " << b << endl;
    }

    return;
}

int main()
{
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
每次生成 $O(\log k)$，共 $n$ 次，时间 $O(n \log k)$，空间 $O(1)$。

预估难度：CF 1600（约 1600*）。本题难度由 AI 预估，仅作为参考。
