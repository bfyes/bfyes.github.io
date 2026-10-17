# apk02：让屏幕显示出那句话

题目给的是个 Android 应用：输入 password，让屏幕显示出「鎏金哇卡呀库列」。flag 格式是 `AAA{password}`。

附件 `apk02.apk` 1,495,763 字节（md5 `5fbbdec9eb65fcc35f2b63b7e455de14`），里面业务代码只有一个 `classes.dex`，2,338,132 字节。

## 应用里有什么

`unzip` 之后翻 dex 字符串表，跟包名 `leadroyal.aaa.com.apk02` 相关的类只有三个：

- `Lleadroyal/aaa/com/apk02/MainActivity;`
- `Lleadroyal/aaa/com/apk02/MainActivity$1;`
- 一堆 `R$***` 和 `BuildConfig`

没有第二个 Activity，逻辑全在 `MainActivity` 和它的匿名内部类里。

## 校验逻辑

按钮点击走 `MainActivity$1.onClick` → `access$000`（编译器生成的桥接）→ `MainActivity.check(String)`。循环那段反汇编：

```smali
loc_128B92:
    const/4             v7, 0
    if-ge               i, len, loc_128BDC
    add-int/lit8        v0, i, 2
    invoke-virtual      {s, i, v0}, String.substring(int, int)
    invoke-static       {v0}, Integer.parseInt(ref)
    move-result         v10                     # tp
    iget-object         v1, this, MainActivity_a
    aget-char           v1, v1, tp              # a[tp]
    # StringBuilder 拼接 result
    add-int/lit8        i, i, 2
    goto                loc_128B94
```

翻译成 Java：

```java
void check(String s) {
    String result = "";
    int len = s.length();
    if (len % 2 != 0) {                              // 长度必须偶数
        show.setText("Input Error");
        return;
    }
    for (int i = 0; i < len; i += 2) {
        int tp = Integer.parseInt(s.substring(i, i + 2));   // 两位十进制 → 下标
        result = new StringBuilder(result).append(a[tp]).toString();
    }
    show.setText(result);                            // 先把拼出来的串显示出来
    if (result.equals("鎏金哇卡呀库列")) {
        show.append("\nCorrect!");
        pool.play(poolMap.get("win").intValue(), 1.0f, 1.0f, 0, 0, 1.0f);
    } else {
        show.append("\nFalse!");
        pool.play(poolMap.get("lose").intValue(), 1.0f, 1.0f, 0, 0, 1.0f);
    }
}
```

跟解题有关的几个点：

| 点 | 说明 |
| --- | --- |
| 输入单位 | 每次取两个字符，`Integer.parseInt` 按十进制解析，`"12"` 就是下标 12 |
| 下标范围 | `a` 只有 100 个元素，下标必须落在 0–99；越界直接崩（`tries_size = 0`，没有 try/catch） |
| 非数字 | `parseInt` 抛 `NumberFormatException`，同样崩 |
| 局部变量 | `result` 每次点击都从空串重来，不累积上一次的结果 |
| 音效 | win 播 `res/raw/kill.mp3`，lose 播 `res/raw/death.wma` |

## 那张 100 字的表

`a` 是 `char[100]`，由 `fill-array-data` 载荷填充。载荷头在文件偏移 `0x128a70`：`00 03 | 02 00 | 64 00 00 00`，也就是 ident `0x0300`、元素宽 2 字节、元素数 `0x64` = 100，数据从 `0x128a78` 开始，共 200 字节。

反汇编工具会把后半段合并成 `.int` 显示（一个 int 塞两个 UTF-16 码元，小端），按 int 读会看成乱码，按 short 读才对：

```text
 0 国  1 气  2 传  3 必  4 强  5 种  6 火  7 样  8 很  9 水
10 办 11 眼 12 鎏 13 了 14 为 15 机 16 围 17 够 18 今 19 讲
20 公 21 以 22 每 23 习 24 叔 25 提 26 读 27 关 28 破 29 吗
30 嘴 31 爱 32 位 33 动 34 金 35 再 36 何 37 候 38 岁 39 阶
40 军 41 报 42 义 43 夜 44 早 45 应 46 法 47 让 48 习 49 识
50 越 51 劳 52 开 53 哇 54 村 55 特 56 起 57 领 58 建 59 忽
60 库 61 何 62 工 63 道 64 息 65 展 66 收 67 找 68 观 69 道
70 相 71 带 72 每 73 好 74 劳 75 把 76 实 77 穿 78 带 79 呀
80 列 81 冲 82 作 83 体 84 样 85 直 86 卡 87 是 88 最 89 倒
90 话 91 师 92 底 93 头 94 车 95 紧 96 道 97 区 98 马 99 块
```

## 求 password

反过来查表：把目标串逐字在表里找位置（下标从 0 起），每个下标写成两位十进制（不足位补 `0`），按原顺序拼起来就是 password。

补零不能省。表里 100 个元素，下标 `7` 必须写成 `07`，写一位会让后面所有两字符的分组整体错位，拼出来的东西对不上。

表里有几个重复字（`何`、`道`、`每`、`带`、`样`、`劳`、`习`），都不在目标串里，不影响答案。

具体下标和拼出来的串就不写在这里了，按上面的方法查表即可。

## flag 格式不在 dex 里

`AAA{` 这个壳在 dex 里搜不到：整个 `classes.dex` 只有一条中文串（被判等的那句常量），既没有 `flag`，也没有 `AAA{`。

它写在**资源字符串**里。`resources.arsc` 全局字符串池第 364 条：

```text
LeadroyaL最近在玩守望py，玩着玩着就蹦出一句“鎏金哇卡呀库列”，请输入password，让屏幕显示出这句话。
flag格式为AAA{password}，password的最后9位是群号，做出来可以加群。
建议开启声音，password正确和错误的声音明显不一样。
```

这条资源的 id 是 `0x7f070016`，key 是 `over_watch`，被 `res/layout/activity_main.xml` 里最上面那个 TextView 的 `android:text` 引用。装到设备上跑一下，界面上就写着 flag 格式。

平台页面上的描述只留了第一句，后面两句被删掉、换成「本题flag不含群号」，所以在 dex 里翻完再猜 flag 格式会一直错。

顺手把界面文案一起取出来：

| 资源 id | 用途 | 值 |
| --- | --- | --- |
| `0x7f070014` | application label | `apk2` |
| `0x7f070015` | EditText hint | `输入密码` |
| `0x7f070016` | 顶部 TextView | 上面那段原文 |
| `0x7f070017` | `show` 初值 | `显示结果` |
| `0x7f070018` | Button text | `submit` |

EditText 的 `inputType = 0x02`（`TYPE_CLASS_NUMBER`），只能输数字。

## 结果

```text
password = 七个两位下标拼接（此处略）
flag     = AAA{password}
```

## 看着可疑、其实没用的几处

- `res/drawable/bg.jpg`：300×244 的源氏梗图，图上写的是「溜金哇开呀酷裂」+「竜人の剣を喰え～～～」，跟常量那句是同一个梗的不同谐音写法。`溜`、`酷`、`裂` 三个字不在表里（`酷` 在 dex 里 0 命中），图上的字没法用同一张表编码，也不是 flag。
- `res/raw/kill.mp3`：2.712 s、256 kbps、48 kHz，113 帧刚好排到文件末尾，没有附加数据，频谱是普通音效。ID3v2.3 里留着 TIT2 `5f51875c5620f04241ba0a810c22cd16`、TRCK `8538`、COMM 提到 LameXP，这些是音频来源本身带下来的转码残留，和题目里任何字符串、任何文件的 md5 都对不上。
- `res/raw/death.wma`：WMA 9.2，1.628 s，ASF header 里只有编码器信息，没有 Title/Author，尾部全 0。
- `ic_launcher.png`：5 个密度目录放的是同一张 133×140 图，就是那个 Q 版源氏。

## 踩坑清单

- flag 的壳是 `AAA{}`，不是 `flag{}`。课程文档里那句「flag 格式均为 `flag{XXX}`」是通用说明，这道题用作者自己的格式。
- flag 格式在 `resources.arsc` 的字符串资源里，dex 字符串表里没有。只翻 dex 会卡在「密码对了但不知道交什么」。
- 反汇编里那张表的后半段是 `.int` 形式，按 int 读是乱码，按 short（小端）读才对。
- 平台描述和 APK 里自带的题目原文不一致，原文那句「password 的最后 9 位是群号」正好解释了下标串尾部那段数字的来历。
