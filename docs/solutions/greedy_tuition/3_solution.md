# 3 P6033 [NOIP 2004 提高组] 合并果子 加强版 题解

## 题意

与 P1090 完全一致：果园里有 $n$ 堆果子，每次合并两堆，消耗体力等于两堆重量之和，经过 $n-1$ 次合并后合成一堆，求最小总消耗体力。

数据范围：$1 \le n \le 10^7$，$1 \le a_i \le 10^5$。$n$ 极大，堆的 $O(n \log n)$ 做法无法通过。

## 核心思路

贪心 + 两个单调队列（计数排序优化）。

每次仍取全局最小的两堆合并，但需要把取最小值做到 $O(1)$ 均摊：

1. 由于 $a_i \le 10^5$，先用计数排序 $O(n)$ 得到从小到大有序的初始序列，压入队列 $q1$，$q1$ 是单调不减的；
2. 新产生的合并堆序列 $s_1, s_2, \dots$ 满足：每次合并取的是当前全局最小的两个，新堆不小于之前产生的所有新堆，因此新堆按产生顺序也单调不减，压入队列 $q2$；
3. 任意时刻全局最小值只可能出现在 $q1$ 队首或 $q2$ 队首，比较两者取出较小的即可。执行两次取堆操作得到最小的两堆，合并后压入 $q2$，并把合并代价累加进答案。

由于两个队列都单调，取队首比较即等价于小根堆的取最小操作，整个过程线性完成。

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

## 复杂度

- 时间复杂度：$O(n)$（计数排序 $O(n)$，每堆最多入队、出队一次）。
- 空间复杂度：$O(n)$（两个队列与计数数组）。
