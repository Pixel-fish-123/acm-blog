# gym102319E Enegue's Enigmatic Lanterns 题解

## 题意

交互题。一排 $n$ 盏灯，其中恰好 $k$ 盏亮着，要找出是哪 $k$ 盏。

每次询问输出 `? S`，$S$ 是长度为 $n$ 的 01 串，表示选中的灯集合。设 $S$ 中亮着的灯有 $x$ 盏，交互器不告诉你 $x$，只返回 $x$ 的**合数因子个数**（例如 $12$ 的合数因子为 $\{4, 6, 12\}$，返回 $3$）。返回 $-1$ 表示询问非法或超过次数，此时应立即退出。

确定答案后输出 `! T`，$T$ 为亮灯集合的 01 串。

数据范围：$4 \le k \le n \le 100$，最多询问 $2 \times 10^5$ 次。

## 核心思路

**算法类型**：交互 + 数论。返回值不小于 $1$ 当且仅当 $x$ 是合数，所以每次询问只能得到「$x$ 是不是合数」这一位信息。先用删点贪心找出 $4$ 盏一定亮着的灯，再利用 $4$ 是合数、$5$ 是质数，逐盏判断其余的灯。

**第一步：返回值只反映 $x$ 是否为合数。**

$x$ 是合数时，$x$ 本身就是它的合数因子，返回值至少为 $1$；$x = 1$ 或 $x$ 是质数时，它没有合数因子，返回 $0$。下面所有询问都保证 $x \ge 3$，不会碰到 $x = 0$ 这种含义不明的情况。

**第二步：删点贪心，留下全是亮灯的集合。**

`mask` 初始为全集，$x = k$。反复扫描 `mask` 中的每一盏灯 $i$：尝试把它删掉并询问，若返回值不小于 $1$（删后的 $x$ 是合数）就确认删除，并标记本轮有变化；否则把 $i$ 放回。直到某一轮没有任何删除为止。

结束时 `mask` 里只剩亮灯，且至少 $4$ 盏：

- 若至少发生过一次删除：每次确认删除后的 $x$ 都是合数，放回则不改变状态，所以最终 $x$ 是合数，$x \ge 4$。最后一轮里若还有灭灯，删掉它 $x$ 不变、仍是合数，会被删掉，与「最后一轮无删除」矛盾。
- 若从未删除：$k$ 是质数时 $k \ge 5$，删一盏亮灯得到 $k - 1$，是不小于 $4$ 的偶数，会被删掉，矛盾，所以 $k$ 是合数；此时若存在灭灯，删掉后 $x = k$ 仍是合数，也矛盾。所以 $n = k$，全部是亮灯。

每次删的都是一盏灯，$x$ 只减 $1$，从 $k \ge 4$ 出发、每次确认删除后都是合数，所以询问到的 $x$ 都不小于 $3$。

**第三步：用 $4$ 盏亮灯逐个判断其余的灯。**

取 `mask` 中的前 $4$ 盏，记入答案，组成基准集合 `tmp`。对其余每盏灯 $i$，询问 `tmp` 加上 $i$：

- $i$ 亮：$x = 5$，质数，返回 $0$；
- $i$ 灭：$x = 4$，合数，返回 $1$。

返回 $0$ 就把 $i$ 记为亮灯。

**询问次数。** 删点阶段每轮至多 $n$ 次，除最后一轮外每轮至少删掉一盏灯，所以至多 $n + 1$ 轮，约 $10^4$ 次；判断阶段至多 $n$ 次。远小于 $2 \times 10^5$。

**实现细节。**

- 这份代码没有写 `#define endl '\n'`，输出用的是 `std::endl`，每行都会刷新缓冲区，交互题必须这样。
- 代码没有处理返回值 $-1$：读到 $-1$ 会当作 $0$ 继续询问。正常交互不会出现 $-1$，只影响出错时的表现。
- `main` 之后整段注释是本地对拍程序：`judge_ask` 用固定答案 `real` 模拟交互器，`solve` 与提交版逻辑相同，额外打印基准集合 `tmp`；末尾的 AC/WA 校验默认注释掉，取消注释即可在本地自检。

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

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int n, k;
    cin >> n >> k;

    vector<int> mask(n + 1, 1);
    vector<int> res(n + 1, 0);

    int ok = 0;
    while (ok == 0) {
        ok = 1;
        for (int i = 1; i <= n; i ++) {
            if (mask[i] == 0) continue;
            mask[i] = 0;
            cout << "? ";
            for (int j = 1; j <= n; j ++) {
                cout << mask[j];
            }
            cout << endl;

            int x;
            cin >> x;
            if (x >= 1) {
                ok = 0;
            }
            else mask[i] = 1;
        }
    }

    std::string tmp = "@";
    int tot = 0;

    for (int i = 1; i <= n; i ++) {
        if (mask[i] == 1 && tot < 4) {
            tmp.push_back('1');
            res[i] = 1;
            tot ++;
        }
        else {
            tmp.push_back('0');
        }
    }

    for (int i = 1; i <= n; i ++) {
        if (tmp[i] == '1') continue;
        tmp[i] = '1';
        cout << "? ";
        for (int j = 1; j <= n; j ++) {
            cout << tmp[j];
        }
        cout << endl;

        int x;
        cin >> x;
        if (x == 0) {
            res[i] = 1;
        }
        tmp[i] = '0';
    }

    cout << "! ";

    for (int i = 1; i <= n; i ++) {
        cout << res[i];
    }
    cout << endl;

    return;
}

int main()
{
    int _ = 1;
    // cin >> _;
    for (int i = 0; i < _; i ++)
    {
        solve();
    }
    return 0;
}

// gym102319E的对拍程序，在源代码下做补充
// 作为交互题对拍的展示

// #include <iostream>
// #include <cstring>
// #include <cstdio>
// #include <algorithm>
// #include <vector>
// #include <queue>
// #include <iomanip>
// #include <string>
// #include <map>
// #include <stack>
// #include <set>
// #include <bitset>
// #include <random>
// #include <unordered_map>
// #include <cmath>
// #include <numeric>
// #include <sstream>
// #include <array>
// // 支持lcm函数
// #define LL long long
// #define ULL unsigned long long
// #define pair_int std::pair<int, int>
// #define pair_LL std::pair<LL, LL>
// const int INF_INT = 0x3f3f3f3f;
// const LL INF_LL = 4e18;
// const LL MOD1 = 998244353;
// const LL MOD2 = 1e9 + 7;
// const int MAXL = 0;
// using std::cin;
// using std::cout;
// using std::endl;
// using std::vector;

// const std::string real = "@0101101101";
// int n = 10, k = 6;

// bool is_prime(int d) {
//     if (d <= 1) return false;
//     for (int i = 2; i * i <= d; i++)
//         if (d % i == 0) return false;
//     return true;
// }

// bool is_composite(int d) {
//     return d > 1 && !is_prime(d);
// }

// int count_composite_divisors(int x) {
//     int ans = 0;
//     for (int i = 1; i * i <= x; i++) {
//         if (x % i == 0) {
//             if (is_composite(i)) ans++;
//             int j = x / i;
//             if (j != i && is_composite(j)) ans++;
//         }
//     }
//     return ans;
// }

// int judge_ask(std::string &ans) {
//     int x = 0;
//     if (ans[0] == '?') {
//         int head = 1;
//         for (int i = 1; i <= n; i ++) {
//             if (real[i] == ans[head + i] && real[i] == '1') {
//                 x ++;
//             } 
//         }
//         return count_composite_divisors(x);
//     }
//     else {
//         int head = 1;
//         for (int i = 1; i <= n; i ++) {
//             if (real[i] != ans[head + i]) return 0;
//         }
//         return 1;
//     }
// }

// void solve()
// {
//     // std::cout << std::fixed << std::setprecision(2);
//     // std::cout.unsetf(std::ios::fixed);
    
//     //cin >> n >> k;

//     vector<int> mask(n + 1, 1);
//     vector<int> res(n + 1, 0);
//     int ok = 0;

//     while (ok == 0) { //debug1
//         ok = 1;
//         for (int i = 1; i <= n; i ++) {
//             if (mask[i] == 0) continue;
//             mask[i] = 0;
//             cout << "? ";
//             for (int j = 1; j <= n; j ++) {
//                 cout << mask[j];
//             }
//             cout << endl;

//             std::string s = "";
//             s += "? ";
//             for (int j = 1; j <= n; j ++) {
//                 s += (char)(mask[j] + '0');
//             }

//             int x = judge_ask(s);
//             if (x >= 1) {
//                 ok = 0;
//             }
//             else mask[i] = 1;
//         }
//     }

//     std::string tmp = "@";
//     int tot = 0;

//     for (int i = 1; i <= n; i ++) {
//         if (mask[i] == 1 && tot < 4) {
//             tmp.push_back('1');
//             res[i] = 1;
//             tot ++;
//         }
//         else {
//             tmp.push_back('0');
//         }
//     }

//     cout << tmp << endl;

//     for (int i = 1; i <= n; i ++) {
//         if (tmp[i] == '1') continue;
//         tmp[i] = '1';
//         cout << "? ";
//         for (int j = 1; j <= n; j ++) {
//             cout << tmp[j];
//         }
//         cout << endl;

//         std::string s = "";
//         s += "? ";
//         for (int j = 1; j <= n; j ++) {
//             s += tmp[j];
//         }
//         int x = judge_ask(s);
//         if (x == 0) res[i] = 1;
//         tmp[i] = '0';
//     }

//     cout << "! ";

//     for (int i = 1; i <= n; i ++) {
//         cout << res[i];
//     }
//     cout << endl;

//     std::string s = "";
//     s += "! ";
//     for (int i = 1; i <= n; i ++) {
//         s += (char)(res[i] + '0');
//     }

//     // if (judge_ask(s) == 1) cout << "AC" << endl;
//     // else cout << "WA" << endl;

//     return;
// }

// int main()
// {
//     int _ = 1;
//     // cin >> _;
//     for (int i = 0; i < _; i ++)
//     {
//         solve();
//     }
//     return 0;
// }
```


:::

## 复杂度

- 询问次数：$O(n^2)$，上界约 $n(n + 1) + n \approx 10^4$。
- 时间复杂度：每次询问输出长度为 $n$ 的串，共 $O(n^3) \approx 10^6$。
- 空间复杂度：$O(n)$。
