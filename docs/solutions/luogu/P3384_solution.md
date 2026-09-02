# P3384 【模板】重链剖分 / 树链剖分 题解

## 题意

给定一棵 $N$ 个结点的树（$1\le N,M\le 10^5$，根为 $R$，模数 $P$），点带权值，支持四种操作：`1 x y z` 路径加、`2 x y` 路径求和、`3 x z` 子树加、`4 x` 子树求和，所有输出对 $P$ 取模。

## 核心思路

**算法类型**：重链剖分 + 线段树（区间加懒标记、区间求和）。

**第一步：两次 DFS 完成剖分**。

- `dfs1` 求出每个点的父亲 `fa`、深度 `depth`、子树大小 `siz` 与**重儿子** `son`（子树最大的孩子）；
- `dfs2` 按"先走重儿子、再走轻儿子"的顺序分配 DFS 序 `dfn`，并记录每个点所在重链的链头 `top`（重儿子继承父点的链头，轻儿子以自己为新链头）。

这样编码产生两条关键性质：

1. **每条重链上的点 DFS 序连续**——链可以用区间 $[dfn[top], dfn[x]]$ 一次表示；
2. **每棵子树的 DFS 序连续**——子树 $x$ 恰好占据 $[dfn[x],\ dfn[x]+siz[x]-1]$，操作 3、4 直接转成区间操作。

**第二步：路径操作拆成链段**。以路径修改 `upd(x, y)` 为例：

```text
while (x、y 不在同一条链上) {
    把链头更深的那个点所在的链段 [dfn[top[x]], dfn[x]] 做区间操作;
    x 跳到链头的父亲 fa[top[x]];
}
此时 x、y 同链，最后对 [min(dfn), max(dfn)] 做一次区间操作。
```

每次跳跃至少把深度翻倍地上升（轻边一侧子树大小不超过一半），所以路径至多拆成 $O(\log N)$ 条连续区间。路径查询 `qry` 完全对称。

**第三步：线段树维护序列**。剖分把树上问题完全转化为序列上的区间加、区间和，用带懒标记的线段树实现；`maketag` 同时维护 `lzy` 与 `tree`（`tree += len * x % P`），`pushdown` 下传标记，全程对 $P$ 取模。建树时按 `rdfn`（DFS 序到点编号的映射）取初始点权。

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
#define pair_int std::pair<int, int>
#define pair_LL std::pair<LL, LL>
const int INF_INT = 0x3f3f3f3f;
const LL INF_LL = 1e18;
const LL mod = 998244353;
const LL MAXL = 2e5;
using std::cin;
using std::cout;
using std::endl;

int N, M, R, P;
int cnt;
int node[MAXL];
int fa[MAXL], siz[MAXL], depth[MAXL], son[MAXL], top[MAXL]; // son stands of the biggest size of the sub tree;
int dfn[MAXL], rdfn[MAXL]; //the another name of every nodes
int lzy[MAXL];

std::vector<int> e[MAXL];

void dfs1(int now, int father) {
    //cout << now << " " << father << endl;
    fa[now] = father;
    siz[now] = 1;
    depth[now] = depth[father] + 1;
    for (int i = 0; i < e[now].size(); i ++) {
        int next_ = e[now][i];
        if(next_ != father) {
            dfs1(next_, now);
            siz[now] += siz[next_];
            if (siz[next_] > siz[son[now]]) {
                son[now] = next_;
            }
        }
    }
}

void dfs2 (int now, int top_) {
    dfn[now] = ++ cnt;
    rdfn[cnt] = now;
    top[now] = top_;
    if (son[now]) {
        dfs2 (son[now], top_);
        for (int i = 0; i < e[now].size(); i ++) {
            if (e[now][i] != fa[now] && e[now][i] != son[now]) {
                dfs2 (e[now][i], e[now][i]);
            }
        }
    }
}

LL tree[MAXL * 4];

bool inrange(int L, int R, int l, int r) {
    return (l <= L) && (R <= r);
}

bool outrange(int L, int R, int l, int r) {
    return (L > r) || (R < l);
}

void pushup (int now) {
    tree[now] = (tree[now * 2] + tree[now * 2 + 1]) % P; 
}

void bulid (int now, int l, int r) {
    if(l == r) {
        tree[now] = node[rdfn[l]];
        return;
    }
    int mid = (l + r) >> 1;
    bulid(now * 2, l, mid);
    bulid(now * 2 + 1, mid + 1, r);
    pushup(now);
}

void maketag(int now, int len, LL x) {
    lzy[now] += x;
    tree[now] += len * x % P;
    lzy[now] %= P;
    tree[now] %= P;
}

void pushdown(int now, int l, int r) {
    int mid = (l + r) >> 1;
    maketag (now * 2, mid - l + 1, lzy[now]);
    maketag (now * 2 + 1, r - mid, lzy[now]);
    lzy[now] = 0;
}

LL query (int now, int L, int R, int l, int r) {
    if (inrange(L, R, l, r)) {
        return tree[now];
    }
    else if (!outrange(L, R, l, r)) {
        int mid = (L + R) >> 1;
        pushdown (now, L, R);
        return (query(now * 2, L, mid, l, r) +  query(now * 2 + 1, mid + 1, r, l, r)) % P;
    }
    else return 0;
}

void update(int now, int L, int R, int l, int r, LL x) {
    if(inrange(L, R, l, r)) {
        maketag(now, R - L + 1, x);
    }
    else if (!outrange(L, R, l, r)) {
        int mid = (L + R) >> 1;
        pushdown(now, L, R);
        update(now * 2, L, mid, l, r, x);
        update(now * 2 + 1, mid + 1, R, l, r, x);
        pushup(now);
    }
}

void upd(int x, int y, int z) {
    while(top[x] != top[y]) {
        if(depth[top[x]] < depth[top[y]]) std::swap(x, y);
        update(1, 1, N, dfn[top[x]], dfn[x], z);
        x = fa[top[x]];
    }
    update(1, 1, N, std::min(dfn[x], dfn[y]), std::max(dfn[x], dfn[y]), z);
}

LL qry(int x, int y) {
    LL ans = 0;
    while (top[x] != top[y]) {
        if(depth[top[x]] < depth[top[y]]) std::swap(x, y);
        ans += query(1, 1, N, dfn[top[x]], dfn[x]);
        ans %= P;
        x = fa[top[x]];
    }
    return (ans + query(1, 1, N, std::min(dfn[x], dfn[y]), std::max(dfn[x], dfn[y]))) % P;
}

void solve() 
{
    cin >> N >> M >> R >> P;

    for(int i = 0; i < N; i ++) {
        cin >> node[i + 1];
    }

    for(int i = 0; i < N - 1; i ++) {
        int u, v;
        cin >> u >> v;
        e[u].push_back(v);
        e[v].push_back(u);
    }

    dfs1(R, 0);
    dfs2(R, 0);
    bulid(1, 1, N);
    for(int i = 0; i < M; i ++) {
        int mode;
        int x, y, z;
        cin >> mode;
        if(mode == 1) {
            cin >> x >> y >> z;
            upd(x, y, z);
        }
        else if(mode == 2) {
            cin >> x >> y;
            cout << qry(x, y) << endl;
        }
        else if(mode == 3) {
            cin >> x >> y;
            update(1, 1, N, dfn[x], dfn[x] + siz[x] - 1, y);
        }
        else if(mode == 4) {
            cin >> x;
            cout << query(1, 1, N, dfn[x], dfn[x] + siz[x] - 1) % P << endl;
        }
    }
    return;
}
int main() 
{
    //freopen("read.in", "r", stdin);
    //freopen("answer.out", "w", stdout);
    std::ios::sync_with_stdio(false); cin.tie(nullptr); cout.tie(nullptr);
    int _ = 1;
    for (int i = 0; i < _; i++) {
        solve(); 
    }
    return 0;
}
```

## 复杂度

- 时间复杂度：剖分 $O(N)$；每次路径操作至多 $O(\log N)$ 条链段，每段线段树 $O(\log N)$，单次操作 $O(\log^2 N)$；总计 $O\bigl(N+M\log^2 N\bigr)$。
- 空间复杂度：$O(N)$（线段树 $4N$）。
