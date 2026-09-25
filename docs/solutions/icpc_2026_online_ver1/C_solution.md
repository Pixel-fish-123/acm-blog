---
tags: [拓扑排序, 堆]
---
# C Permutation Inversions 题解

## 题意

有一个未知的排列 $p=(p_1,p_2,\dots,p_n)$（$1\sim n$ 的排列），并给出 $m$ 条信息。第 $i$ 条信息给出一个区间 $[l_i,r_i]$ 和该区间内下标的一个排列 $q_{i,1},q_{i,2},\dots,q_{i,r_i-l_i+1}$，含义是

$$p_{q_{i,1}}<p_{q_{i,2}}<\cdots<p_{q_{i,r_i-l_i+1}}$$

（$q_{i,1},\dots,q_{i,r_i-l_i+1}$ 恰好是 $l_i,l_i+1,\dots,r_i$ 的一个排列。）

求一个满足所有信息、且**逆序对数最少**的排列 $p$；若不存在，输出 $-1$；若有多解，输出任意一个。逆序对数定义为满足 $1\le x<y\le n$ 且 $p_x>p_y$ 的下标对 $(x,y)$ 的个数。

多测：$1\le T\le 10^6$，$1\le n,m\le 10^6$，且所有测试点合计 $\sum n$、$\sum m$、$\sum (r_i-l_i+1)$ 都不超过 $10^6$。

样例：$n=4$、只有一条信息 $p_3<p_2<p_4$ 时答案是 `1 3 2 4`（逆序对只有 $(2,3)$ 一个）；$n=3$、信息为 $p_1<p_2<p_3$ 与 $p_3<p_2<p_1$ 时无解，输出 `-1`。

## 核心思路

**算法类型**：不等式约束转 DAG + 拓扑排序（小根堆 Kahn），$O(n\log n+\sum(r_i-l_i+1))$。

### 第一步：每条信息就是一条链

第 $i$ 条信息等价于 $q_{i,1}\to q_{i,2}\to\cdots\to q_{i,r_i-l_i+1}$ 这样一条链，其中每条有向边 $u\to v$ 表示 $p_u<p_v$。把所有链上的边合并成一张有向图（只连链上相邻的两个点就够，更远的先后关系由传递性自动得到）。于是：

- 有解 $\iff$ 这张图无环。因为约束是严格不等式，成环就无解；无环时随便取一个拓扑序就能构造出合法排列。所以 Kahn 结束后如果取出的点不足 $n$ 个，就输出 $-1$。

### 第二步：换个角度看排列

设 $\sigma$ 是把各个位置按 $p$ 的值从小到大排出来的序列，即 $p_{\sigma_1}<p_{\sigma_2}<\cdots<p_{\sigma_n}$，等价地 $p_{\sigma_k}=k$。那么：

- $\sigma$ 必须是一个拓扑序（边 $u\to v$ 说明 $u$ 的值更小，$u$ 要排在前面）；反过来，**每个拓扑序 $\sigma$ 都唯一对应一个合法排列** $p_{\sigma_k}=k$；
- **排列的逆序对数恰好等于序列 $\sigma$ 的逆序对数**：

$$\#\{x<y:p_x>p_y\}=\#\{i<j:\sigma_i>\sigma_j\}$$

因为 $p_x>p_y$ 恰好意味着「位置 $y$ 排在了位置 $x$ 的前面」。

于是问题变成：**求逆序对最少的拓扑序**，再令 $p_{\sigma_k}=k$ 输出即可。代码的做法是每次从当前入度为 $0$ 的点中取**下标最小**的（小根堆），得到**字典序最小的拓扑序**；输出时 `arr[res[i]] = i + 1`，正是把名次写回位置。

### 第三步：为什么字典序最小的拓扑序就是逆序对最少的

把位置对分成两类：

- **可比对**：在偏序里被约束直接或传递地规定了先后（例如同在一条链的区间里）。它们的顺序在任何合法方案里都被钉死，其中「下标小的反而必须排在后面」的那些，是任何方案都躲不掉的逆序对；
- **不可比对**：没有任何约束要求它们的先后关系，我们希望它们保持自然顺序（下标小的在前）。

**关键性质**：在字典序最小的拓扑序里，任何一对不可比的位置都保持下标顺序。

> 思路：设贪心正要取走 $g$（当前所有入度为 $0$ 的点中下标最小的那个），而某个 $x<g$ 还没被取走。若 $x$ 此刻可入堆，堆顶就会是 $x$ 而不是 $g$，所以 $x$ 一定还有没被取走的入边前驱 $u$（$u\to x$ 是某条链上的一条边，这条链所在的区间 $[l,r]$ 是连续区间且同时包含 $u$ 与 $x$）。若 $u$ 可入堆，由堆顶最小知 $g\le u$，而 $x<g\le u$，于是 $g$ 也落在 $[l,r]$ 里，与 $x$ 同处一条链、被约束规定可比；若 $u$ 也正被更前面的点挡着，就把这条「没被取走的前驱」链一直往上前溯到某个可入堆的点 $u'\ge g$，每一段区间都是连续区间，同样能把 $g$ 夹进其中一段从而得到 $g$ 与 $x$ 可比。结论：**还没取走、且下标比 $g$ 小的位置，全都被约束强制排在 $g$ 后面**。

有了这条性质就可以做交换论证。设最优拓扑序 $\sigma^*$ 与贪心序 $\sigma$ 在最前面 $k-1$ 位相同、第 $k$ 位不同；贪心在第 $k$ 位取的是 $g$，而 $\sigma^*$ 把 $g$ 放在第 $j>k$ 位。把 $g$ 从第 $j$ 位挪到第 $k$ 位（中间那段元素整体后移一位），只有 $g$ 与中间这段元素 $S$ 之间的相对顺序变了：原来 $g$ 在它们后面，与其中 $>g$ 的元素构成逆序对；挪完之后 $g$ 在它们前面，改为与其中 $<g$ 的元素构成逆序对。所以逆序对数变化为

$$\Delta=\#\{w\in S:w<g\}-\#\{w\in S:w>g\}$$

而 $S$ 里每个元素在贪心里的位置都 $>k$（因为前 $k-1$ 位与最优解一致，$g$ 是第 $k$ 位），也就是它们在贪心取 $g$ 时都还没被取走；若其中有 $w<g$，由关键性质 $w$ 与 $g$ 可比且被强制排在 $g$ 之后，那么在任何合法方案（包括 $\sigma^*$）里 $w$ 都必须排在 $g$ 后面，与 $w\in S$ 矛盾。故 $\#\{w\in S:w<g\}=0$，即 $\Delta\le 0$：这一步交换不会让逆序对变多。反复交换，可把任意最优解改造成贪心解，所以贪心解也最优 ✓。

换言之：贪心序里的逆序对**恰好**是那些「被约束钉死、方向又与下标相反」的位置对，而这部分逆序对不可避免，因此逆序对数取得最小值。

### 实现细节

- 多测时只要清空 $1\sim n$ 的邻接表和入度即可（代码用全局数组，逐个 `G[i].clear()`、`deg[i] = 0`），因为总边数 $\sum(r_i-l_i+1)$ 与 $\sum n$ 都是 $10^6$ 级别；
- `l == r` 的信息只有一项、不产生任何边，代码里的循环 `for (int j = l; j < r; j ++)` 天然跳过；
- 判断无解用「出队点数 $<n$」，而不是单独判环，省一次遍历。

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
const int MAXL = 1e6 + 5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

vector<int> G[MAXL];
int deg[MAXL];

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int n, m;
    cin >> n >> m;

    for (int i = 1; i <= n; i ++) {
        G[i].clear();
        deg[i] = 0;
    }

    for (int i = 0; i < m; i ++) {
        int l, r;
        cin >> l >> r;

        int u;
        cin >> u;
        int last = u;
        for (int j = l; j < r; j ++) {
            cin >> u;
            G[last].push_back(u);
            deg[u] ++;
            last = u;
        }
    }

    std::priority_queue<int, vector<int>, std::greater<int>> q;
    
    for (int i = 1; i <= n; i ++) {
        if (deg[i] == 0) {
            q.push(i);
        }
    }

    vector<int> res, arr(n + 1, 0);

    while (q.size()) {
        int x = q.top();
        q.pop();
        res.push_back(x);

        for (int i = 0; i < G[x].size(); i ++) {
            int next = G[x][i];
            deg[next] --;
            if (deg[next] == 0) {
                q.push(next);
            }
        }
    }

    if (res.size() < n) {
        cout << -1 << endl;
    }
    else {
        for (int i = 0; i < res.size(); i ++) {
            arr[res[i]] = i + 1;
        }
        for (int i = 1; i <= n; i ++) {
            cout << arr[i] << " ";
        }
        cout << endl;
    }

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

- **时间复杂度**：建图 $O(n+m+\sum_{i=1}^{m}(r_i-l_i+1))$，Kahn 每次用堆取最小值，共 $O(n\log n)$，输出 $O(n)$；总复杂度 $O\!\left(\sum n\log n+\sum m+\sum(r_i-l_i+1)\right)$，在 $\sum n\le 10^6$ 下可以通过。
- **空间复杂度**：邻接表存 $O(\sum(r_i-l_i+1))$ 条边，`deg`、`arr` 与堆均为 $O(n)$；全局数组 `G` 是 $10^6+5$ 个 `vector`（约 $24$ MB）加边表本身。
