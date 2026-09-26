# cf2266A Good Contest 题解

## 题意

一场比赛有 $3$ 道题、$n$ 名选手。没有做出全部 $3$ 道题的选手称为「弱选手」。

榜单丢失了，只知道第 $i$ 题有 $a_i$ 人做出。在所有与这些信息相符的榜单中，求弱选手人数的最小值。

数据范围：$1 \le t \le 3000$，$1 \le n \le 9$，$0 \le a_i \le n$。

## 核心思路

**算法类型**：贪心。做出全部三题的人数最多是 $\min(a_1, a_2, a_3)$，并且可以取到，所以答案为 $n - \min(a_1, a_2, a_3)$。

**上界。** 做出全部三题的选手一定做出了第 $i$ 题，所以这类选手不超过 $a_i$ 人，对三道题取最小值，最多有 $m = \min(a_1, a_2, a_3)$ 人。于是弱选手至少有 $n - m$ 人。

**可以取到。** 让前 $m$ 名选手做出全部三题。对第 $i$ 题，还剩 $a_i - m$ 个「做出」名额没有分配，而剩下的选手有 $n - m$ 人，且 $a_i - m \le n - m$，所以从剩下的人里随便挑 $a_i - m$ 个人算作做出第 $i$ 题即可。这 $n - m$ 人里没有人做出全部三题：否则由上一段，全做出的人数会超过 $m$。

**样例验证。** $n = 4$，$a = (4, 4, 3)$ 时 $m = 3$，答案为 $4 - 3 = 1$，与样例一致。

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
    vector<int> arr(3, 0);
    LL N;
    cin >> N;
    for (int i = 0; i < 3; i ++) {
        cin >> arr[i];
    }

    LL min_ = std::min(arr[0], std::min(arr[1], arr[2]));

    cout << N - min_ << endl;
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

- 时间复杂度：每组数据 $O(1)$，总计 $O(t)$。
- 空间复杂度：$O(1)$。
