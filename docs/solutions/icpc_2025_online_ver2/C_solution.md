---
tags: [网络流, 二分图]
---
# C Jiaxun! 题解

## 题意

共有 $S$ 道待解决的题，按"哪几名队员能做"分成七类，各类题数依次记作 $F_1..F_7$（七类之和恰为 $S$）。类别编号 $i$ 的二进制位指明可做该题的人：第 $0$ 位是队员 A、第 $1$ 位是 B、第 $2$ 位是 C。

| 类别 | 二进制 | 能做的人 |
| --- | --- | --- |
| $F_1$ | $001$ | 仅 A |
| $F_2$ | $010$ | 仅 B |
| $F_3$ | $011$ | A、B |
| $F_4$ | $100$ | 仅 C |
| $F_5$ | $101$ | A、C |
| $F_6$ | $110$ | B、C |
| $F_7$ | $111$ | A、B、C |

每道题必须完整交给一名能做的队员。求一种分配，使得**做题最少的队员**做的题数尽量多，输出这个最大值。共 $T$ 组数据，$S$ 与 $F_i$ 需按 $64$ 位整数处理。

## 核心思路

**算法类型**：Hall 定理（带容量的二分图匹配）/ 网络流最小割。因为队员一侧只有 $3$ 个人，全部约束可以枚举成闭式，不必真的建图或二分。

### 第一步：写成判定问题

设"每人至少做 $x$ 道"是否可行。这是带下界的运输问题：源点向 $7$ 个类别点连容量 $F_i$ 的边，类别 $i$ 向其包含的队员点连无限容量边，队员点向汇点连"流量至少 $x$"的边。

### 第二步：写出 Hall 型必要条件

对队员的非空子集 $T$，$T$ 内的人每人至少 $x$ 道，故 $T$ 总共至少承接 $x|T|$ 道；而某道题若它的可选人集合与 $T$ 不相交，$T$ 内没人能做它。记

$$g(T)=\sum_{i\cap T\neq\varnothing}F_i$$

为"$T$ 内的人有可能做的题目总数"，则必须有

$$x\cdot|T|\ \le\ g(T)\qquad(\forall\,\varnothing\neq T\subseteq\{A,B,C\})$$

$T$ 只有 $7$ 个，逐一代入恰好得到代码里的 $7$ 项上界：

- $|T|=1$（单人能做的总量 $m$，即代码中的 `m[j]`）：$x\le m_A=F_1+F_3+F_5+F_7$、$x\le m_B=F_2+F_3+F_6+F_7$、$x\le m_C=F_4+F_5+F_6+F_7$；
- $|T|=2$（两人的可选人并集只能覆盖除"只剩第三人"以外的题）：$2x\le S-F_1$（$T=\{B,C\}$）、$2x\le S-F_2$（$T=\{A,C\}$）、$2x\le S-F_4$（$T=\{A,B\}$）；
- $|T|=3$：$3x\le S$。

### 第三步：这些条件也充分

上述网络是整数容量的，由最大流最小割定理，"每人流量 $\ge x$"可行的充要条件就是所有割的容量足够；把割展开后，真正起作用的只有形如 $x|T|\le g(T)$ 的这些不等式（类别点一侧没有下界，不会产生额外约束）。条件成立时最大流取整数值，即每类题分给各人的数量都是整数，直接对应一种合法分配。

于是答案就是七个上界里最紧的那个（$x$ 为整数，每条 $c\,x\le R$ 给出 $x\le\lfloor R/c\rfloor$，取整与取 $\min$ 可以交换）：

$$x=\min\left(m_A,\ m_B,\ m_C,\ \left\lfloor\frac{S-F_1}{2}\right\rfloor,\ \left\lfloor\frac{S-F_2}{2}\right\rfloor,\ \left\lfloor\frac{S-F_4}{2}\right\rfloor,\ \left\lfloor\frac{S}{3}\right\rfloor\right)$$

代码里 `m[j]` 用位运算一次累加（`(1 << j) & i` 判断类别 $i$ 是否含第 $j$ 个人），后四项依次 `std::min`，`LL` 的除法自动向下取整。

### 小例子

$F_1=6$、$F_6=6$、其余为 $0$，$S=12$。三个 $m$ 都是 $6$，$\lfloor S/3\rfloor=4$，但 $T=\{B,C\}$ 给出 $2x\le S-F_1=6$，即 $x\le 3$：$F_1$ 那 $6$ 道只有 A 能做，只能压给 A，剩下 $F_6$ 的 $6$ 道由 B、C 平分，最少的这个人做 $3$ 道，答案 $3$。

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
    LL S;
    cin >> S;

    vector<LL> arr(8, 0);
    vector<LL> m(3, 0);

    for (int i = 1; i <= 7; i ++) {
        cin >> arr[i];
        for (int j = 0; j < 3; j ++) {
            if ((1 << j) & i) {
                m[j] += arr[i];
            }
        }
    }

    LL res = *min_element(m.begin(), m.end());

    res = std::min(res, (S - arr[1]) / 2);
    res = std::min(res, (S - arr[2]) / 2);
    res = std::min(res, (S - arr[4]) / 2);
    res = std::min(res, S / 3);

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
    for (int i = 0; i < _; i ++)
    {
        solve();
    }
    return 0;
}
```

## 复杂度

- 时间复杂度：每组数据 $O(1)$——读入 $8$ 个数，累加 $m$ 时做 $7\times3=21$ 次位判断，其余是常数次取 $\min$；$T$ 组共 $O(T)$。
- 空间复杂度：$O(1)$，两个长度分别为 $8$ 和 $3$ 的数组。
