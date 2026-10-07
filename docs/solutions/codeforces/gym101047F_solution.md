# gym101047F Fighting the Rajasi 题解

## 题意

Nai 初始有 $H$ 点生命，要依次击败 $N$ 个 Rajasi，顺序可以任选。第 $i$ 个 Rajasi 有 $x_i$ 点生命和 $y_i$ 点恢复值。

- 正常战斗：要求 Nai 当前生命严格大于 $x_i$，战斗后生命变为 $H - x_i + y_i$；
- 使用法术：Nai 会 $K$ 个法术，每个法术能直接击败一个 Rajasi，生命不变。

判断 Nai 能否击败全部 Rajasi，能输出 `Y`，否则输出 `N`。

数据范围：$1 \le T \le 100$，$1 \le N \le 2 \times 10^3$，$\sum N \le 2 \times 10^4$，$0 \le K \le N$，$0 \le H, x_i, y_i \le 10^9$。

## 核心思路

**算法类型**：反悔贪心 + 排序 + 堆。把 Rajasi 分成「打完不掉血」和「打完会掉血」两类：前者按 $x$ 升序全部先打；后者按 $y$ 降序考虑，用大根堆维护已经打过的怪的净伤害，打不过时把净伤害最大的一只改用法术。目标是让需要的法术数尽量少，最后和 $K$ 比较。

**第一步：不掉血的怪先打，按 $x$ 升序。**

$x_i \le y_i$ 的怪打完后生命不减少，把它们放在最前面打不会让后面任何一场战斗变难。按 $x$ 升序依次打：若当前生命打不过 $x$ 最小的那只，就也打不过剩下的（它们的 $x$ 更大），而之后既没有能加血的战斗，法术也不改变生命，所以剩下的这些只能全部用法术，代码里直接 `k -= len`。

**第二步：掉血的怪按 $y$ 降序排。**

记 $d_i = x_i - y_i > 0$ 为净伤害。对于一组已经决定要正常打的掉血怪，按 $y$ 降序打是最优的。交换论证：相邻两只 $a, b$，$y_a \ge y_b$，若先 $b$ 后 $a$ 可行，即 $H > x_b$ 且 $H - d_b > x_a$，那么

- $H > x_a + d_b > x_a$，先打 $a$ 可行；
- $H - d_a = H - x_a + y_a \ge H - x_a + y_b > x_b$，再打 $b$ 也可行。

两种顺序打完后的生命相同，所以把 $y$ 大的放前面不会更差。

**第三步：把问题看成带截止时间的调度。**

设第二步开始时生命为 $H_0$。按 $y$ 降序排好后，打第 $j$ 只怪的条件 $H_{\text{前}} > x_j$ 等价于 $H_{\text{后}} = H_{\text{前}} - d_j > y_j$，即

$$\sum_{\text{已打的怪（含 } j\text{）}} d < H_0 - y_j.$$

右边随 $j$ 不减。这正是 Moore–Hodgson 问题：任务按截止时间排序，处理时间为 $d$，要让按时完成的任务最多，其余任务用法术解决。它的贪心做法是：依次加入任务，一旦超时，就从已选集合里删掉处理时间最大的那个（可能就是刚加入的）。

代码就是这个过程：

- `h > x`：直接打，把 $d$ 放进大根堆 `fought`；
- 否则若堆顶 $d_{\max} > d$：把堆顶那只改用法术（`h += fought.top()`，`k --`），再打当前这只。删掉之前的一场战斗只会让之后每个时刻的生命变大，已打的怪仍然可行；而且总伤害比加入前还小，所以条件 `h + fought.top() > x` 一定成立；
- 否则：当前这只用法术（`k --`）。

每次「反悔」都保持已打数量不变，同时让当前生命变大，所以每个前缀都同时做到了已打数量最多、剩余生命最大。最后若 $k \ge 0$ 输出 `Y`。

`std::fclose` 两行写在 `return` 之后，执行不到，不影响结果。

**样例验证。** 第二组 $H = 10, K = 0$，怪为 $(9, 10)$ 和 $(10, 1)$。$(9, 10)$ 不掉血，先打，生命变为 $11$；再打 $(10, 1)$，$11 > 10$，生命变为 $2$。不需要法术，输出 `Y`。

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
// #define endl '\n' // 交互题记得去掉

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);

    vector<pair_LL> add, sub;

    int n, k;
    LL h;
    cin >> n >> h >> k;

    for (int i = 0; i < n; i ++) {
        LL x, y;
        cin >> x >> y;
        if (x <= y) add.push_back({x, y});
        else sub.push_back({x, y}); 
    }

    std::sort(add.begin(), add.end(), [&](pair_LL a, pair_LL b) {
        return a.first < b.first;
    });

    std::sort(sub.begin(), sub.end(), [&](pair_LL a, pair_LL b) {
        return a.second > b.second;
    });

    for (int i = 0; i < add.size(); i ++) {
        if (h > add[i].first) {
            h -= add[i].first;
            h += add[i].second;
        }
        else {
            int len = add.size() - i;
            k -= len;
            break;
        }
    }
    
    std::priority_queue<LL> fought;
    for (int i = 0; i < sub.size(); i ++) {
        LL x = sub[i].first;
        LL y = sub[i].second;
        LL dmg = x - y;
        if (h > x) {
            h -= x;
            h += y;
            fought.push(dmg);
        }
        else if (!fought.empty() && fought.top() > dmg && h + fought.top() > x) {
            h += fought.top();
            fought.pop();
            k --;
            h -= x;
            h += y;
            fought.push(dmg);
        }
        else {
            k --;
        }
    }

    if (k >= 0) {
        cout << "Y" << endl;
    }
    else {
        cout << "N" << endl;
    }
    return;

    std::fclose(stdin);
    std::fclose(stdout);
}

int main()
{
    // std::ios::sync_with_stdio(false);
    // cin.tie(nullptr);
    // cout.tie(nullptr);
    // freopen("data.in", "r", stdin);
    // freopen("my_answer.out", "w", stdout);
    
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

- 时间复杂度：两次排序加上每只怪至多一次入堆、一次出堆，每组数据 $O(N \log N)$。
- 空间复杂度：$O(N)$。
