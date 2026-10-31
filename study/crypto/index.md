# 数据安全与密码学基础

> [!WARNING]
>
> **自用，非原创，不完整**

## lec 1

> [!TIP]
>
> **符号和语法**
>
> - Gen, 密钥生成算法，R
> - Enc, 加密算法，R/D
> - Dec, 解密算法，D
> - M 明文空间
> - K 密钥空间
>
> > R: Randomized Algorithm 随机算法
> >
> > D: Deterministic Algorithm 确定算法

> [!TIP]
>
> **攻击场景**
>
> - Ciphertext-only attack：唯密文攻击。只知道密文。
> - Known-plaintext attack：已知明文攻击。知道一些明文和对应的密文。
> - Chosen-plaintext attack：选择明文攻击。有权限选择明文加密成密文。
> - Chosen-ciphertext attack：选择密文攻击。有权限选择密文解密成明文。对手的目的依旧是确定其他密文的明文（其明文不能直接得到）。
>
> 防范密码学攻击方式的难易程度：选择密文攻击 \> 选择明文攻击 \> 已知明文攻击 \> 唯密文攻击
>
> 四种密码攻击方式中破解难易度：唯密文攻击 \> 已知明文攻击 \> 选择明文攻击 \> 选择密文攻击

> [!TIP]
>
> **正确性的定义**
>
> 算法的正确性: \\(\\forall m \\in M,\\Pr\\limits\_{sk\\leftarrow Gen}\[Dec(Enc(sk, m))=m\]=1\\)

> [!TIP]
>
> **Kerckhoffs原则**
>
> 柯克霍夫原则(Kerckhoffs's principle): 一个密码系统的安全性，必须完全依赖于密钥（Key）的保密性，而不能依赖于算法或系统本身的保密性。

> [!TIP]
>
> **古典加密**
>
> - Caesar加密，凯撒。
> - Substitution加密，单字母替换。
>
> 唯密文攻击。

> [!TIP]
>
> **现代密码学的基本原则**
>
> - Assumption（精确假设）： 方案安全所依赖的底层数学难题必须被精确陈述，且假设要尽可能少、尽可能弱。
> - Definition（形式化定义）： 严格量化安全目标，即界定“具有何种能力的敌手，无法实现何种程度的破解”。
> - Reduction（归约证明）： 用反证法证明“若有人能攻破该方案，就能解决底层数学假设”，从而确立安全性。

## lec 2

> [!TIP]
>
> **Shannon Privacy 和 Perfect Privacy**
>
> - 香农保密性（Shannon Privacy / Attempt3）
>
>   > 视角：信息论视角。密文不泄露关于明文的任何额外信息，即后验概率等于先验概率：\\(\\Pr\[M = m \\mid C = c\] = \\Pr\[M = m\]\\)。
> - 完善保密性（Perfect Privacy / Attempt4）
>
>   > 视角：概率分布视角。密文的概率分布与具体的明文无关，任意两条明文生成同一密文的概率恒等：\\(\\Pr\[\\operatorname{Enc}(sk, m\_0) = c\] = \\Pr\[\\operatorname{Enc}(sk, m\_1) = c\]\\)。
> - 完美不可区分性（Perfect Indistinguishability / Further Discussion）
>
>   > 视角：博弈实验（Game-based）视角。面对具有**无限计算能力**的敌手 \\(\\mathcal{A}\\)，敌手在窃听不可区分实验（\\(\\text{PrivK}^{\\text{eav}}\\)）中成功猜测明文的概率严格等于盲猜概率，即 \\(\\Pr\[\\text{PrivK}^{\\text{eav}}\_{\\mathcal{A},\\Pi} = 1\] = \\frac{1}{2}\\)。
>
> 三者等价。

> [!TIP]
>
> **一次一密**
>
> 一次一密（One-Time Pad，OTP）满足Perfect Privacy
>
> 缺陷是它要求密钥和明文有相同长度
>
> 只使用一次时是安全的

> [!TIP]
>
> **香农定理**
>
> 香农定理给出了在极限效率下实现完善保密加密（Perfect Privacy）的充要条件。由于完善保密要求密钥空间不能小于明文空间（\\(\\vert{}K\\vert{} \\ge \\vert{}M\\vert{}\\)），且为了正确解密密文空间也不能小于明文空间（\\(\\vert{}C\\vert{} \\ge \\vert{}M\\vert{}\\)），因此三者空间大小严格相等（\\(\\vert{}K\\vert{} = \\vert{}M\\vert{} = \\vert{}C\\vert{}\\)）代表了理论上的**最优效率**（如一次一密 OTP，密钥长度最短且无冗余）。
>
> 在该最优前提下，一个方案达到完善保密**当且仅当**满足两个条件：一是**密钥完全均匀随机**，即生成算法选出任意密钥的概率均为 \\(1/\\vert{}K\\vert{}\\)；二是**映射具有唯一双射性**，即对于任意给定的明文和密文，存在且仅存在唯一的密钥能将该明文加密为该密文。这意味着敌手截获密文后，每个候选明文都以完全相等的概率被唯一密钥对应，密文无法提供关于明文的任何额外信息。

## lec 3

> [!TIP]
>
> **计算安全**
>
> 放宽条件。
>
> - 1\) Relaxition1：Attacker’s computational power is bounded.
> - 2\) Relaxition2: Advantage is small.
>
> ---
>
> 面对任意 PPT（多项式时间）敌手，攻破该方案的成功概率都是 \\(\\operatorname{negl}(n)\\)（可忽略的），则称该方案在渐进意义下是计算安全的。
>
> 如果每个概率多项式时间的敌手 \\(\\mathcal{A}\\) 执行某个特定类型的攻击，对于每个多项式 \\(p(\\cdot)\\)，存在一个整数 \\(N\\)，对 \\(n \> N\\)，\\(\\mathcal{A}\\) 在这次攻击中成功的概率小于 \\(\\frac{1}{p(n)}\\)，则这个方案是安全的。
>
> ---
>
> 多项式的性质
>
> - 1\) Language Independent,
> - 2\) composition(Poly \* poly = poly),
> - 3\) Natural(经典算法都是poly),
> - 4\) Slow-growing
>
> 可忽略函数的性质
>
> - 1\) negl1(n) + negl2(n) = negl(n),
> - 2\) negl(n) \* poly(n) = negl(n),
> - \*3) 如果 f(n) 是可忽略函数，g(n) 是多项式函数，则 f(g(n)) 也是可忽略函数。

> [!TIP]
>
> **One way function**
>
> > Onewayness: x-\>f(x) is easy, f(x)-\>x is hard. Easy to compute, hard to invert.
>
> - Worst-case One way function 不能攻破所有的x，即使有一部分x被攻破，也会被认为是安全的。
> - Strong One way function 默认是强定义
> - Weak One way function 将可忽略放宽为 1 - 1 / poly(n)

## lec 4

> [!TIP]
>
> **EAV-Secure**
>
> Eavesdropping, 被动窃听，敌手只能窃听<mark class="critic"><strong>单条</strong></mark>消息，PPT。
>
> \\\[\\Pr\\left\[\\text{PrivK}\_{\\mathcal{A},\\Pi}^{\\text{eav}}(n) = 1\\right\] \\le \\frac{1}{2} + \\operatorname{negl}(n)\\\]
>
> \\\[\\left\\vert{}\\Pr\\left\[\\text{out}\_{\\mathcal{A}}\\left(\\text{PrivK}\_{\\mathcal{A},\\Pi}^{\\text{eav}}(n, 0)\\right) = 1\\right\] - \\Pr\\left\[\\text{out}\_{\\mathcal{A}}\\left(\\text{PrivK}\_{\\mathcal{A},\\Pi}^{\\text{eav}}(n, 1)\\right) = 1\\right\]\\right\\vert{} \\le \\operatorname{negl}(n)\\\]

> [!TIP]
>
> **PRG**
>
> Pseudo-Random Generator，伪随机数生成器。
>
> sk is Truly random; str is Random looking.
>
> 1. 扩展性: l(n) \> n
> 2. 伪随机性: 对于任何PPT敌手，无法区分生成的序列和真正的随机序列。
>
> > **计算安全下的归约方法**
> >
> > 核心是反证法，“外包”的过程。
> >
> > 1. 假定存在能破解密码方案的有效算法 A。
> > 2. 设计一个算法 A'，它收到未知的底层数学难题后，包装成密码密文并转交给 A 破解。
> > 3. A 破解成功后，A' 顺势解出了底层难题。
> > 4. 这意味着找到了在多项式时间内解开世界难题的方法，与前提假设矛盾。
> > 5. 故反证假设不成立，原密码方案是安全的。
>
> PRG 加密方案的安全性证明。
>
> [不想写了](<https://zephyriiiii.github.io/blog/课程笔记/数据安全与密码学基础/Lec4/#_6>)
>
> PRG 可扩展定理。
>
> negl \* poly = negl，混合论证（Hybrid Argument）

## lec 5

> [!TIP]
>
> **Multi-Message Security**
>
> 也是窃听者模型，

> [!TIP]
>
> **PRFs**
>
> Pseudo-Random Functions，伪随机函数（族）。
