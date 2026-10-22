# Stack Mess

AAA{n0.1\_5Uru1u35} 根据逆向和实际运行测试，flag 的格式比较固定，只是"n0."后面的数字随着输入变化，数字过大会卡死，正如网站中的“炸栈”。

断点打在`CODE:000EA57A const-string v3, aTheFlagIsAaaN0 # "The flag is AAA{n0."`，输入999999，然后断住，查看 Call Stack。

> 注意题面上的“有投机取巧的办法”，后面会考。

> 实际上，这个函数就在上面 500 行左右。。奈何没有超绝注意力。。

IDA 9.5 Beta 拥有强大的反汇编。

```java
private int MainActivity.d(int p0) {
    int v2;  // V1 这里需要手动修改一下 v2 的识别类型
    int i;   // V0
    int[] y; // V0
// 其中 v2 是状态机，y 是计数器数组（实际上只用到了y[0]），u是主栈，v是暂存栈，w 是轮次计数器
    this.w = 0;
    this.u.clear();
    this.v.clear();
    v2 = 0;
    while (true) {
        switch (v2) {
        case 0: // 初始化。p0 到 0 全部压栈
            for (i = p0; i >= 0; --i) this.u.push(Integer.valueOf(a1: i));
            v2 = 1;
            continue;
        case 1: // 压哨兵2333，除了它，栈里只剩一个就结束
            this.u.push(Integer.valueOf(a1: 2333));
            if (this.u.size() == 2) v2 = 2;
            else {
                this.u.pop();
                if (this.w < this.u.size()) {
LABEL_11:
                    this.u.push(Integer.valueOf(a1: 0)); // push 0 又 pop 了，何操作
                    if (this.y[(Integer)this.u.pop().intValue()] < this.w) { // 只是想用 y[0] 了
                        this.x = (Integer)this.u.pop().intValue();
                        this.v.push(Integer.valueOf(a1: this.x));
                        y = this.y;
                        ++y[0];
                        v2 = 4; // goto LABEL_11; 继续
                    }
                    else v2 = 5; // 清掉
                }
                else {
                    this.w -= this.u.size(); // 减法取模
                    v2 = 1;
                }
            }
            break;
        case 2: // 去掉哨兵2333，返回，结束
            this.u.pop();
            Toast.makeText(a1: this, a2: "Run Done", a3: 0).show();
            return (Integer)this.u.pop().intValue();
        case 4: // 回到 LABEL_11 接着取下一个
            goto LABEL_11;
        case 5: // 计数清零，扔掉一个出列的，567是一套小连招
            v2 = 6;
            this.v.push(Integer.valueOf(a1: 0));
            this.y[(Integer)this.v.pop().intValue()] = 0;
            this.u.pop();
        case 6: // 剩下的元素倒进 v 暂存
            if (this.u.empty()) v2 = 7;
            else this.v.push(this.u.pop());
            break;
        case 7: // v 再倒回 u，一轮结束、轮次加一
            if (this.v.isEmpty()) {
                ++this.w; // w++，跳过的部分每次加一，w++ 才能抵消
                v2 = 1;
            }
            else {
                this.x = (Integer)this.v.pop().intValue();
                this.u.push(Integer.valueOf(a1: this.x));
            }
            break;
        }
    }
}
```

看了一小时左右，我终于彻底理解这个状态机了。

等效 C 代码

```c
int d(int n)
{
    int r = 0;
    for (int i = 2; i <= n; i++)
        r = (r + 2) % i;
    return r + 1;
}
```

实际上是 k=2 的约瑟夫环（n 个人围成圈，数到 2 出列，最后剩下的人）。

Editor (session: default)Run

```
def josephus(n, k=2):
    r = 0
    for i in range(2, n + 1):
        r = (r + k) % i
    return r + 1
n = 999999
print(f"AAA{{n0.{josephus(n)}_5Uru1u35}}")
```

OutputClear

```
```

> “有投机取巧的办法”，我把输入 1-6 和 100 的输出结果喂给 ai，ai 直接找出来规律了，所以之前在“走弯路”吗...

后来不知道在哪里按了反汇编，结果直接把 IDA 卡死了，这也是炸栈的一环吗。。
