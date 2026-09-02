# P11769 歌唱练习 题解

## 题意

天依制定了长为 $n$ 天的练习计划，每天的练习时长必须**单调不降**，第 $i$ 天最多练 $t_i$ 个单位时间，第 $i$ 天每练一个单位时间熟悉度提升 $w_i$（可能为负）。求熟悉度提升的最大量（$1\le n\le 10^6$，$0\le t_i\le 10^9$，$-1000\le w_i\le 1000$）。

## 核心思路

**算法类型**：按"练习层数"分解 + 后缀最小值 / 后缀和预处理。

**第一步：单调性转化为后缀限制**。设第 $i$ 天实际练 $d_i$ 个单位，约束为 $d_1\le d_2\le\cdots\le d_n$ 且 $d_i\le t_i$。由单调性，$d_i\le d_j\le t_j$ 对所有 $j\ge i$ 成立，故

$$d_i\le \min(t_i,t_{i+1},\dots,t_n)$$

对 $t$ 做**后缀最小值**得到 $\mathrm{cap}_i=\min(t_{i..n])}$，它天然单调不降，是每个位置"有效上限"的精确刻画。

**第二步：按层数分解**。把方案 $d$ 看成若干"层"的叠加：第 $h$ 层（$h\ge 1$）表示"每天至少练 $h$ 个单位"的部分。由 $d$ 单调不降，第 $h$ 层一旦在位置 $s$ 被激活，之后每天都保持激活——即**每层恰好占据一个后缀 $[s,n]$**。

- **层的约束**：第 $h$ 层占用后缀 $[s,n]$ 需要 $\mathrm{cap}_s\ge h$（后缀上每天的上限都不低于 $h$）；
- **层的收益**：第 $h$ 层在 $[s,n]$ 上的收益为后缀和 $S_s=w_s+w_{s+1}+\cdots+w_n$。

**第三步：逐层取最优**。对第 $h$ 层，合法起点 $s$ 是任意满足 $\mathrm{cap}_s\ge h$ 的位置，收益取所有合法起点的最大后缀和，即 $M_i=\max(S_i,S_{i+1},\dots,S_n)$（$\mathrm{cap}$ 单调不降，$h$ 能从位置 $i$ 开始当且仅当 $\mathrm{cap}_i\ge h$ 且 $\mathrm{cap}_{i-1}<h$）。层可选不激活，故贡献为 $\max(0,M_i)$。

**汇总**：位置 $i$ 新解锁的层数为 $\mathrm{cap}_i-\mathrm{cap}_{i-1}$（约定 $\mathrm{cap}_0=0$），这些层的最优单位收益都是 $M_i$，因此

$$\mathrm{res}=\sum_{i=1}^{n}\bigl(\mathrm{cap}_i-\mathrm{cap}_{i-1}\bigr)\cdot\max(0,\,M_i)$$

以样例验证：$t=[3,2,3]$，$w=[2,-1,1]$。$\mathrm{cap}=[2,2,3]$（后缀最小值），$S=[2,0,1]$，$M=[2,1,1]$；$\mathrm{res}=2\times 2+0\times 1+1\times 1=5$，与样例一致（第 $1,2$ 层从第 $1$ 天开始收益各 $2$，第 $3$ 层只能从第 $3$ 天开始收益 $1$）。

答案最大可达约 $10^{18}$ 量级，需用 `long long`。

## 参考代码

```cpp
#include <cmath>
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
#define LL long long
#define ULL unsigned long long
#define pair_int std::pair<int, int>
#define pair_LL std::pair<LL, LL>
const int INF_INT = 0x3f3f3f3f;
const LL INF_LL = 1e18;
const LL mod = 998244353;
const LL MAXL = 0;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

void solve() {
    int n;
    if (!(cin >> n)) return;

    vector<LL> t(n + 2, 0);
    vector<LL> w(n + 2, 0);
    vector<LL> S(n + 2, 0); 
    vector<LL> M(n + 2, -2e18); 

    for (int i = 1; i <= n; i++) cin >> t[i];
    for (int i = 1; i <= n; i++) cin >> w[i];

    LL min_val = INF_LL;
    for (int i = n; i >= 1; i--) {
        min_val = std::min(min_val, t[i]);
        t[i] = min_val;
    }

    for (int i = n; i >= 1; i--) {
        S[i] = S[i + 1] + w[i];
    }

    M[n + 1] = -2e18; 
    for (int i = n; i >= 1; i--) {
        M[i] = std::max(S[i], M[i + 1]);
    }

    LL res = 0;
    for (int i = 1; i <= n; i++) {
        LL gain = M[i];
        if (gain > 0) {
            res += (t[i] - t[i - 1]) * gain;
        }
    }

    cout << res << endl;
}

int main()
{
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cout.tie(nullptr);
    int _ = 1;
    // cin >> _;
    for (int i = 0; i < _; i++)
    {
        solve();
    }
    return 0;
}
```

## 复杂度

- 时间复杂度：$O(n)$，三次后缀扫描加一次汇总。
- 空间复杂度：$O(n)$，存放 $\mathrm{cap}$、$S$、$M$ 三个数组。
