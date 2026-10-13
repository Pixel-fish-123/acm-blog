# gym106565D 哦 搞错了 题解

## 题意

给定长度为 $n$ 的 01 串 $S$，构造长度为 $n$ 的正整数数组 $A$，满足：

- $0 < A_i < 2^{60}$，且两两互异；
- 记全局异或 $X = A_1 \oplus \cdots \oplus A_n$，再定义 $W_i = 1$ 当且仅当 $A_i \oplus X < A_i$，否则 $W_i = 0$；
- $W$ 与 $S$ 的海明距离不超过 $1$。

数据范围：$1 \le n = |S| \le 10^5$，$S$ 仅含 `0`/`1`。保证有解。

## 核心思路

**算法类型**：构造 + 位运算。

若 $X \ne 0$，设其最高位为第 $b$ 位，则

$$
A_i \oplus X < A_i \iff A_i \text{ 的第 } b \text{ 位为 } 1.
$$

因此合法的 $W$ 中 `1` 的个数必为奇数。题目允许海明距离 $1$，若 $S$ 中 `1` 的个数为偶数，翻转一位（代码翻 $S_1$）得到目标串 $T$，再构造使 $W = T$。

目标是让最终 $X = 1$（最高位为 bit $0$），于是 $W_i$ 恰等于 $A_i$ 的最低位。做法：

1. 令 $m = \max(n-2, 1)$，$w = \lfloor \log_2 m \rfloor$，取空闲高位 $h = 2^{w+1}$（用整数循环求 $w$，避免 `log2(n-2)` 在 $n \le 2$ 时未定义）。
2. 前 $n-2$ 个数填 $1..n-2$，异或记为 $\textit{ans}$；令 $A_{n-1} = \textit{ans} \lor h$，$A_n = h$，使尚未嵌入 $T$ 时整体异或为 $0$。
3. 若 $\textit{ans} = 0$ 且 $n > 2$，则 $A_{n-1}$ 与 $A_n$ 撞车，再借用第 $w+2$ 位加到 $A_1$ 与 $A_n$ 上区分（异或仍为 $0$）。$n \le 2$ 时前缀为空，调奇后末两（或唯一）个最低位必然不同，左移嵌入后自然互异，无需这一步。
4. 全体左移 $1$ 位，把 $T_i$ 写入最低位。此时高位异或为 $0$，最低位异或为 $1$，故 $X = 1$，$W = T$。

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
#include <bitset>
// 支持lcm函数
#define LL long long
#define ULL unsigned long long
#define pair_int std::pair<int, int>
#define pair_LL std::pair<LL, LL>
const int INF_INT = 0x3f3f3f3f;
const LL INF_LL = 4e18;
const LL MOD1 = 998244353;
const LL MOD2 = 1e9 + 7;
const int MAXL = 1e5 + 5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    std::string s;
    cin >> s;
    int n = s.size();

    int cnt = 0;
    for (int i = 0; i < s.size(); i ++) {
        if (s[i] == '1') {
            cnt ++;
        }
    }

    if (cnt % 2 == 0) {
        s[0] = s[0] == '0' ? '1' : '0';
    }
    
    vector<LL> nums(n + 2, 0);
    LL ans = 0;
    int w = 0;
    while ((1LL << (w + 1)) <= std::max(n - 2, 1)) {
        w ++;
    }

    for (int i = 1; i <= n - 2; i ++) {
        nums[i] = i;
        ans ^= i;
    }

    nums[n - 1] = ans;
    nums[n - 1] |= (1LL << (w + 1));
    nums[n] |= (1LL << (w + 1));

    if (ans == 0 && n > 2) {
        nums[1] |= (1LL << (w + 2));
        nums[n] |= (1LL << (w + 2));
    }

    for (int i = 1; i <= n; i ++) {
        nums[i] <<= 1;
        if (s[i - 1] == '1') {
            nums[i] |= 1;
        }
    }

    for (int i = 1; i <= n; i ++) {
        cout << nums[i] << " ";
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

- 时间复杂度：$O(n)$。
- 空间复杂度：$O(n)$。
