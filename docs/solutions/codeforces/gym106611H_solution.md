# gym106611H Hurricane Signal 题解

## 题意
平面上香城位于 $(H_x, H_y)$，台风当前位于 $(C_x, C_y)$（$-1000 \le H_x, H_y, C_x, C_y \le 1000$）。预测台风沿与 $x$ 轴正半轴逆时针夹角为 $D^\circ$（$0 \le D < 360$）的射线直线移动，但实际运动方向会在 $[D - U, D + U]$ 度（$0 < U < 90$）之间均匀随机。当台风在当前位置或未来移动路径上与香城的欧氏距离不超过 $1$ 时，就会触发台风信号。求触发台风信号的概率，绝对或相对误差不超过 $10^{-6}$。

## 核心思路
**算法类型**：数学 + 概率期望（几何切线张角与周期区间求交）。

设 $d = \sqrt{(H_x - C_x)^2 + (H_y - C_y)^2}$ 为台风初始位置到香城的距离：
- 若 $d \le 1$，台风一开始就已经在半径为 $1$ 的圆内，无论沿哪个方向走都会触发信号，概率直接为 $1$。
- 若 $d > 1$，以 $H$ 为圆心、$1$ 为半径作圆。从点 $C$ 出发的射线能与该圆相交，当且仅当射线方向与向量 $\overrightarrow{CH}$ 的夹角不超过 $\arcsin(1 / d)$。

具体计算如下（统一用角度制）：
1. 用 `atan2(Hy - Cy, Hx - Cx)` 求出 $\overrightarrow{CH}$ 的方向角 $\theta \in [0, 360)$（若小于 $0$ 则加 $360$），半张角 $\delta = \arcsin(1 / d) \cdot \frac{180}{\pi}$。能触发信号的方向角区间为 $[\theta - \delta, \theta + \delta]$。
2. 台风实际可能的方向角区间为 $[D - U, D + U]$，总长度为 $2U$。
3. 由于角度模 $360^\circ$ 循环，区间左端点可能小于 $0$、右端点可能大于 $360$（因为 $\delta < 90$ 且 $U < 90$，每个区间最多跨过 $0^\circ / 360^\circ$ 分界线一次）。将越界的部分拆成 $[0, 360]$ 内的两段子区间：若 $lo < 0$，拆为 $[0, hi]$ 与 $[360 + lo, 360]$；若 $hi > 360$，拆为 $[lo, 360]$ 与 $[0, hi - 360]$。
4. 对两组拆分后的子区间两两求交（共 $2 \times 2 = 4$ 对），累加交集长度 $\max(0, \min(r_1, r_2) - \max(l_1, l_2))$，最后除以总长度 $2U$ 即为所求概率。

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

const long double EPS = 1e-6;
const long double pi = acos(-1);

long double distance(long double x, long double y, long double x_, long double y_) {
    long double subx = x - x_, suby = y - y_;
    long double res = sqrt((subx * subx) + (suby * suby));
    return res;
}

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);

    long double Hx, Hy, Cx, Cy;
    cin >> Hx >> Hy >> Cx >> Cy;

    long double D, U;
    cin >> D >> U;

    long double degree = 0.0, delta;
    long double dis = distance(Hx, Hy, Cx, Cy);
    
    if (dis - 1.0 <= EPS) {
        cout << 1 << endl;
        return;
    }

    delta = asin(1.0/dis) * 180.0 / pi;
    degree = atan2(Hy - Cy, Hx - Cx) * 180.0 / pi;

    if (degree < 0) degree = 360.0 + degree;

    long double lo = degree - delta, hi = degree + delta;
    long double wlo = D - U, whi = D + U;

    long double lo2 = 0, hi2 = 0, wlo2 = 0, whi2 = 0;

    if (lo < 0) {
        lo2 = 360.0 + lo;
        hi2 = 360.0;
        lo = 0;
    }
    if (hi > 360.0) {
        lo2 = 0;
        hi2 = hi - 360.0;
        hi = 360.0;
    }

    if (wlo < 0) {
        wlo2 = 360.0 + wlo;
        whi2 = 360.0;
        wlo = 0;
    }
    if (whi > 360.0) {
        wlo2 = 0;
        whi2 = whi - 360.0;
        whi = 360.0;
    }

    long double ans = 0.0;

    long double l = -1000.0, r = 1000.0;

    l = std::max(lo, wlo);
    r = std::min(hi, whi);

    if (l < r) ans += (r - l);

    l = -1000.0, r = 1000.0;
    l = std::max(lo, wlo2);
    r = std::min(hi, whi2);

    if (l < r) ans += (r - l);

    l = -1000.0, r = 1000.0;
    l = std::max(lo2, wlo);
    r = std::min(hi2, whi);

    if (l < r) ans += (r - l); 

    l = -1000.0, r = 1000.0;
    l = std::max(lo2, wlo2);
    r = std::min(hi2, whi2);

    if (l < r) ans += (r - l); 

    cout << ans / 2.0 / U << endl;

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
- 时间复杂度：$O(1)$，仅做常数次三角函数与区间求交计算。
- 空间复杂度：$O(1)$。

预估难度：CF 1400（约 1400*）。本题难度由 AI 预估，仅作为参考。
