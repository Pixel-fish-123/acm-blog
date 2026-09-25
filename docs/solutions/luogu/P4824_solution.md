---
tags: [KMP, 栈]
difficulty: "提高"
source: "https://www.luogu.com.cn/problem/P4824"
---
# P4824 [USACO15FEB] Censoring S 题解

## 题意

给出两个只含小写字母的字符串 $S$ 与 $T$，其中 $|S|\le 10^6$，$|T|\le |S|$。反复执行下面的操作：在当前 $S$ 中找到**第一个**出现的子串 $T$ 并把它删除，直到 $S$ 中不再含有 $T$。注意一次删除会让原本不相邻的两段拼接起来，从而可能**产生新的** $T$。保证删除过程中 $S$ 不会变为空串。输出最终处理完的字符串 $S$。

## 核心思路

**栈 + KMP。** 一边从左到右扫 $S$，一边用栈维护"删完之后剩下的串"。

**关键观察一：每读入一个字符，至多新增一个 $T$。**

设当前栈内维护的串为 $s$，并且我们始终保证 $s$ 中不含 $T$。这时把新读入的字符 $c$ 接上去得到 $s+c$。$s+c$ 中任何一个 $T$ 的出现，要么整段落在 $s$ 里（不存在），要么**以最后一位 $c$ 结尾**。所以 $s+c$ 里至多只有一个 $T$，而且如果有，它就正好是 $s+c$ 的**后缀**。于是"删掉当前第一个出现的 $T$"与"删掉末尾这个 $T$"是同一件事，可以用栈顶弹出 $|T|$ 个字符来实现。

**关键观察二：删完之后仍然不含 $T$。**

弹出末尾 $|T|$ 个字符后，剩下的是原 $s$ 的一个**前缀**；$T$ 不含于 $s$，自然也不含于 $s$ 的前缀。所以不变量"栈内字符串不含 $T$"始终成立，整个流程可以一遍扫完。

**怎么在栈上做 KMP：** 对每个位置，我们要知道"以栈内这个字符结尾的最长后缀，它同时是 $T$ 的前缀"的长度是多少，记作 $\mathrm{len}$（代码里往栈里存的是 $\mathrm{len}-1$）。压入 $c$ 时：

- 若栈非空，取出栈顶记录的 $\mathrm{len}$，用 KMP 的失配链尝试扩展：只要 $\mathrm{len}>0$ 且 $T[\mathrm{len}]\ne c$，就令 $\mathrm{len}\leftarrow\mathrm{next}[\mathrm{len}]$；退出循环后若 $T[\mathrm{len}]\ne c$，说明一位都接不上，新长度为 $0$，否则新长度为 $\mathrm{len}+1$。
- 若栈为空，则新长度只可能是 $0$ 或 $1$，直接与 $T[0]$ 比较即可。

把字符和"新长度 $-1$"一起压栈。一旦新长度达到 $|T|$，说明栈顶恰好拼出了一个完整的 $T$，弹出栈顶 $|T|$ 个元素。

**为什么要把长度存在栈里：** 弹出 $|T|$ 个字符之后，栈顶变成了更早的字符，我们需要立刻知道"以新栈顶结尾的最长 $T$ 前缀"是多少。这个值在当初压栈时就算好并存下来了，取出来加一即可继续匹配，**不需要重新扫描**。这就是整个算法均摊 $O(|S|)$ 的来源，也是这道题比单纯 KMP 多出来的那一步。

**输出：** 栈内剩余的字符就是最终答案。代码把栈顶逐个弹出塞进 `ans`，此时 `ans` 是逆序的，最后倒着输出即可。

**几处实现细节：**

- `stk1`、`stk2` 两个 $10^6+5$ 大小的数组开在**全局**（静态存储区），避免爆栈。
- `Get_Next` 的形参写成 `std::string &` 而不是按值传参：按值会白白拷贝一份 $10^6$ 量级的字符串。
- 与 P3375 模板的写法不同：模板里"匹配成功之后如何继续"是靠下一轮循环的失配分支顺带完成的，而这里每次匹配成功都要立刻弹栈，所以必须显式写出失配链回退 `while (y && s1[x] != s2[y]) y = next[y];`。

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
const int MAXL = 1e6 + 5;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

int stk1[MAXL];
char stk2[MAXL];
int top1;
void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
    std::string s1, s2;
    cin >> s1 >> s2;

    auto Get_Next = [&](std::string &s) -> vector<int> {
        int n = s.size();
        vector<int> next(n + 1);
        next[0] = -1;
        next[1] = 0;
        int i = 2, back = 0;
        while (i <= n) {
            if (s[i - 1] == s[back]) {
                next[i ++] = ++ back;
            }
            else if (back) {
                back = next[back];
            }
            else {
                next[i ++] = 0;
            }
        }

        return next;
    };

    vector<int> next = Get_Next(s2);

    int x = 0, y = 0;
    int n = s1.size(), m = s2.size();
    
    while (x < n) {
        if (top1) {
            y = stk1[top1 - 1] + 1;
            while (y && s1[x] != s2[y]) {
                y = next[y];
            }
            if (s1[x] != s2[y]) y = -1;
            stk2[top1] = s1[x];
            stk1[top1 ++] = y;
        }   
        else {
            y = 0;
            if (s1[x] != s2[y]) y = -1;
            stk2[top1] = s1[x];
            stk1[top1 ++] = y;
        }

        if (y >= m - 1) {
            top1 -= m;
        }
        x ++;
    }

    std::string ans;

    while (top1) {
        ans.push_back(stk2[-- top1]);
    }

    //cout << ans << endl;

    for (int i = ans.size() - 1; i >= 0; i --) {
        cout << ans[i];
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

- 时间复杂度：$O(|S|+|T|)$。求 next 是线性的；主循环里每个字符只入栈一次，失配链回退的均摊总量也被"匹配长度每次最多增加 $1$"所界定，弹栈总量不超过入栈总量。
- 空间复杂度：$O(|S|+|T|)$，用于两个栈数组与 next 数组。
