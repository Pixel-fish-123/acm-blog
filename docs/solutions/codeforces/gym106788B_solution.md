# gym106788B Beguiling Your Boss 题解

## 题意
有 $k$ 个货舱（编号 $1 \dots k$）和一份包含 $n$ 次交换操作的工单，第 $t$ 次操作交换货舱 $a_t$ 与 $b_t$ 中的货物。

如果跳过工单中某个连续区间 $[\ell, r]$（$1 \le \ell \le r \le n$）内的所有操作，仅按顺序执行区间外的操作，最终每个货舱里的货物与完整执行全部 $n$ 次操作的结果完全相同，则称区间 $[\ell, r]$ 是冗余的。求共有多少个冗余区间。

数据范围：$1 \le n \le 10^6$，$2 \le k \le 10^6$。

## 核心思路
**算法类型**：哈希 + 随机化 + 排序 + 组合数学。

**前缀置换等价转化**：
记前 $t$ 次操作执行完后，各个货舱中货物的排列状态为置换 $P_t$（初始状态 $P_0$ 为恒等置换 $p[i] = i$）。由于置换的复合满足群的消去律，跳过区间 $[\ell, r]$ 不影响最终结果，当且仅当区间 $[\ell, r]$ 内的操作复合起来恰好是恒等置换，即：
$$P_{\ell - 1} = P_r$$
因此，问题转化为：在 $n+1$ 个前缀排列状态 $P_0, P_1, \dots, P_n$ 中，统计有多少对下标 $(i, j)$ 满足 $0 \le i < j \le n$ 且 $P_i = P_j$。

**随机权值线性哈希维护状态**：
由于 $k \le 10^6$，无法直接存储每次操作后的完整排列，需要用哈希在 $O(1)$ 时间内增量维护排列状态：
1. 为每个位置 $i \in [1, k]$ 独立随机赋一个 64 位无符号整数权值 $w_i$，定义排列 $p$ 的哈希值为：
   $$H(p) = \sum_{i=1}^k w_i \cdot p[i] \pmod{2^{64}}$$
2. 当交换 $p[a]$ 与 $p[b]$ 时，记 $d = p[b] - p[a]$，则哈希值的变化量仅为：
   $$\Delta H = w_a \cdot p[b] + w_b \cdot p[a] - (w_a \cdot p[a] + w_b \cdot p[b]) = (w_a - w_b) \cdot d \pmod{2^{64}}$$
   可以在 $O(1)$ 时间内完成状态与哈希值的更新。

收集全部 $n+1$ 个哈希值 `hashes[0..n]` 后排序，对每一段连续相等、长度为 $c$ 的哈希值，累加上 $\binom{c}{2} = \frac{c(c-1)}{2}$ 即为答案。

这是一项**随机化**实现：代码把哈希相同视作排列相同。若两个不同排列的哈希相等，就会多计答案；但每个位置的权值都是独立生成的 64 位随机数，且哈希在模 $2^{64}$ 下运算，在 $n,k\le 10^6$ 规模下碰撞概率可以忽略。因此上述证明给出的是以极高概率正确的结果，而不是无条件无碰撞的确定性结论。

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
#include <chrono>
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


static ULL rngState = std::chrono::steady_clock::now().time_since_epoch().count() * 0x9E3779B97F4A7C15UL;
static inline ULL rand64() {
    ULL z = (rngState += 0x9E3779B97F4A7C15ULL);
    z = (z ^ (z >> 30)) * 0xBF58476D1CE4E5B9ULL;
    z = (z ^ (z >> 27)) * 0x94D049BB133111EBULL;
    return z ^ (z >> 31);
}

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);

    int n, k;
    cin >> n >> k;

    vector<int> p(k + 1, 0);

    for (int i = 1; i <= k; i ++) {
        p[i] = i;
    }

    vector<ULL> w(k + 1);
    ULL h = 0;

    for (int i = 1; i <= k; i ++) {
        w[i] = rand64();
        h += w[i] * (ULL)i;
    }

    vector<ULL> hashes(n + 1);
    hashes[0] = h;

    for (int t = 1; t <= n; t ++) {
        int a, b;
        cin >> a >> b;
        int d = p[b] - p[a];
        h += (w[a] - w[b]) * (ULL)(LL)d;
        std::swap(p[a], p[b]);
        hashes[t] = h;
    }

    std::sort(hashes.begin(), hashes.end());
    LL ans = 0;

    for (size_t i = 0; i < hashes.size();) {
        size_t j = i;
        while (j < hashes.size() && hashes[j] == hashes[i]) {
            ++ j;
        }
        LL c = (LL)(j - i);
        ans += c * (c - 1) / 2;
        i = j;
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
- 时间复杂度：初始化权值与初始哈希 $O(k)$，$n$ 次交换增量更新哈希 $O(n)$，对 $n+1$ 个哈希值排序并统计相同对数 $O(n \log n)$，总时间复杂度为 $O(k + n \log n)$。
- 空间复杂度：$O(n + k)$。

预估难度：CF 1600（约 1600*）。本题难度由 AI 预估，仅作为参考。
