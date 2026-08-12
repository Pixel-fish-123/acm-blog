# 5 P1012 [NOIP 1998 提高组] 拼数 题解

## 题意

设有 $n$ 个正整数 $a_1, \dots, a_n$，将它们连接成一排，相邻数字首尾相接，组成一个最大的整数，输出这个整数。

数据范围：$1 \le n \le 20$，$1 \le a_i \le 10^9$。

## 核心思路

贪心 + 自定义排序（邻项交换法）。

问题的关键在于确定数字之间的先后顺序。对任意两个数 $x, y$，它们相邻时有两种摆放：$x$ 在前拼出 $xy$，或 $y$ 在前拼出 $yx$。若 $yx > xy$，则把 $y$ 放在 $x$ 前面得到的拼接结果一定更优（其余数字的位置不变，不会影响这两者内部的比较）。

因此只需把所有数字按比较规则"$a$ 排在 $b$ 前面当且仅当 $a + b > b + a$"降序排序，再依次拼接即可。由于两个数都是正整数，拼接结果不会是空串或前导零。数据以字符串读入，拼接与比较均按字典序处理（数字等长与不等长时，$a + b$ 与 $b + a$ 的字典序比较恰好对应两个拼接整数的数值比较）。

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

    vector<std::string> s(n);

    for (int i = 0; i < n; i ++) {
        cin >> s[i];
    }

    std::sort(s.begin(), s.end(), [&](std::string pre, std::string lst) {
        return pre + lst > lst + pre;
    });

    std::string res = "";

    for (int i = 0; i < n; i ++) {
        res = res + s[i];
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

## 复杂度

- 时间复杂度：$O(n \log n)$ 次比较，每次比较需要拼接两个字符串，总比较代价为 $O(n \log n \cdot |s|)$，其中 $|s|$ 为数字串长度。
- 空间复杂度：$O(n \cdot |s|)$。
