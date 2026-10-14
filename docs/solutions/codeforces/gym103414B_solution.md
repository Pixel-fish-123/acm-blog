# gym103414B Guess the Array 题解

## 题意
交互题。有一个长度为 $n$ 的隐藏数组（$1 \le n \le 10^4$，$|a_i| \le 10^9$）。每次可询问 `? l r` 得到区间和 $s$，同时交互器给出一个新的封锁区间 $[l_b, r_b]$，此后不能再询问被封锁的区间。至多询问 $n$ 次，然后输出 `!` 和整个数组。

## 核心思路
**算法类型**：交互 + 构造，用前缀和逐个还原元素。

先问 `? 1 n` 得到总和 `ans`，然后从左到右依次确定 $a_1, a_2, \dots, a_{n-1}$，最后 $a_n = \text{总和} - \sum_{j<n} a_j$。每个 $a_i$ 只花一次询问，加上第一次共 $n$ 次，刚好不超限。

确定 $a_i$ 时（$a_1 \dots a_{i-1}$ 已知）：

- **方法一**：找一个没被封锁的区间 $[l, i]$，问出它的和 $c$，则 $a_i = c - \sum_{j=l}^{i-1} a_j$。代码让 $l$ 从 $i$ 往左枚举，`pre` 累加 $a_l \dots a_{i-1}$，遇到第一个没被封锁的 $[l, i]$ 就问。
- **方法二**：如果 $[1,i], [2,i], \dots, [i,i]$ 这 $i$ 个区间全被封锁，就问 $[i+1, n]$，得到 $a_i = \text{总和} - c - \sum_{j<i} a_j$（`pre_arr` 是前缀和）。

**为什么方法二的区间一定可问**：处理 $a_i$ 之前已经问过 $1 + (i-1) = i$ 次，所以一共只有 $i$ 个封锁区间。若 $[1,i] \dots [i,i]$ 这 $i$ 个已全被封锁，就没有封锁名额留给 $[i+1, n]$ 了（它的右端点是 $n \ne i$，和前面这些区间不同）。所以两种方法总有一种能用，整个过程不会碰到封锁区间。

**效率**：对固定的 $i$，往左扫过的每个 $l$（除最后一个）都对应一个已被封锁的 $[l, i]$，而封锁区间总共不超过 $n$ 个，所以所有 $i$ 的扫描总步数是 $O(n)$ 次 `map` 查询。

细节：总和最大约 $10^{13}$，询问返回值最多 $10^{18}$，全程用 `long long`；`endl` 自带刷新，满足交互要求；$n = 1$ 时只问 `? 1 1`，直接得到 $a_1$。

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
const int MAXL = 1e4 + 5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;

std::map<pair_int, int> ban;
LL arr[MAXL];
LL ans = 0;
LL pre_arr = 0;
int n;

LL ask(int l, int r) {
    cout << "? " << l << " " << r << endl;
    LL c, l1, r1;
    cin >> c >> l1 >> r1;
    ban[{l1, r1}] = 1;
    return c;
}

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    cin >> n;

    for (int i = 1; i <= n; i ++) {
        arr[i] = INF_LL;
    }

    ans = ask(1, n);

    for (int i = 1; i < n; i ++) {
        LL pre = 0;
        for (int l = i; l >= 1; l --) {
            if (arr[l] != INF_LL) pre += arr[l];
            if (ban.count({l, i}) == 0) {
                LL c = ask(l, i);
                arr[i] = c - pre;
                break;
            }
        }

        if (arr[i] == INF_LL) {
            LL c = ask(i + 1, n);
            arr[i] = ans - c - pre_arr;
        }
        pre_arr += arr[i];
    }

    arr[n] = ans - pre_arr;

    cout << "! ";

    for (int i = 1; i <= n; i ++) {
        cout << arr[i] << " ";
    }
    cout << endl;

    return;
}

int main()
{
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
询问恰好 $n$ 次。枚举总步数 $O(n)$，每步一次 `map` 查询，时间 $O(n \log n)$；空间 $O(n)$。
