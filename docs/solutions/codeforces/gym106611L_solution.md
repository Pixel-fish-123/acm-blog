# gym106611L Linesweeper 题解

## 题意
一维扫雷棋盘共有 $N$（$1 \le N \le 10^5$）个格子排成一行，给定长度为 $N$ 的字符串 $s$，其中 `?` 表示未翻开的格子，`0`、`1`、`2` 表示已翻开格子（不含雷）且其左右相邻格子中的地雷总数。保证给定的棋盘状态合法，求未翻开的 `?` 格子中有多少个**一定没有地雷**。

## 核心思路
**算法类型**：模拟 + 贪心（正反双向扫描推导）。

用 `status[i]` 记录每个格子的确定状态：`-1` 表示未知，`0` 表示确定无雷，`1` 表示确定有雷。初始时，所有已翻开的格子（`s[i] != '?'`）确定无雷，即 `status[i] = 0`。

对于任意一个已翻开的数字格 $i$（数值为 $c = s[i] - '0'$），考虑它的左右邻居 $l = i - 1$ 和 $r = i + 1$：
1. **边界格**（只有单侧邻居）：
   - 若 $i = 0$（只有右邻居 $r$），则 `status[r] = c`；
   - 若 $i = n - 1$（只有左邻居 $l$），则 `status[l] = c`。
2. **内部格**（左右邻居均存在）：
   - 若 $c = 0$：左右两侧必定都无雷，直接确定 `status[l] = 0, status[r] = 0`；
   - 若 $c = 2$：左右两侧必定都有雷，直接确定 `status[l] = 1, status[r] = 1`；
   - 若 $c = 1$：左右两侧状态必然相反（一雷一空）。一旦其中一侧状态已知（`!= -1`），另一侧状态即可唯一确定为它的异或 `^ 1`。

由于 `c = 1` 的推导会沿着连续的已知数字向单侧传递（例如左边的确定状态通过一系列 `1` 向右推导，或右边的确定状态向左推导），只需**从左到右扫描一遍，再从右到左扫描一遍**，即可将所有能唯一确定的格子状态全部推导出来（若两边都是未知的 `?1?` 且无法从外部传入确定信息，则确实存在两种对称合法解，状态保持 `-1`）。最后统计满足 `s[i] == '?' && status[i] == 0` 的格子数即可。

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
const int INF_INT = INT_MAX - 5;
const LL INF_LL = LONG_LONG_MAX - 5;
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

    vector<int> status(n, -1);

    for (int i = 0; i < n; i ++) {
        if (s[i] != '?') status[i] = 0;
    }

    for (int pass = 0; pass < 2; pass++) {
        int start = (pass == 0 ? 0 : n - 1);
        int end   = (pass == 0 ? n : -1);
        int step  = (pass == 0 ? 1 : -1);

        for (int i = start; i != end; i += step) {
            if (s[i] == '?') continue;

            int c = s[i] - '0';
            int l = i - 1, r = i + 1;

            if (l >= 0 && r < n) {
                if (c == 0) {
                    status[l] = 0;
                    status[r] = 0;
                } else if (c == 2) {
                    status[l] = 1;
                    status[r] = 1;
                } else {
                    if (status[l] != -1 && status[r] == -1)
                        status[r] = status[l] ^ 1;
                    if (status[r] != -1 && status[l] == -1)
                        status[l] = status[r] ^ 1;
                }
            } else if (l >= 0) {
                status[l] = c;
            } else if (r < n) {
                status[r] = c;
            }
        }
    }

    int cnt = 0;
    for (int i = 0; i < n; i ++) {
        if (s[i] == '?' && status[i] == 0) cnt ++;
    }

    cout << cnt << endl;
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
- 时间复杂度：$O(N)$，正反两次线性扫描。
- 空间复杂度：$O(N)$，用于存储字符串与每个格子的状态。

预估难度：CF 1300（约 1300*）。本题难度由 AI 预估，仅作为参考。
