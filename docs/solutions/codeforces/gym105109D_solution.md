# gym105109D Counting Records 题解

## 题意

Michael 已知歌手前 $n$ 天每天发布的唱片数 $f(1), \dots, f(n)$，并用
$$f(x) = \prod_{i=1}^{n} f(x-i)^{\,f(i)} \qquad (x > n)$$
来估计第 $x$ 天的唱片数。给定 $n, k$ 与 $f(1), \dots, f(n)$，求 $f(k) \bmod (10^9 + 7)$。

数据范围：$1 \le n \le 50$，$1 \le k \le 10^{18}$，$1 \le f(i) \le 10^9$。

## 核心思路

**第一步：把乘方递推取"对数"，化成指数上的线性递推。** 递推式只含乘法与乘方，于是可以把 $f(x)$ 唯一地写成以 $f(1), \dots, f(n)$ 为底的幂之积：
$$f(x) = \prod_{i=1}^{n} f(i)^{\,E(x,i)} .$$
对 $1 \le x \le n$ 显然有 $E(x,i) = [\,x = i\,]$。对 $x > n$，把 $f(x-l) = \prod_j f(j)^{E(x-l,\,j)}$ 逐项代入递推式：
$$f(x) = \prod_{l=1}^{n} \Big(\prod_{j=1}^{n} f(j)^{E(x-l,\,j)}\Big)^{f(l)} = \prod_{j=1}^{n} f(j)^{\ \sum_{l=1}^{n} f(l)\,E(x-l,\,j)} .$$
把右端与 $f(x) = \prod_j f(j)^{E(x,j)}$ 对照，逐个 $f(j)$ 比较指数，即得
$$E(x,i) = \sum_{l=1}^{n} f(l)\,E(x-l,i).$$
固定 $i$ 时这是一个 $n$ 阶常系数线性递推：递推系数始终是 $f(1), \dots, f(n)$，不同的 $i$ 只对应不同的初值。

**第二步：伴随矩阵快速幂。** 对固定的 $i$，令状态向量
$$H_x = \big(E(x,i),\ E(x-1,i),\ \dots,\ E(x-n+1,i)\big)^{\mathsf T},$$
则当 $x \ge n$（保证向量中每个下标都 $\ge 1$）时 $H_{x+1} = C\,H_x$，其中
$$C = \begin{pmatrix}
f(1) & f(2) & \cdots & f(n-1) & f(n) \\
1 & 0 & \cdots & 0 & 0 \\
0 & 1 & \cdots & 0 & 0 \\
\vdots & & \ddots & & \vdots \\
0 & 0 & \cdots & 1 & 0
\end{pmatrix}.$$
初值 $H_n = \big(E(n,i),\ E(n-1,i),\ \dots,\ E(1,i)\big)^{\mathsf T} = e_{\,n-i}$（下标从 $0$ 起，只有第 $n-i$ 个分量为 $1$），于是
$$E(k,i) = \big(C^{\,k-n}\big)[0]\,[\,n-i\,].$$
代码中的矩阵 $A$ 正是这个 $C$：第一行是 $f(1), \dots, f(n)$，次对角线全为 $1$。求出 $P = A^{\,k-n}$ 后，$P$ 的第 $0$ 行就是一组指数：$f(i)$ 的指数为 $P[0][\,n-i\,]$。

**第三步：指数按费马小定理取模。** 由于 $1 \le f(i) \le 10^9 < 10^9+7$，每个底数都满足 $f(i) \not\equiv 0 \pmod p$，于是
$$f(i)^{E} \equiv f(i)^{\,E \bmod (p-1)} \pmod p .$$
真正的指数 $E(k,i)$ 大到无法直接表示，但指数满足的递推是整系数线性的，模 $p-1$ 之后仍满足同一递推、同一初值，所以直接把矩阵幂在模 $p - 1$ 下计算，得到的就是 $E(k,i) \bmod (p-1)$。最后对每个 $i$ 用快速幂求 $f(i)^{E(k,i) \bmod (p-1)}$ 并相乘。

**第四步：$k \le n$ 时直接输出。** 此时 $f(k)$ 就是输入中给出的已知值，输出 $f(k) \bmod p$ 即可，不需要矩阵幂。

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
const LL MOD = 1e9 + 7;
const int MAXL = 0;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

vector<LL> f;

vector<vector<LL>> mul(const vector<vector<LL>> &A, const vector<vector<LL>> &B, LL mod) {
    int s = A.size();
    vector<vector<LL>> C(s, vector<LL>(s, 0));
    for (int i = 0; i < s; i ++) {
        for (int j = 0; j < s; j ++) {
            if (!A[i][j]) continue;
            LL a = A[i][j];
            for (int k = 0; k < s; k ++) {
                C[i][k] = (C[i][k] + a * B[j][k]) % mod;
            }
        }
    }
    return C;
}

vector<vector<LL>> mpow(vector<vector<LL>> A, LL e, LL mod) {
    int s = A.size();
    vector<vector<LL>> R(s, vector<LL>(s, 0));
    for (int i = 0; i < s; i ++) {
        R[i][i] = 1;
    }
    for (; e; e >>= 1) {
        if (e & 1) {
            R = mul(R, A, mod);
        }
        A = mul(A, A, mod);
    }
    return R;
}

LL qpow(LL a, LL p, LL mod) {
    a %= mod;
    LL res = 1;
    for (; p; p >>= 1) {
        if (p & 1) res = res * a % mod;
        a = a * a % mod;
    }
    return res;
}

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    LL n, k;
    cin >> n >> k;
    f.resize(n + 1);

    for (int i = 1; i <= n; i ++) {
        cin >> f[i];
    }

    if (k <= n) {
        cout << f[k] % MOD << endl;
    }
    else {
        LL s = n;
        vector<vector<LL>> A(s, vector<LL>(s, 0));
        for (int j = 0; j < s; j ++) {
            A[0][j] = f[j + 1] % (MOD - 1);
        }
        for (int j = 1; j < s; j ++) {
            A[j][j - 1] = 1;
        }

        vector<vector<LL>> Pm = mpow(A, k - n, MOD - 1);
        LL ans = 1;

        for (int j = 0; j < s; j ++) {
            ans = ans * qpow(f[j + 1] % MOD, Pm[0][s - 1 - j], MOD) % MOD;
        }
        cout << ans << endl;
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

- 时间复杂度：矩阵快速幂 $O(n^3 \log k)$（$n \le 50$，$\log k \approx 60$），最后 $n$ 次快速幂 $O(n \log p)$；$k \le n$ 时为 $O(1)$。
- 空间复杂度：$O(n^2)$（伴随矩阵与矩阵乘法的中间结果）。
