# gym101064F Metal detector 题解

## 题意

有 $N$ 个人排队过金属探测器。探测器坏了，会交替报警：第 $1$ 个经过的人不报警，第 $2$ 个报警，第 $3$ 个不报警，第 $4$ 个报警，依此类推，一直交替下去。不报警的人直接通过；报警的人被送到队尾重新排队。

教练排在第 $i$ 位，问他是第几个顺利通过探测器的人。

数据范围：$1 \le T \le 10^3$，$1 \le N \le 10^9$，$1 \le i \le N$。

## 核心思路

**算法类型**：约瑟夫问题 + 模拟。这是「隔一个淘汰一个」的约瑟夫变形：按轮模拟，每轮整条队伍过一遍，约有一半的人通过、一半回到队尾，队伍长度减半，所以只需 $O(\log N)$ 轮。

**状态。** 代码维护四个量：

- `n`：当前队伍的人数；
- `k`：教练在当前队伍中的位置；
- `op`：下一个经过的人会不会报警，$0$ 表示不报警，$1$ 表示报警；
- `res`：已经通过的人数。

**一轮之内。** 队伍里的人依次经过，探测器交替报警：

- `op = 0` 时，奇数位置的人通过，偶数位置的人回到队尾；
- `op = 1` 时，偶数位置的人通过，奇数位置的人回到队尾。

如果教练在这一轮通过，他前面这一轮通过的人数可以直接算出来：`op = 0` 且 $k$ 为奇数时答案是 $res + \frac{k+1}{2}$；`op = 1` 且 $k$ 为偶数时答案是 $res + \frac{k}{2}$。

**进入下一轮。** 否则教练回到队尾。回到队尾的人保持原来的相对顺序，所以教练的新位置就是他在「回队尾的人」里的排名：`op = 0` 时 $k$ 是偶数，新位置为 $k / 2$；`op = 1` 时 $k$ 是奇数，新位置为 $(k + 1) / 2$。代码里按 $k$ 的奇偶统一写成了这两种情况。

这一轮通过和回到队尾的人数：

| 情形 | 通过人数 | 回到队尾的人数 |
| --- | --- | --- |
| `op = 0`，$n$ 为奇数 | $\lfloor n/2 \rfloor + 1$ | $\lfloor n/2 \rfloor$ |
| `op = 1`，$n$ 为奇数 | $\lfloor n/2 \rfloor$ | $\lfloor n/2 \rfloor + 1$ |
| $n$ 为偶数 | $n/2$ | $n/2$ |

一轮里探测器切换了 $n$ 次，所以 $n$ 为奇数时 `op` 取反，$n$ 为偶数时不变。

**终止。** 当队伍只剩教练一个人（$n = 1$）时，不管探测器这次报不报警，下一个通过的人都是他，答案是 $res + 1$。教练每轮都留在队伍里，所以 $n$ 不会变成 $0$。

**样例验证。** $N = 6, i = 2$：第一轮 `op = 0`，$k = 2$ 是偶数，教练回到队尾；通过 $3$ 人，新的 $n = 3$、$k = 1$，$n = 6$ 是偶数，`op` 仍为 $0$。第二轮 $k = 1$ 是奇数，答案为 $3 + 1 = 4$。

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
const LL INF_LL = 1e18;
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

    int n, k;
    cin >> n >> k;

    int op = 0;
    int res = 0;

    while (n > 1) {
        if (op == 0 && k % 2 == 1) {
            cout << res + (k + 1) / 2 << endl;
            return;
        }
        if (op == 1 && k % 2 == 0) {
            cout << res + k / 2 << endl;
            return;
        }

        int old_n = n;

        if (k & 1) {
            k = (k + 1) / 2;
        }
        else {
            k /= 2;
        }
        
        if (op == 0 && n % 2 == 1) {
            res += (n / 2 + 1);
            n = n / 2;
        }
        else if (op == 1 && n % 2 == 1) {
            res += (n / 2);
            n = n / 2 + 1;
        }
        else {
            res += (n / 2);
            n = n / 2;
        }

        if (old_n & 1) {
            op ^= 1;
        }
    }

    if (n == 1) {
        cout << res + 1 << endl;
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

- 时间复杂度：每轮队伍长度约减半，每组数据 $O(\log N)$。
- 空间复杂度：$O(1)$。
