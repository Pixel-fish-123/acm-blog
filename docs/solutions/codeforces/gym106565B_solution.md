# gym106565B 排考场 题解

## 题意

要安排 $N$ 名学生。有 $M$ 间教室，第 $i$ 间为 $R_i$ 行 $C_i$ 列的矩形座位（每座至多一人）。

每间教室内，学生只能坐在若干整列上（一列可坐满 $R_i$ 人）。该教室的**列间距**定义为：

- 若只用了一列，视为 $+\infty$；
- 否则为任意两相邻「被使用列」之间空出的未使用列数的最小值。

要求所有学生都入座，最大化「所有教室列间距的最小值」。输出该最大可能值。

数据范围：$1 \le N \le 10^9$，$1 \le M \le 10^5$，$1 \le R_i, C_i \le 10^9$，保证 $\sum R_i < N$ 且 $\sum R_i C_i \ge N$（因此答案有限，且总能排下）。

## 核心思路

**算法类型**：二分 + 贪心（判定列间距下的最大容量）。

最大化最小值，对答案 $t$（最小列间距）二分。

若要求列间距至少为 $t$，则相邻使用列之间至少隔 $t$ 个空列，等价于以 $t+1$ 为周期取列。$C$ 列的教室最多能使用

$$
\left\lceil \frac{C}{t+1} \right\rceil
$$

列，从而最多坐

$$
R \cdot \left\lceil \frac{C}{t+1} \right\rceil
$$

人。对所有教室求和，若总量 $\ge N$ 则 $t$ 可行。

$\lceil C/(t+1) \rceil$ 可用整数运算 $C/(t+1) + [C \bmod (t+1) \ne 0]$ 实现。二分下界 $0$、上界取 $10^9$（由 $\sum R_i < N$，不可能全体只开一列，答案不会真正到无穷大）。单调性显然：间距要求越严，容量越小。

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
    LL n, m;
    cin >> n >> m;

    vector<pair_LL> class_room;

    for (int i = 0; i < m; i ++) {
        LL R, C;
        cin >> R >> C;
        class_room.push_back({R, C});
    }

    auto check = [&](LL t) -> bool {
        LL ans = 0;
        for (int i = 0; i < class_room.size(); i ++) {
            LL r = class_room[i].first, c = class_room[i].second;
            ans += c / (1 + t) * r;
            if (c % (1 + t) > 0) ans += r;
            if (ans >= n) return true;
        }

        return false;
    };


    LL l = 0, r = 1e9, res = 0;
    while (l <= r) {
        LL mid = l + (r - l) / 2;
        if (check(mid)) {
            res = mid;
            l = mid + 1;
        }
        else {
            r = mid - 1;
        }
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

- 时间复杂度：二分约 $30$ 次，每次判定遍历 $M$ 间教室，总 $O(M \log V)$，其中 $V = 10^9$。
- 空间复杂度：$O(M)$。
