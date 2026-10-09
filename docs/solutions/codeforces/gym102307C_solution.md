# gym102307C Common Subsequence 题解

## 题意

给定两个长度均为 $n$ 的 DNA 串 $A$、$B$（$1\le n\le 10^5$，只含 `A`、`T`、`G`、`C`）。若 $A$ 和 $B$ 存在长度不小于 $0.99\times n$ 的公共子序列，输出 `Long lost brothers D:`，否则输出 `Not brothers :(`。

时间限制 4 秒，空间限制 256 MB。

## 核心思路

**算法类型**：位运算优化的线性DP（bit-parallel LCS）。

直接求出 $\mathrm{LCS}(A,B)$ 的长度 $L$，再判断 $L\ge\lceil 0.99n\rceil$ 即可。朴素 DP 是 $O(n^2)=10^{10}$，过不了；把 DP 的一整行压进二进制位，一次处理 $64$ 列，复杂度降为 $O(n^2/64)\approx 1.6\times 10^8$ 次简单位运算，可以通过。

整体流程：先预处理每个字符在 $B$ 中的位置掩码 $M_c$；再依次读入 $A$ 的每个字符 $c$，用三行位运算更新位向量 $V$；全部读完后 $\mathrm{popcount}(V)$ 就是 LCS 长度。

### 第一步：用差分把一行 DP 变成 0/1 串

记 $dp[i][j]$ 为 $A[1..i]$ 与 $B[1..j]$ 的 LCS 长度。转移为

$$
dp[i][j]=
\begin{cases}
dp[i-1][j-1]+1 & A_i=B_j \\
\max(dp[i-1][j],\,dp[i][j-1]) & A_i\neq B_j
\end{cases}
$$

关键性质：同一行相邻两格最多差 $1$，即

$$
dp[i][j]-dp[i][j-1]\in\{0,1\}
$$

因为 $B$ 多一个字符，LCS 最多多出这一个字符。所以一整行只需记录「在哪些列加了 $1$」。定义位向量 $V$：

$$
V \text{ 的第 } j-1 \text{ 位}=dp[i][j]-dp[i][j-1]
$$

于是 $dp[i][j]$ 等于 $V$ 的第 $0$ 到第 $j-1$ 位中 $1$ 的个数，整行的 LCS 长度就是 $\mathrm{popcount}(V)$。

例：$B=\texttt{abcab}$，$A=\texttt{bca}$，最后一行为

| $j$ | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| $B_j$ | a | b | c | a | b |
| $dp[3][j]$ | 1 | 1 | 2 | 3 | 3 |
| 增量 | 1 | 0 | 1 | 1 | 0 |

写成二进制（右边是第 $0$ 位）就是 $V=01101_2$，popcount 为 $3$。

### 第二步：字符的位置掩码 $M_c$

对每个字符 $c$，$M_c$ 是一个和 $B$ 等长的 $0/1$ 串：$B$ 中第 $j$ 个字符等于 $c$ 的位置为 $1$，其余为 $0$。例如 $B=\texttt{abcab}$ 时

$$
M_a=01001_2,\quad M_b=10010_2,\quad M_c=00100_2
$$

读入 $A$ 的字符 $c$ 时，$M_c$ 一次性给出 $B$ 中所有能与它配对的位置。

代码里先用 `transform` 把 `A`、`C`、`G`、`T` 映射成 $1\sim 4$，`Match[transform[c]]` 就是 $M_c$。本题只有 $4$ 种字符，所以只需 `MAXL = 10` 个掩码。

### 第三步：一行 DP 怎么变

把 $V$ 中的 $1$ 当作分隔点，把 $B$ 切成若干段：第 $k$ 段从第 $k-1$ 个 $1$ 的下一位开始，到第 $k$ 个 $1$（含）结束；最后一个 $1$ 之后剩下的部分叫尾巴，其中没有 $1$。第 $k$ 个 $1$ 所在的列，就是「LCS 长度第一次达到 $k$」的列。

读入新字符 $c$ 后，看第 $k$ 段中的位置 $p$：它前面有 $k-1$ 个 $1$，即 $B$ 在 $p$ 之前的前缀与旧 $A$ 的 LCS 为 $k-1$。若 $B_p=c$，接上这对字符长度就到了 $k$。所以

$$
\text{新的第 } k \text{ 个 } 1=\min\bigl(\text{旧的第 } k \text{ 个 } 1,\ \text{第 } k \text{ 段中第一个匹配位置}\bigr)
$$

两者合起来，正是「第 $k$ 段中 $V\lor M_c$ 的最低位 $1$」。尾巴段若有匹配，就在最低的匹配处新增一个 $1$（LCS 加一）；若没有匹配，则不变。

**结论：新的 $V$ 是每一段里 $X=V\lor M_c$ 的最低位 $1$。**

### 第四步：三行位运算

$$
\begin{align*}
X &= V \lor M_c \\
Y &= X - \bigl((V\ll 1)\lor 1\bigr) \\
V' &= X \land \lnot Y
\end{align*}
$$

1. $S=(V\ll 1)\lor 1$：$V\ll 1$ 把每个 $1$ 移到下一段的起点，$\lor 1$ 补上第一段的起点。$S$ 就是「每段起点放一个 $1$」。
2. $X-S$：相当于每一段各自减 $1$。二进制减 $1$ 的规律是：最低的那个 $1$ 变成 $0$，它下面的 $0$ 全变成 $1$，更高的位不变。由于每段末尾都含旧的 $1$，借位一定在本段内停下，不会影响下一段。
3. $X\land\lnot Y$：逐位比较

| 位置 | $X$ | $Y$ | $X\land\lnot Y$ |
|---|---|---|---|
| 最低 $1$ 下面 | 0 | 1 | 0 |
| 最低 $1$ 本身 | 1 | 0 | **1** |
| 最低 $1$ 上面 | 同 $Y$ | 同 $X$ | 0 |

恰好只剩每段的最低位 $1$。尾巴段没有匹配时，借位冲出最高位，这些位上 $X=0$，不会产生新的 $1$。因此三行位运算与 DP 完全等价。

### 第五步：手算样例

$B=\texttt{abcab}$，$A=\texttt{bca}$，初始 $V=00000_2$。

读入 `b`：

$$
X=10010,\quad S=00001,\quad Y=10001,\quad V=10010\land 01110=00010
$$

读入 `c`：

$$
X=00110,\quad S=00101,\quad Y=00001,\quad V=00110\land 11110=00110
$$

读入 `a`：

$$
X=01111,\quad S=01101,\quad Y=00010,\quad V=01111\land 11101=01101
$$

最终 $V=01101_2$，与朴素 DP 的最后一行一致，LCS 长度为 $3$。

### 第六步：多块实现（$m>64$）

一个 `uint64_t` 只能装 $64$ 位。$m>64$ 时，把 $V$ 拆成 `cnt` $=\lceil m/64\rceil$ 块，块 $0$ 存第 $0\sim 63$ 位，块 $1$ 存第 $64\sim 127$ 位，依此类推，整体看成一个超长二进制数。

- $V\lor M$ 和 $X\land\lnot Y$ 是逐位运算，每块各算各的。
- $V\ll 1$：每块的最高位被挤出，要放进下一块的最低位（代码中的 `p`，初值为 $1$，正好实现 $\lor 1$）。
- $X-S$：像竖式减法，低块不够减时向下一块借 $1$（代码中的 `borrow`）。要算 $X-S-\text{borrow}$，当 $X<S+\text{borrow}$ 时需要继续借：借位为 $0$ 时条件为 $X<S$，借位为 $1$ 时条件为 $X\le S$。
- 最后一块若没装满（$m$ 不是 $64$ 的倍数），超出 $m$ 的高位要清零，否则 popcount 会多数。

### 代码各部分对照

| 代码 | 数学含义 |
|---|---|
| `transform` | 把 `A C G T` 映射为 $1\sim 4$，作为掩码下标 |
| `Match[char_to_num]` | $M_c$，字符 $c$ 在 $B$ 中的位置掩码 |
| `V` | 差分位向量，$\mathrm{popcount}(V)$ 为当前 LCS 长度 |
| `S` | $(V\ll 1)\lor 1$，每段的起点 |
| `X = V[i] \| M[i]` | $V\lor M_c$ |
| `Y = X - S[i] - borrow` | 多块版的 $X-S$ |
| `V[i] = X & ~Y` | $X\land\lnot Y$，每段只留最低位 $1$ |
| `p` / `borrow` | 块间的左移进位 / 减法借位 |
| 末块 `&= ((1ULL << (m % W)) - 1)` | 清掉超出长度 $m$ 的位 |
| `__builtin_popcountll` | 统计 $1$ 的个数，即答案 |
| `limit = ceil(a.size() * 0.99)` | 阈值 $\lceil 0.99n\rceil$ |

判定用的是浮点写法 `ceil((double)a.size() * 0.99)`。$0.99$ 的双精度值略小于 $0.99$，乘积不会越过整数，对 $1\le n\le 10^5$ 与精确值 $\lceil 99n/100\rceil$ 完全一致，等价于整数写法 $100L\ge 99n$。

### 补充：另一种做法

本题只要求 LCS 不小于 $0.99n$，等价于两边各自最多删掉 $\lceil n/100\rceil$ 个字符。可以在「$A$ 删了 $i$ 个、$B$ 删了 $j$ 个」的 $(\lceil n/100\rceil+1)^2$ 网格上做 DP，每个状态贪心地把相同字符一路匹配下去。这种做法利用了 $0.99$ 这个条件，而位运算 LCS 是通用的精确做法，不依赖这个条件。

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
const int MAXL = 10;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

std::map<char, int> transform;

int bit_lcs(const std::string& A, const std::string& B) {
    int n = (int)A.size(), m = (int)B.size();
    if (n <= 0 || m <= 0) return 0;

    const int W = 64;
    int cnt = (m + W - 1) / W;

    vector<uint64_t> Match[MAXL];

    for (int i = 0; i < MAXL; i ++) {
        Match[i].assign(cnt, 0);
    }

    for (int i = 0; i < m; i ++) {
        int char_to_num = transform[B[i]];
        Match[char_to_num][i / W] |= 1ULL << (i % W); 
    }

    vector<uint64_t> V(cnt, 0), S(cnt, 0);

    for (unsigned char c : A) {
        int char_to_num = transform[c];
        vector<uint64_t> &M = Match[char_to_num];

        uint64_t p = 1;
        for (int i = 0; i < cnt; i ++) {
            S[i] = (V[i] << 1) | p;
            p = V[i] >> 63;
        }

        uint64_t borrow = 0;
        for (int i = 0; i < cnt; i ++) {
            uint64_t X = V[i] | M[i];
            uint64_t Y = X - S[i] - borrow;
            borrow = borrow ? (X <= S[i]) : (X < S[i]);
            V[i] = X & ~Y;
        }
    }

    if (m % W) V[cnt - 1] &= ((1ULL << (m % W)) - 1);

    int ans = 0;
    for (uint64_t p : V) {
        ans += __builtin_popcountll(p);
    }

    return ans;
}
void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    transform['A'] = 1; // A C G T
    transform['C'] = 2;
    transform['G'] = 3;
    transform['T'] = 4;

    std::string a, b;
    cin >> a >> b;

    int len = bit_lcs(a, b);

    int limit = ceil((double)a.size() * 0.99);

    if (len >= limit) {
        cout << "Long lost brothers D:" << endl;
    }
    else {
        cout << "Not brothers :(" << endl;
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

- 时间复杂度：$O(n\cdot\lceil n/64\rceil)$，$n=10^5$ 时约 $1.6\times 10^8$ 次位运算。本地对 $n=10^5$ 的随机数据运行约 $0.5$ 秒。
- 空间复杂度：$O(\sigma\cdot n/64)$，代码开了 `MAXL` $=10$ 个掩码，每个 $\lceil n/64\rceil$ 个 `uint64_t`，约 $125$ KB。
