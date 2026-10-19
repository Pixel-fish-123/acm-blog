# cf2261D Come Be My Friend, Don't Be So Scared (Easy Version) 题解

## 题意
（本题对应 CF 2261D1，输入保证 $m=0$。）有 $n$ 个隐藏点排成一行。探测器覆盖一段连续点，同时启动后根据各探测器的 0/1 报告要能唯一确定藏匿点。已有 $m=0$ 个探测器，求最少还要装几个，并给出一种方案（输出每个探测器的 $[u,v]$）。

多测，$1\le t\le 10^4$，$1\le n\le 2\cdot 10^5$，总 $n\le 2\cdot 10^5$。

## 核心思路
**算法类型**：构造。下界是 $\lceil n/2\rceil$，用区间 $[i,i+k-1]$（$k=\lceil n/2\rceil$）恰好取到。

每个探测器从左扫到右时，报告至多变两次（$0\to 1$ 与 $1\to 0$）。要区分 $n$ 个点，相邻点之间至少要有一次报告变化，共需 $n-1$ 次变化；首尾又不能同为全 $0$（$n>1$），还要多一次端点变化。于是 $2k\ge n$，即 $k\ge\lceil n/2\rceil$。

$n=1$ 时答案为 $0$。否则取 $k=\lceil n/2\rceil$，装 $k$ 个探测器，第 $i$ 个覆盖 $[i,i+k-1]$（$1\le i\le k$）。前 $k$ 个位置各自新开一个区间，信号两两不同；随后 $k-1$ 个位置各自有一个区间结束，信号也互不相同，且与前半段可区分（第一个区间盖住前 $k$ 个点却盖不住后半段）；若 $n$ 为偶，点 $n$ 对所有探测器都报 $0$，也是唯一的。

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
    int n, m;
    cin >> n >> m;

    int k = ceil(n / 2.0);

    if (n == 1) {
        cout << 0 << endl;
        return;
    }

    cout << k << endl;
    for (int i = 1; i <= k; i ++) {
        cout << i << " " << k + i - 1 << endl;
    }

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
每组输出 $O(k)=O(n)$ 行，时间 $O(n)$，空间 $O(1)$。
