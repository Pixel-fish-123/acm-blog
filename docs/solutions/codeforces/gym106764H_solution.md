# gym106764H Lemon Tang 题解

## 题意
$n$ 个人排成一行，第 $i$ 人得分 $d_i$、教练半径 $r_i$。一次训练选一人 $i$ 当教练，则所有满足 $|i-j|\le r_i$ 的人得分 $+1$，同一人可多次当教练，总训练次数 $\le k$。最大化训练后的 $\min_j d_j$。

$1\le n,k\le 2\cdot 10^5$，$1\le d_i\le 10^9$，$0\le r_i\le n$。

## 核心思路
**算法类型**：二分 + 贪心 + 差分 + 单调队列。二分最终最小值，从左到右在「能盖住当前缺口且右端点最远」的区间上补差分。

最终最小值越大越难，在 $[\min d_i,\min d_i+k]$ 上二分答案 `mid`。

**预处理**：人 $i$ 当教练覆盖 $[\max(1,i-r_i),\min(n,i+r_i)]$。对每个位置 $j$，在所有覆盖 $j$ 的教练区间里，记右端点最大者为 $bestR[j]$（没有则为 $-1$）。用「按左端点加入、单调队列维护最大右端点」在 $O(n)$ 内算完。

**判定** `check(mid)`：令位置 $i$ 还缺 $\max(0,\mathrm{mid}-d_i)$。从左到右扫，用差分数组维护已经盖到当前位置的训练次数。若仍有缺口 $def$，则必须在某个覆盖 $i$ 的区间上再训练 $def$ 次；贪心选右端点最远的那个（即 $bestR[i]$），在差分上 $[i,\mathrm{bestR}[i]]$ 加 $def$。次数总和超过 $k$ 或没有覆盖区间则失败。

**正确性**：缺口越靠左越要先补；把训练放在能延伸到更右的区间上，不会妨碍右边，且不会比选更短区间差。

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
    LL n, k;
    cin >> n >> k;

    vector<LL> r(n + 1, 0);
    vector<LL> arr(n + 1, 0);
    vector<vector<LL>> add(n + 2);
    LL minn = INF_INT;

    for (LL i = 1; i <= n; i ++) {
        cin >> arr[i];
        minn = std::min(minn, arr[i]);
    }

    for (LL i = 1; i <= n; i ++) {
        cin >> r[i];
    }

    for (LL i = 1; i <= n; i ++) {
        LL L = std::max(1LL, i - r[i]);
        LL R = std::min(n, i + r[i]);
        add[L].push_back(R);
    }

    std::deque<LL> dq;
    vector<LL> bestR(n + 1, -1);

    for (LL i = 1; i <= n; i ++) {
        for (LL R : add[i]) {
            while (!dq.empty() && dq.back() < R) {
                dq.pop_back();
            }
            dq.push_back(R);
        }

        while (!dq.empty() && dq.front() < i) {
            dq.pop_front();
        }

        if (!dq.empty()) bestR[i] = dq.front();
    }

    auto check = [&](LL mid) -> bool {
        vector<LL> need(n + 1, 0); //需求
        vector<LL> diff(n + 1, 0); //差分数组

        for (LL i = 1; i <= n; i ++) {
            need[i] = std::max(need[i], mid - arr[i]);
        }

        LL used = 0, cur = 0;

        for (LL i = 1; i <= n; i ++) {
            cur += diff[i];

            if (cur >= need[i]) {
                continue;
            }

            LL def = need[i] - cur;
            
            if (bestR[i] < i) {
                return false;
            }
            
            used += def;
            
            if (used > k) {
                return false;
            }
            
            diff[i] += def;

            if (bestR[i] + 1 <= n) {
                diff[bestR[i] + 1] -= def;
            }

            cur += def;

        }
        return true;
    };

    LL lo = minn, hi = minn + k, res = -1;
    while (lo <= hi) {
        LL mid = (lo + hi) >> 1;
        if (check(mid)) {
            res = mid;
            lo = mid + 1;
        }
        else {
            hi = mid - 1;
        }
    }

    cout << res << endl;

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
预处理 `bestR` 为 $O(n)$；二分 $O(\log k)$ 次，每次差分扫描 $O(n)$。总时间 $O(n\log k)$，空间 $O(n)$。

预估难度：CF 2000（约 2000*）。本题难度由 AI 预估，仅作为参考。
