# P1525 [NOIP 2010 提高组] 关押罪犯 题解

## 题意

两座监狱关押 $N$ 名罪犯，$M$ 对罪犯之间存在仇恨（怨气值 $c_j$）。同一监狱内的仇恨对必然发生影响力为 $c_j$ 的冲突。重新分配罪犯，使发生的冲突中**影响力最大值**最小，输出这个最小值（$N\le 2\times 10^4$，$M\le 10^5$，$1\le a_j<b_j\le N$，$0<c_j\le 10^9$，每对组合只出现一次）。

## 核心思路

把"分配到两座监狱"看成**给无向图黑白染色**：罪犯是点，仇恨关系是边，同一监狱 = 同色。目标是找一个染色方案，使**同色边的最大权值**最小。两种经典做法：

**做法一（P1525.cpp）：二分答案 + 二分图判定**。

将仇恨关系按怨气值升序排序后，答案具有单调性：设 $f(t)$ 表示"只保留怨气值大于 $t$ 的边，图是否为二分图"，$t$ 越大保留的边越少、越容易二分。于是二分排名 `mid`：`check(mid)` 只连编号大于 `mid` 的边（即怨气值更大的关系），DFS 染色判定二分图——若可行，说明这些"大怨气"关系都能被分进不同监狱，冲突上界为 `G[mid].val`，收缩右端点；否则扩大左端点。找到最小的可行排名后输出对应怨气值。特判 $M=1$：单独一对罪犯直接分开，答案为 $0$。

**做法二（P1525_.cpp）：并查集扩展域（反集）**。

把每名罪犯拆成两个域：$i$ 表示"$i$ 在监狱 A"，$i+N$ 表示"$i$ 在监狱 B"（反域）。按怨气值**从大到小**处理每条仇恨边 $(a,b)$：

- 若 $\mathrm{find}(a)=\mathrm{find}(b)$，说明两个域已连通、$a,b$ 已被强制同监狱——当前边的怨气值就是答案（此前更大的怨气都已成功分开），停止；
- 否则合并 $a$ 与 $b+N$、$a+N$ 与 $b$，表达"$a$ 与 $b$ 必须分处不同监狱"。

若处理完所有边都未冲突，答案为 $0$。这一做法顺带正确处理了"全部关系可分开"的边界（做法一的二分从排名 $0$ 起测，未覆盖该边界，本题数据中不出现）。

::: details 点击展开参考代码

## 参考代码

做法一（二分答案 + 二分图染色，`P1525.cpp`）：

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
const LL MAXL = 2e4 + 5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

struct relation {
    int per1, per2;
    int val;

    bool operator < (const relation &other) const {
        return val < other.val;
    }
};

vector<relation> G;
vector<int> Gmap[MAXL];
int vis[MAXL];
int N, M;

bool check(int now) {
    for (int i = now + 1; i < M; i ++) {
        int u = G[i].per1, v = G[i].per2;
        Gmap[u].push_back(v);
        Gmap[v].push_back(u);
    }

    int flag = 0;

    auto dfs = [&](auto self, int u, int color) -> void {
        vis[u] = color;
        for (auto v : Gmap[u]) {
            if (vis[v] == 0) {
                self(self, v, 3 - color);
            }
            else if (vis[v] == color){
                flag = 1;
                return;
            }
        }
        return;
    };

    for (int i = 1; i <= N; i ++) {
        if (vis[i] == 0) dfs(dfs, i, 1);
    }

    for (int i = 1; i <= N; i ++) {
        Gmap[i].clear();
        vis[i] = 0;
    }

    if (flag) return false;
    else return true;
}

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);

    
    cin >> N >> M;

    for (int i = 0; i < M; i ++) {
        int u, v, val;
        cin >> u >> v >> val;

        G.push_back({u, v, val});
    }


    std::sort(G.begin(), G.end());

    // for (auto x : G) {
    //     cout << x.per1 << " " << x.per2 << " " << x.val << endl;
    // }

    int l = 0, r = M - 1;

    if (l == r && r == 0) {
        cout << "0" << endl;
        return;
    } 

    while (l < r) {
        int mid = (l + r) >> 1;
        if (check(mid)) r = mid;
        else {
            l = mid + 1;
        }
        //cout << l << " " << mid << " " << r << endl;
    }

    cout << G[l].val << endl;


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

做法二（并查集扩展域，`P1525_.cpp`）：

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
const LL MAXL = 2e4 + 5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

int fa[MAXL * 2];

int get(int x) {
    if (x == fa[x]) return x;
    return fa[x] = get(fa[x]);
}

void merge(int x, int y) {
    fa[get(x)] = get(y);
}

struct relation {
    int pre1, pre2, val;
};

vector<relation> link;
void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int N, M;
    cin >> N >> M;

    for (int i = 1; i <= 2 * N; i ++) {
        fa[i] = i;
    }

    for (int i = 0; i < M; i ++) {
        int a, b, c;
        cin >> a >> b >> c;

        link.push_back({a, b, c});
    }

    std::sort(link.begin(), link.end(), [](relation a, relation b) {return a.val > b.val;});

    int res = 0;
    for (int i = 0; i < M; i ++) {
        int a = link[i].pre1;
        int b = link[i].pre2;
        int c = link[i].val;

        //cout << a << " " << b << " " << c << endl;

        if (get(a) == get(b)) {
            res = c;
            break;
        }

        merge(a, b + N);
        merge(a + N, b);

    }

    cout << res << endl;

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


:::

## 复杂度

- 做法一：时间 $O\bigl(M\log M+(N+M)\log M\bigr)$（排序加二分，每次判定 $O(N+M)$），空间 $O(N+M)$。
- 做法二：时间 $O(M\log M+N\alpha(N))$（排序加并查集），空间 $O(N)$。
