# gym106733F Coffee is Life 题解

## 题意

共 $n$ 天，第 $i$ 天最多完成 $w_i$ 单位工作，每完成 $1$ 单位工作消耗 $1$ 点能量，每天开始时能量为 $0$，能量不会留到第二天。

一共有 $m$ 杯咖啡，可以分配到任意几天喝。同一天里喝的第 $c$ 杯提供 $k - c + 1$ 点能量（$c > k$ 时为 $0$），每天重新从第 $1$ 杯算起。求最多能完成多少单位工作。

数据范围：$1 \le n \le 10^5$，$1 \le m, k \le 10^9$，$1 \le w_i \le 10^{18}$。

## 核心思路

**算法类型**：贪心 + 二分。每一天的收益关于喝的杯数是凹函数，所以答案等于所有「边际收益」里最大的 $m$ 个之和；二分第 $m$ 大的边际收益 $\lambda$，再用求根公式和闭式求和在 $O(1)$ 内算出每一天的贡献。

**第一步：转化成取前 $m$ 大的边际收益。**

一天喝 $t$ 杯得到的能量为

$$f(t) = k + (k - 1) + \dots + (k - t + 1) = \frac{t(2k - t + 1)}{2} \quad (t \le k),$$

$t \ge k$ 时为 $S = \frac{k(k+1)}{2}$。第 $i$ 天喝 $c$ 杯的收益是 $g_i(c) = \min(f(c), w_i)$。记 $t = c - 1$，第 $c$ 杯的边际收益为

$$\Delta_i(c) = g_i(c) - g_i(c - 1) = \min\big(k - t,\ w_i - f(t)\big),$$

即「这一杯本身的能量」和「这一天还剩下的工作量」取较小值（结果不大于 $0$ 时这一杯没用）。$\Delta_i(c)$ 随 $c$ 单调不增，所以 $g_i$ 是凹函数。若干个凹函数分配总量 $m$，最优解就是在所有 $\Delta_i(c)$ 里取最大的 $m$ 个：同一天里大的边际收益总是排在前面，取前 $m$ 大不会出现「跳过前面的杯子去喝后面的」。

**第二步：统计边际收益不小于 $\lambda$ 的杯子。**

对 $\lambda \ge 1$，$\Delta_i(t + 1) \ge \lambda$ 等价于

$$t \le k - \lambda \quad \text{且} \quad f(t) \le w_i - \lambda.$$

$f$ 单调递增，所以满足条件的 $t$ 是一段前缀 $0..T_i$，其中 $T_i = \min\big(k - \lambda,\ \max\{t : f(t) \le w_i - \lambda\}\big)$；若 $w_i < \lambda$ 则这一天没有这样的杯子。

`tmax(x)` 求 $\max\{t : f(t) \le x\}$：$f(t) \le x$ 等价于 $t^2 - (2k+1)t + 2x \ge 0$，取较小根 $\frac{(2k+1) - \sqrt{(2k+1)^2 - 8x}}{2}$，再用两个 `while` 修正浮点误差。`count_ge(λ)` 对每一天累加 $T_i + 1$。

**第三步：对这些杯子的边际收益求和。**

$\min(k - t,\ w_i - f(t))$ 在 $t$ 较小时取前者，较大时取后者。前者不大于后者等价于 $f(t) - t \le w_i - k$，而 $f(t) - t$ 随 $t$ 单调不减，所以存在分界点 $t_0$（同样用求根公式加修正求出，$w_i < k$ 时 $t_0 = -1$）：

- $t \in [0, t_0]$：贡献 $\sum (k - t) = (t_0 + 1)k - \frac{t_0(t_0+1)}{2}$；
- $t \in (t_0, T_i]$：贡献 $\sum (w_i - f(t))$，其中 $\sum_{s=0}^{T} f(s) = \frac{1}{2}\left((2k+1)\frac{T(T+1)}{2} - \frac{T(T+1)(2T+1)}{6}\right)$，即代码里的 `Fsum`。

`sum_ge(λ)` 把每一天的这两部分加起来。

**第四步：二分 $\lambda$。**

- 若 `count_ge(1) <= m`，所有有用的杯子都能喝上，答案是 `sum_ge(1)`，即 $\sum_i \min(w_i, S)$。
- 否则 `count_ge` 关于 $\lambda$ 单调不增，二分出最大的 $\lambda \in [1, k]$ 使 `count_ge(λ) >= m`。边际收益严格大于 $\lambda$ 的杯子不足 $m$ 个，全部喝掉，剩下的名额都按 $\lambda$ 计价：答案为 `sum_ge(λ + 1) + (m - count_ge(λ + 1)) * λ`。

中间量可能超过 $10^{18}$（例如 $T \cdot w_i$），所以求和用 `__int128`，最后用 `toString` 输出。

**样例验证。** $k = 3$ 时一天内三杯分别提供 $3, 2, 1$ 点能量，$w = (10, 2, 4, 1)$，$m = 4$。第 $1$ 天喝两杯得 $5$，第 $2$ 天一杯得 $\min(3, 2) = 2$，第 $3$ 天一杯得 $3$，合计 $10$。

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
#define LLL __int128_t
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

LL n, m, k;
LL S;

vector<LL> w;

LL f(LL t) {
    if (t <= 0) return 0;
    if (t >= k) return S;
    return t * (2 * k - t + 1) / 2;
}

LL tmax(LL x) {
    if (x >= S) return k;
    long double a = (long double)(2 * k + 1);
    long double d = a * a - 8.0L * (long double)x;
    LL t = (LL)((a - sqrtl(d)) / 2.0L);
    if (t < 0) t = 0;
    if (t > k) t = k;
    while (t > 0 && f(t) > x) -- t;
    while (t < k && f(t + 1) <= x) ++ t;
    return t;
}

LLL count_ge(LL lam) {
    if (lam > k) return 0;
    LLL c = 0;
    LL cap = k - lam;
    for (LL wi : w) {
        if (wi < lam) continue;
        LL x = wi - lam;
        LL t = std::min(cap, tmax(x));
        c += (LLL)t + 1;
    }
    return c;
}

LLL Fsum(LL T) {
    if (T < 0) return 0;
    LLL t = T;
    LLL s1 = t * (t + 1) / 2;
    LLL s2 = t * (t + 1) * (2 * t + 1) / 6;
    return (((LLL)(2 * k + 1)) * s1 - s2) / 2;
}

LLL sum_ge(LL lam) {
    if (lam > k) return 0;
    LLL res = 0;
    LL cap = k - lam;
    for (LL wi : w) {
        if (wi < lam) continue;
        LL x = wi - lam;
        LL T = std::min(cap, tmax(x));
        LL Y = wi - k;
        LL t0;
        if (Y < 0) {
            t0 = -1;
        }
        else {
            LL hT = f(T) - T;
            if (Y >= hT) {
                t0 = T;
            }
            else {
                long double a = (long double)(2 * k - 1);
                long double d = a * a - 8.0L * (long double)Y;
                t0 = (LL)((a - sqrtl(d)) / 2.0L);
                if (t0 < -1) t0 = -1;
                if (t0 > T) t0 = T;
                while (t0 >= 0 && f(t0) - t0 > Y) --t0;
                while (t0 < T && f(t0 + 1) - (t0 + 1) <= Y) ++ t0;
            }
        }
        LLL part1 = 0, part2 = 0;
        if (t0 >= 0) {
            LLL u = t0;
            part1 = (u + 1) * (LLL)k - u * (u + 1) / 2;
        }
        if (T > t0) {
            LLL cnt = (LLL)(T - t0);
            part2 = cnt * (LLL)(x + lam) - (Fsum(T) - Fsum(t0));
        }
        res += part1 + part2;
    }
    return res;
}

std::string toString(LLL x) {
    if (x == 0) return "0";
    bool neg = x < 0;
    if (neg) x = -x;
    std::string s;
    while (x > 0) { s += char('0' + (int)(x % 10)); x /= 10; }
    if (neg) s += '-';
    reverse(s.begin(), s.end());
    return s;
}

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    cin >> n >> m >> k;

    w.resize(n);
    for (auto &x : w) {
        cin >> x;
    }

    S = k * (k + 1) / 2;

    LLL ans = 0;
    if (count_ge(1) <= m) {
        ans = sum_ge(1);
    }
    else {
        LL l = 1, r = k, lam = 1;
        while (l <= r) {
            LL mid = l + (r - l) / 2;
            if (count_ge(mid) >= m) {
                lam = mid;
                l = mid + 1;
            }
            else {
                r = mid - 1;
            }
        }
        ans = sum_ge(lam + 1) + ((LLL)m - count_ge(lam + 1)) * (LLL)lam;
    }

    cout << toString(ans) << endl;
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

- 时间复杂度：二分 $O(\log k)$ 轮，每轮对每一天做 $O(1)$ 的求根和闭式求和，共 $O(n \log k)$。
- 空间复杂度：$O(n)$。
