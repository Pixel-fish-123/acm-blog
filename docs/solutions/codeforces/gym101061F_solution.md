# gym101061F Fairness 题解

## 题意

有 $n$ 枚硬币，第 $i$ 枚面值为 $a_i$。按顺序分 $n$ 步，第 $i$ 步把第 $i$ 枚硬币交给 Dwik 或 Samir 之一。

记 $x_i$ 为第 $i$ 步之后两人金额之差的绝对值，一种分法的不公平度为 $\max(x_1, x_2, \dots, x_n)$。求不公平度的最小值。

数据范围：多组数据；$1 \le n \le 100$，$1 \le a_i \le 100$。

## 核心思路

**算法类型**：线性DP。以「当前差值的绝对值」为状态，逐枚硬币转移，维护到目前为止出现过的最大差值的最小可能值。

**第一步：状态只需记录差值的绝对值。**

两个人的地位是对称的：差值为 $d$ 和 $-d$ 时，后续所有选择一一对应，得到的 $x$ 序列完全相同。所以只需记 $j = |\text{Dwik} - \text{Samir}| \ge 0$。

设当前差值为 $p$，下一枚硬币面值为 $a$，给其中一人后新差值为 $p + a$ 或 $|p - a|$。

**第二步：差值不必超过 $100$。**

有一种简单分法能保证每一步的差值都不超过 $\max a_i$：每次把硬币给当前钱少的人。若之前的差值 $p \le \max a_i$，新差值为 $|p - a| \le \max(p, a) \le \max a_i$，归纳即得。

所以最优解的不公平度不超过 $\max a_i \le 100$，最优分法中每一步的差值也都不超过 $100$，状态 $j$ 只需开到 $[0, 100]$。

**第三步：转移方程。**

令 $f[i][j]$ 表示分完前 $i$ 枚硬币、当前差值为 $j$ 时，$\max(x_1, \dots, x_i)$ 的最小值。初值 $f[0][0] = 0$，其余为 $+\infty$。

反过来看：第 $i$ 步后差值为 $j$，上一步差值 $p$ 必须满足 $j = p + a_i$ 或 $j = |p - a_i|$，解出来 $p$ 只可能是

- $p = |j - a_i|$（对应 $p + a_i = j$，或 $p = a_i - j$ 时的 $|p - a_i| = j$）；
- $p = j + a_i$（对应 $|p - a_i| = j$）。

新的最大值是旧的最大值与本步差值 $j$ 取较大者，于是

$$f[i][j] = \min\Big( \max\big(f[i-1][\,|j - a_i|\,],\ j\big),\ \max\big(f[i-1][\,j + a_i\,],\ j\big) \Big),$$

下标超过 $100$ 的那一项直接舍去。答案为 $\min_{0 \le j \le 100} f[n][j]$。

**样例验证。** 第二组 $a = (4, 5, 6, 1, 1, 3, 4)$：$x_1 = 4$ 必然成立；$x_2 \in \{1, 9\}$，取 $1$ 后 $x_3 \in \{5, 7\}$，所以不公平度至少为 $5$。取差值序列 $4, 1, 5, 4, 3, 0, 4$ 正好得到 $5$，与输出一致。

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
    int n;
    cin >> n;

    vector<int> arr(n + 1, 0);

    for (int i = 1; i <= n; i ++) {
        cin >> arr[i];
    }

    vector<vector<int>> f(n + 1, vector<int>(105, INF_INT));

    f[0][0] = 0;

    for (int i = 1; i <= n; i ++) {
        for (int j = 0; j <= 100; j ++) {
            int pre = std::abs(j - arr[i]);
            int lst = j + arr[i];
            int next = INF_INT, next2 = INF_INT;
            if (pre <= 100) {
                next = std::max(f[i - 1][pre], j);
            }
            if (lst <= 100) {
                next2 = std::max(f[i - 1][lst], j);
            }
            f[i][j] = std::min(next, next2);
        }
    }

    int res = INF_INT;
    for (int i = 0; i <= 100; i ++) {
        res = std::min(f[n][i], res);
    }

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


:::

## 复杂度

- 时间复杂度：每组数据有 $n \times 101$ 个状态，每个状态 $O(1)$ 转移，共 $O(n \cdot V)$，其中 $V = 100$ 为差值上界。
- 空间复杂度：$O(n \cdot V)$，即 `f` 数组的大小。
