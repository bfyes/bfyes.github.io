# 概率论与数理统计

## Probability and Statistics

### 填空题

!!! question "1. \[推测\] — 分布模型匹配"
    Match the following scenarios to the corresponding discrete probability distribution models:

    (a) A factory produces parts, each with probability $p$ of being defective. Inspect **one** part to see if it is defective.

    (b) Inspect $n$ parts and count the number of defective ones.

    (c) On average, $\alpha$ customers visit a store per hour. Count the number of customers arriving in one hour.

    (d) Repeatedly inspect parts until the $k$-th defective part is found. Count the total number of inspections.

    (e) Repeatedly toss a coin until the first head appears. Count the total number of tosses.

    (f) Randomly select one integer from $\{k, k+1, \dots, l\}$, where each integer is equally likely.

    Distribution models: Bernoulli / Binomial / Poisson / Pascal / Geometric / Discrete Uniform

    ??? info "点击查看参考翻译"
        将以下场景与对应的离散概率分布模型匹配：

        (a) 工厂生产零件，每个零件有概率 $p$ 为次品。检验**一个**零件看它是否为次品。

        (b) 检验 $n$ 个零件，统计次品数量。

        (c) 平均每小时有 $\alpha$ 位顾客光顾商店。统计一小时内到达的顾客数。

        (d) 反复检验零件直到发现第 $k$ 个次品。统计总检验次数。

        (e) 反复抛硬币直到第一次出现正面。统计总抛掷次数。

        (f) 从 $\{k, k+1, \dots, l\}$ 中随机等可能地选取一个整数。

        分布模型：伯努利分布 / 二项分布 / 泊松分布 / 帕斯卡分布 / 几何分布 / 离散均匀分布

    ??? info "点击查看答案"
        | 场景 | 分布模型 | 说明 |
        |:---:|:---:|------|
        | (a) | **Bernoulli**（两点分布） | 单次试验，成功/失败 |
        | (b) | **Binomial**（二项分布） | $n$ 次独立试验中成功的次数 |
        | (c) | **Poisson**（泊松分布） | 单位时间内事件发生的次数 |
        | (d) | **Pascal**（帕斯卡分布） | 直到第 $k$ 次成功所需的试验次数 |
        | (e) | **Geometric**（几何分布） | 直到第一次成功（Pascal 的特例 $k=1$） |
        | (f) | **Discrete Uniform**（离散均匀分布） | 有限个等可能结果 |

!!! question "2. \[23-24 真题\]"
    The probability of fog in a city on any given day is $0.4$. On foggy days, the probability that a resident wears a mask is $0.2$; on non-foggy days, the probability is $0.01$.

    (1) Find the probability that a randomly selected resident wears a mask on a randomly chosen day;

    (2) Suppose there are three residents whose mask-wearing behaviors are mutually independent. Find the probability that at least one of them wears a mask.

    ??? info "点击查看参考翻译"
        某城市任意一天有雾的概率为 $0.4$。有雾天居民戴口罩的概率为 $0.2$；无雾天戴口罩的概率为 $0.01$。

        (1) 求随机选取一天，随机选取一位居民戴口罩的概率；

        (2) 假设有三位居民，他们的戴口罩行为相互独立。求至少一人戴口罩的概率。

    ??? info "点击查看答案"
        **(1)**

        $$
        \begin{aligned}
        P(\text{戴口罩}) &= P(\text{有雾})\cdot P(\text{戴口罩}\mid\text{有雾}) + P(\text{无雾})\cdot P(\text{戴口罩}\mid\text{无雾}) \\
        &= 0.4\times 0.2 + 0.6\times 0.01 = 0.08 + 0.006 = 0.086
        \end{aligned}
        $$

        **(2)**

        $$P(\text{至少一人戴}) = 1 - (1-0.086)^3 = 1 - 0.914^3 \approx 1 - 0.7636 = 0.2364$$

    ??? info "解法提示"
        **全概率公式**：$P(A)=P(B_1)P(A\mid B_1)+P(B_2)P(A\mid B_2)$

        - $B_1$ = 有雾，$B_2$ = 无雾
        - 先算 $P(\text{戴口罩})$，再算 $P(\text{至少一人戴})=1-(1-p)^3$

!!! question "3. \[24-25 真题\]"
    The probability of haze in a city is $0.2$. On hazy days, the probability that a resident wears a mask is $0.3$; on non-hazy days, the probability is $0.05$.

    (1) Find the probability that a randomly selected resident wears a mask;

    (2) If there are $3$ mutually independent residents on the street, find the probability that at least one of them wears a mask.

    ??? info "点击查看参考翻译"
        某城市有霾的概率为 $0.2$。有霾天居民戴口罩的概率为 $0.3$；无霾天戴口罩的概率为 $0.05$。

        (1) 求随机选取一位居民戴口罩的概率；

        (2) 如果街上有 3 位相互独立的居民，求至少一人戴口罩的概率。

    ??? info "点击查看答案"
        **(1)**

        $$P(\text{戴口罩}) = 0.2\times 0.3 + 0.8\times 0.05 = 0.06 + 0.04 = 0.10$$

        **(2)**

        $$P(\text{至少一人戴}) = 1 - (1-0.10)^3 = 1 - 0.9^3 = 1 - 0.729 = 0.271$$

    ??? info "解法提示"
        **全概率公式**：$P(A)=P(B_1)P(A\mid B_1)+P(B_2)P(A\mid B_2)$，其中 $B_1,B_2$ 是样本空间的一个分割。

        - 本题 $B_1$ = 有霾，$B_2$ = 无霾
        - 先算 $P(\text{戴口罩})$，再用补事件算 $P(\text{至少一人戴})=1-(1-p)^3$

---

### 计算题

!!! question "1. \[23-24 真题\] — 中心极限定理"
    A random binary string of length $1\,000\,000$ is generated, with each bit independently and equally likely to be $0$ or $1$. Use the Central Limit Theorem to estimate the probability that the string contains at least $502\,000$ ones.

    ??? info "点击查看参考翻译"
        生成长度为 $1\,000\,000$ 的随机二进制串，每位独立等可能为 $0$ 或 $1$。使用中心极限定理估计该串包含至少 $502\,000$ 个 $1$ 的概率。

    ??? info "点击查看答案"
        $X\sim\text{二项分布}(n=10^6,p=0.5)$。

        由 De Moivre-Laplace 中心极限定理：

        $\mu = np = 500\,000$，$\sigma = \sqrt{np(1-p)} = \sqrt{250\,000} = 500$。

        $Z = \dfrac{502\,000 - 500\,000}{500} = 4$。

        $P(X \ge 502\,000) \approx 1 - \Phi(4) \approx 1 - 0.9999683 \approx 3.17\times 10^{-5}$。

    ??? info "解法提示"
        二项分布用 CLT 近似（De Moivre-Laplace 公式）：

        - $\mu=np$，$\sigma=\sqrt{np(1-p)}$
        - 标准化：$Z=\dfrac{X-np}{\sqrt{np(1-p)}}\approx N(0,1)$
        - $P(X\ge k)\approx 1-\Phi(Z)$，查标准正态表得概率

        **连续性校正**：二项分布离散，正态分布连续，严格来说 $P(X\ge 502\,000)$ 应对应 $Z=\dfrac{501\,999.5-500\,000}{500}=3.999$（边界左移 $0.5$）。但 $n=10^6$ 极大，校正量 $0.5/\sigma=0.001$，对结果几乎无影响，可省略。

        本题与 **LLN**（大数定律）的区别：LLN 说样本均值趋近期望，不给具体概率；CLT 给出近似分布，能算具体概率。

!!! question "2. \[24-25 真题\] — 泊松分布"
    Customer arrivals at a store follow a Poisson distribution, with an average of $10$ customers arriving in $20$ minutes.

    (1) Find the probability that at least $1$ customer arrives in $20$ minutes;

    (2) Find the probability that exactly $2$ customers arrive in $8$ minutes.

    ??? info "点击查看参考翻译"
        某商店顾客到达服从泊松分布，平均每 $20$ 分钟有 $10$ 位顾客到达。

        (1) 求 $20$ 分钟内至少 $1$ 位顾客到达的概率；

        (2) 求 $8$ 分钟内恰好 $2$ 位顾客到达的概率。

    ??? info "点击查看答案"
        $X\sim\text{泊松分布}(\alpha=10)$（每 20 分钟）。

        **(1)**

        $$P(X\ge 1) = 1 - P(X=0) = 1 - e^{-10} \approx 1 - 4.54\times10^{-5} \approx 0.99995$$

        **(2)** 8 分钟参数：$\alpha_8 = 10\times\frac{8}{20}=4$。

        $$P(X_8=2) = \dfrac{e^{-4}\cdot 4^2}{2!} = e^{-4}\cdot 8 \approx 0.1465$$

    ??? info "解法提示"
        泊松分布公式：$P(X=k)=\dfrac{\alpha^k e^{-\alpha}}{k!}$，期望和方差均为 $\alpha$。

        - **$\alpha$ 按时间比例缩放**：如本题每 20 分钟 $\alpha=10$，则 8 分钟 $\alpha_8=10\times\frac{8}{20}=4$

        - **至少一个**用补事件：$P(X\ge 1)=1-P(X=0)=1-e^{-\alpha}$

        - **恰好 k 个**直接代入公式

!!! question "3. \[23-24 真题\] — 切比雪夫 + CLT"
    Let $W = \dfrac{X_1+X_2+X_3+X_4}{4}$, where $E(X_i)=5$, $\text{Var}(X_i)=20$, and $X_1,X_2,X_3,X_4$ are mutually independent.

    (1) Find the mean and variance of $W$;

    (2) Use Chebyshev inequality to estimate $P[W \ge 20]$;

    (3) Use the Central Limit Theorem to approximate $P[W \ge 20]$.

    ??? info "点击查看参考翻译"
        设 $W = \dfrac{X_1+X_2+X_3+X_4}{4}$，其中 $E(X_i)=5$，$\text{Var}(X_i)=20$，且 $X_1,X_2,X_3,X_4$ 相互独立。

        (1) 求 $W$ 的均值和方差；

        (2) 使用切比雪夫不等式估计 $P[W \ge 20]$；

        (3) 使用中心极限定理近似 $P[W \ge 20]$。

    ??? info "点击查看答案"
        **(1)**

        $$E(W) = \dfrac{4\times5}{4} = 5,\qquad \text{Var}(W) = \dfrac{4\times 20}{16} = 5$$

        **(2)** 切比雪夫不等式：

        $$P(W\ge 20) = P(W-5\ge 15) \le P(|W-5|\ge 15) \le \dfrac{5}{15^2} = \dfrac{5}{225} \approx 0.0222$$

        **(3)** 中心极限定理：
        $Z = \dfrac{20-5}{\sqrt{5}} = \dfrac{15}{\sqrt{5}} \approx 6.708$

        $$P(W\ge 20) \approx 1 - \Phi(6.708) \approx 0 \quad \text{（极其小）}$$

    ??? info "解法提示"
        - **马尔科夫不等式**（Markov Inequality）：$P[X\ge c]\le E[X]/c$
        - **切比雪夫不等式**（Chebyshev Inequality）：$P[|Y-\mu_Y|\ge c]\le \mathrm{Var}[Y]/c^2$

        **期望/方差运算**（独立时）：

        - $E(aX+bY)=aE(X)+bE(Y)$
        - $\mathrm{Var}(aX+bY)=a^2\mathrm{Var}(X)+b^2\mathrm{Var}(Y)$（协方差项为 0）

        **CLT**：$Z=\dfrac{W-\mu_W}{\sigma_W}\approx N(0,1)$，查标准正态表得概率。

        本题中 $W=\frac{X_1+X_2+X_3+X_4}{4}$，$E(W)=5$，$\mathrm{Var}(W)=5$。切比雪夫给出上界约 0.0222，CLT 给出近似值约 0（$Z=6.708$ 远在 3$\sigma$ 之外）。

!!! question "4. \[23-24 真题\] — 联合分布 / 协方差 / 相关系数"
    The joint frequency distribution of a two-dimensional discrete random variable $(X,Y)$ is given below:

    | $Y\backslash X$ | $0$ | $1$ | $2$ |
    |-----------------|-----|-----|-----|
    | $0$ | $160$ | $80$ | $120$ |
    | $1$ | $240$ | $40$ | $160$ |

    (1) Find the marginal distributions (frequency tables) of $X$ and $Y$;

    (2) Determine whether $X$ and $Y$ are independent;

    (3) Compute the covariance $\text{Cov}(X,Y)$;

    (4) Compute the correlation coefficient $\rho_{XY}$.

    ??? info "点击查看参考翻译"
        二维离散随机变量 $(X,Y)$ 的联合频数分布如下表：

        | $Y\backslash X$ | $0$ | $1$ | $2$ |
        |-----------------|-----|-----|-----|
        | $0$ | $160$ | $80$ | $120$ |
        | $1$ | $240$ | $40$ | $160$ |

        (1) 求 $X$ 和 $Y$ 的边缘分布（频数表）；

        (2) 判断 $X$ 和 $Y$ 是否独立；

        (3) 计算协方差 $\text{Cov}(X,Y)$；

        (4) 计算相关系数 $\rho_{XY}$。

    ??? info "点击查看答案"
        总频数 $N = 160+80+120+240+40+160 = 800$。

        **(1)** $X$ 的边缘分布：
        $P(X=0)=\frac{400}{800}=0.5$，$P(X=1)=\frac{120}{800}=0.15$，$P(X=2)=\frac{280}{800}=0.35$。

        $Y$ 的边缘分布：$P(Y=0)=\frac{360}{800}=0.45$，$P(Y=1)=\frac{440}{800}=0.55$。

        **(2)** 检验 $P(X=0,Y=0)=\frac{160}{800}=0.2$，而 $P(X=0)P(Y=0)=0.5\times0.45=0.225\neq0.2$。**不独立。**

        **(3)**
        $E(X)=0\cdot0.5+1\cdot0.15+2\cdot0.35=0.85$，

        $E(Y)=0\cdot0.45+1\cdot0.55=0.55$。

        $E(XY)=0.05+0.4=0.45$。

        $\text{Cov}(X,Y)=0.45-0.85\times0.55=-0.0175$。

        **(4)**
        $\text{Var}(X)=E(X^2)-(E(X))^2=1.55-0.7225=0.8275$。

        $\text{Var}(Y)=0.55-0.55^2=0.2475$。

        $\rho_{XY}=\dfrac{-0.0175}{\sqrt{0.8275\times0.2475}}\approx -0.0386$。

    ??? info "解法提示"
        离散二元联合频数表：

        1. **频数转概率**：每个格子 $\div$ 总数 $N$ 得 $P(X=x_i,Y=y_j)$
        2. **边缘 PMF**：对行求和得 $P(Y=y_j)$，对列求和得 $P(X=x_i)$
        3. **判独立**：检查 $P(X=x_i,Y=y_j) \stackrel{?}{=} P(X=x_i)P(Y=y_j)$
        4. **协方差/相关系数**：

           - $E(X)=\sum x_i P(X=x_i)$，$E(Y)=\sum y_j P(Y=y_j)$
           - $E(XY)=\sum\sum x_i y_j P(X=x_i,Y=y_j)$
           - $\mathrm{Cov}(X,Y)=E(XY)-E(X)E(Y)$
           - $\rho_{XY}=\dfrac{\mathrm{Cov}(X,Y)}{\sqrt{\mathrm{Var}(X)\mathrm{Var}(Y)}}$

!!! question "5. \[24-25 真题\] — 联合分布 / 协方差 / 相关系数"
    For a total of $1200$ samples, the joint frequencies of hair color ($0$ = white / $1$ = grey / $2$ = dark) and length ($0$ = short / $1$ = long) are as follows:

    |  | white($0$) | grey($1$) | dark($2$) |
    |--------|----------|---------|---------|
    | short($0$) | $300$ | $150$ | $30$ |
    | long($1$) | $360$ | $240$ | $120$ |

    (1) Write the joint probability mass function (Joint PMF);

    (2) Write the marginal probability mass functions (Marginal PMF);

    (3) Compute the covariance $\text{Cov}(X,Y)$;

    (4) Compute the correlation coefficient $\rho_{XY}$.

    ??? info "点击查看参考翻译"
        共 $1200$ 个样本，头发颜色（$0$ = 白 / $1$ = 灰 / $2$ = 黑）和长度（$0$ = 短 / $1$ = 长）的联合频数如下：

        |  | 白($0$) | 灰($1$) | 黑($2$) |
        |--------|----------|---------|---------|
        | 短($0$) | $300$ | $150$ | $30$ |
        | 长($1$) | $360$ | $240$ | $120$ |

        (1) 写出联合概率质量函数（Joint PMF）；

        (2) 写出边缘概率质量函数（Marginal PMF）；

        (3) 计算协方差 $\text{Cov}(X,Y)$；

        (4) 计算相关系数 $\rho_{XY}$。

    ??? info "点击查看答案"
        $N=1200$。联合 PMF = 频数 $\div\ 1200$。

        **(1)** 联合 PMF：
        $P(X=0,Y=0)=0.25$，$P(X=1,Y=0)=0.125$，$P(X=2,Y=0)=0.025$，
        $P(X=0,Y=1)=0.3$，$P(X=1,Y=1)=0.2$，$P(X=2,Y=1)=0.1$。

        **(2)** $X$ 边缘 PMF：$P(X=0)=0.55$，$P(X=1)=0.325$，$P(X=2)=0.125$。
        $Y$ 边缘 PMF：$P(Y=0)=0.4$，$P(Y=1)=0.6$。

        **(3)**
        $E(X)=0\cdot0.55+1\cdot0.325+2\cdot0.125=0.575$，$E(Y)=0\cdot0.4+1\cdot0.6=0.6$。
        $E(XY)=1\cdot1\cdot0.2+2\cdot1\cdot0.1=0.4$。
        $\text{Cov}(X,Y)=0.4-0.575\times0.6=0.055$。

        **(4)**
        $\text{Var}(X)=E(X^2)-0.575^2=(1\cdot0.325+4\cdot0.125)-0.3306=0.825-0.3306=0.4944$。
        $\text{Var}(Y)=0.6-0.6^2=0.24$。
        $\rho_{XY}=0.055/\sqrt{0.4944\times0.24}\approx 0.1597$。

!!! question "6. \[23-24 真题\] — 连续型随机变量 PDF/CDF"
    Let the probability density function of a random variable $X$ be

    $$f_X(x)=\begin{cases}k(1-x),&0<x<1\\[4pt]\dfrac{1}{2}x,&1\le x\le 2\\[4pt]0,&\text{otherwise}\end{cases}$$

    (1) Find the constant $k$;

    (2) Find the cumulative distribution function $F_X(x)$;

    (3) Find $P[X\ge 1.5]$.

    ??? info "点击查看参考翻译"
        设随机变量 $X$ 的概率密度函数为 $f_X(x)$（如上式）。

        (1) 求常数 $k$；

        (2) 求累积分布函数 $F_X(x)$；

        (3) 求 $P[X\ge 1.5]$。

    ??? info "点击查看答案"
        **(1)** 由归一化条件：

        $$\int_0^1 k(1-x)\mathrm{d}x + \int_1^2 \frac{1}{2}x\,\mathrm{d}x = k\cdot\frac{1}{2} + \frac{1}{4}(2^2-1^2) = \frac{k}{2} + \frac{3}{4} = 1 \;\Rightarrow\; k = \frac{1}{2}$$

        **(2)** 累积分布函数：

        $$F_X(x)=\begin{cases}0,&x\le 0\\[4pt]\displaystyle\int_0^x\frac{1}{2}(1-t)\mathrm{d}t=\frac{x}{2}-\frac{x^2}{4},&0<x<1\\[8pt]\dfrac{1}{4}+\displaystyle\int_1^x\frac{t}{2}\mathrm{d}t=\dfrac{x^2}{4},&1\le x\le 2\\[8pt]1,&x>2\end{cases}$$

        **(3)**

        $$P[X\ge 1.5] = 1 - F_X(1.5) = 1 - \dfrac{2.25}{4} = 1 - 0.5625 = 0.4375$$

    ??? info "解法提示"
        给 PDF 求 常数/CDF/概率 ：

        - **求常数**：$\displaystyle\int_{-\infty}^{\infty}f_X(x)\,\mathrm{d}x=1$，分段积分解出常数
        - **求 CDF**：$F_X(x)=\displaystyle\int_{-\infty}^x f_X(t)\,\mathrm{d}t$，分段积分，每段累积
        - **求概率**：$P(a<X<b)=F_X(b)-F_X(a)$

        本题 PDF 分段：$0<x<1$ 时 $f(x)=k(1-x)$，$1\le x\le2$ 时 $f(x)=\frac12 x$，注意分段积分时 CDF 每段要加上前一段的累积值。

!!! question "7. \[24-25 真题\] — 连续型随机变量 PDF/CDF"
    Let the probability density function of a random variable $X$ be

    $$f_X(x)=\begin{cases}c(4-x^2),&0<x<2\\[4pt]0,&\text{otherwise}\end{cases}$$

    (1) Find the constant $c$;

    (2) Find the cumulative distribution function $F_X(x)$;

    (3) Find $P[-1<X<1.5]$.

    ??? info "点击查看参考翻译"
        设随机变量 $X$ 的概率密度函数为 $f_X(x)$（如上式）。

        (1) 求常数 $c$；

        (2) 求累积分布函数 $F_X(x)$；

        (3) 求 $P[-1<X<1.5]$。

    ??? info "点击查看答案"
        **(1)** 由归一化条件：

        $$\int_0^2 c(4-x^2)\mathrm{d}x = c\left[4x-\frac{x^3}{3}\right]_0^2 = c(8-\frac{8}{3}) = c\cdot\frac{16}{3} = 1 \;\Rightarrow\; c = \dfrac{3}{16}$$

        **(2)** 累积分布函数：

        $$F_X(x)=\begin{cases}0,&x\le 0\\[4pt]\displaystyle\int_0^x\frac{3}{16}(4-t^2)\mathrm{d}t=\frac{3}{16}\Bigl(4x-\frac{x^3}{3}\Bigr),&0<x<2\\[8pt]1,&x\ge 2\end{cases}$$

        **(3)**

        $$P[-1<X<1.5] = F_X(1.5) - F_X(0) = \dfrac{3}{16}\Bigl(4\cdot1.5-\dfrac{3.375}{3}\Bigr) = \dfrac{3}{16}(6-1.125) \approx 0.9141$$

!!! question "8. \[23-24/24-25 真题\] — 联合 PDF / 边缘 / 条件"
    Let the joint probability density function of $(X,Y)$ be

    $$f_{X,Y}(x,y)=\begin{cases}\dfrac{5}{4}x,&y^2<x<1\\[4pt]0,&\text{otherwise}\end{cases}$$

    (1) Find $P[Y\le X]$;

    (2) Find the marginal PDF $f_Y(y)$;

    (3) Find the conditional PDF $f_{X\mid Y}(x\mid y)$.

    ??? info "点击查看参考翻译"
        设 $(X,Y)$ 的联合概率密度函数为 $f_{X,Y}(x,y)$（如上式）。

        (1) 求 $P[Y\le X]$；

        (2) 求边缘 PDF $f_Y(y)$；

        (3) 求条件 PDF $f_{X\mid Y}(x\mid y)$。

    ??? info "点击查看答案"
        积分区域：$-1<y<1$，$y^2<x<1$。

        **(1)** 对 $y\le 0$：$y^2<x<1$ 且 $x>0\ge y$，恒满足 $y\le x$。
        对 $y>0$：需满足 $x>y$ 且 $x>y^2$。由于 $y\in(0,1)$ 时 $y^2<y$，紧下界为 $x>y$。

        $$
        \begin{aligned}
        P[Y\le X] &= \int_{-1}^0\int_{y^2}^1 \frac{5}{4}x\,\mathrm{d}x\,\mathrm{d}y + \int_0^1\int_y^1 \frac{5}{4}x\,\mathrm{d}x\,\mathrm{d}y \\
        \int_a^1 \frac{5}{4}x\,\mathrm{d}x &= \frac{5}{8}(1-a^2)
        \end{aligned}
        $$

        第一部分：$\int_{-1}^0 \frac{5}{8}(1-y^4)\mathrm{d}y = \frac{5}{8}\Bigl(1-\frac{1}{5}\Bigr) = \frac{5}{8}\cdot\frac{4}{5} = \frac{1}{2}$。

        第二部分：$\int_0^1 \frac{5}{8}(1-y^2)\mathrm{d}y = \frac{5}{8}\Bigl(1-\frac{1}{3}\Bigr) = \frac{5}{8}\cdot\frac{2}{3} = \frac{5}{12}$。

        $$P[Y\le X] = \dfrac{1}{2}+\dfrac{5}{12} = \dfrac{11}{12}$$

        **(2)** $f_Y(y) = \displaystyle\int_{y^2}^1 \frac{5}{4}x\,\mathrm{d}x = \frac{5}{8}(1-y^4)$，$-1<y<1$。

        **(3)** $f_{X\mid Y}(x\mid y) = \dfrac{f(x,y)}{f_Y(y)} = \dfrac{\frac{5}{4}x}{\frac{5}{8}(1-y^4)} = \dfrac{2x}{1-y^4}$，$y^2<x<1$。

    ??? info "解法提示"
        给联合 PDF $f_{X,Y}(x,y)$ 和区域（如 $y^2<x<1$），三步走：

        - **边缘 PDF**：把另一个变量积掉 $f_Y(y)=\int f_{X,Y}(x,y)\,\mathrm{d}x$
        - **条件 PDF**：$f_{X\mid Y}(x\mid y)=\dfrac{f_{X,Y}(x,y)}{f_Y(y)}$
        - **求概率**：在给定区域上对联合 PDF 做二重积分，关键是**画图确定积分限**

        本题区域为 $-1<y<1$，$y^2<x<1$。求 $P[Y\le X]$ 时要分 $y\le0$ 和 $y>0$ 两段讨论。

---

### 概率论术语表

> 来源：语雀 [信安数学基础 5 · 概率论](https://www.yuque.com/xianyuxuan/coding/uifky8)

**基础概念**

| 英文 | 中文 |
|------|------|
| Sample Space | 样本空间 |
| Event | 事件 |
| Mutually Exclusive | 互斥 |
| Collectively Exhaustive | 穷尽 |
| Partition | 分割 |
| Conditional Probability | 条件概率 |
| Independent Events | 独立事件 |
| Random Variable | 随机变量 |

**离散型随机变量**

| 英文 | 中文 |
|------|------|
| Discrete Random Variable | 离散型随机变量 |
| Probability Mass Function (PMF) | 概率质量函数 |
| Cumulative Distribution Function (CDF) | 累积分布函数 |
| Expected Value | 期望 |
| Variance | 方差 |
| Standard Deviation | 标准差 |
| Bernoulli Distribution | 两点分布（伯努利分布） |
| Binomial Distribution | 二项分布 |
| Poisson Distribution | 泊松分布 |
| Pascal Distribution | 帕斯卡分布 |
| Geometric Distribution | 几何分布 |
| Discrete Uniform Distribution | 离散均匀分布 |

**连续型随机变量**

| 英文 | 中文 |
|------|------|
| Continuous Random Variable | 连续型随机变量 |
| Probability Density Function (PDF) | 概率密度函数 |
| Uniform Distribution | 均匀分布 |
| Standard Normal Distribution | 标准正态分布 |
| Gaussian / Normal Distribution | 高斯分布 / 正态分布 |
| Exponential Distribution | 指数分布 |

**多元随机变量**

| 英文 | 中文 |
|------|------|
| Joint PMF | 联合概率质量函数 |
| Marginal PMF | 边沿概率质量函数 |
| Joint CDF | 联合累积分布函数 |
| Joint PDF | 联合概率密度函数 |
| Marginal PDF | 边沿概率密度函数 |
| Covariance | 协方差 |
| Uncorrelated | 不相关 |
| Correlation Coefficient | 相关系数 |
| Correlation | 相关度 |
| Conditional PMF | 条件概率质量函数 |
| Conditional PDF | 条件概率密度函数 |
| Bivariate Gaussian | 二元高斯随机变量 |

**极限定理与估计**

| 英文 | 中文 |
|------|------|
| Central Limit Theorem (CLT) | 中心极限定理 |
| De Moivre-Laplace Formula (DML) | 拉普拉斯公式 |
| Sample Mean | 样本均值 |
| Markov Inequality | 马尔科夫不等式 |
| Chebyshev Inequality | 切比雪夫不等式 |
| Unbiased Estimator | 无偏估计 |
| Asymptotically Unbiased Estimator | 渐近无偏估计 |
| Mean Square Error (MSE) | 均方误差 |
| Consistent Estimator | 一致估计（consistent） |
