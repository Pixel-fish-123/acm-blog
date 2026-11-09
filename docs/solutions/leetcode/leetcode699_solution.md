# leetcode699 掉落的方块 题解

## 题意
二维平面上的 $x$ 轴上依次落下一系列正方形方块。给定二维数组 $\textit{positions}$，其中 $\textit{positions}[i] = [\textit{left}_i, \textit{sideLength}_i]$ 表示第 $i$ 个方块左边缘对齐 $x = \textit{left}_i$、边长为 $\textit{sideLength}_i$，从极高处垂直下落，直到碰到已落下方块的上表面或 $x$ 轴为止（仅边擦过不算叠放）。要求返回一个数组 $\textit{ans}$，其中 $\textit{ans}[i]$ 表示第 $i$ 个方块落下后当前所有方块的最高高度。其中 $1 \le \textit{positions.length} \le 1000$，$1 \le \textit{left}_i \le 10^8$，$1 \le \textit{sideLength}_i \le 10^6$。

## 核心思路
**算法类型**：线段树 + 排序 + 二分（坐标离散化 + 区间最大值查询与区间覆盖修改）。

方块边擦过不会相互阻挡，只有水平投影有正长度重叠时才会叠放。可以将每个左边界为 $L$、边长为 $len$ 的方块看作覆盖闭区间 $[L, L + len - 1]$ 的单位格子（左闭右开区间 $[L, L + len)$ 等价于整数闭区间 $[L, L + len - 1]$）：
1. **坐标离散化**：所有方块左端点 $\textit{left}_i \le 10^8$，值域很大但方块数 $m \le 1000$，涉及的区间端点至多 $2m \le 2000$ 个。把所有 $L_i$ 与 $R_i = L_i + len_i - 1$ 收集起来，排序去重得到长度为 $n$ 的有序数组 `arr`，每次用二分查找 `rank` 将原始坐标映射为 $[1, n]$ 内的离散下标。
2. **线段树维护区间最高高度**：用一棵支持**区间最大值查询**与**区间赋值（覆盖）懒标记**的线段树维护离散化后各位置的高度：
   - 第 $i$ 个方块落下时，先在离散区间 $[l, r]$ 上查询当前最大高度 $q = \text{query}(l, r)$，则该方块落稳后的顶部高度为 $h = q + len_i$；
   - 再将区间 $[l, r]$ 整体赋值为 $h$（因为 $h$ 严格大于区间内原有的任意高度，直接区间覆盖即可）；
   - 用 $h$ 更新全局最高高度 $\textit{maxH}$ 并记录答案。

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

class Solution {
    public:
        static constexpr int MAXN = 2001;
        int arr[MAXN], maxv[MAXN << 2], change[MAXN << 2];
        bool upd[MAXN << 2];

        int collect(const vector<vector<int>>& poss) {
            int size = 1;
            for (const auto& pos : poss) {
                arr[size ++] = pos[0];
                arr[size ++] = pos[0] + pos[1] - 1;
            }

            std::sort(arr + 1, arr + size);
            int n = 1;
            for (int i = 2; i < size; i ++) {
                if (arr[n] != arr[i]) {
                    arr[++ n] = arr[i];
                }
            }
            return n;
        }

        void build(int l, int r, int now) {
            if (l < r) {
                int mid = (l + r) >> 1;
                build(l, mid, now << 1);
                build(mid + 1, r, now << 1 | 1);
            }
            maxv[now] = 0;                                                                                                                                                                                                                                                                                                                            
            change[now] = 0;
            upd[now] = false;
        }

        int rank(int n, int v) {
            int ans = 0;
            int l = 1, r = n, mid;
            while (l <= r) {
                mid = (l + r) >> 1;
                if (arr[mid] >= v) {
                    ans = mid;
                    r = mid - 1;
                }
                else {
                    l = mid + 1;
                }
            }
            return ans;
        }

        void lazy(int now, int v) {
            upd[now] = true;
            change[now] = v;
            maxv[now] = v;
        }

        void up(int now) {
            maxv[now] = std::max(maxv[now << 1], maxv[now << 1 | 1]);
        }

        void down(int now) {
            if (upd[now]) {
                lazy(now << 1, change[now]);
                lazy(now << 1 | 1, change[now]);
                upd[now] = false;
            }
        }
 
        void update(int jobl, int jobr, int jobv, int l, int r, int now) {
            if (jobl <= l && r <= jobr) {
                lazy(now, jobv);
            }
            else {
                int mid = (l + r) >> 1;
                down(now);
                if (jobl <= mid) {
                    update(jobl, jobr, jobv, l, mid, now << 1);
                }
                if (jobr > mid) {
                    update(jobl, jobr, jobv, mid + 1, r, now << 1 | 1);
                }
                up(now);
            }
        }

        int query(int jobl, int jobr, int l, int r, int now) {
            if (jobl <= l && r <= jobr) {
                return maxv[now];
            } 
            int mid = (l + r) >> 1;
            down(now);
            int ans = INT_MIN;
            if (jobl <= mid) {
                ans = std::max(ans, query(jobl, jobr, l, mid, now << 1));
            }
            if (jobr > mid) {
                ans = std::max(ans, query(jobl, jobr, mid + 1, r, now << 1 | 1));
            }
            return ans;
        }

        vector<int> fallingSquares(vector<vector<int>>& pos) {
            int n = collect(pos);
            build(1, n, 1);
            vector<int> ans;
            int maxH = 0, l, r, h;
            for (const auto& square : pos) {
                l = rank(n, square[0]);
                r = rank(n, square[0] + square[1] - 1);
                h = query(l, r, 1, n, 1) + square[1];
                maxH = std::max(maxH, h);
                ans.push_back(maxH);
                update(l, r, h, 1, n, 1);
            }
            return ans;
        }
};


void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int n, m;
    cin >> n >> m;

    vector<vector<int>> arr(n, vector<int>(m));

    for (int i = 0; i < n; i ++) {
        for (int j = 0; j < m; j ++) {
            cin >> arr[i][j];
        }
    }

    Solution a;
    auto s = a.fallingSquares(arr);

    for (auto p : s) {
        cout << p << " ";
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
- 时间复杂度：$O(m \log m)$，其中 $m$ 为方块数量。收集并排序去重端点为 $O(m \log m)$，建树 $O(m)$，每个方块二分查找坐标及线段树查询、修改各 $O(\log m)$。
- 空间复杂度：$O(m)$，用于离散化数组和 $4$ 倍大小的线段树数组。

预估难度：CF 1700（约 1700*）。本题难度由 AI 预估，仅作为参考。
