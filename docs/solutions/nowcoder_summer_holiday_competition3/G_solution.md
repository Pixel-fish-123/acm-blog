# G Grid Marking 题解

## 题意

给定一个 $n \times m$ 的网格，每个格子有一个正整数。

若存在两个格子 $(r_1, c_1)$ 和 $(r_2, c_2)$ 满足 $r_1 < r_2$ 且 $c_1 < c_2$，并且这两个格子中的数字相等，则以这两个格子为对角线的矩形内所有格子 $[r_1..r_2] \times [c_1..c_2]$ 都被标记。

求所有标记完成后整个网格的状态（输出 `01` 矩阵）。

## 核心思路

**算法类型**：按值分组 + 前后缀预处理 + 二维差分。

**关键观察**：对固定数值 $v$，同一行内可能有多个 $v$，但起作用的只有该行 $v$ 的**最左列** `lo[r]`（作为左上角 $c_1$ 越小越优）和**最右列** `hi[r]`（作为右下角 $c_2$ 越大越优）。因此先把每个值的出现位置按行压缩成 `(行号, lo, hi)` 三元组序列。

**核心难点**：朴素做法枚举行对是 $O(R_v^2)$，会超时。优化思路是对每个出现行 $i$，分别计算它作为「左上角所在行」和「右下角所在行」时能覆盖的最宽列区间：

预处理：
- `pref_min[i] = min(lo[0..i])`：前缀最小左界（上方 + 当前的最优 NW 列）
- `suff_max[i] = max(hi[i..m-1])`：后缀最大右界（当前 + 下方的最优 SE 列）

对每个出现行 $i$，合并四种情况得到该行被标记的列区间 $[L, R]$：

| 情况 | NW（左上）位置 | SE（右下）位置 | 贡献 |
| --- | --- | --- | --- |
| L1 | 严格更早行 | 当前行或之后 | $L = \min(L, \text{pref\_min}[i-1])$ |
| L2 | 当前行 | 严格更晚行 | $L = \min(L, \text{lo}[i])$ |
| R1 | 当前行或之前 | 严格更晚行 | $R = \max(R, \text{suff\_max}[i+1])$ |
| R2 | 严格更早行 | 当前行 | $R = \max(R, \text{hi}[i])$ |

若 $L < R$ 则标记单行区间 $[\text{rows}[i], \text{rows}[i]] \times [L, R]$。

**行间隔处理**：两个相邻出现行 `rows[i]` 与 `rows[i+1]` 之间的空白行（若存在），只要 `pref_min[i] < suff_max[i+1]`，整个区间 $[\text{rows}[i]+1, \text{rows}[i+1]-1] \times [\text{pref\_min}[i], \text{suff\_max}[i+1]]$ 都会被覆盖（因为任取上方某行作 NW、下方某行作 SE，矩形必然穿过这些中间行）。

**二维差分**：所有矩形标记用二维差分 $O(1)$ 完成，最后二维前缀和还原，$>0$ 即被标记。

## 参考代码

```cpp
#include <iostream>
#include <vector>
#include <unordered_map>
#include <algorithm>

#define LL long long
using std::cin;
using std::cout;
using std::endl;
using std::vector;

const int INF_INT = 0x3f3f3f3f;

void solve()
{
    int N, M;
    cin >> N >> M;

    // 按值分组收集位置
    std::unordered_map<int, vector<std::pair<int,int>>> groups;
    for (int i = 1; i <= N; i++) {
        for (int j = 1; j <= M; j++) {
            int val;
            cin >> val;
            groups[val].push_back({i, j});
        }
    }

    // 二维差分数组，多开两行/列防越界
    vector<vector<int>> diff(N + 3, vector<int>(M + 3, 0));

    // 辅助 lambda：打一个矩形标记
    auto mark = [&](int r1, int r2, int c1, int c2) {
        if (r1 > r2 || c1 > c2) return;
        diff[r1][c1]++;
        diff[r1][c2 + 1]--;
        diff[r2 + 1][c1]--;
        diff[r2 + 1][c2 + 1]++;
    };

    for (auto &[val, cells] : groups) {
        if (cells.size() < 2) continue;  // 只出现一次，无法成对

        // 按行排序
        std::sort(cells.begin(), cells.end());

        // 压缩为每行的最小/最大列
        vector<int> rows, lo, hi;
        for (int i = 0; i < (int)cells.size(); ) {
            int r = cells[i].first;
            int minc = cells[i].second;
            int maxc = cells[i].second;
            int j = i + 1;
            while (j < (int)cells.size() && cells[j].first == r) {
                minc = std::min(minc, cells[j].second);
                maxc = std::max(maxc, cells[j].second);
                j++;
            }
            rows.push_back(r);
            lo.push_back(minc);
            hi.push_back(maxc);
            i = j;
        }

        int m = (int)rows.size();
        if (m < 2) continue;  // 所有出现都在同一行，无法满足 r1 < r2

        // pref_min[i] = min(lo[0..i])
        // suff_max[i] = max(hi[i..m-1])
        vector<int> pref_min(m), suff_max(m);
        pref_min[0] = lo[0];
        for (int i = 1; i < m; i++) {
            pref_min[i] = std::min(pref_min[i - 1], lo[i]);
        }
        suff_max[m - 1] = hi[m - 1];
        for (int i = m - 2; i >= 0; i--) {
            suff_max[i] = std::max(suff_max[i + 1], hi[i]);
        }

        // 处理每个出现行
        for (int i = 0; i < m; i++) {
            int L = INF_INT, R = -INF_INT;

            // L1: NW 在严格更早行，SE 在当前行或之后
            if (i > 0 && pref_min[i - 1] < suff_max[i]) {
                L = std::min(L, pref_min[i - 1]);
            }
            // L2: NW 在当前行，SE 在严格更晚行
            if (i < m - 1 && suff_max[i + 1] > lo[i]) {
                L = std::min(L, lo[i]);
            }
            // R1: SE 在严格更晚行，NW 在当前行或之前
            if (i < m - 1 && suff_max[i + 1] > pref_min[i]) {
                R = std::max(R, suff_max[i + 1]);
            }
            // R2: SE 在当前行，NW 在严格更早行
            if (i > 0 && pref_min[i - 1] < hi[i]) {
                R = std::max(R, hi[i]);
            }

            if (L < R) {
                mark(rows[i], rows[i], L, R);
            }
        }

        // 处理行间隔
        for (int i = 0; i < m - 1; i++) {
            if (rows[i] + 1 <= rows[i + 1] - 1) {
                if (pref_min[i] < suff_max[i + 1]) {
                    mark(rows[i] + 1, rows[i + 1] - 1, pref_min[i], suff_max[i + 1]);
                }
            }
        }
    }

    // 二维前缀和还原
    for (int i = 1; i <= N; i++) {
        for (int j = 1; j <= M; j++) {
            diff[i][j] += diff[i - 1][j] + diff[i][j - 1] - diff[i - 1][j - 1];
            cout << (diff[i][j] ? '1' : '0');
        }
        cout << '\n';
    }
}

int main()
{
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);
    solve();
    return 0;
}
```

## 复杂度

- **时间复杂度**：读入 $O(nm)$；按值分组后，每个值 $v$ 的处理为 $O(\text{出现次数} \log \text{出现次数})$（排序）+ $O(R_v)$（前后缀与扫描），总计 $O(nm \log(nm))$；二维前缀和还原 $O(nm)$。整体 $O(nm \log(nm))$。
- **空间复杂度**：$O(nm)$，用于二维差分数组与分组存储。
