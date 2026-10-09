# gym106744G Uniform Change 题解

## 题意

有面额为 $1, 2, \ldots, K$ 的纸币各无限张。要找零 $N$，即选出非负整数 $C_1, \ldots, C_K$ 使 $\sum_{i=1}^{K} C_i \cdot i = N$，并让 $\max(C_1, \ldots, C_K)$ 尽量小。输出任意一组最优的 $C_1, \ldots, C_K$（要求 $0 \le C_i \le N$）。

数据范围：$1 \le N \le 10^{18}$，$1 \le K \le 2 \cdot 10^5$。

## 核心思路

**算法类型**：构造 + 贪心。记 $d = \frac{K(K+1)}{2}$，答案的下界是 $\lceil N / d \rceil$；每种面额先各给 $\lfloor N / d \rfloor$ 张，余数用互不相同的面额补齐，从大到小贪心即可凑出，最大值恰好达到下界。

**第一步：下界。**

若 $\max C_i = M$，则 $N = \sum C_i \cdot i \le M \sum i = M d$，所以 $M \ge \lceil N / d \rceil$。

**第二步：构造。**

令 $base = \lfloor N / d \rfloor$，$r = N \bmod d$，先让每个 $C_i = base$，已经凑出 $base \cdot d$，还差 $r < d$。

只要能从 $\{1, \ldots, K\}$ 里选出若干个**互不相同**的数，和恰为 $r$，就把这些面额的 $C_i$ 各加 $1$。这样 $\max C_i = base + [r > 0] = \lceil N / d \rceil$，与下界相等，是最优解。

**第三步：贪心凑余数。**

$i$ 从 $K$ 到 $1$ 枚举，若 $r \ge i$ 就取 $i$、令 $r \leftarrow r - i$。归纳证明最后 $r = 0$：在考虑 $i$ 之前保持 $r \le \frac{i(i+1)}{2}$（初始 $r < d$ 成立）。

- 若 $r \ge i$，取走后 $r - i \le \frac{i(i+1)}{2} - i = \frac{(i-1)i}{2}$；
- 若 $r < i$，则 $r \le i - 1 \le \frac{(i-1)i}{2}$（$i \ge 2$）；$i = 1$ 时 $r < 1$ 即 $r = 0$。

所以每个面额至多多给一张，余数一定能凑齐。

另外 $C_i \le N$ 也满足：$N < d$ 时 $base = 0$，$C_i \le 1 \le N$；否则 $C_i \le base + 1 \le N$。

**样例。** $N = 10$，$K = 3$：$d = 6$，$base = 1$，$r = 4$，贪心取 $3$ 再取 $1$，输出 `2 1 2`。$N = 61$，$K = 7$：$d = 28$，$base = 2$，$r = 5$，取 $5$，输出 `2 2 2 2 3 2 2`，最大值 $3$，与样例答案不同但同样最优（题目允许任意解）。

$d \le 2 \times 10^{10}$，$base \le 10^{18}$，全程用 `long long` 不会溢出。

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
    LL n, k;
    cin >> n >> k;

    LL d = k * (k + 1) / 2;
    LL base = n / d;
    n %= d;

    vector<LL> add(k + 1, 0);
    for (int i = k; i >= 1; i --) {
        if (n >= i) {
            n -= i;
            add[i] ++;
        }
    }

    for (int i = 1; i <= k; i ++) {
        cout << base + add[i] << " ";
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

- 时间复杂度：$O(K)$。
- 空间复杂度：$O(K)$。
