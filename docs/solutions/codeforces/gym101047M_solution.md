# gym101047M Removing coins in Kem Kadrãn 题解

## 题意

一排 $N$ 枚棋子，编号 $1$ 到 $N$，每枚棋子一面金色（`D`）一面白色（`B`）。金色朝上的棋子可以拿走；拿走第 $i$ 枚后，第 $i - 1$ 枚和第 $i + 1$ 枚（如果还在）各翻一面。

给出初始状态，判断能否拿走全部棋子。能则输出 `Y` 并在下一行给出一种拿走顺序，否则输出 `N`。

数据范围：$1 \le T \le 100$，$1 \le N \le 10^5$，$\sum N \le 5 \times 10^5$。

## 核心思路

**算法类型**：构造 + 贪心。从左往右扫，遇到金色棋子就拿走它，再顺带拿走它左边连成一段的白色棋子。可以证明：有解当且仅当 `D` 的个数是奇数，并且只要有解，这个扫描就一定能拿完。

**第一步：扫描过程。**

扫到第 $i$ 枚时，左边已经拿过的棋子总是一段前缀 $1..p-1$，剩下的 $p..i-1$ 全是白色。

- 第 $i$ 枚是白色：什么也不做，它加入左边这段白色。
- 第 $i$ 枚是金色：拿走它，第 $i + 1$ 枚翻面；第 $i - 1$ 枚由白翻金，拿走它，于是第 $i - 2$ 枚又由白翻金……这段白色会一路连锁拿完，直到碰到已经拿走的位置。之后 $1..i$ 全部拿完。

代码中 `st[i + 1]` 的三目运算就是翻面，内层 `for` 循环就是向左的连锁，拿走的棋子标成 `@`。每枚棋子只会被拿走一次，所以总共是 $O(N)$。

**第二步：有解的条件。**

结论：一段非空的棋子能拿完，当且仅当其中 `D` 的个数是奇数。

- 必要性：对段长归纳。只有一枚时，它必须是 `D`。拿走段内一枚 `D` 后，段分成左右两部分 $L, R$，各自靠近被拿走位置的那枚翻了面，所以非空一侧的 `D` 个数奇偶性翻转。若原段 `D` 的个数为偶数，则 $L, R$ 中 `D` 的个数之和为奇数：两侧都非空时，翻面后两侧之和仍为奇数，必有一侧是偶数；只有一侧非空时，那一侧翻面后是偶数。由归纳假设，偶数的那一侧拿不完。
- 充分性：在第一步的扫描中，拿走第 $i$ 枚时左侧那段白色有 $0$ 个 `D`，翻面后只有 $1$ 个，正好连锁拿完；右侧 $i+1..N$ 的 `D` 个数从偶数翻成奇数。所以剩下的那段 `D` 的个数始终是奇数。如果扫描结束时还剩棋子，它们全是白色，`D` 的个数为 $0$，矛盾。

所以从左往右扫一遍，拿走的个数等于 $N$ 就输出这个顺序，否则输出 `N`。

**第三步：从右往左的备用扫描。**

代码还对称地做了一遍从右往左的扫描，结果存在 `res2` 里。由第二步，左扫失败时 `D` 的个数一定是偶数，右扫同样会失败，所以这一段不会改变结果，只是一份保险。

**样例验证。** `DDBDD` 有 $4$ 个 `D`，输出 `N`。`DBBBBB` 有 $1$ 个 `D`：拿走 $1$ 后第 $2$ 枚翻金，依次拿走 $2, 3, \dots, 6$，输出 `1 2 3 4 5 6`。

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
#define endl '\n' // 交互题记得去掉

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    std::string s;
    int n;
    cin >> n;
    cin >> s;

    vector<char> st(n + 2), st2(n + 2);
    vector<int> res, res2;
    
    for (int i = 1; i <= n; i ++) {
        st[i] = s[i - 1];
        st2[i] = s[i - 1];
    }

    for (int i = 1; i <= n; i ++) {
        if (st[i] == 'D') {
            res.push_back(i);
            st[i] = '@';
            st[i + 1] == 'D' ? st[i + 1] = 'B' : st[i + 1] = 'D';
            for (int k = i - 1; k >= 1 && st[k] == 'B'; k --) {
                st[k] = '@';
                res.push_back(k);
            }
        }
    }

    for (int i = n; i >= 1; i --) {
        if (st2[i] == 'D') {
            res2.push_back(i);
            st2[i] = '@';
            st2[i - 1] == 'D' ? st2[i - 1] = 'B' : st2[i - 1] = 'D';
            for (int k = i + 1; k <= n && st2[k] == 'B'; k ++) {
                st2[k] = '@';
                res2.push_back(k);
            }
        }
    }

    if (res.size() == n) {
        cout << "Y" << endl;
        for (auto x : res) {
            cout << x << " ";
        }
        cout << endl;
    }
    else if (res2.size() == n) {
        cout << "Y" << endl;
        for (auto x : res2) {
            cout << x << " ";
        }
        cout << endl;
    }
    else {
        cout << "N" << endl;
    }

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

- 时间复杂度：每次扫描中每枚棋子至多被拿走一次，每组数据 $O(N)$。
- 空间复杂度：$O(N)$。
