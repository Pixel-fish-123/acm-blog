# 4 知识竞赛 题解

## 题意

部门要选两个员工去参加需要合作的知识竞赛，每个员工 $i$ 有推理能力值 $A_i$ 和阅读能力值 $B_i$。选择第 $i$ 人和第 $j$ 人参赛时，他们在阅读方面表现出的能力为 $X = (B_i + B_j) / 2$，在推理方面表现出的能力为 $Y = (A_i + A_j) / 2$。需要最大化他们表现较差一方面的能力，即最大化 $\min(X, Y)$，输出这个最大值（保留一位小数）。

数据范围：$2 \le n \le 2 \times 10^5$，$1 \le A_i, B_i \le 10^8$。

## 核心思路

排序 + 前缀最大值。

$\min(X, Y)$ 由 $A_i + A_j$ 与 $B_i + B_j$ 的大小关系决定。设 $d_i = A_i - B_i$，则：

$$(A_i + A_j) - (B_i + B_j) = d_i + d_j$$

若 $d_i + d_j < 0$ 则取 $A$ 侧（推理），否则取 $B$ 侧（阅读）。

按 $|d_i| = |A_i - B_i|$ 升序排序后，对任意一对员工，绝对值较大的那个决定了 $d_i + d_j$ 的符号（较大绝对值项的主导）。因此在扫描到第 $j$ 个员工时：

- 若 $A_j > B_j$（即 $d_j > 0$），$d_i + d_j$ 的符号由 $j$ 主导为正，答案取 $B$ 侧，应找前面 $B$ 值最大的员工配对；
- 若 $A_j < B_j$（即 $d_j < 0$），答案取 $A$ 侧，应找前面 $A$ 值最大的员工配对；
- 所有排在 $j$ 前面的员工都满足 $|d_i| \le |d_j|$，恰好满足"符号由 $j$ 主导"的前提。

扫描过程中维护前缀最大的 $A$ 值 $MaxA$ 和前缀最大的 $B$ 值 $MaxB$。对当前员工 $j$，若 $A_j > B_j$ 取 $B_j + MaxB$，否则取 $A_j + MaxA$，用该值更新答案（它是与 $j$ 配对时的最优 $\min(X, Y)$ 的两倍），最后除以 $2$ 输出。

## 参考代码

```cpp
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
#define endl '\n'
struct p
{
    int A, B;
};

void solve()
{
    std::cout << std::fixed << std::setprecision(1);
    int n;
    cin >> n;

    vector<p> arr(n);
    
    for (int i = 0; i < n; i ++) {
        cin >> arr[i].A >> arr[i].B;
    }

    std::sort(arr.begin(), arr.end(), [&](p a, p b) {
        return std::abs(a.A - a.B) < std::abs(b.A - b.B);
    });

    int MaxA = arr[0].A, MaxB = arr[0].B;
    
    double ans = 0.0;

    for (int i = 1; i < n; i ++) {
        double cur;
        if (arr[i].A > arr[i].B) {
            cur = arr[i].B + MaxB;
        }
        else {
            cur = arr[i].A + MaxA;
        }

        ans = std::max(ans, cur);
        MaxA = std::max(MaxA, arr[i].A);
        MaxB = std::max(MaxB, arr[i].B);
    }

    cout << ans / 2.0 << endl;
    return;
}

int main()
{
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cout.tie(nullptr);
    int _ = 1;
    for (int i = 0; i < _; i ++)
    {
        solve();
    }
    return 0;
}
```

## 复杂度

- 时间复杂度：$O(n \log n)$（排序）$+ O(n)$（线性扫描）。
- 空间复杂度：$O(n)$。
