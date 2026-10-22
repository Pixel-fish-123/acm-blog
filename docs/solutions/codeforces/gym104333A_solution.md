# gym104333A Convolution XOR SUM 题解

## 题意
给定两个长度为 $n$ 的数组 $a$、$b$（$1 \le n \le 10^5$，$1 \le a_i,b_i \le 10^5$）。对 $\{1,\ldots,n\}$ 的每个排列 $p$，定义
$$
S(p) = \sum_{i=1}^{n} (a_{p_i} \oplus b_i).
$$
求所有 $n!$ 个排列的 $S(p)$ 之和，对 $10^9+7$ 取模。

## 核心思路
**算法类型**：位运算 + 组合数学，按位贡献、线性拆开。

异或按位独立，第 $j$ 位贡献 $2^j$。固定第 $j$ 位，设 $a$ 中该位为 $1$ 的个数为 $A$，$b$ 中为 $B$。一对 $(a_x, b_i)$ 在该位上异或为 $1$，当且仅当两者该位不同，这样的有序对个数为
$$
A(n-B) + B(n-A).
$$
对任意固定位置 $i$，排列中 $p_i$ 均匀取遍所有下标，每个具体的 $(a_x,b_i)$ 在该位置出现 $(n-1)!$ 次；对 $n$ 个位置求和后，第 $j$ 位的总贡献为
$$
\bigl(A(n-B)+B(n-A)\bigr) \cdot 2^j \cdot (n-1)!.
$$
对 $j=0\ldots 29$ 累加即可（$a_i \le 10^5$，实际更高位恒为 $0$）。代码先按位累加对数，最后再乘上 $(n-1)!$。

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
    cin >> n;

    vector<int> cntA(30, 0), cntB(30, 0);
    vector<int> arr(n + 1, 0), brr(n + 1, 0);
    
    for (int i = 1; i <= n; i ++) {
        cin >> arr[i];
        for (int j = 29; j >= 0; j --) {
            cntA[j] += (arr[i] >> j) & 1;
        }
    }

    for (int i = 1; i <= n; i ++) {
        cin >> brr[i];
        for (int j = 29; j >= 0; j --) {
            cntB[j] += (brr[i] >> j) & 1;
        }
    }

    LL res = 0;
    for (int i = 0; i < 30; i ++) {
        LL c = 1LL * cntA[i] * (n - cntB[i]) + 1LL * cntB[i] * (n - cntA[i]);
        res = (res + c % MOD2 * ((1 << i) % MOD2)) % MOD2;
    }

    for (int i = 1; i < n; i ++) {
        res = res * i % MOD2;
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
时间 $O(n \cdot 30)$，空间 $O(n)$。

预估难度：CF 1400（约 1400*）。本题难度由 AI 预估，仅作为参考。
