# 邪门的逆向

题目给了一个 18.8MB 的 32 位 PE 可执行文件。

程序入口如图，其中 `mov [eax], ecx` 直接向 0 地址写东西，触发异常，由程序自行处理。处理函数是 loc\_1940F80。

## 动态脱壳与 IAT 修复

具体机制并没有研究透彻（因为对这道题来说没什么作用），动态调试时，12345678h 会被更改，`.rsrc:01940FA2` 的代码结束后最终会回到他的下一个字节继续执行。

1. **寻找 Original Entry Point**： 使用 x32dbg 载入程序，向下单步跳过壳的解密循环和内存移动。定位到位于长跳转后的真正程序入口 OEP`0x0028DBE1`。

RVA(Relative Virtual Address) 为 `0x12DBE1`。

2. **内存 Dump 与 IAT 修复**：

- 在 OEP 处暂停，使用 **Scylla** 插件 <kbd class="key-control">Ctrl</kbd>\+<kbd class="key-i">I</kbd>。
- 填入 OEP
- 转储当前进程内存`Dump PE`
- 点击 `IAT Autosearch`自动搜索 IAT
- 点击 `Get Imports` 自动扫描导入表，右键 `Delete Invalid` 删掉两处废指针树
- 点击 `Fix Dump`，生成修复好的 [xiemen\_dump\_SCY.exe](<https://bfyes.cn/share/xiemen_dump_SCY>)。

## 静态分析

将脱壳后的文件拖入 IDA Pro 分析。

不出意料地乱成一团糟。IDA 将 idata 识别为 XTRN 外部引用段，需要手动改成 DATA，这里卡了半天，最后还是大模型帮我解决的。否则搜不到任何有关 flag 的字段和输入相关的提示，无法定位到代码。

至于后面那个占用篇幅绝大多数（有 90% 以上了）的 text 段，ai 告诉我这居然是个音频文件，我一直以为是脱壳没脱干净……

字符串也需要重新指定范围。

导入了一些 vc 相关的 sig，然后重命名了几个`std::string`函数，得到了反汇编代码。这一路不容易，每一步都卡了一段时间，感谢 gemini 的帮助。

1. 输入总长度为 26，格式为 `AAA{21位字符}`；
2. 提取出中间 21 个字符进行标准 Base64 编码，得到 28 个字符；
3. 将这 28 个字符以 14 字节为界分为两半并前后对调：`part2 (14字节) + part1 (14字节)`；
4. 对对调后的字符串前 26 字节进行双字节交替异或（偶数位 \\(\\oplus\\ \\text{0x4C}\\)，奇数位 \\(\\oplus\\ \\text{0x63}\\)）；
5. 与栈上组装的固定密文比对，一致则通关。

这里能看到编译器把 dword 和 strcmp 进行了优化（？），将七个 dword 的前四个合成了一个 xmmword，使用了相关的向量指令。中间插入了循环计数器的赋值，可能是在优化流水线。

## 逆向求解

Editor (session: xiemen)Run

```
import base64
import struct

xmmword_2F1830 = 0x272F1B190D162C203415147535162A1E
v46 = 0x35290B0A
v47 = 0x3B2D1B74
v48 = 0x33580B02

xmm_bytes = xmmword_2F1830.to_bytes(16, byteorder='little')
ints_bytes = struct.pack('<3I', v46, v47, v48)  # < 表示小端序，3I表示三个无符号整数
raw_target = xmm_bytes + ints_bytes             # 共 28 字节

# 前 26 字节进行异或解密 (末尾 2 字节未加密)
swapped_bytes = bytearray()
for i, byte in enumerate(raw_target):
    if i < 26:
        key = 0x4C if (i % 2 == 0) else 0x63
        swapped_bytes.append(byte ^ key)
    else:
        swapped_bytes.append(byte)

swapped_b64 = swapped_bytes.decode()

original_b64 = swapped_b64[14:] + swapped_b64[:14]

answer = base64.b64decode(original_b64).decode()
flag = f"AAA{{{answer}}}"
print(flag)
```

OutputClear

```
```
