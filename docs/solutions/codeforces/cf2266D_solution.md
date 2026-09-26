# cf2266D Falling Concrete 题解

## 题意

一条路由 $n$ 段组成，第 $i$ 段高度为 $a_i$。一次操作选 $i < j$，把第 $j$ 段搬到位置 $i$，途经的每一段各落下一单位混凝土，即

$$[a_i, a_{i+1}, \ldots, a_{j-1}, a_j] \;\to\; [a_j - (j - i),\ a_i + 1,\ a_{i+1} + 1,\ \ldots,\ a_{j-1} + 1].$$

「平坦部分」指高度全部相等的一段连续区间。可以操作任意次，求平坦部分的最大长度。

数据范围：$1 \le t \le 10^4$，$1 \le n \le 2 \times 10^5$，$n \le a_i \le 10^9$，$\sum n \le 2 \times 10^5$。

## 核心思路

**算法类型**：构造 + 排序。令 $b_p = a_p - p$，每段的 $b$ 值跟着它移动、保持不变，而操作可以把各段排成任意顺序。于是答案就是 $b$ 值集合中最长的一段连续整数的长度。

**第一步：$b$ 值是跟着路段走的不变量。**

- 被搬动的第 $j$ 段到了位置 $i$，新高度为 $a_j - (j - i)$，于是新 $b$ 值为 $a_j - (j - i) - i = a_j - j$，没有变。
- 原位置 $k \in [i, j)$ 的段到了 $k + 1$，高度加 $1$，新 $b$ 值为 $a_k + 1 - (k + 1) = a_k - k$，也没有变。

所以一次操作只是把第 $j$ 段挪到前面，所有段的 $b$ 值都随段移动而不变。

**第二步：可以排成任意顺序。** 按目标顺序从前往后放：对第 $1$ 个位置，把想要的那段从它所在位置搬到位置 $1$；对第 $2$ 个位置，从位置 $\ge 2$ 的段里把想要的搬到位置 $2$，依此类推。每步都是合法的「往前搬」。

**第三步：平坦段对应连续整数。** 位置 $p, p+1, \ldots, p+L-1$ 高度都为 $h$，等价于它们的 $b$ 值依次是 $h - p, h - p - 1, \ldots, h - p - L + 1$，也就是 $L$ 个互不相同的连续整数。

反过来，若 $b$ 值里有 $v, v+1, \ldots, v+L-1$，把它们按从大到小放在位置 $1..L$：位置 $q$ 放 $b = v + L - q$，高度为 $v + L$，全部相等。题目保证 $a_i \ge n$，所以高度始终为正。

**实现。** 把所有 $a_i - i$ 放进 `std::set`（去重并排序），从小到大扫描，维护当前连续段长度 `cnt`：若当前值不等于上一个值加 $1$，就结算并清零。

**样例验证。**

- $[5, 5, 5, 9, 8]$：$b = \{4, 3, 2, 5, 3\}$，去重后为 $\{2, 3, 4, 5\}$，答案 $4$。
- $[9, 7, 12, 10, 12]$：$b = \{8, 5, 9, 6, 7\}$，是连续的 $5..9$，答案 $5$。
- $[8, 8, 12, 8, 14, 10, 15, 13]$：$b = \{7, 6, 9, 4, 9, 4, 8, 5\}$，去重后为 $4..9$，答案 $6$。

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
    int n;
    cin >> n;
    std::set<int> st;
    for (int i = 1; i <= n; i ++) {
        int x;
        cin >> x;
        st.insert(x - i);
    }

    int ans = 0;
    int pre = 0;
    int cnt = 0;
    
    for (auto x : st) {
        if (x != pre + 1) {
            ans = std::max(ans, cnt);
            cnt = 0;
        }
        cnt ++;
        pre = x;
    }

    ans = std::max(ans, cnt);
    cout << ans << endl;

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

// 8 8 12 8 14 10 15 13
```


:::

## 复杂度

- 时间复杂度：插入 `std::set` 共 $O(n \log n)$，扫描 $O(n)$，总计 $O(\sum n \log n)$。
- 空间复杂度：$O(n)$。
