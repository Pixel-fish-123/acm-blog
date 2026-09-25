---
tags: [贪心, 枚举]
difficulty: "普及-"
source: "https://www.luogu.com.cn/problem/P11768"
---
# P11768 破自行车 题解

## 题意

从 $(0,0)$ 出发到 $(a,b)$。每分钟可向上下左右移动一格；骑破自行车可从 $(x,y)$ 瞬间冲到 $(x\pm l,y)$ 或 $(x,y\pm l)$，不耗时，最多用 $k$ 次。求最短时间（$1\le T\le 10^5$，$0\le a,b,k,l\le 10^9$）。

## 核心思路

**算法类型**：贪心 + 候选点枚举，单组询问 $O(1)$。

**观察一：目标落点的形态**。骑车不花时间，走路按曼哈顿距离每格 $1$ 分钟，所以答案就是

$$\min_{(X,Y)\text{ 可达}} |a-X|+|b-Y|$$

每次跳跃沿**单个轴**移动 $\pm l$，所以任意次跳跃后的落点两轴坐标都是 $l$ 的倍数；反之，到达 $m\cdot l$（$m\ge 0$）只需恰好 $m$ 次同向跳跃（不存在奇偶性障碍）。

**观察二：每轴只有两个候选**。设 $q=\lfloor a/l\rfloor$（$l\ne 0$），落点的 $x$ 坐标只需考虑：

- $q\cdot l$：不超过 $a$ 的最大倍数，剩余步行 $a\bmod l$；
- $(q+1)\cdot l$：超过 $a$ 的最小倍数，回退步行 $l-a\bmod l$。

更远的倍数点步行距离严格更大（每远一个 $l$ 步行至少多 $l$ 减去至多 $l$ 的收益），无需考虑。$y$ 轴同理。

**观察三：跳跃预算**。基础组合 $(q_x l,\ q_y l)$ 消耗 $q_x+q_y$ 次跳跃；某个轴改用"越界"落点多消耗 $1$ 次。于是按预算枚举四种组合取最小值。代码的分配顺序是：先给 $x$ 轴 $\min(k,\lfloor a/l\rfloor)$ 次、再给 $y$ 轴、最后若还有剩余才启用越界候选 `next[1]`——跳跃稀缺时（$k<q_x+q_y$）每次跳跃无论花在哪个轴都恰好把总步行减少 $l$，因此贪心分配不劣。

**边界**：$l=0$ 时跳跃无意义，所有候选都是 $0$；$a<l$ 时 $q=0$（不消耗跳跃次数）；使用次数"最多 $k$ 次"，用不满可以不用。

## 参考代码

```cpp
#include<math.h>
#include<iostream>
#include<cstring>
#include<stdio.h>
#include<algorithm>
#include<vector>
#include<queue>
#include<iomanip>
#include<string>
#include<map>
#include<stack>
#include<set>
#include<bitset>
#include<random>
#define LL long long
#define ULL unsigned long long
#define pair_int pair<int, int>
#define pair_LL pair<LL, LL>
const int INF_INT = 0x3f3f3f3f;
const LL INF_LL = 1e18;
const LL mod = 998244353;
const LL MAXL = 0;
using std::cin;
using std::cout;
using std::endl;
void solve() 
{
    LL next_x[2] = {-1, -1}, next_y[2] = {-1, -1};
    LL a, b, k, l;
    LL ans = INF_LL;
    cin >> a >> b >> k >> l;
    if(l && k >= a / l) {
        next_x[0] = a - a % l; 
        k -= a / l;
    }
    else {
        next_x[0] = k * l;
        k = 0;
    }
    if(l && k >= b / l) {
        next_y[0] = b - b % l;
        k -= b / l; 
    }
    else {
        next_y[0] = k * l;
        k = 0;
    }
    if(k) {
        next_x[1] = next_x[0] + l;
    }
    if(k) {
        next_y[1] = next_y[0] + l;
    }
    //cout << next_x[0] << " " << next_y[0] << endl;
    //cout << next_x[1] << " " << next_y[1] << endl;
    ans = std::min(abs(a - next_x[0]) + abs(b - next_y[0]), ans);
    if(next_y[1]) ans = std::min(abs(a - next_x[0]) + abs(b - next_y[1]), ans);
    if(next_x[1]) ans = std::min(abs(a - next_x[1]) + abs(b - next_y[0]), ans);
    if(next_y[1] && next_x[1] && k > 1) ans = std::min(abs(a - next_x[1]) + abs(b - next_y[1]), ans);
    cout << ans << endl;
    return;
}
int main() 
{
    /*std::ios::sync_with_stdio(false); cin.tie(nullptr); cout.tie(nullptr);
    freopen("test.in", "r", stdin);
    freopen("output.out", "w", stdout);*/
    int _ = 1;
    cin >> _;
    for (int i = 0; i < _; i++) {
        solve();
    }
    getchar();getchar();
    return 0;
}
```

## 复杂度

- 时间复杂度：每组询问 $O(1)$，总计 $O(T)$。
- 空间复杂度：$O(1)$。
