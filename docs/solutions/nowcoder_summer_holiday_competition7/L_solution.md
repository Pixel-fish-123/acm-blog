# L Bobo and Modulo 题解

## 题意

对 $1 \le a,b \le n$ 的有序对计数，满足：

$$(a \bmod b) + 1 = a \bmod (b+1)$$

其中 $n \le 10^{12}$，答案可能很大（需 64 位整数）。

## 核心思路

**算法类型**：数论（中国剩余定理）+ 按 $b$ 枚举。

### 第一步：排除 $a < b$ 的情况

若 $a < b$，则 $a \bmod b = a$，且 $a \bmod (b+1) = a$，等式变为 $a + 1 = a$，矛盾。故只需考虑 $a \ge b$。

### 第二步：化简同余条件

设 $a = qb + r$，其中 $q \ge 1$，$0 \le r \le b-1$（$r = a \bmod b$）。代入等式：

$$qb + r \equiv r + 1 \pmod{b+1} \iff qb \equiv 1 \pmod{b+1}$$

由于 $b \equiv -1 \pmod{b+1}$，两边乘 $b$（$b$ 与 $b+1$ 互素，可逆）：

$$-q \equiv 1 \pmod{b+1} \iff q \equiv -1 \pmod{b+1}$$

即 $q = (b+1)t - 1$，$t \ge 1$。于是：

$$a = b\big((b+1)t - 1\big) + r = b(b+1)t - b + r$$

### 第三步：中国剩余定理视角

固定 $b$ 后，条件等价于同余方程组

$$a \equiv r \pmod b,\qquad a \equiv r+1 \pmod{b+1}$$

**为什么"恰好一个解"**：因为 $\gcd(b, b+1) = 1$，两个模数互素，由中国剩余定理，任意给定右侧的余数对，系统在模 $b(b+1)$ 下恰有一个解；且不同 $r$ 对应不同解——第一条同余在模 $b$ 下就不同了，模 $b(b+1)$ 下更不可能相同。

**解可以直接"猜"出来**：由第二步 $a = b(b+1)t - b + r$，移项得 $a \equiv r - b \pmod{b(b+1)}$。验证它确实满足原方程组：

- 模 $b$：$r - b \equiv r$ ✓（恰好是第一条）；
- 模 $b+1$：因为 $b \equiv -1$ 得 $-b \equiv 1$，所以 $r - b \equiv r+1$ ✓（恰好是第二条）。

两条同余都满足，而 CRT 保证解唯一，故 $a \equiv r - b \pmod{b(b+1)}$ 就是那个唯一解。再把负剩余规范到 $[0, b(b+1))$（加上 $b(b+1)$）：

$$a \equiv r - b + b(b+1) = b^2 + r \pmod{b(b+1)}$$

**例**（$b = 2$，模 $6$）：$r = 0$ 时解 $a \equiv 4$（$4 \bmod 2 = 0$，$4 \bmod 3 = 1$ ✓）；$r = 1$ 时解 $a \equiv 5$（$5 \bmod 2 = 1$，$5 \bmod 3 = 2$ ✓）。

故固定 $b$ 时，合法的 $a$ 的剩余类恰为 $b$ 个连续整数：

$$a \equiv b^2,\ b^2+1,\ \dots,\ b(b+1)-1 \pmod{b(b+1)}$$

### 第四步：计数公式

对固定 $b$，在 $[1, n]$ 内满足 $a \bmod b(b+1) \ge b^2$ 的 $a$ 的数量为：

$$\mathrm{cnt}(b) = \Big\lfloor \frac{n}{b(b+1)} \Big\rfloor \cdot b + \max\!\Big(0,\ n \bmod b(b+1) - b^2 + 1\Big)$$

（每完整周期 $b(b+1)$ 内恰有 $b$ 个合法剩余类 $b^2 \sim b(b+1)-1$，末尾不完整周期中剩余类 $b^2, b^2+1, \dots$ 各有贡献。）

### 第五步：枚举上界

合法的 $a$ 满足 $a \equiv b^2 + r \pmod{b(b+1)}$，最小取 $a = b^2 \ge b^2$（$t=1, r=0$）。因此 $b^2 \le n$，即 $b \le \lfloor \sqrt n \rfloor \le 10^6$。按 $b$ 从 $1$ 到 $\lfloor \sqrt n \rfloor$ 枚举并累加即可。

> 边界检查：$a = b$（即 $q=1$）时需 $b + 1 \mid 2$，只有 $b = 1, a = 1$，已被 $b=1$ 的计数覆盖（$a$ 取奇数）。$a \ge b$ 的假设也由 $b^2 \ge b$ 保证（$b \ge 1$ 时成立）。

### 补充：同余式的基本性质

**记法**：$a \equiv b \pmod m$ 即 $m \mid (a-b)$，等价于 $a$、$b$ 除以 $m$ 余数相同。

**加减乘可以直接做**（对两边同时操作）：

- 加减：$a \equiv b \pmod m \Rightarrow a \pm c \equiv b \pm c \pmod m$；
- 乘常数：$a \equiv b \pmod m \Rightarrow ac \equiv bc \pmod m$；
- 两式相乘：$a \equiv b,\ c \equiv d \pmod m \Rightarrow ac \equiv bd \pmod m$（由此可反复自乘，指数运算也合法）；
- 模数取约数：$a \equiv b \pmod m \Rightarrow a \equiv b \pmod d$（$d \mid m$）。

**除法（消去公因子）有条件**：$ac \equiv bc \pmod m$ 不能直接推出 $a \equiv b \pmod m$。

- 反例：$2 \times 3 \equiv 2 \times 0 \pmod 6$（$6 \equiv 0$），但 $3 \not\equiv 0 \pmod 6$——模数与 $c$ 不互素时信息会丢失。
- 消去法则：

$$\gcd(c, m) = 1 \ \Longrightarrow\ ac \equiv bc \pmod m \ \Rightarrow\ a \equiv b \pmod m$$

（$c$ 与模数互素时可两边同时"除以" $c$，本质是两边乘以 $c$ 的乘法逆元 $c^{-1}$。）

- 一般情形：设 $g = \gcd(c, m)$，则 $ac \equiv bc \pmod m \Rightarrow a \equiv b \pmod{m/g}$（模数同时除以 $g$）。例：$2x \equiv 4 \pmod 6$，$g = 2$，得 $x \equiv 2 \pmod 3$。

**本题中的应用**：推导中的两步恰好对应上述两类操作——

1. **两边减 $r$**（加减法合法）：$qb + r \equiv r+1 \pmod{b+1} \Rightarrow qb \equiv 1 \pmod{b+1}$；
2. **两边消 $b$**（除法）：$\gcd(b, b+1) = 1$，$b$ 在 $\bmod b+1$ 下可逆，且 $b \equiv -1$，所以 $qb \equiv 1 \Rightarrow q \equiv -1 \pmod{b+1}$。

简记：**加减乘任意，消因子必须保证互素，否则模数要跟着除以最大公因数。**

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

    LL N;
    cin >> N;

    LL ans = 0;

    for (LL b = 1; b * b <= N; b ++) {
        LL m = b * (b + 1);
        ans += (N / m) * b;
        LL rem = N % m;
        if (rem >= b * b) ans += rem - b * b + 1;
    }

    cout << ans << endl;
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

- **时间**：$O(\sqrt n) \approx 10^6$ 次枚举，常数极小。
- **空间**：$O(1)$。
- 答案上界约 $1.3 \times 10^{13}$，`long long` 可容纳；$b \le 10^6$ 时 $b(b+1)$ 不会溢出。
