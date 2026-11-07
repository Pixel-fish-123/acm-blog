# 3 P6033 [NOIP 2004 提高组] 合并果子 加强版 题解

## 题意

与 P1090 完全一致：果园里有 $n$ 堆果子，每次合并两堆，消耗体力等于两堆重量之和，经过 $n-1$ 次合并后合成一堆，求最小总消耗体力。

数据范围：$1 \le n \le 10^7$，$1 \le a_i \le 10^5$。$n$ 极大，堆的 $O(n \log n)$ 做法无法通过。

## 核心思路

**算法类型**：贪心 + 单调队列（桶排序 + 双队列线性 Huffman 合并）。

每次仍需取全局最小的两堆合并，但需要利用单调性把取最小值优化到均摊 $O(1)$：

1. **桶排序构建初始单调队列 $q_1$**：由于初始值域 $a_i \le 10^5$ 很小，先用计数排序在 $O(n + V)$ 时间内得到从小到大有序的初始果子堆序列，依次压入队列 $q_1$，此时 $q_1$ 单调不减；
2. **新合成堆的单调性（队列 $q_2$）**：设第 $k$ 次合并取出的最小两堆为 $(x_k, y_k)$，第 $k+1$ 次取出的最小两堆为 $(x_{k+1}, y_{k+1})$。由于每次取的都是当前全局最小，后续候选集合中的任意元素都不小于此前取出的元素，必有 $x_k \le x_{k+1}$ 且 $y_k \le y_{k+1}$，从而 $x_k + y_k \le x_{k+1} + y_{k+1}$。因此按合并先后顺序压入队列 $q_2$ 的新堆重量也**天然单调不减**；
3. **双队首归并取最小**：既然 $q_1$ 与 $q_2$ 都单调不减，任意时刻的全局最小值一定只出现在 $q_1$ 队首或 $q_2$ 队首。每轮比较两个队首两次，即可在 $O(1)$ 时间内取出最小的两堆 $a, b$，将 $a + b$ 累加进答案并压入 $q_2$ 队尾，在 $O(n + V)$ 时间内完成全部 $n-1$ 次合并。

::: details 点击展开参考代码

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
const int MAXL = 1e5 + 5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n'

vector<int> cnt(MAXL, 0);

void solve()
{
    int n;
    LL minn = INF_LL;
    cin >> n;

    std::queue<LL> q1, q2;

    for (int i = 0; i < n; i ++) {
        LL x;
        cin >> x;
        minn = std::min(minn, x);
        cnt[x] ++;
    }

    for (int i = 0; i <= 1e5; i ++) {
        while (cnt[i]) {
            q1.push(i);
            cnt[i] --;
        }
    }

    LL res = 0;

    while (q1.size() || q2.size()) {
        LL a, b;
        if ((q1.size() + q2.size()) <= 1) break;

        if (q1.size() && q2.size()) {
            if (q1.front() < q2.front()) {
                a = q1.front();
                q1.pop();
            }
            else {
                a = q2.front();
                q2.pop();
            }
        }
        else if (q1.size()) {
            a = q1.front();
            q1.pop();
        }
        else {
            a = q2.front();
            q2.pop();
        }

        if (q1.size() && q2.size()) {
            if (q1.front() < q2.front()) {
                b = q1.front();
                q1.pop();
            }
            else {
                b = q2.front();
                q2.pop();
            }
        }
        else if (q1.size()) {
            b = q1.front();
            q1.pop();
        }
        else {
            b = q2.front();
            q2.pop();
        }

        res = res + (a + b);
        q2.push(a + b);
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
    for (int i = 0; i < _; i ++)
    {
        solve();
    }
    return 0;
}
```


:::

## 复杂度

- 时间复杂度：$O(n)$（计数排序 $O(n)$，每堆最多入队、出队一次）。
- 空间复杂度：$O(n)$（两个队列与计数数组）。

预估难度：CF 1500（约 1500*）。本题难度由 AI 预估，仅作为参考。
