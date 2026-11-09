# G 直径与最大独立集 题解

## 题意
给定正整数 $n$（$2 \le n \le 10^5$，所有测试数据满足 $\sum n \le 10^5$）。要求构造一棵 $n$ 个点的树，使得树的最大独立集大小恰好等于直径长度（直径按边数计算）。无解输出 $-1$，否则输出 $n-1$ 条边。

## 核心思路
**算法类型**：构造 + 数学（按 $n \bmod 3$ 分类）。

小数据单独看：
- $n=2$：只有一条边，最大独立集为 $1$，直径为 $1$，合法；
- $n=3$：一条链，最大独立集为 $2$，直径为 $2$，合法；
- $n=4$：四个点的树只有链和菊花两种。链的最大独立集为 $2$、直径为 $3$；菊花的最大独立集为 $3$、直径为 $2$。都不相等，所以无解。

$n \ge 5$ 时按 $n-5=3k+m$（$m \in \{0,1,2\}$）构造：
- 在根节点 $1$ 上挂 $k+2$ 个叶子（代码里先挂 $2,3$，再挂 $k$ 个）；
- 从根节点接出一条长度 $2k+2$ 的链，若 $m \ge 1$ 再把链加长 $1$；
- 若 $m=2$，在链的第一个点上再挂一个叶子。

每多 $3$ 个点（$k$ 增加 $1$），相当于多挂一个根叶子、链加长两条边，最大独立集和直径正好各加 $2$。余下的 $1$ 个点用来把链加长一条边（两者同时加 $1$），余下的 $2$ 个点则在链首补一个叶子（最大独立集和直径都不变）。逐个情况验证：
- $m=0$：$n=5+3k$，最大独立集 $=(k+2)+(k+1)=2k+3$，直径 $=1+(2k+2)=2k+3$；
- $m=1$：$n=6+3k$，最大独立集 $=(k+2)+(k+2)=2k+4$，直径 $=1+(2k+3)=2k+4$；
- $m=2$：$n=7+3k$，多出的叶子挂在链首，最大独立集仍为 $(k+2)+(k+2)=2k+4$，直径 $=1+(2k+3)=2k+4$（从新叶子走到链尾也是同样长度）。

代码按这个结构顺序编号并输出即可。

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

void link(int a, int b) {
    cout << a << " " << b << endl;
}
void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);

    int n;
    cin >> n;

    if (n >= 5) {
        int len = (n - 5) / 3;
        int m = (n - 5) % 3;
        int root = 1, cnt = 2;

        int l = len, r = len * 2 + 2;
        link(root, cnt), cnt ++;
        link(root, cnt), cnt ++;
        int pre = root, nxt = cnt;
        for (int i = 0; i < l; i ++) {
            link(pre, nxt);
            cnt ++;
            nxt = cnt;
        }
        pre = root, nxt = cnt;
        int rem = 0;
        if (m == 1 || m == 2) {
            r ++;
        }
        if (m == 2) {
            rem = nxt;
        }
        for (int i = 0; i < r; i ++) {
            link(pre, nxt);
            pre = nxt;
            cnt ++;
            nxt = cnt;
        }

        if (m == 2) link(rem, cnt);
    }

    if (n == 3) {
        cout << "1 2" << endl;
        cout << "2 3" << endl;
    }

    if (n == 2) {
        cout << "1 2" << endl;
    }

    if (n == 4) {
        cout << -1 << endl;
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
- 时间复杂度：$O(n)$，每个点和每条边各输出一次；所有测试数据总计 $O(\sum n)$。
- 空间复杂度：$O(1)$（不计输出）。

预估难度：CF 1600（约 1600*）。本题难度由 AI 预估，仅作为参考。
