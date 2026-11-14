# gym106802F Circular Minesweeper 题解

## 题意
交互题。有一个长度为 $L = 10^9$ 的环形格子（编号 $1 \sim L$），其中均匀随机分布着 $n$（$2 \le n \le 2 \cdot 10^5$）颗地雷。每次你可以询问一个格子 `? x`：
- 若格子 $x$ 有未引爆的地雷，该地雷会引爆，交互器返回 `YES d`；
- 若格子 $x$ 没有未引爆的地雷，交互器返回 `NO d`。

其中 $d$ 是格子 $x$ 到场上**某颗**尚未引爆的地雷的环上最短距离 $\min(|x - y|, L - |x - y|)$（由交互器按未知规则挑选，不一定是最近的地雷）。你最多可以询问 $30$ 次，要求在不能引爆所有地雷的前提下，输出 `! ans` 指出一个**当前肯定有未引爆地雷**的格子。

## 核心思路
**算法类型**：交互 + 随机化 + 构造（随机二选一试探与单雷交集定位）。

每次询问格子 $x$ 得到距离 $d$ 后，交互器选中的那颗未引爆地雷必然位于候选集合 $\{x - d \pmod L, x + d \pmod L\}$ 中：
- 若 $2d = L$，环上距离为 $L / 2$ 的点唯一（$x - d \equiv x + d \pmod L$），无需继续询问，直接输出 `x + d` 即可获胜。
- 当场上剩余未引爆地雷数 `remaining > 1` 时：
  我们已知 $A = x - d \pmod L$ 和 $B = x + d \pmod L$ 中**至少有一个是地雷**。此时从 $\{A, B\}$ 中随机挑一个位置 $z$ 进行询问：
  1. 如果返回 `NO`（$z$ 不是地雷）：说明另一侧的候选位置**百分百是未引爆的地雷**，且这次询问没有引爆任何地雷！直接输出另一个位置（$z = A ? B : A$）即可立刻获胜。
  2. 如果返回 `YES`（$z$ 是地雷）：虽然引爆了 $z$，但因为此前 `remaining > 1`，场上至少还有地雷未爆，并且这次询问又给出了新的距离 $d'$。我们令 $x \leftarrow z, d \leftarrow d'$，`remaining--`，继续下一轮二选一！
  由于地雷位置是均匀随机生成的，很难出现连续 $30$ 次恰好每次都踩中真地雷的情况（除非两个方向对称都有雷，概率极低）。
- 当引爆到只剩**最后一颗地雷**（`remaining == 1`）时：
  此时绝对不能再直接去踩候选点 $\{x - d, x + d\}$，否则一旦踩中就会把最后一颗雷引爆导致判负。
  因为场上只剩唯一一颗地雷，无论我们询问哪个安全位置 $y$，交互器返回的距离 $e$ 必定指向**同一颗**地雷！因此我们只需挑一个避开 $\{x, x - d, x + d, x + L / 2\}$ 的邻近安全点 $y$ 询问一次得到距离 $e$，然后求两次候选集合 $\{x - d, x + d\}$ 与 $\{y - e, y + e\}$ 的交集，唯一的公共点就是最后一颗地雷的位置。

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
#include <chrono>
// 支持lcm函数
#define LL long long
#define ULL unsigned long long
#define pair_int std::pair<int, int>
#define pair_LL std::pair<LL, LL>
const int INF_INT = INT_MAX - 5;
const LL INF_LL = LONG_LONG_MAX - 5;
const LL MOD1 = 998244353;
const LL MOD2 = 1e9 + 7;
const int MAXL = 0;
using std::cin;
using std::cout;
using std::endl;
using std::vector;

const LL L = 1000000000LL;

int asked = 0;

LL norm(LL x) {
    x %= L;
    if (x <= 0) {
        x += L;
    }
    return x;
}

LL addmod(LL a, LL b) {
    return norm(a + b);
}

LL submod(LL a, LL b) {
    return norm(a - b);
}

struct Reply
{
    bool isMine;
    LL d;
};

Reply query(LL x) {
    cout << "? " << x << endl;
    std::string s;
    LL d;
    cin >> s >> d;
    ++ asked;
    return {s == "YES", d};
}

void answer(LL x) {
    cout << "! " << x << endl;
    exit(0);
}

void solveLastMine(LL x, LL d) {
    if (2 * d == L) {
        answer(addmod(x, d));
    }

    if (asked == 30) {
        answer(submod(x, d));
    }

    LL forbidden[4] = {x, submod(x, d), addmod(x, d), addmod(x, L / 2)};

    LL y = addmod(x, 1);

    while (std::find(forbidden, forbidden + 4, y) != forbidden + 4) {
        y = addmod(y, 1);
    }

    Reply r = query(y);
    LL e = r.d;

    vector<LL> P = {submod(x, d)};
    if (2 * d != L) P.push_back(addmod(x, d));

    vector<LL> Q = {submod(y, e)};
    if (2 * e != L) Q.push_back(addmod(y, e));

    for (LL p : P) {
        for (LL q : Q) {
            if (p == q) {
                answer(p);
            }
        }
    }

    answer(P[0]);
}

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);

    int n;
    cin >> n;

    int remaining = n;

    std::mt19937_64 rng(
        std::chrono::steady_clock::now().time_since_epoch().count()
    );

    LL x = rng() % L + 1;

    Reply r = query(x);
    if (r.isMine) --remaining;
    LL d = r.d;

    while (remaining > 1) {
        if (2 * d == L) {
            answer(addmod(x, d));
        }

        LL A = submod(x, d);
        LL B = addmod(x, d);

        if (asked == 30) {
            answer((rng() & 1) ? A : B);
        }

        LL z = (rng() & 1) ? A : B;
        Reply t = query(z);

        if (!t.isMine) {
            answer(z == A ? B : A);
        }

        --remaining;
        x = z;
        d = t.d;
    }

    solveLastMine(x, d);


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
- 时间复杂度：$O(1)$，最多进行 $30$ 次交互询问，每次计算均为常数级别。
- 空间复杂度：$O(1)$。

预估难度：CF 1700（约 1700*）。本题难度由 AI 预估，仅作为参考。
