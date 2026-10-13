# gym102365C Unjob Search 题解

## 题意

这是一道交互题。给定一棵 $N$ 个结点的树（$3 \le N \le 2000$），结点编号 $1 \ldots N$。终端城市指度为 $1$ 的叶子。你最多询问 $N$ 次：

- `? a b c`：询问结点 $b$ 是否在 $a$ 到 $c$ 的唯一简单路径上（是则返回 $1$，否则 $0$）。

最后输出 `! x` 表示你找到的一个叶子，然后立即结束。注意刷新输出缓冲区。

## 核心思路

**算法类型**：交互 + 树上问题 + 枚举（找距离 $1$ 最远的结点）。

树上任意一个最远点都是叶子。固定根 $1$，只要找到距离 $1$ 最远的结点即可。

维护候选点 $u$（初始为 $2$）。对每个 $i = 3, \ldots, N$ 询问 `? 1 u i`，即「$u$ 是否在路径 $1 \leadsto i$ 上」：

- 若是，则 $i$ 落在 $1$ 看向 $u$ 的那一侧子树中，且到 $1$ 的距离不小于 $u$，把 $u$ 更新为 $i$，相当于沿该方向走向更远；
- 若否，则 $i$ 在别的方向，忽略。

扫完后 $u$ 即为 $1$ 的某个最远点，必为叶子。询问次数为 $N-2 \le N$，满足限制。

注意题目中询问格式是「$b$ 是否在 $a$—$c$ 路径上」，参数顺序为 `? a b c`，与「$c$ 是否在 $a$—$b$ 路径上」不同，实现时不可弄反。

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
bool ask(int a, int b, int c) {
    cout << "? " << a << " " << b << " " << c << endl;
    int r;
    cin >> r;
    return r;
}
void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int n;
    cin >> n;

    int u = 2;
    for (int i = 3; i <= n; i ++) {
        if (ask(1, u, i)) {
            u = i;
        }
    }

    cout <<"! "<< u << endl;

    return;
}

int main()
{
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

- 时间复杂度：至多 $N-2$ 次询问，每次 $O(1)$ 交互，总 $O(N)$。
- 空间复杂度：$O(1)$。
