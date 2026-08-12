# 2 P1090 [NOIP 2004 提高组] 合并果子 题解

## 题意

在一个果园里，多多把 $n$ 种果子分成了 $n$ 堆，每次合并可以把两堆果子合并到一起，消耗的体力等于两堆果子的重量之和。经过 $n-1$ 次合并后所有果子合成一堆，总消耗体力为每次合并所耗体力之和。已知每种果子的数目，求最小总消耗体力。

数据范围：$1 \le n \le 10^4$，$1 \le a_i \le 2 \times 10^4$，答案小于 $2^{31}$。

## 核心思路

贪心 + 小根堆（Huffman 树）。

每次合并都应选择当前重量最小的两堆果子：一次合并的代价等于两堆重量之和，越早合并的堆在后续合并中被"重复计入"的次数越多，因此重量越小的堆越要尽早合并。

用一个小根堆维护所有堆的重量，每次取出最小的两个弹出、累加代价后把新堆（两者之和）重新入堆，直到只剩一堆。该策略正是构造 Huffman 树的过程，其带权路径长度（即总代价）达到最小，正确性由 Huffman 算法的贪心性质保证。

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
    std::priority_queue<int, vector<int>, std::greater<int>> q;

    for (int i = 0, x = 0; i < n; i ++) {
        cin >> x;
        q.push(x);
    }

    int res = 0;

    while (q.size() > 1) {
        int a = q.top();
        q.pop();
        int b = q.top();
        q.pop();
        res = res + (a + b);
        q.push(a + b);
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
    for (int i = 0; i < _; i ++)
    {
        solve();
    }
    return 0;
}
```

## 复杂度

- 时间复杂度：$O(n \log n)$（共 $n-1$ 次合并，每次堆操作 $O(\log n)$）。
- 空间复杂度：$O(n)$（堆空间）。
