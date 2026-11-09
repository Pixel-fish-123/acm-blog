# gym106797B Bye Bye Bilbo 题解

## 题意
有 $n$ 个洞穴（$2 \le n \le 10^5$），编号 $1$ 到 $n$，其中 $1$ 号是城镇（根节点），每个洞穴 $i > 1$ 都有唯一父节点 $p_i$（满足 $1 \le p_i < i$）。烟花的可见范围为 $k$（$1 \le k \le n$）：在洞穴 $j$ 放烟花时，若 $j$ 在洞穴 $i$ 到城镇 $1$ 的路径上，且 $i$ 与 $j$ 之间的边数严格小于 $k$（即距离 $\le k-1$），则洞穴 $i$ 的霍比特人能看到该烟花。求至少要在多少个洞穴放烟花才能让所有人都看到，并输出任意一种方案。

## 核心思路
**算法类型**：贪心 + 树形DP（自底向上按最深未覆盖节点放置）。

每个节点 $i$ 只能看到自己祖先方向上距离不超过 $k-1$ 的烟花。考虑树中最深的还未被覆盖的节点：为了让覆盖它的那朵烟花顺便覆盖尽可能多的其他节点，应当把烟花放在它往上走 $k-1$ 步的祖先 $u$ 处（再往上走就覆盖不到该节点了，而在 $u$ 放烟花能把整个子树 $u$ 内所有还未覆盖的节点一并覆盖，因为该节点已经是子树里最深的未覆盖点）。

由于题目保证 $p_i < i$，编号从 $2$ 到 $n$ 天然是拓扑序，从 $n$ 到 $2$ 逆序遍历就是自底向上的后序顺序：
1. 先正向扫一遍求出每个点的深度 $d[i] = d[p_i] + 1$，并初始化 $f[i] = d[i]$，表示子树 $i$ 中当前未被覆盖的最深节点的深度。
2. 按 $u = n, n-1, \dots, 2$ 倒序处理：
   - 若 $f[u] - d[u] \ge k - 1$（实为恰好等于 $k - 1$），说明子树 $u$ 里存在未覆盖节点，要是再往父节点推就会超出距离 $k - 1$，因此必须在 $u$ 放一朵烟花，将 $u$ 加入答案，并令 $f[u] = -\infty$ 表示子树 $u$ 已全部被覆盖；
   - 否则若 $f[u] \ne -\infty$，用 $f[u]$ 更新父节点：$f[p_u] = \max(f[p_u], f[u])$。
3. 最后根节点 $1$ 没有父节点，无论如何需要在 $1$ 号点放一朵烟花来兜底覆盖剩余节点（同时覆盖 $1$ 号点自身）。

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

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int n, k;
    cin >> n >> k;

    vector<int> p(n + 1, 0), d(n + 1, 0);

    for (int i = 2; i <= n; i ++) {
        cin >> p[i];
    }

    for (int i = 2; i <= n; i ++) {
        d[i] = d[p[i]] + 1;
    }

    vector<int> f(n + 1);

    for (int i = 1; i <= n; i ++) {
        f[i] = d[i];
    }

    vector<int> ans;
    for (int u = n; u >= 2; u --) {
        if (f[u] != -INF_INT && f[u] - d[u] >= k - 1) {
            ans.push_back(u);
            f[u] = -INF_INT;
        }
        if (f[u] != -INF_INT) f[p[u]] = std::max(f[p[u]], f[u]);
    }

    ans.push_back(1);

    cout << ans.size() << endl;

    for (auto x : ans) {
        cout << x << " ";
    }
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
- 时间复杂度：$O(n)$，仅需正序计算深度、逆序扫描一次树节点。
- 空间复杂度：$O(n)$，用于存储父节点、深度及子树最深未覆盖深度。

预估难度：CF 1500（约 1500*）。本题难度由 AI 预估，仅作为参考。
