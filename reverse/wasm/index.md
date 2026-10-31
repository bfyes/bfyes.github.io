# wasm rpg 1

> [!WARNING]
>
> **TODO**
>
> 尚未完全掌握。

题目网页里有一个 run.wasm（WebAssembly），还有一个内嵌 js 的 html，整体逻辑很清晰，于是直接把 wasm 喂给 IDA。

反汇编大概是这样，虽然代码篇幅确实不长，但是明显不适合人类阅读。（当然这个对于 ai 来说是很轻松的，人类的这方面的注意力还是没法比，哈哈）

找工具来生成一些能看的反编译代码。

```bash
wasm-opt -O3 run.wasm -o run.opt.wasm # WebAssembly/binaryen
wasm-decompile run.opt.wasm -o run.dcmp # WebAssembly/wabt
```

init()

```c
a[15]:byte = 0;                                                  // swap 临时量
a[14]:byte = 7;                                                  // 常量 7
a[13]:byte = 24;                                                 // 常量 24
a[12]:byte = 1;                                                  // x = 1

loop L_c {                                                       // for (k = 0; k < 256; k++)
  if (a[71]:int < 256) {
    (a[71]:int)[1056]:byte = a[71]:int;                          // S[k] = k
    a[12]:byte = (b = a[13]:ubyte + a[12]:ubyte * a[14]:ubyte);  // x = 24 + x*7，结果存回 8 位
    (a[71]:int + a + 16)[0]:byte = b;                            // key[k] = x
    a[71]:int = a[71]:int + 1;                                   // k++
    continue L_c;
  }
}

a[70]:int = 0;                                                   // j = 0
loop L_e {                                                       // KSA
  if (a[71]:int < 256) {
    a[70]:int = ((a[71]:int + a + 16)[0]:ubyte + a[70]:int + (a[71]:int)[1056]:ubyte) % 256;  // j = (j + key[k] + S[k]) % 256
    a[15]:byte = (a[71]:int)[1056]:ubyte;                        // t = S[k]
    (a[71]:int)[1056]:byte = (a[70]:int)[1056]:ubyte;            // S[k] = S[j]
    (a[70]:int)[1056]:byte = a[15]:ubyte;                        // S[j] = t
    a[71]:int = a[71]:int + 1;                                   // k++
    continue L_e;
  }
}
```

```c
uint8_t key[256];   // 栈上的局部 buffer，a+16

void init(void) {
    uint8_t x = 1;
    for (int k = 0; k < 256; k++) {
        S[k] = k;
        x = 24 + x * 7;      // LCG，uint8_t 自然截断
        key[k] = x;
    }
    j = 0;
    for (int k = 0; k < 256; k++) {
        j = (j + key[k] + S[k]) % 256;
        uint8_t t = S[k];
        S[k] = S[j];
        S[j] = t;
    }
}
```

run()

```c
export function run(a:int):int { // func2
    var b:int = g_a - 16;
    b[2]:int = a;
    1040[0]:byte = 1040[0]:ubyte + 1;
    1041[0]:byte = (1040[0]:ubyte)[1056]:ubyte + 1041[0]:ubyte;
    b[7]:byte = (1040[0]:ubyte)[1056]:ubyte + (1041[0]:ubyte)[1056]:ubyte;
    (1040[0]:ubyte)[1056]:byte = b[7]:ubyte - (1040[0]:ubyte)[1056]:ubyte;
    (1041[0]:ubyte)[1056]:byte = b[7]:ubyte - (1041[0]:ubyte)[1056]:ubyte;
    d_a[0]:int = b[2]:int ^ (b[7]:ubyte ^ d_a[0]:int << 2); // data d_a(offset: 1024) = "\07\00\00\00\01"; acc | status
    if (1040[0]:ubyte == 11) {
        if (d_a[0]:int != 178198031) { d_a[1]:int = -1 }
        d_a[0]:int = 39;
    }
    if (1040[0]:ubyte == 17) {
        if (d_a[0]:int != 11292) { d_a[1]:int = -1 }
        d_a[0]:int = 63;
    }
    if (1040[0]:ubyte == 29) {
        if (d_a[0]:int != 927541117) { d_a[1]:int = -1 }
        b[3]:int = d_a[1]:int;
        goto B_e;
    }
    b[3]:int = 0;
    label B_e:
    return b[3]:int;
}
```

```c
uint8_t S[256];            // 1056
uint8_t i = 0, j = 0;      // 1040, 1041
int32_t acc = 7;           // 1024，初值来自数据段
int32_t status = 1;        // 1028

int run(int dir) {         // 1上 2下 3左 4右
    i++;                   // uint8_t，越过 255 自动回绕
    j += S[i];
    uint8_t t = S[i] + S[j];
    S[i] = t - S[i];
    S[j] = t - S[j];
    acc = (acc << 2) ^ t ^ dir;

    if (i == 11) { if (acc != 178198031) status = -1; acc = 39; }
    if (i == 17) { if (acc != 11292)     status = -1; acc = 63; }
    if (i == 29) { if (acc != 927541117) status = -1; return status; }

    return 0;
}
```

> [!NOTE]
>
> **RC4**
>
> RC4 是个流密码，分两个阶段：
>
> - **KSA**：用密钥把 0..255 的排列 `S` 打乱。跑 256 轮，每轮 `j = (j + key[k] + S[k]) & 0xff`，交换 `S[k]` 和 `S[j]`。
> - **PRGA**：之后每字节一次，`i = (i+1) & 0xff`、`j = (j + S[i]) & 0xff`，交换 `S[i]`、`S[j]`，输出 `S[(S[i] + S[j]) & 0xff]`，拿去和明文异或。
> - `init()`：LCG 生成 256 字节的 key（`x = 24 + 7x`，逐字节回绕），跑一遍 KSA 得到 `S`；
> - `run(dir)`：一次一轮 PRGA，`acc = (acc << 2) ^ t ^ dir`；
> - `acc` 在第 11、17、29 步各和常量比一次，比完重置成 39、63，所以三段互相独立。

Editor (session: wasmrpg)Run

```
S = list(range(256))
j = 0
x = 1
for i in range(256):                    # KSA，用 LCG 生成的 key 打乱 S
    x = (24 + x * 7) & 0xff
    j = (j + x + S[i]) % 256
    S[i], S[j] = S[j], S[i]

i = j = 0
ks = []
for _ in range(29):                     # 一次 run() 就是一轮 PRGA
    i = (i + 1) % 256
    j = (j + S[i]) % 256
    S[i], S[j] = S[j], S[i]
    ks.append((S[i] + S[j]) & 0xff)

moves = []
for seg, tgt in [(ks[:11], 178198031), (ks[11:17], 11292), (ks[17:], 927541117)]:
    acc, rev = tgt, []
    for t in seg[::-1]:                 # 正向 acc 左移 2 位，倒推 右移 2 位
        u = acc ^ t
        n = (u & 3) or 4
        rev.append(n)
        acc = (u ^ n) >> 2
    moves += rev[::-1]

base = 'T1LJCVS4NQ53YWKA0H2XB6RO8FEPGD7Z9MIU'
d = {1: (0, -1), 2: (0, 1), 3: (-1, 0), 4: (1, 0)}
col, row, body = 1, 4, ''
for n in moves:
    col, row = col + d[n][0], row + d[n][1]
    body += base[6 * col + row]
print('AAA{' + body + '}')
print(' '.join(['上' if n == 1 else '下' if n == 2 else '左' if n == 3 else '右' for n in moves]))
```

OutputClear

```
```

> 这个 pyodide 插件似乎也和 wasm 有关，将 python 编译成 wasm 虚拟机。
