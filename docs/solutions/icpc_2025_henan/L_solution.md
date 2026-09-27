# L 编辑器 题解

## 题意

模拟一个文本编辑器，初始为 $1$ 个空行，光标在行首。输入是一整串连在一起的按键序列，功能键用大写单词表示，输入字符用小写字母或数字表示：

- `SHIFT`：切换 SHIFT 状态。按下时字母输入大写，数字输入键盘上方的符号（如 `4` 对应 `$`，`0` 对应 `)`）；再次出现表示松开。
- `ENTER`：在光标处把当前行断开，后半部分放到下方新插入的一行，光标移到新行行首。
- `BACKSPACE`：删除光标前的字符。若光标在行首，把当前行接到上一行末尾，下方各行上移，光标停在两部分之间；在第一行行首则不操作。
- `DEL`：删除光标后的字符。若光标在行尾，把下一行接到当前行末尾，下方各行上移，光标不动；在最后一行行尾则不操作。
- `LEFT` / `RIGHT`：左移 / 右移一格，可以跨到上一行行尾 / 下一行行首；在整篇开头 / 结尾不操作。
- `UP` / `DOWN`：移到上一行 / 下一行的同一列，那一行不够长就停在行尾；在第一行 / 最后一行不操作。
- `HOME` / `END`：移到当前行行首 / 行尾。
- 小写字母、数字：在光标处插入，光标移到新字符后面。

输出最终的全部内容。

数据范围：$1 \le |S| \le 1000$。

## 核心思路

**算法类型**：模拟。用字符串数组 `arr[0..limit]` 存各行，`(now_row, cursor)` 表示光标所在的行和列，逐个解析按键并按题意修改。

**第一步：切分按键序列。** 输入没有分隔符，代码逐字符拼到 `now` 上，每拼一个字符就尝试匹配一次按键，匹配成功就执行并清空 `now`。这种贪心切分不会出错，原因有两点：

- 十个功能键 `SHIFT ENTER BACKSPACE DEL LEFT RIGHT UP DOWN HOME END` 里，没有一个是另一个的前缀（`END` 和 `ENTER` 只共用 `EN`，`EN` 本身不是按键），所以拼到完整单词之前不会误匹配；
- 小写字母和数字都是单个字符，大写功能键的前缀永远不会被误认成它们。

**第二步：各操作的实现。**

- 插入字符：`insert(cursor, ...)` 后 `cursor ++`。SHIFT 状态下，字母转大写；数字查表 `num_to`，数组按 $0..9$ 排列为 `) ! @ # $ % ^ & * (`。
- `ENTER`：`limit ++`，把 `now_row` 以下的行整体后移一格。当前行拆成 `substr(0, cursor)` 和 `substr(cursor)`，后者放到 `now_row + 1`，光标移到 `(now_row + 1, 0)`。
- `BACKSPACE` 在行首时：记下上一行原长度 `last_siz`，把当前行接到上一行后面，下方各行前移、`limit --`，光标移到 `(now_row - 1, last_siz)`，正好停在两部分之间。
- `DEL` 在行尾时：把下一行接到当前行后面，更下方各行前移，`limit --`，光标不动。
- `UP` / `DOWN`：换行后 `cursor = min(cursor, 新行长度)`。

行上移后 `arr[limit + 1]` 处会残留旧内容，但下一次 `ENTER` 会先覆盖它，输出也只到 `limit`，不影响结果。

**样例验证。** `aSHIFTbSHIFT0ENTERcLEFTDELBACKSPACE`：

1. 依次输入 `a`、大写 `B`、`0`，第一行为 `aB0`，光标在列 $3$；
2. `ENTER` 后第二行为空，光标在 $(1, 0)$；输入 `c` 后第二行为 `c`；
3. `LEFT` 回到 $(1, 0)$，`DEL` 删掉 `c`；
4. `BACKSPACE` 把空的第二行并回第一行。

最终输出 `aB0`，与样例一致。

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
const LL MOD1 = 998244353;
const LL MOD2 = 1e9 + 7;
const int MAXL = 1001;
using std::cin;
using std::cout;
using std::endl;
using std::vector;
#define endl '\n' // 交互题记得去掉

std::string arr[MAXL];
int now_row, limit; // 当前行，行上限
int cursor; //光标位置
int Capslock = 0; // 0小写 1大写
const char num_to[10] = {')', '!', '@', '#', '$', '%', '^', '&', '*', '('};
void solve()
{
    // std::cout << std::fixed << std::setprecision(2);
    // std::cout.unsetf(std::ios::fixed);

    std::string s;
    std::string now;

    cin >> s;

    auto operator_ = [&](std::string s) -> bool {
        if (s == "SHIFT") {
            Capslock ^= 1;
        }
        else if (s == "ENTER") {
            limit ++;
            for (int j = limit; j > now_row; j --) {
                arr[j] = arr[j - 1];
            }
            std::string temp = arr[now_row].substr(cursor, arr[now_row].size() - cursor);
            arr[now_row + 1] = temp;
            arr[now_row] = arr[now_row].substr(0, cursor);
            now_row ++;
            cursor = 0;
        }
        else if (s == "BACKSPACE") {
            if (cursor == 0) {
                if (now_row > 0) {
                    int last_siz = arr[now_row - 1].size();
                    arr[now_row - 1] += arr[now_row];
                    for (int j = now_row; j < limit; j ++) {
                        arr[j] = arr[j + 1];
                    }
                    limit --;
                    now_row --;
                    cursor = last_siz;
                }
            }
            else {
                arr[now_row].erase(cursor - 1, 1);
                cursor --;
            }
        }
        else if (s == "DEL") {
            if (cursor == arr[now_row].size()) {
                if (now_row < limit) {
                    arr[now_row] += arr[now_row + 1];
                    for (int j = now_row + 1; j < limit; j ++) {
                        arr[j] = arr[j + 1];
                    }
                    limit --;
                }
            }
            else {
                arr[now_row].erase(cursor, 1);
            }
        }
        else if (s == "LEFT") {
            if (cursor > 0) {
                cursor --;
            }
            else if (now_row > 0) {
                now_row --;
                cursor = arr[now_row].size();
            }
        }
        else if (s == "RIGHT") {
            if (cursor < arr[now_row].size()) {
                cursor ++;
            }
            else if (now_row < limit) {
                now_row ++;
                cursor = 0;
            }
        }
        else if (s == "UP") {
            if (now_row > 0) {
                now_row --;
                cursor = std::min(cursor, (int)arr[now_row].size());
            }
        }
        else if (s == "DOWN") {
            if (now_row < limit) {
                now_row ++;
                cursor = std::min(cursor, (int)arr[now_row].size());
            }
        }
        else if (s == "HOME") {
            cursor = 0;
        }
        else if (s == "END") {
            cursor = arr[now_row].size();
        }
        else if (s.size() == 1 && s[0] >= 'a' && s[0] <= 'z') {
            if (Capslock == 0) {
                arr[now_row].insert(cursor, s);
            }
            else {
                int add = s[0] - 'a';
                char p = 'A' + add;
                arr[now_row].insert(cursor, 1, p);
            }
            cursor ++;
        }
        else if (s.size() == 1 && s[0] >= '0' && s[0] <= '9') {
            int num = s[0] - '0';
            if (Capslock == 0) {
                arr[now_row].insert(cursor, s);
            }
            else {
                char p = num_to[num];
                arr[now_row].insert(cursor, 1, p);
            }
            cursor ++;
        }
        else {
            return false;
        }
        return true;
    };

    for (int i = 0; i < s.size(); i ++) {
        now += s[i];
        if (operator_(now)) {
            now = "";
        }

        //cout << "now: " << now << endl;
    }

    for (int i = 0; i <= limit; i ++) {
        cout << arr[i] << endl;
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


:::

## 复杂度

- 时间复杂度：解析时每个字符最多触发一次匹配，比较的都是长度不超过 $9$ 的短串。每次编辑操作至多移动全部行、改动一行，行数和行长都不超过 $|S|$。总计 $O(|S|^2)$，约 $10^6$。
- 空间复杂度：$O(|S|)$，总文本长度不超过输入字符数。
