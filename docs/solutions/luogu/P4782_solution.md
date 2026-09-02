# P4782 【模板】2-SAT 题解

## 题意

有 $n$ 个布尔变量 $x_1\sim x_n$（$1\le n,m\le 10^6$）与 $m$ 个条件，每个条件形如「$x_i$ 为 $a$ 或 $x_j$ 为 $b$」（$a,b\in\{0,1\}$）。求一组赋值使所有条件成立：无解输出 `IMPOSSIBLE`，有解输出 `POSSIBLE` 及一组合法的 $x_1\sim x_n$。

## 核心思路

**算法类型**：2-SAT + Tarjan 强连通分量。

**建图**：每个变量拆成两个文字节点——节点 $i$ 表示"$x_i$ 为真"，节点 $i+N$ 表示"$x_i$ 为假"。每个条件「$x_{1}=v_1$ 或 $x_2=v_2$」蕴含两条对称的推导边（文字 $L$ 的节点记为 $[L]$）：

$$\bigl[\neg(x_1=v_1)\bigr]\to[x_2=v_2],\qquad \bigl[\neg(x_2=v_2)\bigr]\to[x_1=v_1]$$

含义是"若条件的这一半不成立，则另一半必须成立"。代码按 $(v_1,v_2)$ 的四种组合分别连边（例如 $v_1=v_2=1$ 时连 $x_1+N\to x_2$ 与 $x_2+N\to x_1$），$\neg$ 对应节点编号 $\pm N$ 的切换。

**判定**：跑一遍 Tarjan 求所有强连通分量。同一变量的两个文字若落入**同一分量**（$belong[i]=belong[i+N]$），说明"$x_i$ 真"与"$x_i$ 假"互相可达，无解输出 `IMPOSSIBLE`；否则必有解。

**构造**：Tarjan 的分量编号是缩点后拓扑序的**逆序**（编号小 = 拓扑靠后）。对每个变量取"拓扑序靠后"的文字为真——即 `belong[i] < belong[i+N]` 时输出 `1`（真文字所在分量编号更小），否则输出 `0`。这样取值保证：若选中的文字 $L$ 可达某文字 $M$，则 $M$ 的分量拓扑序更靠前、其对立面同样靠后会被选中，不会出现"选 $L$ 又被迫选 $\neg L$"的矛盾。

数据范围 $n,m\le 10^6$：点数 $2n$、边数 $2m$，各数组开到 $2\times 10^6$。题面提到的自环坑点（如 `10 0 10 0`，即条件两半为同一文字）只是普通的一条边 $[\neg L]\to[L]$，不影响上述流程。

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
// 支持lcm函数
#define LL long long
#define ULL unsigned long long
#define pair_int std::pair<int, int>
#define pair_LL std::pair<LL, LL>
const int INF_INT = 0x3f3f3f3f;
const LL INF_LL = 1e18;
const LL mod = 998244353;
const int MAXL = 2e6 + 5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉
int N, M;

int head[MAXL], nxt[MAXL], to[MAXL];
int cntg;

int dfn[MAXL];
int low[MAXL];
int cntd;

int sta[MAXL];
int top;

int belong[MAXL];
int sccCnt;

void addEdge(int u, int v) {
    nxt[++ cntg] = head[u];
    to[cntg] = v;
    head[u] = cntg;
}

void tarjan(int u) {
    dfn[u] = low[u] = ++ cntd;
    sta[++top] = u;
    for (int e = head[u]; e > 0; e = nxt[e]) {
        int v = to[e];
        if (dfn[v] == 0) {
            tarjan(v);
            low[u] = std::min(low[u], low[v]);
        }
        else {
            if (belong[v] == 0) {
                low[u] = std::min(low[u], dfn[v]);
            }
        }
    }
    if (dfn[u] == low[u]) {
        sccCnt ++;
        int pop;
        do {
            pop = sta[top --];
            belong[pop] = sccCnt;
        } while (pop != u);
    }
}

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    
    cin >> N >> M;
    for (int i = 1, x1, v1, x2, v2; i <= M; i ++) {
        cin >> x1 >> v1 >> x2 >> v2;
        if (v1 == 1 && v2 == 1) {
            addEdge(x1 + N, x2);
            addEdge(x2 + N, x1);
        }
        else if (v1 == 0 && v2 == 1) {
            addEdge(x1, x2);
            addEdge(x2 + N, x1 + N);
        }
        else if (v1 == 1 && v2 == 0) {
            addEdge(x2, x1);
            addEdge(x1 + N, x2 + N);
        }
        else {
            addEdge(x1, x2 + N);
            addEdge(x2, x1 + N);
        }
    }

    for (int i = 1; i <= N << 1; i ++) {
        if (dfn[i] == 0)  {
            tarjan(i);
        }
    }

    bool check = true;

    for (int i = 1; i <= N; i ++) {
        if (belong[i] == belong[i + N]) {
            check = false;
            break;
        }
    }

    if (check) {
        cout << "POSSIBLE" << endl;
        for (int i = 1; i <= N; i ++) {
            if (belong[i] < belong[i + N])  {
                cout << "1 ";
            }
            else {
                cout << "0 ";
            }
        }
    }
    else {
        cout << "IMPOSSIBLE" << endl;
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

## 复杂度

- 时间复杂度：$O(n+m)$，Tarjan 对 $2n$ 个点、$2m$ 条边各访问一次。
- 空间复杂度：$O(n+m)$。
