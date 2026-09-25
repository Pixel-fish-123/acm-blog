# P2197 【模板】Nim 游戏 题解

## 题意

地上有 $n$ 堆石子，两人轮流操作：每次任选一堆，从中取走任意多枚石子（可以取完，不能不取），最后没石子可取的人输。给定 $n$ 堆石子的数量，判断先手甲是否有必胜策略（$1\le T\le 10$，$1\le n\le 10^4$，每堆石子数 $\le 2^{31}-1$）。

## 核心思路

**算法类型**：博弈论——Nim 博弈（Bouton 定理）。

结论：**先手必胜当且仅当所有堆石子数的异或和不为 $0$**。记 $S=a_1\oplus a_2\oplus\cdots\oplus a_n$，判定即 $S\neq 0$ 输出 `Yes`，否则输出 `No`。

证明要点（从必败态出发的双向论证）：

- **$S=0$ 时任意操作后必有 $S'\neq 0$**：一次操作只改变某一堆 $a_i$，若 $S'=S=0$ 则 $a_i'=a_i$，与"必须取走至少一枚"矛盾；
- **$S\neq 0$ 时存在操作使 $S'=0$**：设 $S$ 的最高位为 $k$，必存在某堆 $a_i$ 的第 $k$ 位为 $1$，且 $a_i\oplus S<a_i$（异或后最高位被消去），从该堆取走 $a_i-(a_i\oplus S)$ 枚即可；
- 全零局面（终态，轮到者输）异或和恰为 $0$。

于是从异或和非零的局面出发，先手总能把异或和为零的局面留给对手，而对手任何操作都会破坏这一性质，最终先手拿到最后一枚石子获胜。代码对每组数据把所有堆异或起来判断即可。

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
    int temp = 0;
    cin >> N;
    for (int i = 0; i < N; i ++) {
        int now;
        cin >> now;
        temp ^= now;
    }

    if (temp == 0) {
        cout << "No" << endl;
    }
    else {
        cout << "Yes" << endl;
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

- 时间复杂度：$O(n)$ 每组数据，总计 $O(\sum n)$。
- 空间复杂度：$O(1)$。
