# HPC 高性能计算

HPC101 的课程内容横跨 Linux、集群、并行程序、性能分析、GPU 和大模型系统。下面的笔记按授课顺序整理，并尽量把概念、命令、实验现象和参考资料放在一起。阅读时建议配合 Lab 文档动手验证；性能、并行和分布式系统中的许多结论都依赖具体机器与输入规模。

课程文档：[HPC101](https://hpc101.zjusct.io)

## 实验报告

- [Lab 0：Linux 快速入门](lab0/index.md)
- [Lab 1：简单集群搭建](lab1/index.md)
- [Lab 2：MoE 的向量化计算](lab2/index.md)
- [Lab 3：GDN Prefill 前向优化](lab3/index.md)
- [Lab 4：AMSS-NCKU 数值相对论优化](lab4/index.md)
- [Lab 5：Gemma4 端到端推理优化](lab5/index.md)

## 课程笔记

| 时间 | 内容 | 讲师 | 笔记 |
| --- | --- | --- | --- |
| 2026-07-05 08:30 | 超算概述 | 陈建海老师 | |
| 2026-07-06 14:00 | 集群软硬件及运维基础 | 胡笠桁 / 徐晨 | [笔记](notes/0706p.md) |
| 2026-07-07 14:00 | HPC 中的计算机系统 I | 刘烨 | [笔记](notes/0707p.md) |
| 2026-07-08 14:00 | HPC 中的计算机系统 II | 何水兵老师 / 宋浩喆 | [笔记](notes/0708p.md) |
| 2026-07-10 14:00 | 向量化并行计算基础 | 陈宏哲 | [笔记](notes/0710p.md) |
| 2026-07-11 14:00 | 高性能网络基础 | 朱宝林 | |
| 2026-07-12 08:30 | OpenMP / MPI 并行计算基础 | 黄钰 | [笔记](notes/0712a.md) |
| 2026-07-12 14:00 | 性能分析技术基础 | 郝星星 | [笔记](notes/0712p.md) |
| 2026-07-13 08:30 | 高性能计算高级话题 | 王则可老师 | [笔记](notes/0713a.md) |
| 2026-07-13 14:00 | CUDA 编程基础 | 王则可老师 / 陈楷骐 | [笔记](notes/0713p.md) |
| 2026-07-14 08:30 | 华为 CANN |  | |
| 2026-07-14 14:00 | 华为 HCCL |  | |
| 背景阅读 | 从文本到下一个 token |  | [导读](notes/llm.md) |
| 2026-07-16 08:30 | 机器学习基础 | 赵彬彬老师 | [笔记](notes/0716a.md) |
| 2026-07-16 14:00 | 分布式大模型训练与推理 | 周俊康 | [笔记](notes/0716p.md) |
| 2026-07-17 08:30 | 算法—系统协同设计 | 庄博涵老师 | [笔记](notes/0717a.md) |
| 2026-07-17 14:00 | 强化学习、多智能体与具身智能 | 张寅老师 | [笔记](notes/0717p.md) |

## 资源推荐

### Linux、并行程序与超算基础

- [清华大学 HPC-Lab-Docs](https://lab.cs.tsinghua.edu.cn/hpc/doc/)
  - 适合和 Lab 1—Lab 4 对照阅读。文档涵盖 Linux 环境、OpenMP、MPI、性能分析和常见实验组织方式。
- [Linux 101 - USTC](https://101.lug.ustc.edu.cn/)
  - 适合补 Linux 命令、文件权限、Shell、软件包和远程连接的基础。Lab 0 前后可按需要查阅。
- 《并行程序设计导论》（*An Introduction to Parallel Programming*）
  - 一本篇幅较短的入门书，适合先建立 OpenMP 与 MPI 的基本模型，再进入集群和性能优化。

### Python 与数组编程

若 Python 基础尚不稳，先把文件、函数、列表/字典、虚拟环境和调试练熟。之后再学习 NumPy、PyTorch 和性能分析，效果会好得多。

| 资源 | 适合的起点 | 可配合的小项目 |
| --- | --- | --- |
| [《Python 编程：从入门到实践（第 3 版）》](https://book.douban.com/subject/36365320/) | 初学编程 | 数据可视化、Web 应用 |
| [《Python 编程快速上手》](https://book.douban.com/subject/35387685/) | 会一点基础语法 | 抓取网页、CSV/JSON 处理、计划任务 |
| [《Python 极客项目编程》](https://book.douban.com/subject/27050630/) | 已能独立写小脚本 | 模拟、图像和交互式项目 |

### GPU 与 CUDA

- [*Programming Massively Parallel Processors: A Hands-on Approach, 4th Edition*](https://www.oreilly.com/library/view/programming-massively-parallel/9780323984638/)
  - CUDA 的工具链和硬件演进较快，阅读新版英文资料更容易接上当前的编程模型、Tensor Core 和性能分析工具。
- NVIDIA 的 [CUDA C++ Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/) 与 [CUDA C++ Best Practices Guide](https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/)
  - 适合在写 kernel、检查内存访问和阅读 profiler 指标时作为第一手资料。

!!! note "使用建议"

    书和教程适合建立框架，实验负责把框架落到机器上。阅读一节内容后，最好立即做一个很小的验证，例如查看 `ip route`、提交一个 `srun hostname`、比较两种 OpenMP 调度、或用 profiler 观察一个矩阵乘法循环。记录命令、输入和结果，之后写实验报告会轻松很多。
