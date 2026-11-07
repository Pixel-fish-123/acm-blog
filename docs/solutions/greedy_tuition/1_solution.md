# 1 线段重合 题解

## 题意

给定 $N$ 条线段，每条线段用 $X$ 轴上的起止位置 $[start, end]$ 表示。求所有重合区域中，同一位置最多重合了几条线段。注意首尾相接的线段不算重合，例如 $[1,2]$ 与 $[2,3]$ 不算重合，而 $[1,3]$ 与 $[2,3]$ 重合。

数据范围：$1 \le N \le 10^4$，$1 \le start < end \le 10^5$。

## 核心思路

**算法类型**：贪心 + 堆 + 排序（扫描线维护活动区间）。

任意一个被最多线段覆盖的公共重合区间，其左端点必然是其中某条线段的左端点 $l_i$。因此只需枚举每条线段的左端点 $l_i$，统计有多少条线段严格覆盖位置 $l_i$（即满足 $l_j \le l_i < r_j$）。

将所有线段按左端点升序排序，并维护一个小根堆，堆中存放「左端点 $\le$ 当前扫描位置、且尚未结束」的线段的右端点。依次扫描每条线段 $i$：

1. **弹出已结束线段**：当前线段左端点为 $\mathrm{now\_l}$，先把堆中所有右端点不超过 $\mathrm{now\_l}$ 的线段弹出——它们在 $\mathrm{now\_l}$ 之前或恰好在 $\mathrm{now\_l}$ 处结束，不再与当前及之后的线段产生内部重合。由于首尾相接不算重合，弹出条件为 `now_l >= q.top()`；
2. **加入当前线段并更新答案**：把当前线段的右端点 $r_i$ 入堆。由于按左端点升序扫描，此时堆中所有线段的左端点都 $\le \mathrm{now\_l}$、右端点都 $> \mathrm{now\_l}$，堆的大小恰好就是覆盖区间 $[\mathrm{now\_l}, \mathrm{now\_l} + \varepsilon)$ 的重合线段数，用它更新全局最大值。

每条线段入堆一次、出堆至多一次，总复杂度为 $O(n \log n)$。

::: details 点击展开参考代码

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

struct line {
    int l, r;
};

vector<line> arr;
void solve()
{
    int n;
    cin >> n;

    for (int i = 0; i < n; i ++) {
        int pre, lst;
        cin >> pre >> lst;
        arr.push_back({pre, lst});
    }

    std::sort(arr.begin(), arr.end(), [&](line a, line b) {
        return a.l < b.l;
    });

    std::priority_queue<int, vector<int>, std::greater<int>> q;
    int res = 0;
    for (int i = 0; i < n; i ++) {
        if (!q.empty()) {
            int now_l = arr[i].l;
            while (!q.empty() && now_l >= q.top()) {
                q.pop();
            }
        }
        q.push(arr[i].r);
        res = std::max(res, (int)q.size());
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


:::

## 复杂度

- 时间复杂度：$O(n \log n)$（排序 + 每条线段进出堆各至多一次）。
- 空间复杂度：$O(n)$（存放线段数组与堆）。

预估难度：CF 1300（约 1300*）。本题难度由 AI 预估，仅作为参考。
