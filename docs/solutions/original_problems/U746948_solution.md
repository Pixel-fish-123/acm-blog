# U746948 食堂调度方案设计 题解

## 题意
食堂共有 $k$ 个窗口（$1 \le k \le 10$），每个窗口的打饭机器人配有一块容量为 $1$ 格电的电池，初始时全部满电。前 $n$ 个时刻（$1 \le n \le 500$）中，第 $i$ 个时刻有 $a_i$ 名顾客到达（$0 \le a_i \le 100$，$\sum a_i \le 1000$）；第 $n$ 个时刻之后不再有新顾客到达。

每个时刻依次执行：
1. 新到达的顾客加入队尾；
2. 选择本时刻开放的满电窗口数 $m$（$0 \le m \le \min(k, e)$，其中 $e$ 为当前满电窗口数）；
3. 开放的 $m$ 个窗口各服务 $1$ 名顾客（若排队人数不足 $m$，则只服务现有排队顾客），并在下一时刻变为空电；
4. 本时刻**未开放**的 $k - m$ 个窗口在下一时刻全部恢复满电；
5. 若本时刻服务后仍有 $q$ 人留在队列中，则产生 $(k - m) \times q$ 点抱怨度。

当所有顾客均被服务完时食堂停止运营，求最小总抱怨度。

## 核心思路
**算法类型**：线性DP + 枚举（滚动数组维护排队人数与可用满电窗口数）。

观察状态变化规律：
- 若当前时刻开放了 $m$ 个窗口，这 $m$ 个窗口下一时刻没电，而其余 $k - m$ 个未开放窗口下一时刻都会充满电（无论它们当前是否有电），因此**下一时刻的满电窗口数只取决于本时刻开放的窗口数 $m$**，恒为 $e' = k - m$。
- 设总顾客数为 $S = \sum_{i=1}^n a_i \le 1000$。由于每两个时刻至少可以服务 $1$ 名顾客，总运营时刻不会超过 $T = n + 2S + 2$。

因此可以用滚动数组按时刻推进动态规划：
1. **状态定义**：设 `dp[q][e]` 表示当前时刻结束时，队列中剩余 $q$ 名顾客等待（$0 \le q \le S$）、且下一时刻有 $e$ 个满电窗口可用（$0 \le e \le k$）时的最小累计抱怨度。初始状态为第 $0$ 时刻结束时 `dp[0][k] = 0`，其余为 $+\infty$。
2. **状态转移**：在第 $i$ 个时刻（$1 \le i \le T$），令本时刻新到人数为 $\textit{now} = (i \le n ? a_i : 0)$。从上一时刻的每个可达状态 $(q, e)$ 出发：
   - 新顾客加入后排队总人数为 $Q = q + \textit{now}$；
   - 枚举本时刻实际开放并服务顾客的窗口数 $m \in [0, \min(Q, e)]$（开放超过 $Q$ 个窗口既不能多服务人，又会减少下一时刻的满电窗口，但注意当 $q_2 = Q - m = 0$ 时本时刻抱怨度为 $0$，枚举到 $\min(Q, e)$ 即可覆盖所有有效服务决策）；
   - 转移后剩余排队人数为 $q_2 = Q - m$，下一时刻满电窗口数为 $e_2 = k - m$，新的累计抱怨度为 $\textit{next} = \text{cur} + (k - m) \times q_2$；
   - 若此时所有顾客已全部到达且队列清空（$i \ge n$ 且 $q_2 = 0$），食堂停止运营，用 $\textit{next}$ 更新全局最小答案 `res`；否则用 $\textit{next}$ 更新下一时刻的状态 `dp_next[q2][e2]`。

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

    int n, k;
    cin >> n >> k;

    vector<int> arr(n + 1, 0);
    int S = 0;

    for (int i = 1; i <= n; i ++) {
        cin >> arr[i];
        S += arr[i];
    }

    if (S == 0) {
        cout << 0 << endl;
        return;
    }

    int T = n + 2 * S + 2;

    vector<vector<vector<int>>> dp(2, vector<vector<int>>(S + 2, vector<int>(k + 2, INF_INT)));

    dp[0][0][k] = 0;
    int res = INF_INT;

    for (int i = 1; i <= T; i ++) {

        for (int q = 0; q <= S; q ++) {
            for (int e = 0; e <= k; e ++) {
                dp[1][q][e] = INF_INT;
            }
        }

        int now_arr = i <= n ? arr[i] : 0;
        for (int q = 0; q <= S; q ++) {
            for (int e = 0; e <= k; e ++) {
                int cur = dp[0][q][e];
                if (cur >= INF_INT) continue;

                int Q = q + now_arr;
                int max_e = std::min(Q, e);

                for (int m = 0; m <= max_e; m ++) {
                    int q2 = Q - m;
                    int e2 = k - m;
                    int next = cur + (k - m) * q2;

                    if (q2 == 0 && i >= n) {
                        res = std::min(res, next);
                    }
                    else if (next < dp[1][q2][e2]){
                        dp[1][q2][e2] = next;
                    }
                }
            }
        }

        for (int q = 0; q <= S; q ++) {
            for (int e = 0; e <= k; e ++) {
                dp[0][q][e] = dp[1][q][e];
            }
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
- 时间复杂度：$O(T \cdot S \cdot k^2)$，其中 $S = \sum a_i \le 1000$，$T = n + 2S + 2 \le 2502$，$k \le 10$；实际可达状态远少于上界，运行十分迅速。
- 空间复杂度：$O(S \cdot k)$，采用滚动数组只需保存相邻两个时刻的状态。
