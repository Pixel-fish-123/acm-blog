# P5782 [POI 2001 R2] 和平委员会 题解

## 题意

议会有 $n$ 个党派（$1\le n\le 8000$，$0\le m\le 2\times 10^4$），第 $i$ 个党派有 $2$ 名代表，编号 $2i-1$ 与 $2i$。委员会要求每个党派恰有 $1$ 名代表入选，且互相厌恶的两名代表不能同时入选。判断委员会能否成立；若能，按升序输出一组委员名单，否则输出 `NIE`（$1\le a<b\le 2n$）。

## 核心思路

**算法类型**：2-SAT + Tarjan 强连通分量。

**建模**：每名代表是一个布尔文字，代表 $x$ 与其搭档 $\mathrm{other}(x)$（奇数 $x$ 对 $x+1$，偶数 $x$ 对 $x-1$）构成一真一假的互补对，"党派恰选一人"自动蕴含。对每对厌恶关系 $(u,v)$：选 $u$ 就必须不选 $v$，即连边 $u\to \mathrm{other}(v)$；对称地连 $v\to\mathrm{other}(u)$。边含义是"若起点入选，则终点也必须入选"。

**判定有解**：跑 Tarjan 求强连通分量。若某党派的两名代表落在**同一个分量**（$belong[2i-1]=belong[2i]$），说明"选前者"能推导出"选后者"且反之，方案矛盾，无解输出 `NIE`；所有党派都通过检查则有解。

**构造方案**：对每个党派输出 $belong$ 编号**更小**的那名代表。这里利用了 Tarjan 的一个性质：分量编号是缩点后拓扑序的**逆序**——若分量 $A$ 可达分量 $B$，则 $B$ 先被弹出、编号更小。2-SAT 的标准取法是"选拓扑序靠后的文字"（它不会经由推导链强迫其对立面成立），对应到 Tarjan 编号即编号更小的分量中的文字。样例中三对代表的推导链恰好使 $1,4,5$ 所在分量编号更小，输出与样例一致。

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
const int MAXL = 2e4 + 5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

vector<int> G[MAXL];

int dfn[MAXL];
int low[MAXL];
int cntd;

int sta[MAXL];
int top;

int belong[MAXL];
int sccCnt;

int other(int x) {
    return (x & 1) == 1 ? x + 1 : x - 1;
}

void tarjan(int now) {
    dfn[now] = low[now] = ++ cntd;
    sta[++ top] = now;
    for (auto &next : G[now]) {
        if (dfn[next] == 0) {
            tarjan(next);
            low[now] = std::min(low[now], low[next]);
        }
        else {
            if (belong[next] == 0) {
                low[now] = std::min(low[now], dfn[next]);
            }
        }
    }
    if (dfn[now] == low[now]) {
        sccCnt ++;
        int pop;
        do {
            pop = sta[top --];
            belong[pop] = sccCnt;
        } while (pop != now);
    }
}

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int N, M;
    cin >> N >> M;

    for (int i = 0; i < M; i ++) {
        int u, v;
        cin >> u >> v;

        G[u].push_back(other(v));
        G[v].push_back(other(u));
    }

    bool flag = true;
    for (int i = 1; i <= N << 1; i ++) {
        if (dfn[i] == 0) {
            tarjan(i);
        }
    }

    for (int i = 1; i <= N; i ++) {
        int a = i << 1;
        int b = a - 1;
        if (belong[a] == belong[b]) {
            flag = false;
            break;
        }
    }

    if (flag) {
        for (int i = 1; i <= N; i ++) {
            int a = i << 1;
            int b = a - 1;
            if (belong[a] < belong[b]) {
                cout << a << endl;
            }
            else {
                cout << b << endl;
            }
        }
    }
    else {
        cout << "NIE" << endl;
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
    for (int i = 0; i < _; i++)
    {
        solve();
    }
    return 0;
}
```

## 复杂度

- 时间复杂度：$O(n+m)$，Tarjan 对 $2n$ 个点、$2m$ 条边各访问一次。
- 空间复杂度：$O(n+m)$。
