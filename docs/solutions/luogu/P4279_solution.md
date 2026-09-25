---
tags: [博弈论]
difficulty: "提高"
source: "https://www.luogu.com.cn/problem/P4279"
---
# P4279 [SHOI2008] 小约翰的游戏 题解

## 题意

桌子上有 $n$ 堆石子（$1\le N\le 50$，每堆 $\le 5000$，$1\le T\le 500$ 组数据），两人轮流取石子：每次任选一堆取走任意多颗，但不能不取，**取到最后一颗石子的人输**。小约翰先手且哥哥从不出错，预测谁获胜（约翰赢输出 `John`，否则输出 `Brother`）。

## 核心思路

**算法类型**：Anti-Nim 博弈（反 Nim）——SJ 定理。

取到最后一颗者判负，与普通 Nim 恰好相反。结论（SJ 定理）：**先手必胜当且仅当满足下列条件之一**：

1. 所有堆都只有 $1$ 颗石子，且堆数为**偶数**；
2. 存在大于 $1$ 的堆，且全部堆的**异或和非零**。

代码据此实现：统计大小为 $1$ 的堆数 `tot` 与总异或 `xor_`：

- 若 `tot == N`（全 $1$）：步数完全被迫（每人每次恰好取走一颗），总步数为 $N$，走第 $N$ 步的人取到最后一颗判负——$N$ 为偶数时第二个人被迫取最后一颗，约翰获胜；
- 否则（存在大于 $1$ 的堆）：退化为与普通 Nim 相同的异或判定，`xor_ != 0` 时先手必胜。

存在大于 $1$ 的堆时结论的正确性直觉：异或非零的一方总能把局面调回异或为零（普通 Nim 的调整法）；而当对手面对"异或为零且仍有大堆"的局面时，任何操作都会破坏为零性。关键的边界是只剩一堆大于 $1$：当前方可以自由决定把这堆削到多大，从而控制留下的 $1$ 堆总数的奇偶，把"全 $1$ 且堆数为奇"的必败态留给对手——这正是全 $1$ 局面单独判奇偶的原因。

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

    int N;
    int xor_ = 0;
    cin >> N;

    int tot = 0;
    for (int i = 0; i < N; i ++) {
        int now;
        cin >> now;
        if (now == 1) tot ++;
        xor_ ^= now;
    }

    if (tot == N) {
        if (tot % 2 == 0) cout << "John" << endl;
        else cout << "Brother" << endl;
    }
    else {
        if (xor_ != 0) {
            cout << "John" << endl;
        }
        else {
            cout << "Brother" << endl;
        }
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

## 复杂度

- 时间复杂度：每组数据 $O(n)$，总计 $O(\sum n)$。
- 空间复杂度：$O(1)$。
