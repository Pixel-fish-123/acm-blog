# gym106235A Athletes 题解

## 题意

有 $n$ 名运动员，第 $i$ 名的力量为 $p_i$、耐力为 $s_i$。若 $p_j > p_i$ 且 $s_j > s_i$，则 $j$ 一定能打败 $i$（称 $j$ **支配** $i$）；否则两人比赛谁都可能赢。

从中选出恰好 $k$ 人参加比赛：只要还剩至少两人，就随机挑两名未淘汰的人比一场，输者淘汰，直到剩下一人为冠军。若考虑所有可能的对阵与胜负，至少有两种结果的冠军不同，则称这组人「冠军不确定」。求冠军不确定的 $k$ 人集合个数，对 $998\,244\,353$ 取模。

数据范围：$1 \le k \le n \le 5000$，$1 \le p_i, s_i \le 10^9$。

## 核心思路

**算法类型**：组合数学 + 枚举。用补集转化：先证明「冠军确定」等价于「集合里有一个人支配其余所有人」，再对这个人计数。

**第一步：刻画冠军确定的集合。**

支配关系是严格偏序：没有人支配自己；若 $a$ 支配 $b$、$b$ 支配 $c$，则 $a$ 支配 $c$。

- 若集合中有人 $m$ 支配其余所有人：$m$ 参加的每一场都必胜，永远不会被淘汰，冠军只能是 $m$，所以冠军确定。
- 若没有这样的人：称「集合内没有人支配他」的人为**极大元**。从任意一人出发，只要他被某人支配就跳到那个人身上；集合有限，关系又是严格偏序，这个过程不会回到走过的人，最终停在某个极大元上，而由传递性，这个极大元支配出发点。
  - 若只有一个极大元 $m$，那么所有人都被 $m$ 支配，与假设矛盾；
  - 所以至少有两个极大元 $u, v$。让 $u$ 依次和其他每个人比赛：对手都不支配 $u$，$u$ 每场都可能赢，于是 $u$ 可以成为冠军；同理 $v$ 也可以。冠军不确定。

于是

$$\text{冠军确定} \iff \text{存在 } m \text{ 支配集合中其余 } k - 1 \text{ 人}.$$

**第二步：对「支配所有人的人」计数。**

这样的 $m$ 在一个集合里至多一个：若 $m_1, m_2$ 都支配其余所有人，则二者互相支配，不可能。所以每个冠军确定的集合恰好被它的 $m$ 统计一次。

记 $\text{cnt}_i$ 为被 $i$ 支配的人数。以 $i$ 为 $m$ 的集合，就是从这 $\text{cnt}_i$ 人中再选 $k - 1$ 人，共 $\binom{\text{cnt}_i}{k-1}$ 个。因此

$$\text{ans} = \binom{n}{k} - \sum_{i=1}^{n} \binom{\text{cnt}_i}{k - 1}.$$

$k = 1$ 时每项都是 $\binom{\text{cnt}_i}{0} = 1$，答案为 $n - n = 0$，对应只有一个人时冠军必然确定。

**第三步：实现。**

$n \le 5000$，直接 $O(n^2)$ 枚举有序对 $(i, j)$ 求出 $\text{cnt}_i$。组合数预处理阶乘 $\text{fact}$，用费马小定理求 $\text{fact}[5000]$ 的逆元，再倒推出所有阶乘逆元：

$$\binom{a}{b} = \text{fact}[a] \cdot \text{inv\_fact}[b] \cdot \text{inv\_fact}[a - b] \bmod 998\,244\,353.$$

每次相减后加上模数再取模，保证结果非负。

**样例验证。** 样例一 $n = 4, k = 2$，四人为 $(1,1), (1,3), (3,1), (3,3)$。只有 $(3,3)$ 支配 $(1,1)$，其他人的 $\text{cnt} = 0$。答案为 $\binom{4}{2} - \binom{1}{1} = 6 - 1 = 5$。

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
const int MAXL = 5000;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

LL fact[MAXL + 5], inv_fact[MAXL + 5];

LL qpow(LL a, LL b) {
    LL res = 1; a %= MOD1;
    while (b) {
        if (b & 1) res = res * a % MOD1;
        a = a * a % MOD1;
        b >>= 1;
    }
    return res;
}

void precompute() {
    fact[0] = 1;
    for (int i = 1; i <= MAXL; i ++)
        fact[i] = fact[i - 1] * i % MOD1;

    inv_fact[MAXL] = qpow(fact[MAXL], MOD1 - 2);
    for (int i = MAXL; i >= 1; i --)
        inv_fact[i - 1] = inv_fact[i] * i % MOD1;
}

LL C(int n, int k) {
    if (k < 0 || k > n) return 0;
    return fact[n] * inv_fact[k] % MOD1 * inv_fact[n - k] % MOD1;
}

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    precompute();
    int n, k;
    cin >> n >> k;

    vector<int> arr(n + 5, 0), brr(n + 5, 0);
    vector<int> size(n + 5, 0);

    for (int i = 1; i <= n; i ++) {
        cin >> arr[i];
    }

    for (int i = 1; i <= n; i ++) {
        cin >> brr[i];
    }

    for (int i = 1; i <= n; i ++) {
        for (int j = 1; j <= n; j ++) {
            if (arr[i] > arr[j] && brr[i] > brr[j]) {
                size[i] ++;
            }
        }
    }

    LL ans = C(n, k);

    for (int i = 1; i <= n; i ++) {
        ans -= C(size[i], k - 1);
        ans = (ans + MOD1) % MOD1;
    }

    cout << ans << endl;

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

- 时间复杂度：统计 $\text{cnt}_i$ 需要 $O(n^2)$，$n = 5000$ 时约 $2.5 \times 10^7$ 次比较；预处理阶乘 $O(V + \log P)$，其中 $V = 5000$，$P = 998\,244\,353$。总计 $O(n^2)$。
- 空间复杂度：$O(n + V)$。
