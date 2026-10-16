# gym102829I Luke's Math Problem 题解

## 题意
给定整数向量 $a_0=\langle x,y\rangle$，求满足以下条件的非空向量序列 $\{a_i\}_{i=0}^{n}$ 的个数（$n \ge 0$）：

- 所有向量的分量都是整数；
- 对每个 $i>0$，$\|a_i\|_2 < \|a_{i-1}\|_2$，即模长严格递减；
- 对每个 $i>0$，$\|a_i-a_{i-1}\|_2 < \sqrt2$。

共 $Q$ 次询问（$1 \le Q \le 10^6$），每次给出 $x,y$（$0 \le |x|,|y| \le 10^6$），答案对 $10^9+7$ 取模。

## 核心思路
**算法类型**：组合数学，把每一步看成「把 $|x|$ 或 $|y|$ 减 1」，答案是一个网格路径计数的组合数求和，再用曲棍球棒恒等式化成一个组合数。

**每一步只能怎么走**：相邻两个整点向量的距离 $<\sqrt2$，又因为模长严格减小，两者不能相同，所以距离只能是 $1$，即只改变一个坐标、改变量为 $\pm1$。设改的是 $x$，模长变小等价于 $|x|$ 变小，所以只能在 $x \ne 0$ 时把 $x$ 往 0 的方向挪一格；$x=0$ 时往任一方向挪都会让模长变大。$y$ 同理。

由对称性，先取 $x \leftarrow |x|,\ y \leftarrow |y|$。于是一个序列就是从 $(x,y)$ 出发、每步把某一坐标减 1、可以在任意时刻停下的路径。停在 $(a,b)$（$0\le a\le x,\ 0\le b\le y$）的路径有 $\binom{(x-a)+(y-b)}{x-a}$ 条，令 $i=x-a,\ j=y-b$：

$$
\text{ans}=\sum_{i=0}^{x}\sum_{j=0}^{y}\binom{i+j}{i}
$$

对 $j$ 求和用一次曲棍球棒恒等式：$\sum_{j=0}^{y}\binom{i+j}{i}=\binom{i+y+1}{i+1}$；再对 $i$ 求和：

$$
\sum_{i=0}^{x}\binom{i+y+1}{y}=\binom{x+y+2}{y+1}-\binom{y+1}{y+1}=\binom{x+y+2}{x+1}-1
$$

验证样例：$\langle 0,2\rangle$ 得 $\binom41-1=3$；$\langle -3,-4\rangle$ 得 $\binom94-1=125$，都对得上。

代码先预处理阶乘 `fac` 和阶乘逆元 `inv` 到 $2\times10^6+2$（$x+y+2$ 的最大值），每次询问取绝对值后输出 `C(x + y + 2, x + 1) - 1`，减 1 后加 `MOD2` 防止出现负数。

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
const int MAXL = 2e6 + 2;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

LL qpow(LL a, LL b) {
    LL res = 1;
    a %= MOD2;
    while (b) {
        if (b & 1) {
            res = res * a % MOD2;
        }
        a = a * a % MOD2;
        b >>= 1;
    }
    return res;
}

LL fac[MAXL + 5], inv[MAXL + 5];

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    fac[0] = fac[1] = inv[0] = 1;
    for (LL i = 2; i <= MAXL; i ++) {
        fac[i] = (fac[i - 1] * i) % MOD2;
    }

    inv[MAXL] = qpow(fac[MAXL], MOD2 - 2);

    for (LL i = MAXL - 1; i >= 1; i --) {
        inv[i] = (inv[i + 1] * (i + 1)) % MOD2;
    }

    auto C = [&](LL n, LL k) -> LL {
        if (k > n) return 0;
        LL res = (((fac[n] * inv[k]) % MOD2) * inv[n - k]) % MOD2;
        return res % MOD2;
    };

    int q;
    cin >> q;

    while (q --) {
        LL x, y;
        cin >> x >> y;
        x = std::abs(x);
        y = std::abs(y);

        LL ans = (C(x + y + 2, x + 1) - 1 + MOD2) % MOD2;

        cout << ans << endl;
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


:::

## 复杂度
预处理阶乘和逆元 $O(V)$，$V=2\times10^6$，其中求一次逆元的快速幂是 $O(\log P)$；每次询问 $O(1)$，总时间复杂度 $O(V+Q)$。两个阶乘数组共 $O(V)$ 空间，约 32 MB。
