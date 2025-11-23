---
title: 正规扩张与Galois群
cover: 'https://source.fomal.cc/img/default_cover_179.webp'
categories: applied algebra
katex: true
abbrlink: f636573c
date: 2025-11-08 16:38:53
description: 从正规扩张的等价定义以及性质开始，再简要介绍可分扩张，最后定义伽罗瓦扩张以及伽罗瓦群
---

## 分裂域与同构延展

### 分裂域的唯一性

> **定理 (分裂域的唯一性)**
> 设 $F$ 是一个域，$\mathcal{F}$ 是 $F$ 上的一族多项式。则 $\mathcal{F}$ 在 $F$ 的任意两个分裂域都 $F$-同构。

#### 证明思路（关于根的映射）

设 $K, L$ 是 $F$ 的两个代数闭包，要证 $\mathcal{F}$ 在 $K$ 中的分裂域同构于在 $L$ 中的分裂域。
1. 设 $X$ 是 $\mathcal{F}$ 在 $K$ 中的全体根
2. 那么可以得到 $\mathcal{F}$ 在 $K$ 中的分裂域 $F(X)$，且 $F(X)$ 也是 $F$ 的代数扩张
3. 由此可以利用代数扩张的延展定理，得到 $F$ -嵌入 $\sigma: F(X) \hookrightarrow L$
4. $F(X) \cong \sigma(F(X))$，希望证明 $\sigma(F(X))$ 是 $\mathcal{F}$ 在 $L$ 中的分裂域
5. 由于 $\sigma(F(X)) = F(\sigma(X))$，即证 $\sigma(X)$ 是 $\mathcal{F}$ 在 $L$ 上全体根，记为 $X'$
6. 先证 $X' \subseteq \sigma(X)$
   1. $\forall f \in \mathcal{F}$，$f$ 在 $K$ 中的根为 $\alpha_1, \ldots \alpha_n \in X$
   2. $f(x) = (x-\alpha_1)\cdots (x-\alpha_n)$
   3. $\sigma(f(x)) = (x - \sigma(\alpha_1))\cdots (x- \sigma(\alpha_n))$
   4. 即 $f$ 在 $L$ 上的根都具有 $\sigma(\alpha_i)$ 的形式
   5. 所以 $X' \subseteq \sigma(X)$
7. 再证 $\sigma(X) = X'$
   1. $\forall \beta \in \sigma(X)$，$\exists \alpha \in X \text{ s.t. } \beta = \sigma(\alpha)$
   2. $\exists f \in \mathcal{F} \text{ s.t } f(\alpha) = 0 \Rightarrow f(\sigma(\alpha)) = 0 \Rightarrow f(\beta) = 0$
   3. 所以 $\beta$ 是 $\mathcal{F}$ 在 $L$ 上的根
   4. $\sigma(X) \subseteq X'$


## 正规扩张 (Normal Extensions)

### 定义与等价条件

> **定义：正规扩张（等价条件）**
> 设 $F \subseteq E \subseteq \bar{F}$ (其中 $\bar{F}$ 是 $F$ 的代数闭包)。以下条件等价：
>
> 1.  $E$ 是 $F$ 上某族多项式 $\mathcal{F} \subseteq F[x]$ 的分裂域。
> 2.  任何 $F$-嵌入 $\sigma: E \hookrightarrow \bar{F}$ 都满足 $\sigma(E) = E$。
> 3.  考虑不可约多项式 $p(x) \in F[x]$， 如果 $p(x)$ 在 $E$ 中有一个根 ($\alpha$)，那么 $p(x)$ 在 $E[x]$ 中分裂（即 $p(x)$ 的所有根都在 $E$ 中）。

### 等价性证明

#### (1 $\Rightarrow$ 2)
**前提**：$E$ 是 $\mathcal{F} \subseteq F[x]$ 在 $F$ 上的分裂域。
**目标**：证明任何 $F$-嵌入 $\sigma: E \hookrightarrow \bar{F}$ 都满足 $\sigma(E) = E$。

1.  根据分裂域的定义， $E = F(X)$，其中 $X$ 是 $\mathcal{F}$ 中所有多项式在 $E$ 中的根集。
2.  设 $\sigma: E \hookrightarrow \bar{F}$ 是一个 $F$-嵌入。
3.  对于任意根 $\alpha \in X$，$\alpha$ 是 $F[x]$ 中某个 $f(x) \in \mathcal{F}$ 的根。
4.  $\sigma(\alpha)$ 是 $f(x)$ 的另一个根。
5.  由于 $X$ 是所有根的集合，所以 $\sigma(\alpha) \in X$
6.  所以 $\sigma(X) = X$
7.  考察 $\sigma(E)$：
    $$\sigma(E) = \sigma(F(X)) = F(\sigma(X)) = F(X) = E$$

#### (2 $\Rightarrow$ 3)
**前提**：任何 $F$-嵌入 $\sigma: E \hookrightarrow \bar{F}$ 都满足 $\sigma(E) = E$。
**目标**：证明任意不可约多项式 $p(x) \in F[x]$，若有一根在 $E$ 中，则所有根都在 $E$ 中。

1.  设 $p(x) \in F[x]$ 是一个不可约多项式， 且 $\alpha \in E$ 是 $p(x)$ 的一个根。
2.  设 $\beta \in \bar{F}$ 是 $p(x)$ 的任意一个根。
3.  根据**代数扩张的嵌入延展定理**（$\bar{F}$ 是代数闭包，所以 $E$ 一定是代数扩张），可以找到 $\sigma$ 使得 $\sigma(\alpha) = \beta$
4.  由 $\sigma(E) = E$，得到 $\beta \in E$
5.  由于 $\beta$ 是 $p(x)$ 的任意根，这表明 $p(x)$ 的所有根都在 $E$ 中。故 $p(x)$ 在 $E$ 上分裂。

#### (3 $\Rightarrow$ 1)
**前提**：任意不可约多项式 $p(x)\in F[x]$，若有一根在 $E$ 中，则所有根都在 $E$ 中。
**目标**：证明 $E$ 是 $F$ 上某族多项式 $\mathcal{F}$ 的分裂域。

1.  我们来构造这族多项式。
2.  令 $\mathcal{F} = MinPoly(E,F) \overset{\underset{\mathrm{def}}{}}{=} \{ p_\alpha(x) \mid \alpha \in E \}$，其中 $p_\alpha(x)$ 是 $\alpha$ 在 $F$ 上的极小多项式。
3.  令 $X$ 为 $\mathcal{F}$ 中所有多项式在 $E$ 中的根集。
4.  根据条件 (3)，对于 $\mathcal{F}$ 中的任意多项式 $p_\alpha(x)$，因为它有一个根 $\alpha \in E$，所以它的**所有**根都必须在 $E$ 中。
5.  所以 $X \subseteq E$，从而 $F(X)\subseteq E$
6.  同时根据 $\mathcal{F}$ 的定义，$\forall \alpha \in E \Rightarrow \alpha \in X$
7.  所以 $E \subseteq X \subseteq F(X)$
8.  得到 $E = F(X)$，即 $E$ 是 $\mathcal{F}$ 在 $F$ 上的分裂域。

## 正规扩张的性质

### 性质 1：二次扩张都是正规扩张

> 设 $[E:F] = 2$，则 $E/F$ 是正规扩张。

**证明：**

1.  任取 $\alpha \in E \setminus F$。
2.  $\alpha$ 在 $F$ 上的极小多项式 $p_\alpha(x)$ 的次数 $\deg(p_\alpha) = [F(\alpha):F] \le [E:F] = 2$。
3. 同时 $\deg(p_\alpha) \ge 2$，因此 $\deg(p_\alpha) = 2$，以及 $E = F(\alpha)$
4. 同时 $p_{\alpha}(x)$ 可以写成 $p_{\alpha}(x) = (x-\alpha)\cdot (x-\beta)$ 的形式
5. $p_{\alpha}(x), (x-\alpha) \in E[x] \Rightarrow (x-\beta) \in E[x]$
6. 所以 $\beta \in E$
7.  $E = F(\alpha)$ 已经包含了 $p_\alpha(x)$ 的所有根（$\alpha$ 和 $\beta$）。
8.  因此 $E$ 是 $p_\alpha(x)$ 在 $F$ 上的分裂域。
9.  根据正规扩张的定义 (1)，$E/F$ 是正规扩张。

### 性质 2：扩张塔的性质 (Tower Property)

> 设 $F \subset L \subset E$。如果 $E/F$ 是正规扩张，那么 $E/L$ 也是正规扩张。

**证明：**

1.  因为 $E/F$ 是正规的，所以 $E$ 是 $F$ 上某族多项式 $\mathcal{F} \subseteq F[x]$ 的分裂域。
2.  这意味着 $E = F(X)$，其中 $X$ 是 $\mathcal{F}$ 中所有多项式在 $E$ 中的根集。
3.  那么有 $E = F(X) \subseteq L(X) \subseteq E$，即 $E = L(X)$。
8.  这表明 $E$ 是 $\mathcal{F}$（作为 $L$ 上的多项式族）在 $L$ 上的分裂域。
9.  故 $E/L$ 是正规扩张。

#### 反例：$L/F$ 不必是正规的

> 考虑扩张塔 $\mathbb{Q} \subset \mathbb{Q}(\sqrt[3]{2}) \subset \mathbb{Q}(\sqrt[3]{2}, \omega)$，其中 $\omega = e^{2\pi i / 3}$。

1.  我们知道 $E = \mathbb{Q}(\sqrt[3]{2}, \omega)$ 是 $x^3-2$ 在 $\mathbb{Q}$ 上的分裂域（根为 $\sqrt[3]{2}, \sqrt[3]{2}\omega, \sqrt[3]{2}\omega^2$），因此 $E/\mathbb{Q}$ 是正规扩张。
2.  根据上面的性质 (2)，$E/L$ (即 $\mathbb{Q}(\sqrt[3]{2}, \omega) / \mathbb{Q}(\sqrt[3]{2})$) 也一定是正规的。
3.  但是 $L/F$ (即 $\mathbb{Q}(\sqrt[3]{2}) / \mathbb{Q}$) **不是**正规扩张。

**理由：**

* $p(x) = x^3 - 2$ 是 $\mathbb{Q}$ 上的不可约多项式。
* $\alpha = \sqrt[3]{2}$ 是 $p(x)$ 的一个根，且 $\alpha \in \mathbb{Q}(\sqrt[3]{2})$。
* $p(x)$ 的另外两个根是 $\sqrt[3]{2}\omega$ 和 $\sqrt[3]{2}\omega^2$。
* $\mathbb{Q}(\sqrt[3]{2}) \subset \mathbb{R}$ 是一个实数域，而 $\omega$ 是复数，所以这两个根不在 $\mathbb{Q}(\sqrt[3]{2})$ 中。
* 这违反了正规扩张的等价定义 (3)：存在一个不可约多项式 $p(x)$，它在 $\mathbb{Q}(\sqrt[3]{2})$ 中有一个根，但没有在 $\mathbb{Q}(\sqrt[3]{2})$ 中完全分裂。
* 因此，$\mathbb{Q}(\sqrt[3]{2}) / \mathbb{Q}$ 不是正规扩张。


## 可分扩张 (Separable Extensions)

### 可分多项式
> **定义 (可分多项式)**
> 一个不可约多项式 $p(x) \in F[x]$ 称为 **可分多项式 (Separable Polynomial)**，如果它在其分裂域中没有重根。

### 可分元素
> **定义 (可分元素)**
> 设 $E/F$ 是一个域扩张。一个元素 $\alpha \in E$ 称为在 $F$ 上 **可分 (Separable)**，如果它在 $F$ 上的极小多项式 $p_\alpha(x) \in F[x]$ 是可分多项式。否则称 $\alpha$ 在 $F$ 上不可分。

### 可分扩张
> **定义 (可分扩张)**
> 扩张 $E/F$ 称为 **可分扩张 (Separable Extension)**，如果 $E$ 中的每一个元素 $\alpha$ 都在 $F$ 上可分。

**结论**：
* 如果 $char(F) = 0$，那么 $E/F$ 总是可分扩张
* 如果 $F$ 是有限域，那么 $E/F$ 总是可分扩张

*注：我们平时考虑的域总是有限域或者 $char(F)=0$，因此平时讨论的扩张都可分*

### 完美域 (Perfect Fields)
> **定义 (完美域)**
> 一个域 $F$ 称为 **完美域 (Perfect Field)**，如果 $F$ 上的所有不可约多项式都是可分的。


## Galois 扩张 (Galois Extensions)

### Galois 扩张
> **定义 (Galois 扩张)**
> 一个 **正规 (Normal)** 且 **可分 (Separable)** 的代数扩张 $E/F$ 称为 **Galois 扩张**。

### Galois 群
> **定义 (Galois 群)**
> 设 $E/F$ 是一个域扩张。$E$ 的所有 **$F$-自同构**（即保持 $F$ 中元素不动的 $E$ 到 $E$ 的同构）的集合，关于映射的复合运算构成一个群，称为 $E/F$ 的 **Galois 群**。
>
> 记为 $\text{Aut}_F(E)$ 或 $\text{Gal}(E/F)$ 或 $G_{F}(E)$。

#### Galois 群的大小
> **定理**
> 如果 $E/F$ 是一个有限扩张，则 $|G_{F}(E)| \le [E:F]$。当扩张为 Galois 扩张时，等号成立。

#### 例子 1：$\mathbb{Q}(\sqrt[3]{2}) / \mathbb{Q}$

这个扩张的 Galois 群是 $G_{\mathbb{Q}}(\mathbb{Q}(\sqrt[3]{2}))$。

1.  （如前所述，这个扩张**不是**正规的，因此它**不是** Galois 扩张。但我们仍然可以讨论它的 $F$-自同构群。）
2.  设 $\sigma \in G_{\mathbb{Q}}(\mathbb{Q}(\sqrt[3]{2}))$。 $\sigma$ 完全由它在 $\sqrt[3]{2}$ 上的取值决定（因为 $\mathbb{Q}(\sqrt[3]{2})$ 由 $\sqrt[3]{2}$ 在 $\mathbb{Q}$ 上生成）。
3.  $\sigma(\sqrt[3]{2})$ 必须是 $\sqrt[3]{2}$ 的极小多项式 $p(x) = x^3-2$ 的根。
4.  $p(x)$ 的根为 $\sqrt[3]{2}, \sqrt[3]{2}\omega, \sqrt[3]{2}\omega^2$。
5.  然而，$\sigma$ 是一个**自同构**，所以 $\sigma(\sqrt[3]{2})$ 必须在 $E = \mathbb{Q}(\sqrt[3]{2})$ 域中。
6.  $E$ 是一个实数域，它不包含两个复数根 $\sqrt[3]{2}\omega, \sqrt[3]{2}\omega^2$。（如笔记中所写："共轭根不在E中"）
7.  因此，唯一可能的取值是 $\sigma(\sqrt[3]{2}) = \sqrt[3]{2}$。
8.  这表明 $\sigma$ 只能是恒等自同构 ($id$)。
9.  所以 $\text{Gal}(\mathbb{Q}(\sqrt[3]{2}) / \mathbb{Q}) = \{ id \}$，群的阶为 1。
10. 这也验证了 $|G_F(E)| < [E:F]$，因为 $1 < [\mathbb{Q}(\sqrt[3]{2}) : \mathbb{Q}] = 3$。

*注：从这个例子可以看出，如果一个扩张 $E/F$ 不是正规扩张，那么就会导致 $E$ 中一部分元素的共轭不在 $E$ 中，使得自同构 $\sigma$ 的个数小于 $\left\vert E / F \right\vert$*
#### 例子 2：$\mathbb{Q}(\sqrt[3]{2}, \omega) / \mathbb{Q}$

1.  设 $E = \mathbb{Q}(\sqrt[3]{2}, \omega)$。
2.  $E$ 是 $x^3-2$（根为 $\sqrt[3]{2}, \sqrt[3]{2}\omega, \sqrt[3]{2}\omega^2$）在 $\mathbb{Q}$ 上的分裂域。
3.  $E/\mathbb{Q}$ 是正规扩张（因为它是分裂域）。
4.  由于 $char(\mathbb{Q})=0$，$E/\mathbb{Q}$ 是可分扩张。
5.  因此，$E/\mathbb{Q}$ 是 Galois 扩张。

计算 Galois 群

1.  根据 Galois 理论基本定理，$|\text{Gal}(E/\mathbb{Q})| = [E:\mathbb{Q}]$。
2.  我们有扩张塔 $\mathbb{Q} \subset \mathbb{Q}(\sqrt[3]{2}) \subset \mathbb{Q}(\sqrt[3]{2}, \omega) = E$。
3.  $[\mathbb{Q}(\sqrt[3]{2}) : \mathbb{Q}] = \deg(x^3-2) = 3$。
4.  $[\mathbb{Q}(\sqrt[3]{2}, \omega) : \mathbb{Q}(\sqrt[3]{2})] = \deg(p_{\omega, \mathbb{Q}(\sqrt[3]{2})}(x))$。
5.  $\omega$ 在 $\mathbb{Q}$ 上的极小多项式是 $x^2+x+1$。这个多项式在 $\mathbb{Q}(\sqrt[3]{2})$（实数域）上仍然不可约，所以次数为 2。
6.  $[E:\mathbb{Q}] = [E : \mathbb{Q}(\sqrt[3]{2})] \cdot [\mathbb{Q}(\sqrt[3]{2}) : \mathbb{Q}] = 2 \times 3 = 6$。
7.  所以 $|\text{Gal}(E/\mathbb{Q})| = 6$。

确定群的元素

一个自同构 $\sigma \in \text{Gal}(E/\mathbb{Q})$ 完全由它在生成元 $\sqrt[3]{2}$ 和 $\omega$ 上的取值决定：

1.  **对 $\sigma(\sqrt[3]{2})$ 的选择：** 必须是 $x^3-2$ 的根。
    * $\sqrt[3]{2}$
    * $\sqrt[3]{2}\omega$
    * $\sqrt[3]{2}\omega^2$
    * (共 3 种选择)

2.  **对 $\sigma(\omega)$ 的选择：** 必须是 $x^2+x+1$ 的根。
    * $\omega$
    * $\omega^2$
    * (共 2 种选择)

总共 $3 \times 2 = 6$ 种组合，这 6 种组合唯一确定了 $G$ 中的 6 个自同构。