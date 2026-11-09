# gym106795D Monster Mash 题解

## 题意
有 $n$（$1 \le n \le 2 \cdot 10^5$）只怪物排成一排，每只怪物是幽灵 G 或吸血鬼 V。只要相邻两只怪物种类相同，就可以把它们合并成一只另一种类的怪物：GG 变成 V，VV 变成 G，新怪物占据原来两只的位置，其余怪物相对顺序不变。可以按任意顺序合并任意多次，求最后最少能剩下多少只怪物。

## 核心思路
**算法类型**：贪心 + 构造（模 3 不变量 + 保持可合并的归并策略）。

把 G 看成 $1$，V 看成 $2$，所有数对 $3$ 取模。一次合并 $x,x$ 会得到 $3-x$，而
$$2x \equiv -x \pmod 3,$$
所以合并前后整排怪物的数值之和模 $3$ 是不变的。

如果初始串本身就是交替的（不存在相邻同色），一次也合不了，答案就是 $n$。

否则至少存在一次合并。并且只要当前串还不是交替的、长度大于 $2$，总能找到一次合并让新串仍然不是交替的：
- 看一个同色连续段。段在中间时，合并段首的两只，合成出来的颜色与段左边那只（必为另一色）相同，于是新串里仍有相邻同色；
- 段在开头或结尾时，改合靠里的两只，合成的颜色会和段外相邻的那只同色；
- 整串同色时直接合并，长度很快降到 $1$ 或 $2$。

因此从任意非交替串出发，都能把长度一路压到不超过 $2$。

最后用不变量确定剩 $1$ 只还是 $2$ 只：
- 只剩 $1$ 只时，它只能是 G 或 V，数值和模 $3$ 为 $1$ 或 $2$，不可能为 $0$；
- 只剩 $2$ 只且无法继续合并，必然是一只 G 和一只 V，数值和 $1+2=3\equiv 0 \pmod 3$。

所以数值和模 $3$ 为 $0$ 时答案是 $2$，否则答案是 $1$。代码先扫一遍判断是否交替并累加 $1/2$ 的和，再按结论输出。

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

    std::string s;
    cin >> s;

    int alternative = 1;

    for (int i = 0; i < n - 1; i ++) {
        if (s[i] == s[i + 1]) {
            alternative = 0;
            break;
        }
    }

    int ans = 0;

    for (int i = 0; i < n; i ++) {
        if (s[i] == 'G') {
            ans += 1;            
        }
        else {
            ans += 2;
        }
    }

    if (alternative) {
        cout << n << endl;
    }
    else if (ans % 3 == 0) {
        cout << "2" << endl;
    }
    else {
        cout << "1" << endl;
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
- 时间复杂度：$O(n)$，只需要扫两遍字符串。
- 空间复杂度：$O(n)$，用于读入字符串。

预估难度：CF 1300（约 1300*）。本题难度由 AI 预估，仅作为参考。
