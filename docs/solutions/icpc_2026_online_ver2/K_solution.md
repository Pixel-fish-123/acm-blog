---
tags: [枚举, 二分图]
---
# K MEX 题解

## 题意

给定长度为 $n$ 的数组 $a$，其中 $0\le a_i\le 10^9$。$\mathrm{mex}(a)$ 定义为最小的**不出现**在 $a$ 中的非负整数，例如 $\mathrm{mex}([0,2])=1$。

固定一个参数 $k$，一次 $k$-transformation 指：对每个下标 $i$ **独立地**选择「保持 $a_i$ 不变」或者「把 $a_i$ 变成 $k-a_i$」，由此得到一个长度仍为 $n$ 的数组。记

$$f(k)=\max\{\mathrm{mex}(b): b \text{ 可由 } a \text{ 经一次 } k\text{-transformation 得到}\}.$$

有 $q$ 次询问，每次给出一个 $k$，把每次询问算出的 $f(k)$ 全部异或起来（同一个 $k$ 问多次就异或多次），每组数据输出一行结果。输入包含多组测试数据。

答案不会超过 $n$：若想让结果的 $\mathrm{mex}\ge t$，则 $0,1,\dots,t-1$ 这 $t$ 个值必须由 $t$ 个互不相同的元素分别产出，而数组只有 $n$ 个元素，故 $f(k)\le n$。另外 $a_i$ 虽然可以到 $10^9$ 而 $n$ 不大，但真正有意义的值只有「原数组中出现的值」以及它们的互补值 $k-a_i$，所以只需对出现过的值建立计数表。

## 核心思路

**算法类型**：按「值 $u$ 与 $k-u$ 配对」分组 + 从 $m=\mathrm{mex}(a)$ 起逐个目标扫描，单组数据 $O(n^2+q)$。

### 第一步：每个元素只有两个去向

值为 $u$ 的元素做完选择后只可能变成 $u$ 或 $k-u$，没有第三种可能。映射 $u\mapsto k-u$ 是一个对合（做两次回到自身），它把非负整数分成若干组：

- **二元组** $\{u,k-u\}$，$u\ne k-u$：两个值互相配对；
- **单元组** $\{w\}$：$2w=k$（自己配自己），或者 $w>k$（翻转后是负数，等于没有翻转这条出路）。

关键结论：**同一组里的元素可以服务这一组中的任意目标值**。值 $u$ 的元素能产出 $u$（保留）或 $k-u$（翻转），值 $k-u$ 的元素能产出 $k-u$（保留）或 $u$（翻转）。反过来，两个值 $u_1,u_2$ 的元素能产出同一个目标，当且仅当 $u_1=u_2$ 或 $u_1+u_2=k$，也就是它们同组。**不同组之间毫无交集**，这就是把问题按组拆开的依据。

### 第二步：$\mathrm{mex}\ge t$ 的充要条件

要让结果的 $\mathrm{mex}\ge t$，必须让 $0,1,\dots,t-1$ 每个值都至少出现一次，并且必须由**互不相同的元素**来产出（一个元素最终只能是一个值）。组外元素帮不上忙，而组内是完全二分图，于是 Hall 定理在这里退化成一句计数：

$$\mathrm{mex}\ge t \iff \forall\ \text{组 } C:\quad \#\bigl(C\cap[0,t-1]\bigr)\le N_C ,$$

其中 $N_C$ 是「值属于 $C$ 的元素个数」，也就是组内各值出现次数之和。

把条件按目标值逐个往上检查：设 $w$ 是第一个「加进来就失败」的目标值，就说明 $0,1,\dots,w-1$ 都能覆盖而 $w$ 覆盖不了，于是这次变换所能达到的最大 mex 恰好是 $w$，即 $f(k)=\min(n,w)$。

### 第三步：从 $m=\mathrm{mex}(a)$ 出发

记 $c_v$ 为值 $v$ 在原数组中的出现次数，$m=\mathrm{mex}(a)$，于是 $v<m$ 时 $c_v\ge1$，且 $c_m=0$。

什么都不改就能得到 $\mathrm{mex}=m$，所以 $f(k)\ge m$ 恒成立。想让 $\mathrm{mex}\ge m+1$，就必须额外把目标 $m$ 产出一次，而 $c_m=0$，唯一出路是让某个值为 $x=k-m$ 的元素翻转成 $m$。组就是 $\{m,x\}$（或单元组 $\{m\}$），按 $x$ 的位置分成四种情况：

| $x$ 的位置 | 组的样子 | 目标 $m$ 能产出的条件 | 结论 |
|---|---|---|---|
| $x<0$ | 单元组 $\{m\}$ | 需要 $c_m\ge1$，但 $c_m=0$ | 失败 |
| $x=m$（$k=2m$） | 单元组 $\{m\}$ | 同上 | 失败 |
| $0\le x<m$ | $\{x,m\}$，两个都是目标 | $c_x+c_m\ge2$，即 $c_x\ge2$ | 看 $x$ 有没有富余副本 |
| $x>m$ | $\{m,x\}$，$x$ 还不是目标 | $c_m+c_x\ge1$，即 $c_x\ge1$ | 看 $x$ 是否存在 |

于是定义「**自由元素**」对应的值集合

$$F=\{\,v<m: c_v\ge2\,\}\cup\{\,v\ge m: c_v\ge1\,\},$$

就得到

$$f(k)>m \iff k-m\in F .$$

$F$ 的含义很直观：$v<m$ 的值必须留下至少一份「看家」，才能保住 $0,1,\dots,m-1$ 都存在，多出来的副本才是自由的；$v\ge m$ 的值本来就不必出现，所有出现都是自由的。而 $k=x+m$ 恰好就是「用值 $x$ 的自由元素翻出 $m$」——这也是产出 $m$ 的唯一方式。对于 $k-m\notin F$ 的询问，答案直接就是 $m$；只有 $x\in F$ 对应的那些 $k=x+m$ 需要继续算。由于 $F$ 中的值互不相同（收集时去重），这些 $k$ 也互不相同，可以预处理成一张表。

### 第四步：逐个点名，第一个失败的 $w$ 就是答案

固定 $x\in F$，即 $k=x+m$，此时目标 $m$ 已经能凑出来。接着按 $d=0,1,2,\dots$ 依次检查新目标 $w=m+d$（它对应 $t=m+d+1$），这个目标的搭档是

$$z=k-w=(x+m)-(m+d)=x-d .$$

能产出 $w$ 的元素只有两类：值为 $w$ 的（保留）和值为 $z$ 的（翻转）。所以第 $d$ 步的判定只看 $c_w$ 与 $c_z$：

| 情况 | 含义 | 判定条件 |
|---|---|---|
| $z<0$ | 搭档不存在，是单元组 $\{w\}$ | $c_w\ge1$ |
| $0\le z<w$ | $z$ 已经在目标集合 $[0,w-1]$ 里，两个都得覆盖 | $c_w+c_z\ge2$ |
| $z=w$ | 自配对，只有一个目标 | $c_w+c_z\ge1$ |
| $z>w$ | 搭档还不是目标，可以临时借它的元素 | $c_w+c_z\ge1$ |

**为什么扫一遍就够。** 任取一个 $u\ge m$ 所在的组 $\{u,v\}$（$u<v$，$u+v=k$），它只会在两个时刻被检查到：$d=u-m$ 时 $u$ 作为 $w$ 出现，此时 $z=v>w$（自配对时是 $z=w$）；$d=v-m$ 时 $v$ 作为 $w$ 出现，此时 $z=u<w$。令 $N=c_u+c_v$：

- $N=0$：目标 $u$ 一加入就没人能产出它（$c_w+c_z=0$），阈值是 $u$；
- $N=1$：$d=u-m$ 时 $c_u+c_v=1\ge1$ 能过；到 $d=v-m$ 时两个都成了目标，需要 $2$ 个元素，判定失败，阈值是 $v$；
- $N\ge2$：两次判定都成立，永不失败。

再加上 $0\le x<m$ 的组 $\{x,m\}$ 在 $d=0$ 被检查一次，正好对应「需要 $c_x\ge2$」；$z<0$ 的情形对应 $w>k$ 的单元组，检查 $c_w\ge1$，也覆盖了。所有能让条件失败的原因都在表里，所以第一个失败的 $d$ 就是所有组阈值的最小值。

第 $d$ 步失败说明 $\mathrm{mex}\ge m+d+1$ 不成立，而 $m,m+1,\dots,m+d-1$ 都已经盖住了，于是 $f(k)=m+d$。另外 $w=m+d$ 一旦走到 $n$（即 $d=n-m$）就不必再检查，此时 $f(k)=n$：代码里 `res` 初值取 `n`、内层循环条件写 `low_mex + d < n`，正是这个上限。

### 第五步：实现要点

- **计数表用哈希。** 值域到 $10^9$，只能对出现过的值建表；内层判定最坏要做 $O(n^2)$ 次查询，本代码用 `unordered_map` 做到均摊 $O(1)$，并且统一用 `mex.count(v)` 判存在，避免 `mex[v]` 给不存在的键插入 $0$ 导致的额外开销与污染。
- **自由值集合 `brr`。** 先扫 $0\le v<m$ 收集满足 $c_v\ge2$ 的 $v$，再扫一遍原数组，把 $\ge m$ 的出现值经 `mp` 去重后加入，最后排序。
- **答案表 `safe_k`。** 对每个 $x\in F$ 算出 $f(x+m)$ 存进 `safe_k`；询问时命中就异或 $f(k)$，否则异或 $m$。
- **一个手算例子。** $a=[1,3]$，$n=2$，$m=0$，$F=\{1,3\}$。取 $k=3$，即 $x=3$：$d=0$ 时 $w=0,\ z=3>0$，$c_0+c_3=1$，通过；$d=1$ 时 $w=1,\ z=2>1$，$c_1+c_2=1$，通过；$d=2$ 时 $m+d=2\ge n$ 停止，故 $f(3)=n=2$。构造正是把 $3$ 翻成 $0$、把 $1$ 留下，得到 $[0,1]$，$\mathrm{mex}=2$。

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
    int n, q;
    cin >> n;

    vector<LL> arr(n + 1, 0);
    vector<LL> brr;
    LL low_mex = 0;
    std::unordered_map<LL, LL> mex;
    
    for (int i = 1; i <= n; i ++) {
        cin >> arr[i];
        mex[arr[i]] ++;
    }

    for (int i = 0; i <= n; i ++) {
        if (mex[i]) {
            if (mex[i] >= 2) {
                brr.push_back(i);
            }
        }
        else {
            low_mex = i;
            break;
        }
    }

    std::map<LL, LL> mp;
    for (int i = 1; i <= n; i ++) {
        if (mp.count(arr[i]) == 0 && arr[i] >= low_mex) {
            brr.push_back(arr[i]);
            mp[arr[i]] = 1;
        }
    }

    std::sort(brr.begin(), brr.end());

    std::map<LL, LL> safe_k;

    for (auto x : brr) {
        LL res = n;
        for (LL d = 0; low_mex + d < n; d ++) {
            LL w = low_mex + d;
            LL z = x - d;

            LL cw = 0, cz = 0;
            if (mex.count(w)) {
                cw = mex[w];
            }
            if (z >= 0 && mex.count(z)) {
                cz = mex[z];
            }

            int ok = 0;
            if (z < 0) ok = (cw >= 1);
            else if (z < w) ok = (cw + cz >= 2);
            else if (z == w) ok = (cw + cz >= 1);
            else ok = (cw + cz >= 1);

            if (!ok) {
                res = d + low_mex;
                break;
            }
        }
        safe_k[low_mex + x] = res;
    }

    cin >> q;
    LL res = 0;
    while (q --) {
        LL k;
        cin >> k;
        if (safe_k.count(k)) {
            res ^= safe_k[k];
        }
        else {
            res ^= low_mex;
        }
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
    cin >> _;
    for (int i = 0; i < _; i ++)
    {
        solve();
    }
    return 0;
}
```

## 复杂度

- **时间复杂度**：统计出现次数并求 $m$ 为 $O(n)$；收集 $F$ 需要一次排序，为 $O(n\log n)$；核心扫描中 $|F|\le n$，每个 $x$ 的内层最多从 $w=m$ 走到 $w=n$，即 $O(n-m)$ 步，合计 $O\bigl(|F|(n-m)\bigr)\le O(n^2)$，单步是哈希表均摊 $O(1)$；询问每次查一次 `safe_k` 并异或，共 $O(q)$。单组数据 $O(n^2+q)$。
- **空间复杂度**：`arr` 长度为 $n+1$，计数表、`brr`、`safe_k` 各自至多 $O(n)$ 项，合计 $O(n)$。
- **常数提示**：内层判定在最坏情况下约 $n^2$ 量级（数据规模为 $n$ 约 $5\times10^3$、$\sum n$ 同量级时约 $2.5\times10^7$ 次），哈希表下十分宽松；若把计数表换成 `std::map`，常数会明显变大。
