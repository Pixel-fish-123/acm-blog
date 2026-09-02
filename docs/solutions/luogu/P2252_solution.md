# P2252 【模板】威佐夫博弈 / [SHOI2002] 取石子游戏 题解

## 题意

有两堆石子。两人轮流取，每次要么在任意一堆中取走任意多颗，要么在两堆中同时取走相同数量的石子，取完全部石子者胜。给定初始两堆数目 $a,b$（$a,b\le 10^9$），你先手且双方采取最优策略，判断你是胜者还是败者（胜输出 $1$，败输出 $0$）。

## 核心思路

**算法类型**：威佐夫博弈（Wythoff Game）结论 + 整数化判定。

**必败态（P-position）的形态**：设 $\varphi=\dfrac{1+\sqrt5}{2}$（黄金分割比），威佐夫博弈的必败态恰为

$$\bigl(\lfloor k\varphi\rfloor,\ \lfloor k\varphi\rfloor+k\bigr),\quad k=0,1,2,\dots$$

即两堆差为 $k$ 时，较小堆必须恰为 $\lfloor k\varphi\rfloor$。先手面对必败态输出 $0$，否则输出 $1$。正确性基于 Beatty 序列定理：$\varphi$ 与 $\varphi^2=\varphi+1$ 的倒数和为 $1$，序列 $\{\lfloor k\varphi\rfloor\}$ 与 $\{\lfloor k\varphi^2\rfloor\}=\{\lfloor k\varphi\rfloor+k\}$ 恰好无重复地划分全体正整数——由此可证任何操作都会离开必败态集合，而任何非必败态都能一步回到必败态。

**避免浮点误差的整数判定**：先令 $a\le b$，记 $k=b-a$。"$a=\lfloor k\varphi\rfloor$" 等价于

$$a\le k\varphi<a+1\ \Longleftrightarrow\ 2a-k\le k\sqrt5<2a+2-k\ \Longleftrightarrow\ (2a-k)^2\le 5k^2<(2a+2-k)^2$$

三个平方数都用 `long long` 精确计算（$a\le 10^9$ 时最大约 $4\times 10^{18}$，仍在 `long long` 范围内），完全规避 $\sqrt5$ 的精度问题。满足不等式组即处于必败态，输出 $0$；否则输出 $1$。

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
// 支持lcm函数
#define LL long long
#define ULL unsigned long long
#define pair_int std::pair<int, int>
#define pair_LL std::pair<LL, LL>
const int INF_INT = 0x3f3f3f3f;
const LL INF_LL = 1e18;
const LL mod = 998244353;
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
    LL a, b;
    cin >> a >> b;

    if (a > b) std::swap(a, b);

    LL k = b - a;
    LL l = (a * 2 - k) * (a * 2 - k);
    LL m = 5 * k * k;
    LL r = ((a + 1) * 2 - k) * ((a + 1) * 2 - k);
    if (l <= m && m < r) cout << 0 << endl;
    else cout << 1 << endl;

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

## 复杂度

- 时间复杂度：$O(1)$。
- 空间复杂度：$O(1)$。
