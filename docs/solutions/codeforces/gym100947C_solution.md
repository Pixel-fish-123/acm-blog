# gym100947C Rotate It !! 题解

## 题意

有一个长为 $N$ 的序列 $A_1, A_2, \dots, A_N$。Dzy 和 Fox 从左到右轮流取数，Dzy 先取：Dzy 取第 $1, 3, 5, \dots$ 个数，Fox 取第 $2, 4, 6, \dots$ 个数。

在开始取数之前，可以把序列旋转任意次（一次旋转是把第一个元素移到末尾）。求 Dzy 取到的数之和的最大值。

数据范围：多组数据；$1 \le N \le 10^4$，$-10^9 \le A_i \le 10^9$。

## 核心思路

**算法类型**：枚举。把序列复制一份接在后面，枚举所有 $N$ 种旋转，对每种旋转直接把 Dzy 取到的数加起来。

**第一步：Dzy 取到哪些数。**

Dzy 一共取 $L = \lceil N / 2 \rceil$ 个数。若旋转后从原序列的第 $s$ 个数开始，Dzy 取到的是环上的第 $s, s + 2, \dots, s + 2(L - 1)$ 个数。

把序列复制一份，令 $A_{i + N} = A_i$，环上的这些位置就变成了倍长数组里一段连续的、间隔为 $2$ 的下标，不用再取模。

**第二步：按「最后一个数的位置」枚举。**

代码枚举 Dzy 取的最后一个数在倍长数组中的下标 $i \in [N, 2N]$，从 $i$ 开始每次往前跳 $2$，共加 $L$ 个数，对应的起点是 $s = i - 2(L - 1)$。

- 下标不会越界：$s \ge N - 2(\lceil N/2 \rceil - 1) \ge 1$。
- 不会漏掉旋转：$i$ 取遍 $N + 1$ 个连续的值，起点 $s$ 也就取遍 $N + 1$ 个连续的值，模 $N$ 覆盖了全部 $N$ 种旋转。

所有旋转的和取最大值就是答案。答案的绝对值最多为 $5 \times 10^3 \times 10^9$，要用 `long long`。数组 `vis` 在代码里只赋值、不读取，不影响结果。

**样例验证。** $A = (1, 5, 3, 2, 4)$，$L = 3$。旋转成 $3, 2, 4, 1, 5$ 时 Dzy 取 $3 + 4 + 5 = 12$，是 $5$ 种旋转里最大的。

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
    vector<LL> arr(2 * n + 1, 0);
    vector<int> vis(2 * n + 1, 0);

    for (int i = 1; i <= n; i ++) {
        cin >> arr[i];
        arr[i + n] = arr[i];
    }

    LL res = - INF_LL;
    LL limit = n / 2 + n % 2;

    for (int i = n; i <= 2 * n; i ++) {
        LL ans = 0;
        LL tot = 0;
        for (int j = i; tot < limit; j -= 2) {
            tot ++;
            vis[j] = 1;
            ans += arr[j];
        }
        res = std::max(res, ans);
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

- 时间复杂度：枚举 $N + 1$ 个终点，每个终点累加 $\lceil N/2 \rceil$ 个数，每组数据 $O(N^2)$，$N = 10^4$ 时约 $5 \times 10^7$ 次加法。
- 空间复杂度：$O(N)$，即倍长数组。
