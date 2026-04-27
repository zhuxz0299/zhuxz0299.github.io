---
title: 代数编码理论：Berlekamp-Welch 译码算法
cover: 'https://source.fomal.cc/img/default_cover_185.webp'
categories:
  - Lecture Notes
  - Applied Algebra
katex: true
description: >-
  讨论纠错码理论中的 Reed-Solomon (RS) 码的 Berlekamp-Welch 译码算法，并延伸介绍具有局部可译码特性的
  Reed-Muller (RM) 码
abbrlink: b12c7e4b
date: 2025-12-18 22:24:47
---
## 预备知识：符号定义与基本事实

### 符号定义 (Notation)

* **$\mathbb{F}_q$**：表示含有 $q$ 个元素的有限域。
* **$Poly_D(\mathbb{F}_q)$**：$\mathbb{F}_q$ 上次数不超过 $D$ 的单变量多项式集合。
* **$Poly_D(\mathbb{F}_q^n)$**：$\mathbb{F}_q$ 上总次数（Total Degree）不超过 $D$ 的 $n$ 元多项式集合：
    $$
    Poly_D(\mathbb{F}_q^n) \overset{\underset{\mathrm{def}}{}}{=} \{ P(x_1, \dots, x_n) \in \mathbb{F}_q[x_1, \dots, x_n] \mid \deg(P) \le D \}
    $$
* **$Poly_{D, E}(\mathbb{F}_q^2)$**：$\mathbb{F}_q$ 上关于 $x$ 次数不超过 $D$，关于 $y$ 次数不超过 $E$ 的双变量多项式集合：
    $$
    Poly_{D, E}(\mathbb{F}_q^2) \overset{\underset{\mathrm{def}}{}}{=} \{ P(x, y) \in \mathbb{F}_q[x, y] \mid \deg_x(P) \le D, \deg_y(P) \le E \}
    $$

这里我们特别关注 **$Poly_{D, 1}(\mathbb{F}_q^2)$**，即 $E=1$ 的情况。

### 基与维度 (Basis & Dimension)

对于多元多项式空间 $Poly_D(\mathbb{F}_q^n)$，其任意元素可以写成单项式的线性组合：
$$
P(x_1, \dots, x_n) = \sum C \cdot x_1^{m_1} x_2^{m_2} \dots x_n^{m_n}
$$

其基底为 $\{ x_1^{m_1} \dots x_n^{m_n} \}_{m_1 + \dots + m_n \le D}$。

对于我们将要重点使用的空间 **$Poly_{D, 1}(\mathbb{F}_q^2)$**，其基底具有更简单的形式：
$$
\text{Basis} = \{ x^i y^j \mid 0 \le i \le D, 0 \le j \le 1 \}
$$

因此，该空间的维度为：
$$
\dim(Poly_{D, 1}(\mathbb{F}_q^2)) = 2(D + 1)
$$

### 两个重要事实 (Key Facts)

以下两个事实分别基于线性代数和多项式理论，是理解 Berlekamp-Welch 算法可行性的基石。

> **Fact 1: 线性映射核的非平凡性**
> 设 $f: Poly_D(\mathbb{F}_q^n) \to V$ 是一个线性映射。如果定义域的维度大于值域的维度，即
> $$
> \dim(Poly_D(\mathbb{F}_q^n)) > \dim V
> $$
> 
> 则 $\ker(f) \neq \{0\}$，即存在非零多项式被映射为 $0$。

**推导：**
根据秩-零化度定理（Rank-Nullity Theorem）：
$$
\dim(Poly_D(\mathbb{F}_q^n)) = \dim(\text{image}(f)) + \dim(\ker(f))
$$

由于 $\dim(\text{image}(f)) \le \dim V$，当定义域维度严格大于 $\dim V$ 时，必然有 $\dim(\ker(f)) > 0$。

**特例应用：**
对于 $Poly_{D, 1}(\mathbb{F}_q^2)$，如果 $2(D+1) > \dim V$，则 $\ker(f) \neq \{0\}$。

> **Fact 2: 多项式的根与次数**
> 设 $P(x) \in Poly_D(\mathbb{F}_q)$。如果 $P(x)$ 在 $D+1$ 个不同的点上取值为 $0$，则 $P(x)$ 必为零多项式。
> $$
> \text{Zero points} > \deg(P) \implies P(x) \equiv 0
> $$

## Reed-Solomon 码与译码问题

### Reed-Solomon (RS) 码定义

RS 码的核心思想是将离散的消息向量转化为连续的多项式，利用多项式的刚性来对抗错误。其编码过程如下：

> **定义：Reed-Solomon 编码过程**
> 1.  **消息 (Message)**：设消息为一个向量 $(a_0, a_1, \dots, a_k)$，其中 $a_i \in \mathbb{F}_q$，且 $k < q/100$
> 2.  **多项式化**：将这些系数视为一个多项式的系数，构造 $Q(x) = \sum_{i=0}^{k} a_i x^i$。
> 3.  **码字 (Codeword)**：设 $\alpha_1, \dots, \alpha_q$ 为 $\mathbb{F}_q$ 中的所有元素，计算多项式在这些点上的值，得到向量：
>     $$
>     (Q(\alpha_1), Q(\alpha_2), \dots, Q(\alpha_q))
>     $$
>
> 从 Message 到 Codeword 的过程即完成了 RS 编码。

### 译码问题设定 (Decoding Problem)

在传输过程中，码字可能会发生改变。我们面临的是在含有大量错误的情况下恢复原多项式的问题。

> **问题描述**
> * **输入**：接收到序列记为 $(F(\alpha_1), F(\alpha_2), \ldots ,F(\alpha_q))$
> * **条件**：$F(x)$ 与 $Q(x)$ 在至少 $\frac{51}{100}$（即超过一半）的比例上吻合。
> * **目标**：利用接收到的 $F(x)$ 恢复出原始多项式 $Q(x)$。

**注：为什么不能直接令 $Q(x) = F(x)$？**
虽然在数学上总可以通过拉格朗日插值法找到一个多项式穿过所有接收到的点 $(\alpha_i, F(\alpha_i))$，但这个插值多项式的度数通常接近 $q-1$，不满足 $deg(Q)=k\ll q$。

### 解的唯一性

在寻找解之前，必须确保满足条件的多项式是唯一的。

> **引理：解的唯一性 (Uniqueness Lemma)**
> 只有一个多项式 $Q\in Ploy_{k}(\mathbb{F}_q)$ 且与 $F(x)$ 在 $\ge \frac{51}{100}$ 的位置上吻合。

**证明：**
* 假设存在两个不同的多项式 $Q_1$ 和 $Q_2$ 均满足上述条件。
* 由于 $Q_1$ 与 $F$ 吻合 $\ge 51\%$，$Q_2$ 与 $F$ 吻合 $\ge 51\%$，根据容斥原理，两者同时与 $F$ 吻合（即 $Q_1(x) = Q_2(x)$）的位置至少占 $2\%$。
* 这意味着差多项式 $(Q_1 - Q_2)(x)$ 至少有 $\frac{2}{100}q$ 个根
* 但是 $deg(Q_1 - Q_2) \le k <\frac{q}{100}$
* 所以 $Q_1 = Q_2$

## Berlekamp-Welch 算法

该算法的核心思想构造一个双变量多项式 $P(x, y)$ 来穿过 $Graph(F)$ 的所有数据点。

### 第一步：构造零点图与线性映射

首先，我们将接收到的数据视为平面上的一个点集。

> **定义：零点图 (Zero Graph)**
> 定义集合 $S$：
> $$
> S = \text{graph}(F) \overset{\underset{\mathrm{def}}{}}{=} \{ (x,y) \in \mathbb{F}_q^{2} | y = F(x) \}
> $$
> 
> 其中 $x$ 遍历 $\mathbb{F}_q$ 中元素 $\{ \alpha_1, \alpha_2, \ldots \alpha_{q} \}$，因此集合的大小 $|S| = q$。更加一般的，$S$ 可以写为
> $$
> S = \{ (x_1, y_1), (x_2, y_2), \ldots , (x_{\left\vert S \right\vert }, y_{\left\vert S \right\vert }) \} \subseteq \mathbb{F}_q^{2}
> $$

为了严谨地描述“穿过这些点”的代数含义，我们引入一个函数空间 $Fcn(S, \mathbb{F}_q)$
$$
Fcn(S, \mathbb{F}_q) \overset{\underset{\mathrm{def}}{}}{=} \left\{ \sum_{m=1}^{\left\vert S \right\vert } a_m \delta_{(x_m, y_m)}(x, y) \right\}
$$

其中 $a_m \in \mathbb{F}_q$，$\delta_{(x_m, y_m)}(x, y)$ 定义为：
$$
\delta_{(x_m, y_m)}(x, y) = \begin{cases} 1 & \text{if } (x, y) = (x_m, y_m) \\ 0 & \text{otherwise} \end{cases}
$$

显然，这个函数空间的维度 $\dim(Fcn(S, \mathbb{F}_q)) = |S|$。

接着，定义求值映射 $RS$，将双变量多项式映射到该函数空间：
$$
\begin{aligned}
RS: & Poly_{D, 1}(\mathbb{F}_q^2) \to Fcn(S, \mathbb{F}_q) \\
& P(x, y) \mapsto P|_{S} = \sum_{m=1}^{|S|} P(x_m, y_m) \delta_{(x_m, y_m)}
\end{aligned}
$$

可以验证这是一个线性映射。我们的目标是寻找一个非零多项式 $P(x, y)$，使得它在 $S$ 上取值全为 0，即 $P(x, F(x)) = 0$。寻找满足上述条件的 $P$，即寻找 $P \in \ker(RS)$ 且 $P \neq 0$。

### 第二步：非零解的存在性

根据线性代数的基本原理，如果定义域的维度严格大于值域的维度，则核空间非平凡。

> **定理：非零多项式的存在性**
> 已知 definition domain 的维度为 $\dim(Poly_{D, 1}) = 2(D + 1)$，codomain 的维度为 $|S|$。
> 如果满足：
> $$
> 2(D + 1) > |S|
> $$
> 
> 则 $\ker(RS) \neq \{0\}$。这意味着必然存在一个非零多项式 $P(x, y)$，满足对于所有 $(x_i, y_i) \in S$，都有 $P(x_i, y_i) = 0$。

为了满足上述不等式并使计算尽可能高效（$D$ 尽可能小），我们通常取 $\frac{\left\vert S \right\vert }{2}-1 < D \le \frac{\left\vert S \right\vert }{2}$。

### 第三步：矩阵构造与求解

为了找到满足条件的多项式 $P(x, y)$，我们需要将线性映射 $RS$ 矩阵化。

**1. 确定基底 (Bases)**

首先明确两个空间的基底：
* **多项式空间** $Poly_{D,1}(\mathbb{F}_q^2)$ 的基底为单项式集合：
    $$\{ x^i y^j \mid 0 \le i \le D, 0 \le j \le 1 \}$$
* **函数空间** $Fcn(S, \mathbb{F}_q)$ 的基底为指示函数（Delta functions）集合：
    $$\{ \delta_{(x_m, y_m)} \mid 1 \le m \le |S| \}$$

**2. RS 映射的矩阵表示**

考虑 $RS$ 映射作用在多项式空间的基底上。对于任意一个基底元素 $x^i y^j$，它在函数空间中的像是它在所有点 $(x_m, y_m)$ 上的取值。我们可以将其表示为矩阵乘积形式：

$$
x^{i} y^{j} = 
\begin{bmatrix} 
    x_1^{i}y_1^{j} \cdots x_{|S|}^{i} y_{|S|}^{j}
\end{bmatrix} 
\begin{bmatrix} 
    \delta(x_1, y_1) \\
    \vdots \\
    \delta(x_{|S|}, y_{|S|}) 
\end{bmatrix} 
$$

因此对于所有的 $x^{i}y^{j}$，可以写成：
$$
\begin{bmatrix}
\vdots \\
x^i y^j \\
\vdots
\end{bmatrix} =
\underbrace{
\begin{bmatrix}
\vdots & \vdots & \vdots \\
x_1^i y_1^j & \dots & x_{|S|}^i y_{|S|}^j \\
\vdots & \vdots & \vdots
\end{bmatrix}
}_{2(D+1) \times |S| \text{ Matrix}}
\begin{bmatrix}
\delta_{(x_1, y_1)} \\
\vdots \\
\delta_{(x_{|S|}, y_{|S|})}
\end{bmatrix}
$$

中间的这个矩阵（记为 $M$）大小为 $2(D+1) \times |S|$，其每一行对应一个单项式 $x^i y^j$，每一列对应一个数据点 $(x_m, y_m)$。

**3. 建立线性方程组**

设我们需要求解的多项式为 $P(x, y) = \sum_{i,j} C_{i,j} x^i y^j$，其中 $C_{i,j} \in \mathbb{F}_q$ 是待定系数。
我们的目标是找到非零的系数集合，使得 $RS(P) = 0$。写为矩阵形式，为：
$$
P(x,y) = [\dots C_{i,j} \dots]
\begin{bmatrix}
\vdots \\
x^i y^j \\
\vdots
\end{bmatrix} = 
[\dots C_{i,j} \dots]
\begin{bmatrix}
\vdots & \vdots & \vdots \\
x_1^i y_1^j & \dots & x_{|S|}^i y_{|S|}^j \\
\vdots & \vdots & \vdots
\end{bmatrix}
\begin{bmatrix}
\delta_{(x_1, y_1)} \\
\vdots \\
\delta_{(x_{|S|}, y_{|S|})}
\end{bmatrix} = 0
$$

由于 $(\delta(x_i, y_i))$ 是一组基底，线性无关，因此要求系数向量与上述矩阵的乘积为零向量：

$$
[\dots C_{i,j} \dots]
\begin{bmatrix}
\vdots & \vdots & \vdots \\
x_1^i y_1^j & \dots & x_{|S|}^i y_{|S|}^j \\
\vdots & \vdots & \vdots
\end{bmatrix} =
[0, 0, \dots, 0]
$$

**4. 求解与复杂度**

这是一个包含 $2(D+1)$ 个未知数（$C_{i,j}$）和 $|S|$ 个方程的齐次线性方程组。
根据前面的设定，我们有 $2(D+1) > |S|$。
因此，该方程组必然存在非零解。我们可以通过高斯消元法在多项式时间 $O(D \cdot \log q)$ 内解出一组非零的系数 $[\dots C_{i,j} \dots]$，从而确定多项式 $P(x, y)$。

### 第四步：恢复原始消息 $Q(x)$

通过上述步骤，我们得到了 $P(x, y) = P_0(x) + y P_1(x)$。
接下来的关键是利用 $P(x, y)$ 恢复出原始消息多项式 $Q(x)$。

1.  **构造单变量多项式**：考虑 $R(x) = P(x, Q(x))$。
2.  **根的数量**：由于 $F(x)$ 与 $Q(x)$ 在至少 $\frac{51}{100}$ 的比例上吻合，且 $P(x, F(x)) = 0$ 对所有 $x$ 成立，因此 $R(x)$ 在这些吻合点上的值也为 0。这意味着 $R(x)$ 至少有 $\frac{51}{100}q$ 个根。
3.  **度数限制**：
    $$
    \deg(R) \le \max(\deg(P_0), \deg(Q) + \deg(P_1)) \le  \frac{q}{2} + \deg(Q) \le \frac{q}{2} + k < \frac{51}{100}q
    $$

    根的数量严格大于 $R(x)$ 的次数。
4.  **结论**：根据代数基本定理，$R(x)$ 必须是零多项式。即：
    $$
    P_0(x) + Q(x)P_1(x) \equiv 0
    $$

最终，我们可以通过多项式除法直接恢复出 $Q(x)$：
$$
Q(x) = -\frac{P_0(x)}{P_1(x)}
$$

*注：为什么最后求出来的一定是 message 里面的 $Q$？*
1. 首先 message 里面的 $Q$ 存在，且确实能够满足 $P(x, Q(x))$ 存在大于等于 $\frac{51}{100}q$ 个根
2. RS 码译码解的唯一性保证了，在 $\deg(Q)\le k$ 的前提下，只有一个解
3. 为什么不考虑 $\deg(Q)>k$ 的情况：因为在 $\deg(Q)\le k$ 的前提下已经解出来了 $Q$。且无论 $\deg(Q)$ 是多少，解的形式总为 $- P_0(x) / P_1(x)$（有点像含二极管电路的求解，假设一个通断，解出来正确就是对的）

## 局部可译码码 (Locally Decodable Codes) 与 Reed-Muller 码

RS 码虽然纠错能力强，但有一个“缺点”：要恢复原始信息，通常需要读取整个码字。这便是 **局部可译码码 (LDC)** 想要解决的问题。Reed-Muller 码通过巧妙的几何构造实现了这一点。

### Reed-Muller (RM) 码的构造
RM 码是对多元多项式的编码。首先取 $\mathbb{F}_q$ 的一个子集 $\{ 0, 1, \ldots ,D \}$，在上面考虑一个多元函数 
$$g(x_1, x_2, \ldots ,x_n): \{ 0, 1, \ldots ,D \}^{n} \to \mathbb{F}_q$$

消息的形式为 $(\cdots , g(x_1, \ldots ,x_n), \ldots )$，即将消息作为函数 $g$ 的像空间。（这里可以注意到消息的长度必然为 $(D+1)^{n}$，如果实际情况中消息长度没法完美对上，那就做一下补零之类的预处理）

> **引理：低度扩展的存在唯一性 (Low Degree Extension)**
> 设消息 $g(x_1, \dots, x_n)$ 是定义域在网格 $\{0, 1, \dots, D\}^n \subseteq \mathbb{F}_q^n$，值域在 $\mathbb{F}_q$ 上的函数。
> 如果 $D < q$，则存在**唯一**的 $n$ 元多项式 $P(x_1, \dots, x_n)$，满足：
> 1.  在网格点上与 $g$ 一致：对于所有 $\mathbf{x} \in \{0, \dots, D\}^n$，有 $P(\mathbf{x}) = g(\mathbf{x})$。
> 2.  次数限制：$P$ 关于每个变量的次数 $\deg_{x_i}(P) \le D$。

**编码过程**：
* **消息**：网格上的函数值 $g$。
* **多项式**：找到对应的扩展多项式 $P(x_1, \dots, x_n)$。
* **码字**：将 $P$ 在整个向量空间 $\mathbb{F}_q^n$ 上的求值作为码字。
    $$(\dots, P(x_1, \dots, x_n), \dots)_{\mathbf{x} \in \mathbb{F}_q^n}$$

### 局部译码算法 (Local Decoding)

假设接收到的码字为 $F(\mathbf{x})$，其中存在部分错误（假设错误点数 $\le \frac{24}{100} q^n$）。
目标：**恢复原始多项式在特定点 $\mathbf{x}$ 处的值 $P(\mathbf{x})$**。
核心思想：将高维空间中的纠错问题，转化为一条直线上的低维 RS 码纠错问题。

**步骤 1：构造随机直线**
为了求 $\mathbf{x}$ 点的值，我们在空间中构造一条经过 $\mathbf{x}$ 的直线 $L$。
* 随机选择一个方向向量 $\mathbf{a} \in \mathbb{F}_q^n$。
* 定义直线 $L = \{ \mathbf{a}t + \mathbf{x} \mid t \in \mathbb{F}_q \}$。
* 注意：当 $t=0$ 时，直线经过目标点 $\mathbf{x}$。

**步骤 2：限制在直线上 (Restriction)**
考虑多项式 $P$ 在这条直线上的取值。定义单变量多项式 $p'(t)$：
$$
p'(t) \overset{\underset{\mathrm{def}}{}}{=} P(\mathbf{x})|_{L} = P(\mathbf{a}t + \mathbf{x}) = P(a_1t+x_1, \ldots ,a_nt + x_n)
$$
* **性质**：$p'(t)$ 是关于 $t$ 的单变量多项式。
* **次数**：由于 $P$ 满足 $\deg_{x_i}(P)\le D$，因此合成后的 $p'(t)$ 同样满足 $\deg(p')_{x_i}\le D$，总次数 $\deg(p') \le n \cdot D$。假设 $n \cdot D \le \frac{q}{100}$。

**步骤 3：转化为 RS 码问题**
我们在直线上读取接收到的值。对于直线上的每个 $t = \alpha_1, \dots, \alpha_q$，我们得到 $F(\mathbf{a}t + \mathbf{x})$。
* 这实际上构成了一个带有噪声的单变量多项式采样（即 RS 码）。
* 由于 $\mathbf{a}$ 是随机选取的，直线上的非零点 $\mathbf{a}t + \mathbf{x}$ ($t \ne 0$) 在整个空间 $\mathbb{F}_q^n$ 中是均匀分布的。
* 因此，如果整个码字的错误率较低（如 $\le 24\%$），那么这条直线上的错误率也大概率较低。

**步骤 4：执行 Berlekamp-Welch 并求值**
现在问题变成了：已知一系列点 $(t, F(\mathbf{a}t + \mathbf{x}))$，其中大部分点满足 $F(\dots) = p'(t)$，请恢复 $p'(t)$。
1.  **调用算法**：使用 Berlekamp-Welch 算法对这些点进行纠错，恢复出单变量多项式 $p'(t)$。
2.  **求值**：我们需要的是目标点 $\mathbf{x}$ 的值，对应于 $t=0$。因此计算 $p'(0)$。
    $$
    P(\mathbf{x}) = p'(0)
    $$

通过这种方法，我们只需要读取一条直线上的点（数量为 $q$），而不需要读取整个空间（数量为 $q^n$），就成功恢复了目标点的信息。