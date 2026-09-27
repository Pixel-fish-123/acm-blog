# gym106722D Domain Expansion Abraham échate un hint 题解

## 题意

交互题。有一张 $n$ 个点的连通函数图：每个点恰有一条出边，忽略方向后连通，所以恰好有一个有向环。

每次可以询问 `? u k`（$1 \le u, k \le n$）：从 $u$ 出发沿出边走 $k$ 步，得到 $u$ 和之后到达的 $k$ 个点，共 $k + 1$ 个点。若其中有点重复出现，回答 `Yes`，否则回答 `No`。

至多询问 $3n$ 次，最后输出 `! m v_1 ... v_m`，即环上的全部点（顺序任意）。交互器是自适应的，但保证所有回答都和至少一张合法的图一致。

数据范围：$1 \le n \le 10^4$。

## 核心思路

**算法类型**：交互 + 构造 + 双指针。先把询问结果刻画成一个阈值 $h(u)$；用一个只减不增的指针 $k$ 扫一遍所有点，求出环长 $c = \min_u h(u)$；再对每个点问一次 `? u c`，回答 `Yes` 的恰好是环上的点。

**第一步：询问结果只取决于一个阈值。**

记 $d(u)$ 为从 $u$ 走到环上需要的步数（环上的点为 $0$），$c$ 为环长。从 $u$ 出发，前 $d(u)$ 步走在链上，之后绕环，第一次出现重复点是在第 $d(u) + c$ 步。所以

$$\text{? } u\ k \text{ 回答 Yes} \iff k \ge h(u), \qquad h(u) = d(u) + c.$$

链上的点和环上的点互不相同，所以 $h(u) \le n$；并且 $h(u) \ge c$，当且仅当 $u$ 在环上时取等号。

**第二步：单调指针求环长。**

$k$ 初始为 $n$，依次处理 $i = 1, 2, \ldots, n$：只要 $k > 1$ 且 `? i (k-1)` 回答 `Yes`（即 $h(i) \le k - 1$），就令 $k \leftarrow k - 1$；一旦回答 `No` 就处理下一个点。

- $k$ 只在确认 $h(i) \le k - 1$ 时才减小，所以 $k$ 始终不小于 $\min h$；
- 处理完点 $i$ 后 $k \le h(i)$：要么因为 `No` 停下，说明 $h(i) \ge k$；要么减到了 $1$，而 $h(i) \ge 1$。

所以扫完后 $k = \min(n, \min_u h(u)) = c$。

**第三步：判定环上的点。** 对每个点问 `? i c`：回答 `Yes` 当且仅当 $h(i) \le c$，也就是 $d(i) = 0$，即 $i$ 在环上。

**询问次数。** 第二步中每个点至多收到一次 `No`，共至多 $n$ 次；`Yes` 每次让 $k$ 减 $1$，共至多 $n - 1$ 次。第三步恰好 $n$ 次。总计至多 $3n - 1$ 次，满足限制。

**自适应交互器。** 上面的推导对任何一张与已有回答一致的图都成立，所以交互器怎样调整图都不影响正确性。

**刷新输出。** 模板里 `#define endl '\n'` 让 `endl` 不再刷新缓冲区。这份代码把 `sync_with_stdio(false)` 和 `cin.tie(nullptr)` 注释掉了，`cin` 默认与 `cout` 绑定，每次读入前会自动刷新 `cout`，所以询问能及时送出；最后的答案在程序退出时刷新。

**小例子。** $n = 4$，边为 $1 \to 2,\ 2 \to 3,\ 3 \to 2,\ 4 \to 1$，环为 $\{2, 3\}$，$c = 2$，$h = (3, 2, 2, 4)$。

- 第二步：`? 1 3` 为 Yes，$k = 3$；`? 1 2` 为 No。`? 2 2` 为 Yes，$k = 2$；`? 2 1` 为 No。`? 3 1`、`? 4 1` 都为 No。最终 $k = 2$。
- 第三步：`? 1 2` No，`? 2 2` Yes，`? 3 2` Yes，`? 4 2` No，输出 `! 2 2 3`。共 $10$ 次询问，不超过 $3n = 12$。

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
    int k = n;
    for (int i = 1; i <= n; i ++) {
        while (k > 1) {
            cout <<"? "<< i << " " << k - 1 << endl;
            std::string s;
            cin >> s;
            if (s == "Yes") k --;
            else break;
        }
    }

    vector<int> res;
    for (int i = 1; i <= n; i ++) {
        cout <<"? "<< i << " " << k << endl;
        std::string s;
        cin >> s;
        if (s == "Yes") {
            res.push_back(i);
        }
    }

    cout << "! " << res.size() << " ";
    for (auto x : res) {
        cout << x << " ";
    }
    cout << endl;
    return;
}

int main()
{
    // std::ios::sync_with_stdio(false);
    // cin.tie(nullptr);
    // cout.tie(nullptr);
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

- 询问次数：至多 $3n - 1$ 次。
- 时间复杂度：本地计算 $O(n)$，瓶颈在交互的 I/O。
- 空间复杂度：$O(n)$，用于存环上的点。
