# gym106806E Endurtaka Mig 题解

## 题意
定义合法单词为**不能**表示成某个子串重复拼接 $k$ 次（$k \ge 2$）的字符串。现给定一个由小写字母组成的非空字符串 $s$（$1 \le |s| \le 3 \cdot 10^5$），要求将 $s$ 切分成最少数量的合法单词，输出最少单词数以及对应的切分方案。

## 核心思路
**算法类型**：KMP + 构造（前缀函数判最小周期 + 分类切分）。

先用 KMP 的 `next` 数组求出整串 $s$ 的最长相等真前后缀长度 $\text{next}[n]$，记最小候选周期长度为 $p = n - \text{next}[n]$。由周期引理，字符串 $s$ 是周期串（即由某个子串重复至少 $2$ 次拼成）当且仅当 $p < n$ 且 $p \mid n$。由此分三类讨论：

1. **$s$ 本身不是周期串**（$p = n$ 或 $p \nmid n$）：
   整串本身就是一个合法单词，最少切分成 $1$ 段，直接输出 $s$。
2. **$s$ 是最小周期 $p > 1$ 的周期串**（$p \mid n$ 且 $p > 1$）：
   此时 $1$ 段不行，考虑切成 $2$ 段：$s[0..0]$ 和 $s[1..n-1]$。
   - 第一段长度为 $1$，显然不是重复串；
   - 第二段长度为 $n - 1$。若 $s[1..n-1]$ 也是某个周期 $q \mid (n - 1)$ 的周期串，由于它同时是原串的子串、拥有周期 $p$，且 $\gcd(p, n - 1) = \gcd(p, -1) = 1$，由弱周期引理（或直接传递相等关系）会推出 $s[1..n-1]$ 所有字符全部相同，从而原串最小周期应为 $1$，与 $p > 1$ 矛盾。
   因此切成首字符 $s[0]$ 和剩余后缀 $s[1..n-1]$ 两段一定合法，答案为 $2$。
3. **$s$ 的最小周期 $p = 1$**（即全串由同一个字符组成）：
   任意长度 $\ge 2$ 的子串都是同一个字符重复多次，必然不合法；只有长度为 $1$ 的子串合法。因此只能把每个字符单独切成一段，最少切分成 $n$ 段。

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
    std::string s;
    cin >> s;

    int n = s.size();

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

    int ans = n - next[n];
    
    if (ans == n || n % ans != 0) {
        cout << 1 << endl;
        cout << s << endl;
    }
    else if (n % ans == 0 && ans > 1) {
        cout << 2 << endl;
        cout << s[0] << " " << s.substr(1) << endl;
    }
    else {
        cout << s.size() << endl;
        for (int i = 0; i < s.size(); i ++) {
            cout << s[i] << " ";
        }
    }

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
- 时间复杂度：$O(n)$，求 KMP 的 `next` 数组与输出均为线性。
- 空间复杂度：$O(n)$，用于存储字符串与 `next` 数组。

预估难度：CF 1600（约 1600*）。本题难度由 AI 预估，仅作为参考。
