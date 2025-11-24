---
title: Galois理论-part2
cover: 'https://source.fomal.cc/img/default_cover_181.webp'
categories: applied algebra
katex: true
description: 从伽罗瓦不动域引入伽罗瓦基本对应，再引入抽象的伽罗瓦连接来分析域和伽罗瓦群之间的关系
abbrlink: c43d02cd
date: 2025-11-23 20:58:48
---

## Closed 性质与 Index

> **定义：完全 closed**
> $P$ 为 **完全 closed**，如果 $P$ 中所有元素都是闭元；$Q$ 为 **完全 closed**，如果 $Q$ 中所有元素都是闭元。

> **定义：index**
> $$
> index(P) \overset{\underset{\mathrm{def}}{}}{=} (1_{P}: 0_{P}) \quad index(Q) \overset{\underset{\mathrm{def}}{}}{=} (1_{Q}:0_{Q})
> $$

如果将 $P, Q$ 分别于域集合 $\mathcal{F}$ 以及伽罗瓦群集合 $\mathcal{G}$ 对应，那么应当有 $0_{Q}$ 为闭元，即有 $0_{Q}'^{*} = 1_{P}^{*} = 0_{Q}$。从而可以得到 $index(P), index(Q)$ 之间的关系：
$$
index(P) = (1_{P}:0_{P}) \ge (0_{P}^{*}: 1_{P}^{*}) = (1_{Q}:0_{Q}) = index(Q)
$$

> **定理**
> (1) 若 $index(Q) < \infty$ 或者 $index(P)<\infty$（即指数有限）$\Rightarrow Q$ 是 **完全 Closed**。
> (2) 若 $index(P) < \infty$，并且 $0_{P}$ 是闭元 $\Rightarrow P$ 是 **完全 Closed**

**说明**
1. 因为 $index(Q)<index(P)$，因此 $index(Q)<\infty \lor index(P)<\infty \Rightarrow index(Q)<\infty$。由于之间认为 $0_{Q}$ 是闭元，以及闭元的有限扩张都是闭的，因此 $Q$ 是完全 Closed。
2. 同样利用“闭元的有限扩张都是闭的”这一性质，此时要担心的就是 $0_{P}$ 是否为闭元的问题。


由于我们通常都考虑有限扩张，从上面的讨论可知，如果 $0_{P}$ 也是闭元，那么 $P, Q$ 就都是完全 Closed，就会有比较好的性质。现在我们希望考虑 $(\mathcal{F}, \mathcal{G})$ 是否为完全 Closed，这个时候就需要考虑两个条件：
1. 需要验证 $(\mathcal{F}, \mathcal{G})$ 的 index 能够满足 $(P, Q)$ 中 degree-nonincreasing 的性质。满足了这一点，$\mathcal{F}, \mathcal{G}$ 的关系才能继续套用伽罗瓦连接的性质。
2. $F = fix(G_{F}(G))$，即使得 $1_{P}$ 为闭元

接下来我们先来验证第一条性质是否满足。

## Degree Non-increasing (度的非增性)
考察域扩张链 $F < K < L < E$。我们希望首先证明 degree-non increasing。

> **定理**
> $$(G_K(E) : G_L(E)) \le [L : K]$$

**证明推导：**

定义映射 $\phi$：
$$
\begin{aligned}
\phi: G_K(E) &\rightarrow hom_K(L, E) \\
\sigma &\rightarrow \sigma|_L
\end{aligned}
$$

(即将 $E$ 上的自同构限制在 $L$ 上)

对于 $\sigma, \tau \in G_K(E)$，考察 $\phi(\sigma) = \phi(\tau)$
$$
\begin{aligned}
& \phi(\sigma) = \phi(\tau) \\
\iff & \sigma|_L = \tau|_L \\
\iff & \forall \alpha \in L, \sigma(\alpha) = \tau(\alpha) \\
\iff & \sigma^{-1}\tau(\alpha) = \alpha \\
\iff & \sigma^{-1}\tau \in G_L(E)
\end{aligned}
$$


即 $\sigma, \tau$ 属于 $G_L(E)$ 在 $G_K(E)$ 中的 **同一左陪集**。这说明 $\phi$ 在 $G_{L}(E)$ 的每个陪集上的值相同；在不同陪集上的值不同.

即：$Im(\phi)$ 的大小等于 $G_K(E)/G_L(E)$ 的陪集个数。
$$
(G_K(E) : G_L(E)) = |Im(\phi)| \le \left\vert hom_{K}(L, E) \right\vert 
$$

我们已知 $K < L$ 有限可分时，有 $L = K(\alpha), \alpha \in L$，那么由代数扩张的延展定理，可以找到 $K$ -嵌入 $\sigma: K(\alpha) \hookrightarrow \bar{K}$。$\left\vert hom_{K}(L, \bar{K}) \right\vert$ 可以表示上述 $\sigma$ 的数量，同时存在数量关系：
$$
\left\vert hom_{K}(L, \bar{K}) \right\vert = deg(\min_{}(\alpha, K)) = [K(\alpha): K] = [L: K]
$$

结合上述两点：
$$
(G_K(E) : G_L(E)) = |Im(\phi)| \le |hom_K(L, E)| \le \left\vert hom_{K}(L, \bar{K}) \right\vert = [L:K]
$$

得证。

> **定理**
> 设 $J < H < G_F(E)$，则：
> $$[fix(J) : fix(H)] \le  (H : J)$$
> 
> (课上不证)

## Closed 与 Galois 扩张的关系
> **定理**
> $F$ 为 closed，即 $F = fix(G_F(E))$ $\iff$ $E / F$ 是有限伽罗瓦扩张

**证明**：
$\Rightarrow$：
* 假如 $F$ 是闭元，考虑 $\forall \alpha \in E \setminus F$，有 $[F(\alpha): F]<\infty$
* 利用闭元的有限扩张还是闭元的性质，得到 $F(\alpha)$ 是闭元。
* 再利用闭元度保持的性质，有 $[F(\alpha) :F] = (G_{F}(E): G_{F(\alpha)}(E))$，将其记为 $d$
* 设 $\sigma_1, \ldots \sigma_{d}$ 是 $G_{F}(E)/ G_{F(\alpha)}(E)$ 的一组完全代表系，即每个元素在不同的陪集中
* 由于 $\sigma_i$ 是 $E$ 的 $F$-自同构，因此 $\sigma_1(\alpha) , \ldots \sigma_{d}(\alpha)$ 都是 $\alpha$ 的共轭元
* 接下来希望证明 $\sigma_1(\alpha) , \ldots \sigma_{d}(\alpha)$ 两两互不相同
  * 如果 $\sigma_i(\alpha) = \sigma_j(\alpha) \Rightarrow \sigma_j^{-1}\sigma_i(\alpha) = \alpha \Rightarrow \sigma_j^{-1}\sigma_i \in G_{F(\alpha)}(E)$
  * 那么 $\sigma_i, \sigma_j$ 在同一陪集中，与假设矛盾
  * 因此 $\sigma_1(\alpha) , \ldots \sigma_{d}(\alpha)$ 为 $d$ 个不同的 $\alpha$ 的共轭元
* 而 $\alpha$ 共有 $d$ 个共轭元，因此 $\sigma_1(\alpha) , \ldots \sigma_{d}(\alpha)$ 为 $\alpha$ 的极小多形式 $p_{\alpha}(x)$ 的所有根
* $\forall i, \sigma_i(\alpha) \in E$，说明 $p_{\alpha}$ 在 $E$ 中分裂
* 所以 $E / F$ 是正规扩张
* 得到 $E / F$ 是有限伽罗瓦扩张



反之，若 $E/F$ 是 Galois 扩张，则 $cl(F) = F$。即 $F$ 是 closed。

## Fundamental Theorem of Galois Theory (Galois 理论基本定理)

设 $F < E$ 为有限 Galois 扩张。

> **定理 (Galois Theory)**
> 1.  $F, E$ 的中间域与 $G_F(E)$ 的子群存在 **一一对应** (互逆双射)。
>     $$K \longleftrightarrow G_K(E)$$
>     $$H \longleftrightarrow fix(H)$$
>
> 2.  对于 $F < K < L < E$：
>     $$[L : K] = (G_K(E) : G_L(E))$$
>     对于 $1 < J < H < G_F(E)$：
>     $$(H : J) = [fix(J) : fix(H)]$$
>     特别地：$[E : F] = |G_F(E)|$。
>     注：$\overline{L} = L \iff L = fix(G_L(E))$。
>
> 3.  $K/F$ 是 Galois 扩张 $\iff G_K(E) \triangleleft G_F(E)$ (正规子群)。
>     且此时：
>     $$G_F(K) \cong G_F(E) / G_K(E)$$

## 例子：$E = \mathbb{Q}(\sqrt{2}, \sqrt{3})$

考虑多项式 $(x^2 - 2)(x^2 - 3)$ 的分裂域。这是一个 Galois 扩张。
我们写出 $G_{\mathbb{Q}}(E)$ 的子群及对应的中间域。

**1. 基本参数**
$[E : \mathbb{Q}] = 4$
$|G_{\mathbb{Q}}(E)| = 4$

**2. 群元素**
令 $\hat{\sigma}$ 作用如下：
$\sqrt{2} \to \pm \sqrt{2}$
$\sqrt{3} \to \pm \sqrt{3}$

具体元素 $G_{\mathbb{Q}}(E) = \{id, \sigma, \tau, \sigma\tau\}$：
* $id$: 恒等
* $\sigma$: $\sqrt{2} \to -\sqrt{2}, \quad \sqrt{3} \to \sqrt{3}$
* $\tau$: $\sqrt{2} \to \sqrt{2}, \quad \sqrt{3} \to -\sqrt{3}$
* $\sigma\tau$: $\sqrt{2} \to -\sqrt{2}, \quad \sqrt{3} \to -\sqrt{3}$

**3. 子群与中间域对应**

* **子群 $\{id\}$**
    对应域 $E = \mathbb{Q}(\sqrt{2}, \sqrt{3})$

* **子群 $<\sigma> = \{id, \sigma\}$**
    $\sigma$ fixes $\sqrt{3}$.
    $\Rightarrow \mathbb{Q}(\sqrt{3}) \subseteq fix(<\sigma>)$
    计算次数：
    $[fix(<\sigma>) : \mathbb{Q}] = (G_{\mathbb{Q}}(E) : <\sigma>) = 4/2 = 2$
    同时 $[\mathbb{Q}(\sqrt{3}) : \mathbb{Q}] = 2$
    $\Rightarrow fix(<\sigma>) = \mathbb{Q}(\sqrt{3})$

* **子群 $<\tau> = \{id, \tau\}$**
    $\tau$ fixes $\sqrt{2}$.
    $\Rightarrow fix(<\tau>) = \mathbb{Q}(\sqrt{2})$

* **子群 $<\sigma\tau> = \{id, \sigma\tau\}$**
    $\sigma\tau$ fixes $\sqrt{2}\cdot\sqrt{3} = \sqrt{6}$.
    $\Rightarrow fix(<\sigma\tau>) = \mathbb{Q}(\sqrt{6})$

正好 3 个中间域 (考试可能会考)。