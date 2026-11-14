# gym106356H Pothchola 题解

## 题意
给定一个包含 $n$（$1 \le n \le 2 \cdot 10^5$）个节点的有向图，每个节点 $i$ 有权值 $a_i$（$0 \le a_i \le 2^{60}$）。对于任意两个不同节点 $u, v$，存在有向边 $u \to v$ 当且仅当 $(a_u \oplus a_v > a_u)$ 且 $(a_u \oplus a_v < a_v)$。你可以从任意节点出发沿有向边移动，求单条路径最多能访问多少个不同的节点。

## 核心思路
**算法类型**：位运算 + 线性DP + 排序（按最高有效位分层 DP）。

分析连边条件 $(a_u \oplus a_v > a_u) \land (a_u \oplus a_v < a_v)$：
- 两个数异或后大小的变化取决于另一个数的**最高有效位（MSB）**在当前数中是否为 $1$。
- 设 $a_u$ 的最高二进制位为 $h(a_u)$，$a_v$ 的最高二进制位为 $h(a_v)$（规定 $a = 0$ 无最高位，且 $0 \oplus x = x$，无法严格小于 $x$，故权值为 $0$ 的点没有任何入边或出边）。
- 若要同时满足 $a_u \oplus a_v > a_u$ 和 $a_u \oplus a_v < a_v$，必须有 $h(a_u) < h(a_v)$，且在 $h(a_u)$ 这一位上：$a_v$ 的第 $h(a_u)$ 位为 $1$（这样 $a_v$ 异或 $a_u$ 后第 $h(a_u)$ 位由 $1$ 变 $0$，使得 $a_u \oplus a_v < a_v$；同时 $a_u$ 异或 $a_v$ 后获得了更高的第 $h(a_v)$ 位 $1$，使得 $a_u \oplus a_v > a_u$）。

因此，$u \to v$ 有边当且仅当：$a_u > 0$，$h(a_u) < h(a_v)$，且 $a_v$ 的二进制第 $h(a_u)$ 位为 $1$。
因为沿着有向边走 $h(a)$ 严格递增，图是一个 DAG，且最长路径长度不超过 $61$：
1. 将数组 $a$ 从小到大排序，跳过所有 $a_i = 0$ 的元素。
2. 设 `f[b]` 表示以最高有效位为 $b$ 的某个节点结尾的最长路径长度。
3. 遍历每个正数 $now = a_i$，记其最高位为 $limit = 63 - \text{clzll}(now)$。枚举所有 $0 \le j < limit$，若 $now$ 的第 $j$ 位为 $1$，则可以从 `f[j]` 转移过来：$cnt = \max(cnt, f[j] + 1)$，最后用 $cnt$ 更新 `f[limit]` 和全局答案 `res`（初始为 $1$，因为至少可以选 $1$ 个起点）。

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
const int INF_INT = INT_MAX - 5;
const LL INF_LL = LONG_LONG_MAX - 5;
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
    LL n;
    cin >> n;

    vector<LL> arr(n, 0);

    for (auto &x : arr) {
        cin >> x;
    }

    std::sort(arr.begin(), arr.end());

    vector<LL> f(64, 0);
    LL res = 1;

    LL p = 0;
    
    while (arr[p] == 0) {
        p ++;
    }

    for (int i = p; i < n; i ++) {
        LL now = arr[i];
        LL limit = 63 - __builtin_clzll(now);
        LL cnt = 1; 
        
        for (int j = 0; j < limit; j ++) {
            if ((now >> j) & 1) cnt = std::max(cnt, f[j] + 1);
        }

        f[limit] = std::max(cnt, f[limit]);
        res = std::max(res, cnt);
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
- 时间复杂度：$O(n \log n + n \log(\max a_i))$，排序耗时 $O(n \log n)$，每个数枚举最多 $60$ 个二进制位。
- 空间复杂度：$O(n)$，用于存储节点权值数组。

预估难度：CF 1400（约 1400*）。本题难度由 AI 预估，仅作为参考。
