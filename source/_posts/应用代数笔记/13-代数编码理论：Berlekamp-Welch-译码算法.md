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
> 1.  **消息 (Message)**：设消息为一个向量 $(a_0, a_1, \dots, a_D)$，其中 $a_i \in \mathbb{F}_q$，且 $D < q/100$
> 2.  **多项式化**：将这些系数视为一个多项式的系数，构造 $Q(x) = \sum_{i=0}^{D} a_i x^i$。
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
虽然在数学上总可以通过拉格朗日插值法找到一个多项式穿过所有接收到的点 $(\alpha_i, F(\alpha_i))$，但这个插值多项式的度数通常接近 $q-1$，不满足 $deg(Q)=D\ll q$。

### 解的唯一性

在寻找解之前，必须确保满足条件的多项式是唯一的。

> **引理：解的唯一性 (Uniqueness Lemma)**
> 只有一个多项式 $Q\in Ploy_{D}(\mathbb{F}_q)$ 且与 $F(x)$ 在 $\ge \frac{51}{100}$ 的位置上吻合。

**证明：**
* 假设存在两个不同的多项式 $Q_1$ 和 $Q_2$ 均满足上述条件。
* 由于 $Q_1$ 与 $F$ 吻合 $\ge 51\%$，$Q_2$ 与 $F$ 吻合 $\ge 51\%$，根据容斥原理，两者同时与 $F$ 吻合（即 $Q_1(x) = Q_2(x)$）的位置至少占 $2\%$。
* 这意味着差多项式 $(Q_1 - Q_2)(x)$ 至少有 $\frac{2}{100}q$ 个根
* 但是 $deg(Q_1 - Q_2) \le D <\frac{q}{100}$
* 所以 $Q_1 = Q_2$

## Berlekamp-Welch 算法

该算法的核心思想构造一个双变量多项式 $P(x, y)$ 来穿过 $Graph(F)$ 的所有数据点。

{% note danger %}
TODO 后面还没仔细看，还需要修改
{% endnote %}

### 第一步：构造零点图与线性映射

首先，我们将接收到的数据视为平面上的一个点集。

> **定义：零点图 (Zero Graph)**
> 设接收到的数据为 $n$ 个点对，定义集合 $S$：
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

可以验证这是一个线性映射。我们的目标是寻找一个非零多项式 $P(x, y)$，使得它在 $S$ 上取值全为 0，即寻找 $P \in \ker(RS)$ 且 $P \neq 0$。

### 第二步：非零解的存在性

根据线性代数的基本原理，如果定义域的维度严格大于值域的维度，则核空间非平凡。

> **定理：非零多项式的存在性**
> 已知 definition domain 的维度为 $\dim(Poly_{D, 1}) = 2(D + 1)$，codomain 的维度为 $|S|$。
> 如果满足：
> $$
> 2(D + 1) > |S|
> $$
> 则 $\ker(RS) \neq \{0\}$。这意味着必然存在一个非零多项式 $P(x, y)$，满足对于所有 $(x_i, y_i) \in S$，都有 $P(x_i, y_i) = 0$。

为了满足上述不等式并使计算尽可能高效（$D$ 尽可能小），我们通常取 $D \approx \frac{|S|}{2}$。

### 第三步：矩阵构造与求解

寻找 $P(x, y)$ 的系数等价于解一个齐次线性方程组。
设 $P(x, y)$ 的一般形式为：
$$
P(x, y) = \sum_{0 \le i \le D, 0 \le j \le 1} C_{i,j} x^i y^j
$$
要使 $RS(P) = 0$，即对于所有的 $m \in \{1, \dots, |S|\}$，都有 $P(x_m, y_m) = 0$。

这将导出如下的线性方程组。我们将未知系数 $C_{i,j}$ 排列成向量 $\mathbf{C}$，将基底元素在各点上的值排列成矩阵 $M$：

$$
\begin{bmatrix}
1 & x_1 & \dots & x_1^D & y_1 & x_1 y_1 & \dots & x_1^D y_1 \\
1 & x_2 & \dots & x_2^D & y_2 & x_2 y_2 & \dots & x_2^D y_2 \\
\vdots & \vdots & \ddots & \vdots & \vdots & \vdots & \ddots & \vdots \\
1 & x_n & \dots & x_n^D & y_n & x_n y_n & \dots & x_n^D y_n
\end{bmatrix}
\begin{bmatrix}
C_{0,0} \\ \vdots \\ C_{D,0} \\ C_{0,1} \\ \vdots \\ C_{D,1}
\end{bmatrix} =
\begin{bmatrix}
0 \\ 0 \\ \vdots \\ 0
\end{bmatrix}
$$

这是一个 $2(D+1) \times |S|$ 的系统。由于 $2(D+1) > |S|$，我们可以通过高斯消元法在多项式时间 $O(D \cdot \log q)$ 内找到一组非零解 $\mathbf{C}$，从而确定多项式 $P(x, y)$。

### 第四步：恢复原始消息 $Q(x)$

通过上述步骤，我们得到了 $P(x, y) = P_0(x) + y P_1(x)$。
接下来的关键是利用 $P(x, y)$ 恢复出原始消息多项式 $Q(x)$。

1.  **构造单变量多项式**：考虑 $R(x) = P(x, Q(x))$。
2.  **根的数量**：由于 $F(x)$ 与 $Q(x)$ 在至少 $\frac{51}{100}$ 的比例上吻合，且 $P(x, F(x)) = 0$ 对所有 $x$ 成立，因此 $R(x)$ 在这些吻合点上的值也为 0。这意味着 $R(x)$ 至少有 $\frac{51}{100}q$ 个根。
3.  **度数限制**：
    $$
    \deg(R) \le \max(\deg(P_0), \deg(Q) + \deg(P_1)) \approx \frac{q}{2} + \deg(Q)
    $$
    在参数设置合理的情况下（$D \approx q/2$ 且 $\deg(Q)$ 较小），根的数量将严格大于 $R(x)$ 的次数。
4.  **结论**：根据代数基本定理，$R(x)$ 必须是零多项式。即：
    $$
    P_0(x) + Q(x)P_1(x) \equiv 0
    $$

最终，我们可以通过多项式除法直接恢复出 $Q(x)$：
$$
Q(x) = -\frac{P_0(x)}{P_1(x)}
$$

## 局部可译码码 (Locally Decodable Codes) 与 Reed-Muller 码

RS 码通常需要读取所有码字才能译码。如果只想恢复原始消息中的某一个符号，我们可以利用 Reed-Muller 码的几何特性。

> **定义：Reed-Muller 码 (RM Codes)**
> 设消息为 $n$ 元多项式 $Q(x_1, \dots, x_n)$ 的系数，码字为该多项式在整个向量空间 $\mathbb{F}_q^n$ 上的求值。

### 局部译码思路

假设我们想恢复 $Q$ 在某点 $\mathbf{a} \in \mathbb{F}_q^n$ 处的值 $Q(\mathbf{a})$。

1.  **构造随机直线**：过点 $\mathbf{a}$ 做一条方向为 $\mathbf{b}$ 的随机直线 $L = \{ \mathbf{a} + t \mathbf{b} \mid t \in \mathbb{F}_q \}$。
2.  **限制在直线上**：定义单变量多项式 $q(t) := Q(\mathbf{a} + t \mathbf{b})$。

> **性质：降维 (Reduction to Univariate)**
> 限制在直线上的函数 $q(t)$ 是关于 $t$ 的单变量多项式，且其次数不超过 $Q$ 的总次数。
> 此时，问题转化为对 $q(t)$ 的 RS 码译码问题。

3.  **恢复值**：在直线上采样若干点（对应 $t \neq 0$），利用 Berlekamp-Welch 算法恢复出 $q(t)$，最后计算 $q(0)$ 即为所求的 $Q(\mathbf{a})$。