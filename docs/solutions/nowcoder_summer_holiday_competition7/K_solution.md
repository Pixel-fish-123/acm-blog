# K D-Mail Institution Codes 题解

## 题意

有 $n$（$1 \le n \le 20$）所研究机构，每所机构的名字由 $1 \sim 20$ 个单词组成，单词之间以单个空格分隔；每个单词含 $1 \sim 20$ 个英文字母，首字母大写、其余小写。保证所有机构名两两不同。

初始时，每所机构的缩写为该名字每个单词首字母的拼接（不含空格）。

随后每轮同时细化**所有当前仍与他人共享的缩写**：
- 第 $k$ 次细化后，名字的前 $k$ 个单词被写全，其余单词仍只取首字母；
- 若被写全的单词只有一个字母，则缩写本身不变，但该单词仍视为已处理，下一次细化继续处理后面的单词；
- 一旦某个缩写变得唯一，它就永久锁定，不再改变。

保证有限轮后所有缩写两两不同。输出每所机构最终的缩写（按输入顺序，每行一个，不带空格）。

## 核心思路

**算法类型**：模拟（按轮细化）。

**关键观察**：每个机构的缩写状态完全由「已写全的单词数」决定——前 `cnt` 个单词写全，其余取首字母。因此可以用 `cnt[i]` 描述机构 $i$ 的缩写进度：

$$\text{abbr}(i) = \text{word}_0 + \text{word}_1 + \cdots + \text{word}_{cnt[i]-1} + \text{首字母}(\text{word}_{cnt[i]}), \dots$$

- 初始：`cnt[i] = 0`，即纯首字母缩写；
- 每次细化：`cnt[i]++` 并按上式重算缩写；
- 单字母单词：写全与取首字母结果相同，缩写自然不变，但 `cnt` 照样递增——恰好符合题意中「单字母单词视为已处理」的规则。

**模拟流程**：外层循环重复执行，直到所有 `s_now[i]` 两两不同。内层扫描所有 $(i, j)$ 对，一旦发现 `s_now[i] == s_now[j]`（$i \ne j$），就把这两个机构各细化一轮。由于每细化一次就多写全一个单词，而每个机构至多 $W \le 20$ 个单词，细化必然在有限步内结束；$n \le 20$，$O(n^2)$ 的扫描开销完全可接受。

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
    int N;
    cin >> N;
    cin.ignore();
    vector<vector<std::string>> s_sub(N);
    vector<std::string> s_now(N);
    vector<int> cnt(N);
    

    for (int i = 0; i < N; i ++) {
        std::string s;
        getline(cin, s);
        std::string temp = "";
        for (int j = 0; j < s.size(); j ++) {
            if (s[j] == ' ') {
                s_sub[i].push_back(temp);
                temp = "";
            }
            else temp = temp + s[j];
        }

        if (temp != "") {
            s_sub[i].push_back(temp);
            temp = "";
        }

    }

    for (int i = 0; i < N; i ++) {
        for (auto &x : s_sub[i]) {
            //cout << x << " ";
            s_now[i] = s_now[i] + x[0];
        }
        //cout << endl;
    }

    bool ok = true;

    do {
        ok = true;
        for (int i = 0; i < N; i ++) {
            bool alter = false;
            for (int j = 0; j < N; j ++) {
                if (i == j) continue;
                
                if (s_now[i] == s_now[j]) {
                    ok = false;
                    alter = true;
                    s_now[j] = "";
                    for (int k = 0; k < s_sub[j].size(); k ++) {
                        if (k <= cnt[j]) s_now[j] = s_now[j] + s_sub[j][k];
                        else s_now[j] = s_now[j] + s_sub[j][k][0];
                    }
                    cnt[j] ++;

                }
            }

            if (alter) {
                s_now[i] = "";
                for (int k = 0; k < s_sub[i].size(); k ++) {
                    if (k <= cnt[i]) s_now[i] = s_now[i] + s_sub[i][k];
                    else s_now[i] = s_now[i] + s_sub[i][k][0];
                }
                cnt[i] ++;
            }
        }

        

    } while(!ok);


    for (int i = 0; i < N; i ++) {
        cout << s_now[i] << endl;
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

- **时间**：每轮扫描全部 $O(n^2)$ 对 $(i, j)$，每次细化需 $O(W)$ 重算缩写；每个机构至多被细化 $W$ 次，故总轮数为 $O(nW)$ 级别（实际远小于上界），总时间复杂度 $O(n^2 \cdot W^2)$，其中 $n, W \le 20$，完全可行。
- **空间**：$O(nW)$，用于存储每个机构的单词列表与当前缩写。
