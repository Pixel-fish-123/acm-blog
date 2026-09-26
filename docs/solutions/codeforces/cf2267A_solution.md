# cf2267A Turn Into a Palindrome 题解

## 题意

给定长度为 $n$ 的小写字母串 $s$ 和一个字母 $c$。每花 $1$ 枚硬币，可以选一个位置 $i$，把 $s_i$ 改成 $c$。求把 $s$ 变成回文串所需的最少硬币数。

数据范围：$1 \le t \le 500$，$1 \le n \le 100$。

## 核心思路

**算法类型**：贪心。回文只约束对称位置 $(i, n - 1 - i)$ 相等，各对之间互不影响，逐对取最小代价再求和即可。

对每一对 $(x, y) = (s_i, s_{n-1-i})$：

- $x = y$：已经相等，代价 $0$。
- $x \ne y$ 且其中一个等于 $c$：把另一个改成 $c$，代价 $1$。至少要改一次，所以这是最优的。
- $x \ne y$ 且都不等于 $c$：只改一个的话，这个位置变成 $c$，另一个仍不是 $c$，还是不相等；所以两个都要改成 $c$，代价 $2$。

$n$ 为奇数时中间字符自成一对，不需要处理。

**样例验证。** `codeforces`，$c = $ `c`：五对依次为 `(c,s)`、`(o,e)`、`(d,c)`、`(e,r)`、`(f,o)`，代价为 $1 + 2 + 1 + 2 + 2 = 8$。

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
    char s;
    cin >> n >> s;

    std::string str;
    cin >> str;
    int cnt = 0;
    for (int i = 0; i < n / 2; i ++) {
        int pre = i, lst = n - i - 1;
        if (str[pre] != str[lst]) {
            if (str[pre] == s || str[lst] == s) cnt ++;
            else cnt += 2; 
        }
    }

    cout << cnt << endl;
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

- 时间复杂度：每组数据 $O(n)$，总计 $O(\sum n)$。
- 空间复杂度：$O(n)$，用于存字符串。
