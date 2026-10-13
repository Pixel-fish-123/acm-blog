# gym102307K Kernel Of Love 题解

## 题意

斐波那契数列满足 $F_1 = F_2 = 1$，$F_{k+2} = F_{k+1} + F_k$。

称无序对 $\{x, y\}$（对应前 $n$ 个斐波那契数中两个不同下标）为完美情侣，当且仅当：

1. $x, y$ 都是斐波那契数；
2. $\gcd(x, y) = 1$；
3. $(x + y) \bmod 2 = 1$；
4. $x + y$ 仍是斐波那契数。

多组询问，每组给定 $n$（$1 \le n \le 10^5$），求前 $n$ 个斐波那契数中完美情侣的数量。

## 核心思路

**算法类型**：数论 + 枚举（斐波那契恒等式与奇偶性）。

记前 $n$ 个数为 $F_1, \ldots, F_n$（下标互异，即使 $F_1 = F_2 = 1$ 也视为两个人）。

已知：

- $F_k$ 为偶数当且仅当 $3 \mid k$；
- $\gcd(F_i, F_j) = F_{\gcd(i,j)}$，故相邻两项 $\gcd(F_i, F_{i+1}) = 1$；
- 恒等式 $F_i + F_{i+1} = F_{i+2}$，故任意相邻两项之和必为斐波那契数。

因此对相邻下标 $(i, i+1)$，条件 1、2、4 自动成立，只需条件 3（和为奇数），即恰有一个为偶数，也就是 $i$ 与 $i+1$ 中恰有一个被 $3$ 整除，等价于 $i \not\equiv 1 \pmod 3$。

此外还有唯一的「跳一项」特例：$(F_1, F_3) = (1, 2)$，和为 $3 = F_4$，且满足互质与奇偶。其它形如 $(i, i+2)$ 的对在 $n$ 较大时一般不再是完美情侣。

于是当 $n \ge 3$ 时，答案为

$$
\bigl|\{i : 1 \le i \le n-1,\ i \not\equiv 1 \pmod 3\}\bigr| + 1
$$

（最后的 $+1$ 来自 $(1,3)$；$(2,3)$ 已含在相邻统计中）。该式可化为闭形式 $n - \lfloor n/3 \rfloor - [n \bmod 3 = 2]$。$n < 3$ 时单独处理即可（答案为 $0$）。

代码正是按此公式 $O(1)$ 作答。

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

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int n;
    cin >> n;

    int cnt = n / 3;
    if (n % 3 == 2) cnt ++;

    if (n < 3) n --;

    cout << n - cnt << endl;
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


:::

## 复杂度

- 时间复杂度：每组询问 $O(1)$，设询问数为 $T$，总时间 $O(T)$。
- 空间复杂度：$O(1)$。
