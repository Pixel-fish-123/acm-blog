# gym106782D Distinct Orders 题解

## 题意
菜单上有 $n$ 道菜（$1 \le n \le 20$），编号 $1$ 到 $n$，每道菜有版本 $1$ 和版本 $2$ 两种做法。

每天你可以选择一个整数 $k \in [1, n]$，点前 $k$ 道菜（即菜品 $1, 2, \dots, k$）。每道菜第一次被点到时上版本 $1$，之后每次被点到都切换为与上一次相反的版本；未点到的菜版本状态保持不变。

若两天的点单包含相同数量的菜，且每道菜收到的版本完全一致，则称这两天的点单相同。请构造一个长度 $m$ 尽可能大的点单序列 $k_1, k_2, \dots, k_m$，使得任意两天的点单都不相同。

## 核心思路
**算法类型**：构造 + DFS（满二叉树先序遍历）。

**答案上界分析**：
当某天选择 $k$ 时，当天的点单由长度 $k$ 以及前 $k$ 道菜当前的状态 $(v_1, v_2, \dots, v_k) \in \{1, 2\}^k$ 唯一决定。对于固定的 $k$，最多有 $2^k$ 种不同的状态组合，因此所有合法点单的总数最多为：
$$m = \sum_{k=1}^n 2^k = 2^{n+1} - 2$$

**递归构造**：
我们可以通过深度限制为 $n$ 的满二叉树 DFS 遍历取满这一上界。定义递归过程 `dfs(d, n)`（$1 \le d \le n$）：
1. 先输出一次 $d$（点前 $d$ 道菜）；
2. 递归调用两次 `dfs(d + 1, n)`。

**正确性证明（归纳法）**：
注意到在 `dfs(d, n)` 的整棵递归子树中，总共执行了 $2^{n-d+1} - 1$ 次点菜操作（恒为**奇数**次），并且每一次操作选择的 $k$ 都满足 $k \ge d$。这意味着：
- 每执行完一次 `dfs(d, n)`，编号 $\le d$ 的所有菜恰好被点了奇数次，状态**全部翻转**；
- 而编号 $> d$ 的所有菜在两次 `dfs(d + 1, n)` 中被点的次数相同，总次数为偶数，状态**保持不变**。

对于当前层 $d$：
- 第一次输出 $d$ 时，读取了前 $d$ 道菜的初始状态，并将前 $d$ 道菜的状态全部翻转；
- 随后第一次调用 `dfs(d + 1, n)`，它会在第 $d+1$ 道菜处于初始状态的前提下遍历完所有更深层的状态，并在结束时将前 $d+1$ 道菜全部翻转（此时前 $d$ 道菜被翻转两次回到初始状态，而第 $d+1$ 道菜被翻转一次变为相反状态）；
- 接着第二次调用 `dfs(d + 1, n)`，此时第 $d+1$ 道菜恰好处于相反状态，从而不重不漏地遍历另一半状态。

从虚拟根节点 $d=0$ 出发调用两次 `dfs(1, n)`，即可不重不漏地生成全部 $2^{n+1}-2$ 个不同点单。

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

    LL n;
    cin >> n;

    LL res = 1;
    
    for (int i = 1; i <= n + 1; i ++) {
        res *= 2;
    }

    res -= 2;

    cout << res << endl;
    
    auto dfs = [&](auto self, int now_depth, int lim_depth) -> void {
        if (now_depth > lim_depth) return;
        if (now_depth) {
            cout << now_depth << " ";
        }
        for (int i = 0; i < 2; i ++) {
            self(self, now_depth + 1, lim_depth);
        }
    };

    dfs(dfs, 0, n);
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
- 时间复杂度：递归树共有 $2^{n+1} - 1$ 个节点，每个节点 $O(1)$ 输出，总时间复杂度为 $O(2^n)$。
- 空间复杂度：递归调用栈深度为 $O(n)$。

预估难度：CF 1500（约 1500*）。本题难度由 AI 预估，仅作为参考。
