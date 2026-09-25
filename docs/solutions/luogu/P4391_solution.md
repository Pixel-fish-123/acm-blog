---
tags: [KMP]
difficulty: "普及+/提高-"
source: "https://www.luogu.com.cn/problem/P4391"
---
# P4391 [BalticOI 2009] Radio Transmission 题解

## 题意

给出长度为 $L$（$1\le L\le 10^6$）的小写字母串 $S$。已知 $S$ 是某个字符串 $S'$ 无限重复 $S'+S'+S'+\cdots$ 的一个子串，且 $|S|\ge |S'|$。求满足条件的**最小** $|S'|$。

换个说法：求 $S$ 的**最小周期** $p$，即最小的正整数 $p$，使得对所有合法的 $i$ 都有 $S[i]=S[i+p]$（注意不要求 $p$ 整除 $L$）。

## 核心思路

**结论：答案 $=L-\mathrm{next}[L]$**，其中 $\mathrm{next}[i]$ 是 $S$ 长度为 $i$ 的前缀的最长 border 长度。

**第一步，先说明 $p=L-\mathrm{next}[L]$ 确实是一个合法周期。**

记 $b=\mathrm{next}[L]$，$p=L-b$。$b$ 是 $S$ 的最长 border，意思是存在一个长度为 $b$ 的串，它既是 $S$ 的前缀又是 $S$ 的后缀：

$$S[1..b]=S[p+1..L]$$

而这个等式的左边恰好就是 $S[1..L-p]$，于是

$$S[i]=S[i+p]\qquad (i=1,2,\dots,L-p)$$

这正是"$p$ 是 $S$ 的周期"的定义。取 $S'=S[1..p]$，则 $S$ 就是 $S'$ 无限重复的一个子串，所以 $p$ 可行。

**第二步，再说明没有比它更小的周期。**

反设 $p'<p$ 也是一个合法周期。由周期定义，对 $i=1,\dots,L-p'$ 有 $S[i]=S[i+p']$，把它按段读出来就是

$$S[1..L-p']=S[p'+1..L]$$

也就是说，长度为 $L-p'$ 的前缀等于同长度的后缀——**$L-p'$ 是 $S$ 的一个 border**。可是

$$L-p' > L-p = \mathrm{next}[L]$$

与 $\mathrm{next}[L]$ 是**最长** border 直接矛盾。故最小周期就是 $p=L-\mathrm{next}[L]$。

**求 next 数组：** 与 KMP 模板完全一致。$\mathrm{next}[i]$ 由 $\mathrm{next}[i-1]$ 出发，先试着把 border 延长一位，失败就沿 border 链 $\mathrm{last}\leftarrow\mathrm{next}[\mathrm{last}]$ 回退，直到能延长或退到 $0$。指针 $i$ 单调递增、回退总量被增量界定，均摊 $O(L)$。

本题只用到 $\mathrm{next}[L]$ 一个值，连模式匹配都不用做，求出 next 后直接输出 $L-\mathrm{next}[L]$ 即可。

**样例验证：** $S=\texttt{cabcabca}$，$L=8$，逐位求 next：

| $i$ | $1$ | $2$ | $3$ | $4$ | $5$ | $6$ | $7$ | $8$ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 前缀 | `c` | `ca` | `cab` | `cabc` | `cabca` | `cabcab` | `cabcabc` | `cabcabca` |
| $\mathrm{next}[i]$ | $0$ | $0$ | $0$ | $1$ | $2$ | $3$ | $4$ | $5$ |

$\mathrm{next}[8]=5$（前缀 `cabca` 同时是后缀），故答案为 $8-5=3$。取 $S'=\texttt{cab}$，$\texttt{cabcabca}$ 确实是 $\texttt{cabcabcabcab}\cdots$ 的一段，与样例解释（用 `abc` 重复）长度一致。

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
    int n;
    cin >> n;

    std::string s;
    cin >> s;

    auto Get_Next = [&](std::string &s) -> vector<int> {
        vector<int> next(n + 1);
        next[0] = -1;
        next[1] = 0;

        int i = 2, back = 0;
        while (i <= n) {
            if (s[i - 1] == s[back]) {
                next[i ++] = ++ back;
            }
            else if (back) {
                back = next[back];
            }
            else {
                next[i ++] = 0;
            }
        }

        return next;
    };

    vector<int> next = Get_Next(s);

    cout << n - next[n] << endl;

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

- 时间复杂度：$O(L)$。只求一遍前缀函数，指针递增与回退的均摊总量都是线性的。
- 空间复杂度：$O(L)$，即 next 数组与读入的字符串。
