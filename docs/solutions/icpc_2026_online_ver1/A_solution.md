# A Recall 题解

## 题意

有一个初始为空的栈 $S$，操作有三种：

- `+ x`：把 $x$ 压入栈；
- `? x`：询问 $x$ 是否在栈中，结果是 `T x`（存在）或 `F x`（不存在）；
- `-`：弹出栈顶元素（此时栈必须非空）。

Little G 记下了整个过程中**所有** `+ x`、`T x`、`F x` 操作（保持时间顺序），但一条 `-` 都没记。现在要往这份记录里插入若干个 `-`，使得：

- 任何时刻栈中元素两两不同；
- 所有 `? x` 的结果都与构造出的操作序列一致：记录成 `T x`，就必须在那一刻 $x$ 在栈里；记录成 `F x`，就必须不在栈里。

题目保证至少存在一种合法构造。多测：$1\le T\le 10^5$，每测 $1\le n\le 10^6$ 条记录，$1\le x\le 10^9$，所有测试点合计 $\sum n\le 10^6$。

输出一行只含 `+`、`?`、`-` 的字符串，表示构造出的操作序列：`+` 表示压栈（依次对应记录里的 `+ x`），`?` 表示查询（依次对应记录里的 `T x` / `F x`），`-` 表示弹栈。去掉所有 `-` 之后必须与输入记录逐条对应；多解输出任意一组。

样例第一条：记录 `+ 1`、`+ 1`、`T 1`、`F 1` 可以补成 `+-+?-?`——先压 $1$、马上弹掉、再压 $1$、问 $1$ 得 `T`、弹掉、再问 $1$ 得 `F`。

## 核心思路

**算法类型**：逆向扫描配对（`std::map`）+ 栈贪心重建，单测 $O(n\log n)$。

### 第一步：按值把记录拆开看

栈中元素两两不同，所以对一个具体的值 $x$，任意时刻栈里至多存在一份 $x$。只看记录中与 $x$ 有关的那一列操作：

- `+ x`：新压入一份 $x$，要求压入**之前栈里没有** $x$；
- `T x`：此刻栈里必须有 $x$，若有一份，那必然是最近一次 `+ x` 压进来的那一份；
- `F x`：此刻栈里必须没有 $x$，也就是此前压入的 $x$ 已经弹出。

于是每个 `+ x` 压入的元素，其「生命周期」被完全确定：它必须活到下一个 `+ x` 或 `F x` 之前，并且这一段里的所有 `T x` 都由它来满足——因为这段时间里栈中唯一的 $x$ 就是它，不可能有别的元素代劳。所以这段窗口里**最靠右**的那个 `T x` 就是它必须活到的最晚时刻 $d$（窗口里没有 `T x` 则 $d=0$，它不需要为任何查询负责）。

### 第二步：倒序扫描，求出每个 `+` 的截止时刻

从后往前扫记录，用一个 `map<int,int> M` 维护「值 $v$ 当前配对的 `T v` 下标」：

- 遇到 `T v`：若 $v$ 还没有配对，令 `M[v] = i`（用 `emplace` 插入，不覆盖已有的键）；
- 遇到 `F v` 或 `+ v`：`least_save[i] = M[v]`（没有则为 $0$），然后把 $v$ 从 `M` 里删掉。

**为什么 `F v` 和 `+ v` 都要删？** 它们都要求「此前压入的那份 $v$ 已经出栈」，所以左边的 `+ v` 不能跨过它们去服务更右边的 `T v`，删除正好切断了这种配对。

**为什么 `M[v]` 恰好是「窗口里最靠右的 `T v`」？** 设当前处理的是下标 $i$ 的 `+ v`/`F v`，$f$ 是它右边最近的一个 `+ v`/`F v`（不存在则视为 $+\infty$）。倒序扫到 $f$ 时已经把 `M[v]` 清空了，此后从 $f$ 走到 $i$ 的这段里只有 `T v`：倒序遇到的第一批（下标最大的那个）`T v` 会填进 `M[v]`，更靠左的 `T v` 因为 `emplace` 不覆盖而填不进去。所以在 $i$ 处读到的 `M[v]` 正是 $(i,f)$ 中下标最大的 `T v` ✓；这段里没有 `T v` 时 $v$ 不在 `M` 里，读出 $0$ ✓。

（下标 $i$ 是 `F v` 时虽然也会算出一个 `least_save[i]`，但正序构造里用不到它——它的作用只是把 `M[v]` 清空。）

### 第三步：正序贪心插入 `-`

维护一个栈 `stk`，它与真实的栈一一对应（栈顶就是真实栈顶），里面存的是「每个已压入元素的截止时刻」。正序扫描记录：

1. 处理第 $i$ 条记录**之前**，只要 `stk` 非空且栈顶截止时刻 $< i$，就弹栈并输出一个 `-`：这个元素负责的 `T` 都已经问完了，可以出栈；
2. 第 $i$ 条是 `+ x`：把 `least_save[i]` 压入 `stk`，再输出 `+`；
3. 第 $i$ 条是 `T x` / `F x`：输出 `?`；
4. 扫描结束后，把 `stk` 里剩下的元素依次弹出，每个输出一个 `-`。

### 第四步：这样构造一定合法

- **`T x` 不会被答成 `F`。** 贪心只在「栈顶的截止时刻已经过去」时才弹栈顶，而每个元素负责的最后一个 `T` 恰好落在它的截止时刻上，所以那一刻它必然还在栈里；又因为栈中不可能有两份同值元素，这个 `T x` 必然成立 ✓。
- **`F x` 和重复的 `+ x` 不会被破坏。** 反证：设在处理第 $j$ 条记录时，此前压入的那份 $x$ 还卡在栈里。它上面压着某个元素 $w$，而此刻（第 1 步弹栈刚做完）栈顶的截止时刻 $\ge j$，说明 $w$ 被约束要求活到 $j$ 或更晚。但 $w$ 压在 $x$ 上面，要把 $x$ 弹出去必须先弹 $w$，于是 $w$ 会在自己的截止时刻之前被弹掉，它负责的那个 `T` 查询就会答成 `F`。而这个矛盾在任何合法方案里都躲不掉（截止时刻是「必须存在」的硬约束），说明**根本不存在合法构造**，与题目的保证矛盾。因此这种情况不会出现，那份 $x$ 一定已经按时弹出 ✓。
- **输出格式正确。** 每条记录恰好输出一个字符，`-` 只在弹栈时输出，所以去掉全部 `-` 后与输入记录一一对应；串长不超过 $2n$ ✓。

**样例走一遍**（第一条：`+ 1`、`+ 1`、`T 1`、`F 1`）：倒序得到第 $2$ 条 `+ 1` 的截止时刻是 $3$（它负责第 $3$ 条的 `T 1`），第 $1$ 条 `+ 1` 的截止时刻是 $0$（那个 `T 1` 已经被右边的 `+ 1` 认领走了）。正序：先压入截止时刻 $0$、输出 `+`；处理第 $2$ 条前弹掉截止时刻 $0$ 的元素输出 `-`，再压入截止时刻 $3$、输出 `+`；第 $3$ 条输出 `?`（此刻栈里正好是那份 $1$，答 `T`）；处理第 $4$ 条前弹掉截止时刻 $3$ 的元素输出 `-`，再输出 `?`（此刻栈空，答 `F`）。得到 `+-+?-?` ✓，与样例输出一致。

::: details 点击展开参考代码

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
#include <array>
// 支持lcm函数
#define LL long long
#define ULL unsigned long long
#define pair_int std::pair<int, int>
#define pair_LL std::pair<LL, LL>
const int INF_INT = 0x3f3f3f3f;
const LL INF_LL = 1e18;
const LL mod = 998244353;
const int MAXL = 0;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    int n;
    cin >> n;

    vector<char> op(n + 1, 0);
    vector<int> arr(n + 1, 0);
    vector<int> least_save(n + 1, 0);

    for (int i = 1; i <= n; i ++) {
        cin >> op[i] >> arr[i];
    }

    std::map<int, int> T;
    std::string res;

    for (int i = n; i >= 1; i --) {
        if (op[i] == 'T') {
            T.emplace(arr[i], i);
        }
        else {
            least_save[i] = T.count(arr[i]) ? T[arr[i]] : 0;
            T.erase(arr[i]);
        }
    }

    std::stack<int> stk; // save del;

    for (int i = 1; i <= n; i ++) {
        while (stk.size() && (stk.top() < i)) {
            stk.pop();
            res += "-";
        }
        if (op[i] == 'T' || op[i] == 'F') {
            res += "?";
        }
        else {
            stk.push(least_save[i]);
            res += "+";
        }
    }

    while (stk.size()) {
        stk.pop();
        res += "-";
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
    cin >> _;
    for (int i = 0; i < _; i ++)
    {
        solve();
    }
    return 0;
}
```


:::

## 复杂度

- **时间复杂度**：倒序扫描每条记录做一次 `std::map` 操作，共 $O(n\log n)$；正序扫描与弹栈均摊 $O(n)$；输出串长度不超过 $2n$，输出 $O(n)$。单测 $O(n\log n)$，$\sum n\le 10^6$ 的总量下可以通过。
- **空间复杂度**：`op`（`vector<char>`）、`arr`、`least_save` 三个长度 $n+1$ 的数组，`map` 至多 $n$ 个键值对，`stk` 至多 $n$ 个元素，答案串长度不超过 $2n$，均为 $O(n)$。
