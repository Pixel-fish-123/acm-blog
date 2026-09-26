# cf2267B Fashionable Array 题解

## 题意

数组的众数定义为出现次数最多的数；若有多个数出现次数并列最多，取其中最大的。

给定长度为 $n$ 的数组 $a$，可以任意重排，要求所有前缀的众数之和最大，输出任意一种最优排列。

数据范围：$1 \le t \le 500$，$1 \le n \le 100$，$1 \le a_i \le 100$。

## 核心思路

**算法类型**：构造 + 贪心。先对每个阈值 $v$ 证明「众数 $\ge v$ 的前缀个数」有上界，再构造一个排列让所有阈值同时取到上界。

记 $c_u$ 为值 $u$ 的出现次数，$C_v = \max_{w \ge v} c_w$（没有 $\ge v$ 的值时为 $0$），并令

$$L_v = \sum_{u} \min(c_u, C_v).$$

**第一步：众数 $\ge v$ 的前缀至多 $L_v$ 个。**

设某个长度为 $k$ 的前缀众数为 $m \ge v$，其中 $m$ 出现 $\text{cnt}_m$ 次，则 $\text{cnt}_m \le c_m \le C_v$。任何值 $u$ 在该前缀里的次数既不超过 $c_u$，也不超过 $\text{cnt}_m$（否则 $m$ 就不是众数），所以

$$k = \sum_u \text{cnt}_u \le \sum_u \min(c_u, C_v) = L_v.$$

众数 $\ge v$ 的前缀长度都不超过 $L_v$，因此个数也不超过 $L_v$。又因为

$$\sum_k \text{mode}_k = \sum_{v \ge 1} \#\{k : \text{mode}_k \ge v\} \le \sum_{v \ge 1} L_v,$$

只要构造出的排列对每个 $v$，前 $L_v$ 个前缀的众数都 $\ge v$，就是最优的。

**第二步：代码的构造。**

`tail` 从 $100$ 往下走。只要 `tail` 还有剩余，就放一个 `tail`，然后把每个比 `tail` 小且还有剩余的值各放一个（从小到大），这一组称为一「轮」。`tail` 用完后换成更小的值继续。

- 每个值在它用完之前，每一轮恰好出现一次。所以第 $j$ 轮包含的就是所有满足 $c_u \ge j$ 的值 $u$。
- 以 $v$ 为 `tail` 的轮次开始前，已经进行了 $B$ 轮，而 $v$ 还有剩余，所以 $c_v > B$，它已出现 $B$ 次；任何更大的值 $w$ 已经用完，出现了 $c_w \le B$ 次；任何更小的值出现不超过 $B$ 次。
- 每一轮先放 $v$，放完后 $v$ 的次数严格大于所有更大的值，且不小于所有更小的值。之后更小的值追上来最多也只是并列，并列时取较大者，众数仍是 $v$。所以 `tail` 为 $v$ 的所有轮里，每个前缀的众数都是 $v$。

`tail` $\ge v$ 的轮次正好是第 $1$ 到第 $C_v$ 轮，这些轮覆盖的位置数为 $\sum_u \min(c_u, C_v) = L_v$，其中的前缀众数都 $\ge v$，第一步的上界全部取到。

**样例验证。** $[4, 4, 2, 1, 3, 1]$：第一轮放 `4 1 2 3`，第二轮放 `4 1`，得到 `4 1 2 3 4 1`。每个前缀的众数都是 $4$（最后一个前缀中 $4$ 与 $1$ 并列，取 $4$），总和 $24$，与样例答案 `4 4 3 2 1 1` 的总和相同。

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
const int MAXL = 101;
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

    vector<int> arr(n, 0);
    vector<int> cnt(MAXL, 0);
    for (int i = 0; i < n; i ++) {
        cin >> arr[i];
        cnt[arr[i]] ++;
    }

    vector<int> res;

    int tail = 100;
    while (tail) {
        while (cnt[tail]) {
            cnt[tail] --;
            res.push_back(tail);
            for (int i = 1; i < tail; i ++) {
                if (cnt[i]) {
                    cnt[i] --;
                    res.push_back(i);
                }
            }
        }
        tail --;
    }

    for (auto x : res) {
        cout << x << " ";
    }
    cout << endl;
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

记值域 $V = 100$。

- 时间复杂度：每放一个 `tail` 要扫一遍比它小的值，共 $O(nV)$；外层 `tail` 递减 $O(V)$。每组数据 $O(nV)$，总计约 $500 \times 100 \times 100 = 5 \times 10^6$。
- 空间复杂度：$O(n + V)$。
