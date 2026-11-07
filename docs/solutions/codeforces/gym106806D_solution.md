# gym106806D Discception 题解

## 题意
给出 $n$（$2 \le n \le 2 \cdot 10^5$）个圆的半径 $r_i$（$1 \le r_i \le 10^9$）。问能否把这些圆放到平面上，使得每个圆的圆心都落在另一个圆的圆周上。能则输出 `possible`，否则输出 `impossible`。

## 核心思路
**算法类型**：排序 + 数学（多边形不等式）。

如果圆 $i$ 的圆心落在圆 $j$ 的圆周上，那么两圆心之间的距离恰好是 $r_j$。把每个圆向“承载它圆心的圆”连一条有向边，每个点出度为 $1$，所以每个连通块里一定存在一个环。

对于环 $i_1 \to i_2 \to \dots \to i_k \to i_1$，圆心 $O_{i_1}, O_{i_2}, \dots, O_{i_k}$ 围成一个闭合多边形，并且
$$|O_{i_t}O_{i_{t+1}}| = r_{i_{t+1}},$$
即这个多边形的各条边长恰好是环上这些圆的半径。反过来，只要某个半径集合能围成一个闭合多边形，就先把这些圆按这个多边形摆好，剩下的每个圆只要把圆心放到任意一个已经摆好的圆的圆周上即可，所以环以外的圆不会带来额外限制。

于是问题变成：是否存在一个半径子集，满足“最长边不超过其余边之和”。所有半径都是正数，因此最优的选择一定是尽量小的那些半径。把半径升序排序后，只需要检查是否存在 $i \ge 2$ 使得
$$r_i \le r_1 + r_2 + \dots + r_{i-1}.$$
扫一遍、维护前缀和即可。两个半径相同的圆也合法：让两圆心相距 $r$，则彼此的圆心都在对方的圆周上。

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

    vector<LL> arr(n, 0);
    
    for (auto &x : arr) {
        cin >> x;
    }

    std::sort(arr.begin(), arr.end());

    LL same = 0, ans = 0;
    for (int i = 0; i < n; i ++) {
        if (arr[i] <= ans) {
            cout << "possible" << endl;
            return;
        }
        ans += arr[i];
    }

    cout << "impossible" << endl;


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
- 时间复杂度：$O(n \log n)$，主要花在排序上，之后线性扫描一遍。
- 空间复杂度：$O(n)$，用于存储半径。
