# gym106821H Popsicle Stick Game 题解

## 题意
有 $n$（$1 \le n \le 2 \cdot 10^5$）根冰棒棍，第 $i$ 根上写着非负整数 $a_i$（$0 \le a_i \le 10^9$）。Dinny 和 Walrus 轮流操作，Dinny 先手，直到所有棍子被拿完。每回合当前玩家按顺序执行：
1. 将当前剩余数字的 $\text{MEX}$ 加到自己的得分中；
2. 任选一根剩余的棍子并将其移除。

初始双方得分为 $0$，全部拿完后得分高者获胜，得分相同则平局（Tie）。假设双方均采取最优策略，判断最终结果。

## 核心思路
**算法类型**：博弈论 + 贪心 + 排序（MEX 单调性与自由步数奇偶分析）。

设初始数组的 $\text{MEX}$ 为 $M$。由于每回合只能移除一个数，游戏过程中的 $\text{MEX}$ 是**单调不增**的：
- **特判 $M = 0$**：一开始就没有 $0$，全程 $\text{MEX}$ 恒为 $0$，双方得分均为 $0$，必定平局 `Tie`。
- **后手不可能获胜**：由于 $\text{MEX}$ 单调不增，先手第 $1$ 回合得分 $\ge$ 后手第 $1$ 回合得分，先手第 $2$ 回合得分 $\ge$ 后手第 $2$ 回合得分……先手每一轮拿到的分数都不低于紧接着的后手，因此总分恒有 $\text{Dinny} \ge \text{Walrus}$，Walrus 绝无获胜可能，结果只能在 `Dinny` 和 `Tie` 之间产生。
- **平局的充要条件**：要达成平局，必须保证每一对回合中，先手操作完后 $\text{MEX}$ **不下降**，而轮到后手操作时才可能让 $\text{MEX}$ 下降（或者双方操作都不下降）。
  1. 如果在 $[0, M - 1]$ 中存在某个数出现次数仅为 $1$（或者数字 $M$ 恰好在统计块中满足对应条件）：先手第一回合直接拿走这个唯一的元素，就能立刻让 $\text{MEX}$ 严格减小，从而在第一轮就建立无法追平的分数领先，Dinny 必胜！
  2. 如果 $[0, M - 1]$ 中所有数的出现次数都 $\ge 2$：在双方都不主动失误（把某个出现 $2$ 次的数变成 $1$ 次让对方直接拿走降 MEX）的前提下，每个 $< M$ 的数最多只能安全消耗 `出现次数 - 2` 个，而 $> M$ 的数可以全部安全消耗。将这些“不影响当前 MEX 且不会给对方送分”的自由步数累加为 `cnt`。
  3. 当所有自由步数耗尽后，所有 $< M$ 的数都恰好只剩 $2$ 个，此时谁被迫先动这些数，对方下一步就能直接拿走同值的最后一个数使 $\text{MEX}$ 暴跌。因此这等价于一个奇偶博弈：若自由步数 `cnt` 为奇数，先手 Dinny 可以走完最后一步自由步，逼迫后手破局，Dinny 获胜；若 `cnt` 为偶数，后手总能模仿对称应对维持平局，结果为 `Tie`。

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
const int INF_INT = INT_MAX - 5;
const LL INF_LL = LONG_LONG_MAX - 5;
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

    vector<int> arr(n, 0);

    for (int i = 0; i < n; i ++) {
        cin >> arr[i];
    }

    std::sort(arr.begin(), arr.end());

    int nums = arr[0], mex = 0, cnt = 0;
    
    vector<pair_int> chk;

    for (int i = 0; i < n; i ++) {
        if (nums != arr[i]) {
            chk.push_back({nums, cnt});
            cnt = 1;
            nums = arr[i];
        }
        else cnt ++;
        if (arr[i] == mex) mex ++;
    }

    chk.push_back({nums, cnt});

    cnt = 0;
    for (auto x : chk) {
        if (x.first <= mex) {
            if (x.second <= 1) {
                cout << "Dinny" << endl;
                return;
            } 
            else {
                cnt += (x.second - 2);
            }
        }
        else {
            cnt += x.second;
        }
    }

    if (cnt % 2 == 0 || mex == 0) {
        cout << "Tie" << endl;
    }
    else {
        cout << "Dinny" << endl;
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
- 时间复杂度：$O(n \log n)$，瓶颈在于对数组进行排序。
- 空间复杂度：$O(n)$，用于存储输入数组和去重计数数组 `chk`。

预估难度：CF 1600（约 1600*）。本题难度由 AI 预估，仅作为参考。
