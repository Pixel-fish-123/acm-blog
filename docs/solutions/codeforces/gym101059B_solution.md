---
tags: [贪心, 枚举]
source: "https://codeforces.com/gym/101059/problem/B"
---
# gym101059B Shift and Push 题解

## 题意

给定长度为 $N$ 的数组 $B$，数组 $A$ 一开始全为空。允许两种操作：

1. 把 $B[i]$ 复制到 $A[i]$（代价 $1$）；
2. 把 $B$ 循环右移一位（代价 $1$）。

要求把 $A$ 的每个位置都填成**同一个**值 $X$，且 $X$ 必须是 $B$ 中出现过的元素，求最少操作次数。

$1 \le N \le 10^6$，$1 \le B[i] \le 10^5$。

## 核心思路

**第一步：复制操作恰好 $N$ 次。** 每个位置都必须被复制到一次，而一次复制只能填一个位置，所以任何合法方案的复制次数都恰好是 $N$（多复制只会更差），于是

$$\text{总代价} = N + \text{最少移位次数}.$$

只需对每个候选 $X$ 求出最少移位次数 $s(X)$，答案就是 $N + \min_X s(X)$。

**第二步：把移位次数翻译成"覆盖"。** 设 $P$ 为 $X$ 在 $B$ 中出现的下标集合（$B$ 视作长度为 $N$ 的环）。若当前累计右移了 $r$ 次，则位置 $i$ 上的值是 $B[(i - r) \bmod N]$，因此位置 $i$ **能**被复制的充要条件是 $i - r \in P$（模 $N$ 意义下），即 $i \in P + r$。

**第三步：下界。** 若整个过程一共执行了 $t$ 次移位，由于每次移位只把偏移量改变 $\pm 1$，所有访问过的偏移量都落在环上一条长度不超过 $t + 1$ 的连续弧 $S$ 中。能填的位置必须满足 $i \in P + S$，也就是被若干条"以 $P$ 中的元素为起点、长度为 $|S|$ 的弧"覆盖。

设 $X$ 的相邻两次出现之间最多夹着 $g(X)$ 个非 $X$ 元素。取夹着 $g(X)$ 个非 $X$ 元素的那一对相邻出现，这段长度为 $g(X)$ 的连续空档必须被某条弧完整覆盖，因此 $|S| \ge g(X) + 1$，从而

$$t \ge |S| - 1 \ge g(X).$$

**第四步：上界（构造）。** 从偏移量 $0$ 出发单调右移 $g(X)$ 次，访问偏移量 $0, 1, \dots, g(X)$，移位次数恰为 $g(X)$；在偏移量 $r$ 处，把所有当前等于 $X$ 且尚未填过的位置复制掉。由于 $g(X)$ 是最大间距，任一间距为 $g_j \le g(X)$ 的空档都满足 $g_j + 1 \le |S|$，即相邻两条弧相交或相接，所有位置都会被覆盖。于是每个位置都在某个时刻被填，复制总数恰为 $N$，得到 $s(X) = g(X)$。

综合第三步与第四步：

$$\text{答案} = N + \min_{X \in B} g(X).$$

**第五步：求 $g(X)$。** 把 $B$ 复制一份接到自身后面，得到长度为 $2N$ 的数组（等价于把环展开）。用 $pos[v]$ 记录 $v$ 上一次出现的位置，扫描到位置 $i$ 且 $B[i] = v$ 时，$i - pos[v] - 1$ 就是 $v$ 的某一对相邻出现之间的空档长度，对每个 $v$ 取最大值即得 $g(v)$。由于数组复制了一份，环上"最后一对 $v$ 的相邻出现"（跨越 $N$ 的那一对）也会作为相邻出现被统计到，因此不会漏掉最大空档。最后对所有出现过的 $v$ 取 $\min$。

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
    int n;
    cin >> n;

    vector<int> arr(2 * n + 5, 0);
    vector<int> pos(1e5 + 5, 0);
    vector<int> num_max(1e5 + 5, -1);

    for (int i = 1; i <= n; i ++) {
        cin >> arr[i];
        arr[i + n] = arr[i];
    }

    for (int i = 1; i <= 2 * n; i ++) {
        if (pos[arr[i]] == 0) {
            pos[arr[i]] = i;
        }
        else {
            int len = i - pos[arr[i]] - 1;
            num_max[arr[i]] = std::max(num_max[arr[i]], len);
            pos[arr[i]] = i;
        }
    }

    int res = INF_INT;
    
    for (int i = 1; i <= 1e5; i ++) {
        if (num_max[i] == -1) continue;
        res = std::min(num_max[i], res);
    }

    cout << res + n << endl;

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

## 复杂度

- 时间复杂度：扫描 $2N$ 个位置并对值域取最小值，为 $O(N + V)$，其中 $V = 10^5$ 为 $B[i]$ 的值域。
- 空间复杂度：$O(N + V)$（展开后的数组与按值域的桶）。
