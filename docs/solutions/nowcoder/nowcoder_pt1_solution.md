# nowcoder_pt1 接头密匙 题解

## 题意

牛牛和朋友们约定了一套接头密匙系统，用于确认彼此身份。一个密匙用一组数字序列表示，两个密匙被认为一致，当且仅当下面两条同时成立：

1. $|b| \le |a|$，即 $b$ 的长度不超过 $a$ 的长度；
2. 对任意 $0 \le i < |b| - 1$，都有 $a[i+1] - a[i] = b[i+1] - b[i]$。

也就是说，参与比较的只有相邻两项的差值，并且 $b$ 的相邻差值序列必须逐项等于 $a$ 的相邻差值序列的**前缀**。条件 2 只用到 $a$ 的前 $|b| - 1$ 个差值，$a$ 后面还有多少元素、差值分别是多少，都不影响结论；密匙中数字的绝对大小同样不影响结论。

函数签名为 `countConsistentKeys(vector<vector<int>>& b, vector<vector<int>>& a)`：第一个参数 $b$ 是待验证的密匙组，第二个参数 $a$ 是作为参照的密匙组。需要为 $b$ 中的每一个密匙，统计 $a$ 中有多少个密匙与它一致，并按顺序返回等长的结果数组。返回值是计数而不是去重后的种类数，$a$ 中完全相同的两个密匙要分别计入。

样例 1：$a$ 组（第二个参数）为 $[[3,4,5,6,7,8],[2,4,6,8],[1,3,5,7,9]]$，$b$ 组（第一个参数）为 $[[1,2,3,4,5],[2,4,6,8],[1,4,7,10]]$，输出 $[1,2,0]$。

样例 2：$a$ 组为 $[[1,2,3,4,5],[2,3,4,5,6,7,8],[1,4,7,10]]$，$b$ 组为 $[[1,2,3],[4,5,6,7,8],[2,4,6,8]]$，输出 $[2,2,0]$。

用样例 1 的 $b_0 = [1,2,3,4,5]$ 核对上述规则：它的差值序列是 $[1,1,1,1]$；$a_0 = [3,4,5,6,7,8]$ 的差值序列是 $[1,1,1,1,1]$，以 $[1,1,1,1]$ 为前缀，一致；$a_1 = [2,4,6,8]$ 的差值序列是 $[2,2,2]$，不一致；$a_2 = [1,3,5,7,9]$ 的差值序列是 $[2,2,2,2]$，不一致。于是答案是 $1$，与样例相符。

同一组样例还覆盖了「长度条件由前缀关系体现」的情形：$b_1 = [2,4,6,8]$ 的差值序列是 $[2,2,2]$，比 $a_2$ 的差值序列 $[2,2,2,2]$ 短，但因为 $|b_1| = 4 \le |a_2| = 5$ 且前缀逐项相同，仍然算一致；所以 $b_1$ 的答案是 $2$（$a_1$ 与 $a_2$）。样例 2 中 $b_1 = [4,5,6,7,8]$ 的差值序列是 $[1,1,1,1]$，$a_0$ 与 $a_1$ 的差值序列都以它为前缀，答案是 $2$，同样与样例相符。

题面备注给出的规模是：数组 a、b 的元素个数均不超过 $10^5$。

## 核心思路

先把「一致」写成一个前缀问题。记密匙 $x$ 的相邻差值序列为

$$d(x) = (x_1 - x_0,\ x_2 - x_1,\ \dots,\ x_{|x|-1} - x_{|x|-2}),$$

它的长度恰好是 $|x| - 1$。于是「$b$ 与 $a$ 一致」等价于「$d(b)$ 是 $d(a)$ 的前缀」，也就是 $|d(b)| \le |d(a)|$ 且两个序列逐项相等。长度条件 $|b| \le |a|$ 已经被前缀关系自动包含，不必单独判断。

于是问题变成：有一堆序列 $d(a_1), d(a_2), \dots$，对每个 $d(b_j)$ 求这堆序列中有多少个以它为前缀。这是 Trie 的典型用法：把所有 $d(a_i)$ 插入同一棵 Trie，查询时把 $d(b_j)$ 从根往下走，路径上经过的序列条数就是答案。

计数靠节点上的标记完成。节点 $u$ 维护一个 $pass[u]$，表示有多少条 $d(a_i)$ 经过 $u$。插入一条序列时，每走到一个节点就把该节点的 $pass$ 加一，插入结束后 $pass[u]$ 就恰好等于「以 $u$ 所代表的序列为前缀的 $d(a_i)$ 条数」。查询 $d(b_j)$ 时如果整条路径都走得通，终点节点的 $pass$ 就是答案；如果中途某个位置没有对应孩子，说明没有序列以 $d(b_j)$ 为前缀，答案是 $0$。两条完全相同的序列不会被合并，而是各自沿同一条路径再走一遍，因此计数天然带重数。

接下来的难点在于：差值是可正可负的整数，取值范围远大于 Trie 能接受的小字符集，不能直接拿差值当下标。代码的做法是先把差值序列化成字符串，再逐字符插入 Trie：

- 每个差值用 `std::to_string` 转成十进制文本；
- 在这段文本后面再拼一个分隔符 `#`；
- 每个字符统一映射成一个 $0$ 到 $11$ 的下标：数字 `'0'` 到 `'9'` 依次映射为 $0$ 到 $9$，负号 `'-'` 映射为 $10$，分隔符 `'#'` 映射为 $11$。

类中的 `transform` 函数做的就是最后这一步。因为下标范围固定为 $12$，每个节点的孩子数组直接开成长度 $12$ 的 `vector<int>`，转移是一次数组下标访问，不需要哈希。

分隔符是不能省的。只把差值文本首尾相接的话，$[1, 23]$ 与 $[12, 3]$ 都会变成 `123`，两组不同的差值序列会被误判成同一条路径。补上 `#` 之后，由于数字字符与负号里都不会出现 `#`，按 `#` 切分是唯一的，字符串的逐字符前缀关系也就精确地对应差值序列的逐项前缀关系。

这里有一处容易含糊的细节值得写清：字符串前缀何以恰好等于序列前缀。每条差值文本后面都带 `#`，所以 $d(b)$ 的序列化串一定以 `#` 结尾。若它是 $d(a)$ 的序列化串的前缀，这个前缀就正好停在 $a$ 串中某个 `#` 上，即停在 $a$ 的某个差值边界处，绝不会停在某个数字中间；按 `#` 切开后，得到的文本块与 $a$ 串开头的同样多块逐一相同，块数正好是 $|d(b)| = |b| - 1$。反过来，如果 $d(b)$ 逐项等于 $d(a)$ 的前 $|b| - 1$ 项，那么把两串各自序列化后，前者显然是后者的前缀。两个方向合起来，Trie 上「走得通」与「一致」互为充要条件。

查询里的两个实现细节也顺带说明了正确性。第一，走不通时把答案置 $0$，但游标 `cur` 不移动，后面的字符继续在同一个节点上判空；由于答案一旦变成 $0$ 就不会再被改写，最后返回的仍是 $0$，同时也避免了访问不存在的节点。第二，插入每条 $d(a_i)$ 之前，游标还停在根上，代码先执行了一次 `pass[cur] ++`，所以根上的计数等于 $a$ 组密匙的总数。当 $|b| = 1$ 时 $d(b)$ 是空序列，查询一步也不走、终点就是根，答案正好是 $a$ 的密匙个数——此时长度条件 $1 \le |a|$ 恒成立，也没有任何差值需要比较，与定义一致。

两个前提由输入保证，代码依赖它们成立。一是求差值时写的是 `for (int j = 0; j < x.size() - 1; j ++)`，而 `x.size()` 是无符号数，若某个密匙为空，`x.size() - 1` 会下溢成一个极大的数并越界；题目的密匙由数字序列表示，至少含有一个元素。二是差值以 `int` 计算并序列化，最长形如 `-2147483648`，即负号加十位数字共 $11$ 个字符，再算上分隔符共 $12$ 个字符，正好被 $12$ 个字符类覆盖，映射表不会与数字或负号冲突。

把工作量和暴力比较对照一下就更清楚：单独比较一对 $(b_j, a_i)$ 只需要沿前缀扫一遍、发现不同即停，代价是 $O(\min(|b_j|,\ |a_i|))$，但要对所有配对做一次，代价是 $O\big(\sum_j \sum_i \min(|b_j|, |a_i|)\big)$。Trie 把「某条前缀下挂着哪些序列」这件事共享起来，$a$ 组每条序列只插一次，$b$ 组每条序列只查一次，重复的前缀比较被整体消掉。

::: details 点击展开参考代码

## 参考代码

完整代码如下，其中既保留了题目要求的 `class Solution`，也保留了本地的 `main()` 框架。

```cpp
//https://www.nowcoder.com/practice/c552d3b4dfda49ccb883a6371d9a6932

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

class Solution {
    public:
        int transform(char s) {
            if (s >= '0' && s <= '9') {
                return s - '0';
            }
            else if (s == '-') {
                return 10;
            }
            else return 11;
        }

        vector<int> countConsistentKeys(vector<vector<int> >& b, vector<vector<int> >& a) {
            vector<int> res;
            vector<vector<int>> tree;
            vector<int> pass;
            tree.resize(2, vector<int>(12));
            pass.resize(2, 0);
            int cnt = 1;

            for (auto x : a) {
                int cur = 1;
                pass[cur] ++;
                vector<int> arr;
                for (int j = 0; j < x.size() - 1; j ++) {
                    arr.push_back(x[j + 1] - x[j]);
                }
                for (auto y : arr) {
                    std::string s = std::to_string(y);
                    s += "#";
                    for (int j = 0; j < s.size(); j ++) {
                        int now = transform(s[j]);
                        if (!tree[cur][now]) {
                            tree[cur][now] = ++ cnt;
                            tree.push_back(vector<int>(12));
                            pass.push_back(0);
                        }
                        cur = tree[cur][now];
                        pass[cur] ++;
                    }
                }
            }

            for (auto x : b) {
                int cur = 1;
                vector<int> brr;
                for (int j = 0; j < x.size() - 1; j ++) {
                    brr.push_back(x[j + 1] - x[j]);
                }

                int ans = -1;
                for (auto y : brr) {
                    std::string s = std::to_string(y);
                    s += "#";
                    for (int j = 0; j < s.size(); j ++) {
                        int now = transform(s[j]);
                        if (!tree[cur][now]) {
                            ans = 0;
                        }
                        else cur = tree[cur][now];
                    }
                }
                if (ans == -1) ans = pass[cur];
                res.push_back(ans);
            }

            return res;
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


:::

## 复杂度

记 $L_a = \sum_{x \in a} (|x| - 1)$ 为 $a$ 组所有密匙的相邻差值个数之和，$L_b = \sum_{x \in b} (|x| - 1)$ 同理；单个差值序列化后最多 $c \le 12$ 个字符（负号一位、十进制数字最多十位、分隔符一位）。

- 时间：插入 $a$ 的每个差值最多处理 $c$ 个字符，查询 $b$ 的每个差值同样最多处理 $c$ 个字符，每个字符在 Trie 上都是一次 $O(1)$ 的孩子查询加一次计数，所以总时间为

$$O\big(c \cdot (L_a + L_b)\big).$$

- 空间：每个 Trie 节点保存一个长度 $12$ 的孩子数组和一个计数，节点数不超过 $c \cdot L_a + 1$，因此空间为 $O(c \cdot L_a)$。

备注页的文本在数据范围处截断，只写了数组 a、b 的元素个数均不超过 $10^5$，没有给出单个密匙长度的上限，所以上面的界用 $L_a$、$L_b$ 这种与具体读数无关的形式给出：只要两组密匙数字的总规模在线性可接受的范围内，Trie 的节点数与运行时间都随之线性增长。
