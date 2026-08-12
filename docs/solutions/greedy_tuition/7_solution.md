# 7 P1109 学生分组 题解

## 题意

有 $n$ 组学生，给出初始时每组的学生数，再给出每组学生数的上界 $R$ 和下界 $L$（$L \le R$）。每次操作可以在某组中选出一名学生，把他安排到另外一组中。问最少需要多少次操作才能使每组学生数都在 $[L, R]$ 范围内；若无法做到，输出 $-1$。

数据范围见原题（洛谷 P1109）。

## 核心思路

贪心 + 可行性判断。

先算出两类"差额"：

- $up = \sum (L - a_i)$，其中 $a_i < L$，即人数不足 $L$ 的组总共需要补入的学生数；
- $down = \sum (a_i - R)$，其中 $a_i > R$，即人数超过 $R$ 的组总共需要移出的学生数。

一次操作把一名学生从超额的组移到不足的组，恰好同时消除一个 $up$ 缺口和一个 $down$ 盈余，因此转移量总量为 $\max(up, down)$，答案即为这个值（可行时）。

可行性检查：当 $up > down$ 时，除了内部转移掉 $down$ 个盈余外，还需要从"高于 $L$ 的组"中挤出差额——所有满足 $a_i > L$ 的组最多可让出 $\sum (a_i - L)$ 名学生（让到 $L$ 为止），只有这个总量足以补足 $up$ 才可行；当 $down > up$ 时同理，检查所有满足 $a_i < R$ 的组最多可接收 $\sum (R - a_i)$ 名学生是否足以容纳全部 $down$。这两条判断分别等价于总人数不小于 $nL$、不大于 $nR$。

代码按上述思路：先统计 $up, down$，再扫描数组累加可让出/可接收名额（`res` 记录累计转移的学生数），名额够则输出转移量，否则输出 $-1$。

## 参考代码

```cpp
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
#define endl '\n'

void solve()
{
    int n;
    cin >> n;
    vector<int> arr(n + 1, 0);

    for (int i = 1; i <= n; i ++) {
        cin >> arr[i];
    }

    int L, R;
    cin >> L >> R;

    int up = 0, down = 0;
    int res = 0;

    for (int i = 1; i <= n; i ++) {
        if (arr[i] < L) {
            up += (L - arr[i]);
        }
        if (arr[i] > R) {
            down += (arr[i] - R);
        }
    }

    int delta = up - down;

    for (int i = 1; i <= n; i ++) {
        if (delta > 0 && arr[i] > L) {
            res += std::min(up, arr[i] - L);
            up -= std::min(up, arr[i] - L);
        }
        if (delta < 0 && arr[i] < R) {
            res += std::min(down, R - arr[i]);
            down -= std::min(down, R - arr[i]);
        }
    }

    if (delta == 0) {
        cout << up << endl;
    }
    else if ((delta > 0 && up == 0) || (delta < 0 && down == 0)) {
        cout << res << endl;
    }
    else {
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
    for (int i = 0; i < _; i ++)
    {
        solve();
    }
    return 0;
}
```

## 复杂度

- 时间复杂度：$O(n)$（两次线性扫描）。
- 空间复杂度：$O(n)$。
