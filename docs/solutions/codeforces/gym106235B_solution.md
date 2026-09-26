# gym106235B Proof of Incorrectness 题解

## 题意

交互题。有一个长度为 $n$、元素两两不同的隐藏数组 $a$。评测机（Vasya）会向你发出不超过 $\lceil \log_2 (n!) \rceil - 1$ 次询问 `? i j`，你需要回答 `<`（表示 $a_i < a_j$）或 `>`。答案由你决定，但必须前后自洽。

询问结束后，评测机给出它认为唯一确定的「从小到大的下标排列」`! ord_1 ... ord_n`。你需要输出一个**不同于它**、但与你所有回答都一致的下标排列。

数据范围：$3 \le n \le 18$。

## 核心思路

**算法类型**：状压DP + 构造。扮演对手（adversary）：每次回答都选让「相容的全序个数」更多的那一边，保证最后至少剩两种全序；再把评测机给出的排列里一对不可比的相邻元素交换，就得到另一个合法答案。

**第一步：对手策略。**

把已回答的比较关系看成偏序 $R$（维护传递闭包），记 $L$ 为 $R$ 的线性扩展个数，即与所有回答相容的排列数，初始 $L = n!$。

对询问 `? i j`：

- 若 $R$ 已经确定了 $i, j$ 的大小，直接照答，$L$ 不变；
- 否则分别算出加入 $i < j$ 后的扩展数 $l_1$，以及加入 $j < i$ 后的扩展数 $l_2 = L - l_1$，选较大的一边回答，所以 $L' \ge L / 2$。

记 $K = \lceil \log_2 (n!) \rceil$，则 $2^{K-1} < n!$。至多 $K - 1$ 次询问后

$$L \ge \frac{n!}{2^{K-1}} > 1,$$

即至少有两个相容排列。

**第二步：构造不同的答案。**

评测机给出的 `ord` 是一个相容排列。若它的每对相邻元素都在 $R$ 中可比，由传递性 $R$ 就是全序，只有一个线性扩展，与 $L \ge 2$ 矛盾。所以必有相邻的 `ord[x]`、`ord[x+1]` 在 $R$ 中不可比。交换它们只改变这两者之间的相对顺序，而 $R$ 对这一对没有约束，所以新排列仍然相容，且与 `ord` 不同。

**第三步：状压 DP 统计线性扩展数。**

`need[v]` 为必须排在 $v$ 前面的元素集合。设 $f[S]$ 为「把集合 $S$ 排成整个排列的前 $|S|$ 位」的方案数，枚举 $S$ 中最后一个元素 $v$：

$$f[S] = \sum_{v \in S,\ \text{need}[v] \subseteq S} f[S \setminus \{v\}], \qquad f[\varnothing] = 1.$$

不是「下闭集」的 $S$ 里总有一个元素的前驱缺失，它永远不能放，所以 $f[S] = 0$，不需要特判。$f[\text{全集}]$ 就是线性扩展数。

**第四步：维护传递闭包。** `addRel(M, a, b)` 加入 $a < b$：所有 $\le a$ 的 $x$（$x = a$ 或 $x < a$）与所有 $\ge b$ 的 $y$ 之间都补上 $x < y$，复杂度 $O(n^2)$。

$18! \approx 6.4 \times 10^{15}$，可以用 `long long` 存 $L$ 和 $f$。

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
const int MAXL = 20;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

int n;
bool R[20][20];
LL f[1 << 18];

void addRel(bool M[20][20], int a, int b) {
    bool pre[20] = {}, suf[20] = {};
    for (int x = 1; x <= n; x ++) {
        pre[x] = (x == a) || M[x][a];
    }
    for (int y = 1; y <= n; y ++) {
        suf[y] = (y == b) || M[b][y];
    }
    for (int x = 1; x <= n; x ++) {
        if (pre[x]) {
            for (int y = 1; y <= n; y ++) {
                if (suf[y]) M[x][y] = true;
            }
        }
    }
}

LL countExt(const bool M[20][20]) {
    int need[18] = {};
    for (int v = 0; v < n; v ++) {
        for (int u = 0; u < n; u ++) {
            if (M[u + 1][v + 1]) need[v] |= 1 << u;
        }
    }
    int full = (1 << n) - 1;
    f[0] = 1;
    for (int S = 1; S <= full; S ++) {
        LL sum = 0;
        for (int T = S; T; T &= T - 1) {
            int v = __builtin_ctz(T);
            if ((need[v] & ~S)  == 0) sum += f[S ^ (1 << v)];
        }
        f[S] = sum; 
    }
    return f[full];
}

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    cin >> n;

    LL L = 1;
    for (int i = 2; i <= n; i ++) {
        L *= i;
    }

    std::string op;
    while (cin >> op) {
        if (op == "?") {
            int i, j;
            cin >> i >> j;

            if (R[i][j]) {
                cout << "<" << endl;
                cout.flush();
                continue;
            }
            if (R[j][i]) {
                cout << ">" << endl;
                cout.flush();
                continue;
            }

            bool cand[20][20];
            memcpy(cand, R, sizeof(cand));
            addRel(cand, i, j);

            LL l1 = countExt(cand);
            LL l2 = L - l1;

            if (l1 >= l2) {
                memcpy(R, cand, sizeof(cand));
                L = l1;
                cout << "<" << endl;
                cout.flush();
            }
            else {
                addRel(R, j, i);
                L = l2;
                cout << ">" << endl;
                cout.flush();
            }
        }
        else {
            vector<int> ord(n);
            if (op == "!") {
                for (int t = 0; t < n; t ++) {
                    cin >> ord[t];
                }
            }

            for (int x = 0; x + 1 < n; x ++) {
                int a = ord[x], b = ord[x + 1];
                if (!R[a][b] && !R[b][a]) {
                    std::swap(ord[x], ord[x + 1]);
                    break;
                }
            }

            cout << "! ";
            for (int i = 0; i < n; i ++) {
                cout << ord[i] << " ";
            }
            cout << endl;
            cout.flush();
            break;
        }
    }

    std::string s;
    cin >> s;
    return;
}

int main()
{
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

- 时间复杂度：每次需要计数的询问做一次状压 DP，内层只枚举 $S$ 中的元素，共 $\sum_S |S| = n \cdot 2^{n-1}$ 次转移，$n = 18$ 时约 $2.4 \times 10^6$。询问至多 $\lceil \log_2 18! \rceil - 1 = 52$ 次，总计约 $1.2 \times 10^8$ 次转移。传递闭包更新每次 $O(n^2)$，可以忽略。
- 空间复杂度：$O(2^n + n^2)$，主要是 DP 数组 `f`。
