# P5854 【模板】笛卡尔树 题解

## 题意

给定一个长度为 $n$ 的排列 $p$，要求构建这组 $(下标, 值)$ 二元组的笛卡尔树：树的中序遍历恰好是下标 $1, 2, \dots, n$（即对下标是一棵二叉搜索树），同时每个节点的权值都小于其子节点的权值（即对权值是小根堆）。输出两个整数：

$$\operatorname{xor}_{i=1}^{n} i \times (l_i + 1) \qquad \operatorname{xor}_{i=1}^{n} i \times (r_i + 1)$$

其中 $l_i, r_i$ 分别为节点 $i$ 的左、右儿子编号，若没有对应儿子则为 $0$。

数据范围：$1 \le n \le 10^7$。注意 $i \times (l_i+1)$ 最大约 $10^{14}$，需要用 `long long`；$n$ 很大，IO 需要加速。

## 核心思路

笛卡尔树模板，采用**单调栈维护右链**的线性构建法。

关键观察：按 $i = 1 \dots n$ 依次插入节点时，新节点 $i$ 的下标最大。由中序遍历（BST）性质，$i$ 必须插在当前树的最右侧链（从根不断往右儿子走的一条链）上；再由小根堆性质，它应当挂在右链上**权值比它小的最下方的节点**下面。于是：

1. 维护一个栈内权值**递增**的单调栈，栈中保存的正是当前的右链（自底向上从浅到深）；
2. 插入 $i$ 时，不断弹栈，直到栈顶权值小于 $p_i$。记最后一个被弹出的节点为 $last$，由于 $last$ 的权值大于 $p_i$ 且 $i$ 的下标更大，堆性质决定了 $last$ 连同它被"接管"的整棵子树都应成为 $i$ 的左子树，故令 $l_i = last$；
3. 若弹完栈后栈非空，栈顶权值小于 $p_i$，则 $i$ 应成为栈顶的新右儿子，令 $r_{top} = i$；
4. 将 $i$ 入栈。

正确性说明：弹栈操作恰好对应"右链上比 $p_i$ 大的一段被 $i$ 取代"——这些节点原来的位置由 $i$ 顶替，而它们整段变成 $i$ 的左子树，中序遍历依然保持下标递增；栈内权值递增也保证了堆性质对右链始终成立。每个节点至多入栈一次、出栈一次，因此总构建复杂度是线性的，能够胜任 $n \le 10^7$ 的规模。

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

    vector<LL> arr(N + 1, 0);
    vector<LL> lson(N + 1, 0), rson(N + 1, 0);
    
    for (int i = 1; i <= N; i ++) {
        cin >> arr[i];
    }

    std::stack<LL> stk;

    for (int i = 1; i <= N; i ++) {
        int last = 0;

        while (stk.size() && arr[stk.top()] > arr[i]) {
            last = stk.top();
            stk.pop();
        }

        if (stk.size()) {
            rson[stk.top()] = i;
        }

        lson[i] = last;
        stk.push(i);
    }

    LL xor1 = 0, xor2 = 0;

    for (int i = 1; i <= N; i ++) {
        xor1 = xor1 ^ (i * (lson[i] + 1));
        xor2 = xor2 ^ (i * (rson[i] + 1));
    }

    cout << xor1 << " " << xor2 << endl;
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

- 时间复杂度：$O(n)$。构建阶段每个节点至多入栈、出栈各一次；最后统计异或答案也是线性扫描。
- 空间复杂度：$O(n)$，用于存储排列、左右儿子数组与单调栈。
