# P3812 【模板】线性基 题解

## 题意

给定 $n$ 个整数（数字可能重复），从中选取任意个，求最大异或和（$1\le n\le 50$，$0\le S_i<2^{50}$）。

## 核心思路

**算法类型**：线性基（异或空间的高斯消元）。

**线性基的结构**：维护数组 $p[0..62]$，其中 $p[i]$（非零时）的最高二进制位恰为第 $i$ 位。这组基与原集合**张成相同的异或空间**——任意原数都能由基异或表出，反之亦然，因此"选任意个数异或"的最大值等于"从基中选任意个异或"的最大值。

**插入 `add(x)`**：从最高位向低位依次检查 $x$ 中为 $1$ 的位 $i$：

- 若 $p[i]$ 为空，直接 $p[i]=x$，插入结束；
- 否则令 $x\leftarrow x\oplus p[i]$ 消去第 $i$ 位，继续向下扫描。

这个过程本质是对 $x$ 做高斯消元：要么 $x$ 被某组合完全消成 $0$（说明它已在基张成的空间里），要么在某一步成为新的基。本题 $S_i<2^{50}$，`BIT=62` 的位数绰绰有余。

**查询最大值**：从高位到低位贪心——若把 $p[i]$ 异或进当前答案能让答案变大（即答案的第 $i$ 位为 $0$ 而 $p[i]$ 的最高位是 $i$），就异或之：

$$res\leftarrow\max(res, res\oplus p[i])$$

由"高位优先"的正确性：第 $i$ 位的收益（$2^i$）大于所有低位之和，所以每一轮 `max` 都自动做出"该位能否置 $1$"的正确决策；而 `p[i]` 之间的低位互不影响（各基的最高位互不相同），贪心可行。

小例子验证：把 $\{1,5,9,4\}$ 依次插入，得到基 $p[3]=9$、$p[2]=5$、$p[0]=1$（$4$ 被消成 $0$，因为它恰为 $5\oplus1$，不增加新方向）。贪心从高位往低位做 $res\leftarrow\max(res, res\oplus p[i])$：先 $\max(0,9)=9$，再 $\max(9,9\oplus5)=12$，最后 $\max(12,12\oplus1)=13$，最大异或和为 $13$——它对应原集合中的 $9\oplus4=13$。

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
const LL mod = 998244353;
const int MAXL = 0;
const int BIT = 62;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);

    vector<LL> p(BIT + 1, 0);

    auto add = [&](LL x) -> LL {
        for (int i = BIT; i >= 0; i --) {
            if (x >> i & 1) {
                if (!p[i]) {
                    p[i] = x;
                    return x;
                }
                x ^= p[i];
            }
        }
        return 0LL;
    };

    int N;
    cin >> N;

    for (int i = 0; i < N; i ++) {
        LL x;
        cin >> x;
        add(x);
    }

    LL res = 0;

    for (int i = BIT; i >= 0; i --) {
        res = std::max(res, res ^ p[i]);
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

- 时间复杂度：插入 $O(n\log V)$（每个数至多消 $63$ 次），查询 $O(\log V)$；本题 $n\le 50$、$V<2^{50}$，几乎瞬间完成。
- 空间复杂度：$O(\log V)$，即 $63$ 个基向量。
