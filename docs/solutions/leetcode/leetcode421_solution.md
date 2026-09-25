---
tags: [Trie, 位运算, 贪心]
---
# leetcode421 数组中两个数的最大异或值 题解

## 题意

给定一个整数数组 $\textit{nums}$，返回

$$\max_{0\le i\le j<n}\left(\textit{nums}[i]\oplus\textit{nums}[j]\right)$$

其中 $n=\textit{nums.length}$，$1\le n\le 2\times 10^{5}$，$0\le\textit{nums}[i]\le 2^{31}-1$（即元素非负且可用 31 位二进制表示）。

要求线性时间，进阶目标为 $O(n)$。

需要注意下标的约束是 $i\le j$ 而不是 $i<j$：当 $n=1$ 时无合法数对，答案取 $0$（一个数与自身异或的结果），这也正是代码中把答案初值设为 $0$ 的原因。

## 核心思路

**按位贪心的直觉。** 异或的每一位互相独立，而权重是二进制的：若答案在第 $k$ 位上能取到 $1$，那么无论低位如何安排，$2^k$ 都大于低位全部取 $1$ 的和 $2^k-1$。所以最优解一定可以这样构造：从最高位开始，每一位都尽可能让它为 $1$，能取 $1$ 就取 $1$，取不到才退让。

问题的关键在于判断"第 $k$ 位上能不能取 $1$"。以二进制角度看，从某个 $x$ 出发，我们希望寻找到某个 $y$，使得在已经确定的高位前缀上，$y$ 的每一位都尽量与 $x$ 相反。于是需要一个支持"查询是否存在某个数，其高位前缀等于给定串"的结构——这正是 0-1 Trie（二进制字典树）。

**建树。** 定义 $B$ 为所有数中最高有效位的下标加一，即所有数共同的位数。若最大值 $\textit{max}$ 为正，则最高有效位下标为 $31-\operatorname{clz}(\textit{max})$（`__builtin_clz` 统计前导零个数）；若最大值就是 $0$，则取 $B=1$，仅需处理第 $0$ 位。把每个数从第 $B-1$ 位到第 $0$ 位依次插入 Trie：

- 节点编号 $1$ 作为根，编号 $0$ 被留作空指针；
- `tree[u][b]` 表示节点 $u$ 沿着"这一位等于 $b$"走到的子节点编号；
- 遇到 `tree[u][b] == 0` 就新开一个节点。

在 Trie 中，任意一个节点 $u$ 到根路径上的位串，恰好对应一个前缀；因此"存在某个数具有该前缀"等价于"该前缀对应的节点存在"。

**查询。** 对每个 $x$ 单独在树上贪心：

1. 从根节点出发，从第 $B-1$ 位依次走到第 $0$ 位；
2. 设 $x$ 在第 $j$ 位的值为 $b$，优先尝试走相反分支 $\lnot b$；
3. 若该分支存在，说明存在某个数与 $x$ 在这一位不同，异或结果这一位为 $1$，于是把 $2^j$ 加入答案，并沿相反分支继续；
4. 若该分支不存在，只能沿 $\lnot b$ 的反面（也就是与 $b$ 相同的分支）走，这一位对答案贡献 $0$。

由于所有数（包括 $x$ 自身）都在树中，每层至少有一条与 $b$ 相同的边，所以第 4 步的"退让"总是可行，查询过程永远不会走进空节点。

**正确性。** 沿着 Trie 走出的每一条完整路径都对应数组中真实存在的一个 $y$，所以贪心得到的值一定是某个真实数对的异或值，不会超出可行范围。反过来，设贪心在第 $j$ 位判断出"相反分支不存在"，说明所有数在这一位都与 $x$ 相同，任何合法数对在这一位只能得到 $0$，贪心的退让是强制的；而当相反分支存在时，贪心拿到的这一位 $1$，比任何"这一位为 $0$"的方案在数值上更大，因为低位即使全为 $1$ 也无法弥补 $2^j$ 的差距。于是贪心逐位确定的正是所有数对异或值中最大的那一个。

**自反与边界。** Trie 中包含 $x$ 本身，查询时理论上可以选到 $y=x$，"自己和自己异或"得到 $0$；但 $0$ 永远不会成为最大值的来源（除非 $n=1$，那时答案本来就应当是 $0$），所以这一便利不会污染结果。另外需要留意，由于每个数的位数统一取到所有数的公共位数 $B$，不会出现某个数位长不足导致路径缺失的问题。

**另一种等价做法。** 也可以从高位到低位维护"已确定前缀"的哈希集合，每次假设答案的下一位为 $1$，检查是否存在两个数的前缀异或恰好等于候选前缀；思路与 0-1 Trie 完全一致，只是把 Trie 的逐层查询换成了集合查询，代码更短而常数略有不同。

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
#include <bit>
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

class Solution {
    public:
        int n;
        vector<vector<int>> tree;
        int findMaximumXOR(vector<int>& nums) {
            n = nums.size();

            tree.resize(2, vector<int>(2));

            int max_ = 0;
            for (auto x : nums) {
                max_ = std::max(max_, x);
            }

            int high = max_ == 0 ? 0 : 31 - __builtin_clz(max_);


            int cnt = 1;
            for (auto x : nums) {
                int cur = 1;
                for (int j = high; j >= 0; j --) {
                    int now = 1 & (x >> j);
                    if (!tree[cur][now]) {
                        tree[cur][now] = ++ cnt;
                        tree.push_back(vector<int>(2));
                    }
                    cur = tree[cur][now];
                }
            }
            
            int res = 0;

            for (auto x : nums) {
                int cur = 1;
                int ans = 0;
                for (int j = high; j >= 0; j --) {
                    int want = (x >> j) & 1;
                    want ^= 1;
                    if (tree[cur][want]) {
                        ans |= (1 << j);
                    }
                    else want ^= 1;
                    cur = tree[cur][want];
                }

                res = std::max(res, ans);
            }

            return res;
        }
};


void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int n;
    cin >> n;

    vector<int> arr(n, 0);

    for (auto &x : arr) {
        cin >> x;
    }

    Solution s;
    int res = s.findMaximumXOR(arr);
    cout << res << endl;

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

设 $B$ 为公共位数，本题中 $B\le 31$，可视作常数。

- **时间：** 建树对每个数走 $B$ 层，查询同样对每个数走 $B$ 层，总时间为 $O(nB)=O(31n)=O(n)$，满足进阶要求。
- **空间：** Trie 的节点数不超过 $1+nB$，每个节点保存两条出边，空间为 $O(nB)=O(n)$。按 $n=2\times 10^{5}$、$B=31$ 估计，节点数上界约为 $6.2\times 10^{6}$；用 `vector<vector<int>>` 存储时每个节点还带有容器自身的常数开销，实际占用会比"节点数 $\times$ 2 个 `int`"更大，若在意内存常数可把 Trie 改成扁平的 `array<int,2>` 数组（或改用按位前缀哈希集合的做法，其空间为 $O(n)$ 且常数更小）。
