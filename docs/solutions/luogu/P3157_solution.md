# P3157 [CQOI2011] 动态逆序对 题解

## 题意

给定 $1\sim n$ 的一个排列，按给定顺序依次删除 $m$ 个元素，在**每次删除之前**统计当前整个序列的逆序对数（$1\le n\le 10^5$，$1\le m\le 5\times 10^4$）。

## 核心思路

**算法类型**：CDQ 分治 + 树状数组（带权BIT）。

**第一步：事件化**。把问题统一成"事件流"上的统计：

- 每个初始元素 $x$（位于原排列位置 $\mathrm{pos}_x$、值为 $\mathrm{val}_x$）是一个**插入事件**：$d=+1$，查询编号 $q=0$；
- 每次删除是一个**删除事件**：$d=-1$，查询编号 $q=i$（第 $i$ 次删除）。

事件共 $n+m$ 个，按上述顺序排列（插入事件的下标恰为元素原位置）。

**第二步：CDQ 统计跨半贡献**。`cdq(l, r)` 递归处理两半后在 `merge` 中统计"左半事件 × 右半事件"的配对贡献。逆序关系拆成两类，分别对应两趟归并：

- **第一趟（正序双指针）**：对右半每个事件 $j$，把左半所有 $\mathrm{pos}_i<\mathrm{pos}_j$ 的事件按值放入树状数组（带权 $d_i$），查询值大于 $\mathrm{val}_j$ 的权和——即"位置在前、值更大"的搭档，贡献 $d_j\times(\cdots)$ 累加进 $ans[q_j]$；
- **第二趟（逆序双指针）**：对称地统计"位置在后、值更小"的搭档，查询 $ask(\mathrm{val}_j-1)$。

每趟结束后把树状数组清空（按加入的权值取相反数加回），再对 $[l,r]$ 按 $\mathrm{pos}$ 排序供上层归并使用。由于每个事件对恰在某一层分治中被分到两侧，所有配对都被统计且仅统计一次。

**第三步：符号设计的巧妙之处**。设删除事件 $D_y$（删除元素 $y$）：

- 与之搭档的元素 $x$ 的插入事件 $I_x$（$d=+1$）总在更早的层贡献 $d_{D_y}\cdot(+1)=-1$；
- 若 $x$ 在 $y$ 之前已被删除（$D_x$ 在 $D_y$ 左半），配对 $(D_x,D_y)$ 贡献 $(-1)\times(-1)=+1$ 恰好抵消——"已不在场上"的搭档自动不计；若 $x$ 永不删除或更晚删除，则只剩 $-1$。

于是 $ans[q_y]$ 恰好等于**第 $y$ 次删除所移除的逆序对数的相反数**。更妙的是插入事件自身：任意两个插入事件的跨半配对（位置在前且值更大）全部累加进 $ans[0]$，其总和恰为**初始序列的逆序对总数**。

**第四步：前缀和还原答案**。初始总数减去前 $i$ 次删除累计移除的数目，就是第 $i+1$ 次删除前的逆序对数：

$$ans[i]\mathrel{+}=ans[i-1]\quad\Longrightarrow\quad ans[i]=\text{第 }i+1\text{ 次删除前的逆序对数}$$

输出 $ans[0..m-1]$ 即可。

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
const LL MAXL = 150005;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n'; // 交互题记得去掉

int N, M;

struct Node {
    int val, pos, d, q;
    // val = value, pos = position, d = add or subtraction, q = question
};

vector<Node> arr;
int position[MAXL];
int tree[MAXL];
LL ans[MAXL];

bool cmp(Node x, Node y) {
    return x.pos < y.pos;
}

int lowbit(int x) {
    return x & - x;
}

int ask(int x) {
    int ans = 0;
    for (; x; x -= lowbit(x)) {
        ans += tree[x];
    }
    return ans;
};

void add(int x, int val) {
    for (; x <= N; x += lowbit(x)) {
        tree[x] += val;
    }
    return;
}

void merge(int l, int r, int mid) {
    int p1, p2;
    for (p1 = l - 1, p2 = mid + 1; p2 <= r; p2 ++) {
        while(p1 + 1 <= mid && arr[p1 + 1].pos < arr[p2].pos) {
            p1 ++;
            add(arr[p1].val, arr[p1].d);
        }
        ans[arr[p2].q] += arr[p2].d * (ask(N) - ask(arr[p2].val));
    }

    for (int i = l; i <= p1; i ++) {
        add(arr[i].val, -arr[i].d);
    }

    for (p1 = mid + 1, p2 = r; p2 > mid; p2 --) {
        while (p1 - 1 >= l && arr[p1 - 1].pos > arr[p2].pos) {
            p1 --;
            add(arr[p1].val, arr[p1].d);
        }
        ans[arr[p2].q] += arr[p2].d * ask(arr[p2].val - 1);
    }
    for (int i = mid; i >= p1; i --) {
        add(arr[i].val, -arr[i].d);
    }

    sort(arr.begin() + l, arr.begin() + r + 1, cmp);

}

void cdq(int l, int r) {
    if(l == r) {
        return;
    }
    int mid = (l + r) >> 1;
    cdq(l, mid);
    cdq(mid + 1, r);
    merge(l, r, mid);
}


void solve() {
    //std::cout << std::fixed << std::setprecision(2);
    //std::cout.unsetf(std::ios::fixed);
    cin >> N >> M;
    Node now = {0, 0, 0, 0};
    arr.emplace_back(now);
    for(int i = 1 ; i <= N; i ++) {
        cin >> now.val;
        position[now.val] = i;
        now.d = 1;
        now.q = 0;
        now.pos = i;
        arr.emplace_back(now);
    }

    for(int i = 1 ; i <= M; i ++) {
        cin >> now.val;
        now.pos = position[now.val];
        now.d = -1;
        now.q = i;
        arr.emplace_back(now);
    }

    cdq(1, N + M);
    for (int i = 1; i < M; i ++) {
        ans[i] += ans[i - 1];
    }

    for (int i = 0; i < M; i ++) {
        cout << ans[i] << endl;
    }

    return;
}
int main() 
{
    std::ios::sync_with_stdio(false); cin.tie(nullptr); cout.tie(nullptr);
    int _ = 1;
    //cin >> _;
    for (int i = 0; i < _; i++) {
        solve();
    }
    return 0;
}
```

## 复杂度

- 时间复杂度：$O\bigl((n+m)\log(n+m)\cdot\log n\bigr)$——CDQ 共 $O(\log(n+m))$ 层，每层归并中每个事件进出树状数组 $O(\log n)$ 次。
- 空间复杂度：$O(n+m)$，事件数组、树状数组与答案数组。
