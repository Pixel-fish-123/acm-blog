# gym104012E Easily Distinguishable Triangles 题解

## 题意
有一个 $n \times n$ 的画布（$1 \le n \le 1000$），每个格子是白色 `.`、黑色 `#` 或空格 `?`。要在每个空格里画一个面积为 $\frac12$ 的黑色直角三角形（直角边与格子边重合，共 4 种画法）。要求任意两个黑三角形不能共用一条边，黑三角形也不能和黑格子共用一条边（两个黑格子相邻没关系）。求画法总数，对 $998244353$ 取模。

## 核心思路
**算法类型**：组合数学 + 模拟，把每个三角形的朝向拆成横、竖两个独立的选择，按行和列分别计数后相乘。

一个直角三角形的两条直角边，一条是格子的上边或下边，另一条是左边或右边；4 种画法正好是「上/下」×「左/右」。三角形之间、三角形与黑格之间共用的边，要么是横边（上下相邻的两格之间），要么是竖边（左右相邻的两格之间）。所以：

- 「左/右」的选择只和同一行的约束有关；
- 「上/下」的选择只和同一列的约束有关；

两者互不影响，答案 = 各行方案数之积 × 各列方案数之积。

**以一行为例**：用 `.`、`#` 和边界把这一行切成若干段连续的 `?`，各段独立。设某段长 $k$，每个 `?` 选 L（占左边）或 R（占右边）。相邻两格不能出现「左格选 R、右格选 L」，所以合法串只能是 $L^aR^b$ 的形式，共 $k+1$ 种。再看段两端：

- 两端都是 `.` 或边界：没有额外限制，$k+1$ 种；
- 只有一端是 `#`：靠 `#` 的那一格不能朝向它，只剩全 R 或全 L 一种，即 $1$ 种；
- 两端都是 `#`：要求全 R 又全 L，$0$ 种。

代码中 `put` 记当前这段 `?` 的个数，`black` 表示这段左端是不是 `#`。遇到 `#` 时，如果左端也是 `#` 且中间有 `?`，这一行直接为 0；遇到 `.` 或行末时，左端不是 `#` 就乘上 `put + 1`，否则是 1 种，不用乘。列的处理完全对称。

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
    LL A = 1, B = 1;
    int n;
    cin >> n;

    vector<std::string> matrix(n + 1);

    for (int i = 1; i <= n; i ++) {
        cin >> matrix[i];
        matrix[i] = " " + matrix[i];
    }

    for (int i = 1; i <= n; i ++) {
        LL pre = 1, black = 0, put = 0;
        for (int j = 1; j <= n; j ++) {
            if (matrix[i][j] == '#') {
                if (black && put) {
                    pre = 0;
                    break;
                }
                else if (black == 0) {
                    black = 1;
                    put = 0;
                }
            }
            else if (matrix[i][j] == '.') {
                if (put && black == 0) {
                    pre = pre * (put + 1) % MOD1;
                }
                put = 0;
                black = 0;
            }
            else {
                put ++;
            }
        }
        if (!black && put) {
            pre = pre * (put + 1) % MOD1;
        }
        A = A * pre % MOD1;
    }

    for (int j = 1; j <= n; j ++) {
        LL pre = 1, black = 0, put = 0;
        for (int i = 1; i <= n; i ++) {
            if (matrix[i][j] == '#') {
                if (black && put) {
                    pre = 0;
                    break;
                }
                else if (black == 0) {
                    black = 1;
                    put = 0;
                }
            }
            else if (matrix[i][j] == '.') {
                if (put && black == 0) {
                    pre = pre * (put + 1) % MOD1;    
                }
                put = 0;
                black = 0;
            }
            else {
                put ++;
            }
        }
        if (!black && put) {
            pre = pre * (put + 1) % MOD1;
        }
        B = B * pre % MOD1;
    }

    cout << A * B % MOD1 << endl;


    

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
每个格子在行扫描、列扫描中各访问一次，时间复杂度 $O(n^2)$；存储画布需要 $O(n^2)$ 空间。

预估难度：CF 1500（约 1500*）。本题难度由 AI 预估，仅作为参考。
