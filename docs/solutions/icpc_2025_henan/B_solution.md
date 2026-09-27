# B 最大popcount 题解

## 题意

$\text{popcount}(x)$ 表示 $x$ 的二进制中 $1$ 的个数。$q$ 次询问，每次给出 $n$，求 $[0, n]$ 中 $\text{popcount}$ 最大的整数；若有多个，输出最小的那个。

数据范围：$1 \le q \le 10^3$，$0 \le n \le 10^{18}$。

## 核心思路

**算法类型**：位运算 + 贪心。答案是不超过 $n$ 的最大的「全 $1$ 数」$2^j - 1$；$n = 0$ 时答案为 $0$。

设 $n \ge 1$ 的二进制位数为 $k$，即 $2^{k-1} \le n < 2^k$。

**情况一：$n = 2^k - 1$。** $[0, n]$ 里的数都不超过 $k$ 位，$\text{popcount}$ 至多为 $k$，而 $k$ 位全为 $1$ 的数只有 $n$ 本身，答案就是 $n$。

**情况二：$n < 2^k - 1$。** 唯一可能有 $k$ 个 $1$ 的数是 $2^k - 1$，它大于 $n$，所以最大 $\text{popcount}$ 至多为 $k - 1$。而 $2^{k-1} - 1 < 2^{k-1} \le n$，它恰好有 $k - 1$ 个 $1$，所以最大值就是 $k - 1$。

有 $k - 1$ 个 $1$ 的数至少为 $2^{k-1} - 1$（把这些 $1$ 全放在最低位时最小），所以最小的满足条件的数就是 $2^{k-1} - 1$。

两种情况合起来，答案都是「不超过 $n$ 的最大的 $2^j - 1$」。

**实现。** 从 `res = 1` 开始，只要 `res + 2^head` $\le n$ 就把下一位补成 $1$，`res` 依次取 $1, 3, 7, 15, \ldots$，停下时就是答案。$n = 0$ 时单独输出 $0$。

**样例验证。**

- $n = 28, 29, 30$：$15 \le n < 31$，答案都是 $15$。
- $n = 31$：$31 = 2^5 - 1$，答案 $31$。
- $n = 2$：$1 \le 2 < 3$，答案 $1$。

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
const int MAXL = 62;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉
LL pow2_[MAXL];
void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    LL n;
    cin >> n;
    LL res = 1;
    if (n == 0) {
        cout << 0 << endl;
        return;
    }
    else {
        int head = 1;
        while (res + pow2_[head] <= n) {
            res += pow2_[head];
            head ++;
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
    pow2_[0] = 1;

    for (int i = 1; i < MAXL; i ++) {
        pow2_[i] = pow2_[i - 1] * 2;
    }

    for (int i = 0; i < _; i ++)
    {
        solve();
    }
    return 0;
}
```


:::

## 复杂度

- 时间复杂度：每次询问至多循环 $\log_2 n \approx 60$ 次，总计 $O(q \log n)$。
- 空间复杂度：$O(\log n)$，即长度为 $62$ 的 `pow2_` 表。
- 数值范围：$n \le 10^{18} < 2^{60}$，循环中 `res + pow2_[head]` 不超过 $2^{61}$，在 `long long` 范围内。
