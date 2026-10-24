# gym106646H Handling Clarifications 题解

## 题意
比赛持续 $2n$ 分钟，每分钟会有一个澄清请求到达。Elisa 在澄清台值班，每分钟必须且只能做一件事：

- 取走本分钟到达的请求，得分增加 $a_i$，请求进入队列等待之后回答；
- 回答一个之前取走且尚未回答的请求，得分减少 $b_i$。

请求必须先被取走才能回答。$2n$ 分钟结束时，她必须恰好取走 $n$ 个请求并把它们全部回答，求能获得的最大得分。输入第一行是 $n$，接下来两行分别是 $a_1,\dots,a_{2n}$ 和 $b_1,\dots,b_{2n}$，单组数据。数据范围：$1\le n\le 10^5$，$1\le a_i,b_i\le 10^9$。

## 核心思路
**算法类型**：贪心 + 堆（优先队列），由线性 DP 观察出结构后改写目标函数。

**转成 T/A 序列。** 把第 $i$ 分钟取请求记作 `T`、回答记作 `A`。请求必须先取后答，所以任意前缀都满足 `#T ≥ #A`；结束时恰好取走 $n$ 个并全部答完，所以全程恰有 $n$ 个 `T`、$n$ 个 `A`。得分为
$$\sum_{i\in T}a_i-\sum_{i\in A}b_i.$$

**改写目标函数。** 令 $w_i=a_i+b_i$，则
$$\sum_{i\in T}a_i-\sum_{i\notin T}b_i=\sum_{i\in T}(a_i+b_i)-\sum_{i=1}^{2n}b_i.$$
后一项是常数，于是只需在合法集合 $T$ 中最大化 $\sum_{i\in T}w_i$。

**合法集合的等价条件。** 设 $T=\{p_1<p_2<\dots<p_n\}$。前缀约束在前 $2m-1$ 分钟给出 `#T ≥ m`，即 $p_m\le 2m-1$；反之若所有 $m$ 都满足 $p_m\le 2m-1$，则任意前缀都满足 `#T ≥ #A`。因此合法 $T$ 等价于：把 $T$ 的元素按位置从小到大依次放进 $n$ 个槽位，槽位 $m$ 只能放位置 $i\le 2m-1$ 的分钟，每个槽位恰好放一个。槽位的截止时间 $2m-1$ 随 $m$ 增大，因此越往后可选集合只增不减。

**贪心。** 按槽位 $m=1,2,\dots,n$ 的顺序处理，每次在尚未使用的、位置 $\le 2m-1$ 的分钟中选 $w_i$ 最大者作为第 $m$ 个 `T`。实现上从左往右扫描 $i=1,\dots,2n$：把 $w_i$ 压入大根堆，遇到奇数 $i=2m-1$ 就弹出堆顶，作为第 $m$ 个 `T`。答案初始化为 $-\sum_i b_i$，每次弹出时加上对应的 $w_i$。

**正确性（交换论证）。** 设贪心前 $m$ 个槽位依次放了 $g_1,\dots,g_m$。$m=1$ 时槽位 $1$ 只能放第 $1$ 分钟，基础情形成立。归纳假设存在一个最优解把 $g_1,\dots,g_{m-1}$ 恰好放在前 $m-1$ 个槽位，看槽位 $m$ 上的分钟 $x$：

- 若 $x=g_m$，保持不变；
- 若 $g_m$ 被放在更靠后的槽位 $m'>m$，交换 $x$ 与 $g_m$：$g_m\le 2m-1$ 满足槽位 $m$，且 $x\le 2m-1\le 2m'-1$ 满足槽位 $m'$，交换后仍合法，权和不变；
- 若 $g_m$ 没有被选中，则 $x$ 既是槽位 $m$ 的合法候选，又不在前 $m-1$ 个贪心选择中，由贪心的取法 $w_{g_m}\ge w_x$，把 $x$ 换成 $g_m$ 后权和不会变小，槽位分配仍然合法。

因此总能维持"前 $m$ 个槽位恰好是 $g_1,\dots,g_m$"的最优解，归纳到 $m=n$ 即得贪心解最优。

参考代码末尾注释掉的是 $O(n^2)$ 的线性 DP：$f[i][j]$ 表示前 $i$ 分钟回答了 $j$ 个请求时的最大得分，第 $i$ 分钟取请求时从 $f[i-1][j]+a_i$ 转移，回答时从 $f[i-1][j-1]-b_i$ 转移；$n=10^5$ 时状态数约 $2\times 10^{10}$，会超时，所以改写成上面的贪心。

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

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int n;
    cin >> n;

    vector<LL> arr(2 * n + 1, 0), brr(2 * n + 1, 0);
    LL ans = 0;

    for (int i = 1; i <= 2 * n; i ++) {
        cin >> arr[i];
    }

    for (int i = 1; i <= 2 * n; i ++) {
        cin >> brr[i];
        ans -= brr[i];
    }

    std::priority_queue<LL> q;

    for (int i = 1; i <= 2 * n; i ++) {
        q.push(arr[i] + brr[i]);
        if (i & 1) {
            ans += q.top();
            q.pop();
        }
    }

    cout << ans << endl;

    return;
}

// void solve()
// {
//     // std::cout << std::fixed << std::setprecision(2);
//     // std::cout.unsetf(std::ios::fixed);

//     int n;
//     cin >> n;

//     vector<LL> arr(2 * n + 1, 0), brr(2 * n + 1, 0);

//     for (int i = 1; i <= 2 * n; i ++) {
//         cin >> arr[i];
//     }

//     for (int i = 1; i <= 2 * n; i ++) {
//         cin >> brr[i];
//     }

//     vector<vector<LL>> dp(2, vector<LL>(n + 1, - INF_LL));

//     dp[0][0] = 0;

//     for (int i = 1; i <= 2 * n; i ++) {
//         for (int j = 0; j <= n; j ++) {
//             int p = i - j, pre = (i - 1) & 1, now = i & 1;
//             LL tmp = - INF_LL;
//             if (p < j) break;
//             if (p >= j && j > 0) {
//                 tmp = std::max(tmp, dp[pre][j - 1] - brr[i]);
//             }
//             p = (i - 1) - j;
//             if (p >= j) {
//                 tmp = std::max(tmp, dp[pre][j] + arr[i]);
//             }

//             dp[now][j] = tmp;
//             cout << i << " " << j << " " << tmp << endl;
//         }
//     }

//     cout << dp[0][n] << endl;

//     return;
// }

int main()
{
    // std::ios::sync_with_stdio(false);
    // cin.tie(nullptr);
    // cout.tie(nullptr);
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
时间复杂度：扫描 $2n$ 个位置，每个位置入堆一次、每个奇数位置出堆一次，每次 $O(\log n)$，总计 $O(n\log n)$。空间复杂度：$O(n)$，即堆与两个长度为 $2n$ 的数组。答案的绝对值不超过 $2n\cdot 10^9=2\times 10^{14}$，`long long` 足够。

预估难度：CF 1900（约 1900*）。本题难度由 AI 预估，仅作为参考。
