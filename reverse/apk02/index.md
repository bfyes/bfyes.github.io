# apk02 守望起来

关键代码如上图。smali 汇编代码需要一段时间来熟悉。

整体的逻辑是，将取出的字符串拼接到 result 中，然后与汉字字符串比较。

校验通过 `CODE:00128BBE   iget-object  v1, this, MainActivity_a` 来根据下标取出字符串。

```asm
FIELDS:000267C8 # char[] leadroyal.aaa.com.apk02.MainActivity.a
FIELDS:000267C8 MainActivity_a: .short 0x7F2            # class_idx
FIELDS:000267C8                                         # DATA XREF: MainActivity__init_@V+14↓r
FIELDS:000267C8                                         # MainActivity_check@VL+56↓r
FIELDS:000267CA                 .short 0x809            # type_or_proto_idx
FIELDS:000267CC                 .int 0x19C9             # name_idx
```

进入交叉引用 DATA XREF: MainActivity\_\_init\_@V+14↓r

> [!CAUTION]
>
> **我点击了.short 0x7F2**
>
> 分别点击了.short 0x7F2，.short 0x809，.int 0x19C9，他们跳转到了同一个位置，此时我以为稳了。结果我在这里困了很长时间。
>
> 他们直接跳转到了`STR_IDS:00000070 # String ids`，这是因为恰好落在了 string\_ids 表里。（IDA 把所有十六进制常量都当成可跳转地址）
>
> 正确的方法应该根据这三个数据算出地址，不过 ida 的交叉引用点进去是“用静态数据块填充数组v0，然后给实例赋值（见下图）”，通过`fill-array-data v0, arraydata_128A70`也可以很快定位到。

将汉字字符串转为 dd 后取对应的下标即可推出字符串。截图中，前50个字符串用 short 表示，后50个字符串用 int 表示。

逆向脚本通过目标来取下标。

Editor (session: default)Run

```
words = [
    0x56FD, 0x6C14, 0x4F20, 0x5FC5, 0x5F3A, 0x79CD,
    0x706B, 0x6837, 0x5F88, 0x6C34, 0x529E, 0x773C,
    0x938F, 0x4E86, 0x4E3A, 0x673A, 0x56F4, 0x591F,
    0x4ECA, 0x8BB2, 0x516C, 0x4EE5, 0x6BCF, 0x4E60,
    0x53D4, 0x63D0, 0x8BFB, 0x5173, 0x7834, 0x5417,
    0x5634, 0x7231, 0x4F4D, 0x52A8, 0x91D1, 0x518D,
    0x4F55, 0x5019, 0x5C81, 0x9636, 0x519B, 0x62A5,
    0x4E49, 0x591C, 0x65E9, 0x5E94, 0x6CD5, 0x8BA9,
    0x4E60, 0x8BC6, 
    0x8D8A, 0x52B3, 0x5F00, 0x54C7, 0x6751, 0x7279, # 注意小端
    0x8D77, 0x9886, 0x5EFA, 0x5FFD, 0x5E93, 0x4F55,
    0x5DE5, 0x9053, 0x606F, 0x5C55, 0x6536, 0x627E,
    0x89C2, 0x9053, 0x76F8, 0x5E26, 0x6BCF, 0x597D,
    0x52B3, 0x628A, 0x5B9E, 0x7A7F, 0x5E26, 0x5440,
    0x5217, 0x51B2, 0x4F5C, 0x4F53, 0x6837, 0x76F4,
    0x5361, 0x662F, 0x6700, 0x5012, 0x8BDD, 0x5E08,
    0x5E95, 0x5934, 0x8F66, 0x7D27, 0x9053, 0x533A,
    0x9A6C, 0x5757,
]

table = ''.join(chr(w) for w in words)
code = ''.join('%02d' % table.index(ch) for ch in '鎏金哇卡呀库列')
print('AAA{%s}' % code)
```

OutputClear

```
```

<mark><strong>《本题flag不含群号》</strong></mark>

~~这东西好像是来捣乱的。。。走了不少弯路。。~~

> [!NOTE]
>
> **关于 flag 格式**
>
> > **我搞了一个安卓虚拟机，这回可以更直观的看到了**
>
> 可以根据 apk 包里的 `resources.arsc` 中的信息确定。当然我感觉出题者是希望把这个包安装在安卓环境的，这样可以直观看出来，不过这次是纯静态分析了。
