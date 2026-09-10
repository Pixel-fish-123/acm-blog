# L Longest Common Prefix 题解

## 题意

给定 $n$ 个字符串 $s_1,s_2,\dots,s_n$，按顺序处理。对每个 $1\le i\le n$ 和每个 $1\le j\le i$，从下标集合 $\{1,2,\dots,i\}$ 中选出**恰好 $j$ 个**字符串组成集合 $T$，记 $\mathrm{LCP}(T)$ 为 $T$ 中所有字符串的最长公共前缀长度，令

$$f_{i,j}=\max_{|T|=j}\ \mathrm{LCP}(T)$$

要求对每个 $i$ 输出一行

$$\sum_{j=1}^{i} f_{i,j}\oplus j$$

**数据范围**：$1\le n\le 5\times 10^5$，$1\le \sum_{i=1}^{n}|s_i|\le 5\times 10^5$。

几点读题说明：

- $T$ 只能从**前 $i$ 个**串里选，且大小必须恰好为 $j$；$f_{i,j}$ 是一个长度值（这些串公共前缀的长度），不是若干个前缀长度之和；
- 不同的 $j$ 彼此独立，各自取自己那组的最优集合；
- 特例：$f_{i,1}$ 就是前 $i$ 个串中最长串的长度，$f_{i,i}$ 只有唯一一种选法，即这 $i$ 个串整体的 LCP。

## 核心思路

**算法类型**：Trie（字典树）+ 计数转化 + 增量单点修正，总复杂度 $O(\sum|s_i|)$。

### 第一步：把「选集合」翻译成「数个数」

枚举 $T$ 是指数级的，换一个角度：把前 $i$ 个串全部插入 Trie，深度为 $k$ 的节点 $v$ 对应一个长度为 $k$ 的前缀，`cnt[v]` 恰好是**以该前缀为前缀的串数**。于是有等价刻画

> 存在 $j$ 个串的公共前缀长度 $\ge k$，当且仅当深度 $k$ 上存在节点满足 `cnt[v] >= j`。

（$\Leftarrow$：取经过 $v$ 的任意 $j$ 个串，它们的前 $k$ 个字符相同；$\Rightarrow$：这 $j$ 个串的前 $k$ 个字符相同，在 Trie 中必然落在同一个深度 $k$ 的节点上。）

记深度 $k$ 上所有节点 `cnt` 的最大值为 $r_k$，并记当前最长串长度为 $maxd$。根节点表示空串，被所有串共享，故 $r_0=i$。由上述刻画立刻得到

$$f_{i,j}=\max\{\,k\mid r_k\ge j\,\}$$

证明：设 $f_{i,j}=L$，取到最优的那 $j$ 个串的 LCP 恰为 $L$，它们同处一个深度 $L$ 的节点，故 $r_L\ge j$；反过来，任何满足 $r_k\ge j$ 的 $k$ 都能给出一个 LCP $\ge k$ 的 $j$ 元集合。两边夹起来即得。

### 第二步：$f$ 就是阶梯上的区间编号

前缀越长越难被共享：子节点的 `cnt` 不超过父节点的 `cnt`，所以 $r_0\ge r_1\ge\cdots\ge r_{maxd}$ 单调不增。对固定的 $j$，满足 $r_k\ge j$ 的深度是从浅到深连续的一段（一旦某层掉到 $j$ 以下，更深的层只会更小），因此

$$f_{i,j}=k\iff r_{k+1}<j\le r_k$$

也就是说：把各深度的 $r$ 看成一级级台阶、把 $j$ 看成一根横线，$j$ 落在哪一级台阶的高度区间 $(r_{k+1},\,r_k]$ 里，$f_{i,j}$ 就等于那一级的编号。约定 $r_{maxd+1}=0$，则这些区间两两不交，且并集恰为 $\{1,\dots,i\}$。同一区间内 $f_{i,j}$ 恒为常数 $k$，可以把它提到内层求和之外：

$$\sum_{j=1}^{i} f_{i,j}\oplus j=\sum_{k=0}^{maxd}\ \sum_{j=r_{k+1}+1}^{r_k} k\oplus j$$

**算例**：三个串 `ab`、`ab`、`ac`（$i=3$）。根节点 `cnt=3`，`a` 节点 `cnt=3`，`ab` 节点 `cnt=2`，`ac` 节点 `cnt=1`，于是 $r_0=3,\ r_1=3,\ r_2=2$，分组为

| $k$ | 区间 $(r_{k+1},\,r_k]$ | 对应的 $f_{3,j}$ | 贡献 |
| --- | --- | --- | --- |
| $2$ | $(0,2]=\{1,2\}$ | $f_{3,1}=f_{3,2}=2$ | $2\oplus1+2\oplus2=3+0=3$ |
| $1$ | $(2,3]=\{3\}$ | $f_{3,3}=1$ | $1\oplus3=2$ |
| $0$ | $(3,3]=\varnothing$ | 无 | $0$ |

答案为 $3+0+2=5$，与直接枚举子集得到的结果一致。

### 第三步：插入一个串时只有一个点会搬家

按上面的分组逐层重算是 $O(n\cdot maxd)$，会超时。注意插入 $s_i$ 时它在每一层只经过**一个**节点，只有该节点的 `cnt` 会 $+1$；若该层旧最大值为 $r$，则新最大值只能是 $r$ 或 $r+1$（路径上那个节点的旧值 $c\le r$，加一后 $c+1\le r+1$）。

若深度 $k$ 的最大值由 $r$ 涨到 $r+1$，两个相邻区间变成

| | 深度 $k-1$ 的区间 | 深度 $k$ 的区间 |
| --- | --- | --- |
| 更新前 | $(r,\ r_{k-1}]$ | $(r_{k+1},\ r]$ |
| 更新后 | $(r+1,\ r_{k-1}]$ | $(r_{k+1},\ r+1]$ |

**只有 $j=r+1$ 这一个点**从深度 $k-1$ 的组划到了深度 $k$ 的组，其余 $j$ 的 $f_{i,j}$ 完全不变。于是答案只需一次 $O(1)$ 的单点修正（代码里先执行 `r[k] ++`，所以参与修正的 `r[k]` 已经是 $r+1$）：

$$ans\ \mathrel{-}=\ (k-1)\oplus r_k,\qquad ans\ \mathrel{+}=\ k\oplus r_k$$

### 第四步：边插边改的正确性

代码沿字符串自顶向下处理深度，父节点先于子节点更新。由于父 `cnt` $\ge$ 子 `cnt` 且父层已先处理，不变量 $r_{k-1}\ge r_k$ 始终保持；进一步可以说明，深度 $k$ 真的触发上涨时必有 $r_{k-1}\ge r_k+1$（都用当前值），即点 $j=r_k+1$ 更新前确实还在深度 $k-1$ 的区间里，不会越界：

> 反证：若 $r_{k-1}=r_k=r$。设当前节点为 $cur$、其父节点为 $p$。触发上涨意味着 `cnt[cur] > r`，而 $p$ 的计数不会少于 $cur$（经过子节点的串必然经过父节点），故 `cnt[p] > r`；但深度 $k-1$ 上的最大值就是 $r$，矛盾。

上涨之后，深度 $k-1$ 的新区间是 $(r+1,\ r_{k-1}]$；当 $r_{k-1}=r+1$ 时它退化成空区间 $(r+1,r+1]=\varnothing$，贡献为 $0$，不会造成任何影响。

### 第五步：根节点哨兵与链式修正

每次插入前先执行 `r[0] = i; ans += i ^ 0;`，即把 $j=i$ 放进深度 $0$ 的区间 $(r_1,i]$，含义是**先假设全体 $i$ 个串没有公共前缀**，令 $f_{i,i}=0$。若这 $i$ 个串真的共享长度为 $3$ 的前缀，插入过程中深度 $1,2,3$ 的 $r$ 会依次涨到 $i$，点 $j=i$ 被连续搬运三次，$f_{i,i}$ 自动从 $0$ 变成 $3$——链式修正天然成立，不必对公共前缀做任何特判。

同样的机制也覆盖了「新串更长」的情形：若某深度 $k$ 之前完全没有节点（$r_k=0$），新节点让 $r_k$ 变成 $1$，修正会把 $j=1$ 搬到这一层，于是 $f_{i,1}$ 自动更新为新最长串的长度。

另外，由第一步的观察可知每层最大值一次只涨 $1$，所以插入 $s_i$ 全程至多触发 $|s_i|$ 次修正；每次修正只改动一个 $j$ 的归属，因此「插入完再统一重算」与「边插边改」得到的结果完全相同。

### 两个实现细节

- `if (cnt[cur] > r[k]) r[k] ++;` 与 `r[k] = cnt[cur];` 在保留 `if` 的前提下等价：进入分支意味着 `cnt[cur] > r[k]`，而由第三步 `cnt[cur] <= r[k] + 1`，故 `cnt[cur]` 恰为 $r+1$。但这个 `if` 不能去掉——设想深度 $1$ 上 `a` 节点 `cnt=5`、`b` 节点 `cnt=1`（$r_1=5$），此时插入一个 `b` 开头的串，`b` 的 `cnt` 才 $2$，直接赋值会把 $r_1$ 从 $5$ 降到 $2$，破坏「$r$ 是最大值」和单调性。想省掉这个分支，也可以写成 `r[k] = std::max(r[k], cnt[cur]);`。
- 同一思路并不依赖 Trie：用哈希表维护「每个前缀的出现次数」和 `lcd[j]`（出现次数达到 $j$ 的最长前缀长度，即 $f_{\cdot,j}$ 本身），当前缀出现次数涨到新的 $j$ 时同样做 `ans -= j ^ 旧长度; ans += j ^ 新长度` 的单点修正，内存可降到 $O(\sum|s_i|)$。

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
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

const int MAXL = 5e5 + 10;

LL n, ans;
LL trie[MAXL][26], tot = 1;
LL cnt[MAXL], depth[MAXL];
int maxd;
LL r[MAXL];

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int n;
    std::string s;
    cin >> n;

    for (int i = 1; i <= n; i ++) {
        r[0] = i;
        ans += i ^ 0;
        cin >> s;
        LL cur = 1;
        for (int j = 0; j < s.size(); j ++) {
            LL now = s[j] - 'a';
            if (!trie[cur][now]) {
                trie[cur][now] = ++ tot;
                depth[tot] = j + 1;
                maxd = std::max(maxd, j + 1);
            }
            cur = trie[cur][now];
            cnt[cur] ++;
            if (cnt[cur] > r[depth[cur]]) {
                r[depth[cur]] ++;
                ans = ans - ((depth[cur] - 1) ^ r[depth[cur]]) + (depth[cur] ^ r[depth[cur]]);
            }
        } 
        cout << ans << endl;
    }

   

    return;
}

int main()
{
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cout.tie(nullptr);
    int _ = 1;
    //cin >> _;
    for (int i = 0; i < _; i ++)
    {
        solve();
    }
    return 0;
}
```

## 复杂度

- **时间复杂度**：每个字符只做一次 Trie 下移，至多触发一次 $O(1)$ 的单点修正，故插入 $s_i$ 用时 $O(|s_i|)$，总计 $O(\sum_{i=1}^{n}|s_i|)$；每次插入后 $O(1)$ 输出答案。
- **空间复杂度**：Trie 节点数不超过 $\sum|s_i|+1$，每个节点 $26$ 个儿子，为 $O(26\sum|s_i|)$；`r` 数组为 $O(maxd)\le O(n)$，其余变量为 $O(1)$。按满规模 $\sum|s_i|=5\times10^5$ 估计，代码中 `trie` 为 `long long` 类型，约占 $5\times10^5\times26\times8\ \mathrm{B}\approx104\ \mathrm{MB}$。
