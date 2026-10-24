# gym105477B Russian Roller Coasters 题解

## 题意
一条过山车由依次相连的 $2l$ 段轨道组成，每段轨道在水平方向前进 $1$ 个单位，在竖直方向上升或下降 $1$ 个单位；轨道不能进入地面以下，并且从地面出发、最终回到地面。公园中拥有所有满足条件的过山车。给定 $l$ 和高度 $h$，求长度为 $2l$、最高点恰好高出地面 $h$ 的过山车数量，答案对 $10^9+7$ 取模。有多组询问：$1\le l,h\le 200$，$1\le t\le 40000$。

## 核心思路
**算法类型**：计数 DP（按步数滚动数组）。

把一条过山车看成从高度 $0$ 出发、每步上升或下降 $1$、全程高度非负、最后回到高度 $0$ 的折线，题目要求这条折线经过的最大高度恰好为 $h$。只记录当前高度无法判断最大高度是否达到 $h$，因此要把历史最大高度也放入状态。

设 $f_i[j][k]$ 表示走了 $i$ 步后，历史最大高度恰为 $j$、当前高度为 $k$ 的走法数，其中 $0\le k\le j\le h$；$i$ 用奇偶两维滚动。第 $i$ 步的转移分三类：

- 下降一步：上一步高度为 $k+1$，且需满足 $k+1\le j$，故 $f_i[j][k]\leftarrow f_{i-1}[j][k+1]$；
- 上升一步但未刷新最大值：上一步高度为 $k-1\ge 0$，故 $f_i[j][k]\leftarrow f_{i-1}[j][k-1]$；
- 上升一步并刷新最大值：只有上一步恰好停在旧最大值 $j-1$ 时才可能，新状态必为 $(j,j)$，故 $f_i[j][j]\leftarrow f_{i-1}[j-1][j-1]$（即代码中 `k == j` 时从 `dp[pre][j - 1][k - 1]` 转移）。

初始 $f_0[0][0]=1$。记 $g[i][j]=f_i[j][0]$，即走了 $i$ 步回到地面、历史最大高度恰为 $j$ 的方案数，则每组询问的答案为 $g[2l][h]$。参考代码按约束上界 $l=h=200$ 一次性预处理出整张 $g$ 表：滚动 DP 维护 $f$，当前高度 $k=0$ 时把方案数写入 $g[i][j]$，询问时直接查表。

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

#define endl '\n' // 交互题记得去掉，加速用

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    LL l = 200, h = 200;

    vector<vector<vector<LL>>> dp(2, vector<vector<LL>>(h + 1, vector<LL>(h + 1, 0)));
    vector<vector<LL>> res(2 * l + 1, vector<LL>(h + 1, 0));

    dp[0][0][0] = 1;

    for (int i = 1; i <= 2 * l; i ++) {
        for (int j = 0; j <= h; j ++) {
            for (int k = j; k >= 0; k --) {
                int pre = (i - 1) & 1;
                int now = i & 1;
                LL tmp = 0;
                if (k + 1 <= j) {
                    tmp = (tmp + dp[pre][j][k + 1] % MOD2) % MOD2;
                }
                if (k - 1 >= 0) {
                    tmp = (tmp + dp[pre][j][k - 1] % MOD2) % MOD2;
                }
                if (k == j && k > 0 && j > 0) {
                    tmp = (tmp + dp[pre][j - 1][k - 1] % MOD2) % MOD2;
                }
                dp[now][j][k] = tmp;

                if (k == 0) {
                    res[i][j] = tmp;
                }
            }
        }
    } 

    int T;
    cin >> T;

    while (T --) {
        int nl, nr;
        cin >> nl >> nr;
        nl *= 2;
        cout << res[nl][nr] << endl;
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
时间复杂度：预处理为 $O(l\cdot h^2)$（循环量约 $2l\cdot h(h+1)/2\approx 8\times 10^6$），每组询问 $O(1)$，总计 $O(l\cdot h^2+t)$。空间复杂度：$O(h^2)$ 的滚动 DP 数组加上 $O(l\cdot h)$ 的答案表。

预估难度：CF 1500（约 1500*）。本题难度由 AI 预估，仅作为参考。
