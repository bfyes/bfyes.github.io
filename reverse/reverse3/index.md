# Reverse3

先用 ida 静态分析，可以观察到格式基本的要求。

可以看到是 Microsoft.Net assembly，尝试采用x64dbg打开，结果可读性极低（硬控我一个小时，愣是没读明白一点）。只好寻求外援了。

使用 dnSpy 可以反编译出 C\# 代码。

```csharp
// Matrix_Int.Program
private static void Main(string[] args) {
    Console.Write("请输入Flag: ");
    string text = Console.ReadLine();
    try {
        if (text.Length != 36) {
            throw new Exception("长度错误！");
        }
        if (!text.StartsWith("AAA{") || !text.EndsWith("}")) {
            throw new Exception("格式错误！");
        }

        // 18~34，17 个字符
        char c = '\0';
        byte[] array = new byte[17];
        foreach (char c2 in text.Substring(18, 17)) {
            if (c2 > '\u007f') {
                throw new Exception("不对啊！");
            }
            c ^= c2;
        }
        for (int j = 0; j < 17; j++) {
            array[j] = (byte)(c ^ text[18 + j]);
        }
        if (Convert.ToBase64String(array) != "d3l5d3ldRncbEB4fER4YEBg=") {
            throw new Exception("不对啊！");
        }

        // 4~17，14 个字符，按列填成 14×1 矩阵
        int[,] array2 = new int[14, 1];
        for (int k = 0; k < 14; k++) {
            if (text[k + 4] > '\u007f') {
                throw new Exception("不对啊！");
            }
            array2[k, 0] = (int)text[k + 4];
        }

        Matrix rhs = new Matrix(array2);
        int[,] target = new int[,] {
            { 45 }, { 77 }, { 7 },  { 109 }, { 112 }, { 98 }, { 11 },
            { 14 }, { 70 }, { 77 }, { 16 },  { 26 },  { 1 },  { 106 }
        };
        if (Program.GetSquare() * rhs != new Matrix(target)) {
            throw new Exception("不对啊！");
        }

        Console.WriteLine("恭喜你，答案正确！");
    }
    catch (Exception ex) {
        Console.WriteLine(ex.Message);
    }
    Console.ReadKey();
}
```

先大力出奇迹，然后再验证 c 算出来是不是那个正在被尝试的 c。

Editor (session: reverse3)Run

```
import base64

data = base64.b64decode('d3l5d3ldRncbEB4fER4YEBg=')

for key in range(128):
    cand = bytes(v ^ key for v in data).decode()
    chk = 0
    for ch in cand:
        chk ^= ord(ch)
    if chk == key:
        print(hex(key), cand)
```

OutputClear

```
```

？！诶诶！？

> [!NOTE]
>
> **怎么没筛选掉？**
>
> 原代码先算 `c = text[18] ⊕ … ⊕ text[34]`，再令 `array[j] = c ⊕ text[18 + j]`（`j` 从 0 到 16）。
>
> 1. base64 常量是固定的，反解出 `array` 的 17 个字节；异或自逆，于是 `text[18 + j] = c ⊕ array[j]`。
> 2. 把这一步代回 `c` 的定义：`c = ⊕(c ⊕ array[j])`。
> 3. 17 是奇数，右边展开后 `c` 一共出现 17 次，异或起来还是 `c`，剩下的就是 `⊕ array[j]`，即 `c = XOR(array) ⊕ c`。
> 4. 两边消掉 `c`，条件只剩 `XOR(array) == 0`，已经和 `c` 无关。而 `array` 本来就是某个候选串按同样方式变出来的，这个等式恒成立。
>
> 所以校验对 `c` 没有任何约束，只限制 `c ≤ 127`。

靠可读性来筛选吧。

Editor (session: reverse3)Run

```
# data 是上一个块里的 base64 字节
# 假设可读定义为数字字母下划线
for key in range(128):
    cand = bytes(v ^ key for v in data).decode()
    if cand.replace('_', '').isalnum():
        print(hex(key), cand)
        tail = cand
```

OutputClear

```
```

剩下 14 个字符由矩阵部分给出。

`GetSquare()` 把《红楼梦》酒令用 `BinaryFormatter` 序列化。（BinaryFormatter 是 .NET Framework 的运行时功能，它按 `MS-NRBF` 格式把对象写成字节流，最后得到 195 字节的一维字节流，不是矩阵）

再按 `Square[i, j] = bytes[(7 * (i + 14 * j)) % 195] % 127` 填成 14×14。195 是序列化流的总长度，17 字节头 + `BinaryObjectString`（1 + 4 + 2 + 170）+ 1 字节 `MessageEnd(0x0B)`。

`Matrix` 类的 `Modulus` 是 127，`op_Multiply` 每一步都取余，所以要解的是 mod 127 下的 `A·x ≡ b`。

> [!CAUTION]
>
> **线性代数还在追杀我**
>
> 求一组 `x`，使 `A · x = b`。做法是把 `A` 和 `b` 拼成增广矩阵 `[A | b]`，用行变换把左边化成单位阵，`[A | b]` 就变成 `[I | x]`，右边就是解。

Editor (session: reverse3)Run

```
def nrbf_string(s):
    """BinaryFormatter 序列化结果当作线性字节池"""
    def i32(n):
        return n.to_bytes(4, 'little', signed=True)
    raw = s.encode()        # 本题 170 字节，长度字段按两字节写
    return (b'\x00' + i32(1) + i32(-1) + i32(1) + i32(0) + b'\x06' + i32(1)
            + bytes([len(raw) & 0x7f | 0x80, len(raw) >> 7]) + raw + b'\x0b')

poem = '女儿悲，青春已大守空闺。\n女儿愁，悔教夫婿觅封侯。\n女儿喜，对镜晨妆颜色美。\n女儿乐，秋千架上春衫薄。\n\t——《红楼梦》'
blob = nrbf_string(poem)
print('序列化流长度', len(blob))

MOD, N = 127, 14
A = [[blob[(7 * (i + 14 * j)) % 195] % MOD for j in range(N)] for i in range(N)]
```

OutputClear

```
```

`A` 建好后，把常量向量拼进增广矩阵，在 `Z_127` 里做高斯消元。

Editor (session: reverse3)Run

```
target = [45, 77, 7, 109, 112, 98, 11, 14, 70, 77, 16, 26, 1, 106]

# 模 127 高斯消元
aug = [A[i] + [target[i]] for i in range(N)]
for col in range(N):
    piv = next(row for row in range(col, N) if aug[row][col])
    aug[col], aug[piv] = aug[piv], aug[col]
    inv = pow(aug[col][col], MOD - 2, MOD)
    aug[col] = [v * inv % MOD for v in aug[col]]
    for row in range(N):
        if row != col and aug[row][col]:
            factor = aug[row][col]
            aug[row] = [(a - factor * bb) % MOD for a, bb in zip(aug[row], aug[col])]

mid = ''.join(chr(aug[i][N]) for i in range(N))
print(mid)
print(f'AAA{{{mid}{tail}}}')
```

OutputClear

```
```
