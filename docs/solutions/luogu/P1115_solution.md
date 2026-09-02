# P1115 最大子段和 题解

## 题意

给出一个长度为 $n$ 的序列 $a$，选出其中**连续且非空**的一段使得这段和最大（$1\le n\le 2\times 10^5$，$-10^4\le a_i\le 10^4$）。

## 核心思路

线性 DP（Kadane 算法）。

设 $dp[i]$ 表示**以第 $i$ 个元素结尾**的最大子段和。对于位置 $i$ 只有两种决策：

- 接在前一段后面：$dp[i]=dp[i-1]+a[i]$；
- 另起一段：$dp[i]=a[i]$（当 $dp[i-1]$ 为负时，带着它只会拖累总和，不如从 $i$ 重新开始）。

两者取较大值：

$$dp[i]=\max(dp[i-1]+a[i],\; a[i])$$

由于最优子段一定以某个位置结尾，答案即为 $\max\limits_{1\le i\le n} dp[i]$。初始化 $dp[1]=a[1]$（子段非空，不能从 $0$ 转移）。

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

## 复杂度

- 时间复杂度：$O(n)$，一次线性扫描完成转移。
- 空间复杂度：$O(n)$（代码中保留了完整的 $dp$ 数组；由于转移只依赖 $i-1$，可滚动变量优化到 $O(1)$）。
