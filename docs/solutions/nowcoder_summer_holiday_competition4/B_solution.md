# B Quadratic Residue 题解

## 题意

多组数据（$T \le 10^4$），每组给定一个整数 $p$（$2 \le p \le 10^9$）。要求构造三个正整数 $x_1$、$x_2$、$q$，满足：

- $1 \le x_1 < q$，$1 \le x_2 < p$；
- $x_1^2 \equiv p \pmod q$；
- $x_2^2 \equiv q \pmod p$；

其中 $q$ 还需满足 $1 \le q \le 10^{12}$。若存在，输出 $x_1$、$x_2$、$q$；否则输出 "Impossible"。

## 核心思路

构造题（数论外衣，实为模运算恒等式）。

两个条件互相纠缠（第一个式子含 $q$ 的模，第二个式子含 $p$ 的模），直接分别构造很困难，先做对称化：令 $x_1 = x_2 = x$，让同一个 $x$ 的平方同时满足两个同余式：

$$
x^2 \equiv p \pmod q, \qquad x^2 \equiv q \pmod p
$$

翻译成整除语言即为：

$$
q \mid (x^2 - p), \qquad p \mid (x^2 - q)
$$

最直接的构造是令 $x^2 = p + q$，即 $q = x^2 - p$：

- $x^2 - p = q$，显然 $q \mid (x^2 - p)$ ✓；
- $x^2 - q = p$，显然 $p \mid (x^2 - q)$ ✓。

于是问题转化为：**枚举平方根 $x$，令 $q = x^2 - p$，检查边界条件**。取 $x_1 = x \bmod q$、$x_2 = x \bmod p$，由同余传递性，两个模等式自动成立，只需补齐以下边界条件：

1. **$q \ge 2$**：因为要求 $1 \le x_1 < q$，所以 $q$ 至少为 $2$。$q = x^2 - p \ge 2$ 即 $x^2 \ge p + 2$，代码中先用 `while (x * x <= p + 1) x++;` 把 $x$ 抬到满足 $x^2 > p + 1$ 的最小值，保证 $q \ge 2$；
2. **$q \le 10^{12}$**：枚举上限为 $x^2 \le 10^{12}$（对应代码中 `limit = 1e12` 的循环边界），此时 $q = x^2 - p < x^2 \le 10^{12}$；
3. **$x_1 \ge 1$，即 $x \bmod q \ne 0$**：若 $x$ 是 $q$ 的倍数，则 $x_1 = 0$，不满足 $1 \le x_1$；
4. **$x_2 \ge 1$，即 $x \bmod p \ne 0$**：若 $x$ 是 $p$ 的倍数，则 $x_2 = 0$，不满足 $1 \le x_2$。

$x_1 = x \bmod q < q$、$x_2 = x \bmod p < p$ 由取模本身自动满足。从小到大枚举 $x$，找到第一个同时满足上述边界条件的 $x$ 即为答案；枚举到上限仍未找到则输出 "Impossible"。

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
const LL limit = 1e12;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    LL p;
    cin >> p;
    
    LL x = sqrt(1 + p);
    bool ok = false;

    while (x * x <= p + 1) x ++;

    while (x * x <= limit) {
        LL q = x * x - p;
        if (x % p != 0 && x % q != 0) {
            cout << x % q << " " << x % p << " " << q << endl;
            ok = true;
            break;
        }
        x ++;
    }

    if (!ok) cout << "Impossible" << endl;
    
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

- 时间复杂度：$x$ 从约 $\sqrt{p}$ 枚举到 $\sqrt{\text{limit}} \approx 10^6$，每测试点最坏 $O(\sqrt{\text{limit}}) \approx 10^6$ 次枚举，实际中满足条件的 $x$ 出现得很早，远小于该上界；
- 空间复杂度：仅使用常数个变量，$O(1)$。

## 小结

```
还是太吃直觉了，这就是我们XCPC最喜欢出的猜猜乐（笑）
```
