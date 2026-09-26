# cf2267D Backrooms Hill 题解

## 题意

数组 $b$ 称为「山丘」，当且仅当存在 $k$，使 $b_1 < b_2 < \cdots < b_k$ 且 $b_k > b_{k+1} > \cdots > b_m$。

给定由 $1..n$ 中互不相同的整数组成的数组 $a$（即一个排列），每次操作可以交换 $a_i$ 与 $a_{i+2}$。问能否通过任意次操作把 $a$ 变成山丘。

数据范围：$1 \le t \le 10^4$，$1 \le n \le 2 \times 10^5$，$\sum n \le 2 \times 10^5$。

## 核心思路

**算法类型**：贪心 + 构造。把山丘看成「值从小到大，依次放到剩余区间的左端或右端」，每个值只能放到与它所属奇偶类相同的位置。可以证明这个放置过程的状态唯一，所以「能放左边就放左边」的贪心就能判定可行性。

**第一步：操作的效果。** 交换 $a_i, a_{i+2}$ 不改变位置的奇偶性，并且同一奇偶类内的相邻交换可以生成任意排列。所以奇数位上的值可以任意重排，偶数位上的值也可以任意重排，但两类之间不能互换。记值 $v$ 所在的类为 $\text{cls}(v)$（原来在奇数位还是偶数位）。

**第二步：山丘的「由外向内」刻画。** 山丘中最小的值一定在两端之一：不在端点的话，它两侧都有邻居，而山丘中不可能有「谷」。去掉它剩下的仍是山丘。所以山丘等价于：按 $v = 1, 2, \ldots, n$ 的顺序，每个值放到剩余区间的左端 $L$ 或右端 $R$，然后该端向内收缩一格。

加上奇偶限制，值 $v$ 只能放到奇偶性等于 $\text{cls}(v)$ 的端点上。

**第三步：贪心的正确性。** 把状态看成两端奇偶性的无序对 $\{p_L, p_R\}$。由于左右对称，后续能否成功只取决于这个无序对。

- 状态为 $\{c, \bar c\}$：类为 $c$ 的值只能放到奇偶性为 $c$ 的那端，放完后该端奇偶性翻转，新状态为 $\{\bar c, \bar c\}$；类为 $\bar c$ 的值同理，新状态为 $\{c, c\}$。
- 状态为 $\{c, c\}$：类为 $c$ 的值放左放右都行，但新状态都是 $\{\bar c, c\}$；类为 $\bar c$ 的值无处可放，失败。

也就是说，无论怎么选，下一步的无序状态都是唯一确定的，所以任取一种合法选法都不影响结果。代码固定采用「能放左边就放左边」。

**第四步：代码实现。**

`sign[v]` 记录 $\text{cls}(v)$，$1$ 为奇、$2$ 为偶。

- 第一遍：值从 $1$ 到 $n$ 递增，`now_sign` 表示左端下一个位置的奇偶性（从位置 $1$ 开始，为奇）。类相同就放到左边、计数并翻转 `now_sign`。这些值依次占据位置 $1, 2, \ldots, k$，值递增。
- 第二遍：剩下的值要占据位置 $k+1, \ldots, n$，并且值递减。于是从 $n$ 到 $1$ 递减扫描剩余的值，`now_sign` 接着表示位置 $k+1, k+2, \ldots$ 的奇偶性。只要有一个值不匹配，它就永远不会被计入。

最后 `cnt == n` 说明所有值都放好了。左边递增、右边递减，拼起来一定是山丘（峰在第 $k$ 或第 $k+1$ 位）。

**样例验证。** $[2, 1, 3]$：$\text{cls}(1) = $ 偶，$\text{cls}(2) = \text{cls}(3) = $ 奇。第一遍只取到 $2$（放在位置 $1$），`now_sign` 变为偶。第二遍从 $3$ 开始，$3$ 是奇类，不匹配；再取到 $1$。计数 $2 < 3$，输出 `No`。

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
const LL MOD1 = 998244353;
const LL MOD2 = 1e9 + 7;
const int MAXL = 2e5 + 5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

int acnt[MAXL], bcnt[MAXL];
void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int n;
    cin >> n;

    vector<int> sign(n + 1, 0); // 1 odd 2 even 0 empty

    for (int i = 1; i <= n; i ++) {
        int now;
        cin >> now;
        if (i & 1) {
            sign[now] = 1;
        }
        else {
            sign[now] = 2;
        }
    }

    int cnt = 0;
    int now_sign = 1;
    for (int i = 1; i <= n; i ++) {
        if (now_sign == sign[i]) {
            cnt ++;
            sign[i] = 0;
            if (now_sign == 1) now_sign = 2;
            else now_sign = 1;
        }
    }

    for (int i = n; i >= 1; i --) {
        if (now_sign == sign[i]) {
            cnt ++;
            sign[i] = 0;
            if (now_sign == 1) now_sign = 2;
            else now_sign = 1;
        }
    }

    if (cnt == n) cout << "Yes" << endl;
    else cout << "No" << endl;


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

- 时间复杂度：两遍线性扫描，每组数据 $O(n)$，总计 $O(\sum n)$。
- 空间复杂度：$O(n)$。
