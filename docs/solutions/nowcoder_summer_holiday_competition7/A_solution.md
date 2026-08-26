# A 入侵天使领域行动 题解

## 题意

给定长度为 $n$ 的非负整数数组 $a = (a_1, a_2, \ldots, a_n)$（数值按 $31$ 位二进制处理，即 $0 \le a_i < 2^{31}$）。一次操作：选择一个非负整数 $k$，花费 $k$ 单位时间，再选择一个下标集合 $S \subseteq \{1, 2, \ldots, n\}$，把所有 $i \in S$ 的 $a_i$ 同时替换为 $a_i \oplus k$（$\oplus$ 为按位异或，同一个元素可以被多次操作改变）。求使数组变成非递减（$a_1 \le a_2 \le \cdots \le a_n$）所需的最小总花费。

## 核心思路

**算法类型：位运算建模 + 贪心 + 可行性判定。**

**第一步：操作分解到二进制位。** 一次操作 $(k, S)$ 等价于对 $k$ 的每个二进制位 $b$ 各做一次 $\oplus\, 2^b$（下标集合可各自任选，总代价不变）；反之，同一个位也没有买多次的必要。因此任意策略等价于一个**掩码 $M$**：总花费为 $\mathrm{val}(M) = \sum_{b \in M} 2^b$，且 $M$ 中的每一位可以独立地决定是否翻转某个元素。记 $r_i = a_i \ \&\ \overline{M}$ 为 "非 $M$ 位" 的固定部分，则元素 $i$ 的可达集合为
$$
R_i(M) = \{ r_i \mid t : t \subseteq M \},
$$
它是一个 "固定位不变、$M$ 位任取" 的子立方体，最大值为 $r_i \mid M$。问题化为：求数值最小的掩码 $M$，使得存在非递减序列 $x_1 \le \cdots \le x_n$ 且 $x_i \in R_i(M)$。

**第二步：固定 $M$ 的可行性判定。** 从左到右维护 $\mathrm{pre} = x_{i-1}$（初始 $0$）：

1. 若 $r_i \mid M < \mathrm{pre}$：所有可达值都不足 $\mathrm{pre}$，$M$ 不可行；
2. 否则取 $R_i(M)$ 中 $\ge \mathrm{pre}$ 的**最小值**作为 $x_i$（给后续元素留出最大余地），构造方法：令 $x = r_i$，从高位到低位看每一位 $k$——若 $k \notin M$ 则跳过；若 $k \in M$，先假设第 $k$ 位取 $0$，若此时 "低位全部取 $1$" 能达到的最大值仍 $< \mathrm{pre}$，说明这一位必须取 $1$，否则保持 $0$。

**第三步：确定最小掩码。** 掩码满足单调性：$M_1 \subseteq M_2$ 且 $M_1$ 可行 $\Rightarrow M_2$ 可行（多买位只增加选择）。从高位 $30$ 到低位 $0$ 逐位决定答案 $i$ 位：令 $\mathrm{mask} = \mathrm{ans} \mid (2^i - 1)$（第 $i$ 位不买、低位全买，即第 $i$ 位取 $0$ 时最宽松的掩码），检查其可行性——可行则答案第 $i$ 位保留 $0$；不可行则第 $i$ 位必须买（$\mathrm{ans} \mid= 2^i$）。由单调性与逐位归纳可知得到的 $\mathrm{ans}$ 是数值最小的可行掩码。

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
    int N;
    cin >> N;

    vector<int> arr(N + 1, 0);

    for (int i = 1; i <= N; i ++) {
        cin >> arr[i];
    }

    int ans = 0;
    for (int i = 30; i >= 0; i --) {

        int mask = ans | ((1 << i) - 1);

        auto fes = [&](int mask) -> bool {
            int pre = 0;
            for (int i = 1; i <= N; i ++) {
                int r = arr[i] & ~mask;
                if ((r | mask) < pre) return false;
                int x = r;
                for (int k = 30; k >= 0; k --) {
                    if ((mask >> k) & 1) {
                        if ((x | (mask & ((1 << k) - 1))) < pre) {
                            x |= (1 << k);
                        }
                    }
                }
                pre = x;
            }
            return true;
        };

        if (!fes(mask)) ans |= (1 << i);
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
    cin >> _;
    for (int i = 0; i < _; i ++)
    {
        solve();
    }
    return 0;
}
```

## 复杂度

外层从高位到低位共 $31$ 层；每层可行性判定扫描 $n$ 个元素、每个元素内部再扫描 $31$ 位，单次判定为 $O(n \times 31)$。总时间复杂度
$$
O\left(n \times 31^2\right) = O\left(n \log^2 V\right),
$$
其中 $V$ 为值域上界（$31 = \lceil \log_2 V \rceil$）；空间复杂度 $O(n)$（仅需存储数组）。
