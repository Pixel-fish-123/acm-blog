# cf2260C Maximize XOR, Minimize Operations 题解

## 题意

给定两个非负整数 $x, y$。一次操作令 $x \leftarrow x - 1$，同时 $y \leftarrow y + 1$；$x = 0$ 时不能操作。

可以做任意多次（含 $0$ 次）操作。要求先让 $x \oplus y$ 尽可能大，在此前提下让操作次数尽可能少。输出 $x \oplus y$ 的最大值和对应的最少操作次数。

数据范围：$1 \le t \le 10^4$，$0 \le x, y < 2^{29}$。

## 核心思路

**算法类型**：位运算 + 构造。先用不变量确定最大值，再从低位到高位逐位消除 $x, y$ 的公共 $1$ 位。

**第一步：最大值一定是 $x + y$。**

每次操作都是从 $x$ 拿走 $1$ 加到 $y$ 上，所以 $s = x + y$ 始终不变。又有恒等式

$$x \oplus y = x + y - 2\,(x \mathbin{\&} y) \le s,$$

当且仅当 $x \mathbin{\&} y = 0$（两数没有公共的 $1$ 位）时取等号。一直操作到 $x = 0$ 时有 $0 \oplus s = s$，说明上界能取到。所以第一问答案是 $s$，第二问就是求最小的 $k$，使得 $(x - k) \mathbin{\&} (y + k) = 0$。

**第二步：把条件改写成只和 $x$、$s$ 有关。**

设操作后变成 $x', y'$，并且 $x' + y' = s$。若 $x', y'$ 的低 $i$ 位没有公共 $1$，那么低 $i$ 位相加不会进位，于是：

- $x'$ 与 $y'$ 的低 $i$ 位拼起来（按位或）正好等于 $s \bmod 2^i$；
- 第 $i$ 位上，$x'_i + y'_i$ 不带进位，所以「$x'_i = y'_i = 1$」等价于「$x'_i = 1$ 且 $s_i = 0$」。

也就是说，从低位往高位看时，第一处冲突出现在 $x'$ 为 $1$ 而 $s$ 为 $0$ 的位置。

**第三步：每遇到一个冲突位，花最小的代价把它消掉。**

代码从第 $0$ 位扫到高位，扫到第 $i$ 位时维持：低 $i$ 位已无冲突，变量 `front` 等于当前 $y$ 的低 $i$ 位。

若第 $i$ 位冲突（$x_i = y_i = 1$），令

$$\text{sub} = 2^i - \text{front}, \qquad x \leftarrow x - \text{sub}, \qquad y \leftarrow y + \text{sub}.$$

- 对 $y$：低 $i$ 位从 `front` 变成 $2^i$，全部清零并向第 $i$ 位进 $1$，第 $i$ 位由 $1$ 变 $0$（进位可能继续往上走，后面的循环会重新检查）。
- 对 $x$：$x - 2^i + \text{front}$ 相当于把第 $i$ 位清零、低 $i$ 位加上 `front`。由于原来低位不相交，这里的加法不进位。根据第二步，新的低 $i$ 位正好是 $s \bmod 2^i$。

所以一次消冲突的效果是：**$x$ 高于 $i$ 的位不变，第 $i$ 位变成 $0$，低 $i$ 位变成 $s$ 的低 $i$ 位**。这些低位都是 $s$ 的 $1$ 位，之后不会再在低位产生冲突。

如果少加一点，$y$ 的低位凑不到 $2^i$，第 $i$ 位不会进位，冲突仍在；所以 $\text{sub}$ 就是消掉这一位的最小代价。

**第四步：结果就是「不超过 $x$ 的最大的 $s$ 的子掩码」。**

最终状态满足 $x' \mathbin{\&} y' = 0$，加法 $x' + y' = s$ 不进位，所以 $x'$ 是 $s$ 的子掩码（记作 $x' \subseteq s$）。反过来，若 $a \subseteq s$，则 $s - a$ 不借位，$a$ 与 $s - a$ 不相交。又因为 $k = x - x'$，所以最少次数对应

$$a^{*} = \max\{\, a : a \subseteq s,\ a \le x \,\}, \qquad \text{答案} = x - a^{*}.$$

记 $i$ 为**原始** $x$ 中最高的「$x_i = 1, s_i = 0$」位（不存在时 $a^{*} = x$，答案为 $0$）。由第三步，每次消冲突只改动第 $i$ 位及以下，所以循环里最后一次、也是最高位的那次消冲突发生在这个 $i$，最终

$$a^{*} = \underbrace{x \text{ 在第 } i \text{ 位以上的部分}}_{\text{不变}} + 0 \cdot 2^i + (s \bmod 2^i).$$

它确实是最大的：任取 $a \subseteq s$、$a \le x$，从高位往下比较 $a$ 与 $x$，设第一处不同的位为 $j$，则 $x_j = 1, a_j = 0$。

- 若 $j < i$：$a$ 在第 $i$ 位与 $x$ 相同，即 $a_i = 1$，但 $s_i = 0$，与 $a \subseteq s$ 矛盾。
- 若 $j > i$：$a^{*}$ 在第 $j$ 位上仍是 $1$，所以 $a < a^{*}$。
- 若 $j = i$：高位相同，而 $a$ 的低 $i$ 位是 $s$ 低 $i$ 位的子掩码，不超过 $s \bmod 2^i$，所以 $a \le a^{*}$。

代码中的 `res` 累加了所有 $\text{sub}$，也就是 $x$ 总共减少的量 $x - a^{*}$。

**样例验证。**

- $(3, 1)$：$s = 4 = (100)_2$，$x = (011)_2$，最高冲突位 $i = 1$，$a^{*} = 0$，答案 `4 3`。
- $(0, 5)$：$x = 0 \subseteq 5$，答案 `5 0`。
- $(6, 4)$：$s = 10 = (1010)_2$，$x = (0110)_2$，最高冲突位 $i = 2$，$a^{*} = 10 \bmod 4 = 2$，答案 `10 4`。此时 $x' = 2, y' = 8$，$2 \oplus 8 = 10$。

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

- 时间复杂度：每组数据固定扫描 $61$ 位，总计 $O(61\,t)$，约 $6 \times 10^5$ 次基本运算。
- 空间复杂度：$O(1)$，只用常数个变量和长度为 $61$ 的 `pow2` 表。
- 数值范围：$s < 2^{30}$，`res` $\le x < 2^{29}$，全程在 `long long` 范围内。
