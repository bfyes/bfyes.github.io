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

??? info "可折叠 Info（有惊喜！）"
    第二个折叠块，用来确认多个 details 连续出现时的间距。
    !!! note "无正文提示块"

    ??? note "无正文折叠块"

    ??? success "有惊喜"
        嵌套折叠块测试。

        ??? success "嵌套"
            嵌套折叠块测试。

            ??? success "嵌套"
                嵌套折叠块测试。

                ??? success "嵌套"
                    嵌套折叠块测试。

                    ??? success "嵌套"
                        嵌套折叠块测试。

                        ??? success "嵌套"
                            嵌套折叠块测试。
                            
                            ??? success "嵌套"
                                嵌套折叠块测试。

                                ??? success "嵌套"
                                    嵌套折叠块测试。
                                                        
                                    ??? success "嵌套"
                                        你成功浪费了一分钟。

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

## 公式

右键公式可唤出 MathJax 菜单，选择 “Show Math As → TeX Commands” 可查看公式的 LaTeX 源码。

1. 行内公式 $E = mc^2$ 和 $\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$。$\sum_{i=1}^n \frac1i$ 
2. 行内公式 $\displaystyle E = mc^2$ 和 $\displaystyle\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$。$\displaystyle\sum_{i=1}^n \frac1i$

独立公式块：

$$
\frac{\partial f}{\partial x} = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}
$$

## 表格

| 名称 | 类型 | 状态 |
| --- | --- | --- |
| C | 编译型 | ok |
| Python | 解释型 | ok |
| x86 | 汇编 | ok |
| RISC-V | 汇编 | ok |

## 代码

行内代码 `#!python squares = [x ** 2 for x in data]`，`#!c #define MAX_LEN 256`，`#!asm assume cs:code, ds:data`，`#!asm repne scasb`，`#!asm les di, dword ptr [bp+2]`，`#!bash cd ~/bfyes`，`#!makefile $(CC) $(CFLAGS) -o hello hello.c`，`int main() (不指定语言)`以及代码块：

```c
#include <stdio.h>
#define MAX_LEN 256
// 行注释
/* 块注释 */
int main(int argc, char *argv[]) {
    char buf[MAX_LEN];
    snprintf(buf, sizeof(buf), "%s is %d", "Alice", 30);
    if (strlen(buf) > 0) printf("%s\n", buf);
    return 0;
}
```

```python
# 注释
import os
data = [1, 2, 3]
squares = [x ** 2 for x in data]
print(f"sum = {sum(squares)}")
```

```java
import java.util.List;
// 行注释
public class Main {
    public static void main(String[] args) {
        int x = 0x1F;
        double pi = 3.14;
        boolean flag = (x > 10) && (pi < 4);
    }
}
```

```asm
section .data
    msg db "hello", 0xA
section .text
_start:
    mov eax, 4          ; sys_write
    mov ebx, 1          ; stdout
    int 0x80
```

```asm
_start:
    li a0, 42
    add a0, a0, a1      # a0 = 49
    lw t1, 0(t0)
    ret
```

```makefile
CC = gcc
CFLAGS = -O2 -Wall
all: hello
hello: hello.c
    $(CC) $(CFLAGS) -o hello hello.c
```

## 命令行

```bash
#!/usr/bin/env bash
set -euo pipefail
name="bfyes"
printf 'Hello, %s!\n' "$name"
if [[ -d "$root/docs" ]]; then echo "exists"; fi
git status --short
curl -fsSL "https://example.com/api?name=${name}" -o response.json
```

## Tabbed 折叠组件

=== "Tab 1"

    这是第一个标签页的内容。用来检查标签行与内容面板之间的间距。

    ```c
    int x = 42;
    ```

=== "Tab 2"

    第二个标签页。确认切换时内容区不残留上一个标签的样式。

=== "Tab 3"

    第三个标签页，内容较短。

## 提示块内嵌内容

!!! note "含标题的提示块"
    提示块内部的标题不应该显示左侧书签图标（会被 overflow:hidden 裁掉）。

    ### 提示块内 H3

    #### 提示块内 H4

    提示块内的代码块：

    ```python
    print("hello from admonition")
    ```

??? warning "含代码块的折叠提示"
    折叠块内也可以放代码块，展开后检查间距。

    ```bash
    echo "expanded"
    ```

## 脚注

这是一段带脚注的文字[^1]，还有另一个脚注[^long-note]，带列表的脚注[^note-list]。

[^1]: 这是第一个脚注的内容。

[^long-note]:
    这是一个较长的脚注，跨多行书写。

    用来检查脚注区域的排版和缩进。

[^note-list]:
    这是脚注说明。

    - 列表项一；
    - 列表项二。

## 行内代码在标题中

### 标题包含 `inline code` 的测试

## 长行代码横向滚动

```c
// 这一行非常长，用来测试代码块的横向滚动条是否正常工作，超出容器宽度时应该出现横向滚动而不是换行或溢出页面
static const char *very_long_variable_name_that_exceeds_the_normal_line_width = "This is a very long string value that should trigger horizontal scrolling in the code block container.";
```

## pymdownx.critic 编辑标记

+{++这是新增的文本++}，-{--这是删除的文本--}，{~~旧文本~>新文本~~}。

{==这段被高亮了==}{>>这是批注<<}。

## HTML 元素

<details>
<summary>原生 HTML details（非 Material 扩展）</summary>
<p>这是原生 HTML 的 details 元素，检查与 Material details 样式是否一致。</p>
</details>

<mark>标记文本</mark>，<abbr title="HyperText Markup Language">HTML</abbr> 缩写。

| `左对齐` | `居中对齐` | `右对齐` |
| :--- | :---: | ---: |
| left | center | right |
| 左 | 中 | 右 |

## 主页专属元素

::friends::
Name | github | https://example.com | Description
Name | github | https://example.com | Description
::/friends::

::changelog::
yyyy.mm.dd: text
::/changelog::

