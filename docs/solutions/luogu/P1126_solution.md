---
tags: [BFS]
difficulty: "普及+/提高-"
source: "https://www.luogu.com.cn/problem/P1126"
---
# P1126 [CERC1996] 机器人搬重物 题解

## 题意

储藏室是 $N\times M$ 的网格（$1\le N,M\le 50$），部分格子有障碍。机器人是直径 $1.6$ 米的球，中心在格点上，需从起点格走到终点格。五种指令：`Creep` 前进 $1$ 步、`Walk` 前进 $2$ 步、`Run` 前进 $3$ 步、`Left` 左转、`Right` 右转，每条指令均耗时 $1$ 秒。求最短时间；无法到达输出 $-1$。终点朝向任意。

## 核心思路

**算法类型**：BFS 状态搜索，状态 =（格点坐标， 朝向）。

**关键点一：障碍的格点化处理**。机器人直径 $1.6>1$，其中心所在的格点只要与某个障碍格共享一个角，球体就会碰到该障碍（中心到这种格子最远点距离 $\le\sqrt2/2<0.8$，即半个直径）。因此把每个障碍格 $(i,j)$ 的**四个角格点**全部标记为不可通行，机器人中心就在 $(N+1)\times(M+1)$ 的格点网格上移动；读入的起点/终点格坐标各 $+1$ 映射到对应格点。

**关键点二：转移规则**。朝向编码为 $0/1/2/3$（N/E/S/W）。所有指令耗时相同（$1$ 秒），所以 BFS 每层扩展两种转移：

- **前进**：沿当前朝向走 $k=1,2,3$ 步（对应 Creep/Walk/Run），无论走几步都只花 $1$ 秒；从 $k=1$ 逐格判定，一旦越界或撞到障碍格点就 `break`——这同时保证了移动路径不会穿过障碍；
- **转向**：原地左转或右转，即朝向变为 $(face+1)\bmod 4$ 或 $(face+3)\bmod 4$，耗时 $1$ 秒。

**关键点三：剪枝**。`dis` 按格点记录最短时间；另外用 `turn[x][y]` 限制每个格点最多发起 $2$ 次转向扩展——在同一格点上，两次转向足以产生全部四个朝向，继续原地打转只会产生重复状态，这一计数剪枝同时杜绝了"原地无限转向"导致的死循环。

由于终点朝向不限，答案就是终点格点的 `dis` 值；仍为 `INF` 说明不可达，输出 $-1$。

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
const LL MAXL = 0;
using std::cin;
using std::cout;
using std::endl;
struct point
{
    int x, y;
    int face;
};
point make(int x_ , int y_, int face_)
{   
    point temp;
    temp.x = x_;
    temp.y = y_;
    temp.face = face_;
    return temp;
}
void solve() 
{
    int N, M;
    int now_x, now_y;
    int fin_x, fin_y;
    cin >> N >> M;
    std::vector<std::vector<int>> node(N + 2, std::vector<int> (M + 2, 0));
    std::vector<std::vector<int>> dis(N + 2, std::vector<int> (M + 2, INF_INT));
    std::vector<std::vector<int>> turn(N + 2, std::vector<int> (M + 2, 0));
    std::queue<point> q;
    std::queue<int> step;
    for(int i = 1 ; i <= N; i ++) {
        for(int j = 1 ; j <= M; j ++) {
            int now;
            cin >> now;
            if(now) {
                node[i][j] = node[i][j + 1] = node[i + 1][j + 1] = node[i + 1][j] = 1;
            }
        }
    }
    char dir_;
    cin >> now_x >> now_y >> fin_x >> fin_y >> dir_;
    switch(dir_)
    {
        case 'N': dir_ = '0';break;
        case 'E': dir_ = '1';break;
        case 'S': dir_ = '2';break;
        case 'W': dir_ = '3';break;
    }
    q.push(make(now_x + 1, now_y + 1, dir_ - '0'));
    dis[now_x + 1][now_y + 1] = 0;
    step.push(0);
    while(q.size()) {
        int x = q.front().x;
        int y = q.front().y;
        int face = q.front().face;
        int step_ = step.front();
        q.pop();
        step.pop();
        switch(face)
        {
            case 0:
                for(int k = 1; k <= 3; k ++) {
                    if(x - k > 1 && !node[x - k][y] && dis[x - k][y] >= step_ + 1) {q.push(make(x - k, y, face)); step.push(step_ + 1); dis[x - k][y] = step_ + 1;}
                    else if(x - k <= 1 || node[x - k][y]) break;
                }
                break;
            case 1:
                for(int k = 1; k <= 3; k ++) {
                    if(y + k < M + 1 && !node[x][y + k] && dis[x][y + k] >= step_ + 1) {q.push(make(x, y + k, face)); step.push(step_ + 1); dis[x][y + k] = step_ + 1;}
                    else if(y + k >= M + 1 || node[x][y + k]) break;
                }
                break;
            case 2:
                for(int k = 1; k <= 3; k ++) {
                    if(x + k < N + 1 && !node[x + k][y] && dis[x + k][y] >= step_ + 1) {q.push(make(x + k, y, face)); step.push(step_ + 1); dis[x + k][y] = step_ + 1;}
                    else if(x + k >= N + 1 || node[x + k][y]) break;
                }
                break;
            case 3:
                for(int k = 1; k <= 3; k ++) {
                    if(y - k > 1 && !node[x][y - k] && dis[x][y - k] >= step_ + 1) {q.push(make(x, y - k, face)); step.push(step_ + 1); dis[x][y - k] = step_ + 1;}
                    else if(y - k <= 1 || node[x][y - k]) break;
                }
                break;
        }
        if(turn[x][y] < 2) {
            turn[x][y] ++;
            q.push(make(x, y, (face + 1) % 4)); step.push(step_ + 1);
            q.push(make(x, y, (face + 3) % 4)); step.push(step_ + 1);
        }
    }
    /*cout << endl;
    for(int i = 1; i <= N + 1; i ++) {
        for(int j = 1; j <= M + 1; j ++) {
            if(dis[i][j] != INF_INT) cout << dis[i][j] % 10 << " ";
            else cout << "# ";
        }
        cout << endl;
    }
    cout << endl;*/
    if(dis[fin_x + 1][fin_y + 1] != INF_INT) cout << dis[fin_x + 1][fin_y + 1] << endl;
    else cout << "-1" << endl;
    return;
}
int main() 
{
    /*std::ios::sync_with_stdio(false); cin.tie(nullptr); cout.tie(nullptr);
    freopen("test.in", "r", stdin);
    freopen("output.out", "w", stdout);*/
    int _ = 1;
    for (int i = 0; i < _; i++) {
        solve();
    }
    return 0;
}
```

## 复杂度

- 时间复杂度：$O(N\cdot M\cdot C)$，状态数为格点数乘以朝向数（$C=4$），每个状态的前进/转向转移均为 $O(1)$ 级别（前进至多枚举 $3$ 步）。
- 空间复杂度：$O(N\cdot M)$，即格点网格上的 `dis`、`node`、`turn` 三个数组。
