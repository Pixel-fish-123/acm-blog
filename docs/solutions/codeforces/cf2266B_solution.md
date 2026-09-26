# cf2266B Three Piles 题解

## 题意

Alice 有 $a$ 颗石子，Bob 有 $b$ 颗，公共堆有 $c$ 颗。两人轮流行动，Alice 先手。每一回合，当前玩家可以从公共堆拿任意颗（可以为 $0$）放进自己的堆。若连续两个回合双方都拿了 $0$ 颗，游戏结束。

设最终 Alice 有 $A$ 颗、Bob 有 $B$ 颗，得分为 $|A - B|$。Alice 想让得分最大，Bob 想让得分最小，双方都采取最优策略，求最终得分。

数据范围：$1 \le t \le 10^4$，$0 \le a, b, c \le 10^9$，需要使用 64 位整数。

## 核心思路

**算法类型**：博弈论 + 贪心。答案为

$$\max\big(|a - b|,\ |a + c - b|\big),$$

也就是 Alice「一颗不拿」和「全部拿走」两种极端策略里较好的那个。

记差值 $D = A - B$，初值 $d = a - b$。Alice 拿石子让 $D$ 变大，Bob 拿石子让 $D$ 变小，两人拿的总数不超过 $c$。

**Alice 至少能拿到 $\max(|d|, |d + c|)$。**

- 第一回合拿走全部 $c$ 颗：公共堆空了，之后双方只能拿 $0$，游戏结束，得分 $|d + c|$。
- 永远只拿 $0$ 颗：只有 Bob 会改变 $D$，而 Bob 每拿一颗 $D$ 就减 $1$。若 $d \le 0$，$D$ 只会越来越负，$|D| \ge |d|$；若 $d > 0$，第一种策略的 $d + c \ge d$ 已经不比它差。

所以 Alice 能保证 $\max(|d|, |d + c|)$。

**Bob 能把得分压到不超过 $\max(|d|, |d + c|)$。**

- 若 $d \ge 0$：无论怎么拿，$D \in [d - c,\ d + c]$，而 $d \ge 0$ 时 $|d - c| \le d + c$，所以 $|D| \le d + c$。
- 若 $d < 0$：Bob 永远只拿 $0$ 颗。这样只有 Alice 改变 $D$，最终 $D = d + x$，$0 \le x \le c$。$|d + x|$ 是关于 $x$ 的凸函数，最大值在端点取到，所以 $|D| \le \max(|d|, |d + c|)$。游戏一定会结束：Alice 每次拿正数颗时公共堆严格减少，一旦她拿 $0$ 颗，Bob 也拿 $0$ 颗，游戏就结束了。

上下界相等，答案即为上式。

**样例验证。**

- $(3, 6, 3)$：$\max(3, 0) = 3$。
- $(3, 6, 10)$：$\max(3, 7) = 7$。
- $(2, 5, 6)$：$\max(3, 3) = 3$。

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
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    LL a, b, c;
    cin >> a >> b >> c;

    LL other = a + c;

    LL abs1 = std::abs(a - b), abs2 = std::abs(other - b);
    
    cout << std::max(abs1, abs2) << endl;
    
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

- 时间复杂度：每组数据 $O(1)$，总计 $O(t)$。
- 空间复杂度：$O(1)$。
- 数值范围：$a + c \le 2 \times 10^9$，超出 `int`，所以用 `long long`。
