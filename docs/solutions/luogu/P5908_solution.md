# P5908 猫猫和企鹅 题解

## 题意

$n$ 个居住区构成一棵树（$1\le n,d\le 10^5$），边长均为 $1$。除 $1$ 号居住区外每个居住区住着一只小企鹅。猫猫从 $1$ 号居住区出发，只愿意拜访与它距离不大于 $d$ 的小企鹅，求能拜访的数量。

## 核心思路

**算法类型**：DFS + 树上问题（树上深度限制遍历）。

树中任意两点之间有且仅有一条简单路径，因此以 $1$ 号居住区为根时，每个居住区到 $1$ 号点的距离恰好等于它在有根树中的**深度**（规定根节点深度为 $0$）。

从根节点 $1$ 出发做一次 DFS，递归参数传入当前节点 `now`、当前深度 `deep` 和父节点 `fa`（避免走回头路）：

- 若当前深度 `deep > D`，由于子树内节点的深度只会更大，直接 `return` 剪枝；
- 否则当前节点在距离限制内，计入答案 `ans++`，并继续递归遍历其所有子节点。

由于 $1$ 号居住区本身是猫猫的起点、没有住小企鹅，而 DFS 在根处也执行了一次 `ans++`，最终输出 `ans - 1` 即可。

::: details 点击展开参考代码

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


:::

## 复杂度

- 时间复杂度：$O(n)$，每个点至多访问一次。
- 空间复杂度：$O(n)$，邻接表。
