# P5908 猫猫和企鹅 题解

## 题意

$n$ 个居住区构成一棵树（$1\le n,d\le 10^5$），边长均为 $1$。除 $1$ 号居住区外每个居住区住着一只小企鹅。猫猫从 $1$ 号居住区出发，只愿意拜访与它距离不大于 $d$ 的小企鹅，求能拜访的数量。

## 核心思路

**算法类型**：树的遍历（DFS）。

树中两点距离就是简单路径长度，从 $1$ 号点（树根）出发到某点的距离恰好等于该点的**深度**。于是从 $1$ 号点 DFS，传入当前深度 `deep`：深度超过 $d$ 的分支直接剪掉（`if (deep > D) return`），其余每个访问到的点计数加一。

由于 $1$ 号居住区本身没有企鹅，最后输出 `ans - 1`。整棵树每点至多访问一次。

## 参考代码

```cpp
#include<cmath>
#include<iostream>
#include<cstring>
#include<cstdio>
#include<algorithm>
#include<vector>
#include<queue>
#include<iomanip>
#include<string>
#include<map>
#include<stack>
#include<set>
#include<bitset>
#include<random>
#define LL long long
#define ULL unsigned long long
#define pair_int pair<int, int>
#define pair_LL pair<LL, LL>
const int INF_INT = 0x3f3f3f3f;
const LL INF_LL = 1e18;
const LL mod = 998244353;
const LL MAXL = 1e5 + 5;
using std::cin;
using std::cout;
using std::endl;

std::vector<int> G[MAXL];
int ans = 0;
int N, D;

void dfs(int now, int deep, int fa)
{
    if(deep > D) return;
    //cout << now << " " << deep << " " << fa << endl;
    ans ++;
    for(int next : G[now]) {
        if(next != fa) dfs(next, deep + 1, now);
    }
    return;
}

void solve() 
{
    cin >> N >> D;
    for(int i = 1; i < N; i ++) {
        int l, r;
        cin >> l >> r;
        G[l].push_back(r);
        G[r].push_back(l);
    }
    dfs(1, 0, 0);
    cout << ans - 1 << endl;
    return;
}

int main() 
{
    std::ios::sync_with_stdio(false); cin.tie(nullptr); cout.tie(nullptr);
    int _ = 1;
    for (int i = 0; i < _; i++) {
        solve();
    }
    return 0;
}
```

## 复杂度

- 时间复杂度：$O(n)$，每个点至多访问一次。
- 空间复杂度：$O(n)$，邻接表。
