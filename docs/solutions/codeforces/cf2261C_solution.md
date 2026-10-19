# cf2261C I Know About a Million Things 题解

## 题意
数组 $a_1,\ldots,a_n$。Moggity 先手，轮流操作：选一个非空下标集合删掉这些元素，要求「只删一个」或「删掉的元素之和为偶数」。面对空数组的人判负。判断先手是否有必胜策略：有则输出 `Moggity`，否则 `Larpity`。

多测，$1\le t\le 10^4$，$1\le n\le 10^6$，总 $n\le 10^6$，$1\le a_i\le 10^6$。

## 核心思路
**算法类型**：博弈论。合法操作只关心元素奇偶，统计偶数个数 $E$、奇数个数 $O$ 即可。下面按代码的判定顺序说明。

### 1. 特判一次拿完（$n=1$）
若 $E+O=1$，数组只剩一个数。单删合法，先手直接拿掉它，后手面对空数组，先手胜（`Moggity`）。

### 2. 把奇数两两折进偶数
两个奇数之和为偶，可以把每两个奇数「折」成一个偶数计入：
$$
E \leftarrow E+\left\lfloor\frac{O}{2}\right\rfloor,\qquad O\leftarrow O\bmod 2
$$
折完后 $O\in\{0,1\}$，此时的 $E$ 表示「原偶数个数 + 奇数对个数」。对应代码：`even += (odd / 2); odd %= 2;`。

### 3. 折完后没有奇数（$O=0$）→ 先手胜
原奇数个数为偶数，全体元素之和为偶；又已排除 $n=1$，故 $n\ge 2$。先手一次删光全部（和为偶），必胜。

### 4. 折完后仍有奇数，且偶数足够（$O=1$ 且 $E\ge 2$）→ 先手仍必胜
折完后还剩一个奇数，同时「偶数单位」（真偶数 + 奇数对）至少两个。先手可以把后手逼进必败局面，例如：

- 原局面 $(E,O)=(2,1)$：删掉 $1$ 个偶数，留给后手 $(1,1)$；
- 原局面 $(E,O)=(1,3)$：删光唯一的偶数，留给后手 $(0,3)$；
- 原局面 $(E,O)=(0,5)$：删掉 $2$ 个奇数（和为偶），留给后手 $(0,3)$；
- 原局面 $(E,O)=(3,1)$：删掉 $2$ 个偶数，留给后手 $(1,1)$。

凡折完后满足 $O=1$ 且 $E\ge 2$ 的原局面（如 $(2,1)$、$(1,3)$、$(0,5)$、$(3,1)$ 等）都被这一支覆盖，先手必胜。

### 5. 除去上述先手胜，剩余全是后手胜
折完后只可能落到 $O=1$ 且 $E\le 1$，对应的原局面恰好是：

- $(E,O)=(1,1)$：先手不能一次删两个（和为奇），只能删一个；后手删掉剩下那个；
- $(E,O)=(0,3)$：三个奇数不能一次全删；删 $1$ 个则后手删 $2$ 个，删 $2$ 个则后手删 $1$ 个。

二者都是后手必胜，代码输出 `Larpity`。

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
    int n;
    cin >> n;

    vector<int> arr(n + 1, 0);

    int odd = 0, even = 0;

    for (int i = 1; i <= n; i ++) {
        cin >> arr[i];
        if (arr[i] & 1) odd ++;
        else even ++;
    }

    //cout << odd << " " << even << endl;
    if (even + odd == 1) {
        cout << "Moggity" << endl;
        return;
    }

    even += (odd / 2);
    odd %= 2;

    if (odd == 0) {
        cout << "Moggity" << endl;
        return;
    }

    if (even >= 2 && odd) {
        cout << "Moggity" << endl;
        return;
    }

    cout << "Larpity" << endl;


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
每组数据扫一遍数组，时间 $O(n)$，空间 $O(n)$（可改成 $O(1)$ 额外空间）。
