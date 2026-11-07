# gym106785G Illuminating Lights 题解

## 题意
平面上有 $n$ 盏灯，第 $i$ 盏灯位于坐标 $(x_i, y_i)$。在时刻 $T > 0$，每盏灯照亮以 $(x_i, y_i)$ 为中心、边长为 $2T$ 的轴对齐正方形区域 $[x_i - T, x_i + T] \times [y_i - T, y_i + T]$。

判断是否存在某个时刻 $T > 0$，使得所有灯照亮区域的并集恰好是一个矩形。多组数据，$\sum n \le 2 \times 10^5$，$-10^9 \le x_i, y_i \le 10^9$。

## 核心思路
**算法类型**：贪心 + 枚举（极值包围盒判定）。

设所有灯横坐标的最小、最大值分别为 $x_{\min}, x_{\max}$，纵坐标的最小、最大值分别为 $y_{\min}, y_{\max}$。在任意时刻 $T > 0$，所有正方形并集的最小轴对齐外接矩形（包围盒）必然是：
$$[x_{\min} - T, x_{\max} + T] \times [y_{\min} - T, y_{\max} + T]$$
照亮区域的并集是矩形，当且仅当它完全填满这个外接矩形。

- **必要性**：考察外接矩形的右上角顶点 $(x_{\max} + T, y_{\max} + T)$。某盏灯 $(x_i, y_i)$ 的正方形能覆盖该点，当且仅当 $x_i + T \ge x_{\max} + T$ 且 $y_i + T \ge y_{\max} + T$，即必须有 $x_i = x_{\max}$ 且 $y_i = y_{\max}$。同理，外接矩形的四个角能够被覆盖，要求点集中**必须同时存在** $(x_{\max}, y_{\max})$、$(x_{\min}, y_{\max})$、$(x_{\max}, y_{\min})$、$(x_{\min}, y_{\min})$ 这四个极值角点。
- **充分性**：若这四个角点都在点集中，只需取足够大的 $T$（例如 $T \ge \frac{1}{2}\max(x_{\max} - x_{\min}, y_{\max} - y_{\min})$），这四盏角点灯的正方形就会两两相交并完全覆盖整个外接矩形，而其余灯由于满足 $x_{\min} \le x_i \le x_{\max}, y_{\min} \le y_i \le y_{\max}$，其照亮区域也必然包含在外接矩形内部。

因此只需先扫一遍求出 $x_{\min}, x_{\max}, y_{\min}, y_{\max}$，再扫一遍检查四个极值角点是否全部出现在点集中即可。

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
#define endl '\n' // 交互题记得去掉

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);

    int n;
    cin >> n;

    vector<pair_int> points;

    int x_min = INF_INT, y_min = INF_INT;
    int x_max = -INF_INT, y_max = -INF_INT;
    for (int i = 1; i <= n; i ++) {
        pair_int now;
        cin >> now.first >> now.second;
        x_max = std::max(x_max, now.first);
        y_max = std::max(y_max, now.second);
        x_min = std::min(x_min, now.first);
        y_min = std::min(y_min, now.second);
        points.push_back({now.first, now.second});
    }

    bool ok[4] = {0};

    for (int i = 0; i < n; i ++) {
        int x = points[i].first, y = points[i].second;
        if (x == x_max && y == y_max) ok[0] = 1;
        if (x == x_min && y == y_max) ok[1] = 1;
        if (x == x_max && y == y_min) ok[2] = 1;
        if (x == x_min && y == y_min) ok[3] = 1;
    }

    for (int i = 0; i < 4; i ++) {
        if (!ok[i]) {
            cout << "NO" << endl;
            return;
        }
    }

    cout << "YES" << endl;
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
- 时间复杂度：每组数据遍历点集两次，时间复杂度为 $O(n)$，总时间复杂度 $O(\sum n)$。
- 空间复杂度：$O(n)$。

预估难度：CF 1200（约 1200*）。本题难度由 AI 预估，仅作为参考。
