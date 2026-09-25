# P3810 【模板】三维偏序 / 陌上花开 题解

## 题意

有 $n$ 个元素（$1\le n\le 10^5$，$1\le a_i,b_i,c_i\le k\le 2\times 10^5$），设 $f(i)$ 表示满足 $a_j\le a_i$、$b_j\le b_i$、$c_j\le c_i$ 且 $j\neq i$ 的元素个数。对每个 $d\in[0,n)$，求 $f(i)=d$ 的元素数量。

## 核心思路

**算法类型**：CDQ 分治 + 树状数组（经典三维偏序）。

**预处理：排序与相同元素**。先把元素按 $(a,b,c)$ 三关键字排序，使得"排在前面"蕴含 $a$ 不更大。排序后**三元组完全相同的元素相邻**，设某相同组占据区间 $[l,r]$，则组内第 $i$ 个元素的 $f$ 初值直接置为 $r-i$（组内排在它后面的元素必然满足三维全部 $\le$），这部分不再交给分治处理，避免重复计数——组内"后面的元素对前面元素的贡献"由预处理给出，"前面的元素对后面元素的贡献"由 CDQ 统计，每对恰好计一次。

**CDQ 分治统计跨半对**。`cdq(l, r)` 递归处理两半后，`merge` 统计"左半元素 $j$ 对右半元素 $i$"的贡献：

- 由于整体按 $a$ 排序，左半任意元素的 $a$ 必然 $\le$ 右半元素的 $a$，第一维自动满足；
- 归并时用双指针把左半 $b_j\le b_i$ 的元素依次插入**以 $c$ 为下标的树状数组**（`add(c_j, 1)`）；
- 随后 `f[i] += ask(c_i)` 查出左半中 $b_j\le b_i$ 且 $c_j\le c_i$ 的元素个数。

逆序的三维偏序对（$a_j=a_i$ 且 $j$ 排在 $i$ 后）只可能是三元组完全相同的重复元素，已被预处理覆盖，因此计数不重不漏。统计完把树状数组还原（按加入位置减回），并将 $[l,r]$ 按 $b$ 排序供上层归并使用（每层的双指针都要求两半各自按 $b$ 有序）。

**汇总输出**：所有对统计完毕后，桶计数 `ans[f[i]]++`，依次输出 $ans[0..n-1]$。

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
#include<fstream>
#define LL long long
#define ULL unsigned long long
#define pair_int std::pair<int, int>
#define pair_LL std::pair<LL, LL>
const int INF_INT = 0x3f3f3f3f;
const LL INF_LL = 1e18;
const LL mod = 998244353;
const LL MAXL = 200005;
using std::cin;
using std::cout;
using std::endl;
using std::vector;

int N, K;

struct Node
{
    int number;
    int a, b, c;
};

vector<Node> arr;
int tree[MAXL], f[MAXL];
int ans[MAXL];

bool cmpABC(Node x, Node y) {
    if (x.a != y.a) {
        return x.a < y.a;
    }
    if (x.b != y.b) {
        return x.b < y.b;
    }
    return x.c < y.c;
}

bool cmpB(Node x, Node y) {
    return x.b < y.b;
}

int lowbit(int now) {
    return now & -now;
}

int ask(int now) {
    int ans = 0;
    for (; now; now -= lowbit(now)) {
        ans += tree[now];
    }
    return ans;
}

void add(int now, int val) {
    for(; now <= K; now += lowbit(now)) {
        tree[now] += val;
    }
    return;
}

void prepare()
{
    std::sort(arr.begin() + 1, arr.end(), cmpABC);
    for (int l = 1, r = 1; l <= N; l = ++ r) {
        while (r + 1 <= N && arr[l].a == arr[r + 1].a && arr[l].b == arr[r + 1].b && arr[l].c == arr[r + 1].c) {
            r ++;
        }
        for (int i = l; i <= r; i ++) {
            f[arr[i].number] = r - i;
        }
    }
}

void merge(int l, int r, int mid) {
    int p1, p2;
    for (p1 = l - 1, p2 = mid + 1; p2 <= r; p2 ++) {
        while (p1 + 1 <= mid && arr[p1 + 1].b <= arr[p2].b) {
            p1 ++;
            add(arr[p1].c, 1);
        }
        f[arr[p2].number] += ask(arr[p2].c);
    }

    for (int i = l; i <= p1; i ++) {
        add(arr[i].c, -1);
    }

    sort(arr.begin() + l, arr.begin() + r + 1, cmpB);
    return;
}

void cdq(int l, int r) {
    if(l == r) {
        return;
    }
    int mid = (l + r) / 2;
    cdq(l, mid);
    cdq(mid + 1, r);
    merge(l, r, mid);
}
void solve() 
{
    cin >> N >> K;
    Node now = {0, 0, 0, 0};
    arr.emplace_back(now);
    for (int i = 1; i <= N; i ++) {
        cin >> now.a >> now.b >> now.c;
        now.number = i;
        arr.emplace_back(now);
    }
    prepare();
    cdq(1, N);
    for (int i = 1; i <= N; i ++) {
        ans[f[i]] ++;
    }

    for (int i = 0; i < N; i ++) {
        cout << ans[i] << endl;
    }

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

- 时间复杂度：$O(n\log^2 n)$——CDQ 共 $O(\log n)$ 层，每层归并中每个元素进出树状数组 $O(\log n)$ 次（外加每层一次按 $b$ 的排序，同为 $O(n\log n)$ 量级）。
- 空间复杂度：$O(n+k)$。
