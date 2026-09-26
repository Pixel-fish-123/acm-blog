# cf2267C GCD Treasury 题解

## 题意

有 $n$ 堆金币，第 $i$ 堆有 $a_i$ 枚。海盗手里有一个数 $x$，按以下流程偷金币：

- 选一个满足 $a_i > 0$ 且 $\gcd(a_i, x) \ne 1$ 的下标 $i$；没有这样的下标就停止。
- 记 $g = \gcd(a_i, x)$，从第 $i$ 堆偷走 $g$ 枚，$a_i \leftarrow a_i - g$。
- 令 $x \leftarrow g$，继续。

求最多能偷走多少枚金币。

数据范围：$1 \le t \le 10^4$，$1 \le n, x \le 3 \times 10^5$，$1 \le a_i \le 3 \times 10^5$，$\sum n \le 3 \times 10^5$。

## 核心思路

**算法类型**：数论 + 贪心。答案为

$$\max_{p \text{ 为 } x \text{ 的质因子}} \ \sum_{p \mid a_i} a_i,$$

$x = 1$ 时没有质因子，答案为 $0$。

**下界：固定一个质因子 $p \mid x$，能偷走所有 $p$ 的倍数堆。**

只从 $p \mid a_i$ 的堆里偷。若当前 $p \mid x$ 且 $p \mid a_i$，则 $p \mid g$，而 $g > 1$ 合法。偷完后 $x = g$ 仍是 $p$ 的倍数，$a_i - g$ 也仍是 $p$ 的倍数。所以这些堆可以一直偷到全部为 $0$，共偷走 $\sum_{p \mid a_i} a_i$。

**上界：任何偷法都不超过某个质因子对应的和。**

设整个过程依次取到 $g_1, g_2, \ldots, g_T$（$T \ge 1$）。因为 $g_{t+1} = \gcd(a, g_t) \mid g_t$，有 $g_T \mid g_{T-1} \mid \cdots \mid g_1 \mid x$。取 $g_T > 1$ 的一个质因子 $p$，则 $p \mid x$，且 $p$ 整除每个 $g_t$。

对任意被偷过的堆 $i$，第一次偷它时它还是原值 $a_i$，而 $g_t \mid a_i$，所以 $p \mid a_i$。也就是说，只有原值是 $p$ 的倍数的堆会被偷，每堆最多被偷光，总数不超过 $\sum_{p \mid a_i} a_i$。

上下界一致。

**实现。** `divide` 用试除法求出 $x$ 的所有不同质因子（$x \le 3 \times 10^5$ 时至多 $6$ 个），再对每个质因子累加能整除它的 $a_i$，取最大值。

**样例验证。**

- $x = 4$，$a = [2, 3, 4]$：只有 $p = 2$，和为 $2 + 4 = 6$。
- $x = 6$，$a = [9, 9, 4, 4, 4, 4, 4]$：$p = 2$ 时和为 $20$，$p = 3$ 时和为 $18$，答案 $20$。

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

vector<LL> divide(LL x) {
    vector<LL> ret;
    for (int i = 2; i <= x / i; i ++) {
        if (x % i == 0) {
            ret.push_back(i);
            while (x % i == 0) {
                x /= i;
            }
        }
    }
    if (x > 1) ret.push_back(x);
    return ret;
}
void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    LL n, x;
    cin >> n >> x;

    vector<LL> prime = divide(x);

    vector<LL> arr(n + 1, 0);

    for (int i = 1; i <= n; i ++) {
        cin >> arr[i];
    }

    vector<LL> res(prime.size(), 0);

    for (int i = 1; i <= n; i ++) {
        for (int j = 0; j < prime.size(); j ++) {
            if (arr[i] % prime[j] == 0) {
                res[j] += arr[i];
            }
        }
    }

    LL ans = 0;
    for (int i = 0; i < prime.size(); i ++) {
        ans = std::max(res[i], ans);
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

- 时间复杂度：每组数据试除 $O(\sqrt{x})$，累加 $O(n \cdot \omega(x))$，其中 $\omega(x) \le 6$ 为不同质因子个数。总计 $O(t\sqrt{x} + 6\sum n)$，约 $5.5 \times 10^6$ 次运算。
- 空间复杂度：$O(n)$。
- 数值范围：答案最大约 $3 \times 10^5 \times 3 \times 10^5 = 9 \times 10^{10}$，需要 `long long`。
