# you need python3

题目包含以下文件。

- `key_is_here_but_do_you_know_rfc_released_on_1_April_2005`
- `flag.py`

分别对应前两个部分。

## RFC 4042 与 UTF-9

文件名`rfc_released_on_1_April_2005`。

在 2005 年 4 月 1 日（愚人节），IETF 发布了知名的愚人节 RFC（Request for Comments, 请求意见稿）——[RFC 4042](<https://www.rfc-editor.org/info/rfc4042/>)。该 RFC 描述了一种名为 UTF-9 的 Unicode 转换格式。

该文件内容正是采用 UTF-9 编码的文本，要转化为 UTF-8，截断最高 bit 即可。

Editor (session: you\_need\_python)Run

```
import pyodide.http

resp = await pyodide.http.pyfetch("../python.assets/key_is_here_but_do_you_know_rfc_released_on_1_April_2005.bin") # 加个后缀否则会识别为目录
raw = await resp.bytes()

def utf9_decode(data: bytes) -> str:
    bits = "".join(f"{byte:08b}" for byte in data)  # f"{b:08b}" 将 b 转为二进制，不足 8 位补 0
    out = bytearray()                               # bytearray 可变字节数组
    for i in range(0, len(bits) - 8, 9):            # range(start, stop, step)
        out.append(int(bits[i + 1:i + 9], 2))       # 二进制转十进制
    return out.decode("utf-8")

text = utf9_decode(raw)
print(text)

key = text.split('Key:')[1].splitlines()[0].strip()
```

OutputClear

```
```

《The Zen of Python》，感觉放在当下也是有指导意义的。其中藏了 key。

> `Readability counts. Key: PD6ZhYgI`

## marshal 字节码

> [!NOTE]
>
> **什么是 marshal？**

运行这个代码，报错提示为 `SystemError: Objects/codeobject.c:465: bad argument to internal function`。

正如上图所示，这是版本之间不兼容导致的。

[https://www.decompiler.com](<https://www.decompiler.com>)，这是大模型推荐给我的在线反编译网站，试了一下那个 .NET 矩阵题，发现很强，是个好东西，值得探索。

如图，没有文件头无法反编译。分别尝试各个版本......

该字节码生成于 **Python 3.5**。

`cipherText = '-136-166-162-186-155-142-159-163-168-188-191-147-148-133-117-130-147-118-121-172-140-137-169-103-140-173-156-174-90-130-103-87-266-121-229-183-181-144-153-201-190-216-198-139-106'`

## 逆向求解 Flag

> [!CAUTION]
>
> **尚未理解**

因为加密过程中第 `i` 位仅取决于明文当前字符 `plain[i]` 以及前缀 `plain[:i]` 产生的状态 `intmd5`：

\\\[r\[i\] = \\text{ord}(\\text{plain}\[i\]) + \\text{int}(\\text{keymd5}\[i \\% 32\], 16) - \\text{intmd5}\\\]

因此只需将公式变形即可顺序逐位逆推出原字符：

\\\[\\text{ord}(\\text{plain}\[i\]) = r\[i\] + \\text{intmd5} - \\text{int}(\\text{keymd5}\[i \\% 32\], 16)\\\]

每还原出一个字符后，即可同步更新 `intmd5` 状态进入下一轮。

Editor (session: you\_need\_python)Run

```
import hashlib

cipherText = "-136-166-162-186-155-142-159-163-168-188-191-147-148-133-117-130-147-118-121-172-140-137-169-103-140-173-156-174-90-130-103-87-266-121-229-183-181-144-153-201-190-216-198-139-106"
nums = [-int(x) for x in cipherText.split("-") if x]

def md5(s: str) -> str:
    return hashlib.md5(s.encode("utf-8")).hexdigest()

def calc(strmd5: str) -> int:
    return sum(int(c, 16) for c in strmd5)

keymd5 = md5(key)
intmd5 = calc(keymd5)
plain = ""

for i, val in enumerate(nums):
    k_digit = int(keymd5[i % 32], 16)
    plain += chr(val + intmd5 - k_digit)
    intmd5 = calc(md5(plain[:i + 1])[:17] + md5(str(intmd5))[:17])

print(plain)
```

OutputClear

```
```
