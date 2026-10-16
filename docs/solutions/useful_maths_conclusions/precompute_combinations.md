# 组合数常用预处理

模数默认写成 `MOD`。下面三种场景按数据范围选一种即可。

## 1. 阶乘 + 逆元（模质数，$n\le 10^6\sim 10^7$）

适用于模数为质数（如 $10^9+7$、$998244353$），$n,k$ 都不超过预处理上界。询问 $O(1)$。

```cpp
const int MAXN = 2e6 + 5;
const long long MOD = 1e9 + 7;

long long fac[MAXN], inv_fac[MAXN];

long long qpow(long long a, long long b) {
    long long res = 1;
    a %= MOD;
    while (b) {
        if (b & 1) res = res * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return res;
}

void init_fac(int n = MAXN - 1) {
    fac[0] = 1;
    for (int i = 1; i <= n; i++) fac[i] = fac[i - 1] * i % MOD;
    inv_fac[n] = qpow(fac[n], MOD - 2); // 费马小定理求逆元
    for (int i = n; i >= 1; i--) inv_fac[i - 1] = inv_fac[i] * i % MOD;
}

long long C(int n, int k) {
    if (k < 0 || k > n) return 0;
    return fac[n] * inv_fac[k] % MOD * inv_fac[n - k] % MOD;
}
```

注意：

- `inv_fac[0]` 会自然变成 1，不必单独赋值。
- 上界要覆盖题目里出现的最大上标（例如曲棍球化简后的 $a+b+2$）。

## 2. 杨辉三角递推表（$n\le 3000\sim 5000$，或不要求模质数）

用帕斯卡公式填表，$O(n^2)$ 预处理，$O(1)$ 询问。模数可以不是质数。

```cpp
const int N = 3005;
const long long MOD = 1e9 + 7; // 也可改成其他模数，甚至不取模

long long Ctab[N][N];

void init_pascal(int n = N - 1) {
    for (int i = 0; i <= n; i++) {
        Ctab[i][0] = Ctab[i][i] = 1;
        for (int j = 1; j < i; j++) {
            Ctab[i][j] = (Ctab[i - 1][j - 1] + Ctab[i - 1][j]) % MOD;
        }
    }
}

long long C(int n, int k) {
    if (k < 0 || k > n) return 0;
    return Ctab[n][k];
}
```

## 3. Lucas 定理（模小质数，$n$ 很大）

当模数 $p$ 是较小质数（通常 $p\le 10^6$），而 $n$ 可以到 $10^{18}$ 时，用 Lucas：

$$
C(n,k)\bmod p = C(n\bmod p,\ k\bmod p)\cdot C(\lfloor n/p\rfloor,\ \lfloor k/p\rfloor)\bmod p
$$

递归到 $n<p$ 后，再用上面的阶乘逆元求小范围组合数。

```cpp
const long long MOD = 1000003; // 示例：小质数模

long long fac[MOD], inv_fac[MOD];

long long qpow(long long a, long long b) {
    long long res = 1;
    a %= MOD;
    while (b) {
        if (b & 1) res = res * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return res;
}

void init_fac_mod() {
    int n = (int)MOD - 1;
    fac[0] = 1;
    for (int i = 1; i <= n; i++) fac[i] = fac[i - 1] * i % MOD;
    inv_fac[n] = qpow(fac[n], MOD - 2);
    for (int i = n; i >= 1; i--) inv_fac[i - 1] = inv_fac[i] * i % MOD;
}

long long C_small(long long n, long long k) {
    if (k < 0 || k > n) return 0;
    return fac[n] * inv_fac[k] % MOD * inv_fac[n - k] % MOD;
}

long long Lucas(long long n, long long k) {
    if (k < 0 || k > n) return 0;
    if (n < MOD) return C_small(n, k);
    return Lucas(n / MOD, k / MOD) * C_small(n % MOD, k % MOD) % MOD;
}
```

## 选用速查

| 场景 | 方法 | 预处理 | 单次询问 |
| --- | --- | --- | --- |
| 模质数，$n\le 10^7$ | 阶乘 + 逆元 | $O(n+\log MOD)$ | $O(1)$ |
| $n$ 很小，或模非质数 | 杨辉三角表 | $O(n^2)$ | $O(1)$ |
| 模小质数，$n$ 很大 | Lucas | $O(p+\log p)$ | $O(\log_p n)$ |
