# leetcode572 另一棵树的子树 题解

## 题意

给定两棵二叉树的根 `root` 与 `subRoot`，判断 `root` 中是否存在一棵与 `subRoot` **结构相同、且对应节点值完全相同**的子树。这里的子树指 `tree` 的某个节点连同它的全部后代；`tree` 自身也算它自己的一棵子树。

数据范围：`root` 的节点数在 $[1,2000]$，`subRoot` 的节点数在 $[1,1000]$，节点值均在 $[-10^4,10^4]$ 内。

## 核心思路

**树的序列化 + KMP：把"子树匹配"转化为"子串匹配"。**

朴素做法是枚举 `root` 的每个节点当子树的根，逐个与 `subRoot` 逐点比对，最坏 $O(|root|\times |subRoot|)$；在本题 $n\le 2000$ 的规模下其实也能通过。这份代码走的是线性做法，分两步。

**第一步：把一棵树唯一地编码成一个序列。**

对树做先序遍历，输出节点值；遇到**空孩子也要输出一个标记**：

```
encode(v):
    输出 val(v)
    若左孩子存在: encode(左孩子)   否则: 输出 哨兵
    若右孩子存在: encode(右孩子)   否则: 输出 哨兵
```

**空孩子的标记不能省。** 否则不同的树会编码成同一个序列：例如"只有左儿子"和"只有右儿子"，在没有标记时都编码为 `[根, 儿子]`，无法区分。补上哨兵之后，"先序 + 空标记"这种编码是**自定界**的——从任意一个真实节点开始解析，都能唯一确定它描述的那棵子树以及它占用的长度。

哨兵取 `-1e5`（即 $-100000$）：题目保证节点值落在 $[-10^4,10^4]$ 内，哨兵在值域之外，因此绝不会与任何真实节点值撞车。

**第二步：子树 $\iff$ 连续子串。**

- **必要性**：`root` 中以节点 $v$ 为根的子树，它的编码恰好是 `root` 编码中从 $v$ 所占位置开始的一段**连续**区间。
- **充分性**：反过来，若 `subRoot` 的编码在 `root` 的编码中连续出现，由于编码自定界、而 `subRoot` 的编码又是一个完整的合法编码，这段区间不可能只是某个子树编码的前缀或后缀，只能**恰好**是某个节点为根的子树编码，于是两者结构相同。

于是原问题变成：判断序列 `s[1]`（`subRoot` 的编码）是否为序列 `s[0]`（`root` 的编码）的连续子串——正是 KMP 能以 $O(n+m)$ 解决的问题。

**KMP 部分：** `Get_Next` 对模式串（即 `s[1]`）求前缀函数 $\mathrm{next}[i]$（长度为 $i$ 的前缀的最长 border 长度）；`Kmp` 用双指针扫描，相等则同进，失配且 $y>0$ 时令 $y=\mathrm{next}[y]$（文本指针不回退），$y=m$ 时记录一次匹配位置 $x-y$。与 KMP 模板完全同构，这里不再重复推导。

**一处实现细节值得记下：** 匹配成功（$y=m$）之后必须让 $y$ 回退到 $\mathrm{next}[m]$，否则"两次出现相互重叠"会漏解。代码在记录位置后显式写了 `y = s2_next[y];`。这一步原本是省略掉的，靠下一轮循环拿 $s_2[m]$ 去比较来触发失配——在 KMP 模板题里模式串是 `std::string`，标准保证下标等于 `size()` 时返回 `'\0'`，必然失配，所以那样写也能跑；但本题的序列是 `vector<int>`，`operator[]` 的前置条件是下标小于 `size()`，`s2[m]` 已经是 UB。之所以实战中一直没出事，是因为本题的序列长度恒为 $3\times$节点数（每个节点输出 $1$ 个值加 $2$ 个子标记），它恒为 $3$ 的倍数、绝不等于 $2$ 的幂，于是 `capacity` 永远大于 `size`，读到的那一格落在备用容量里、只是残值，**越不出分配区**，连 ASan 都抓不到；可一旦残值恰好等于当前文本字符，$y$ 就会继续增长并可能真的读穿。所以这一句值得显式写出来。

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

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

class Solution {
    private:
        vector<int> s[2];
    public:
        vector<int> Get_Next(vector<int> &s, int m) {
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

        vector<int> Kmp(vector<int> &s1, vector<int> &s2, vector<int> &s2_next) {
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
                    // 原写法没有这一句，靠下一轮循环拿 s2[m] 去比较来触发失配回退；
                    // 但 vector 的 operator[] 前置条件是下标 < size()，s2[m] 是 UB。
                    // 本题之所以没出事：序列长度恒为 3*节点数，是 3 的倍数、不等于 2 的幂，
                    // capacity 永远大于 size，读到的那格只是备用容量里的残值，越不出分配区；
                    // 可一旦残值恰好等于当前字符，y 就会继续增长并可能真的读穿。
                    y = s2_next[y];
                }
            }

            return pos;
        }

        bool isSubtree(TreeNode* root, TreeNode* subRoot) {
            dfs(root, 0);
            dfs(subRoot, 1);
            vector<int> next = Get_Next(s[1], s[1].size());
            vector<int> pos = Kmp(s[0], s[1], next);
            if (pos.size()) {
                return true;
            }
            else {
                return false;
            }
        }
        void dfs(TreeNode* now, int key) {
            TreeNode tmp = *now;
            s[key].push_back(tmp.val);
            if (tmp.left) {
                dfs(tmp.left, key);
            }
            else {
                s[key].push_back(-1e5);
            }

            if (tmp.right) {
                dfs(tmp.right, key);
            }
            else {
                s[key].push_back(-1e5);
            }
        }
};

void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);
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

- 时间复杂度：$O(|root|+|subRoot|)$。两棵树的先序编码各是一次遍历，随后 KMP 的失配回退是均摊线性的。
- 空间复杂度：$O(|root|+|subRoot|)$，用于存两棵树的编码序列及模式串的 next 数组。
