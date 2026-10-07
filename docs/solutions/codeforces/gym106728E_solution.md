# gym106728E Elegant Slabstones Rearrangement 题解

## 题意

$n \times n$ 的网格里放着 $n^2$ 块石板，按行优先编号：格子 $(i, j)$ 上的石板编号为 $(i - 1) \times n + j$。现在希望格子 $(i, j)$ 上的石板变成 $a_{ij}$。重排过程如下：

1. 把每块石板涂成红色或蓝色；
2. 红色石板只能在所在行内左右移动；
3. 蓝色石板只能在所在列内上下移动。

限制：同色的两块石板在移动过程中任何时刻都不能重叠；红色和蓝色可以暂时重叠，但最终不能重叠。判断能否重排成目标状态，输出 `Yes` 或 `No`。

数据范围：$1 \le n \le 100$，$1 \le a_{ij} \le n^2$ 且两两不同。

## 核心思路

**算法类型**：模拟。逐格判断每块石板是不动、横移还是竖移，从而确定移动石板的颜色；再检查同一行（列）里移动石板的相对顺序，最后模拟每块移动石板走过的格子，给被经过的不动石板定色，出现矛盾就输出 `No`。

**第一步：每块石板的移动方式是确定的。**

石板 $v = a_{ij}$ 原来在第 $\lfloor (v-1)/n \rfloor + 1$ 行，现在要到格子 $(i, j)$，记 $num = (i-1) \times n + j$。

- $v = num$：不动，颜色暂时不定（`color = 0`）；
- 同一行（`same_row`）：只能是红色横移，记下列方向的位移 $num - v$；
- 同一列（`same_cal`，即 $|num - v|$ 是 $n$ 的倍数）：只能是蓝色竖移，记下行方向的位移 $(num - v) / n$；
- 都不是：一种颜色只能沿一个方向移动，直接输出 `No`。

移动的石板颜色已经定了，标成 `color = -1`，表示「正在移动」。

**第二步：同色移动石板不能互相越过。**

同一行的红色石板都在一条线上移动，不能重叠就意味着不能交换先后顺序。`row[i]` 按目标列从左到右记录第 $i$ 行横移石板的编号，它们原来也在第 $i$ 行，编号大小就是原来的列顺序，所以必须严格递增。`col[j]` 同理。

反过来，只要相对顺序不变，按合适的顺序一块一块地移动（例如向右移的从最右边那块开始），同色石板就不会相撞，所以这个条件也是充分的。

**第三步：不动的石板不能被两种颜色都经过。**

一块横移的红色石板会经过它原位置和目标位置之间的每个格子。若某个格子上是不动的石板，它就不能是红色，只能涂成蓝色（`color = 2`）；竖移的蓝色石板经过的不动石板只能涂成红色（`color = 1`）。代码沿位移方向一格一格地走（包含原位置、不含目标位置），给经过的不动石板定色。若一块不动石板同时被横移和竖移的石板经过，就无论怎么涂都不行，输出 `No` 并立即 `return`。

原位置上最终放的一定是别的石板，所以它不会是不动石板，走到它不会误判。

红蓝两种石板之间可以暂时重叠：第 2 步移动红色时蓝色还在原位，第 3 步移动蓝色时红色已在终点，都不受限制。三步检查都通过就输出 `Yes`。

**样例验证。** 第二组 $n = 2$，第二行目标为 $4, 3$：石板 $4$ 和 $3$ 都要在第 $2$ 行横移，`row[2] = [4, 3]` 不递增，两块红色石板必须互相越过，输出 `No`。

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
const int MAXL = 105;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

int n;
vector<int> row[MAXL], col[MAXL];

bool same_row(int x, int y) {
    int tmp_a = (x - 1) / n;
    int tmp_b = (y - 1) / n;
    return tmp_a == tmp_b; 
}

bool same_cal(int x, int y) {
    int sub = std::abs(x - y);
    return (sub % n == 0);
}

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);

    cin >> n;

    vector<vector<int>> matrix(n + 1, vector<int>(n + 1));
    vector<vector<pair_int>> step(n + 1, vector<pair_int>(n + 1));
    vector<vector<int>> color(n + 1, vector<int>(n + 1, 0)); // 1 red, 2 blue

    for (int i = 1; i <= n; i ++) {
        for (int j = 1; j <= n; j ++) {
            cin >> matrix[i][j];
        }
    }

    for (int i = 1; i <= n; i ++) {
        for (int j = 1; j <= n; j ++) {
            int num = (i - 1) * n + j;
            if (num == matrix[i][j]) continue;
            if (same_row(num, matrix[i][j])) {
                int sub = num - matrix[i][j];
                step[i][j] = {1, sub};
                row[i].push_back(matrix[i][j]);
                color[i][j] = -1;
            }
            else if (same_cal(num, matrix[i][j])) {
                int sub = (num - matrix[i][j]) / n;
                step[i][j] = {2, sub};
                col[j].push_back(matrix[i][j]);
                color[i][j] = -1;
            }
            else {
                cout << "No" << endl;
                return;
            }
        }
    }

    for (int i = 1; i <= n; i ++) {
        for (int j = 1; j < row[i].size(); j ++) {
            if (row[i][j - 1] > row[i][j]) {
                cout << "No" << endl;
                return;
            }
        }
        for (int j = 1; j < col[i].size(); j ++) {
            if (col[i][j - 1] > col[i][j]) {
                cout << "No" << endl;
                return;
            }
        }
    }

    for (int i = 1; i <= n; i ++) {
        for (int j = 1; j <= n; j ++) {
            if (step[i][j].first == 1) {
                int st = step[i][j].second;
                for (int k = j; st != 0;) {
                    if (st < 0) {
                        k ++;
                        st ++;
                    }
                    else {
                        k --;
                        st --;
                    }
                    if (color[i][k] != -1) {
                        if (color[i][k] == 0) {
                            color[i][k] = 2;
                        }
                        else if (color[i][k] == 1) {
                            cout << "No" << endl;
                            return;
                        }
                    }
                }
            }
            if (step[i][j].first == 2) {
                int st = step[i][j].second;
                for (int k = i; st != 0;) {
                    if (st < 0) {
                        k ++;
                        st ++;
                    }
                    else {
                        k --;
                        st --;
                    }
                    if (color[k][j] != -1) {
                        if (color[k][j] == 0) {
                            color[k][j] = 1;
                        }
                        else if (color[k][j] == 2) {
                            cout << "No" << endl;
                            return;
                        }
                    }
                }
            }
        }
    }

    cout << "Yes" << endl;

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

- 时间复杂度：每块移动石板至多走过 $n$ 个格子，共 $O(n^3)$，$n = 100$ 时约 $10^6$。
- 空间复杂度：$O(n^2)$。
