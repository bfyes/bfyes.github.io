# CS1028 计算机系统Ⅰ — 半开卷速查手册（A4正反面手写用）

> 涵盖大纲 §1~§8。英文术语带（中文释义）。精简但覆盖绝大多数题型。

---

## 性能（Performance）

### 核心公式

$$ \text{CPU Time（CPU执行时间）} = \text{IC（指令数）} \times \text{CPI} \times T_c \text{（时钟周期）} $$

$$ T_c = \frac{1}{f} \quad\text{（时钟频率 Clock Rate）} $$

$$ \text{CPU Time} = \frac{\text{IC} \times \text{CPI}}{f} $$

**平均 CPI（Average CPI）**：\( \displaystyle \text{CPI}_{\text{avg}} = \sum_{i} (\text{Freq}_i \times \text{CPI}_i) \)

**Amdahl 定律（Amdahl's Law）**：优化比例 \(f\) 的部分提速 \(s\) 倍，整体加速比：

$$ S = \frac{1}{(1-f) + \frac{f}{s}} $$

**MIPS（Million Instructions Per Second）**：\( \displaystyle \text{MIPS} = \frac{f}{\text{CPI} \times 10^6} \)

### 单周期 CPU 时钟周期

取所有指令类型中**最长路径延迟**作为时钟周期：
$$ T_c = \max(T_{\text{fetch}} + T_{\text{reg}} + T_{\text{ALU}} + T_{\text{mem}} + T_{\text{wb}}) $$

R-type: Fetch→RegRead→ALU→RegWrite（无Mem）  
lw: Fetch→RegRead→ALU→MemRead→RegWrite（最长）  
sw: Fetch→RegRead→ALU→MemWrite  
Branch: Fetch→RegRead→ALU  

> CPI（单周期）= 1（每条指令 1 个周期）

---

## 数据表示（Data Representation）

### 进位计数制（Positional Numeral System）

| 进制 | 基数 | 数码 |
|:--:|:--:|------|
| Binary（二进制） | 2 | 0,1 |
| Octal（八进制） | 8 | 0~7 |
| Decimal（十进制） | 10 | 0~9 |
| Hexadecimal（十六进制） | 16 | 0~9, A~F |

**快速转换**：1 位八进制 = 3 bit；1 位十六进制 = 4 bit。  
例：`(17.5)₈ = (001 111.101)₂ = (F.A)₁₆ = 15.625₁₀`

### 有符号整数编码

| 编码方式 | 公式 | 8-bit 范围 |
|:--|:--|:--:|
| Unsigned（无符号） | \(\sum b_i \cdot 2^i\) | 0 ~ 255 |
| Sign-Magnitude（原码） | \((-1)^{b_{n-1}} \cdot \sum_{i=0}^{n-2} b_i \cdot 2^i\) | −127 ~ +127 |
| 1's Complement（反码） | 正数同原码；负数各位取反 | −127 ~ +127 |
| 2's Complement（补码） | 反码 + 1 | **−128 ~ +127** |
| Biased/Excess（移码/偏移码） | 真值 + Bias，Bias = \(2^{n-1}-1\) | −127 ~ +128 |

**补码快速求法**：从右向左，遇到第一个 1 之前抄下来，之后全部取反。  
**扩展（Sign Extension）**：复制符号位到高位。  
**溢出（Overflow）判定**：\(c_n \oplus c_{n-1} = 1\)（MSB 进位 XOR 次高位进位 = 1 则溢出）。  
同号相加得异号→溢出；异号相加永不溢出。

### IEEE 754 浮点数（Floating-Point）

**单精度 Single Precision（32-bit）**：

```
 1     8 bits        23 bits
┌───┬──────────┬──────────────────────┐
│ S │  E(移码)  │       F(尾数)         │
└───┴──────────┴──────────────────────┘
```

$$ V = (-1)^S \times (1.F)_2 \times 2^{E - \text{Bias}} $$

| 参数 | 单精度 (32-bit) | 双精度 (64-bit) |
|:--|:--:|:--:|
| Sign（符号）S | 1 bit | 1 bit |
| Exponent（阶码）E | 8 bits | 11 bits |
| Fraction（尾数）F | 23 bits | 52 bits |
| Bias（偏移量） | **127** | **1023** |

**特殊值**：

| E | F=0 | F≠0 |
|:--|------|------|
| E=0（全0） | **±0** | **Denormalized（非规格化）**：\(V = (-1)^S \times (0.F) \times 2^{1-\text{Bias}}\) |
| 0<E<255（全1） | 规格化数（Normalized） | 规格化数 |
| E=255（全1） | **±∞** | **NaN（Not a Number）** |

**转换步骤**：十进制→二进制科学记数法→S=符号, E=指数+Bias, F=小数部分（去前导1）。

> 例：−23.3125₁₀ → 1.01110101₂×2⁴ → S=1, E=4+127=131=10000011₂, F=01110101000000000000000₂

### Booth 乘法（Booth's Algorithm）

每次看当前位 \(y_i\) 和上一位 \(y_{i-1}\)（隐含 \(y_{-1}=0\)）：

| \(y_i\) | \(y_{i-1}\) | 操作 |
|:--:|:--:|:--|
| 0 | 0 | 仅右移 |
| 0 | 1 | +被乘数，右移 |
| 1 | 0 | −被乘数，右移 |
| 1 | 1 | 仅右移 |

### BCD 码（Binary-Coded Decimal）

4 位二进制表示 1 位十进制。例：34₁₀ → `0011 0100`BCD。

### 大小端（Endianness）

| | Big-Endian（大端） | Little-Endian（小端） |
|:--|:--|:--|
| 存储 | 高字节在低地址 | **低字节在低地址** |
| 例 0x11223344 在 0x1000 | `11 22 33 44` | `44 33 22 11` |
| 代表架构 | MIPS, SPARC, network | **x86, RISC-V** |

---

## 布尔代数 & 组合逻辑

### 布尔代数基本定律

| 定律 | AND 形式 | OR 形式 |
|:--|:--|:--|
| Identity（同一律） | \(A \cdot 1 = A\) | \(A + 0 = A\) |
| Null（零律） | \(A \cdot 0 = 0\) | \(A + 1 = 1\) |
| Idempotent（幂等律） | \(A \cdot A = A\) | \(A + A = A\) |
| Complement（互补律） | \(A \cdot \overline{A} = 0\) | \(A + \overline{A} = 1\) |
| Commutative（交换律） | \(A \cdot B = B \cdot A\) | \(A + B = B + A\) |
| Associative（结合律） | \((AB)C = A(BC)\) | \((A+B)+C = A+(B+C)\) |
| Distributive（分配律） | \(A(B+C)=AB+AC\) | \(A+BC=(A+B)(A+C)\) |
| Absorption（吸收律） | \(A(A+B)=A\) | \(A+AB=A\) |
| **De Morgan** | \(\overline{AB} = \overline{A}+\overline{B}\) | \(\overline{A+B} = \overline{A}\ \overline{B}\) |

### 逻辑门符号速查

| 门 | 符号 | 表达式 | 真值表特征 |
|:--|:--|:--|:--|
| AND（与门） | | \(F=AB\) | 全1出1 |
| OR（或门） | | \(F=A+B\) | 有1出1 |
| NOT（非门/反相器） | | \(F=\overline{A}\) | 取反 |
| NAND（与非门） | | \(F=\overline{AB}\) | 全1出0 |
| NOR（或非门） | | \(F=\overline{A+B}\) | 有1出0 |
| XOR（异或门） | | \(F=A\oplus B\) | 不同为1 |
| XNOR（同或门） | | \(F=\overline{A\oplus B}\) | 相同为1 |

**完备集**：{NAND} 或 {NOR} 单独可实现任意逻辑。  
**Bubble Pushing（气泡推演）**：沿信号线推气泡，AND↔OR 互换。

### 三态缓冲器（Tri-State Buffer）

输出有三种状态：**0, 1, 高阻（Hi-Z/High Impedance）**。  
使能 E=1 时输出=输入；E=0 时高阻（相当于断开）。  
多个三态门输出可并联到同一总线，**同时最多 1 个使能**。

### 门输入成本（Gate Input Cost）

$$ G = \text{所有门输入端口总数} $$
$$ GN = G + \text{非门数（取反操作数）} $$

例：\(F = A + B\overline{C}(A\overline{B}+\overline{A}B)\)，直接算 \(G = 11\)。

---

## 卡诺图（Karnaugh Map / K-Map）

### K-Map 布局（Gray Code 顺序）

**2变量**：`\begin{matrix} & B=0 & B=1 \\ A=0 & m_0 & m_1 \\ A=1 & m_2 & m_3 \end{matrix}`

**3变量**（BC 用 Gray：00,01,11,10）：

```
     BC
      00  01  11  10
A=0  m0  m1  m3  m2
A=1  m4  m5  m7  m6
```

**4变量**（AB 行, CD 列）：

```
       CD
       00  01  11  10
AB=00  m0  m1  m3  m2
AB=01  m4  m5  m7  m6
AB=11  m12 m13 m15 m14
AB=10  m8  m9  m11 m10
```

> 边缘相邻！四角可以圈。圈大小必须是 \(2^n\)（1,2,4,8,16）。

### K-Map 优化步骤

1. 圈 **Essential Prime Implicant（必要质蕴含）**：包含至少一个仅被它覆盖的 1。
2. 圈其余 Prime Implicant（质蕴含）：最大矩形，不可再扩大。
3. 覆盖所有 1，**Don't Care（无关项/d）** 可选圈可不圈。
4. SOP（Sum of Products）：圈 1，写出 AND 项的 OR。
5. POS（Product of Sums）：圈 0，写出 OR 项的 AND（取反后）。

### 规范式（Canonical Forms）

- **Minterm（最小项）**：每个变量都出现的 AND 项，使函数为 1。记作 \(\sum m(\dots)\)。
- **Maxterm（最大项）**：每个变量都出现的 OR 项，使函数为 0。记作 \(\prod M(\dots)\)。
- \(\sum m(\dots) \leftrightarrow \prod M(\text{补集})\)。

---

## 组合功能块（Combinational Blocks）

### 译码器（Decoder）

n 输入 → \(2^n\) 输出，每次仅一根输出有效。  
可用 Enable（使能端）级联扩展。  
例：3-to-8 Decoder（3×8 译码器）；2-to-4 带使能可级联成 4-to-16。

### 多路选择器（Multiplexer / MUX）

\(2^n\) 数据输入 + n 选择线 → 1 输出。  
**通用逻辑实现**：n 变量 → \(2^{n-1}\)-to-1 MUX + 可选反相器。  
4-to-1 MUX 输出公式：
$$ O = \overline{S_1}\,\overline{S_0}\,I_0 + \overline{S_1}\,S_0\,I_1 + S_1\,\overline{S_0}\,I_2 + S_1\,S_0\,I_3 $$

**Verilog 三元运算符**：`assign O = S ? (S0 ? I1 : I0) : (S0 ? I3 : I2);`（注意顺序取决于 MSB 定义）

### 编码器（Encoder）

\(2^n\) 输入 → n 输出。优先级编码器（Priority Encoder）处理多输入同时有效。

---

## 运算单元（Arithmetic Unit）

### 加法器

**Ripple-Carry Adder（行波进位加法器）**：串联 n 个全加器（Full Adder/FA），延迟 \(O(n)\)。

**Carry Lookahead Adder（超前进位加法器/CLA）**：
- Generate（生成）：\(G_i = A_i \cdot B_i\)
- Propagate（传播）：\(P_i = A_i \oplus B_i\)
- Carry：\(C_{i+1} = G_i + P_i \cdot C_i\)
- 展开：\(C_1=G_0+P_0C_0\), \(C_2=G_1+P_1G_0+P_1P_0C_0\), …

### 减法

\(A - B = A + (\sim B) + 1\)（补码加法）。用加法器 + 取反 + 进位输入=1。

### 标志位（Flags）

| 标志 | 含义 | 条件 |
|:--|:--|:--|
| C（Carry/进位） | 无符号溢出 | 最高位有进位/借位 |
| V（Overflow/溢出） | 有符号溢出 | \(c_n \oplus c_{n-1}\) |
| N（Negative/负） | 结果最高位=1 | 符号位 |
| Z（Zero/零） | 结果为 0 | 所有位=0 |

### 乘法器

\(n \times n\) 位乘法 → 结果最多 \(2n\) 位。  
例：5-bit × 5-bit → **10 bits**。

### ALU（Arithmetic Logic Unit / 算术逻辑单元）

支持：ADD, SUB, AND, OR, XOR, SLT（Set Less Than）, SLL/SRL/SRA（移位）等。

---

## 时序逻辑（Sequential Logic）

### 基本概念

- **Combinational（组合）** vs **Sequential（时序）**：后者输出依赖当前输入 + 历史状态。
- **Synchronous（同步）**：由时钟边沿统一驱动。**Asynchronous（异步）**：无统一时钟。
- **Moore（摩尔机）**：输出仅依赖状态。**Mealy（米利机）**：输出依赖状态 + 输入。
- **State Diagram（状态图）**：圆圈=状态，箭头=转移（label: 输入/输出）。
- **State Table（状态表）**：当前状态 + 输入 → 下一状态 + 输出。

### 锁存器 & 触发器（Latch & Flip-Flop）

| 类型 | 特点 |
|:--|:--|
| SR Latch（SR锁存器） | S=Set(置1), R=Reset(置0); S=R=1 非法（NOR型）/ S=R=0 非法（NAND型） |
| D Latch（D锁存器） | 电平触发（Level-Triggered），CLK=1 时透明 |
| D Flip-Flop（D触发器） | **边沿触发（Edge-Triggered）**，上升沿采样 |
| Master-Slave（主从触发器） | 两个锁存器级联，上升沿主锁存，下降沿从锁存 |

**特性方程**：

| 类型 | \(Q(t+1)\) = |
|:--|:--|
| D-FF | \(D\)（输出=输入） |
| SR-FF | \(S + \overline{R}\,Q\)（SR=11 非法） |
| JK-FF | \(J\,\overline{Q} + \overline{K}\,Q\)（JK=11 翻转） |
| T-FF | \(T \oplus Q\)（T=1 翻转，T=0 保持） |

> **D-FF 为主流**：SR 有非法态；JK 功能全但复杂。

### 时序分析参数

| 参数 | 含义 |
|:--|:--|
| \(t_{\text{pd}}\)（Propagation Delay / 传播延迟） | 输入变化到输出稳定的时间 |
| \(t_s\)（Setup Time / 建立时间） | 时钟边沿前输入必须稳定的时间 |
| \(t_h\)（Hold Time / 保持时间） | 时钟边沿后输入必须保持的时间 |
| \(t_{\text{pcq}}\)（Clock-to-Q / 时钟到输出延迟） | 时钟边沿到输出变化 |

**时钟周期约束**：\(T_c \ge t_{\text{pcq}} + t_{\text{pd(comb)}} + t_s\)

**Hold Time 约束**：\(t_{\text{pcq(min)}} + t_{\text{pd(comb,min)}} \ge t_h\)

### 计数器（Counter）

**N 位二进制计数器**：\(2^N\) 个状态，每个时钟 +1。  
**模 N 计数器**：计数到 N−1 后归零，需 N 个状态。  
同步清零 vs 异步清零：同步需等到时钟边沿。

**Johnson/环形计数器**：n 个 FF → 2n 个状态（Johnson）。

### 寄存器（Register）& 寄存器传输

**Register（寄存器）**：n 个 D-FF 并行，存 n-bit 数据。  
**Shift Register（移位寄存器）**：串联 D-FF，数据逐位移动。  
微操作：`sr`（右移）、`sl`（左移）、`R1 ← R1 ⊕ R2`（异或）等。

---

## ISA & RISC-V

### 设计原则

1. **Simplicity favors regularity**（简单利于规整）
2. **Smaller is faster**（越小越快）
3. **Make the common case fast**（加速常见情况）
4. **Good design demands good compromises**（好的设计需要好的折中）

### RISC-V 指令格式

**6 种格式**（所有指令 32-bit）：

```
R-type：funct7[31:25] | rs2[24:20] | rs1[19:15] | funct3[14:12] | rd[11:7] | opcode[6:0]
I-type：   imm[11:0][31:20]          | rs1[19:15] | funct3[14:12] | rd[11:7] | opcode[6:0]
S-type：imm[11:5][31:25] | rs2[24:20] | rs1[19:15] | funct3[14:12] | imm[4:0][11:7] | opcode[6:0]
B-type：imm[12|10:5][31:25]|rs2[24:20]| rs1[19:15] | funct3[14:12] | imm[4:1|11][11:7] | opcode[6:0]
U-type：            imm[31:12][31:12]                             | rd[11:7] | opcode[6:0]
J-type：   imm[20|10:1|11|19:12][31:12]                           | rd[11:7] | opcode[6:0]
```

**位宽汇总**：

| | R | I | S | B | U | J |
|:--|:--:|:--:|:--:|:--:|:--:|:--:|
| opcode | 7 | 7 | 7 | 7 | 7 | 7 |
| rd | 5 | 5 | — | — | 5 | 5 |
| funct3 | 3 | 3 | 3 | 3 | — | — |
| rs1 | 5 | 5 | 5 | 5 | — | — |
| rs2 | 5 | — | 5 | 5 | — | — |
| funct7 | 7 | — | — | — | — | — |
| imm | — | 12 | 12 | 12(×) | 20 | 20(×) |

> B/J-type 的 imm bit0 总是 0（隐含），不存储。imm 拼接公式见下。

### RISC-V 核心指令 & 编码

| 指令 | 类型 | opcode | funct3 | funct7 | 含义 |
|:--|:--|:--:|:--:|:--:|:--|
| `add rd, rs1, rs2` | R | 0110011 | 000 | 0000000 | rd=rs1+rs2 |
| `sub rd, rs1, rs2` | R | 0110011 | 000 | 0100000 | rd=rs1−rs2 |
| `sll rd, rs1, rs2` | R | 0110011 | 001 | 0000000 | rd=rs1<<rs2 |
| `slt rd, rs1, rs2` | R | 0110011 | 010 | 0000000 | rd=(rs1<rs2)?1:0 |
| `xor rd, rs1, rs2` | R | 0110011 | 100 | 0000000 | rd=rs1^rs2 |
| `srl rd, rs1, rs2` | R | 0110011 | 101 | 0000000 | rd=rs1>>rs2（逻辑） |
| `sra rd, rs1, rs2` | R | 0110011 | 101 | 0100000 | rd=rs1>>rs2（算术） |
| `or rd, rs1, rs2` | R | 0110011 | 110 | 0000000 | rd=rs1\|rs2 |
| `and rd, rs1, rs2` | R | 0110011 | 111 | 0000000 | rd=rs1&rs2 |
| `addi rd, rs1, imm` | I | 0010011 | 000 | | rd=rs1+imm（符号扩展） |
| `slli rd, rs1, shamt` | I | 0010011 | 001 | 0000000 | rd=rs1<<shamt |
| `slti rd, rs1, imm` | I | 0010011 | 010 | | rd=(rs1<imm)?1:0 |
| `xori rd, rs1, imm` | I | 0010011 | 100 | | rd=rs1^imm |
| `srli rd, rs1, shamt` | I | 0010011 | 101 | 0000000 | rd=rs1>>shamt（逻辑） |
| `srai rd, rs1, shamt` | I | 0010011 | 101 | 0100000 | rd=rs1>>shamt（算术） |
| `ori rd, rs1, imm` | I | 0010011 | 110 | | rd=rs1\|imm |
| `andi rd, rs1, imm` | I | 0010011 | 111 | | rd=rs1&imm |
| `lb rd, imm(rs1)` | I | 0000011 | 000 | | rd=Mem[rs1+imm]（byte） |
| `lh rd, imm(rs1)` | I | 0000011 | 001 | | rd=Mem[rs1+imm]（half） |
| `lw rd, imm(rs1)` | I | 0000011 | 010 | | rd=Mem[rs1+imm]（word） |
| `lbu rd, imm(rs1)` | I | 0000011 | 100 | | rd=Mem[rs1+imm]（byte无符号） |
| `lhu rd, imm(rs1)` | I | 0000011 | 101 | | rd=Mem[rs1+imm]（half无符号） |
| `jalr rd, rs1, imm` | I | 1100111 | 000 | | rd=PC+4; PC=rs1+imm |
| `sb rs2, imm(rs1)` | S | 0100011 | 000 | | Mem[rs1+imm]=rs2（byte） |
| `sh rs2, imm(rs1)` | S | 0100011 | 001 | | Mem[rs1+imm]=rs2（half） |
| `sw rs2, imm(rs1)` | S | 0100011 | 010 | | Mem[rs1+imm]=rs2（word） |
| `beq rs1, rs2, label` | B | 1100011 | 000 | | if(rs1==rs2) PC+=imm |
| `bne rs1, rs2, label` | B | 1100011 | 001 | | if(rs1!=rs2) PC+=imm |
| `blt rs1, rs2, label` | B | 1100011 | 100 | | if(rs1<rs2) PC+=imm |
| `bge rs1, rs2, label` | B | 1100011 | 101 | | if(rs1>=rs2) PC+=imm |
| `bltu rs1, rs2, label` | B | 1100011 | 110 | | if(rs1<rs2,无符号) |
| `bgeu rs1, rs2, label` | B | 1100011 | 111 | | if(rs1>=rs2,无符号) |
| `lui rd, imm` | U | 0110111 | | | rd=imm<<12 |
| `auipc rd, imm` | U | 0010111 | | | rd=PC+(imm<<12) |
| `jal rd, label` | J | 1101111 | | | rd=PC+4; PC+=offset |

### 伪指令（Pseudoinstructions）

| 伪指令 | 实际展开 | 含义 |
|:--|:--|:--|
| `nop` | `addi x0, x0, 0` | 空操作 |
| `li rd, imm` | `addi rd, x0, imm`（±2047内） / `lui+addi`（大立即数） | 加载立即数 |
| `mv rd, rs` | `addi rd, rs, 0` | 寄存器复制 |
| `not rd, rs` | `xori rd, rs, -1` | 按位取反 |
| `neg rd, rs` | `sub rd, x0, rs` | 取负 |
| `beqz rs, label` | `beq rs, x0, label` | =0 则跳 |
| `bnez rs, label` | `bne rs, x0, label` | ≠0 则跳 |
| `j label` | `jal x0, label` | 无条件跳 |
| `jr rs` | `jalr x0, rs, 0` | 寄存器跳 |
| `ret` | `jalr x0, x1, 0` | 返回 |
| `call label` | `auipc x1, …; jalr x1, …` | 函数调用 |
| `sne rd, rs1, rs2` | `xor rd, rs1, rs2; sltu rd, x0, rd` | rd=(rs1≠rs2)?1:0 |

### RISC-V 寄存器约定

| 寄存器 | ABI 名称 | 用途 |
|:--:|:--|:--|
| x0 | zero | 恒为 0 |
| x1 | ra | 返回地址（Return Address） |
| x2 | sp | 栈指针（Stack Pointer） |
| x3 | gp | 全局指针（Global Pointer） |
| x4 | tp | 线程指针（Thread Pointer） |
| x5–x7 | t0–t2 | 临时寄存器（Temporaries） |
| x8 | s0/fp | 帧指针（Frame Pointer） |
| x9 | s1 | 保存寄存器（Saved） |
| x10–x17 | a0–a7 | 函数参数/返回值 |
| x18–x27 | s2–s11 | 保存寄存器（Saved） |
| x28–x31 | t3–t6 | 临时寄存器（Temporaries） |

> **Caller-saved（调用者保存）**：t0–t6, ra, a0–a7 — 调用者需保存。  
> **Callee-saved（被调用者保存）**：s0–s11, sp — 被调用者负责保存恢复。

### 函数调用约定（Calling Convention）

**栈帧（Stack Frame）**：从高地址向低地址增长。

```
高地址 → 参数 (argN...)
        返回地址 (ra)
        旧 fp
       局部变量
低地址 → sp
```

- `a0–a7` 传前 8 个参数，其余压栈。
- 返回值在 `a0`（和 `a1` 如需要）。
- `sp` 始终 16 字节对齐。
- C 语言：参数从右向左压栈，调用者清理。

---

## 寻址方式（Addressing Modes）

| 寻址方式 | 有效地址 E | 说明 |
|:--|:--|:--|
| Immediate（立即） | 操作数在指令中 | 无地址 |
| Register（寄存器） | 操作数在寄存器 | 无地址 |
| Direct（直接） | E = Disp | |
| Base（基址） | E = B | B=基址寄存器 |
| Base + Displacement（基址+偏移） | E = B + Disp | |
| Scaled Index + Disp（比例变址+偏移） | E = I×S + Disp | S=1,2,4,8 |
| Base + Index + Disp | E = B + I + Disp | |
| Base + Scaled Index + Disp | E = B + I×S + Disp | |
| PC-Relative（PC相对） | E = PC + Disp | 分支/跳转 |

---

## 单周期 CPU 数据通路（Single-Cycle Datapath）

### 核心部件

| 部件 | 缩写 | 功能 |
|:--|:--|:--|
| PC（程序计数器） | PC | 存放下一条指令地址 |
| Instruction Memory（指令存储器） | IM | 根据 PC 取出指令 |
| Register File（寄存器堆） | Reg | 读 rs1/rs2，写 rd |
| ALU（算术逻辑单元） | ALU | 执行运算 |
| Data Memory（数据存储器） | DM | 读/写内存数据 |
| Immediate Generator（立即数生成器） | ImmGen | 从指令字段拼接立即数 |
| Control Unit（控制器） | CU | 产生控制信号 |
| ALU Control（ALU控制器） | ALUCtrl | 决定 ALU 操作 |
| Adder（加法器） | Add | PC+4 或 PC+imm |

### 控制信号表

| 信号 | 0 | 1 | 说明 |
|:--|:--:|:--:|:--|
| **RegWrite** | 不写 | 写 | 寄存器堆写使能 |
| **ALUSrc** | rs2（寄存器） | imm（立即数） | ALU 第二操作数选择 |
| **MemWrite** | 不写 | 写 | DM 写使能 |
| **MemRead** | 不读 | 读 | DM 读使能（*部分设计用 MemtoReg 替代） |
| **MemtoReg** | ALU 结果 | DM 数据 | 写回寄存器数据来源 |
| **Branch** | 不分支 | beq | 条件分支 |
| **Jump** | — | 跳转 | jal/jalr |
| **PCSrc** | PC+4 | PC+imm | PC 来源选择 |
| **RegDst**（*如有） | rt | rd | 写寄存器选择 |

**各指令控制信号值**：

| 指令 | RegWrite | ALUSrc | MemWrite | MemRead | MemtoReg | Branch |
|:--|:--:|:--:|:--:|:--:|:--:|:--:|
| R-type | 1 | 0 | 0 | 0 | 0 | 0 |
| lw | 1 | 1 | 0 | 1 | 1 | 0 |
| sw | 0 | 1 | 1 | 0 | X | 0 |
| beq | 0 | 0 | 0 | 0 | X | 1 |

**ALU Control**：

| ALUOp | 指令 | ALU 操作 |
|:--:|:--|:--:|
| 00 | lw/sw | ADD |
| 01 | beq | SUB |
| 10 | R-type | 由 funct3/funct7 决定 |

### 关键数据通路连线

- **取值阶段**：PC → IM → 指令 → Control + Reg(rs1,rs2) + ImmGen
- **执行阶段**：Reg(data1) → ALU(A); Reg(data2) 或 Imm → ALU(B); ALU → result
- **访存阶段**：ALU result → DM addr; DM 读写
- **写回阶段**：ALU result 或 DM data → Reg write data → rd

### 单周期数据通路的局限性

IM 和 DM **不能合并**：因为单周期需要同时取指和访存（如 lw 需同时读 IM 取指令 + 读 DM 取数据）。  
若用统一 MEM，只能用多周期实现（分时复用）。

---

## 多周期 CPU 设计（Multi-Cycle CPU）

### 多周期 vs 单周期

| | 单周期 | 多周期 |
|:--|:--|:--|
| 每条指令时间 | 固定 = 最长指令 | 变长，按需 |
| 时钟周期 | 长（取最长路径） | 短（取最长阶段） |
| CPI | 1 | >1（通常 3~5） |
| 硬件复用 | 少 | 多（共享 ALU/MEM） |
| 需要额外寄存器 | 无 | IR, MDR, A, B, ALUout |
| 控制器 | 组合逻辑 | FSM 或 微程序 |

### 多周期额外寄存器

| 寄存器 | 用途 |
|:--|:--|
| IR（Instruction Register / 指令寄存器） | 保存当前指令 |
| MDR（Memory Data Register / 存储器数据寄存器） | 保存从 MEM 读出的数据 |
| A, B | 保存 ALU 操作数 |
| ALUout | 保存 ALU 计算结果 |

> **IR 是多周期独有**，单周期不需要。

### 执行阶段（5 阶段）

| 阶段 | 缩写 | 操作 |
|:--|:--|:--|
| Fetch（取指） | IF | IR = Mem[PC]; PC = PC + 4 |
| Decode（译码） | ID | A=Reg[rs1]; B=Reg[rs2]; ALUout=PC+imm |
| Execute（执行） | EX | ALU 运算，计算地址或结果 |
| Memory（访存） | MEM | 读/写数据存储器 |
| Write Back（写回） | WB | 结果写回寄存器堆 |

### 控制器实现方式

| | Hardwired（硬布线/FSM） | Microprogrammed（微程序） |
|:--|:--|:--|
| 实现 | 组合逻辑 + 状态寄存器 | ROM 存储微指令序列 |
| 速度 | 快 | 慢 |
| 灵活性 | 低 | 高 |
| 复杂度 | 复杂指令时状态爆炸 | 整齐，易修改 |

---

## 指令格式设计（汇总公式）

**32-bit 统一格式设计**：

- Opcode bits：\(\lceil \log_2(\text{指令数}) \rceil\)
- Register bits：\(\lceil \log_2(\text{寄存器数}) \rceil\)
- 余下 = 32 − opcode − rd − rs1 − rs2 − funct 等

**主存容量与地址线**：  
容量 = \(2^{\text{地址线数}} \times \text{字长}\)。  
例：256K 字 → 地址线 = \(\log_2(256\text{K}) = 18\)。

---

## 逻辑电路分析补充

### 4×1 MUX 通用实现法

用 A, B 做选择线 → 4 种情况 AB=00,01,10,11 分别化简 C, D 的函数。

### 译码器级联

**2×3-to-8 → 4-to-16**：用第 4 输入控制使能，反相后分别给两个 3-to-8。  
高位=0 → Decoder0 使能（输出 D0~D7）；高位=1 → Decoder1 使能（输出 D8~D15）。

**5×2-to-4 → 4-to-16**：树形结构，1 个做顶层选片，4 个做底层输出。

### 比较器设计

**1-bit 比较器**：

| A | B | X(A>B) | Y(A<B) | Z(A==B) |
|:--:|:--:|:--:|:--:|:--:|
| 0 | 0 | 0 | 0 | 1 |
| 0 | 1 | 0 | 1 | 0 |
| 1 | 0 | 1 | 0 | 0 |
| 1 | 1 | 0 | 0 | 1 |

X = A·\\(\overline{B}\\), Y = \\(\overline{A}\\)·B, Z = A⊙B = \\(\overline{A \oplus B}\\)。

**2-bit 级联**：先比高位，高位相等再比低位。  
A>B: (A1>B1) OR (A1==B1 AND A0>B0)。

---

## 高频易错点

1. **补码范围**：n-bit 补码范围是 \(-2^{n-1}\) ~ \(2^{n-1}-1\)，不对称！8-bit: −128~+127。
2. **IEEE 754 隐含 1**：规格化数 F 前面隐含 `1.`，非规格化数隐含 `0.`。
3. **B-type imm**：bit0 不存（恒为 0），imm 字段重排：`imm[12|10:5]` 在 [31:25]，`imm[4:1|11]` 在 [11:7]。
4. **J-type imm**：`imm[20|10:1|11|19:12]`，bit0 也不存。
5. **lw 是最长路径**：单周期时钟 = lw 的延迟（Fetch+Reg+ALU+Mem+WB）。
6. **S-R Latch 非法态**：NOR 型 S=R=1 非法（Q=\\(\overline{Q}\\)=0 但违反互补）；NAND 型 S=R=0 非法。
7. **D-FF 是最简触发器**：没有非法态，没有翻转态，设计首选。
8. **Moore vs Mealy**：Moore 输出只看状态（更稳定）；Mealy 输出看状态+输入（更快响应但可能毛刺）。
9. **大端序 vs 小端序**：网络字节序=大端；x86/RISC-V(默认) = 小端。
10. **调用约定**：`call` = push IP + jmp；`ret` = pop IP。`int` = push FLAGS→CS→IP + jmp far；`iret` = pop IP→CS→FLAGS。
11. **repne vs loop**：`repne` 先判 CX=0（0 次机会）；`loop` 先 dec 后判（CX=0→循环 10000h 次）。
12. **inc/dec 不影响 CF**；`not` 不影响任何标志位；`lea` 不访问内存只算地址。
13. **K-Map 边缘相邻**：最左列和最右列相邻，最上行和最下行相邻，四角可圈。

---

## 考试解题套路

### 性能题
1. 找瓶颈（最长指令），算 \(T_c\)。
2. 给 CPI 和频率 → CPU Time = IC×CPI/f。
3. 优化后反推：新执行时间 → 新 IC → 新 CPI → 新 f。

### IEEE 754 转换题
十进制 → 二进制科学计数 → S + E(Bias) + F(去1.) → 拼 32-bit。

### 补码/溢出题
- 求补码：正数直接写，负数各位取反+1。
- 判溢出：看符号位，同加得异为溢出。

### RISC-V 编码题
1. 确定指令类型（R/I/S/B/U/J）。
2. 按格式填 opcode/funct3/funct7/reg/imm。
3. imm 符号扩展到 32-bit（如果有）。

### 数据通路题
1. 画部件：PC, IM, Reg, ALU, DM, MUX, 加法器。
2. 连线：数据流 + 控制信号。
3. 新增指令：分析需要哪些阶段，加 MUX + 连线。

### K-Map 题
1. 填 1, 0, d（无关项）。
2. 圈必要质蕴含 → 圈最大质蕴含 → 覆盖所有 1。
3. SOP: 圈 1；POS: 圈 0 取反。

### 时序电路题
1. 画状态图（圈圈+箭头+标注）。
2. 写状态表（现态+输入→次态+输出）。
3. 编码状态 → 写次态方程 → 化简（K-map）→ 画电路（D-FF+门）。

### 计数器题
D-FF 实现：写出状态转换表 → 推导 \(D_i = f(Q_2, Q_1, Q_0)\) → 化简 → 连线。

### 指令格式设计题
opcode bits = ⌈log₂(指令数)⌉；寄存器 bits = ⌈log₂(寄存器数)⌉；余下给 imm/address。


