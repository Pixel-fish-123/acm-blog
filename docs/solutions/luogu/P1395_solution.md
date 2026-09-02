# P1395 会议 题解

## 题意

$n$ 个村民的家构成一棵 $n$ 个节点的树（$n-1$ 条长度为 $1$ 的路径）。选一个村民家作为会议地点，使所有村民到会议地点的距离总和最小；若有多个节点满足条件，选择编号最小的一个。输出会议地点编号与最小距离和（$n\le 5\times 10^4$）。

## 核心思路

**算法类型**：树的重心 + 两次 DFS。

**为什么是重心**：设把会议点从节点 $u$ 挪到相邻节点 $v$（设砍掉边 $(u,v)$ 后 $v$ 所在连通块大小为 $s$），则距离和的变化量为 $s-(n-s)=2s-n$：块内 $s$ 人各少走 $1$，块外 $n-s$ 人各多走 $1$。当 $s>n/2$ 时挪过去更优。反复向更大的连通块移动，最终停在某个"所有邻接块大小都不超过 $n/2$"的节点——这正是**树的重心**（删除该点后最大连通块最小）。因此距离和最小的会议点就是重心。

**实现**：

1. **第一次 DFS（`getcenter`）**：以 $1$ 为根递归，求出每个点的子树大小 `size[now]`，则删除 `now` 后最大连通块为

   $$f[now]=\max\Bigl(\max_{\text{儿子 }v}\mathrm{size}[v],\; n-\mathrm{size}[now]\Bigr)$$

   取 $f$ 最小的节点作为会议点；$f$ 相同时取编号更小的（比较条件 `f[now] < f[center] || (f[now] == f[center] && now < center)`），满足题目"编号最小"的要求。
2. **第二次 DFS（`dfs`）**：从重心出发再遍历一次，累计每个点到重心的深度即为距离和。

`f[0]` 预置为 `INF_INT` 保证第一个节点也能参与比较更新。

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
const LL MAXL = 1e6 + 5;
using std::cin;
using std::cout;
using std::endl;

std::vector<int> G[MAXL];
bool vis[MAXL];
int center = 0, N = 0;
int size[MAXL], f[MAXL];
LL tot = 0;

void getcenter (int now, int father)
{
       size[now] = 1, f[now] = 0;
       for (int i = 0; i < G[now].size(); i ++) {
            int next_ = G[now][i];
            if (next_ == father) continue;
            getcenter (next_, now);
            size[now] += size[next_];
            f[now] = std::max (f[now], size[next_]);
       }
        f[now] = std::max (f[now], N - size[now]);
        if (f[now] < f[center] || (f[now] == f[center] && now < center)) {
            center = now;
        }
}

void dfs (int now, int deepth, int father) 
{
    vis[now] = 1;
    tot += deepth;
    for (int i = 0; i < G[now].size() ; i ++) {
        int next_ = G[now][i];
        if (next_ == father || vis[next_]) continue;
        dfs(next_, deepth + 1, now);
    }
    return;
} 
void solve() 
{
    cin >> N;
    for (int i = 0; i < N - 1; i ++) {
        int u, v;
        cin >> u >> v;
        G[u].push_back(v);
        G[v].push_back(u);
    }
    getcenter(1, 0);
    dfs (center, 0, 0);
    cout << center << " " << tot << endl;
    return;
}
int main() 
{
    std::ios::sync_with_stdio(false); cin.tie(nullptr); cout.tie(nullptr);
    int _ = 1;
    f[0] = INF_INT;
    for (int i = 0; i < _; i++) {
        solve();
    }
    return 0;
}
```

## 复杂度

- 时间复杂度：$O(n)$，两次 DFS 各遍历全树一次。
- 空间复杂度：$O(n)$，邻接表与 `size`、`f` 数组。
