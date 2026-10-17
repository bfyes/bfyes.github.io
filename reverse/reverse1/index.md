# Reverse1

## IDA 的基本操作

| 按键 | 功能 |
| --- | --- |
| F5 | 生成 / 打开反编译 |
| Space | Graph view / Text view切换 |
| X | 交叉引用窗口（xref，cross reference） |
| G | 跳转到指定地址（Go to address） |
| A | 将当前地址解析为 ASCII 字符串 |
| C | 解析为代码（Code） |
| D | 解析为数据，循环切换 db/dw/dd 等数据类型 |
| ; | 注释（repeatable） |
| : | 注释 |
| N | 重命名函数、变量、标签等 |
| Enter | 跳转到函数 |
| Esc | 返回上一层函数 |

> 补充：Graph view 模式下，可以按住 ctrl + 滚轮缩放；以mac为例，ida的视图缩放快捷键：<kbd class="key-command">Cmd</kbd>\+<kbd class="key-shift">Shift</kbd>\+<kbd>+</kbd>，<kbd class="key-command">Cmd</kbd>\+<kbd>-</kbd>。

## 静态分析

掌握了 IDA 的基本操作，即可进行简单的静态分析。以 [Reverse1](<https://zjusec.com/challenges/26>) 为例，通过静态分析可以获取答案。

IDA 有特征库，已经成功识别了 `_printf()` 等库函数，大大降低了阅读难度。

Editor (session: reverse1)Run

```
data = [
    0x4D, 0x4D, 0x4D, 0x77, 0x6A, 0x61, 0x75, 0x60, 
    0x53, 0x5D, 0x5D, 0x53, 0x7D, 0x79, 0x62, 0x53, 
    0x3F, 0x34, 0x3A, 0x3B, 0x35, 0x3A, 0x3C, 0x34, 
    0x3C, 0x71,
]
print(bytes(data).decode()) # 点击 run 来写入 data，在第二个块中可以继续运行。
```

OutputClear

```
```

情况似乎比较明朗，打开即可看到疑似异或/凯撒密码加密过的flag（因为MMM太容易让人联想到AAA），在程序运行时动态加载到栈中。

查看代码可知采用了异或加密，循环部分为按位检测，然后分别有两个跳出的分支，为成功或失败。

根据逆向结果，将每一位与0Ch做异或即可。

Editor (session: reverse1)Run

```
# 先点击第一个块的 run 来写入 data，然后再点击第二个块的 run 来运行下面的代码。
flag = "".join(chr(b ^ 0x0C) for b in data)
print(flag)
```

OutputClear

```
```
