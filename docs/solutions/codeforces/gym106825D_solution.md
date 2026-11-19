# gym106825D Energetic Cook 题解

## 题意
厨师 Monocarp 在连续 $n$（$1 \le n \le 2 \cdot 10^5$）天里经营餐厅，第 $i$ 天有 $a_i$（$0 \le a_i \le 10^9$）名顾客，每位顾客需要一份汤或一份饺子：
- **做一份汤**消耗 $1$ 点体力，保质期至**第二天**（第 $i$ 天做的汤只能在第 $i$ 天或第 $i + 1$ 天供应）；
- **做一份饺子**消耗 $2$ 点体力，可以**无限期保存**（第 $i$ 天做的饺子可在第 $j \ge i$ 的任意一天供应）。

Monocarp 每天开始时固定拥有 $E$ 点体力（当天未用完的体力无法留到次日）。求能够满足所有顾客需求的最小每日体力 $E$。

## 核心思路
**算法类型**：二分 + 贪心（按保质期优先级消耗与奇偶微调储备）。

随着每日体力上限 $E$ 的增大，可行的供应方案单调增加，满足单调性，因此可以**二分答案** $E \in [0, 10^9 + 5]$。

对于固定的每日体力 $E$，按天从左到右贪心模拟检验（维护前一天留下的汤 `s` 和累计囤积的饺子 `d`）：
1. **当天供应优先级（先消耗快过期的，再消耗当天低成本的，最后动用永久储备）**：
   - **第一优先用昨天的隔夜汤 `s`**：因为 `s` 今天不用完就会作废，没有任何保留价值；
   - **第二优先用今天的体力现做现喝的汤**：消耗 $1$ 点体力即可满足 $1$ 人（花在今天比做成隔夜汤或饺子都不亏，且如果今天留着体力做隔夜汤而动用库存饺子，相当于把永久保质期的饺子换成了仅限明天的隔夜汤，灵活性严格变差）；
   - **第三优先动用之前囤积的饺子 `d`**：若隔夜汤加今天全部体力现做的汤仍不够，只能用库存饺子补足（在今天花 $2$ 点体力现包饺子显然不如花 $1$ 点体力现做汤）。若此时仍有缺口，则当前 $E$ 不可行。
2. **当天剩余体力 `remain` 的最优分配**：
   满足当天顾客后，剩余体力 `remain = E - c` 可用于为明天预制隔夜汤（最多有效预制 `next_s = min(remain, a[i + 1])` 份，做多了明天也喝不完），其余体力全部用来包饺子（每 $2$ 点体力包 $1$ 份）：
   - **奇偶微调细节**：若 `remain - next_s` 为**奇数**，说明包完饺子后还会白白浪费 $1$ 点体力。此时只要 `next_s >= 1`，就应当少做 $1$ 份隔夜汤（`next_s--`），腾出这 $1$ 点体力与原本浪费的 $1$ 点体力合起来**多包 $1$ 份饺子**——用“只能明天喝的 $1$ 份汤”换取“明天及以后任意一天都能吃的 $1$ 份饺子”，在同样能覆盖明天需求的同时还延长了保质期，严格更优。

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
    vector<LL> arr;
    int n;
    cin >> n;

    arr.assign(n + 1, 0);
    for (int i = 1; i <= n; i ++) {
        cin >> arr[i];
    }

    auto check = [&](LL E) -> bool {
        LL s = 0; // yesterday_soup
        LL d = 0; // dumpling
        for (int i = 1; i <= n; i ++) {
            LL need = arr[i];
            LL t = std::min(s, need); need -= t;
            LL c = std::min(E, need); need -= c;
            if (need > 0) {
                t = std::min(d, need);
                need -= t;
                d -= t;
            }
            if (need > 0) return false;
            LL remain = E - c;
            if (i + 1 <= n) {
                LL next_s = std::min(remain, arr[i + 1]);
                if ((remain - next_s) & 1) next_s = std::max(0LL, next_s - 1);
                d += (remain - next_s) / 2;
                s = next_s;
            }
        }
        return true;
    };

    LL lo = 0, hi = 1e9 + 5, ans = -1;

    while (lo <= hi) {
        LL mid = (lo + hi) >> 1;
        if (check(mid)) {
            ans = mid;
            hi = mid - 1;
        }
        else {
            lo = mid + 1;
        }
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
    for (int i = 0; i < _; i ++)
    {
        solve();
    }
    return 0;
}
```


:::

## 复杂度
- 时间复杂度：$O(n \log(\max a_i))$，二分上下界跨度约为 $10^9$，每次 `check` 线性扫描 $n$ 天。
- 空间复杂度：$O(n)$，用于存储每天的顾客数量数组。

预估难度：CF 1600（约 1600*）。本题难度由 AI 预估，仅作为参考。
