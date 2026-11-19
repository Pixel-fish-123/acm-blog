# gym106796I I Don't Miss Pennies 题解

## 题意
商店取消 $1$ 分硬币后，信用卡支付仍按原价（精确到分）结算，而现金支付会将单笔交易总额四舍五入到最近的 $5$ 分倍数：
- 总额模 $5$ 余 $1, 2$ 时向下舍入（分别省 $1, 2$ 分）；
- 总额模 $5$ 余 $3, 4$ 时向上进位（分别多付 $2, 1$ 分，即省 $-2, -1$ 分）；
- 总额模 $5$ 余 $0$ 时不变（省 $0$ 分）。

给定要购买的 $N$（$1 \le N \le 3 \cdot 10^5$）件商品的价格 $p_i$（$1 \le p_i \le 3000$，单位：分）。你可以将所有商品任意划分为若干笔现金交易，求相比信用卡一次性原价支付，最多能节省多少分钱（若无论如何划分都会多付，则输出负数）。

## 核心思路
**算法类型**：贪心 + 数学 + 同余（模 $5$ 余数分组与跨周期收益最大化）。

每件商品只取决于其价格模 $5$ 的余数 $r = p_i \bmod 5$。将余数映射到对称余数 $v(r) \in \{-2, -1, 0, 1, 2\}$：
$$v(0) = 0,\quad v(1) = +1,\quad v(2) = +2,\quad v(3) = -2,\quad v(4) = -1$$

对于任意一笔交易 $G$，其节省金额 $s(G) \in \{-2, -1, 0, 1, 2\}$ 满足 $s(G) \equiv \sum_{i \in G} v_i \pmod 5$。因此：
1. **余 $0, 1, 2$ 的商品**：
   - 余 $0$ 的商品无论放哪里都不改变模 $5$ 余数，贡献恒为 $0$；
   - 余 $1$ 和余 $2$ 的商品单独成单即可分别稳定拿到 $+1$ 和 $+2$ 的满额收益（把它们合并只会因为总和超过 $2$ 发生进位，使收益减少 $5$）。
2. **余 $3$（$v = -2$）和余 $4$（$v = -1$）的商品**：
   单独购买会分别亏损 $2$ 分和 $1$ 分。只有将若干个负余数凑成总和 $\le -3$（即模 $5$ 达到 $+1$ 或 $+2$），才能触发一次 $+5$ 的跨周期反亏为盈：
   - **优先配对 `(3, 4)`**：一个 $3$ 加一个 $4$ 之和为 $7 \equiv 2 \pmod 5$，仅消耗两件商品就能获得单组最高收益 $+2$（相比单独买净赚 $+5$）。因此先配 $\text{pairs} = \min(\text{cnt}[3], \text{cnt}[4])$ 对，贡献 $2 \times \text{pairs}$。
   - **若剩余余 $3$（$\text{rem}_3 = \text{cnt}[3] - \text{cnt}[4]$）**：每两个 $3$ 可凑成 $3 + 3 = 6 \equiv 1 \pmod 5$，每对收益 $+1$；最后若还落单 $\text{rem}_3 \bmod 2$ 个 $3$，无论单独成单还是并入其他交易，都会带来 $-2$ 的净变化。
   - **若剩余余 $4$（$\text{rem}_4 = \text{cnt}[4] - \text{cnt}[3]$）**：每三个 $4$ 可凑成 $4 + 4 + 4 = 12 \equiv 2 \pmod 5$，每组收益 $+2$；最后剩下的 $\text{rem}_4 \bmod 3$ 个 $4$ 无法再跨周期，每个带来 $-1$ 的净变化。

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
const int MAXL = 0;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

void solve()
{
    int n;
    cin >> n;

    long long cnt[5] = {};
    for (int i = 0; i < n; ++i) {
        int x;
        cin >> x;
        ++cnt[x % 5];
    }

    long long answer = cnt[1] + 2 * cnt[2];

    long long pairs = std::min(cnt[3], cnt[4]);
    answer += 2 * pairs;

    if (cnt[3] > cnt[4]) {
        long long rem3 = cnt[3] - cnt[4];
        answer += (rem3 / 2) - 2 * (rem3 % 2);
    } else {
        long long rem4 = cnt[4] - cnt[3];
        answer += 2 * (rem4 / 3) - (rem4 % 3);
    }

    cout << answer << '\n';
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
- 时间复杂度：$O(N)$，只需遍历一次所有商品并按模 $5$ 余数分类计数。
- 空间复杂度：$O(1)$，仅使用长度为 $5$ 的计数数组。

预估难度：CF 1200（约 1200*）。本题难度由 AI 预估，仅作为参考。
