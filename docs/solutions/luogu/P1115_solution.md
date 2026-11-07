# P1115 最大子段和 题解

## 题意

给出一个长度为 $n$ 的序列 $a$，选出其中**连续且非空**的一段使得这段和最大（$1\le n\le 2\times 10^5$，$-10^4\le a_i\le 10^4$）。

## 核心思路

**算法类型**：线性DP（Kadane 最大子段和算法）。

设 $dp[i]$ 表示**以第 $i$ 个元素结尾**的非空连续子段的最大和。由于子段必须连续且以位置 $i$ 结尾，考虑是否将位置 $i$ 接在以 $i-1$ 结尾的最优子段之后，只有两种决策：

- **接在前一段后面**：以 $i-1$ 结尾的最大子段和为 $dp[i-1]$，接上 $a_i$ 后得到 $dp[i-1] + a_i$（当 $dp[i-1] > 0$ 时能带来正贡献）；
- **从位置 $i$ 另起一段**：单独取元素 $a_i$（当 $dp[i-1] \le 0$ 时，接上前面的前缀不会使和变大，不如直接从 $i$ 重新开始）。

两者取较大值即得状态转移方程：

$$dp[i]=\max(dp[i-1]+a[i],\; a[i])$$

由于全局最优的非空连续子段必然以某个位置 $i \in [1, n]$ 结尾，最终答案即为 $\max\limits_{1\le i\le n} dp[i]$。初始化 $dp[1]=a[1]$（题目要求子段非空，故不能取空集和 $0$）。

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
#define LL long long
#define ULL unsigned long long
#define pair_int std::pair<int, int>
#define pair_LL std::pair<LL, LL>
const int INF_INT = 0x3f3f3f3f;
const LL INF_LL = 1e18;
const LL mod = 998244353;
const LL MAXL = 0;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int N;
    cin >> N;

    vector<int> dp(N + 1, -INF_INT);
    vector<int> arr(N + 1, -INF_INT);
    int ans = -INF_INT;

    for (int i = 1; i <= N; i ++) {
        cin >> arr[i];
    }

    dp[1] = arr[1];
    ans = arr[1];

    for (int i = 2; i <= N; i ++) {
        dp[i] = std::max(dp[i - 1] + arr[i], arr[i]);
        ans = std::max(ans, dp[i]);
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
    for (int i = 0; i < _; i++)
    {
        solve();
    }
    return 0;
}
```


:::

## 复杂度

- 时间复杂度：$O(n)$，一次线性扫描完成转移。
- 空间复杂度：$O(n)$（代码中保留了完整的 $dp$ 数组；由于转移只依赖 $i-1$，可滚动变量优化到 $O(1)$）。
