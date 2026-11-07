# gym106603H Shell Shock 题解

## 题意
给定一张有 $n$ 个节点的图（$2 \le n \le 10^9$），起点为 $1$，终点为 $n$。你可以任意在节点对之间添加无向边，使得从 $1$ 到 $n$ 的最短路径（即边数最少的路径）条数尽可能多。求最多能构造出多少条从 $1$ 到 $n$ 的最短路径，答案对 $998244353$ 取模。

## 核心思路
**算法类型**：贪心 + 数学 + 构造（分层图构造与整数拆分）。

按每个点到起点 $1$ 的最短距离将图分层：第 $0$ 层只有起点 $\{1\}$，最后一层只有终点 $\{n\}$，中间共有 $t = n - 2$ 个可用节点，可分配到若干个中间层 $L_1, L_2, \dots, L_k$ 中，设第 $i$ 层的节点数为 $c_i$（满足 $\sum_{i=1}^k c_i \le t$）。

由于最短路径每一步只能从第 $i$ 层走向第 $i+1$ 层，若将相邻两层之间的所有点对全部连满（构成完全分层图），则从 $1$ 到 $n$ 的最短路径条数恰好为各中间层大小的乘积：
$$\prod_{i=1}^k c_i$$
问题转化为经典的**整数拆分最大乘积**：将正整数 $t = n - 2$ 拆分为若干个正整数之和，使它们的乘积最大。

- 当 $n \le 3$（即 $t \le 1$）时，最大乘积为 $1$；
- 当 $t \ge 2$ 时，由于 $e \approx 2.718$ 最接近整数 $3$，且 $2 + 2 = 4 \implies 2 \times 2 > 1 \times 3$、$c_i \ge 5$ 时拆成 $3 + (c_i - 3)$ 乘积严格更大，因此最优拆分应当尽可能多地拆出 $3$，余下部分按 $t \bmod 3$ 分类讨论：
  - 若 $t \equiv 0 \pmod 3$：全部拆成 $\frac{t}{3}$ 个 $3$，答案为 $3^{t/3}$；
  - 若 $t \equiv 1 \pmod 3$：少拆一个 $3$，与余下的 $1$ 合并为 $4 = 2 + 2$，答案为 $3^{\lfloor t/3 \rfloor - 1} \times 4$；
  - 若 $t \equiv 2 \pmod 3$：拆成 $\lfloor \frac{t}{3} \rfloor$ 个 $3$ 和一个 $2$，答案为 $3^{\lfloor t/3 \rfloor} \times 2$。

用快速幂在 $O(\log n)$ 时间内计算 $3$ 的幂次并对 $998244353$ 取模即可。

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
const int MAXL = 0;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

LL qpow(LL a, LL b) {
    LL res = 1;
    a %= MOD1;
    while (b) {
        if (b & 1) {
            res = res * a % MOD1;
        }
        a = a * a % MOD1;
        b >>= 1;
    }
    return res % MOD1;
}

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    LL n, res = 1;
    cin >> n;

    LL t = n - 2;

    if (n <= 3) {
        cout << res << endl;
        return;
    }
    else {
        LL m3;
        if (t % 3 == 1) {
            m3 = t / 3 - 1;
            res = (qpow(3, m3) % MOD1 * 4) % MOD1;
        }
        else if (t % 3 == 2) {
            m3 = t / 3;
            res = (qpow(3, m3) % MOD1 * 2) % MOD1;
        }
        else {
            m3 = t / 3;
            res = (qpow(3, m3) % MOD1) % MOD1;
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
- 时间复杂度：快速幂计算 $3^{m_3} \bmod 998244353$，时间复杂度为 $O(\log n)$。
- 空间复杂度：$O(1)$。

预估难度：CF 1300（约 1300*）。本题难度由 AI 预估，仅作为参考。
