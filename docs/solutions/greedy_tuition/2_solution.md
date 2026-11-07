# 2 P1090 [NOIP 2004 提高组] 合并果子 题解

## 题意

在一个果园里，多多把 $n$ 种果子分成了 $n$ 堆，每次合并可以把两堆果子合并到一起，消耗的体力等于两堆果子的重量之和。经过 $n-1$ 次合并后所有果子合成一堆，总消耗体力为每次合并所耗体力之和。已知每种果子的数目，求最小总消耗体力。

数据范围：$1 \le n \le 10^4$，$1 \le a_i \le 2 \times 10^4$，答案小于 $2^{31}$。

## 核心思路

**算法类型**：贪心 + 堆（Huffman 树构造）。

把 $n-1$ 次合并过程看作一棵有 $n$ 个叶子的二叉树：初始每堆果子是一个叶子，每次合并两堆相当于新建一个父节点连接这两个节点。设初始第 $i$ 堆果子在这棵合并树中的深度为 $d_i$（根深度为 $0$），则它在向上合并到根的过程中一共被累加了 $d_i$ 次，总消耗体力恰好等于树的带权路径长度：
$$\text{总代价} = \sum_{i=1}^n a_i \cdot d_i$$

**贪心策略与正确性**：
越早被合并的果子堆深度 $d_i$ 越大、被重复计入的次数越多。由交换论证可知，在最优合并树中，深度最大的两个兄弟叶子必然对应当前重量最小的两堆果子（若某个深度更浅的叶子重量更小，交换二者位置后总代价不增）。将这两堆合并为一堆重量为 $a + b$ 的新果子后，问题归约为规模为 $n-1$ 的子问题。

实现上，用一个**小根堆**维护当前所有果子堆的重量：每次弹出堆顶最小的两堆 $a, b$，将 $a + b$ 累加进答案并压回堆中，重复 $n-1$ 次直到堆中只剩一堆。

::: details 点击展开参考代码

## 参考代码

```cpp
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
#define endl '\n'

void solve()
{
    int n;
    cin >> n;
    std::priority_queue<int, vector<int>, std::greater<int>> q;

    for (int i = 0, x = 0; i < n; i ++) {
        cin >> x;
        q.push(x);
    }

    int res = 0;

    while (q.size() > 1) {
        int a = q.top();
        q.pop();
        int b = q.top();
        q.pop();
        res = res + (a + b);
        q.push(a + b);
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
    for (int i = 0; i < _; i ++)
    {
        solve();
    }
    return 0;
}
```


:::

## 复杂度

- 时间复杂度：$O(n \log n)$（共 $n-1$ 次合并，每次堆操作 $O(\log n)$）。
- 空间复杂度：$O(n)$（堆空间）。

预估难度：CF 1200（约 1200*）。本题难度由 AI 预估，仅作为参考。
