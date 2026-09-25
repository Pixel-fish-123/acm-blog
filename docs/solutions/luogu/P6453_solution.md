---
tags: [笛卡尔树, 树形DP, 组合数学]
difficulty: "省选/NOI-"
source: "https://www.luogu.com.cn/problem/P6453"
---
# P6453 [COCI 2008/2009 #4] PERIODNI 题解

## 题意

给定一个由 $n$ 列组成、底部对齐的表格，第 $i$ 列的高度为 $h_i$（即该列从下往上含 $h_i$ 个格子）。要在表格的格子里填入 $k$ 个**相同**的数，满足：

- 任意两个数不在同一**列**；
- 任意两个数不在同一**行**。这里的"行"指**连续的水平段**：若两个处于同一高度的格子之间、每一列都达到了该高度（连成一片、没有断开），则它们算作同一行，不合法；若中间隔着一个较矮的列（该行在此处"断开"），则这两个数即便同高也**合法**。

求合法方案数对 $10^9+7$ 取模。

数据范围：$1\le n,k\le 500$，$1\le h_i\le 10^6$。

## 核心思路

**算法类型**：笛卡尔树（单调栈）+ 树形 DP（背包合并）+ 组合计数（预处理阶乘与阶乘逆元）。

**关键观察：按"高度差"把直方图切成横条。** 题目允许"两个数同高、但中间被更矮的列断开"，这提示我们应当沿高度把表格分层拆解，而不是逐格考虑。

**笛卡尔树分解。** 对列高 $h$ 建一棵**小根堆笛卡尔树**（单调栈 $O(n)$ 构造）：根是整段区间中高度最小的列，其左、右子树递归对应左、右子区间。每个结点 $u$ 对应一段连续的列区间，记 $siz_u$ 为该区间宽度（子树大小）。对结点 $u$（设其父为 $fa$，并令根的父高度 $h_{fa}=0$），它相对父亲**新贡献**的格子恰好是一个 $(h_u-h_{fa})$ 行 $\times\ siz_u$ 列的矩形横条——因为 $h_u$ 是区间最小值，区间内每一列都达到高度 $h_u$。所有结点的横条互不重叠，且正好铺满整张直方图（每个格子归属于"覆盖它的、高度不低于它所在行的那个最低祖先"的横条）。

**为什么左右子树之间不必判行冲突。** 祖先结点的横条永远在后代横条的**下方**（行号区间不相交），故处于"祖先—后代"关系的两列，其数字必然不同行。唯一可能同高的是互为"堂兄弟"的两列（分别落在某结点 $u$ 的左、右子树里），而它们之间正好隔着更矮的列 $u$（即"断开"）——这恰是题目允许的合法情形。于是合并左右子树时**只需保证列互异**，行的区分由横条结构自动保证，无需在左右之间额外判行。

**DP 状态与转移。** 设 $dp[u][i]$ 表示在 $u$ 子树的所有横条里放 $i$ 个数的方案数，边界 $dp[0][0]=1$（空子树）。

1. 先把左、右子树（它们的横条都在高度 $h_u$ 之上）做背包合并：
   $$tmp[p]=\sum_{l+r=p} dp[lson_u][l]\cdot dp[rson_u][r]$$
   表示在 $h_u$ 之上共放了 $p$ 个数。
2. 再在 $u$ 自己这条 $(h_u-h_{fa})$ 行 $\times\ siz_u$ 列的横条里补放 $(i-p)$ 个数：
   - **选列**：要与这 $(i-p)$ 个数彼此不同列，还要避开子树里 $p$ 个数已占用的 $p$ 列，方案数 $C(siz_u-p,\ i-p)$；
   - **选行并放置**：从 $(h_u-h_{fa})$ 行里选出 $(i-p)$ 个不同行、再排列到选定的列上，方案数 $C(h_u-h_{fa},\ i-p)\cdot (i-p)!$。

综合得转移方程：

$$dp[u][i]=\sum_{p=0}^{i} tmp[p]\cdot C(siz_u-p,\ i-p)\cdot C(h_u-h_{fa},\ i-p)\cdot (i-p)!$$

**组合数预处理。** 预处理阶乘 $fac$ 与阶乘逆元 $inv$：先用费马小定理 $inv[\text{MAXL}]=fac[\text{MAXL}]^{mod-2}$，再线性回推 $inv[i]=inv[i+1]\cdot(i+1)$，即可 $O(1)$ 求 $C(n,k)=fac[n]\cdot inv[k]\cdot inv[n-k]$（$k>n$ 时记为 $0$）。上界 $\text{MAXL}=10^6+5$ 覆盖了 $h_u\le 10^6$ 的取值范围。最终答案即 $dp[root][k]$。

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
const LL mod = 1e9 + 7;
const int MAXL = 1e6 + 5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

LL qpow(LL a, LL b) {
    LL res = 1;
    a %= mod;
    while (b) {
        if (b & 1) {
            res = res * a % mod;
        }
        a = a * a % mod;
        b >>= 1;
    }
    return res;
}

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int N, K;
    cin >> N >> K;

    vector<LL> arr(N + 5, 0);
    vector<int> lson(N + 5, 0), rson(N + 5, 0);
    vector<vector<LL>> dp(N + 5, vector<LL>(K + 5, 0));
    vector<int> siz(N + 5, 0);
    vector<LL> fac(MAXL + 5, 0), inv(MAXL + 5, 0);

    for (int i = 1; i <= N; i ++) {
        cin >> arr[i];
    }

    int root = 0;

    fac[0] = fac[1] = inv[0] = 1;

    for (int i = 2; i <= MAXL; i ++) {
        fac[i] = (fac[i - 1] * i) % mod;
    }

    inv[MAXL] = qpow(fac[MAXL], mod - 2);

    for (int i = MAXL - 1; i >= 1; i --) {
        inv[i] = (inv[i + 1] * (i + 1)) % mod;
    }

    auto build = [&](void) -> void {

        std::stack<LL> stk;
        
        for (int i = 1; i <= N; i ++) {
            int last = 0;

            while (stk.size() && arr[stk.top()] > arr[i]) {
                last = stk.top();
                stk.pop();
            }

            if (stk.size()) {
                rson[stk.top()] = i;
            }

            lson[i] = last;
            stk.push(i);
        }

        while (stk.size() > 1) {
            stk.pop();
        }

        root = stk.top();

    };

    build();

    //cout << root << endl;

    dp[0][0] = 1;

    auto C = [&](LL n, LL k) -> LL {
        if (k > n) return 0;
        LL res = (((fac[n] * inv[k]) % mod) * inv[n - k]) % mod;
        return res;
    };

    auto dfs = [&](auto self, int now, int fa) -> void {
        if (now == 0) {
            return;
        }

        self(self, lson[now], now);
        self(self, rson[now], now);

        siz[now] = siz[lson[now]] + siz[rson[now]] + 1;


        vector<LL> tmp(K + 1, 0);

        for (int l = 0; l <= std::min(siz[lson[now]], K); l ++) {
            for (int r = 0; r <= std::min(siz[rson[now]], K - l); r ++) {
                tmp[l + r] = (tmp[l + r] + (dp[lson[now]][l] * dp[rson[now]][r]) % mod) % mod;
            }
        }

        for (int i = 0; i <= std::min(siz[now], K); i ++) {
            for (int p = 0; p <= i; p ++) {
                dp[now][i] = (dp[now][i] + C(siz[now] - p, i - p) * C(arr[now] - arr[fa], i - p) % mod * fac[i - p] % mod * tmp[p] % mod) % mod;
            }
            
        }
    };

    dfs(dfs, root, 0);

    cout << dp[root][K] << endl;
    
    return;
}

int main()
{
    // std::ios::sync_with_stdio(false);
    // cin.tie(nullptr);
    // cout.tie(nullptr);
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

- 时间复杂度：预处理阶乘与阶乘逆元 $O(\text{MAXL})$（$\text{MAXL}=10^6+5$）；单调栈建笛卡尔树 $O(n)$；树形 DP 中每个结点有两层枚举（$i$ 与 $p$），最坏 $O(K^2)$，合计 $O(n\cdot K^2)$。总体 $O(\text{MAXL}+n\cdot K^2)$，当 $n=K=500$ 时约 $1.25\times 10^8$ 量级。
- 空间复杂度：$O(\text{MAXL}+n\cdot K)$，分别为阶乘/逆元数组与 DP 表。
