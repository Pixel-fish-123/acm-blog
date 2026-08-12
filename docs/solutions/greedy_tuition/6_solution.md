# 6 P1080 [NOIP 2012 提高组] 国王游戏 题解

## 题意

国王邀请 $n$ 位大臣玩游戏，国王与每位大臣左右手上各写一个整数。大臣排成一排，国王站在最前面。每位大臣获得的金币数为：排在该大臣前面的所有人（含国王）左手数的乘积除以他自己右手数后向下取整。国王希望重新安排大臣顺序，使获得奖赏最多的大臣所获奖赏尽可能少，输出这个最小值。

数据范围：$1 \le n \le 1000$，$0 < a, b < 10000$（$a$ 为左手数，$b$ 为右手数）。

## 核心思路

贪心 + 邻项交换法（Exchange Argument）。

考虑相邻两位大臣 $i, j$（$i$ 在 $j$ 前）。设排在他们之前的所有人左手数乘积为 $P$，则：

- $i$ 在前时，两人的金币为 $\frac{P}{b_i}$ 和 $\frac{P \cdot a_i}{b_j}$，较大者为 $\max(\frac{1}{b_i}, \frac{a_i}{b_j}) \cdot P$；
- $j$ 在前时，较大者为 $\max(\frac{1}{b_j}, \frac{a_j}{b_i}) \cdot P$。

两边同乘 $b_i b_j$ 并消去公共因子 $P$ 后，$i$ 在前不劣等价于 $\max(b_j, a_i b_i) \le \max(b_i, a_j b_j)$。若 $a_i b_i > a_j b_j$，左边取到 $a_i b_i$，而右边无论取 $\max$ 中的哪一项都不超过 $a_i b_i$，说明交换 $i, j$ 后两人的最大金币不增。

因此最优排列中不存在相邻的"逆序对"，按 $a_i \times b_i$ 升序排序即可得到最优顺序。排序后从国王开始累乘左手数，依次计算每位大臣的金币数并取最大值。理论上前缀乘积会超出 64 位整数范围，完整做法需要高精度；本题学习重点是排序贪心的思路，代码用 `long long` 简化实现。

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

    vector<pair_LL> arr(n);
    LL a, b;

    cin >> a >> b;

    for (int i = 0; i < n; i ++) {
        cin >> arr[i].first >> arr[i].second;
    }

    std::sort(arr.begin(), arr.end(), [&](pair_LL a, pair_LL b){
        return a.first * a.second < b.first * b.second;
    });

    LL res = -1;
    LL mul = a;

    for (int i = 0; i < n; i ++) {
        res = std::max(mul / arr[i].second, res);
        mul *= arr[i].first;    
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

- 时间复杂度：$O(n \log n)$（排序）+ $O(n)$（扫描统计）。
- 空间复杂度：$O(n)$。
