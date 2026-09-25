# P4556 【模板】线段树合并 / [Vani 有约会] 雨天的尾巴 题解

## 题意

村落中 $n$ 座房屋构成一棵树（$1\le n,m\le 10^5$）。$m$ 次发放：每次沿 $(x,y)$ 路径（含两端）为每座房屋发放一袋 $z$ 类型救济粮。结束后对每座房屋输出数量最多的救济粮类型（并列取编号最小；没有救济粮输出 $0$）。

## 核心思路

**算法类型**：树上差分 + 动态开点权值线段树合并。

**第一步：树上差分**。一次发放 $(x,y,z)$ 要给路径上所有点各 $+1$ 袋 $z$。设 $p=\mathrm{lca}(x,y)$，按**点差分**拆成四个单点修改：

- $x$ 处 $z$ 的数量 $+1$，$y$ 处 $+1$；
- $p$ 处 $-1$，$p$ 的父亲处 $-1$（若存在）。

这样某个点"收到的 $z$ 数量"等于其子树内差分值之和——把差分标记自底向上累加即可还原路径覆盖。

**第二步：每个点一棵动态开点权值线段树**。下标是救济粮类型（离散化到 $1\sim|\text{类型数}|$），线段树节点维护两个值：`maxv`（区间内最大袋数）与 `pos`（取得最大袋数的**最小**类型编号）。每次差分修改即在该点的树上做单点加。

**第三步：DFS 后序合并**。`dfs(now)` 先递归所有孩子，把孩子 `root[next]` 合并进 `root[now]`（`merge` 递归：任一侧为空直接返回另一侧；叶子处计数相加），合并完成后 `root[now]` 恰好就是 now 的子树差分和——其根节点的 `pos` 即该房屋数量最多的救济粮类型。`pushup` 在两儿子并列时**优先取左儿子的 `pos`**，由于左儿子对应更小的类型编号，天然满足"并列取编号最小"。

**实现细节**：LCA 用 BFS 预处理的倍增表（`bfs` 自根向下填 `fa[y][j]`）；`res[i]==0`（空树）说明没收到任何救济粮，输出 $0$，否则把离散化下标映射回原类型编号 `nums[res[i]-1]`。

::: details 点击展开参考代码

## 参考代码

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long LL;

const int MAXL = 1e5 + 5;

struct tree_node {
    int lson, rson;
    int maxv, pos;
};

tree_node tr[MAXL * 4 * 20];

struct query {
    int x, y, z;
};

vector<query> que_;

struct node {
    int to, next;
};

vector<int> nums;
node edge[MAXL * 2 + 5];
int head[MAXL], root[MAXL];
int fa[MAXL][30], res[MAXL];
int depth[MAXL];
int n, k, ans = 0, tot = 0;
int t, trnode;

int find_(int z) {
    int res = lower_bound(nums.begin(), nums.end(), z) - nums.begin();
    return res + 1;
}

void add(int x, int y) {
    edge[++ tot].to = y;
    edge[tot].next = head[x];
    head[x] = tot;
}

void bfs() {
    queue<int> q;
    depth[1] = 1;
    q.push(1);
    
    while (q.size()) {
        int x = q.front();
        q.pop();
        for (int i = head[x]; i; i = edge[i].next) {
            int y = edge[i].to;
            if (depth[y]) continue;
            depth[y] = depth[x] + 1;
            fa[y][0] = x;
            for (int j = 1; j <= t; j ++) {
                fa[y][j] = fa[fa[y][j - 1]][j - 1];
            }
            q.push(y);
        }
    }
}

int lca(int x, int y) {
    if (depth[x] > depth[y]) swap(x, y);
    for (int i = t; i >= 0; i --) {
        if (depth[fa[y][i]] >= depth[x]) y = fa[y][i];
    }
    
    if (x == y) return x;
    
    for (int i = t; i >= 0; i --) {
        if (fa[x][i] != fa[y][i]) {
            x = fa[x][i];
            y = fa[y][i];
        }
    }
    
    return fa[x][0];
}

void pushup(int now) {
    tr[now].maxv = max(tr[tr[now].lson].maxv, tr[tr[now].rson].maxv);
    tr[now].pos = tr[tr[now].lson].maxv >= tr[tr[now].rson].maxv ? tr[tr[now].lson].pos : tr[tr[now].rson].pos;
}

void insert(int now, int l, int r, int type_, int v) {
    if (l == r) {
        tr[now].maxv += v;
        tr[now].pos = tr[now].maxv ? l : 0;
        return;
    }
    int mid = (l + r) >> 1;
    if (type_ <= mid) {
        if (!tr[now].lson) tr[now].lson = ++ trnode;
        insert(tr[now].lson, l, mid, type_, v);
    }
    else {
        if (!tr[now].rson) tr[now].rson = ++ trnode;
        insert(tr[now].rson, mid + 1, r, type_, v);
    }
    pushup(now);
}

int merge(int x, int y, int l, int r) {
    if (!x || !y) return x + y;

    if (l == r) {
        tr[x].maxv += tr[y].maxv;
        tr[x].pos = tr[x].maxv ? l : 0;
        return x;
    }

    int mid = (l + r) >> 1;
    tr[x].lson = merge(tr[x].lson, tr[y].lson, l, mid);
    tr[x].rson = merge(tr[x].rson, tr[y].rson, mid + 1, r);
    pushup(x);
    return x;
}

void dfs(int now, int fa) {
    for (int i = head[now]; i; i = edge[i].next) {
        int next_ = edge[i].to;
        if (next_ == fa) continue;
        dfs(next_, now);
        root[now] = merge(root[now], root[next_], 1, nums.size());
    }
    
    res[now] = tr[root[now]].pos;
}

void solve() {
    cin >> n >> k;
    int u, v, val;
    
    t = (int)(log(n) / log(2)) + 1;
    
    for (int i = 0; i < n - 1; i ++) {
        cin >> u >> v;
        add(u, v);
        add(v, u);
    }
    bfs();
    
    for (int i = 0; i < k; i ++) {
        cin >> u >> v >> val;
        que_.push_back({u, v, val});
        nums.push_back(val);
    }
    
    for (int i = 1; i <= n; i ++) {
        root[i] = ++ trnode;
    }
    
    sort(nums.begin(), nums.end());
    nums.erase(unique(nums.begin(), nums.end()), nums.end());
    
    for (int i = 0; i < k; i ++) {
        int x_ = que_[i].x, y_ = que_[i].y, z_ = find_(que_[i].z);
        
        int p = lca(x_, y_);
        insert(root[x_], 1, nums.size(), z_, 1);
        insert(root[y_], 1, nums.size(), z_, 1);
        insert(root[p], 1, nums.size(), z_, -1);
        if (fa[p][0]) insert(root[fa[p][0]], 1, nums.size(), z_, -1);
    }
    
    dfs(1, 0);
    
    for (int i = 1; i <= n; i ++) {
        if (res[i] == 0) cout << 0 << endl;
        else cout << nums[res[i] - 1] << endl; 
    }
    return;
}

int main() {
    solve();
    return 0;
}
```


:::

## 复杂度

- 时间复杂度：$O\bigl((n+m)\log V\bigr)$ 左右——每次差分修改（单点加）$O(\log V)$，线段树合并的总代价与所有树包含的节点总数同阶，即 $O(n+m\log V)$；LCA 倍增预处理 $O(n\log n)$。其中 $V$ 为离散化后的类型数（$\le m$）。
- 空间复杂度：$O\bigl(n+m\log V\bigr)$，动态开点的总节点数（代码按 $4\times 20\times\mathrm{MAXL}$ 预留）。
