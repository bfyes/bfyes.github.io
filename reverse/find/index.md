# find me out

这是一个加 upx 壳的 elf 文件，并且伪装成了 .o 文件。

> [!NOTE]
>
> **什么是壳？**
>
> 壳（packer）是在原程序外面套的一层加载器。磁盘上存的是压缩或加密过的原始映像，外加一段负责还原的 stub。程序启动时先跑 stub，把原始映像解到内存，再跳回真正的入口。
>
> | 类型 | 做法 | 脱法 | 代表 |
> | --- | --- | --- | --- |
> | 压缩壳（静态） | 压缩原始映像 | 离线解压 | UPX，`upx -d` |
> | 加密壳 | 压缩 + 加密 + 反调试 | 跑到 OEP 再 dump | — |
> | 虚拟机壳 | 指令改写成自定义字节码 | 逆向解释器 | — |

> [!NOTE]
>
> **相关概念**
>
> **ELF 文件格式**
>
> | 结构 | 作用 | 关键内容 | 使用者 |
> | --- | --- | --- | --- |
> | ELF 头 | 文件总入口 | `e_entry` 入口、`e_phoff` 程序头表偏移、`e_shoff` 节表偏移 | 内核 / 加载器 |
> | 程序头表 | 装载视图 | `PT_LOAD` 从文件偏移 X 拷 Y 字节到虚拟地址 Z；`PT_INTERP` 指定动态加载器 | 内核 |
> | 节表 | 链接与调试视图 | `.text`、`.rodata`、`.data`、符号表、重定位 | 链接器 / 调试器 |
>
> **熵**
>
> 香农熵 \\(H = -\\sum\_{i=0}^{255} p\_i \\log\_2 p\_i\\)，单位是 bit/byte，上限是 8。
>
> | 区域 | 典型熵 | 原因 |
> | --- | --- | --- |
> | `.text` | \~6 | 指令字节重复多 |
> | `.rodata` | 更低 | 字符串集中，重复模式多 |
> | `.data` | \~1 | 大量 0 |
> | 加壳或加密后的整文件 | \> 7.9 | 数据接近均匀分布 |

脱静态壳之后进行分析。

Editor (session: default)Run

```
M = 0xFFFFFFFF
DELTA = 0x9E3779B9

def mx(s, y, z, p, e, key):
    a = (((z >> 5) ^ ((y << 2) & M)) + ((y >> 3) ^ ((z << 4) & M))) & M
    b = ((s ^ y) + (key[(p & 3) ^ e] ^ z)) & M
    return (a ^ b) & M

def xxtea_decrypt(v, key):
    v = list(v)
    n = len(v)
    q = 6 + 52 // n
    s = (q * DELTA) & M
    y = v[0]
    for _ in range(q):
        e = (s >> 2) & 3
        for p in range(n - 1, 0, -1):
            z = v[p - 1]
            v[p] = (v[p] - mx(s, y, z, p, e, key)) & M
            y = v[p]
        z = v[n - 1]
        v[0] = (v[0] - mx(s, y, z, 0, e, key)) & M
        y = v[0]
        s = (s - DELTA) & M
    return v
# XXTEA 解密算法，https://en.wikipedia.org/wiki/XXTEA，目前还没看懂，这段是ai写的，哈哈
const = [0xB65DC90D7BE6ABF3, 0x6AB542A95A162FC7,
         0x377D273DDCAA804C, 0x44C0F3ECDE449E62]
raw = b"".join(x.to_bytes(8, "little") for x in const)
words = [int.from_bytes(raw[i:i + 4], "little") for i in range(0, 32, 4)]
key = [0xDEAD, 0xBEEF, 0xABCD, 1]

print(b"".join(w.to_bytes(4, "little") for w in xxtea_decrypt(words, key)).decode())
```

OutputClear

```
```

结果它是个假的。。。又一次被戏耍。

找到它的交叉引用上一级，发现是程序入口，有两个其他函数，可能与“假函数”中的 int 3 中断有关。

在 init 函数中，可以看到 10 个函数指针。

```nasm
.text:0000000000404AC5 sub_404AC5      proc near               ; CODE XREF: init_sub_49E700+38↓p
.text:0000000000404AC5                                         ; init_sub_49E700+70↓p
.text:0000000000404AC5                                         ; DATA XREF: ...
.text:0000000000404AC5 ; __unwind {
.text:0000000000404AC5                 push    rbp
.text:0000000000404AC6                 mov     rbp, rsp
.text:0000000000404AC9                 lea     rsi, sub_404BB4
.text:0000000000404AD0                 mov     edi, 5          ; 5 = SIGTRAP
.text:0000000000404AD5                 call    sub_4B0C60
.text:0000000000404ADA                 nop
.text:0000000000404ADB                 pop     rbp
.text:0000000000404ADC                 retn
.text:0000000000404ADC ; } // starts at 404AC5
.text:0000000000404ADC sub_404AC5      endp
```

main 里的 int3 最终跳转到 `0x404BB4`。

> [!NOTE]
>
> **why?**
>
> `int3` 的机器码是 `0xCC`，执行到它时，CPU 切到内核态，触发 `#BP`。内核把它转换成信号 `SIGTRAP`（Linux / Unix 系操作系统中的信号，编号 5），再去查当前进程的信号处理表。
>
> 这张表在 `main` 之前就填好了。`.init_array` 第二项 `sub_404AC5` 里执行的是：
>
> ```asm
> lea     rsi, sub_404BB4
> mov     edi, 5
> call    signal
> ```
>
> 内核发现 `SIGTRAP` 有处理函数，就在用户栈上构造信号帧，把当时的寄存器保存进去。其中 `RIP` 是 `0x404B14`，也就是 `int3` 的下一条：
>
> ```text
> 404B13: CC                     int3
> 404B14: C7 45 F0 AD DE 00 00   mov dword ptr [rbp-0x10], 0xDEAD
> ```
>
> 然后内核修改寄存器（跳到 handler `0x404BB4`）
>
> | 寄存器 | 值 | 含义 |
> | --- | --- | --- |
> | `RIP` | `0x404BB4` | handler 入口 |
> | `RDI` | `5` | 信号编号 |
> | `RSP` | 用户栈上的信号帧 | handler 的栈 |
>
> 调试器默认会截获 `SIGTRAP`，gdb 中可以设置 `handle SIGTRAP stop noprint pass`，告诉调试器将 `SIGTRAP` 信号传递给程序，如下图。
>
> 第一次是程序自己的 int3 触发断点，第二次是调试器的断点。在第二次断住后，要让调试器重新截获 `SIGTRAP`，否则会重新进入 handler，陷入死循环。
>
> 这种切换的操作其实是在告诉寄存器 int 3 指令的归属者是谁。

<mark><del>其实正确分支就在错误分支紧挨着的下方，直接一划就看到了</del></mark>

~~后面的逻辑（大概是洗牌之类的）还没看，感谢 ai 大人。。~~

~~当然前面 int 3 的部分也是我从 ai 那一点一点蒸馏出来的。~~

```c
void handler(int sig)
{
    char target[32] = "_8eF48211A73!1}NC03T3u_s_91{F47T";

    srand(*(uint32_t *)input);            // input = byte_5B1680
    for (int lo = 0; lo < 16; lo += 2) {
        int m = lo + rand() % (32 - lo);
        swap(input[31], input[m]);
        swap(input[lo], input[m - 1]);
        swap(input[lo + 1], input[31]);
    }

    if (!memcmp(input, target, 32)) {
        puts("Congras!");
        exit(0);
    }
}
```

Editor (session: default)Run

```
s = [int.from_bytes(b"ACTF", "little")]
for _ in range(30):
    s.append(s[-1] * 16807 % 2147483647)

f, r = 3, 0
for _ in range(310):
    s[f] = (s[f] + s[r]) & 0xFFFFFFFF
    f, r = (f + 1) % 31, (r + 1) % 31

a = list(range(32))
for lo in range(0, 16, 2):
    s[f] = (s[f] + s[r]) & 0xFFFFFFFF
    m = lo + (s[f] >> 1) % (32 - lo)
    f, r = (f + 1) % 31, (r + 1) % 31
    a[31], a[m] = a[m], a[31]
    a[lo], a[m - 1] = a[m - 1], a[lo]
    a[lo + 1], a[31] = a[31], a[lo + 1]

T = b"_8eF48211A73!1}NC03T3u_s_91{F47T"
o = bytearray(32)
for src, ch in zip(a, T):
    o[src] = ch
print(o.decode())
```

OutputClear

```
```
