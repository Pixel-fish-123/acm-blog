---
tags: [博弈论, 数论]
difficulty: "NOI/NOI+/CTS"
source: "https://www.luogu.com.cn/problem/P6487"
---
# P6487 [COCI 2010/2011 #4] HRPA 题解

## 题意

有 $n$ 枚石子（$2\le n\le 10^{15}$）。Mirko 先取，第一次可以取走任意多个；之后每次至少取 $1$ 个、至多取上一次取数的 $2$ 倍且不超过剩余数，取走最后一枚者胜。双方最优策略下，求 Mirko 保证获胜**第一次最少要取多少**。

## 核心思路

**算法类型**：Fibonacci Nim（斐波那契博弈）+ 齐肯多夫（Zeckendorf）定理。

**结论**：本题的必败态恰是**斐波那契数**；当 $n$ 不是斐波那契数时，先手的最优（也是最少）首次取数是 $n$ 的**齐肯多夫表示中最小的那个斐波那契数**。

齐肯多夫定理：任意正整数都能唯一表示成若干**互不相邻**的斐波那契数之和（使用 $1,2,3,5,8,\dots$ 这套下标）。核心引理是

$$2F_k<F_{k+2}$$

（由 $F_{k+2}=F_{k+1}+F_k$ 且 $F_{k+1}>F_k$ 立得）。取走最小项 $F_{a_k}$ 后：

- 对手下一手至多取 $2F_{a_k}<F_{a_k+2}\le F_{a_{k-1}}$（齐肯多夫表示的项互不相邻，保证 $a_{k-1}\ge a_k+2$），**拿不走下一个完整分量** $F_{a_{k-1}}$；
- 于是先手总能抢先收走每个分量，最终拿到最后一枚。反之若先手取的数小于 $F_{a_k}$，剩余的石子无法构成"由大到小的完整分量"序列，主动权易手——所以 $F_{a_k}$ 既是必胜取数也是最少取数。

**实现**：预处理斐波那契数列 $1,2,3,5,\dots$ 直到超过 $10^{15}$（约 $75$ 项），然后**从大到小贪心作减**——贪心选取恰好生成齐肯多夫表示（每选一项后余数严格小于该项，自动保证项互不相邻）。循环中 `res` 每次被更新为当前减掉的斐波那契数，结束时留下的就是**最后（也即最小）减掉的那一项**，即答案。

以 $n=4$ 验证：$4=3+1$，最小项为 $1$——先手取 $1$ 后对手取 $1$ 或 $2$ 都会被先手收走剩余，与样例逻辑一致。

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
// 支持lcm函数
#define LL long long
#define ULL unsigned long long
#define pair_int std::pair<int, int>
#define pair_LL std::pair<LL, LL>
const int INF_INT = 0x3f3f3f3f;
const LL INF_LL = 1e18;
const LL mod = 998244353;
const LL MAXL = 1005;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

LL fac[MAXL];
LL tot;
void build() {
    fac[1] = 1;
    fac[2] = 2;

    tot = 3;
    while (fac[tot - 1] <= 1e15) {
        fac[tot] = fac[tot - 1] + fac[tot - 2];
        tot ++;
    }

    return;
}


void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    LL N;
    LL res = INF_LL;

    build();
    cin >> N;

    for (int i = tot; i >= 1; i --) {
        if (N >= fac[i]) {
            N -= fac[i];
            res = fac[i];
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

## 复杂度

- 时间复杂度：$O(\log_\varphi n)$，斐波那契数列增长指数级，$n\le10^{15}$ 只有约 $75$ 项，贪心一轮即结束。
- 空间复杂度：$O(\log n)$。
