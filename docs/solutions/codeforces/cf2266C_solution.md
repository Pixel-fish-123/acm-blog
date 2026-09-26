# cf2266C AND, OR, Sort! 题解

## 题意

给定长度为 $n$ 的 01 串 $s$。一次操作选一个下标 $i$，把 $s_i$ 改成**当前**前缀 $s_1, s_2, \ldots, s_i$ 的按位与或按位或（二选一）。

求把 $s$ 变成非降序（形如 $0\cdots01\cdots1$）所需的最少操作次数。

数据范围：$1 \le t \le 10^4$，$2 \le n \le 2 \times 10^5$，$\sum n \le 2 \times 10^5$。

## 核心思路

**算法类型**：枚举 + 前缀和 + 贪心。$s_1$ 永远不变，按 $s_1$ 分两种情况；$s_1 = 0$ 时枚举最终串中 $0$ 与 $1$ 的分界点，答案是与目标串不同的位置数的最小值。

**关键观察：$s_1$ 不会改变。** 对 $i = 1$ 操作时，单个元素的与、或都等于它本身。

**情况一：$s_1 = 1$。** 有序串以 $1$ 开头只能是全 $1$，每个 $0$ 至少改一次。又因为前缀里含有 $s_1 = 1$，对任意 $0$ 取前缀或就能一步变成 $1$。答案为 $0$ 的个数。

**情况二：$s_1 = 0$。** 目标串为 $0^k 1^{n-k}$（$1 \le k \le n$）。与目标不同的位置每个至少操作一次，所以代价下界是

$$\text{cost}(k) = (\,s_2..s_k \text{ 中 } 1 \text{ 的个数}\,) + (\,s_{k+1}..s_n \text{ 中 } 0 \text{ 的个数}\,).$$

下面说明取最小值的 $k$ 一定能恰好用 $\text{cost}(k)$ 步完成。

- 把 $1$ 改成 $0$：前缀里有 $s_1 = 0$，取前缀与一步即可，任何时候都能做。
- 把 $0$ 改成 $1$：需要当前前缀里有 $1$。先从左往右处理后缀里的 $0$，再处理前缀里的 $1$。后缀中第一个 $0$ 的左边，要么有后缀里原本的 $1$，要么（它恰好是 $s_{k+1}$ 时）需要 $s_2..s_k$ 中有 $1$；此后每个 $0$ 左边都已有改好的 $1$。

唯一做不到的情况是：$s_{k+1} = 0$ 且 $s_2..s_k$ 全为 $0$。但这时把分界点换成 $k + 1$，位置 $k + 1$ 不再需要修改，有 $\text{cost}(k + 1) = \text{cost}(k) - 1$，所以这个 $k$ 不可能是最小值点。因此

$$\text{ans} = \min_{1 \le k \le n} \text{cost}(k).$$

**实现。** 代码用 0 下标，`lst[i]` 为 $s_i..s_{n-1}$ 中 $0$ 的个数（后缀和），`pre` 在枚举过程中累计 $s_1..s_{i-1}$ 中 $1$ 的个数。分界点取 $i$（前 $i$ 位为 $0$）时代价为 `pre + lst[i]`；全 $0$ 的情况（$k = n$）代价为 $1$ 的总数 `one`。

`res` 初值为 $0$ 的总数 `zero`，这对应情况一。在情况二中，它不可能成为最小值，因为 $k = 1$ 的代价是 `zero - 1`。

**样例验证。**

- `0011`：分界点 $k = 2$ 时代价为 $0$，答案 $0$。
- `1000`：$s_1 = 1$，答案为 $0$ 的个数 $3$。

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
    
    int n;
    std::string s;
    int zero = 0, one = 0;
    int res = INF_INT;
    cin >> n;
    cin >> s;

    vector<int> lst(n + 1, 0);

    int pos = s[0] - '0';

    for (int i = 0; i < n; i ++) {
        if (s[i] == '0') zero ++;
        else one ++;
    }
    
    for (int i = n - 1; i >= 1; i --) {
        if (s[i] == '0') lst[i] = lst[i + 1] + 1;
        else lst[i] = lst[i + 1];
        //cout << lst[i] << " ";
    }

    //cout << endl;

    // for (int i = 0; i <= n; i ++) {
    //     cout << lst[i] << " ";
    // }
    // cout << endl;

    res = zero;

    if (pos == 0) {
        res = std::min(res, one);
        int pre = 0;
        for (int i = 1; i < n; i ++) {
            int add = pre + lst[i];
            res = std::min(add, res);
            if (s[i] == '1') pre ++;
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

- 时间复杂度：每组数据计算后缀和、枚举分界点各 $O(n)$，总计 $O(\sum n)$。
- 空间复杂度：$O(n)$，用于后缀数组 `lst`。
