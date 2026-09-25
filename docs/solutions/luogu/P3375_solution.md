---
tags: [KMP]
difficulty: "普及+/提高-"
source: "https://www.luogu.com.cn/problem/P3375"
---
# P3375 【模板】KMP 题解

## 题意

给出两个只含大写英文字母的字符串 $s_1,s_2$（$1\le |s_1|,|s_2|\le 10^6$）：

- 求出 $s_2$ 在 $s_1$ 中所有出现的位置（位置即子串左端点，$1$ 起标号），**按从小到大**每行输出一个；
- 最后一行输出 $|s_2|$ 个整数，第 $i$ 个数表示 $s_2$ 长度为 $i$ 的前缀的最长 border 长度。border 指**非自身**的、既是前缀又是后缀的子串。

## 核心思路

KMP（前缀函数 / 失配数组）。

**定义：** $\mathrm{next}[i]$ 表示 $s_2$ 长度为 $i$ 的前缀 $s_2[0..i-1]$ 的**最长 border 长度**。因为 border 不能是自身，所以 $\mathrm{next}[i]<i$；特别地 $\mathrm{next}[1]=0$。

**为什么需要它：** 暴力匹配一旦失配就把模式串整体右移一位、从头再来，白白丢掉了"刚才已经匹配上的那一段"这一信息。而一段已经匹配成功的文本既然是模式串的某个前缀，那么它的**最长 border** 同时也是这个前缀的后缀——把模式串对齐到这个 border 上，就能保住一截已经匹配的内容，且不会漏掉任何解。这就是 KMP 不回退文本指针的根据。

**求 next 数组（均摊 $O(m)$）：** 设 $\mathrm{last}=\mathrm{next}[i-1]$，即前缀 $s_2[0..i-2]$ 的最长 border 长度。那么 $\mathrm{next}[i]$ 只可能由它扩展而来：

- 若 $s_2[i-1]=s_2[\mathrm{last}]$，border 可以延长一位：$\mathrm{next}[i]=\mathrm{last}+1$；
- 否则令 $\mathrm{last}=\mathrm{next}[\mathrm{last}]$（退到次长的 border 再试），重复；
- 若退到 $\mathrm{last}=0$ 仍不相等，则 $\mathrm{next}[i]=0$。

**匹配过程（均摊 $O(n)$）：** 双指针，$x$ 扫文本、$y$ 扫模式：

- $s_1[x]=s_2[y]$：两指针同时右移；
- 失配且 $y=0$：文本指针右移一位（模式串首位都对不上，这一位文本可以直接放弃）；
- 失配且 $y>0$：$y=\mathrm{next}[y]$，让模式串沿 border 链右滑，**文本指针不动**；
- $y=m$ 时报告一次出现，位置为 $x-y$（转成 $1$ 起标号即 $x-y+1$）。

均摊的依据：$y$ 每次比较最多增加 $1$，全程总增量不超过 $n$；而每次回退都让 $y$ 严格变小，故回退总次数也被总增量所界定，两个指针都是线性的。

**本实现的两处细节：**

1. `next[0] = -1` 只是习惯性的哨兵，本实现中任何地方都不会读到它——回退分支分别有 `last` 与 `y` 非零的保护，输出也从 `next[1]` 开始。
2. **匹配成功之后怎么继续？** 必须让 $y$ 回退到 $\mathrm{next}[m]$，否则"两次出现相互重叠"的情况会漏解。本代码在记录位置后显式补了一句 `y = s2_next[y];`。这里说明一下为什么值得显式写：早先的写法省略了这一句，改为依赖下一轮循环拿 $s_2[m]$ 去比较来触发失配——`std::string` 标准保证下标等于 `size()` 时返回 `'\0'`，与文本字符必然失配，于是恰好走到 `y = s2_next[y]`，逻辑上确实通，但极其隐蔽，而且把同样的代码搬到 `vector<int>` 之类的容器上就越界了（详见 leetcode572 一题）。

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

vector<int> Get_Next(std::string &s, int m) {
    vector<int> next(m + 1, 0);
    next[0] = -1;
    next[1] = 0;

    int i = 2, last = 0;
    while (i <= m) {
        if (s[i - 1] == s[last]) {
            next[i ++] = ++ last;
        }
        else if (last) {
            last = next[last];
        }
        else {
            next[i ++] = 0;
        }
    }
    return next;
}

vector<int> Kmp(std::string &s1, std::string &s2, vector<int> &s2_next) {
    int n = s1.size(), m = s2.size();
    int x = 0, y = 0;
    vector<int> pos;

    while (x < n) {
        if (s1[x] == s2[y]) {
            x ++;
            y ++;
        }
        else if (y == 0) {
            x ++;
        }
        else {
            y = s2_next[y];
        }

        if (y == m) {
            pos.push_back(x - y);
            // 匹配成功后显式沿 border 链回退。
            // 原写法没有这一句：s2 是 std::string，标准保证 s2[size()] 返回 '\0'，
            // 与文本字符必然失配，于是下一轮自动走到 y = s2_next[y] —— 合法但很隐蔽，
            // 且换成 vector 之类的容器就会越界，故统一显式写出。
            y = s2_next[y];
        }
    }

    return pos;
}

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    std::string s1, s2;
    cin >> s1 >> s2;

    vector<int> next = Get_Next(s2, s2.size());
    vector<int> pos = Kmp(s1, s2, next);

    for (auto x : pos) {
        cout << x + 1 << endl;
    }

    for (int i = 1; i < next.size(); i ++) {
        cout << next[i] << " ";
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
    for (int i = 0; i < _; i ++)
    {
        solve();
    }
    return 0;
}
```

## 复杂度

- 时间复杂度：$O(|s_1|+|s_2|)$。求 next 时指针 $i$ 单调递增，回退总次数与总增量同阶；匹配同理，两个指针都不回头。
- 空间复杂度：$O(|s_2|)$，即 next 数组；另需 $O(|s_1|)$ 存读入的字符串与答案位置。
