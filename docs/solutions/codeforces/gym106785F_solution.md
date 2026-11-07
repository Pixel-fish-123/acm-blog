# gym106785F Permutation Edit Distance 题解

## 题意
给定两个长度分别为 $n$ 和 $m$ 的排列 $p$ 与 $q$。每次操作可以做以下两种编辑之一：
- 在一个长度为 $L$ 的排列的任意位置插入 $L+1$，得到长度为 $L+1$ 的排列；
- 从一个长度为 $L$ 的排列中删去元素 $L$，得到长度为 $L-1$ 的排列。

求将排列 $p$ 变为排列 $q$ 所需的最少操作次数。多组数据，$\sum \max(n, m) \le 2 \times 10^5$。

## 核心思路
**算法类型**：树状数组 + 贪心。

注意到无论是插入最大值还是删除最大值，**较小元素之间的相对顺序永远不会改变**。若将「删去当前最大元素 $L$」看作在状态树上走向父节点，则所有排列构成一棵以 $[1]$ 为根的树：
- 将 $p$ 变为 $q$ 的最少操作次数，就是它们在这棵树上的距离；
- 设 $k$ 为满足「$1, 2, \dots, k$ 在 $p$ 中的相对顺序与在 $q$ 中的相对顺序完全一致」的最大整数，则它们的最近公共祖先（LCA）恰好是保留 $\{1, 2, \dots, k\}$ 所得的长度为 $k$ 的排列；
- 先从 $p$ 依次删去 $n, n-1, \dots, k+1$（共 $n-k$ 步），再按 $q$ 中的位置依次插入 $k+1, \dots, m$（共 $m-k$ 步），最少操作次数即为：
$$n + m - 2k$$

**如何快速求 $k$**：
根据康托展开（Lehmer 码）的性质，$\{1, 2, \dots, k\}$ 的相对顺序唯一取决于每个元素 $x \in [1, k]$ 左侧有多少个比 $x$ 小的元素（记作 $\text{rank}[x]$）：
- 若对于所有 $i = 1, 2, \dots, k$，都有 $\text{rank}_p[i] = \text{rank}_q[i]$，则 $1 \dots k$ 在两个排列中的相对顺序完全相同；
- 一旦某个 $i$ 满足 $\text{rank}_p[i] \neq \text{rank}_q[i]$，则 $i$ 插入到了不同的相对位置，后续也无法在不删掉 $i$ 的情况下对齐。

因此只需从左到右扫描排列 $p$ 和 $q$，用树状数组（BIT）维护已出现的元素，在 $O(n \log n + m \log m)$ 时间内求出每个元素的 $\text{rank}_p[i]$ 与 $\text{rank}_q[i]$，再从小到大找到最长的相等前缀 $k$ 即可。

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

struct BIT {
    int n;
    vector<int> t;

    
    BIT(int n_) {
        n = n_;
        t.assign(n + 1, 0);
    }

    void add(int i) {
        for (; i <= n; i += i & -i) {
            ++ t[i];
        }
    }

    int sum(int i) {
        int sum = 0;
        for (; i > 0; i -= i & -i) {
            sum += t[i];
        }
        return sum;
    }
};


void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int n, m;
    cin >> n >> m;

    BIT arrP(n + 1), brrQ(m + 1);
    vector<int> rankP(n + 1), rankQ(m + 1);
    vector<int> arr(n + 1), brr(m + 1);

    for (int i = 1; i <= n; i ++) {
        cin >> arr[i];
    }

    for (int i = 1; i <= m; i ++) {
        cin >> brr[i];
    }

    for (int i = 1; i <= n; i ++) {
        arrP.add(arr[i]);
        rankP[arr[i]] = arrP.sum(arr[i] - 1);
    }

    for (int i = 1; i <= m; i ++) {
        brrQ.add(brr[i]);
        rankQ[brr[i]] = brrQ.sum(brr[i] - 1);
    }

    int k = 1;
    for (int i = 2; i <= std::min(n, m); i ++) {
        if (rankP[i] != rankQ[i]) break;
        k ++;
    }

    cout << n + m - 2 * k << endl;

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


:::

## 复杂度
- 时间复杂度：用树状数组求两个排列各元素左侧小于它的元素个数为 $O(n \log n + m \log m)$，线性比对前缀为 $O(\min(n, m))$，总时间复杂度 $O((n + m) \log \max(n, m))$。
- 空间复杂度：$O(n + m)$。

预估难度：CF 1500（约 1500*）。本题难度由 AI 预估，仅作为参考。
