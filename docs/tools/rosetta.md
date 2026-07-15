# 利用 Rosetta 在 M 系列 Mac 上高效运行 x86 Linux 应用的完整指南

> 原文链接: https://blog.csdn.net/weixin_29305313/article/details/159103754 [[点击跳转](https://blog.csdn.net/weixin_29305313/article/details/159103754)]

## 为什么需要 Rosetta 在 M 系列 Mac 上运行 x86 Linux 应用

自从苹果推出搭载 M 系列芯片的 Mac 电脑后，很多开发者都面临一个现实问题：如何在 ARM 架构的 Mac 上运行传统的 x86 Linux 应用。M 系列芯片采用 ARM 架构，而大多数 Linux 应用都是为 x86 架构编译的，这就导致了兼容性问题。

Rosetta 是苹果开发的动态二进制翻译器，最初是为了让 x86 架构的 Mac 应用能在 M 系列芯片上运行。后来苹果进一步扩展了它的能力，允许在 Linux 虚拟机中使用 Rosetta 来运行 x86 程序。这相当于在 ARM 架构的 Linux 系统中增加了一个“翻译层”，能够实时将 x86 指令转换为 ARM 指令。

我实测下来，这种方式的性能损失比纯模拟要小得多。举个例子，通过 Rosetta 运行 x86 版本的 Neofetch，速度几乎和原生 ARM 版本相当。而如果使用 QEMU 等模拟器，性能可能会下降 50% 以上。

---

## 环境准备与工具选择

### 硬件和系统要求

要使用这个方案，你需要：

- 搭载 M 系列芯片的 Mac 电脑（M1/M2/M3 等）
- macOS Ventura（13.0）或更高版本
- 至少 8GB 内存（16GB 以上更佳）
- 足够的存储空间（建议预留 20GB 以上）

我推荐使用 MacBook Pro 14 寸 M1 Pro 作为开发机，16GB 内存版本。实测下来，这个配置可以流畅运行 Ubuntu 虚拟机并转译多个 x86 应用。

### 虚拟化工具比较

目前主要有三种方案可以在 M 系列 Mac 上运行 Linux 虚拟机：

- **UTM**：提供图形界面，适合新手
  - 优点：操作简单，支持 SPICE 协议实现剪贴板共享
  - 缺点：性能略低于命令行方案
- **Lima**：轻量级命令行工具
  - 优点：启动快，资源占用少
  - 缺点：纯命令行，上手略难
- **OrbStack**：新型容器 + 虚拟机管理工具
  - 优点：性能强、界面简洁、支持 Docker
  - 缺点：收费，部分高级功能需付费

> 本文主要讲解 UTM + Rosetta 方案，兼顾易用性和性能。

---

## 核心原理：为什么是 UTM + Rosetta？

这套方案的核心优势，源于苹果自家技术的深度整合。

首先，Apple Virtualization Framework 是基石。这是苹果为 Apple Silicon 芯片提供的原生虚拟化框架。相比传统的 QEMU 全系统模拟，它允许虚拟机以近乎裸机的性能访问 CPU 和内存资源。UTM 从某个版本开始，在创建 ARM Linux 虚拟机时，可以选择使用这个框架，从而获得极高的运行效率。

其次，Rosetta 2 的角色发生了转变。我们都知道 Rosetta 2 能让 M 芯片 Mac 直接运行 x86_64 的 macOS 应用。但很多人不知道的是，从 macOS 13 开始，苹果允许在 ARM 架构的 Linux 虚拟机内部启用 Rosetta 2。这意味着，虚拟机本身是 ARM64 系统，但系统内可以安装一个特殊的“Rosetta 兼容层”。当你在虚拟机里尝试执行一个 x86_64 的 Linux 程序时，这个兼容层会动态地将 x86 指令转译为 ARM 指令。

这种“嵌套”模式的优势非常明显：

- 性能极佳：虚拟机本身通过虚拟化框架高效运行，程序转译由高度优化的 Rosetta 完成，远胜于 QEMU 软件模拟 x86 CPU。
- 资源占用合理：你只需要运行一个 ARM Linux 系统，而不是同时运行一个完整的 x86 Linux 系统。
- 无缝兼容：对应用程序而言，它仿佛运行在一个真正的 x86 Linux 环境中。

> 注意：确保你的 macOS 版本在 13（Ventura）或以上，这是该功能的最低系统要求。M1、M2、M3 系列芯片均支持。

---

## 五分钟极速配置：从零创建 UTM 虚拟机

下面我们以 Ubuntu 22.04 LTS 为例，展示最简化的配置流程。

### 第一步：准备安装镜像

你需要下载的是 ARM64 架构的 Ubuntu 服务器版镜像。记住，虚拟机本身是 ARM 系统。不要下错成 x86_64 的版本。

```bash
# 在Mac的终端里，使用wget下载（也可以浏览器直接下载）
wget https://cdimage.ubuntu.com/releases/22.04/release/ubuntu-22.04.4-live-server-arm64.iso
```

我推荐使用服务器版（Server），因为它更轻量，没有图形桌面那些不必要的开销。后续所有操作我们都可以通过 SSH 连接进行，效率更高。

### 第二步：安装并配置 UTM

- 从 UTM 官网或 Mac App Store 下载并安装 UTM。
- 打开 UTM，点击 “+” 号创建一个新虚拟机。
- 在 “虚拟化” 与 “模拟” 之间，选择 “虚拟化”。这一步至关重要。
- 系统架构选择 “ARM64 (aarch64)”。
- 在 “Linux” 标签页下，勾选两个核心选项：
  - 使用 Apple 虚拟化
  - 启用 Rosetta
- 点击 “浏览”，选择你刚才下载的 Ubuntu ARM64 的 ISO 文件。
- 内存和 CPU 核心数根据你的 Mac 配置分配，通常 4GB 内存、2-4 个核心足以流畅运行。
- 创建一个新的虚拟硬盘，大小建议 20GB 以上。
- 在网络设置中，确保 “启用网络” 已勾选，并选择 “共享网络”（NAT），这样虚拟机就能上网了。
- 其他设置保持默认，点击 “保存”，给你的虚拟机起个名字，比如 “Ubuntu-ARM-Rosetta”。

### 第三步：安装 Ubuntu 系统

- 启动虚拟机，它会从 ISO 镜像引导进入 Ubuntu 安装程序。
- 跟随图形化安装步骤进行。语言、键盘布局按喜好选择。
- 网络连接通常会自动配置好。
- 在 “存储配置” 步骤，选择我们刚才创建的虚拟硬盘，使用整个磁盘即可。
- 设置你的用户名、密码和主机名。
- 在 “SSH 设置” 步骤，务必勾选 “Install OpenSSH server”。这是我们后续通过本地终端高效管理虚拟机的关键。
- 其他选项默认，开始安装。安装完成后，它会提示重启。
- 重启前，回到 UTM 的虚拟机窗口，点击窗口上方工具栏的 “光盘” 图标，弹出安装 ISO。这样虚拟机才会从硬盘正常启动。

至此，一个基础的、支持 Rosetta 的 ARM Ubuntu 虚拟机就创建好了。整个过程熟练的话，确实可以在五分钟内完成。

---

## 系统内部精调：配置 Rosetta 与增强体验

虚拟机启动并登录后，我们还需要在 Linux 内部进行一些配置，才能让 Rosetta 真正工作起来，并优化使用体验。

首先，更新系统并安装必要组件：

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install binfmt-support -y
```

binfmt-support 是让 Linux 内核识别并调用 Rosetta 来处理 x86 二进制文件的关键包。

接着，挂载 Rosetta 文件系统：

UTM 已经在主机和虚拟机之间创建了一个名为 rosetta 的虚拟文件系统（virtiofs），里面包含了 Rosetta 转译器。我们需要把它挂载到虚拟机内部。

```bash
# 创建挂载点
sudo mkdir -p /media/rosetta

# 临时挂载
sudo mount -t virtiofs rosetta /media/rosetta
```

为了让每次启动自动挂载，需要将其写入 `/etc/fstab` 文件：

```bash
echo "rosetta /media/rosetta virtiofs ro,nofail 0 0" | sudo tee -a /etc/fstab
```

参数 nofail 很重要，即使挂载失败也不影响系统启动。

然后，注册 Rosetta 为二进制格式解释器：

这是最关键的一步，告诉系统：遇到 x86_64 的 ELF 可执行文件，就交给 `/media/rosetta/rosetta` 这个程序来处理。

```bash
sudo /usr/sbin/update-binfmts --install rosetta /media/rosetta/rosetta \
  --magic "\x7fELF\x02\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x3e\x00" \
  --mask "\xff\xff\xff\xff\xff\xfe\xfe\x00\xff\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff\xff" \
  --credentials yes --preserve no --fix-binary yes
```

执行后，你可以检查是否成功：

```bash
cat /proc/sys/fs/binfmt_misc/rosetta
```

如果输出显示 enabled 和正确的解释器路径，就说明注册成功了。

最后，安装 SPICE 增强工具（可选但推荐）：

这能提供剪贴板共享、更好的鼠标集成等功能。

```bash
sudo apt install spice-vdagent -y
```

安装后重启虚拟机生效。

---

## 实战检验：编译与运行 x86 程序

配置好了，总得跑点东西试试。我们来实际编译并运行一个简单的 x86_64 C++ 程序。

### 第一步：安装 x86_64 交叉编译工具链

虽然 Rosetta 能运行 x86 程序，但如果你需要在虚拟机内编译 x86 代码，就需要对应的工具链。

```bash
sudo apt install gcc-multilib-x86-64-linux-gnu g++-multilib-x86-64-linux-gnu -y
```

这个包组提供了能在 ARM 系统上生成 x86_64 代码的 GCC 和 G++。

### 第二步：编写并编译一个测试程序

用你喜欢的编辑器（如 nano 或 vim）创建一个文件 test.cpp：

```cpp
#include <iostream>
int main() {
  std::cout << "Hello from an x86_64 program running on ARM via Rosetta!\n";
  return 0;
}
```

使用刚安装的 x86_64 交叉编译器进行编译：

```bash
x86_64-linux-gnu-g++ -o test_x86 test.cpp
```

这会生成一个名为 test_x86 的 x86_64 架构可执行文件。

### 第三步：通过 Rosetta 运行

直接运行即可，系统会自动调用 Rosetta 转译器：

```bash
./test_x86
```

如果一切顺利，你将看到输出的欢迎信息。你可以用 file 命令验证其架构：

```bash
file test_x86
```

输出应为：test_x86: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, ...

> 可能遇到的动态库问题：
>
> 对于一些更复杂的、动态链接的 x86 程序，你可能会遇到缺少 libc 等动态库的错误。这是因为 ARM 系统里没有 x86 的动态库。解决方法通常是从一个 x86 Linux 系统（或 Docker 镜像）里复制对应的 .so 文件到虚拟机的某个目录（例如 /lib64），并确保路径正确。不过，对于很多基础程序，Rosetta 能处理得很好。

---

## 进阶技巧与避坑指南

掌握了基本流程后，下面这些技巧能让你用得更舒服，并避开一些常见的“坑”。

### 高效连接：使用 SSH 替代 UTM 窗口

UTM 的图形控制台有时反应较慢。既然安装了 OpenSSH，我们完全可以用 Mac 本地终端（如 iTerm2）通过 SSH 连接管理虚拟机，体验丝滑的终端操作。

在 UTM 虚拟机启动后，查看其 IP 地址。可以在虚拟机内执行 `ip a` 命令，找到 eth0 或 ens 开头的网卡，查看 inet 地址。

在 Mac 的终端里：

```bash
ssh your_username@<虚拟机IP地址>
```

输入密码即可连接。你还可以配置 SSH 密钥登录，彻底告别密码。

### 性能优化：资源分配与源替换

- **CPU 与内存**：不要过度分配。通常，分配给虚拟机的核心数不超过你 Mac 物理核心数的一半，内存不超过总内存的一半，能保证宿主系统和虚拟机都流畅运行。你可以在 UTM 的“设置”->“系统”里随时调整。
- **软件源**：为了获得更快的软件下载速度，可以将 Ubuntu 的软件源替换为国内镜像，如清华源或阿里云源。编辑 `/etc/apt/sources.list` 文件进行替换。

### 常见问题排查

- **Rosetta 挂载失败**：检查 UTM 虚拟机设置中“启用 Rosetta”是否勾选。确认 `/etc/fstab` 条目正确，且 `/media/rosetta` 目录存在。
- **x86 程序无法执行**：运行 `cat /proc/sys/fs/binfmt_misc/rosetta` 确认 Rosetta 已启用且状态正常。检查程序是否真的是 x86_64 架构。尝试安装必要的 x86 兼容库（如 libc6:amd64，但需先 `sudo dpkg --add-architecture amd64`）。
- **网络不通**：确保 UTM 网络设置是“共享网络”。在虚拟机内检查 `/etc/netplan` 的配置文件，UTM 新版可能会改变网络设备名（如从 enp0s9 变为 enp0s1），如果网络设备名不匹配会导致启动后无网络，需要手动修改 netplan 配置。

### 替代方案浅析：Lima

在搜索资料时，你肯定会看到 Lima 这个方案。它更像一个轻量级的虚拟机管理器，通过命令行快速创建和管理基于 Apple 虚拟化框架的 Linux VM，并且原生支持 Rosetta。对于喜欢命令行、追求极致简洁和自动化的开发者，Lima 是非常好的选择。它用一条命令就能启动一个预配置好的 Debian/Ubuntu VM：

```bash
brew install lima
limactl start template://debian --rosetta --vm-type=vz
```

但对于大多数刚接触 Mac 虚拟化的用户，UTM 直观的图形界面和详细的设置选项，更能降低学习和排错的门槛。

---

## 总结

从我的实际体验来看，这套 UTM+Rosetta 的方案稳定性相当不错。日常的开发编译、运行一些 x86 的测试工具链都没有问题。性能损耗感知很小，尤其是相比纯模拟的方案，简直是天壤之别。最大的好处是，它把复杂的技术封装成了简单的操作，让你能快速得到一个“全能”的 Linux 环境，把精力重新放回开发本身，而不是没完没了地折腾环境。
