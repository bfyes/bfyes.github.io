# XP on Apple Silicon Mac

> 本文为配置方法，配置记录详见原文[[点击跳转](xp.md)]。

## 直接从`.utm`文件夹部署

1. **软件**。关于 UTM 的下载，请访问 <https://mac.getutm.app>。  

2. **虚拟机文件**。请将下载好的压缩包(`xp_mac.zip`)解压，得到`.utm`文件包。在安装好 UTM 虚拟机的情况下，**直接双击该包**即可打开虚拟机。随后点击“启动”即可，理论上无需其他操作即可进入系统。

??? tip "如果无法解压，请尝试以下步骤"

    可通过7za命令或部分解压软件(BandiZip等)解压

    ### 通过7-Zip解压

    #### 安装 7-Zip 工具
    在终端(terminal)中输入:

    ```bash
    brew install p7zip
    ```

    #### 指令示例

    ```bash
    7za x test.7z # 解压
    # 详见“指令参考”
    ```

    ??? info "点击查看：7za指令参考"
        `Usage: 7za <command> [<switches>...] <archive_name> [<file_names>...]`  
        ```
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
        ```

    ### 其他方案

    如果你的压缩软件（如BandiZip）支持`XZ`算法，也可以选用该算法进行压缩，效果与7-Zip一致。

## 文件互传

### macOS 端配置

1. 系统设置 → 通用 → 共享 → 开启「远程登录」

    > 保护好账号密码，以防泄漏！

2. 查看内网 IP 地址：

    ```bash
    ifconfig | grep inet
    ```

    <img src="xp.assets/1Capture%202026-03-26%2014.09.58.png" alt="1Capture 2026-03-26 14.09.58" style="display: block; margin: 0 auto;" />

    得到并记住该地址。(高亮部分)

### XP 端配置

（Xftp 5）

1. 安装 Xftp 5 (如果你是汇编的课友，该软件的快捷方式已经在桌面上，直接打开即可)

2. 新建 SFTP 会话参数
    - 名称：任意名称
    - 主机：上一部分得到的的地址
    - 协议：SFTP
    - 端口：22
    - 用户名：macOS 登录账号名称 (如果不知道，请睡眠并重新登陆，屏幕上的名字即为账号名称)
    - 密码：macOS 登录密码

3. 首次连接点击 Accept and Save 保存密钥

    <img src="xp.assets/1Capture%202026-03-26%2011.06.44.png" alt="1Capture 2026-03-26 11.06.44" style="display: block; margin: 0 auto; zoom:50%;" />

4. 连接成功后，左右分栏直接拖拽实现双向文件传输。至此，虚拟机成功安装并完成配置！
???+note "效果图"
    <img src="xp.assets/1Capture%202026-03-26%2014.13.07.png" alt="1Capture 2026-03-26 14.13.07" style="display: block; margin: 0 auto;" />

??? tip "如果 Mac 的共享文件夹乱码"
    若 Mac 的共享文件夹乱码，请点击Xftp5左上角`File` - `Properties` - `Options` - 勾选`Use UTF-8 encoding`。

## 说明

- 断网不影响使用 (仅在虚拟机与宿主网络互通时有效) ，仅依赖虚拟机内部局域网
- IP 地址固定，无需频繁修改配置
- 使用时发现***传输速度有提升空间***，持续探索中...

??? note "关于“包”"
     在 macOS 系统中，包（Package）是一种被系统特殊处理的文件夹，它会被伪装成单个文件呈现给用户，比如 .utm 虚拟机文件、.app 应用程序都属于这类包。双击它会直接启动关联程序（如 UTM 或对应 App），右键选择“显示包内容”才能查看内部的目录结构和文件；而在 Windows 系统中并没有原生的“包”概念，这类文件夹会直接以普通目录形式展示，没有封装成单文件的视觉效果，也不会自动关联到对应程序，需要手动进入目录或在应用中选择打开。

祝学习顺利！

```asm
mov al, 0
mov ah, 4Ch
int 21h
```
