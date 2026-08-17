# 离散数学

## 离散数学部分

### 试卷1, 部分来自历年卷(sp24)

#### 单选题

!!! question "1. \[猜测\]"
    设论域为全体实数，$P(x)$ 表示“$x>0$”，$Q(x)$ 表示“$x^2=1$”。命题 $\exists x(P(x)\land Q(x))$ 的真值为（）

    (A) 真

    (B) 假

    (C) 不确定

    (D) 无法判断

    ??? info "点击查看答案"
        **A（真）**。$\exists x(x>0 \land x^2=1)$，取 $x=1$ 即可满足。

!!! question "2. \[猜测\]"
    设 $A=\{\emptyset,\{\emptyset\}\}$，则 $\mathcal{P}(A)$ 中元素的个数为（）

    (A) $2$

    (B) $3$

    (C) $4$

    (D) $8$

    ??? info "点击查看答案"
        **C（4）**。$A=\{\emptyset, \{\emptyset\}\}$ 有 2 个元素，$|\mathcal{P}(A)|=2^2=4$。

!!! question "3. \[猜测\]"
    设函数 $f:\mathbb{Z}\to\mathbb{Z}$ 定义为 $f(x)=x^2$，则 $f$ 是（）

    (A) 单射且满射

    (B) 单射但非满射

    (C) 满射但非单射

    (D) 既非单射也非满射

    ??? info "点击查看答案"
        **D（既非单射也非满射）**。$f(x)=x^2$ 在 $\mathbb{Z}$ 上：$f(1)=f(-1)=1$ 非单射；负数不在值域中，非满射。

    ??? tip "单射 / 满射 / 双射"
        - **单射**：$f(a)=f(b)\Rightarrow a=b$（不同输入不同输出）
        - **满射**：$\forall y\in Y,\exists x\in X,\ f(x)=y$（值域=陪域）
        - **双射**：既单又满，可逆。

!!! question "4. \[猜测\]"
    设 $(G,*)$ 是群，$e$ 是单位元，$a,b\in G$。以下说法正确的是（）

    (A) 若 $a*b=e$，则 $a$ 和 $b$ 互为逆元

    (B) 群中一定存在零元

    (C) 群中每个元素的逆元可以不唯一

    (D) 若 $a\neq e$，则 $a*a\neq e$

    ??? info "点击查看答案"
        **A（若 $a*b=e$，则 $a$ 和 $b$ 互为逆元）**。由群的定义，每个元素都有逆元，且 $a*b=e$ 即 $b=a^{-1}$。

        - ✗ B：群中不一定有零元。注意零元 $\neq$ 单位元：零元 $z$ 满足 $\forall a, a*z=z$（吸收性），而单位元 $e$ 满足 $a*e=a$（不变性）。反例：$(\mathbb{Z},+)$ 中 $0$ 是单位元（$a+0=a$），但不是零元——若存在零元 $z$ 则需 $a+z=z$ 即所有 $a=0$，矛盾。事实上只有平凡群 $\{e\}$ 才有零元。

        - ✗ C：群中每个元素的逆元唯一。若 $b,c$ 都是 $a$ 的逆元，则 $b=b*e=b*(a*c)=(b*a)*c=e*c=c$。

        - ✗ D：$a\neq e$ 时也可能 $a*a=e$。反例：$(\{0,1\},\oplus)$（异或群），单位元 $e=0$，$1\neq0$ 但 $1\oplus1=0=e$（即 1 是二阶元）。

!!! question "5. \[猜测\]"
    设 $R$ 是集合 $A=\{1,2,3,4\}$ 上的关系，$R=\{(1,2),(2,3),(3,4)\}$，则 $R$ 的传递闭包 $t(R)$ 中元素的个数为（）

    (A) $4$

    (B) $5$

    (C) $6$

    (D) $7$

    ??? info "点击查看答案"
        **C（6）**。$t(R)$ 需补充传递关系：$(1,2)+(2,3)\to(1,3)$，$(2,3)+(3,4)\to(2,4)$，$(1,3)+(3,4)\to(1,4)$。原 3 对 + 新增 3 对 = 6。

!!! question "6. \[猜测\]"
    一个无向连通图是欧拉图的充要条件是（）

    (A) 所有顶点的度数均为偶数

    (B) 恰好有两个顶点的度数为奇数

    (C) 边数大于顶点数

    (D) 图中无环

    ??? info "点击查看答案"
        **A（所有顶点的度数均为偶数）**。欧拉图的充要条件：连通且每个顶点度数为偶数。

    ??? tip "欧拉图 vs 欧拉通路"
        - **欧拉通路**：经过每条边恰好一次的**路径**（不要求回到起点）→ 充要：连通 + 恰有 0 或 2 个奇度顶点
        - **欧拉图（欧拉回路）**：经过每条边恰好一次的**回路**（回到起点）→ 充要：连通 + 0 个奇度顶点

!!! question "7. \[猜测\]"
    下列命题公式中，是永真式的是（）

    (A) $(P\to Q)\to(Q\to P)$

    (B) $(P\land Q)\to(P\lor Q)$

    (C) $(P\to Q)\land\neg P\to\neg Q$

    (D) $P\land(P\to Q)\to\neg Q$

    ??? info "点击查看答案"
        **B（$(P\land Q)\to(P\lor Q)$）**。这是永真式：如果 $P\land Q$ 成立则 $P\lor Q$ 必成立。其余选项均非永真。

---

#### 不定项选择题

!!! question "1. \[真题\]"
    设 $(G,*)$ 是群，其中 $*$ 是通常的加法运算，则以下能够构成群的是（）

    (A) 整数集 $\mathbb{Z}$

    (B) 有理数集 $\mathbb{Q}$

    (C) 偶数集 $\{2k\mid k\in\mathbb{Z}\}$

    (D) 自然数集 $\mathbb{N}$

    ??? info "点击查看答案"
        **ABC**。$\mathbb{Z},\mathbb{Q}$ 对加法构成群；偶数集也是加法子群。$\mathbb{N}$ 无负元（逆元）。

    ??? tip "群的四条公理"
        1. **封闭性**：$\forall a,b\in G,\ a*b\in G$
        2. **结合律**：$\forall a,b,c\in G,\ (a*b)*c=a*(b*c)$
        3. **单位元**：$\exists e\in G,\forall a\in G,\ e*a=a*e=a$
        4. **逆元**：$\forall a\in G,\exists a^{-1}\in G,\ a*a^{-1}=a^{-1}*a=e$

!!! question "2. \[猜测\]"
    关于集合的幂集，下列说法中正确的有（）

    (A) 对于任何集合 $A$，恒有 $\emptyset\in\mathcal{P}(A)$

    (B) 若 $A\subseteq B$，则 $\mathcal{P}(A)\subseteq\mathcal{P}(B)$

    (C) $\mathcal{P}(A\cap B)=\mathcal{P}(A)\cap\mathcal{P}(B)$ 恒成立

    (D) $A\in\mathcal{P}(A)$ 恒成立

    ??? info "点击查看答案"
        **ABCD**。(A) 空集是任何集合的子集；(B) 幂集单调性；(C) 幂集保交(不保并)；(D) $A\subseteq A$ 恒成立，故 $A\in\mathcal{P}(A)$。

!!! question "3. \[猜测\]"
    设映射 $f:X\to Y$，$A,B\subseteq X$，$C,D\subseteq Y$。下列关系式中恒成立的有（）

    (A) $f^{-1}(C\cap D)=f^{-1}(C)\cap f^{-1}(D)$

    (B) $f(A\cap B)=f(A)\cap f(B)$

    (C) $f^{-1}(f(A))\supseteq A$

    (D) $f(f^{-1}(C))\subseteq C$

    ??? info "点击查看答案"
        **ACD**。(A) 原像保交；(B) $f(A\cap B)\subseteq f(A)\cap f(B)$，但未必相等；(C) $f^{-1}(f(A))$ 包含 $A$ 及其在 $f$ 下的原像；(D) $f(f^{-1}(C))\subseteq C$，满射时可取等。

!!! question "4. \[猜测\]"
    设 $R$ 是集合 $A$ 上的二元关系。下列说法正确的有（）

    (A) $R$ 是自反的当且仅当 $I_A\subseteq R$（其中 $I_A$ 为恒等关系）

    (B) $R$ 是对称的当且仅当 $R=R^{-1}$

    (C) $R$ 是传递的当且仅当 $R\circ R\subseteq R$

    (D) $R$ 是反对称的当且仅当 $R\cap R^{-1}\subseteq I_A$

    ??? info "点击查看答案"
        **ABCD**。均为关系性质的等价刻画。

    ??? tip "关系四性质速记"
        - **自反**：$\forall x,\ xRx$（对角线全在）
        - **反自反**：$\forall x,\ \neg(xRx)$（对角线全不在）
        - **对称**：$xRy\Rightarrow yRx$（矩阵对称）
        - **反对称**：$xRy\land yRx\Rightarrow x=y$（矩阵非对角线无对称对）
        - **传递**：$xRy\land yRz\Rightarrow xRz$

!!! question "5. \[猜测\]"
    关于图的同构和性质，下列说法正确的有（）

    (A) 两个同构的简单无向图的顶点数和边数一定分别相等

    (B) 两个同构的图一定具有相同数量的连通分支

    (C) 若两个简单无向图的度序列完全相同，则它们一定同构

    (D) 任何简单图的生成子图一定包含原图的所有顶点

    ??? info "点击查看答案"
        **ABD**。(A)(B) 同构定义保证；(C) 度序列相同非充分条件（存在不同构但度序列相同的图）；(D) ✓，生成子图 (spanning subgraph) 的定义就是 $V_1=V_2$，即包含原图所有顶点，只是边集可以是原边集的子集。

    ??? tip "子图 / 真子图 / 生成子图"
        - **子图** (subgraph)：$V_1\subseteq V_2$，$E_1\subseteq E_2$
        - **真子图** (proper subgraph)：子图且 $G_1\neq G_2$
        - **生成子图** (spanning subgraph)：子图且 $V_1=V_2$（顶点全含，边可少）

    ??? tip "度序列相同 ⇏ 同构（反例）"
        下图两个图度序列均为 $(2,2,2,2,2,2)$，但不同构：

        - $C_6$（6-cycle，连通）
        - $2\times C_3$（两个分离三角形，不连通）

        一个连通、一个不连通，显然不同构。

!!! question "6. \[猜测\]"
    下列谓词逻辑等值式中，正确的有（）

    (A) $\neg\forall x A(x)\iff\exists x\neg A(x)$

    (B) $\forall x(A(x)\land B(x))\iff\forall x A(x)\land\forall x B(x)$

    (C) $\exists x(A(x)\lor B(x))\iff\exists x A(x)\lor\exists x B(x)$

    (D) $\forall x\forall y(A(x)\to B(y))\iff\exists x A(x)\to\forall y B(y)$

    ??? info "点击查看答案"
        **ABCD**。(A)(B)(C) 为谓词逻辑基本等值式；(D) 也是正确的等值式。

        ??? info "D 的证明"
            $$
            \begin{aligned}
            \forall x\forall y(A(x)\to B(y))
            &\iff \forall x\forall y(\neg A(x)\lor B(y)) &&\text{(蕴含展开)} \\
            &\iff \forall x(\neg A(x)\lor\forall y B(y)) &&\text{($y$ 不在 $\neg A(x)$ 中自由)} \\
            &\iff \forall x\neg A(x)\lor\forall y B(y) &&\text{($x$ 不在 $\forall y B(y)$ 中自由)} \\
            &\iff \neg\exists x A(x)\lor\forall y B(y) &&\text{(量词否定)} \\
            &\iff \exists x A(x)\to\forall y B(y) &&\text{(蕴含定义)}
            \end{aligned}
            $$

    ??? tip "谓词逻辑常用等值式总结"
        | 等值式 | 说明 |
        |--------|------|
        | $\neg\forall x A \iff \exists x\neg A$ | 量词否定 |
        | $\neg\exists x A \iff \forall x\neg A$ | 量词否定 |
        | $\forall x(A\land B) \iff \forall x A\land\forall x B$ | $\forall$ 对 $\land$ 可分配 |
        | $\exists x(A\lor B) \iff \exists x A\lor\exists x B$ | $\exists$ 对 $\lor$ 可分配 |
        | $\forall x A\lor\forall x B \Rightarrow \forall x(A\lor B)$ | 单向，反向不成立 |
        | $\exists x(A\land B) \Rightarrow \exists x A\land\exists x B$ | 单向，反向不成立 |
        | $\forall x\forall y(A(x)\to B(y)) \iff \exists x A(x)\to\forall y B(y)$ | 量词前移等值式 |
        | $\forall x(A\to B) \Rightarrow \forall x A\to\forall x B$ | 全称实例化+假言推理 |

---

#### 计算题

!!! question "1. \[真题\]"
    设 $X=\{0,1,2,3\}$，$X$ 上有两个关系：
    $R_1=\{(i,j)\mid j=i+1\text{ 或 }j=\dfrac{i}{2}\}$，
    $R_2=\{(i,j)\mid i=j+2\}$。
    求下列复合关系：
    (1) $R_1\circ R_2$
    (2) $R_2\circ R_1$
    (3) $R_1\circ R_2\circ R_1$

    ??? info "点击查看答案"
        **先写出集合形式：**

        $$R_1=\{(0,1),(0,0),(1,2),(2,3),(2,1)\}$$

        $$R_2=\{(2,0),(3,1)\}$$

        ---

        **(1) $R_1\circ R_2$**

        $R_1\circ R_2$ 表示先 $R_1$ 后 $R_2$：$R_1\circ R_2=\{(x,z)\mid\exists y,(x,y)\in R_1\land(y,z)\in R_2\}$。

        遍历 $R_1$ 中的 $(x,y)$，检查 $y$ 是否在 $R_2$ 的定义域 $\{2,3\}$ 中：

        - $(1,2)\in R_1$，而 $(2,0)\in R_2$ → 得 $(1,0)$
        - $(2,3)\in R_1$，而 $(3,1)\in R_2$ → 得 $(2,1)$

        $$R_1\circ R_2=\{(1,0),(2,1)\}$$

        ---

        **(2) $R_2\circ R_1$**

        $R_2\circ R_1$ 表示先 $R_2$ 后 $R_1$：$R_2\circ R_1=\{(x,z)\mid\exists y,(x,y)\in R_2\land(y,z)\in R_1\}$。

        - $(2,0)\in R_2$，而 $(0,1),(0,0)\in R_1$ → 得 $(2,1),(2,0)$
        - $(3,1)\in R_2$，而 $(1,2)\in R_1$ → 得 $(3,2)$

        $$R_2\circ R_1=\{(2,1),(2,0),(3,2)\}$$

        ---

        **(3) $R_1\circ R_2\circ R_1$**

        按结合律：$R_1\circ R_2\circ R_1 = (R_1\circ R_2)\circ R_1 = \{(1,0),(2,1)\}\circ R_1$。

        注意先 $(R_1\circ R_2)$ 后 $R_1$：

        - 对于 $(1,0)$：$0$ 在 $R_1$ 中有后继 $(0,1),(0,0)$ → 得 $(1,1),(1,0)$
        - 对于 $(2,1)$：$1$ 在 $R_1$ 中有后继 $(1,2)$ → 得 $(2,2)$

        $$R_1\circ R_2\circ R_1=\{(1,1),(1,0),(2,2)\}$$

!!! question "2. \[真题\]"
    证明下列逻辑等值式：

    $$P\to(Q\to R)\iff(P\land Q)\to R$$

    ??? info "点击查看答案"
        $$
        \begin{aligned}
        P\to(Q\to R) &\iff \neg P\lor(\neg Q\lor R) \\
        &\iff (\neg P\lor\neg Q)\lor R \\
        &\iff \neg(P\land Q)\lor R \\
        &\iff (P\land Q)\to R
        \end{aligned}
        $$

---

#### 证明题

!!! question "1. \[真题\]"
    设 $G$ 是无向连通图，且 $G$ 中恰好有两个顶点的度数为奇数，其余顶点的度数均为偶数。证明：这两个奇数度顶点之间一定存在一条路径（即它们一定连通）。

    ??? info "点击查看答案"
        **反证法**。假设这两个奇度顶点 $u$ 和 $v$ 之间没有路径（不连通），那么它们必然分属两个不同的连通分支。

        单独看 $u$ 所在的连通分支：在这个分支里，除了 $u$ 的度数为奇数，其余顶点度数全都是偶数（因为题目说整个图只有 $u$ 和 $v$ 两个奇度点，而 $v$ 在另一个分支）。

        但根据握手定理，任何图中奇度顶点的个数必须是偶数。这个分支只有 $u$ 一个奇度顶点，矛盾。同理 $v$ 所在的分支也会推出矛盾。所以假设不成立，$u$ 和 $v$ 必在同一连通分支中，即它们之间一定连通。

        ??? info "握手定理 (Handshaking Lemma)"
            **内容**：无向图中所有顶点的度数之和等于边数的两倍，即 $\sum_{v\in V}\deg(v)=2|E|$。

            **推论**：任何图中，奇度顶点的个数一定是偶数。

            **直观理解**：每条边连接两个顶点，贡献 2 度。所以总度数 = $2\times$边数，必为偶数。偶数 = 所有偶度顶点的度数（偶数） + 所有奇度顶点的度数。偶数减去偶数还是偶数，所以所有奇度顶点的度数之和必须是偶数——每个奇度顶点贡献奇数，必须成对出现才能凑成偶数。$\square$

!!! question "2. \[真题\]"
    证明：对任意非负整数 $n$，$4^{2n+1}+3^{n+2}$ 能被 $13$ 整除。

    ??? info "点击查看答案"
        **数学归纳法**。

        $n=0$：$4^1+3^2=4+9=13$，成立。

        设 $n=k$ 成立：$4^{2k+1}+3^{k+2}=13m$。

        $n=k+1$：

        $$
        \begin{align*}
        4^{2k+3}+3^{k+3} &= 16\cdot4^{2k+1}+3\cdot3^{k+2} \\
        &= 13\cdot4^{2k+1}+3(4^{2k+1}+3^{k+2}) \\
        &= 13(4^{2k+1}+3m)
        \end{align*}
        $$

        能被 13 整除。得证。

---

### 试卷2, 部分来自历年卷(sp25)

#### 单选题

!!! question "1. \[真题\]"
    设论域为 $\{1,2\}$，则 $\exists x A(x)$ 等价于（）

    (A) $A(1)\land A(2)$

    (B) $A(1)\lor A(2)$

    (C) $\neg A(1)\lor\neg A(2)$

    (D) $A(1)\to A(2)$

    ??? info "点击查看答案"
        **B（$A(1)\lor A(2)$）**。论域有限时，$\exists x A(x)$ 等价于对各元素的析取。

!!! question "2. \[猜测\]"
    设 $A=\{a,b,c\}$，$B=\{1,2\}$，则从 $A$ 到 $B$ 的函数的个数为（）

    (A) $5$

    (B) $6$

    (C) $8$

    (D) $9$

    ??? info "点击查看答案"
        **C（8）**。从 $A$（3 元素）到 $B$（2 元素）的函数个数为 $2^3=8$。

!!! question "3. \[真题\]"
    已知 $A=\{\langle1,2\rangle,\langle2,1\rangle,\langle2,3\rangle,\langle3,4\rangle\}$，则 $A\circ A=$（）

    (A) $\{\langle1,1\rangle,\langle1,3\rangle,\langle2,2\rangle,\langle2,4\rangle\}$

    (B) $\{\langle1,1\rangle,\langle2,4\rangle\}$

    (C) $\{\langle1,1\rangle,\langle1,3\rangle,\langle2,2\rangle\}$

    (D) $\{\langle2,1\rangle,\langle3,2\rangle\}$

    ??? info "点击查看答案"
        **A（$\{\langle1,1\rangle,\langle1,3\rangle,\langle2,2\rangle,\langle2,4\rangle\}$）**。
        $A\circ A$ 计算：$(1,2)\circ(2,1)=(1,1)$，$(1,2)\circ(2,3)=(1,3)$，$(2,1)\circ(1,2)=(2,2)$，$(2,3)\circ(3,4)=(2,4)$。共 4 个。

!!! question "4. \[真题\]"
    无向图 $G$ 是欧拉图的充要条件为（）

    (A) $G$ 连通且所有顶点度数为偶数

    (B) $G$ 连通且恰有两个奇度顶点

    (C) $G$ 中所有顶点度数均为奇数

    (D) $G$ 的边数大于等于顶点数

    ??? info "点击查看答案"
        **A（$G$ 连通且所有顶点度数为偶数）**。

!!! question "5. \[真题\]"
    设 $A=\{1,2,3,4,5,6,7,8\}$，$R$ 是 $A$ 上的整除关系，$B=\{2,4,6\}$。关于 $B$ 的以下叙述正确的是（）

    (A) $B$ 有最大元 $6$，无最小元

    (B) $B$ 有上确界，无下确界

    (C) $B$ 无最大元，有极大元 $4$ 和 $6$

    (D) $B$ 的上确界是 $6$

    ??? info "点击查看答案"
        **C（$B$ 无最大元，有极大元 $4$ 和 $6$）**。在整除关系下：$2\mid4$，$2\mid6$，但 $4\nmid6$ 且 $6\nmid4$，故 $4$ 和 $6$ 不可比较，无最大元。$2$ 是极小元（整除 $4$ 和 $6$）。

        ✗ (A) $2$ 是最小元（整除 $4$ 和 $6$），无最大元。

        ✗ (B) 下确界为 $2$（$\gcd(2,4,6)=2$）；上界需是 $\operatorname{lcm}(2,4,6)=12$ 的倍数，$A$ 中没有，故无上确界。

        ✗ (D) $6$ 不是上界（$4\nmid6$），上确界不存在。

!!! question "6. \[真题\]"
    下列谓词逻辑等值式中错误的是（）

    (A) $\neg\forall x A(x)\iff\exists x\neg A(x)$

    (B) $\forall x(A(x)\land B(x))\iff\forall x A(x)\land\forall x B(x)$

    (C) $\exists x(A(x)\land B(x))\iff\exists x A(x)\land\exists x B(x)$

    (D) $\forall x\forall y(A(x)\to B(y))\iff\exists x A(x)\to\forall y B(y)$

    ??? info "点击查看答案"
        **C（$\exists x(A(x)\land B(x))\iff\exists x A(x)\land\exists x B(x)$）**。方向 $\to$ 成立，但 $\gets$ 不成立（两个存在量词可能指不同 $x$）。

    ??? tip "量词转换口诀"
        - $\neg\forall x A \iff \exists x\neg A$，$\neg\exists x A \iff \forall x\neg A$
        - $\forall$ 对 $\land$ 可分配；$\exists$ 对 $\lor$ 可分配
        - $\forall$ 对 $\lor$、$\exists$ 对 $\land$ **不可**分配（不同 $x$ 可能不同）

---

#### 不定项选择题

!!! question "1. \[真题\]"
    设 $A=\emptyset$，$B=\mathcal{P}(\mathcal{P}(A))$，则以下叙述正确的是（）

    (A) $\emptyset\in B$

    (B) $\{\emptyset,\{\emptyset,\{\emptyset\}\}\}\in B$

    (C) $\{\emptyset\}\in B$

    (D) $\emptyset\subseteq B$

    ??? info "点击查看答案"
        **ACD**。$A=\emptyset$，$\mathcal{P}(A)=\{\emptyset\}$，$\mathcal{P}(\mathcal{P}(A))=\{\emptyset,\{\emptyset\}\}=B$。
        (A) $\emptyset\in B$ ✓；(B) $\{\emptyset,\{\emptyset,\{\emptyset\}\}\}$ 不在 $B$ 中 ✗；(C) $\{\emptyset\}\in B$ ✓；(D) $\emptyset\subseteq B$ ✓。
        
        ??? tip "如何理解A与D"
            
            - (A) $\emptyset\in B$：问的是 $\emptyset$ 是不是 $B$ 的**元素**。$B=\{\emptyset,\{\emptyset\}\}$，$\emptyset$ 就在 $B$ 里，所以成立
            - (D) $\emptyset\subseteq B$：问的是 $\emptyset$ 是不是 $B$ 的**子集**。空集是任何集合的子集（$\forall S,\ \emptyset\subseteq S$），所以也成立


!!! question "2. \[真题\]"
    以下关于集合运算的说法正确的是（）

    (A) 若 $S\cup T=S\cup M$，则 $T=M$

    (B) 若 $S-T=\emptyset$，则 $S=T$

    (C) 若 $S\cap T=S\cap M$ 且 $S\cup T=S\cup M$，则 $T=M$

    (D) 若 $\overline{S}\cup T=E$（$E$ 为全集），则 $S\subseteq T$

    ??? info "点击查看答案"
        **CD**。(A) 反例：$S=\{1\},T=\{1,2\},M=\{2\}$；(B) $S-T=\emptyset$ 只说明 $S\subseteq T$；(C) 正确，集合相等可由上下界刻画；(D) 正确，$\overline{S}\cup T=E \iff S\subseteq T$。

!!! question "3. \[真题\]"
    以下函数中是单射函数的是（）

    (A) $f(x)=x+3$

    (B) $f(x)=(x+3)^2$

    (C) $f(x)=x^3+x$

    (D) $f(x)=|x+3|$

    ??? info "点击查看答案"
        **AC**。(A) $x+3$ 严格单调，单射；(B) $(x+3)^2$ 对称，$x=-2$ 和 $x=-4$ 同值；(C) $x^3+x$ 严格单调（导数为 $3x^2+1>0$），单射；(D) $|x+3|$ 对称。
        !!! tip "单射 / 满射 / 双射"

            - **单射**：$f(x_1)=f(x_2)\Rightarrow x_1=x_2$（不同输入不同输出）
            - **满射**：$\forall y\in Y,\exists x\in X,\ f(x)=y$（值域=陪域）
            - **双射**：既单又满，可逆。
            

!!! question "4. \[真题\]"
    设 $A=\{1,2,3,4,5,6,7,8,9,10\}$，关系 $R=\{(x,y)\mid x+y=11\}$，则 $R$ 具有的性质是（）

    (A) 自反性

    (B) 反自反性

    (C) 对称性

    (D) 传递性

    ??? info "点击查看答案"
        **BC**。(A) $(1,1)\notin R$，非自反；(B) $x+x=11$ 在 $A$ 中无解，故所有 $(x,x)$ 均不在 $R$ 中，反自反；(C) $x+y=11\iff y+x=11$，对称；(D) $(1,10)\in R,(10,1)\in R$ 但 $(1,1)\notin R$，非传递。

!!! question "5. \[真题\]"
    关于无向简单图 $G$，下列说法正确的是（）

    (A) 若边数 $e>v-1$（$v$ 为顶点数），则 $G$ 一定连通

    (B) 完全图 $K_v$ 的边数为 $\dfrac{v(v-1)}{2}$

    (C) 若 $G$ 是二分图，则 $G$ 不含奇圈

    (D) $v=4$ 的完全图有 $11$ 个非同构子图（不含空图）

    ??? info "点击查看答案"
        **BC**。
        
        (A) 反例：$v=5$，在 4 个顶点上取 $K_4$ 的 5 条边，剩余 1 个顶点孤立，此时 $e=5>4=v-1$ 但不连通；
        
        (B) 完全图每对顶点恰有一条边，共 $C_v^2=v(v-1)/2$ 条；
        
        (C) 二分图顶点可二染色，边只能连接异色顶点。假设含奇圈 $v_1v_2\cdots v_{2k+1}v_1$，从 $v_1$ 出发交替染色，绕一圈后 $v_1$ 同时被染两种颜色，矛盾。故二分图不含奇圈，正确；
        
        (D) 错。11 是 $|V|=4$ 的生成子图数（按边数 0~6: 1,1,2,3,2,1,1），但子图可取更少顶点：$|V|=1$ 有 1 个，$|V|=2$ 有 2 个，$|V|=3$ 有 4 个，加空图共 $1+1+2+4+11=19$ 个（不含空图 18 个）。

!!! question "6. \[真题\]"
    下列逻辑关系式中正确的是（）

    (A) $\forall x(A(x)\to B(x))\to(\forall x A(x)\to\forall x B(x))$

    (B) $(\forall x A(x)\to\forall x B(x))\to\forall x(A(x)\to B(x))$

    (C) $\exists x(A(x)\land B(x))\to\exists x A(x)\land\exists x B(x)$

    (D) $\exists x A(x)\land\exists x B(x)\to\exists x(A(x)\land B(x))$

    ??? info "点击查看答案"
        **AC**。(A) 全称实例化+假言推理，正确；(B) 方向不成立；(C) $\exists x(A\land B)$ 蕴含各自存在，正确；(D) 方向不成立，两存在量词可能不同。

---

#### 计算题

!!! question "1. \[真题\]"
    设 $A=\{0,1\}$，$B=\{1,2\}$，求 $A^2\times B$。

    ??? info "点击查看答案"
        $A^2=A\times A=\{(0,0),(0,1),(1,0),(1,1)\}$，
        $A^2\times B=\{(0,0,1),(0,0,2),(0,1,1),(0,1,2),(1,0,1),(1,0,2),(1,1,1),(1,1,2)\}$，共 8 个有序三元组。

        !!! tip "笛卡尔积"
            $A\times B=\{(a,b)\mid a\in A,\ b\in B\}$，即从 $A$ 和 $B$ 各取一元素组成有序对。
            
            基数：$|A\times B|=|A|\cdot|B|$。推广：$A_1\times A_2\times\cdots\times A_n$ 的元素是有序 $n$ 元组，基数等于各集合基数的乘积。

!!! question "2. \[真题\]"
    求命题公式 $(P\to\neg Q)\to R$ 的主析取范式和主合取范式。

    ??? info "点击查看答案"
        $(P\to\neg Q)\to R$

        $\iff \neg(\neg P\lor\neg Q)\lor R$

        $\iff (P\land Q)\lor R$

        展开为小项：$(P\land Q\land R)\lor(P\land Q\land\neg R)\lor(P\land R)\lor(\neg P\land R)$
        $=m_7\lor m_6\lor(m_7\lor m_3)\lor(m_3\lor m_1)$
        $=m_1\lor m_3\lor m_6\lor m_7$

        主合取范式：$M_0\land M_2\land M_4\land M_5$。

---

#### 证明题

!!! question "1. \[真题\]"
    证明：$(A-B)-C=A-(B\cup C)$。

    ??? info "点击查看答案"
        $$
        \begin{aligned}
        (A-B)-C &= (A\cap\overline{B})\cap\overline{C} \\
        &= A\cap(\overline{B}\cap\overline{C}) \\
        &= A\cap\overline{B\cup C} \\
        &= A-(B\cup C)
        \end{aligned}
        $$

!!! question "2. \[真题\]"
    证明：对任意大于 $1$ 的自然数 $n$，

    $$\left(1+\frac{1}{3}\right)\cdot\left(1+\frac{1}{5}\right)\cdots\left(1+\frac{1}{2n-1}\right)\ge\frac{\sqrt{2n+1}}{2}$$

    ??? info "点击查看答案"
        **数学归纳法**。

        **基础** $n=2$：

        $$(1+\frac{1}{3})=\frac{4}{3},\qquad \frac{\sqrt{5}}{2}\approx1.118,\qquad \frac{4}{3}>1.118 \;\Rightarrow\; \text{成立。}$$

        **归纳假设**：设 $n=k$ 时成立，即

        $$\left(1+\frac{1}{3}\right)\cdots\left(1+\frac{1}{2k-1}\right)\ge\frac{\sqrt{2k+1}}{2}$$

        **归纳递推** $n=k+1$：

        $$
        \begin{align*}
        \text{左边} &= \left[\left(1+\frac{1}{3}\right)\cdots\left(1+\frac{1}{2k-1}\right)\right]\cdot\left(1+\frac{1}{2k+1}\right) \\
        &\ge \frac{\sqrt{2k+1}}{2}\cdot\frac{2k+2}{2k+1} \qquad\text{（归纳假设）}\\
        &= \frac{\sqrt{2k+1}}{2}\cdot\frac{2(k+1)}{2k+1} \\
        &= \frac{k+1}{2k+1}\sqrt{2k+1}
        \end{align*}
        $$

        只需证 $\displaystyle\frac{k+1}{2k+1}\sqrt{2k+1}\ge\frac{\sqrt{2k+3}}{2}$，两边平方等价于：

        $$
        \begin{align*}
        \frac{(k+1)^2}{(2k+1)^2}\cdot(2k+1) &\ge \frac{2k+3}{4} \\
        \frac{(k+1)^2}{2k+1} &\ge \frac{2k+3}{4} \\
        4(k^2+2k+1) &\ge (2k+1)(2k+3) \\
        4k^2+8k+4 &\ge 4k^2+8k+3 \\
        4 &\ge 3
        \end{align*}
        $$

        故 $n=k+1$ 时也成立。由数学归纳法，原不等式对任意 $n>1$ 成立。

---

### 模拟卷(来自复习课)
<!-- 
#### 单选题

!!! question "1. \[模拟\]"
    设论域为全体人类，$L(x,y)$ 表示“$x$ 喜欢 $y$”，准确表达“每个人都被且仅被一个人喜欢”的是（）

    (A) $\forall x \exists y\ L(y,x)$

    (B) $\exists y \forall x\ L(y,x)$

    (C) $\forall x \exists !y\ L(x,y)$

    (D) $\forall x \exists y\left(L(y,x) \land \forall z\left(L(z,x)\rightarrow z=y\right)\right)$

    ??? info "点击查看答案"
        **D**。$\forall x\exists y(L(y,x)\land\forall z(L(z,x)\to z=y))$ 表示对每个 $x$ 存在唯一的 $y$ 喜欢 $x$。

!!! question "2. \[模拟\]"
    设集合 $S$ 中有 $n$ 个元素，满足 $A\subseteq B\subseteq S$ 的集合对 $(A,B)$ 共有（）对。

    (A) $2^n$

    (B) $3^n$

    (C) $4^n$

    (D) $3\cdot 2^n$

    ??? info "点击查看答案"
        **B（$3^n$）**。每个元素有三种归属：不在 $A$ 中、在 $A$ 中但不在 $B\setminus A$ 中、在 $B$ 中。独立选择，共 $3^n$。

!!! question "3. \[模拟\]"
    设函数 $f:\mathbb{R}\rightarrow\mathbb{R}$ 定义为 $f(x)=\lfloor x \rfloor$（向下取整函数），对于集合 $S=\{0\}$，其原像 $f^{-1}(S)$ 为（）

    (A) $\{0\}$

    (B) $[0,1)$

    (C) $(0,1]$

    (D) $\emptyset$

    ??? info "点击查看答案"
        **B（$[0,1)$）**。$f^{-1}(\{0\}) = \{x\mid \lfloor x\rfloor=0\} = [0,1)$。

!!! question "4. \[模拟\]"
    设 $(G,*)$ 是群，单位元为 $e$，如果对于 $G$ 中的任意元素 $a$ 都有 $a*a=e$，则群 $G$ 必定是（）

    (A) 循环群

    (B) 有限群

    (C) 交换群（阿贝尔群）

    (D) 非交换群

    ??? info "点击查看答案"
        **C（交换群）**。由 $a*a=e$ 知每个元素是自己的逆元（$a=a^{-1}$）。对任意 $ab$，$(ab)^2=abab=e$，故 $ab=(ab)^{-1}=b^{-1}a^{-1}$。又 $b^{-1}=b$，$a^{-1}=a$，所以 $ab=ba$。
        !!! tip "相关知识"
            $a*a=e$ 即每个元素都是自己的逆元（$a=a^{-1}$），称为**二阶群**（布尔群）。
            
            | 群类型 | 定义 | $a^2=e$ 是否蕴含 |
            |:---:|------|:---:|
            | 循环群 | 由一个元素生成 | 否 |
            | 有限群 | $\vert G\vert <\infty$ | 否 |
            | 交换群 | $\forall a,b,\ ab=ba$ | 是 |
            | 非交换群 | 存在 $ab\neq ba$ | 否 |

!!! question "5. \[模拟\]"
    设 $R$ 是非空集合 $A$ 上的二元关系，如果 $R$ 满足对称性和传递性，则下列结论必定正确的是（）

    (A) 若对于 $\forall x\in A$，都 $\exists y\in A$ 使得 $xRy$，则 $R$ 是等价关系

    (B) $R$ 是等价关系

    (C) 复合关系 $R\circ R^{-1}$ 是 $A$ 上的等价关系

    (D) $R$ 一定具有反自反性

    ??? info "点击查看答案"
        **A**。对称+传递，且每个 $x$ 都有某个 $y$ 满足 $xRy$，则 $xRx$（由 $xRy,yRx$ 及传递得），加上自反性即等价关系。

!!! question "6. \[模拟\]"
    下列谓词逻辑等价式中，不正确的是（）

    (A) $\neg(\exists x)A(x) \iff (\forall x)\neg A(x)$

    (B) $(\forall x)(A(x)\land B(x)) \iff (\forall x)A(x) \land (\forall x)B(x)$

    (C) $(\forall x)(A(x)\lor B(x)) \iff (\forall x)A(x) \lor (\forall x)B(x)$

    (D) $(\forall x)(\forall y)(A(x)\rightarrow B(y)) \iff (\exists x)A(x)\rightarrow (\forall y)B(y)$

    ??? info "点击查看答案"
        **C**。$(\forall x)(A(x)\lor B(x)) \iff (\forall x)A(x)\lor(\forall x)B(x)$ 不成立。反例：所有人要么是男性要么是女性，但并非所有人是男性或所有人是女性。
        ??? tip "D 为什么对"
            
            $$\forall x\forall y(A(x)\to B(y)) \iff \forall x\forall y(\neg A(x)\lor B(y))$$

            $$\iff \forall x(\neg A(x)\lor\forall y B(y)) \quad\text{($y$ 不在 $\neg A(x)$ 中自由)}$$

            $$\iff \forall x\neg A(x)\lor\forall y B(y) \quad\text{($x$ 不在 $\forall y B(y)$ 中自由)}$$

            $$\iff \neg\exists x A(x)\lor\forall y B(y) \iff \exists x A(x)\to\forall y B(y)$$

            对D的理解：左边 $\forall x\forall y(A(x)\to B(y))$ 意思是“只要有某个 $x$ 满足 $A$，那**所有** $y$ 都得满足 $B$”——因为一旦有 $A(x)$ 成立，蕴含式要求对**每一个** $y$ 都有 $B(y)$ 为真。右边 $\exists x A(x)\to\forall y B(y)$ 说的是完全一样的事：“如果存在一个 $x$ 满足 $A$，那么所有 $y$ 满足 $B$”。两边逻辑上等价：左边对所有 $x,y$ 的约束等同于右边对“存在 $A$”到“全称 $B$”的单一蕴含。


#### 不定项选择题

!!! question "1. \[模拟\]"
    关于集合的幂集 $\mathcal{P}(A)$，下列说法中正确的有（）

    (A) 对于任何集合 $A$，$\emptyset\in\mathcal{P}(A)$ 恒成立

    (B) $\mathcal{P}(A\cup B)=\mathcal{P}(A)\cup \mathcal{P}(B)$ 恒成立

    (C) 若 $\mathcal{P}(A)\subseteq \mathcal{P}(B)$，则 $A\subseteq B$

    (D) 设 $A$ 为有限集，则 $|\mathcal{P}(A)|=2^{|A|}$

    ??? info "点击查看答案"
        **ACD**。(A) ✓；(B) 不成立，如 $A=\{1\},B=\{2\}$；(C) 幂集单调保包含 ✓；(D) 有限集幂集基数 ✓。

!!! question "2. \[模拟\]"
    设映射 $f:X\rightarrow Y$ 且 $A,B\subseteq X,\ C,D\subseteq Y$，下列关系中恒成立的有（）

    (A) $f(A\cup B) = f(A)\cup f(B)$

    (B) $f(A\cap B) = f(A)\cap f(B)$

    (C) $f(A-B) = f(A)-f(B)$

    (D) $f^{-1}(C\cup D) = f^{-1}(C)\cup f^{-1}(D)$

    ??? info "点击查看答案"
        **AD**。(A) 像保并 ✓；(B) 像不保交（除非单射）；(C) 像不保差；(D) 原像保并 ✓。

!!! question "3. \[模拟\]"
    设 $R$ 是集合 $A$ 上的二元关系，下列命题正确的有（）

    (A) $R$ 是自反的 $\iff I_A\subseteq R$（$I_A$ 是 $A$ 上恒等关系）

    (B) $R$ 是对称的 $\iff R=R^{-1}$

    (C) $R$ 是反对称的 $\iff R\cap R^{-1}\subseteq \emptyset$

    (D) $R$ 是传递的 $\iff R\circ R\subseteq R$

    ??? info "点击查看答案"
        **ABD**。(A) ✓；(B) ✓；(C) ✗，反对称的正确等价条件是 $R\cap R^{-1}\subseteq I_A$，而非 $\subseteq\emptyset$。$R\cap R^{-1}\subseteq\emptyset$ 意味着 $R\cap R^{-1}=\emptyset$，即不存在任何 $a,b$ 同时满足 $aRb$ 和 $bRa$，这比反对称更强（反对称允许 $a=b$ 时 $(a,a)$ 同时属于两边）；(D) ✓。

!!! question "4. \[模拟\]"
    下列逻辑关系式中正确的有（）

    (A) $P\rightarrow(Q\rightarrow R) \iff (P\land Q)\rightarrow R$

    (B) $(P\rightarrow Q)\rightarrow R \iff P\rightarrow(Q\rightarrow R)$

    (C) $P\rightarrow(Q\lor R) \iff (P\rightarrow Q)\lor (P\rightarrow R)$

    (D) $(P\land Q)\rightarrow R \iff (P\rightarrow R)\land (Q\rightarrow R)$

    ??? info "点击查看答案"
        **AC**。(A) $P\to(Q\to R)\iff\neg P\lor(\neg Q\lor R)\iff\neg(P\land Q)\lor R\iff(P\land Q)\to R$ ✓；(C) ✓；(B)(D) 不成立。

!!! question "5. \[模拟\]"
    关于图的说法正确的有（）

    (A) 两个同构的简单无向图的顶点数和边数一定分别相等

    (B) 两个同构的图一定具有相同数量的连通分支

    (C) 任何简单图的生成子图一定包含原图中的所有顶点

    (D) 若两个简单无向图的各个顶点的度数所构成的序列完全相同，则这两个图同构

    ??? info "点击查看答案"
        **ABC**。(A)(B)(C) 正确；(D) 度序列相同不一定同构，需要图结构也一致。

!!! question "6. \[模拟\]"
    关于哈密顿图，下列说法正确的有（）

    (A) 所有的完全图 $K_n(n\ge3)$ 一定是哈密顿图

    (B) 所有的欧拉图一定是哈密顿图

    (C) 若图 $G$ 是哈密顿图，则从 $G$ 中去掉任意一个顶点后，剩下的图一定是连通的

    (D) 若无向连通图 $G$ 中任意两个不相邻的顶点 $u$ 和 $v$ 的度数满足 $\deg(u)+\deg(v)>n$，则 $G$ 是哈密顿图

    ??? info "点击查看答案"
        **ACD**。(A) $K_n$ 显然是哈密顿图 ✓；(B) 欧拉图不一定是哈密顿图(欧拉：每条边经过一次，哈密顿：每个顶点经过一次)；(C) 哈密顿图去掉一个顶点后必连通 ✓；(D) ✓，$>n$ 蕴含 $\ge n$，满足奥尔定理条件，故也是正确的充分条件。

        ??? info "奥尔定理 (Ore's Theorem)"
            **内容**：设 $G$ 是 $n\ge 3$ 个顶点的简单图。如果对于任意一对不相邻的顶点 $u,v$，都有

            $$\deg(u)+\deg(v)\ge n$$

            则 $G$ 是哈密顿图。

            **说明**：这是一个**充分条件**，不是必要条件。存在哈密顿图不满足这个度数条件（如 $C_5$）。

            **直观理解**：取图中一条最长的不重复路径，两端点 $u,v$ 必不相邻（否则可成圈延长）。$u$ 的邻居全在路径上，$v$ 的邻居也全在路径上。若它们不相邻，所有邻居挤在 $n-1$ 个位置里，但 $\deg(u)+\deg(v)\ge n$ 意味着它们"朋友圈"加起来覆盖了所有顶点——矛盾！所以 $u,v$ 必定相邻，路径闭合成哈密顿圈。

            **D 为什么对**：选项写的是 $>n$，既然 $>n$ 一定满足 $\ge n$，Ore 定理仍然保证 $G$ 是哈密顿图。$>n$ 是比定理原文更强的条件，不能因为不是原文就判错。


#### 计算题

!!! question "1. \[模拟\]"
    设集合 $A=\{1,2,3,4,5,6,7,8,9,10,11,12\}$，在 $A$ 上有关系 $R_1=\{(a,b)\mid a^2\equiv b^2 \pmod{5}\}$，请回答以下问题：
    (1) 请求出关系 $R_1$ 对应的划分 $\Pi_1$；
    (2) 若在 $A$ 上另有关系 $R_2=\{(a,b)\mid a\equiv b \pmod{4}\}$，请求出关系 $R_2$ 对应的划分 $\Pi_2$；
    (3) 请求出积划分 $\Pi_1\cdot \Pi_2$。

    ??? info "点击查看答案"
        **(1)** 模 5 的平方剩余：
        $0^2\equiv0$, $1^2\equiv1$, $2^2\equiv4$, $3^2\equiv4$, $4^2\equiv1\pmod{5}$

        $\Pi_1=\{\{1,4,6,9,11\},\{2,3,7,8,12\},\{5,10\}\}$（模5平方剩余为1、4、0的类）

        **(2)** 模 4 同余类：

        $\Pi_2=\{\{1,5,9\},\{2,6,10\},\{3,7,11\},\{4,8,12\}\}$

        **(3)** 积划分 $\Pi_1\cdot\Pi_2$：对每个 $x$，取 $\Pi_1$ 类和 $\Pi_2$ 类的交，非空块组成新划分：

        $$
        \begin{aligned}
        \Pi_1\cdot\Pi_2 = \{\;
        &\{1,9\},\; \{6\},\; \{11\},\; \{4\}, \\
        &\{2\},\; \{3,7\},\; \{8,12\}, \\
        &\{5\},\; \{10\}
        \;\}
        \end{aligned}
        $$

        共 10 个非空块（$3\times4=12$ 格中有 2 个为空：余4类 ∩ 模4余1 = $\emptyset$，余0类 ∩ 模4余3 = 余0类 ∩ 模4余0 = $\emptyset$）。

!!! question "2. \[模拟\]"
    设集合 $A=\{2,3,4,6,8,9,12,18,24,36\}$，关系 $R$ 为 $A$ 上的整除关系，请回答下面问题：
    (1) 画出关于 $A$ 和 $R$ 的哈斯图；
    (2) 写出 $A$ 中的最大元、最小元、极大元、极小元。

    ??? info "点击查看答案"
        **(1)** 哈斯图：

        ```mermaid
        graph BT
            2 -> 4
            2 -> 6
            3 -> 9
            4 -> 8
            4 -> 12
            6 -> 12
            6 -> 18
            8 -> 24
            9 -> 18
            9 -> 36
            12 -> 24
            12 -> 36
            18 -> 36
        ```

        **(2)** 最大元：无（36 和 24 不可比较）；最小元：无（2 和 3 不可比较）。
        极大元：24, 36；极小元：2, 3。

---

#### 证明题

!!! question "1. \[模拟\]"
    设 $A,B,C$ 均为集合，请证明下列等式恒成立：

    $$(A\cup B)\cap (B\cup C)\cap (C\cup A) = (A\cap B)\cup (B\cap C)\cup (C\cap A)$$

    ??? info "点击查看答案"
        $$
        \begin{aligned}
        (A\cup B)\cap(B\cup C) &= B\cup(A\cap C) \\
        \text{再 }\cap(C\cup A) &= [B\cup(A\cap C)]\cap(C\cup A) \\
        &= (B\cap(C\cup A))\cup((A\cap C)\cap(C\cup A)) \\
        &= (B\cap C)\cup(B\cap A)\cup(A\cap C) \\
        &= (A\cap B)\cup(B\cap C)\cup(C\cap A)
        \end{aligned}
        $$

!!! question "2. \[模拟\]"
    证明：任意正整数 $n\in \mathbb{N}^*$，$n^5-n$ 都能被 $5$ 整除。

    ??? info "点击查看答案"
        考虑模 $5$ 的同余类：$\mathbb{Z}_5=\{[0],[1],[2],[3],[4]\}$，任意正整数 $n$ 必属于其中一类。

        | $n\bmod 5$ | $n^5\bmod 5$ | $n^5-n\bmod 5$ |
        |:---:|:---:|:---:|
        | $[0]$ | $0^5=0\equiv0$ | $0-0\equiv0$ |
        | $[1]$ | $1^5=1\equiv1$ | $1-1\equiv0$ |
        | $[2]$ | $2^5=32\equiv2$ | $2-2\equiv0$ |
        | $[3]$ | $3^5=243\equiv3$ | $3-3\equiv0$ |
        | $[4]$ | $4\equiv-1,\;(-1)^5=-1\equiv4$ | $4-4\equiv0$ |

        五种情形均有 $n^5\equiv n\pmod{5}$，故 $5\mid(n^5-n)$。$\square$
-->
---
