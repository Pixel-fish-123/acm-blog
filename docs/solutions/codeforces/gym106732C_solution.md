# gym106732C Rating 题解

## 题意

一本书接受读者打分，分值为 $1$ 到 $n$ 的整数，任意时刻书的评分是已有打分的算术平均值。共有 $m$ 位读者，第 $i$ 位的类型为 $t_i$，期望评分为 $x_i$：

- $t_i = \texttt{S}$：直接打 $x_i$ 分；
- $t_i = \texttt{D}$：看到当前评分和已投票人数后，在 $1$ 到 $n$ 中选一个整数打分，使打分后书的评分尽量接近 $x_i$。

组织者可以任意安排读者的打分顺序，求最终评分的最小值和最大值，误差不超过 $10^{-9}$。

数据范围：$1 \le n, m \le 2 \times 10^5$，$1 \le x_i \le n$。

## 核心思路

**算法类型**：贪心 + 排序。求最大值时把所有读者按 $x$ 升序排好依次打分；最小值做变换 $x \to n + 1 - x$ 后同样求最大值，再翻回来。

**第一步：动态读者打完分后的总分。**

设已有 $k$ 人投票，总分为 $S$。动态读者打 $r$ 分后评分为 $\frac{S + r}{k + 1}$，与 $x$ 的距离为 $\frac{|S + r - x(k+1)|}{k + 1}$。分母 $k + 1$ 固定，所以只需让 $|r - r^*|$ 最小，其中 $r^* = x(k+1) - S$ 是让评分恰好等于 $x$ 的理想打分。

$r^*$ 一定是整数：$x$ 和 $k$ 是整数；$S$ 是之前所有打分之和，静态读者打的 $x_i$ 是整数，动态读者也只能打 $1$ 到 $n$ 中的整数，所以 $S$ 也是整数。于是不存在「理想值落在两个整数中间、要四舍五入或打破平局」的情况：

- $1 \le r^* \le n$：直接打 $r^*$，评分恰好等于 $x$；
- $r^* < 1$：$|r - r^*|$ 在 $[1, n]$ 上随 $r$ 递增，最近的是 $r = 1$；
- $r^* > n$：$|r - r^*|$ 随 $r$ 递减，最近的是 $r = n$。

三种情况合起来就是 $r = \operatorname{clamp}(r^*, 1, n)$，而且最优的 $r$ 唯一，动态读者的行为是确定的。新的总分为 $S + \operatorname{clamp}(r^*, 1, n) = \operatorname{clamp}(S + r^*,\ S + 1,\ S + n)$，即

$$S' = \operatorname{clamp}\big(x(k+1),\ S + 1,\ S + n\big),$$

其中 $\operatorname{clamp}(v, l, r) = \min(r, \max(l, v))$。总分始终是整数，且不超过 $m \cdot n = 4 \times 10^{10}$，用 `long long` 即可。

**第二步：最大化时按 $x$ 升序打分。**

人数固定为 $m$，最大化最终评分就是最大化最终总分。两种读者的转移（$S + x$ 与上式）都是 $S$ 的单调不减函数，所以只要说明「交换相邻两人，把 $x$ 小的放前面后，这两人打完时的总分不变小」，后面的总分也不会变小。设这两人之前已有 $k$ 人投票、总分为 $S$：

- 两个静态读者：顺序无关。
- 静态读者 $s$ 和动态读者 $d$：先 S 后 D 得到 $\operatorname{clamp}((k+2)d,\ S+s+1,\ S+s+n)$，先 D 后 S 得到 $\operatorname{clamp}((k+1)d + s,\ S+s+1,\ S+s+n)$。上下界相同，比较第一个参数：$s \le d$ 时前者不小，$d \le s$ 时后者不小，都是 $x$ 小的在前更好。
- 两个动态读者 $d_1 \le d_2$：记 $r_1 = \operatorname{clamp}((k+1)d_1, S+1, S+n)$，$r_2 = \operatorname{clamp}((k+1)d_2, S+1, S+n)$，则 $r_1 \le r_2$。先 $d_1$ 得到 $\operatorname{clamp}((k+2)d_2,\ r_1+1,\ r_1+n)$，先 $d_2$ 得到 $\operatorname{clamp}((k+2)d_1,\ r_2+1,\ r_2+n)$。
  - 若 $r_1 = r_2$：上下界相同，而 $(k+2)d_2 \ge (k+2)d_1$。
  - 若 $r_1 < r_2$：$r_2$ 不在下界上，所以 $(k+2)d_2 > (k+1)d_2 \ge r_2$，即 $(k+2)d_2 \ge r_2 + 1$；又 $r_1 + n \ge r_2 + 1$，故先 $d_1$ 的结果至少是 $r_2 + 1$。另外 $r_1 < r_2 \le S + n$，$r_1$ 不在上界上，所以 $(k+2)d_1 \le r_1 + n$（$r_1 = (k+1)d_1$ 时由 $d_1 \le n$ 得出；$r_1 = S+1$ 时 $(k+1)d_1 \le S+1$，加上 $d_1 \le n$ 得出），所以先 $d_1$ 的结果也至少是 $(k+2)d_1$。而先 $d_2$ 的结果不超过 $\max(r_2 + 1,\ (k+2)d_1)$。

三种情况都是 $x$ 小的在前不更差，所以按 $x$ 升序依次处理即可得到最大值。

**第三步：最小值。**

把每个分值 $v$ 换成 $n + 1 - v$，分值范围仍是 $[1, n]$，平均值 $A$ 变成 $n + 1 - A$，「尽量接近 $x$」变成「尽量接近 $n + 1 - x$」，两类读者的行为都保持不变。所以最小值等于 $n + 1$ 减去变换后问题的最大值。代码中 `rev` 存的就是变换后的读者，两次都调用 `max_rating`。

输出时 `setprecision(13)` 与样例格式一致，评分不超过 $2 \times 10^5$，`long double` 的精度足够满足 $10^{-9}$ 的误差要求。

**样例验证。** 第二组 $n = 1000$。最大值：按 $x$ 升序为 D101、S323、D812、D999，总分依次为 $101,\ 424,\ \operatorname{clamp}(2436, 425, 1424) = 1424,\ \operatorname{clamp}(3996, 1425, 2424) = 2424$，评分 $606$。最小值：变换后为 D2、D189、S678、D900，总分依次为 $2,\ 378,\ 1056,\ 2056$，评分 $514$，翻回来是 $1001 - 514 = 487$。

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

long double max_rating(vector<std::pair<LL, char>> arr, LL n)
{
    std::sort(arr.begin(), arr.end());

    LL sum = 0, tot = 0;
    for (int i = 0; i < arr.size(); i ++) {
        LL x = arr[i].first;
        if (arr[i].second == 'S') {
            sum += x;
        }
        else {
            sum = std::min(sum + n, std::max(sum + 1, x * (tot + 1)));
        }
        tot ++;
    }

    return (long double)sum / tot;
}

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);

    LL n;
    int m;
    cin >> n >> m;

    vector<std::pair<LL, char>> arr(m), rev(m);
    for (int i = 0; i < m; i ++) {
        char t;
        LL x;
        cin >> t >> x;
        arr[i] = {x, t};
        rev[i] = {n + 1 - x, t};
    }

    long double mx = max_rating(arr, n);
    long double mn = n + 1 - max_rating(rev, n);

    cout << std::fixed << std::setprecision(13) << mn << " " << mx << endl;

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

- 时间复杂度：两次排序，$O(m \log m)$。
- 空间复杂度：$O(m)$。
