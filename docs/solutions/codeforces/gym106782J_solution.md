# gym106782J Janitor's Cart 题解

## 题意
走廊一端（位置 $0$）是楼梯口，走廊上依次有 $n$ 间办公室，第 $i$ 间办公室位于距离楼梯口 $i$ 米处，存有 $a_i$ 份题面。

推车每次从楼梯口空车出发，最多可装载 $c$ 份题面，收集完后返回楼梯口卸货（同一间办公室的题面可以分多次运走，单次行程也可以收集多间办公室的题面）。求将所有题面运回楼梯口所需的最少总路程。

数据范围：$1 \le n \le 2 \times 10^5$，$1 \le c \le 10^9$，$0 \le a_i \le 10^6$。

## 核心思路
**算法类型**：贪心 + 前缀和（后缀和按段拆贡献）。

每次优先去拿**距离最远**的剩余题面是最优的贪心策略：因为既然推车已经走到了远处的位置 $x$，返程顺路把沿途（$< x$）的题面塞满推车不会增加任何额外路程。

为了直接算出总路程，不妨按走廊的每一段单位区间 $[i-1, i]$（$1 \le i \le n$）统计它被推车往返经过了多少次：
- 位于位置 $i, i+1, \dots, n$ 的办公室共有 $\text{suf}_i = \sum_{j=i}^n a_j$ 份题面；
- 这些题面要全部运回位置 $0$，都必须跨过区间 $[i-1, i]$；
- 推车每次最多运 $c$ 份，因此至少需要 $\left\lceil \frac{\text{suf}_i}{c} \right\rceil$ 次行程到达 $\ge i$ 的位置，每次行程都会在 $[i-1, i]$ 上一去一回贡献 $2$ 米路程。

而在上述「从远到近装满推车」的贪心策略下，除了最后一次深入到 $\ge i$ 的行程外，其余每次经过 $[i-1, i]$ 的行程装载的都是满载 $c$ 份来自 $\ge i$ 的题面，恰好取到下界 $\left\lceil \frac{\text{suf}_i}{c} \right\rceil$。因此最小总路程为：
$$2 \sum_{i=1}^n \left\lceil \frac{\text{suf}_i}{c} \right\rceil$$
从后往前扫一遍维护后缀和 $\text{suf}$ 并累加即可。

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
    LL c;
    cin >> n >> c;

    vector<LL> arr(n + 1, 0);

    for (int i = 1; i <= n; i ++) {
        cin >> arr[i];
    }

    LL suf = 0, ans = 0;

    for (int i = n; i >= 1; i --) {
        suf += arr[i];
        ans += suf / c + (suf % c != 0);
    }

    cout << 2 * ans << endl;
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
- 时间复杂度：从后往前线性扫描一次，时间复杂度为 $O(n)$。
- 空间复杂度：$O(n)$。

预估难度：CF 1100（约 1100*）。本题难度由 AI 预估，仅作为参考。
