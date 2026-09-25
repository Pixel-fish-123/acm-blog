---
tags: [二分, 构造]
difficulty: "提高"
source: "https://www.luogu.com.cn/problem/P17333"
---
# P17333 「TPOI-2C」Secret Illumination 题解

## 题意

构造长度为 $n$ 的数组 $a$，满足 $1 \le a_i \le 10^9$，并且

$$
\sum_{i=1}^{n}\sum_{j=i+1}^{n}[a_i<a_j]\cdot a_j = k .
$$

把同一个下标 $j$ 被计入的次数合并，令

$$
c_j=\#\{\,i<j: a_i<a_j\,\},
$$

条件就等价于简洁的加权形式 $\sum_{j=1}^{n} c_j\,a_j = k$：位置 $j$ 的值会被"它前面所有比它小的位置"各数一次，要求加权和恰为 $k$。

$1\le T\le 50$，$1\le n\le 2\times 10^5$，$0\le k\le 10^{18}$。每组数据输出任意一组合法解，无解输出 $-1$，由 Special Judge 判定。

## 核心思路

**基础观察**：$c_1=0$，所以 $k=0$ 恒可行，全部填 $1$ 即可。只要存在一对 $i<j$ 满足 $a_i<a_j$，贡献里就含一个 $a_j\ge 2$，所以 $k=1$ 一定无解。于是只需处理 $k\ge 2$ 的情形。

**第一步：求出 $k$ 的真正上界。** 记值域上限 $V=10^9$。若某个数组存在相邻位置满足 $a_j\ge a_{j+1}$，交换这两个数会让总和严格变大：设前 $j-1$ 个数中小于 $a_{j+1}$ 的有 $\alpha$ 个、落在 $[a_{j+1},a_j)$ 的有 $\beta$ 个，交换前这两位的贡献是 $a_j(\alpha+\beta)+a_{j+1}\alpha$，交换后是 $a_{j+1}\alpha+a_j(\alpha+\beta+1)$，恰好多了 $a_j\ge 1$；而 $j+2$ 之后的位置看到的前缀多重集完全不变，$c$ 值不受影响。

不断消掉相邻的"非严格递增"位置对，最终得到严格递增的数组且总和不变小。因此讨论最大值时不妨设 $a_1<a_2<\cdots<a_n$，此时每个 $c_j=j-1$，总和为 $\sum_{j=1}^n (j-1)a_j$；再让每个数顶到上限 $a_j\le V-n+j$，得到

$$
f(n)=\sum_{j=1}^{n}(j-1)(V-n+j)=(V-n)\cdot\frac{n(n-1)}{2}+S_n,
\qquad S_n=\sum_{i=1}^{n} i(i-1).
$$

代码里的 `S[]` 正是这个 $S_n$（`S[i]=i*(i-1)+S[i-1]`），因此 $k>f(n)$ 时无解。又因为 $f(m+1)-f(m)=m\cdot10^9-\frac{m(m-1)}{2}>0$（$m\le 2\times10^5$），$f$ 在需要的范围内严格递增，可以二分。

**第二步：确定答案的形状。** 取最小的 $m$ 使得 $f(m)\ge k$，如果二分到 $n$ 都不满足就无解。构造方案是：前 $m$ 位严格递增，第 $m+1$ 到第 $n$ 位全部填 $1$。

末尾的 $1$ 不会再被计入：$1$ 已经是最小可能取值，它前面不存在比它更小的数，这些位置的 $c_j=0$。于是只需要让前 $m$ 位贡献恰好为 $k$。令 $a_1=1$，其余写 $a_i=i+x_i$（$2\le i\le m$），只要 $0\le x_2\le x_3\le\cdots\le x_m$ 就能保证前 $m$ 位严格递增，即 $c_i=i-1$。代回目标式：

$$
\sum_{i=1}^{m}(i-1)(i+x_i)=S_m+\sum_{i=1}^{m}(i-1)x_i=k
\quad\Longleftrightarrow\quad
\sum_{i=1}^{m}(i-1)x_i=K:=k-S_m .
$$

**第三步：从后往前定 $x$。** 于是任务变成用非降的 $x_i$ 凑出权重和：设处理到 $x_i$ 时前 $i$ 位还差 $K$，由 $x_1\le\cdots\le x_i$ 有

$$
\sum_{t=1}^{i}(t-1)x_t\ \le\ x_i\sum_{t=1}^{i}(t-1)=x_i\,d_i,
\qquad d_i=\frac{i(i-1)}{2},
$$

所以必须 $x_i d_i\ge K$，即 $x_i\ge\lceil K/d_i\rceil$；取这个下界（代码 `x[i]=(k+d-1)/d`），余量 $K\leftarrow K-(i-1)x_i$ 交给前面 $i-1$ 位。一直做到 $i=3$，此时 $d_2=1$，最后一位直接取 $x_2=K$（代码 `x[2]=k`），权重逐级降到 $1$，相当于最后用"找零"精确收尾。

**第四步：为什么既不越界也不变负。** 这是本题最容易写挂的地方，分三点说清楚。

- **顶层不越界**：由 $m$ 的最小性与 $f(m)\ge k$，

$$
K=k-S_m\le f(m)-S_m=(V-m)\cdot d_m
\quad\Longrightarrow\quad
x_m=\left\lceil\frac{K}{d_m}\right\rceil\le V-m .
$$

  上界恰好落在允许的最大值 $V-m$ 上，这也解释了为什么必须先二分选出 $m$。

- **单调性自动成立**：设处理完 $i+1$ 后的余量 $K$ 满足归纳不变式 $K\le x_{i+1}\,d_i$，则

$$
x_i=\left\lceil\frac{K}{d_i}\right\rceil\le\left\lceil\frac{x_{i+1}\,d_i}{d_i}\right\rceil=x_{i+1},
$$

  归纳基础是 $K\le x_m d_m$ 与 $K-(m-1)x_m\le x_m d_{m-1}$（用到 $d_m-d_{m-1}=m-1$）。把它和上一条串起来就得到 $x_i\le x_{i+1}\le\cdots\le x_m\le V-m\le V-i$，即 $a_i=i+x_i\le V$，同时保证前 $m$ 位严格递增、$c_i=i-1$ 成立。

- **余量恒非负**：记 $u_i=K_i/d_i$，于是 $x_i=\lceil u_i\rceil<u_i+1$，故

$$
K_{i-1}=K_i-(i-1)x_i>u_i d_i-(i-1)(u_i+1)=u_i\,d_{i-1}-(i-1),
$$

  两边除以 $d_{i-1}$ 得 $u_{i-1}>u_i-\dfrac{2}{i-2}$。初始值由 $m$ 的最小性（$f(m-1)<k$）给出

$$
u_m=\frac{k-S_m}{d_m}>\frac{(V-m+1)d_{m-1}-m(m-1)}{d_m}
=(V-m+1)\cdot\frac{m-2}{m}-2 ,
$$

  逐层累加最多损失 $\sum_{t=3}^{m}\frac{2}{t-2}=2H_{m-2}<30$（$m\le 2\times10^5$），所以全程

$$
u_i>(V-m+1)\cdot\frac{m-2}{m}-32\ \ge\ \frac{V}{3}-32\ \gg\ \frac{2}{i-2},
$$

  余量永远不会掉进危险区，$x_i=\lceil u_i\rceil\ge 1$ 且每一步都能精确走完。边界 $m=2$ 时循环不执行，此时 $k\le f(2)=V$，直接有 $0\le x_2=k-2\le V-2$，同样合法。

**第五步：拼出答案。** 位置 $1$ 输出 $1$，位置 $2\le i\le m$ 输出 $i+x_i$，位置 $i>m$ 输出 $1$。此时 $\sum_{i=1}^{m}(i-1)(i+x_i)=S_m+K=k$，末尾若干 $1$ 贡献 $0$，所有 $a_i\in[1,10^9]$，合法。

**特判与实现**：$k=0$ 输出全 $1$；$k=1$ 输出 $-1$；$n=1$ 且 $k\ne 0$ 输出 $-1$（因为 $f(1)=0$，唯一的合法解就是 $k=0$）。二分区间取 $[1,n+1]$，若最小可行值超过 $n$ 就说明 $f(n)<k$。注意二分判据的量级最高约 $5\times10^{18}$，恰好还在 64 位整数范围内；而代码里 `1e9` 是 double 字面量，该比较实际在 double 下进行，双精度只有约 16 位有效数字，在 $k$ 与 $f(m)$ 相差不到一千时可能因舍入选出偏小的 $m$，要求严格的话可改写成 `(__int128)(1000000000 - mid) * mid * (mid - 1) / 2 + S[mid] >= k`。

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
const LL mod = 998244353;
const int MAXL = 2e5 + 5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

LL S[MAXL];
void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);

    LL n, k;
    cin >> n >> k;

    vector<LL> x(n + 1);

    if (k == 0) {
        for (int i = 1; i <= n; i ++) {
            cout << 1 << " ";
        }
        cout << endl;
        return;
    }

    if (k == 1) {
        cout << -1 << endl;
        return;
    }

    if (n == 1 && k != 0) {
        cout << -1 << endl;
        return;
    }

    LL l = 1, r = n + 1, res = -1;
    while (l <= r) {
        LL mid = l + (r - l) / 2;
        if ((1e9 - mid) * mid * (mid - 1) / 2 + S[mid] >= k) {
            r = mid - 1;
            res = mid;
        }
        else {
            l = mid + 1;
        }
    }

    if (res > n || res == -1) {
        cout << -1 << endl;
        return;
    }

    k -= S[res];

    for (int i = res; i >= 3; i --) {
        LL d = i * (i - 1) / 2;
        x[i] = (k + d - 1) / d;
        k -= (i - 1) * x[i];
    }

    x[2] = k;

    for (int i = 1; i <= n; i ++) {
        if (i == 1 || i > res) {
            cout << 1 << " ";
        }
        else {
            cout << i + x[i] << " "; 
        }
    }
    cout << endl;

    return;
}

int main()
{
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cout.tie(nullptr);
    int _ = 1;
    for (int i = 1; i <= MAXL - 1; i ++) {
        S[i] = i * (i - 1) + S[i - 1];
    }
    cin >> _;
    for (int i = 0; i < _; i ++)
    {
        solve();
    }
    return 0;
}

```

## 复杂度

- 时间复杂度：预处理 $S_n$ 为 $O(n_{\max})=O(2\times10^5)$；每组数据二分 $O(\log n)$，回代构造与输出 $O(n)$。总计 $O\!\left(n_{\max}+\sum n+T\log n\right)$，远小于时限。
- 空间复杂度：$O(n_{\max})$ 的前缀数组，每组数据另需 $O(n)$ 的 $x$ 数组。
