# P1435 [IOI 2000] 回文字串 题解

## 题意

给定一个字符串（长度 $0<l\le 1000$，区分大小写），求通过插入字符把它变成回文串所需的最少插入字符数。

## 核心思路

**算法类型**：区间动态规划。

设 $dp[l][r]$ 表示把子串 $s[l..r]$ 变成回文串所需的最少插入数。考察区间两端：

- **两端字符相同**（$s[l]=s[r]$）：两端已经匹配，问题化为内部区间，$dp[l][r]=dp[l+1][r-1]$；
- **两端字符不同**：最终回文串的最外层必须由其中一端与一个新插入的字符配对而成——等价于"舍弃一端，先解决剩余区间，再花 $1$ 次插入补上配对字符"：

  $$dp[l][r]=\min\bigl(dp[l+1][r],\ dp[l][r-1]\bigr)+1$$

边界：长度为 $1$ 的区间本身就是回文，插入数为 $0$；长度为 $2$ 且两端相同时，$dp[l+1][r-1]$ 落在上三角的空区间（数组初始化为 $0$），恰好得到正确值 $0$。

实现上按**区间长度**从小到大枚举（`len` 从 $2$ 到 $N$，左端点 `l` 递增），保证转移时更短的区间已经算好。答案为 $dp[0][N-1]$。

从另一个角度看，最少插入数 $=l-\mathrm{LPS}$（串长减去最长回文子序列长度）——两端不同时"舍弃一端"正对应 LPS 的转移，两种视角等价。

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
// 支持lcm函数
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
    std::string str;
    cin >> str;

    int N = str.size();
    vector<vector<int>> dp(N, vector<int>(N, 0));

    for (int len = 2; len <= N; len ++) {
        for (int l = 0; l < N - len + 1; l ++) {
            int r = l + len - 1;
            if (str[l] == str[r]) {
                dp[l][r] = dp[l + 1][r - 1];
            }
            else {
                dp[l][r] = std::min(dp[l + 1][r], dp[l][r - 1]) + 1;
            }
            //cout << l << " --- " << r << " : " << dp[l][r] << endl;
        }
    }

    cout << dp[0][N - 1] << endl;
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

- 时间复杂度：$O(l^2)$，区间 DP 共 $O(l^2)$ 个状态、每个 $O(1)$ 转移（$l\le 1000$，约 $10^6$ 次转移）。
- 空间复杂度：$O(l^2)$，DP 二维数组。
