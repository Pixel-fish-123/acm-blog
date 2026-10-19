# cf2261A Hey, It's Me, Souvlakity 题解

## 题意
把 $1$ 到 $n$ 的整数按二进制串 $s$ 分给 Souvlakity（`1`）和 Kalamakity（`0`），保证 Souvlakity 至少有一个数。两人轮流操作共 $10^{100}$ 回合，Souvlakity 先手：每回合必须把自己的一个整数交给对方。结束后 Souvlakity 的得分是他手里整数集合 $S$ 的极差 $\max(S)-\min(S)$。Souvlakity 最大化得分，Kalamakity 最小化该得分，双方最优时得分是多少？

多测，$1\le t\le 100$，$2\le n\le 100$。

## 核心思路
**算法类型**：博弈论。结束后 Souvlakity 拥有的整数个数等于初始个数 $k$，再按 $k=1,2,\ge 3$ 分类讨论极差。

总回合数是偶数，且两人交替各交出一个数：每一对「Souvlakity 交出去 + Kalamakity 交回来」都会让 Souvlakity 的个数先减一再加一。因此游戏结束时，Souvlakity 仍然恰好有 $k$ 个数。

- $k=1$：结束时手里只有一个数，极差为 $0$。
- $k=2$：Souvlakity 第一回合无论交出哪一个，Kalamakity 都可以还给他一个与留下的那个相邻的数，极差变成 $1$；之后 Kalamakity 一直把同一数还回来，极差被钉在 $1$。
- $k\ge 3$：Souvlakity 可以一直交出既不是当前最小也不是当前最大的数，极差不会变小；Kalamakity 也可以一直把刚收到的数还回去，极差不会变大。于是最终极差等于初始集合的 $\max-\min$。

代码扫一遍求出所有 `1` 的个数以及最左、最右下标：$k=1$ 输出 $0$，$k=2$ 输出 $1$，否则输出最右减最左。

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
    std::string s;
    cin >> s;

    int minn = INF_INT, maxx = -INF_INT, cnt = 0;
    for (int i = 0; i < n; i ++) {
        if (s[i] == '1') {
            minn = std::min(minn, i + 1);
            maxx = std::max(maxx, i + 1);
            cnt ++;
        }
    }

    if (cnt == 1) {
        cout << 0 << endl;
    }
    else if (cnt == 2) {
        cout << 1 << endl;
    }
    else {
        cout << maxx - minn << endl;
    }
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
每组数据扫一遍串，时间 $O(n)$，空间 $O(1)$（不计输入串）。
