# Windows XP on Apple Silicon Mac

> 本文为配置记录，部署方法见以下链接[[点击跳转](xp_1.md)]。

---

<span style="font-size:1.2em; color:#808080;">**更新日志**</span>

=== "2026-07-16"
    迁移并拆分文章；优化可读性

=== "2026-04-14"
    排版优化；修改若干错别字

=== "2026-03-31"
    梳理文章流程

=== "2026-03-30"
    排版优化；修改若干错别字；增加部分内容

=== "2026-03-28"
    新增章节：打包虚拟机文件、从 .utm 文件夹部署；增补压缩方案

=== "2026-03-27"
    补充硬件设置；添加 Xftp5 中文文件夹乱码的解决方法

=== "2026-03-26"
    完善文章框架和步骤

---

这篇文章技术含量不高，只是略微折腾。安装过程和原理都算不上麻烦，但当初前前后后摸索了近两周才试验出令人满意的方案。所以在这里把方法总结出来，方便感兴趣的同学复现。

另：汇编语言课程的 UTM 虚拟机文件可以在老师的主页上查询。  

- 环境：macOS 26.4.1；网页构建工具：Zensical。

> 文章偏记录向，流程为主，原理为辅。


## 概况

### 适用场景

VMware 磁盘文件(.vmdk) **迁移** 至 macOS 中的 UTM + **双向文件传输** 解决方案。

!!! warning
    该方案暂不支持 ***剪贴板双向同步***，目前尚未找到合适的方案。

### 基础信息

- 源文件：VMware 虚拟机（.vmx 配置文件 + .vmdk 虚拟磁盘）。

- 目标平台：macOS + UTM 虚拟机。

- 核心问题：
    - 从老师的网站上下载的专供 VMware 虚拟机的磁盘文件和配置无法直接在 UTM 中打开。
    - 强制转换后，引导丢失，无法进入系统。
    - Windows XP 老旧系统，SPICE 工具不兼容，原生共享失效。

- 最终方案：Xftp 5（已经内置在老师给的 XP 系统中）+ macOS 内置 SFTP（基于 SSH 远程登录），提供稳定可靠的双向文件传输。

## 部署流程

（对应只有vmdk文件的情况）

### VMware 磁盘格式转换

（vmdk $\rightarrow$ qcow2）

Mac 平台上的 VMware Fusion 并不支持跨架构虚拟化，必须用 UTM 中的“模拟”。

> UTM（全称 Universal Turing Machine）是一款 **全功能开源虚拟机管理器**，由 Turing Software 开发，核心基于 QEMU（快速模拟器）后端，提供友好的图形用户界面，让普通用户无需复杂命令即可轻松创建和管理虚拟机。它的独特优势在于同时支持 **硬件虚拟化**（利用 CPU 硬件加速，性能接近原生）和 **软件模拟**（兼容老旧或非主流架构，如 x86 在 ARM 上运行）两种模式，覆盖从现代操作系统到复古系统的广泛需求。

关于 UTM 的下载，请访问 <https://mac.getutm.app>。

??? note "虚拟化vs模拟"
    <img src="xp.assets/1Capture%202026-03-26%2012.17.32.png" alt="1Capture 2026-03-26 12.17.32" style="display: block; margin: 0 auto; zoom: 33%;" />

    <br>
    
    | 对比项 | 虚拟化 | 模拟 |
    | :--- | :--- | :--- |
    | **核心** | 硬件辅助，直接复用CPU指令集 | 纯软件翻译指令，完整重建硬件环境 |
    | **性能** | 接近原生，高效 | 损耗大，速度较慢 |
    | **架构** | 同架构运行（如x86→x86） | 跨架构兼容（如ARM运行x86） |
    | **场景** | 现代系统高效部署 | 老旧系统、跨平台调试、复古环境 |
    | **工具** | VMware、Parallels | QEMU（软件模式）、UTM模拟模式 |


UTM 不支持直接导入 VMware 格式，必须转换为 qcow2

!!! info "转换方法"

    === "step 3.1.1"
        (1/3) 安装转换工具：

        ```bash
        brew install qemu
        ```

    === "step 3.1.2"
        (2/3) 执行转换命令：

        ```bash
        qemu-img convert -f vmdk -O qcow2 你的虚拟机文件路径.vmdk 输出文件路径.qcow2
        # 如：qemu-img convert -f vmdk -O qcow2 ~/Downloads/xp.vmdk ~/Downloads/xp.qcow2
        ```

    === "step 3.1.3"
        (3/3) 完成验证：得到可被 UTM 直接导入的 .qcow2 磁盘文件，大小应与vmdk文件类似。

        > 笔者实测 qcow2 文件的大小要略微小于vmdk



### UTM 部署 XP 虚拟机

1. 打开 UTM → 新建虚拟机 → `从 UTM 库中下载预构建虚拟机...`

2. 此时会跳转到utm的链接<https://mac.getutm.app/gallery/>，向下拉选择Windows XP (x86)。或者直接点击该链接<https://mac.getutm.app/gallery/windows-xp>。

3. 下载对应文件，解压得到`Windows XP.utm`。

    > 需要连接GitHub，如果无法下载可以考虑使用代理。

4. 加载转换完成的 qcow2 文件：右键刚下载的`.utm`文件，选择“显示包内容”，打开Images文件夹，将内部的磁盘文件用转换好的 qcow2 文件替换，**注意名称要相同**（笔者的是`disk-0.qcow2` ），如果不同或采用在硬件配置时重新定义的方式，后续有概率出现蓝屏的问题，目前没找出原因。

    <img src="xp.assets/1Capture%202026-03-24%2023.09.01.png" alt="1Capture 2026-03-24 23.09.01" style="display: block; margin: 0 auto;" />

5. Windows XP 硬件配置：

    双击`.utm`文件，该虚拟机会自动挂载到 UTM 软件上。点击右上角的“配置”图标。

    <img src="xp.assets/1Capture%202026-03-26%2013.38.10.png" alt="1Capture 2026-03-26 13.38.10" style="display: block; margin: 0 auto; zoom:50%;" />

    - 内存建议：512MB - 2GB。

    - CPU：不超过2核心，建议保持默认(Standard PC (i440FX + PIIX, 1996) (alias of pc-i440fx-10.0)(pc))。

    > 建议不要改动 CPU 型号，测试发现可能会引发蓝屏。

    - 网络等：已自动配置好。

    - **[重要]驱动器**

    !!! note
        启动顺序的首位默认的是`disk-0.qcow2`，请下载Windows XP Professional SP3的镜像文件，**并把下载好的iso镜像放在启动顺序的第一位。**

        - 下面给出了笔者安装时的资源（可以用迅雷等打开。） 
        （注意：非官方资源，请自行甄别。也可从老师主页上的链接下载。）

        ```http
        ed2k://|file|zh-hans_windows_xp_professional_with_service_pack_3_x86_cd_vl_x14-74070.iso|630237184|EC51916C9D9B8B931195EE0D6EE9B40E|/
        ```

    **下载 ISO 本质上是从 ISO 恢复 XP 系统**

6. 启动虚拟机，在弹出提示（Press any key to boot From CD/DVD...）后立刻按下**Enter**（从光盘执行引导）。
    
    > 以下步骤说明如何安装，每一步都有配图，如未加载请尝试刷新。
    === "step 1" 
        (1/4) 当屏幕显示“ Windows XP Professional 安装程序，欢迎使用安装程序”信息时，再次按下**Enter**。（现在安装Windows XP）
    
        <img src="xp.assets/1Capture%202026-03-25%2012.59.01.png" alt="1Capture 2026-03-25 12.59.01" style="display: block; margin: 0 auto;" />

    === "step 2"
        (2/4) 随后安装程序会自动扫描环境，识别到 qcow2 文件后会弹出选项，是否修复安装，此时选择修复（R）即可。

        <img src="xp.assets/1Capture%202026-03-08%2010.38.57.png" alt="1Capture 2026-03-08 10.38.57" style="display: block; margin: 0 auto;" />

    === "step 3"
        (3/4) 等待大约10分钟后需要输入`MRX3F-47B9T-2487J-KWKMF-RPWBY` (Windows XP SP3批量密钥，仅供参考)。

        <img src="xp.assets/豆包%202026-03-08%2011.17.37.png" alt="豆包 2026-03-08 11.17.37" style="display: block; margin: 0 auto;" />

    === "step 4"
        (4/4) 继续等待约10分钟后即可成功进入桌面！你可以自由调整分辨率和壁纸了。

        <img src="xp.assets/1Capture%202026-03-26%2014.02.47.png" alt="1Capture 2026-03-26 14.02.47" style="display: block; margin: 0 auto; zoom: 25%;" />

??? info "SPICE Guest Tools 折腾记录（放弃）"

    **尝试目标**

    实现文件拖拽、剪贴板同步、文件夹共享

    **报错内容**

    1. qga-vss.dll 加载失败：新版 QEMU 组件依赖 Vista 及以上系统 API，Windows XP 无对应接口
    2. spice-webdavd 服务无法启动：2.4 及以上版本放弃对 Windows XP 的支持

    **补救尝试**

    - 降级安装 spice-webdavd 2.2 版本
    - 安装 WebDAV 补丁 KB907306
    - 修改 WebDAV 端口为 80
    *依旧失败*

    **结果**

    - UTM 两种共享模式（SPICE WebDAV / VirtFS）均在 XP 上失效
    - WebDAV 无法访问、文件夹无效
    - 经过两周的尝试，决定放弃 UTM 原生共享功能。

    相关 issue：<https://github.com/utmapp/UTM/issues/3998>

### Xftp 5 + SFTP

最终互通方案: Xftp 5 + SFTP

#### 方案优势

- 兼容 Windows XP
- 加密传输
- 双向拖拽操作，简单易用
- 断网可用（虚拟机内网独立传输）
- 不依赖 XP 系统组件

#### macOS 端配置

1. 系统设置 → 通用 → 共享 → 开启「远程登录」

    > 保护好账号密码，以防泄漏！

2. 查看内网 IP 地址：

    ```bash
    ifconfig | grep inet
    ```

    <img src="xp.assets/1Capture%202026-03-26%2014.09.58.png" alt="1Capture 2026-03-26 14.09.58" style="display: block; margin: 0 auto;" />

    得到并记住该地址。（高亮部分）

#### XP 端配置

（Xftp 5）

1. 安装 Xftp 5（如果你是汇编的课友，该软件的快捷方式已经在桌面上，直接打开即可。）

2. 新建 SFTP 会话参数
    - 名称：任意名称
    - 主机：上一部分得到的的地址
    - 协议：SFTP
    - 端口：22
    - 用户名：macOS 登录账号名称（如果不知道，请按电源键并重新登陆，屏幕上的名字即为账号名称）
    - 密码：macOS 登录密码

3. 首次连接点击 Accept and Save 保存密钥

    <img src="xp.assets/1Capture%202026-03-26%2011.06.44.png" alt="1Capture 2026-03-26 11.06.44" style="display: block; margin: 0 auto; zoom:50%;" />

4. 连接成功后，左右分栏直接拖拽实现双向文件传输。至此，虚拟机成功安装并完成配置！
???+note "效果图"
    <img src="xp.assets/1Capture%202026-03-26%2014.13.07.png" alt="1Capture 2026-03-26 14.13.07" style="display: block; margin: 0 auto;" />

!!! question "Mac 的共享文件夹乱码"
    若 Mac 的共享文件夹乱码，请点击Xftp5左上角`File` - `Properties` - `Options` - 勾选`Use UTF-8 encoding`。

#### 说明

- 断网不影响使用（仅在虚拟机与宿主网络互通时有效）：仅依赖虚拟机内部局域网
- IP 地址固定：无需频繁修改配置
- 使用时发现***传输速度有提升空间***，持续探索中...

### 打包虚拟机文件

（如需要传输/分享）

> 7-Zip有很好的压缩率，尽管压缩速度慢于原生工具。

> 下列各种方法的目的是尽量减少压缩后的文件大小。

1. 安装 7-Zip 工具(若未安装)

    在终端(terminal)中输入:

    ```bash
    brew install p7zip
    ```
    
!!!warning
    压缩前请关闭虚拟机，防止磁盘映像损坏。

2. 指令示例:

    ```bash
    7za a test.7z ~/Parallels/Windows\ XP.utm
    # .utm并非后缀，而是文件夹名称的一部分
    # 这里7z压缩效率较高
    # 详见“指令参考”
    ```

??? info "点击查看：7za指令参考"
    `Usage: 7za <command> [<switches>...] <archive_name> [<file_names>...]`  
    a : Add files to archive  
    b : Benchmark  
    d : Delete files from archive  
    e : Extract files from archive (without using directory names)  
    h : Calculate hash values for files  
    i : Show information about supported formats  
    l : List contents of archive  
    rn : Rename files in archive  
    t : Test integrity of archive  
    u : Update files to archive  
    x : eXtract files with full paths  

3. 其他方案:
    如果你的压缩软件（如BandiZip）支持`XZ`算法，也可以选用该算法进行压缩，效果与7-Zip一致。

!!! note "关于“包”"
     在 macOS 系统中，包（Package）是一种被系统特殊处理的文件夹，它会被伪装成单个文件呈现给用户，比如 .utm 虚拟机文件、.app 应用程序都属于这类包。双击它会直接启动关联程序（如 UTM 或对应 App），右键选择“显示包内容”才能查看内部的目录结构和文件；而在 Windows 系统中并没有原生的“包”概念，这类文件夹会直接以普通目录形式展示，没有封装成单文件的视觉效果，也不会自动关联到对应程序，需要手动进入目录或在应用中选择打开。

## 结语

祝学习顺利！

```asm
mov al, 0
mov ah, 4Ch
int 21h
```
