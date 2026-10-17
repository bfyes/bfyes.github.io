# HPC 高性能计算

> [!WARNING]
>
> **声明**
>
> (加紧施工中)
>
> 笔记/报告仅供记录学习历程、方便复习回顾之用，请勿抄袭，如有侵权请联系我删除。

HPC101 课程文档：[https://hpc101.zjusct.io](<https://hpc101.zjusct.io>)

[部分回放链接(智云课堂)](<https://classroom.zju.edu.cn/coursedetail?course_id=85721&amp;tenant_code=112>)

## 实验报告

- [Lab0: Linux快速入门](<https://docs.bfyes.cn/study/hpc/lab0/index.md>)
- [Lab1: 简单集群搭建](<https://docs.bfyes.cn/study/hpc/lab1/index.md>)
- [Lab2: MoE 的向量化计算](<https://docs.bfyes.cn/study/hpc/lab2/index.md>)
- [Lab3: GDN Prefill 前向优化](<https://docs.bfyes.cn/study/hpc/lab3/index.md>)
- [Lab4: AMSS-NCKU 数值相对论程序优化](<https://docs.bfyes.cn/study/hpc/lab4/index.md>)
- [Lab5: Gemma4 端到端推理优化](<https://docs.bfyes.cn/study/hpc/lab5/index.md>)
- [鲲鹏 HPC 三题优化答辩](</slides/hpc/>)

## 笔记

一些推荐视频：

- 【【官方双语】深度学习之神经网络的结构 Part 1 ver 2.0】 [https://www.bilibili.com/video/BV1bx411M7Zx](<https://www.bilibili.com/video/BV1bx411M7Zx>)
- 【【官方双语】深度学习之梯度下降法 Part 2 ver 0.9 beta】 [https://www.bilibili.com/video/BV1Ux411j7ri](<https://www.bilibili.com/video/BV1Ux411j7ri>)
- 【【官方双语】深度学习之反向传播算法 上/下 Part 3 ver 0.9 beta】 [https://www.bilibili.com/video/BV16x411V7Qg](<https://www.bilibili.com/video/BV16x411V7Qg>)
- 【【官方双语】GPT是什么？直观解释Transformer | 深度学习第5章】 [https://www.bilibili.com/video/BV13z421U7cs](<https://www.bilibili.com/video/BV13z421U7cs>)
- 【【官方双语】直观解释注意力机制，Transformer的核心 | 【深度学习第6章】】 [https://www.bilibili.com/video/BV1TZ421j7Ke](<https://www.bilibili.com/video/BV1TZ421j7Ke>)
- 【【官方双语】直观解释大语言模型如何储存事实 | 【深度学习第7章】】 [https://www.bilibili.com/video/BV1aTxMehEjK](<https://www.bilibili.com/video/BV1aTxMehEjK>)

可视化网站：[https://bbycroft.net/llm](<https://bbycroft.net/llm>)

以下笔记目前主要由 gpt-5.6 生成，由人工核查。参考课程语音转写稿、PPT OCR 结果、权威论文等写成。

☝🏼🤓点击进入体验 AI 风味。读 AI 的产物真的好心累💩。

| 时间 | 内容 | 教师 | 笔记 |
| --- | --- | --- | --- |
| 2026-07-05 08:30 | 超算概述 | 陈建海老师 |  |
| 2026-07-06 14:00 | 集群软硬件及运维基础 | 胡笠桁 / 徐晨 | [笔记](<https://docs.bfyes.cn/study/hpc/notes/0706p/index.md>) |
| 2026-07-07 14:00 | HPC 中的计算机系统 - 1 | 刘烨 | [笔记](<https://docs.bfyes.cn/study/hpc/notes/0707p/index.md>) |
| 2026-07-08 14:00 | HPC 中的计算机系统 - 2 | 何水兵老师 / 宋浩喆 | [笔记](<https://docs.bfyes.cn/study/hpc/notes/0708p/index.md>) |
| 2026-07-10 14:00 | 向量化并行计算基础 | 陈宏哲 | [笔记](<https://docs.bfyes.cn/study/hpc/notes/0710p/index.md>) |
| 2026-07-11 14:00 | 高性能网络基础 | 朱宝林 |  |
| 2026-07-12 08:30 | OpenMP/MPI 并行计算基础 | 黄钰 | [笔记](<https://docs.bfyes.cn/study/hpc/notes/0712a/index.md>) |
| 2026-07-12 14:00 | 性能分析技术基础 Profiling | 郝星星 | [笔记](<https://docs.bfyes.cn/study/hpc/notes/0712p/index.md>) |
| 2026-07-13 08:30 | 高性能计算高级话题 | 王则可老师 | [笔记](<https://docs.bfyes.cn/study/hpc/notes/0713a/index.md>) |
| 2026-07-13 14:00 | CUDA 编程基础 | 王则可老师 / 陈楷骐 | [笔记](<https://docs.bfyes.cn/study/hpc/notes/0713p/index.md>) |
| 2026-07-14 08:30 | 华为 CANN |  |  |
| 2026-07-14 14:00 | 华为 HCCL |  |  |
| 背景阅读 | 从文本到下一个 token |  | [导读](<https://docs.bfyes.cn/study/hpc/notes/llm/index.md>) |
| 2026-07-16 08:30 | 机器学习基础 | 赵彬彬老师 | [笔记](<https://docs.bfyes.cn/study/hpc/notes/0716a/index.md>) |
| 2026-07-16 14:00 | 机器学习基础 | 周俊康 | [笔记](<https://docs.bfyes.cn/study/hpc/notes/0716p/index.md>) |
| 2026-07-17 08:30 | 机器学习高级话题 | 庄博涵老师 | [笔记](<https://docs.bfyes.cn/study/hpc/notes/0717a/index.md>) |
| 2026-07-17 14:00 | 机器学习高级话题 | 张寅老师 | [笔记](<https://docs.bfyes.cn/study/hpc/notes/0717p/index.md>) |
