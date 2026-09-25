# cf2260C Maximize XOR, Minimize Operations 题解

## 题意

给定两个非负整数 $x, y$。一次操作同时执行两件事：$x \leftarrow x - 1$，$y \leftarrow y + 1$；当 $x = 0$ 时无法操作。

对每一组初始数据，允许执行任意多次（含 $0$ 次）操作。目标是：先让 $x \oplus y$ 尽可能大；在所有能达到这个最大值的方案中，再让操作次数尽可能少。输出「$x \oplus y$ 的最大值」和「达到它所需的最少操作次数」。

输入：第一行 $t$（$1 \le t \le 10^4$），随后 $t$ 行每行两个整数 $x, y$（$0 \le x, y < 2^{29}$）。
输出：每组数据一行两个整数。

样例：

```
输入
3
3 1
0 5
6 4

输出
4 3
5 0
10 4
```

例如 $x = 3, y = 1$：执行 $3$ 次操作后得到 $x = 0, y = 4$，此时 $0 \oplus 4 = 4$ 已经无法更大，且 $3$ 次就是最少次数。

## 核心思路

**第一步：最大值恒等于 $x + y$。**

操作把 $x$ 的一份「$1$」原封不动地搬给 $y$，所以和不变量：

$$x + y = s \quad (\text{任意次操作后都不变})$$

另一方面，对任意非负整数都有

$$x \oplus y = x + y - 2\,(x \mathbin{\&} y) \le x + y,$$

等号成立当且仅当 $x \mathbin{\&} y = 0$，也就是两个数的二进制 $1$ 位完全不相交。

所以只要能把两个数改成「$1$ 位互不相交」的形态，异或值就能取到理论上界 $s$，而这个形态总是做得到的（例如一路把 $x$ 减到 $0$，此时 $x \oplus y = 0 \oplus s = s$）。于是：

- 第一问答案永远是 $s = x + y$；
- 第二问就是求最小的 $k$，使 $k$ 次操作后的两个数 $x - k$ 与 $y + k$ 的 $1$ 位互不相交。

**第二步：把「操作次数」换成「给 $x$ 选一个终值」。**

设 $k$ 次操作后 $x' = x - k = a$，那么 $y' = y + k = s - a$。条件「$a$ 与 $s - a$ 的 $1$ 位不相交」等价于

$$a \mathbin{\&} (s - a) = 0 \iff a \text{ 是 } s \text{ 的按位子掩码，即 } a \mathbin{\&} s = a .$$

理由：若 $a \subseteq s$（$a$ 的每个 $1$ 位在 $s$ 中也是 $1$），则减法 $s - a$ 在二进制下不发生借位，$s - a = s \oplus a$，与 $a$ 天然不相交；反过来，若 $a \mathbin{\&} (s - a) = 0$，则 $a + (s - a) = s$ 的加法没有任何进位，故 $s = a \oplus (s - a)$，也就说明 $a \subseteq s$。

而 $k = x - a$ 随 $a$ 增大而减小，$0 \le k \le x$ 等价于 $0 \le a \le x$。于是问题化为：

> 求不超过 $x$ 的最大的 $s$ 的子掩码 $a^{*}$，第二问答案为 $x - a^{*}$。

**第三步：$a^{*}$ 的形态与最小性证明。**

记 $i$ 为**最高**的满足「$x$ 的第 $i$ 位是 $1$、$s$ 的第 $i$ 位是 $0$」的位。若这样的 $i$ 不存在，说明 $x$ 本身就是 $s$ 的子掩码，直接取 $a^{*} = x$（$0$ 次操作）。

否则取

$$a^{*} = \left\lfloor \frac{x}{2^{i+1}} \right\rfloor \cdot 2^{i+1} + (s \bmod 2^{i}),$$

即：保留 $x$ 在 $i$ 以上的全部位，把第 $i$ 位清零，低 $i$ 位全部照抄 $s$ 的低 $i$ 位。

先验证 $a^{*}$ 合法：

- $a^{*} \subseteq s$：由于 $i$ 是最高冲突位，$x$ 在高于 $i$ 的每一个 $1$ 位在 $s$ 中同样是 $1$；低 $i$ 位直接取自 $s$；第 $i$ 位取 $0$。所以 $a^{*}$ 的每个 $1$ 位都在 $s$ 里。
- $a^{*} \le x$：第 $i$ 位以上与 $x$ 完全相同，而第 $i$ 位是 $0 < 1$，故 $a^{*} < x$。

再证明没有更大的合法值。任取合法解 $a \subseteq s$ 且 $a \le x$：

- 若 $a$ 在第 $i$ 位以上与 $x$ 完全一致：由 $s$ 的第 $i$ 位是 $0$ 与 $a \subseteq s$ 得 $a$ 的第 $i$ 位只能是 $0$，于是高位部分至多贡献 $\lfloor x / 2^{i+1} \rfloor \cdot 2^{i+1}$，低位部分至多 $2^{i} - 1$；又 $a \subseteq s$ 说明 $a$ 的低 $i$ 位是 $s$ 低 $i$ 位的子掩码，故 $a \bmod 2^{i} \le s \bmod 2^{i}$。两者合起来给出 $a \le a^{*}$。
- 若 $a$ 在第 $i$ 位以上存在与 $x$ 不同的位：取其中最高的那一位 $j > i$。由 $a \le x$ 只能是 $x_j = 1, a_j = 0$，此时 $a < \lfloor x / 2^{j+1} \rfloor \cdot 2^{j+1} + 2^{j}$，而 $x_j = 1$ 且 $j > i$ 保证 $\lfloor x / 2^{i+1} \rfloor \cdot 2^{i+1} \ge \lfloor x / 2^{j+1} \rfloor \cdot 2^{j+1} + 2^{j}$，所以同样有 $a < a^{*}$。

因此 $a^*$ 就是最大值，最少操作次数为

$$k_{\min} = x - a^{*} = (x \bmod 2^{i+1}) - (s \bmod 2^{i}) = 2^{i} + (x \bmod 2^{i}) - (s \bmod 2^{i}).$$

**第四步：参考代码的等价写法（从低位到高位的进位模拟）。**

代码并不显式去找 $i$，而是从第 $0$ 位扫到第 $60$ 位，用一个变量 `front` 记录「已经转移到 $y$ 低位上的量」，并维护这样的不变量：

> 处理到第 $i$ 位时，低于 $i$ 的所有位上 $x$ 与 $y$ 没有公共的 $1$ 位（低位已经互不相交），并且 `front` 正好等于当前 $y$ 的低 $i$ 位的值。

逐位分析：

- 第 $i$ 位上 $x, y$ 不同时为 $1$：低位没有新增冲突。若 $y$ 的第 $i$ 位是 $1$ 而 $x$ 的是 $0$，就把这一位记进 `front`，留给后面处理。
- 第 $i$ 位上两个都是 $1$：这就是必须消掉的冲突。此时 $y$ 的低 $i$ 位恰好等于 `front`，给它加上 $2^{i} - \text{front}$ 会让低位部分正好凑成 $2^{i}$，从而向第 $i$ 位进位，把 $y$ 的第 $i$ 位从 $1$ 翻成 $0$（进位还可能继续向更高位传播，那些位留给后面的循环重新判断，所以每次判断读的都是被修改后的 $x, y$）。同时 $x$ 减去同样多：$x$ 的第 $i$ 位被清零，低位加上 `front` 后仍与 $y$ 的低位（此时全为 $0$）不相交。`res` 累加这次的增量，`front` 归零。
- $2^{i} - \text{front}$ 也是让这一位冲突消失的最小代价：任何更小的增量都无法让 $y$ 的低位部分越过第 $i$ 位，第 $i$ 位的冲突会原样留着，之后总还得补上这笔增量；结合第三步的结论，循环累加出来的 `res` 正是全局最小值。

循环结束时所有位都不冲突，$x$ 的值就是 $a^{*}$，而 `res` 恰好是每次从 $x$ 减掉的量之和，即 $x_{\text{原}} - a^{*}$。输出 `x + y`（恒等于 $s$）与 `res` 即为答案。

位宽方面：$0 \le x, y < 2^{29}$，故 $s < 2^{30}$，而「搬运」只会让 $y$ 向上进位、不会凭空多出高于 $s$ 最高位的位，代码扫 `MAXL = 61` 位绰绰有余。

**样例验证。**

- $(3, 1)$：$s = 4 = (100)_2$，$x = 3 = (011)_2$。最高的「$x$ 为 $1$、$s$ 为 $0$」的位是 $i = 1$，$a^{*} = 4 \bmod 2 = 0$，$k = 3 - 0 = 3$，输出 `4 3`。
- $(0, 5)$：$x = 0$ 本身就是 $s = 5$ 的子掩码，$a^{*} = 0$，$k = 0$，输出 `5 0`。
- $(6, 4)$：$s = 10 = (1010)_2$，$x = 6 = (0110)_2$，最高冲突位是 $i = 2$，$a^{*} = 10 \bmod 4 = 2$，$k = 6 - 2 = 4$，输出 `10 4`。此时 $x' = 2 = (010)_2$，$y' = 8 = (1000)_2$，$2 \mathbin{\&} 8 = 0$，确实取到了 $s = 10$。

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
const LL mod = 998244353;
const int MAXL = 61;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

LL pow2[MAXL];

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    LL x, y;
    LL front = 0;
    LL res = 0;
    cin >> x >> y;

    for (int i = 0; i < MAXL; i ++) {
        int l = (x >> i) & 1;
        int r = (y >> i) & 1;
        if (l == r && r == 1) {
            LL sub = pow2[i] - front;
            res += sub;
            x -= sub;
            y += sub;
            front = 0;
        }
        else front |= (r << i);
    }

    cout << x + y << " " << res << endl;
    return;
}

int main()
{
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cout.tie(nullptr);
    int _ = 1;
    cin >> _;
    
    pow2[0] = 1;
    for (int i = 1; i < MAXL; i ++) {
        pow2[i] = pow2[i - 1] * 2;
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

- 时间复杂度：每组数据固定循环 $61$ 位，每次常数操作，总计 $O(61t)$；$t \le 10^4$ 时约 $6 \times 10^5$ 次基本运算，2s 时限内非常宽松。
- 空间复杂度：$O(1)$（只用常数个变量；预处理表 `pow2` 仅 $61$ 个元素，与输入规模无关）。
- 数值范围：$s < 2^{30}$，`res` $\le x < 2^{29}$，中间的 `sub` $< 2^{61}$，全程在 `long long` 内不会溢出。
