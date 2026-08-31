# P1377 [TJOI2011] 树的序 题解

## 题意

给定一个 $1 \sim n$ 的排列 $k_1, k_2, \ldots, k_n$，将其按顺序逐个插入一棵初始为空的二叉查找树（小于根往左，否则往右）。称能生成同一棵树的插入序列为该树的生成序列，求所有生成序列中字典序最小的一个。

数据范围：$1 \le n \le 10^5$。

## 核心思路

分两步：**先说明答案就是原树的前序遍历，再用笛卡尔树在 $O(n)$ 内把这棵树建出来**。

### 一、为什么答案是前序遍历

在 BST 的每个节点上记二元组 $(k, t)$：$k$ 为键值，$t$ 为插入时间戳（$k_i$ 的时间戳为 $i$）。这棵树在 $k$ 维度满足 BST 性质，在 $t$ 维度满足小根堆性质——因为插入一个节点时查找路径必然经过它的每一个祖先，所以**父亲一定先于儿子插入**。也就是说，题目给出的树本身就是一棵关于 $(k, t)$ 的笛卡尔树（Treap 视角）。

树的形态与键值固定后，不同的生成序列只来自不同的 $t$ 分配。能生成同一棵树的充要条件是重分配后的 $t$ 仍满足堆性质，即**每个节点都排在它子树中所有节点之前**（每棵子树的根必须最先插入，否则根的位置会被抢占；左右子树之间则互不干扰）。

于是问题变成：在堆性质的约束下分配 $1 \sim n$ 的时间戳，使按 $t$ 从小到大读出的键值序列字典序最小。贪心结论是**把较小的 $t$ 分给左子树**，理由有二：

1. $t$ 越小在生成序列中出现得越靠前，而字典序比较中靠前的位置权重更高；
2. BST 性质保证左子树所有键值都小于右子树所有键值。

堆性质只要求"子树根拿走子树内最小的 $t$"，并不限制时间戳在左右子树之间如何划分。若某个分配让右子树节点（键值大）抢在左子树节点（键值小）之前出现，把左子树整体换到更小的时间戳上，序列第一个不同位置立刻变小——交换论证说明"右先于左"一定不优。因此最优的分配顺序是：

$$\text{根} \;\to\; \text{整棵左子树} \;\to\; \text{整棵右子树}$$

对每棵子树递归应用，这个顺序恰好就是**前序遍历**。以样例 $1,3,4,2$ 为例：树为根 $1$、右儿子 $3$，$3$ 的左右儿子为 $2,4$；交换两个儿子的 $t$（把更小的给左儿子 $2$）即得更优的 $1,3,2,4$。

### 二、如何转化成笛卡尔树 $O(n)$ 建树

直接模拟插入建树最坏退化成链，是 $O(n^2)$ 的，不可接受。由第一部分，目标树是 $(k, t)$ 的笛卡尔树，且它是唯一的（根必为全局 $t$ 最小的 $k_1$，其余节点按 $k$ 划分左右，递归确定），因此可以直接套用笛卡尔树的单调栈建树模板。

对照标准模板：模板处理的二元组是 $(\text{下标 } i,\ \text{值 } a_i)$，下标维满足 BST（按下标从小到大扫描），值维满足小根堆。而本题的二元组是 $(k, t) = (\text{值},\ \text{插入时间})$，两个维度的角色恰好互换——插入时间 $t$ 正是原序列中的"下标"。所以只需**交换下标和值**：读入时记 $\mathrm{val}[x] = i$（键值 $x$ 的插入时间为 $i$），然后按键值 $k$ 从小到大（即 $1 \sim n$）扫描建树，堆权值用 $\mathrm{val}$。

建树时栈中维护当前树的右链（栈底为根，插入时间自底向上递增），对每个键值 $i$：

1. 弹栈：弹出所有 $\mathrm{val}$ 大于 $\mathrm{val}[i]$ 的节点，记最后弹出的为 $\mathrm{last}$；
2. 若栈非空，$i$ 成为栈顶的右儿子（接上右链）；
3. $\mathrm{last}$ 成为 $i$ 的左儿子（被弹出的整段右链挂到 $i$ 左下）；
4. $i$ 入栈。

结束后栈底即根。每个节点入栈、出栈各一次，建树 $O(n)$；最后从根出发做一次前序遍历输出即为答案。

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

    int N;
    cin >> N;

    vector<int> val(N + 1, 0);
    vector<int> lson(N + 1, 0), rson(N + 1, 0);

    for (int i = 1; i <= N; i ++) {
        int x;
        cin >> x;
        val[x] = i;
    }

    std::stack<int> stk;

    for (int i = 1; i <= N; i ++) {
        int last = 0;

        while (stk.size() && val[stk.top()] > val[i]) {
            last = stk.top();
            stk.pop();
        }

        if (stk.size()) {
            rson[stk.top()] = i;
        }

        lson[i] = last;
        stk.push(i);
    }

    while (stk.size() > 1) stk.pop();

    int root = stk.top();

    auto dfs = [&](auto self, int now) -> void {
        cout << now << " ";
        if (lson[now]) self(self, lson[now]);
        if (rson[now]) self(self, rson[now]);
    };

    dfs(dfs, root);

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

## 复杂度

- 时间复杂度：$O(n)$。单调栈建树阶段每个节点至多入栈、出栈各一次；前序遍历也是线性。
- 空间复杂度：$O(n)$，用于存储 $\mathrm{val}$、左右儿子数组与单调栈（前序遍历的递归深度最坏 $O(n)$）。
