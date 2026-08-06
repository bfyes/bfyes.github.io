# 样式测试

这个页面用于预览正文排版、提示块、代码块和常见 Markdown 元素的显示效果。

## 提示块

!!! note "Note"
    这是一个普通说明。用于确认标题渐变、图标位置、正文透明背景和边框颜色。

!!! abstract "Abstract"
    这是摘要块。正文应该没有额外底色，标题区域保留轻微色谱渐变。

!!! info "Info"
    这是信息块。适合放补充背景、环境说明或版本信息。

!!! tip "Tip"
    这是提示块。现在使用青、绿、黄这一小段色谱。

!!! success "Success"
    这是成功块。用于展示完成状态或正确结果。

!!! question "Question"
    这是问题块。适合放思考题、待确认事项或小测。

!!! warning "Warning"
    这是警告块。使用暖色片段，强调但不应过分刺眼。

!!! failure "Failure"
    这是失败块。用于失败结果、错误条件或反例。

!!! danger "Danger"
    这是危险块。用于高风险操作或不可逆行为提醒。

!!! bug "Bug"
    这是缺陷块。用于记录已知问题、异常行为或调试线索。

!!! example "Example"
    这是示例块。用于展示样例、模板或参考写法。

!!! quote "Quote"
    这是引用块。用于摘录、旁注或语境说明。

??? tip "可折叠 Tip"
    这是折叠提示块，用来检查右侧展开箭头的对齐和动画。

??? info "可折叠 Info"
    第二个折叠块，用来确认多个 details 连续出现时的间距。

## H2 标题

### H3 标题

#### H4 标题

##### H5 标题

###### H6 标题

## 文本

这是普通段落，包含 **粗体**、*斜体*、~~删除线~~、`inline code`、<kbd>⌘</kbd> + <kbd>K</kbd>、上标 X<sup>2</sup> 和下标 H<sub>2</sub>O。

这是一个链接：[github-markdown-css](https://sindresorhus.com/github-markdown-css/)。这是一个自动链接：<https://example.com>。

> 这是一级引用。
>
> > 这是嵌套引用。

---

## 列表

- 无序列表项目
- 第二项包含一些较长文字，用来检查换行和列表缩进是否自然。
  - 嵌套项目
  - 另一个嵌套项目

1. 有序列表第一项
2. 有序列表第二项
3. 有序列表第三项

- [x] 已完成任务
- [ ] 未完成任务
- [ ] 还有一项较长的任务文字，用来检查复选框和文本换行。

术语
: 这是定义列表的内容。

另一个术语
: 定义列表第二项。

## 表格

| 名称 | 类型 | 状态 |
| --- | --- | --- |
| C | 编译型 | ok |
| Python | 解释型 | ok |
| x86 | 汇编 | ok |
| RISC-V | 汇编 | ok |

## 代码

```c
#include <stdio.h>

int main(void) {
    int value = 42;
    printf("value = %d\n", value);
    return 0;
}
```

```python
def greet(name: str) -> str:
    return f"hello, {name}"

print(greet("bfyes"))
```

```asm
global _start

section .text
_start:
    mov eax, 1
    mov ebx, 0
    int 0x80
```

```asm
.text
.globl _start
_start:
    li a0, 42
    addi a0, a0, 1
    ret
```
