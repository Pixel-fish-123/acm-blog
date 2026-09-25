# cf1748E Yet Another Array Counting Problem 题解

## 题意

定义序列 $x$ 在子段 $[l, r]$ 上的**最左最大值位置**为最小的 $i$（$l \le i \le r$）使得 $x_i = \max(x_l, x_{l+1}, \dots, x_r)$。

给定长度为 $n$ 的数组 $a$，求数组 $b$ 的数量，满足：

- $1 \le b_i \le m$；
- 对所有子段 $[l, r]$（$1 \le l \le r \le n$），$b$ 与 $a$ 在该子段上的最左最大值位置相同。

答案对 $10^9 + 7$ 取模。多组数据：$t \le 10^3$，$2 \le n, m \le 2 \times 10^5$，$1 \le a_i \le m$，$n \cdot m \le 10^6$，且所有测试点满足 $\sum n \cdot m \le 10^6$。

## 核心思路

计数 DP + 单调栈建笛卡尔树。

**第一步：把"所有子段的最左最大值位置"翻译成一棵树。** 对数组按"最左最大值"建大根笛卡尔树：整段的根为 $[1, n]$ 的最左最大值位置，其左侧部分递归为左子树、右侧部分递归为右子树。树上任意两个位置 $l, r$ 的 LCA 恰好就是子段 $[l, r]$ 的最左最大值位置，因此"所有子段的最左最大值位置"与"这棵笛卡尔树的形态"互相唯一确定。于是条件等价于：$b$ 建出的笛卡尔树形态与 $a$ 的完全相同。问题转化为：给定一棵 $n$ 个结点的树形态，往结点里填 $1 \sim m$ 的值，使这棵树的笛卡尔树性质保持不变的方案数。

**第二步：单调栈 $O(n)$ 建树。** 维护栈内下标的 $a$ 值从栈底到栈顶递减的单调栈，从左到右扫描每个 $i$：

- 不断弹出栈顶中 $a$ 值**严格小于** $a_i$ 的下标，最后弹出的下标作为 $i$ 的左儿子；
- 若弹出后栈非空，$i$ 作为新栈顶的右儿子；
- $i$ 入栈。

由于相等时不弹出，值相等的元素中更靠左者成为祖先——这恰好实现了"最左"最大值的优先级。最终栈底元素即全局最左最大值，为根。

**第三步：树上计数 DP。** 两个数组的含义：

- `dp[u][i]`：在 $u$ 的子树内填 $1 \sim m$ 的值、保持笛卡尔树形态不变、且子树最大值（即 $b_u$，因为 $u$ 是子树区间的最左最大值）**不超过 $i$** 的方案数。空子树用下标 $0$ 作哨兵，$dp[0][i] = 1$；非空子树值至少为 $1$，故 $dp[u][0] = 0$。
- `tmp[i]`：转移的中间量，表示 $b_u$ **恰好填 $i$** 的方案数。左子树整个位于 $u$ 的左侧，若其中出现与 $i$ 相等的值，该区间的最左最大值会偏到 $u$ 左边，故左子树最大值须 $\le i - 1$；右子树位于 $u$ 的右侧，即使取到 $i$，$u$ 仍是最左的最大值，故右子树最大值只须 $\le i$。两侧独立，相乘得 $tmp[i] = dp[lson][i-1] \cdot dp[rson][i]$。

由"$b_u$ 恰为 $i$ 的方案数"累加即得"$b_u \le i$ 的方案数"：$dp[u][i] = \sum_{v=1}^{i} dp[lson][v-1] \cdot dp[rson][v]$。若对每个 $i$ 重新求和是每结点 $O(m^2)$；代码先算出 `tmp`，再做一遍前缀和 $dp[u][i] = dp[u][i-1] + tmp[i]$，将单个结点的转移降为两遍 $O(m)$ 的线性扫描。DFS 按后序遍历（先算儿子再算父亲），答案即 $dp[root][m]$。

以样例 1（$a = [1, 3, 2]$，$m = 3$）验证：建树得根为下标 $2$（值 $3$），左儿子 $1$、右儿子 $3$；叶子 $dp[1][i] = dp[3][i] = i$，则 $dp[2][3] = 0 \cdot 1 + 1 \cdot 2 + 2 \cdot 3 = 8$，与样例一致。

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
const LL mod = 1e9 + 7;
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

    int N, M;
    int root = 0;

    cin >> N >> M;

    vector<LL> arr(N + 1, 0);
    vector<vector<LL>> dp(N + 1, vector<LL>(M + 1, 0));
    vector<int> lson(N + 1, 0), rson(N + 1, 0);
    vector<LL> tmp(M + 1, 0);

    for (int i = 1; i <= N; i ++) {
        cin >> arr[i];   
    }

    auto build = [&](void) -> int {
        std::stack<int> stk;
        for (int i = 1; i <= N; i ++) {
            int last = 0;
            while (stk.size() && arr[stk.top()] < arr[i]) {
                last = stk.top();
                stk.pop();
            }

            if (stk.size()) {
                rson[stk.top()] = i;
            }

            lson[i] = last;
            stk.push(i);
        }

        while (stk.size() > 1) stk.pop();
        return stk.top();
    };

    root = build();
    
    for (int i = 0; i <= M; i ++) {
        dp[0][i] = 1;
    }

    auto dfs = [&](auto self, int now) -> void {
        if (now == 0) return;

        // cout << "now : " << now << endl;
        // cout << "lson : " << lson[now] << " " << "rson : " << rson[now] << endl;

        self(self, lson[now]);
        self(self, rson[now]);

        for (int i = 1; i <= M; i ++) {
            tmp[i] = dp[lson[now]][i - 1] * dp[rson[now]][i] % mod;
        }
        for (int i = 1; i <= M; i ++) {
            dp[now][i] = (dp[now][i - 1] + tmp[i]) % mod;
        }
    };

    dfs(dfs, root);

    cout << dp[root][M] << endl;
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

- 时间复杂度：每组数据建树 $O(n)$，DP 每个结点转移 $O(m)$，共 $O(n \cdot m)$；由 $\sum n \cdot m \le 10^6$，总时间 $O(\sum n \cdot m)$。
- 空间复杂度：$O(n \cdot m)$（`dp` 二维表），其余数组 $O(n + m)$。
