# 眼见为虚

更新了 IDA 9.5，很强，可以直接反汇编安卓的 dalvik 代码为 java，对安卓逆向十分友好。9.5 Beta 应该是 Oct 1, 2026 发布的，截止目前（2026.10.20），正式版本还没发。

```java
//----- (00070EFC) --------------------------------------------------------
public void onClick(View p0)
{
    TextView v2; // V0

    a.a_6 = new char[]
            {
              216, 102, 2, 205, 74, 60, 108, 221, 254, 84, 130, 4, 221, 144, 77, 214, 45, 70, 188, 115, 235, 168, 76, 192,
              254, 26, 55
            };
    v2 = (TextView)this.findViewById(2131427416);
    if ( new String(a.a((EditText)this.findViewById(2131427414).getText().toString().toCharArray())).equals(new String(new char[] { 185, 7, 99, 182, 62, 116, 93, 174, 161, 101, 241, 91, 179, 160, 57, 137, 107, 10, 253, 52, 180, 192, 45, 228, 161, 62, 74 })) )
    {
      v2.setText("success!");
    }
    else
    {
      v2.setText("fail");
    }
}

public class a
{
    static char[] a;
    //----- (000711D8) --------------------------------------------------------
    static char[] a(char[] p0)
    {
        char[] v1; // V1
        int i; // V0

        v1 = new char[p0.length];
        for ( i = 0; i < p0.length; ++i )
        v1[i] = (char)(p0[i] ^ a_6[i]);
        return (char[])v1;
    }
}
```

Editor (session: default)Run

```
a6 = [216, 102, 2, 205, 74, 60, 108, 221, 254, 84, 130, 4, 221, 144, 77, 214, 45, 70, 188, 115, 235, 168, 76, 192, 254, 26, 55]
target = [185, 7, 99, 182, 62, 116, 93, 174, 161, 101, 241, 91, 179, 160, 57, 137, 107, 10, 253, 52, 180, 192, 45, 228, 161, 62, 74]

plain = [chr(x ^ y) for x,y in zip(a6, target)]
print(''.join(plain))
```

OutputClear

```
```

真假 Activity。。实际上，正确的代码在 Acvitity。

由 `public native char[] getKeyFromJNI();` 可知，key 来自原生库。

> [!NOTE]
>
> **.so 文件**
>
> Java 中是函数声明，函数实现在 apk 里的 libcrack-lead.so。
>
> 直接搜索这个函数名 getKeyFromJNI，打开 key 的地址即可。

Editor (session: default)Run

```
key = [
    0xF8, 0x46, 0x22, 0xCD, 0x47, 0x1B, 0x28, 0xFC,
    0xFE, 0x0B, 0x9E, 0x2C, 0xEC, 0x96, 0x0F, 0xBF,
    0x5D, 0x3C, 0xA2, 0x05, 0xD8, 0xAC, 0x1C, 0xBA,
    0xFE, 0x60, 0x37
]
target = [185, 7, 99, 182, 62, 116, 93, 174, 161, 101, 241, 91, 179, 160, 57, 137, 107, 10, 253, 52, 180, 192, 45, 228, 161, 62, 74]

plain = [chr(t ^ k) for t,k in zip(target, key)]
print(''.join(plain))
```

OutputClear

```
```

我想确认程序的入口到底是不是 acvitity，不过看不到函数是谁 call 的，目前还没有合适的动态调试方法（等我探索一下虚拟机/远程调试？）

> [!NOTE]
>
> **upd：我搞了一个安卓虚拟机！不过我发现输入错误的 flag 会输出 success，正确的反而会 fail？**
>
> ~~apk 压缩包里的 xml 文件中写出了 LAUNCHER。~~
>
> 以下内容具有较高的 ai 浓度。
>
> ```xml
> <activity android:name="leadroyal.aaa.com.apk04.MainActivity">   ← 带 MAIN + LAUNCHER
> <activity android:name="leadroyal.aaa.com.apk04.MainAcvitity"/>  ← 自闭合，没有 intent-filter
> ```
>
> 挂了桌面启动入口的是拼写正常的 `MainActivity`；另一个 `MainAcvitity` 拼错了，标签自闭合，没有任何入口声明，点图标进不去，只能用命令显式拉起。
>
> 实际跑的是前一条，输入后一条自然 fail，反倒是那句自称不是 flag 的串拿到 success。
