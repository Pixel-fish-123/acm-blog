# gym106603F Knapsack One Million 题解

## 题意
有 $n$ 种筹码（除样例 $n=10$ 外均有 $n=10^6$），每种筹码有体积 $s_i$ 和价值 $v_i$，且每种筹码数量充足（可视作无穷多）。测试数据保证所有 $s_i, v_i$ 均在 $[1, n]$ 内独立均匀随机生成。

对于每个背包容量 $i = 1, 2, \dots, n$，求所选筹码总体积不超过 $i$ 时能获得的最大总价值。

## 核心思路
**算法类型**：背包DP + 贪心 + 概率期望（随机数据下的单调栈/前缀最大值剪枝）。

由于每种筹码数量充足（至少 $10^6$ 个，且体积 $\ge 1$、背包最大容量为 $n=10^6$），问题本质上是容量为 $1 \dots n$ 的完全背包问题。直接对 $n$ 种物品做完全背包的时间复杂度为 $O(n^2)$，无法通过，需要利用随机数据性质筛选出真正有用的物品：

1. **同体积去重**：对于相同体积 $w$ 的筹码，显然只需保留价值最大的一个，记为 $\text{wtv}[w]$（若无该体积的筹码则为 $0$）。
2. **前缀最大值剪枝**：若存在两个体积 $w_1 < w_2$ 且满足 $\text{wtv}[w_1] \ge \text{wtv}[w_2]$，那么选一个体积为 $w_2$ 的筹码永远不如选一个体积为 $w_1$ 的筹码划算（体积更小且价值不降）。因此，按体积从 $1$ 到 $n$ 扫描，只需保留满足 $\text{wtv}[w]$ **严格刷新前缀最大值**的筹码。
3. **有效物品数分析**：由于每个筹码的体积和价值在 $[1, n]$ 中独立均匀随机生成，按体积从小到大排列后，只看出现过的体积，其最大价值序列同样具有随机对称性。长度为 $k \le n$ 的随机序列中，前缀严格最大值的期望个数为调和级数 $H_k = \sum_{i=1}^k \frac{1}{i} = O(\ln n)$（当 $n=10^6$ 时，期望有效物品数不超过 $15$ 个）。

筛出这 $O(\log n)$ 个有效筹码后，直接跑标准的一维完全背包 DP：
$$dp[j] = \max(dp[j], dp[j - u] + v)$$
最后做一遍前缀最大值 $dp[i] = \max(dp[i], dp[i - 1])$，依次输出 $dp[1 \dots n]$ 即可。

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

    int n;
    cin >> n;

    vector<LL> wtv(n + 5, 0);
    vector<LL> dp(n + 5, 0);

    for (int i = 0; i < n; i ++) {
        LL w, v;
        cin >> w >> v;
        wtv[w] = std::max(v, wtv[w]);
    }

    vector<pair_LL> items;

    int m = 0;
    items.push_back({1, wtv[1]});

    for (int i = 2; i <= n; i ++) {
        if (wtv[i] <= items[m].second) continue;
        items.push_back({i, wtv[i]});
        m = items.size() - 1;
    }

    for (auto [u, v] : items) {
        for (int j = u; j <= n; j ++) {
            dp[j] = std::max(dp[j], dp[j - u] + v);
        }
    }

    for (int i = 1; i <= n; i ++) {
        dp[i] = std::max(dp[i], dp[i - 1]);
        cout << dp[i] << " ";
    }

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
- 时间复杂度：筛选有效物品为 $O(n)$；随机数据下有效物品个数期望为 $O(\log n)$，完全背包转移期望总复杂度为 $O(n \log n)$。
- 空间复杂度：$O(n)$，用于存储同体积最大价值数组与 DP 数组。

预估难度：CF 1600（约 1600*）。本题难度由 AI 预估，仅作为参考。
