---
tags: [二分, 数论]
source: "https://codeforces.com/gym/101055/problem/C"
---
# gym101055C It-miha 题解

## 题意

若正整数 $n$ 不被任何大于 $1$ 的完全平方数整除，就称 $n$ 为 It-miha 数（即无平方因子数）。前十个 It-miha 数为 $1, 2, 3, 5, 6, 7, 10, 11, 13, 14$。

输入第一行是询问个数 $Q$（$1 \le Q \le 25$），接下来 $Q$ 行每行一个整数 $N$（$1 \le N \le 2 \times 10^{10}$），要求输出第 $N$ 个 It-miha 数（$1$ 是第 $1$ 个）。

## 核心思路

**第一步：把"第 $N$ 个"转成"二分答案"。** 设 $C(x)$ 表示不超过 $x$ 的 It-miha 数个数。$C(x)$ 随 $x$ 单调不减，而"第 $N$ 个 It-miha 数"正是满足 $C(x) \ge N$ 的最小 $x$，因此可以二分。二分上界取 $4 \times 10^{10}$：用并集界估计"被某个素数平方整除"的数的个数（每个 $p^2$ 至多整除 $\lfloor x/p^2 \rfloor$ 个数），有
$$C(x) \ge x - \sum_{p\ \text{为素数}} \left\lfloor \frac{x}{p^2} \right\rfloor \ge x\left(1 - \sum_{p} \frac{1}{p^2}\right) \approx 0.5478\,x,$$
在 $x = 4 \times 10^{10}$ 处已有 $C(x) \ge 2.19 \times 10^{10} > 2 \times 10^{10} \ge N$，所以答案一定落在 $[1,\,4 \times 10^{10}]$ 内（实际最大答案约为 $3.3 \times 10^{10}$）。

**第二步：用莫比乌斯函数求 $C(x)$。** 先证明莫比乌斯函数的求和恒等式
$$\sum_{d \mid m} \mu(d) = [\,m = 1\,].$$
推导：$\mu$ 是积性函数，因此 $g(m) = \sum_{d \mid m} \mu(d)$ 也是积性函数，只需计算它在素数幂上的取值。对 $m = p^{e}$（$e \ge 1$），由 $\mu(1) = 1$、$\mu(p) = -1$、$\mu(p^{k}) = 0\ (k \ge 2)$ 得
$$g(p^{e}) = \mu(1) + \mu(p) + \mu(p^2) + \cdots + \mu(p^{e}) = 1 - 1 + 0 + \cdots + 0 = 0 .$$
于是对 $m = \prod_p p^{e_p} > 1$ 有 $g(m) = \prod_{p} g(p^{e_p}) = 0$，而 $g(1) = \mu(1) = 1$，恒等式成立。

接着把 $n$ 唯一地写成
$$n = a\,b^2, \qquad a\ \text{无平方因子},\quad b \ge 1 .$$
唯一性来自素因数分解 $n = \prod_p p^{e_p}$：取 $b = \prod_p p^{\lfloor e_p / 2 \rfloor}$、$a = \prod_p p^{\,e_p \bmod 2}$ 即可（$b$ 就是"$n$ 的最大平方因子的平方根"）。对任意正整数 $d$，
$$d^2 \mid n \iff d \mid b,$$
因为 $d^2 \mid n$ 当且仅当 $d$ 的每个素因子的指数不超过 $e_p$ 的一半，即不超过 $\lfloor e_p / 2 \rfloor$。把上面的恒等式用在 $m = b$ 上，就得到指示函数的恒等式
$$[\,n\ \text{无平方因子}\,] = [\,b = 1\,] = \sum_{d \mid b} \mu(d) = \sum_{d^2 \mid n} \mu(d).$$
最后交换求和次序：由 $d^2 \mid n \le x$ 知 $d \le \lfloor \sqrt{x} \rfloor$，这是有限和，可以逐项交换；而对固定的 $d$，$x$ 以内 $d^2$ 的倍数恰有 $\lfloor x / d^2 \rfloor$ 个，因此
$$C(x) = \sum_{n \le x}\ \sum_{d^2 \mid n} \mu(d) = \sum_{d = 1}^{\lfloor \sqrt{x} \rfloor} \mu(d) \left\lfloor \frac{x}{d^2} \right\rfloor .$$
这正是代码中 `Q` 函数的计算依据。二分时 $\sqrt{x} \le \lfloor \sqrt{4 \times 10^{10}} \rfloor = 2 \times 10^5$，所以把 $\mu$ 筛到 $2 \times 10^5$ 就够用。

**第三步：$O(\text{MAXL} \log \text{MAXL})$ 筛莫比乌斯函数。** 仍由 $\sum_{d \mid m} \mu(d) = [m = 1]$ 可得 $\mu(1) = 1$，且 $m > 1$ 时 $\mu(m) = -\sum_{d \mid m,\ d < m} \mu(d)$。代码正是按这个递推实现的：外层枚举 $i$，把 $\mu(i)$ 从所有真倍数 $j = 2i, 3i, \dots$ 中减去。当外层枚举到 $j$ 时，$\mu(j)$ 已被它的全部真因子更新过，恰好等于真正的莫比乌斯函数。

**第四步：单次判定在 $O(\sqrt{x})$ 内完成。** 每次二分时直接按 $C(x) = \sum_d \mu(d)\lfloor x/d^2 \rfloor$ 累加，只需枚举 $d \le \sqrt{x}$。

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
const int MAXL = 2e5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

LL mu[MAXL + 5];

void prepare() {
    mu[1] = 1;
    for (int i = 1; i <= MAXL; i ++) {
        for (int j = 2 * i; j <= MAXL; j += i) {
            mu[j] -= mu[i];
        }
    }
}

LL Q(LL x) {
    LL s = 0;
    for (LL d = 1; d * d <= x; d ++) {
        s += (LL)mu[d] * (x / (d * d));
    }
    return s;
}

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    LL n;
    cin >> n;

    LL l = 1, r = 4e10;
    while (l < r) {
        LL mid = (l + r) >> 1;
        if (Q(mid) >= n) r = mid;
        else l = mid + 1;
    }

    cout << l << endl;

    return;
}

int main()
{
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cout.tie(nullptr);
    int _ = 1;
    prepare();
    cin >> _;
    for (int i = 0; i < _; i ++)
    {
        solve();
    }
    return 0;
}
```

## 复杂度

- 时间复杂度：筛莫比乌斯函数为 $O(\text{MAXL} \log \text{MAXL})$，其中 $\text{MAXL} = 2 \times 10^5$；每个询问二分 $\log_2(4 \times 10^{10}) \approx 36$ 次，每次判定 $O(\sqrt{x}) \le 2 \times 10^5$，单个询问约 $7.2 \times 10^6$ 次运算，$Q \le 25$ 时总计约 $1.8 \times 10^8$ 次运算。
- 空间复杂度：$O(\text{MAXL})$，即存放 $\mu$ 的长度 $2 \times 10^5$ 的数组。
