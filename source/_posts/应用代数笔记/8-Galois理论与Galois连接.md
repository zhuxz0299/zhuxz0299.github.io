---
title: Galois理论与Galois连接
cover: 'https://source.fomal.cc/img/default_cover_180.webp'
categories: applied algebra
katex: true
abbrlink: 3d2c8e8d
date: 2025-11-13 22:13:07
description: 从伽罗瓦不动域引入伽罗瓦基本对应，再引入抽象的伽罗瓦连接来分析域和伽罗瓦群之间的关系
---

## 伽罗瓦理论 (Galois Theory)
下面考虑的域扩张都是代数扩张，并且通常也都是有限、可分扩张。

### 回顾：伽罗瓦群 (Galois Group)

> **定义：伽罗瓦群 (Galois Group)**
>
> 域扩张 $E/F$ 的伽罗瓦群，记为 $\text{Gal}(E/F)$（笔记中简记为 $G_F(E)$），是 $E$ 上所有保持 $F$ 中元素不变（即 $F$-自同构）的自同构 $\sigma: E \to E$ 组成的群。
>
> $$
> G_F(E) = \{ \sigma \in \text{Aut}(E) \mid \forall \alpha \in F, \sigma(\alpha) = \alpha \}
> $$
>
> 这等价于 $\sigma|_F = \iota$（$\sigma$ 在 $F$ 上的限制是恒等映射）。

-   如果 $F < L < E$ 是一个**中间域 (intermediate field)**，
-   那么 $G_L(E)$ 是 $G_F(E)$ 的一个子群 ($G_L(E) < G_F(E)$)。

### 不动域 (Fixed Field)

> **定义：不动域 (Fixed Field)**
>
> 设 $H < G_F(E)$ 是伽罗瓦群的一个子群。$H$ 的不动域 $fix(H)$ 定义为：
>
> $$
> fix(H) = \{ \alpha \in E \mid \forall \sigma \in H, \sigma(\alpha) = \alpha \}
> $$
>
> 即 $E$ 中所有被 $H$ 中 *每一个* 自同构 $\sigma$ 保持不变的元素组成的集合。

**证明：$fix(H)$ 是 $E$ 的一个子域 (subfield)。**

$\forall \alpha, \beta \in fix(H)$，$\forall \sigma \in H$：
1.  **加法/减法：** $\sigma(\alpha \pm \beta) = \sigma(\alpha) \pm \sigma(\beta) = \alpha \pm \beta$。
    所以 $(\alpha \pm \beta) \in fix(H)$。
2.  **乘法/除法：**（假设 $\beta \neq 0$） $\sigma(\alpha \beta^{-1}) = \sigma(\alpha) \sigma(\beta^{-1}) = \sigma(\alpha) \sigma(\beta)^{-1} = \alpha \beta^{-1}$。
    所以 $(\alpha \beta^{-1}) \in fix(H)$。

因此，$fix(H)$ 对域运算封闭，是 $E$ 的一个子域。

### 伽罗瓦基本对应
利用不动域以及伽罗瓦扩张的定义，可以在 $E/F$ 的中间域集合 $\mathcal{F} \overset{\underset{\mathrm{def}}{}}{=}\{ L | F<L<E \}$ 与 $G_F(E)$ 的子群集合 $\mathcal{G} \overset{\underset{\mathrm{def}}{}}{=} \{ H | \{ \iota \} < H < G_{F}(E) \}$ 之间构造一个对应关系。

我们现在有两个核心映射：

1.  **$\Pi$ 映射**（从域到群）：
    -   $L \mapsto G_L(E) \quad \mathcal{F} \xrightarrow{G_{\cdot}(E)} \mathcal{G}$
2.  **$\Omega$ 映射**（从群到域）：
    -   $H \mapsto fix(H) \quad \mathcal{G} \xrightarrow{fix(\cdot )} \mathcal{F}$



#### 对应的基本性质

这两个映射具有**反向包含 (inclusion-reversing)** 的性质：

1.  如果 $F < K < L < E$，那么 $G_L(E) \le G_K(E)$。
2.  如果 $H < K < G_F(E)$，那么 $fix(K) \le fix(H)$。

对于任意中间域 $L$ 和任意子群 $H$：

1.  $L \subseteq fix(G_L(E))$
    （$L$ 中的元素按定义被 $G_L(E)$ 中所有自同构固定，所以 $L$ 必然在 $fix(G_L(E))$ 中。）
2.  $H \subseteq G_{fix(H)}(E)$
    （$H$ 中的自同构按定义固定 $fix(H)$ 中所有元素，所以 $H$ 必然在 $G_{fix(H)}(E)$ 中。）

### 伽罗瓦理论基本定理 (Fundamental Theorem of Galois Theory)

> **定理：伽罗瓦理论基本定理 (Fundamental Theorem of Galois Theory)**
>
> 如果 $E/F$ 是一个**伽罗瓦扩张**，那么：
>
> 1.  上述两个包含关系 **都是等号**：
>     * $L = fix(G_L(E))$
>     * $H = G_{fix(H)}(E)$
> 2.  $\Pi$ 和 $\Omega$ 映射是 $E/F$ 的**中间域集合**与 $G_F(E)$ 的**子群集合**之间的、**互为逆的、反向包含的双射**。
> 3.  **度/指数关系：**
>     * $[E:L] = |G_L(E)|$
>     * $[L:F] = (G_F(E) : G_L(E))$ (群的指数)

**注：** 如果 $E/F$ 不是伽罗瓦扩张，上述等号不一定成立。
*例子：* 设 $F = \mathbb{Q}$，$E = \mathbb{Q}(\sqrt[3]{2})$。
这是一个 $3$ 次扩张，但 $E$ 不是 $\mathbb{Q}$ 上的正规扩张。$E$ 中只有恒等自同构 $\sigma = \iota$ 能保持 $\mathbb{Q}$ 不变（因为 $\sqrt[3]{2}$ 必须被映到 $E$ 中的一个根，而 $E$ 中只有一个实根 $\sqrt[3]{2}$）。
因此 $G_F(E) = G_{\mathbb{Q}}(E) = \{ \iota \}$。
那么 $fix(G_F(E)) = fix(\{ \iota \}) = E = \mathbb{Q}(\sqrt[3]{2})$。
但是 $F = \mathbb{Q}$。
所以 $F \neq fix(G_F(E))$。

## 抽象化：伽罗瓦连接 (Galois Connection)

伽罗瓦理论中的这种双重对应关系可以被抽象出来。

### 伽罗瓦连接 (Galois Connection)

> **定义：伽罗瓦连接 (Galois Connection)**
>
> 设有两个偏序集合 $(P, \le)$ 和 $(Q, \le)$，以及两个映射 $\Pi: P \to Q$，$\Omega: Q \to P$
> 后面为方便，记 $\Pi(p) = p^{*}, p \in P \quad \Omega(q) = q', q \in Q$
>
> 我们称 $(\Pi, \Omega)$ 构成 $(P, Q)$ 上的**伽罗瓦连接**，如果它们满足：
>
> 1.  **序反转 (Order-reversing):**
>     * $\forall p_1, p_2 \in P, \quad p_1 \le p_2 \implies p_2^* \le p_1^*$
>     * $\forall q_1, q_2 \in Q, \quad q_1 \le q_2 \implies q_2' \le q_1'$
> 2.  **扩张 (Extension):**
>     * $\forall p \in P, \quad p \le (p^*)'$ (简记 $p \le p^{*\prime}$)
>     * $\forall q \in Q, \quad q \le (q')^*$ (简记 $q \le q'^*$)

可以看出伽罗瓦连接正好对应了前面 $\mathcal{F}$ 与 $\mathcal{G}$ 之间的映射的性质。

### 闭包运算 (Closure Operator)

> **定义：闭包运算 (Closure Operator)**
>
> 偏序集 $P$ 上的一个映射 $cl: P \to P$ 称为**闭包运算**，如果它满足：
>
> 1.  **扩张 (Extension):** $\forall p \in P, \quad p \le cl(p)$
> 2.  **幂等 (Idempotent):** $\forall p \in P, \quad cl(cl(p)) = cl(p)$
> 3.  **单调 (Isotonic):** $\forall p, q \in P, \quad p \le q \implies cl(p) \le cl(q)$

### 伽罗瓦连接与闭包运算

> **定理**
>
> 在一个伽罗瓦连接 $(\Pi, \Omega)$ 中，由 $cl_P(p) = p^{*\prime}$ 定义的 $cl_P: P \to P$ 和由 $cl_Q(q) = q'^*$ 定义的 $cl_Q: Q \to Q$ 都是**闭包运算**。

**证明：** (以 $cl_P(p) = p^{*\prime}$ 为例)

1.  **扩张：** $p \le p^{*\prime}$。
    (这直接由伽罗瓦连接的定义 2 得到。)
2.  **单调：** 设 $p \le q$。
    * 应用 $*$ (序反转)：$q^* \le p^*$。
    * 应用 $'$ (序反转)：$p^{*\prime} \le q^{*\prime}$。
    * 即 $cl_P(p) \le cl_P(q)$。
3.  **幂等：** 需证 $cl_P(cl_P(p)) = cl_P(p)$，即 $p^{*\prime *\prime} = p^{*\prime}$。
    * 首先，我们证明一个有用的引理：$p^{*\prime*} = p^*$。
        * (a) 对 $p \in P$ 应用扩张 (2)： $p \le p^{*\prime}$。
        * 将 $*$ (序反转) 应用于 (a)： $p^{*\prime*} \le p^*$。
        * (b) 对 $p^* \in Q$ 应用扩张 (2)： $p^* \le (p^*)'^* = p^{*\prime*}$。
        * (c) 结合 (a) 和 (b)，我们得到 $p^{*\prime*} = p^*$。
    * 现在我们证明幂等性： $p^{*\prime *\prime} = p^{*\prime}$。
    * 将 $'$ (序反转) 应用于 $p^{*\prime*} = p^*$ (我们刚证的引理) 的两边，
    * 得到 $(p^{*\prime*})' = (p^*)'$，即 $p^{*\prime *\prime} = p^{*\prime}$。
    * (证毕。)

> **定义：闭元**
> 称 $p \in P$ 是**闭元 (closed element)**，如果 $p = cl_P(p)$ (即 $p = p^{*\prime}$) 。
> 称 $q \in Q$ 是**闭元 (closed element)**，如果 $q = cl_Q(q)$ (即 $q = q'^*$) 。

* $*$ 映射的像集（$\text{Im}(*)$）中的元素总是 $Q$ 中的闭元。
    (证明： $\forall p^* \in \text{Im}(*)$， $cl_Q(p^*) = (p^*)'^* = p^{*\prime*}$。根据上述引理，$p^{*\prime*} = p^*$。所以 $cl_Q(p^*) = p^*$。)
* $'$ 映射的像集（$\text{Im}(')$）中的元素总是 $P$ 中的闭元。
    (同理可证 $cl_P(q') = q'^{*\prime} = q'$)。

### 抽象伽罗瓦基本定理

> **定理：抽象伽罗瓦基本定理**
>
> 伽罗瓦连接 $(\Pi, \Omega)$ 建立了 $P$ 中**所有闭元**的集合 $cl(P)$ 与 $Q$ 中**所有闭元**的集合 $cl(Q)$ 之间的一个**反向同构（order-reversing isomorphism）**（即反向双射）。
>
> $\Pi: cl(P) \to cl(Q)$ (定义为 $p \mapsto p^*$)
> $\Omega: cl(Q) \to cl(P)$ (定义为 $q \mapsto q'$)
>
> 这两个映射互为逆映射。

**证明：**
1. **首先证明是满射**：
    对于 $\forall q\in cl(Q)$，有 $q = cl(q) = q'^{*}$，即总能找到 $q'\in P$ 使得 $(q')^{*} = q$，是满射。
2. **然后证明是单射**
    $\forall p_1, p_2 \in cl(P)$，考虑 $p_1^{*} = p_2^{*}$，可以推得 $p^{*\prime} = q^{*\prime} \Rightarrow p = q$，是单射。
3.  **最后验证互为逆映射**
    显然有 $\Pi \circ \Omega = \Omega \circ \Pi = \iota$
(证毕。)

### 实例化与闭元分析

* $P$ $: \mathcal{F} =${ $E/F$ 的中间域 $L$ }
* $Q$ $: \mathcal{G} =$ { $G_F(E)$ 的子群 $H$ }
* $\Pi : G_{\cdot }(E)$
* $\Omega : fix(\cdot )$

$L$ 是闭元 $\iff L = L^{*\prime} = fix(G_L(E))$。
$H$ 是闭元 $\iff H = H'^* = G_{fix(H)}(E)$。

**分析Top和Bottom元素：**
* $P$ 中：$1_P = E$ (最大元)，$0_P = F$ (最小元)。
* $Q$ 中：$1_Q = G_F(E)$ (最大元)，$0_Q = \{\iota\}$ (最小元)。

1. 首先分析两边的 top 元素：根据闭包运算的性质，有 $1_{P} \le 1_{P}^{* \prime}$，但是 $1_{P}$ 是 $P$ 中的 top 元素，因此 $1_{P} = 1_{P}^{* \prime}$。同理 $1_{Q} = 1_{Q}^{\prime *}$
    **结论：** $1_{P}, 1_{Q}$ 都是闭元。
2. 既然 top 元素是闭元，那么就会在映射的像中，例如考虑 $1_{P}$，$\exists q\in Q, q' = 1_{P}$。同时利用伽罗瓦连接的 order-reversing 的性质，这个 $q$ 恰好应当为 $0_{Q}$。
    **结论：** $1_{P} = 0_{Q}' \quad 1_{Q} = 0_{P}^{*}$
3. 不难看出 $Q$ 中的最小闭元为 $1_{P}^*$，那么 
    **结论：** $0_{Q}$ 是闭元 $\iff$ $0_{Q} = 1_{P}^{*}$；$0_{P}$ 是闭元 $\iff$ $0_{P} = 1_{Q}^{*}$

接下来考察具体的 $\mathcal{F}$ 与 $\mathcal{G}$：
1. 由于 $G_{E}(E) = \{ \iota \}$，因此 $\{ \iota \}$ 恰好是闭元
2. 然后考察 $fix(G_{F}(E))$，只能得到 $fix(G_{F}(E))\ge F$，因此 $F$ 不一定闭
   * 如前例 $F = \mathbb{Q}$，$E = \mathbb{Q}(\sqrt[3]{2})$


## 带标度的伽罗瓦连接 (Indexed Galois Connection)

我们可以将“域扩张的度”和“群的指数”也抽象进来。

> **定义：带标度的伽罗瓦连接**
>
> 设 $(P, \le)$ 和 $(Q, \le)$ 有一个伽罗瓦连接 $(\Pi, \Omega)$。
>
> 1.  对 $p, q \in P$ 且 $p \le q$，定义 $(q:p)$ 为 $q$ over $p$ 的**度 (degree)**。
> 2.  对 $r, s \in Q$ 且 $r \le s$，定义 $(s:r)$ 为 $s$ over $r$ 的**指数 (index)**。
> 3.  **塔律 (Tower Law):**
>     * $p_1 \le p_2 \le p_3 \in P \implies (p_3:p_1) = (p_3:p_2) \cdot (p_2:p_1)$
>     * $s_1 \le s_2 \le s_3 \in Q \implies (s_3:s_1) = (s_3:s_2) \cdot (s_2:s_1)$
> 4.  **度/指数关系：(degree nonincreasing)** 
>     * $\forall p \le q \in P \implies (q:p) \ge (p^* : q^*)$
>     * $\forall r \le s \in Q \implies (s:r) \ge (r' : s')$
> 5.  **非退化：** $(q:p)=1 \implies p=q$。


> **定理**
>
> 1.  **闭元上的度保持 (Degree-preserving on closed elements):**
>     如果 $p, r \in cl(P)$ (都是闭元) 且 $p \le r$，那么 $(r:p) = (p^* : r^*)$。
>
> 2.  **闭元的有限扩张是闭的 (Finite extensions of closed elements are closed):**
>     如果 $p \in cl(P)$ (是闭元)，$p \le r \in P$，且 $(r:p) < \infty$ (有限扩张)，
>     那么 $r$ 也是闭元 ($r \in cl(P)$)。

**证明 (1. 度保持):**

* (a) $(r:p) \ge (p^* : r^*)$ (由定义 4)。
* (b) $p \le r \implies r^* \le p^*$。
* $p^*$ 和 $r^*$ 都是 $Q$ 中的闭元 (因为它们是 $*$ 的像)。
* 对 $Q$ 中的 $r^* \le p^*$ 应用定义 4：
    $(p^* : r^*) \ge ( (r^*)' : (p^*)' )$
* 因为 $p, r$ 是 $P$ 中的闭元， $r^{*\prime} = r$ 且 $p^{*\prime} = p$。
* 所以 $(p^* : r^*) \ge (r:p)$。
* 结合 (a) 和 (b)，得 $(r:p) = (p^* : r^*)$。

**证明 (2. 有限扩张是闭的):**

* $p \in cl(P)$，$r \in P$，$p \le r$ 且 $(r:p) < \infty$。
* 我们需要证明 $cl(r) = r$。
* 由闭包定义 (1)， $r \le cl(r)$。
* $p, cl(r)$ 都是闭元 ($p$ 假设是闭元, $cl(r)$ 根据定义总是闭元)。
* $p \le r \le cl(r)$。
* 应用塔律： $(cl(r) : p) = (cl(r) : r) \cdot (r:p)$。
* 应用 (1. 度保持) (因为 $p, cl(r)$ 是闭元)： $(cl(r) : p) = (p^* : cl(r)^*)$。
* $cl(r) = r^{*\prime}$，所以 $cl(r)^* = r^{*\prime*}$。
* 我们已知 $r^{*\prime*} = r^*$ (在闭包运算的证明中)。
* 所以 $(cl(r) : p) = (p^* : r^*)$。
* 另一方面，由定义 (4)： $(r:p) \ge (p^* : r^*)$。
* **组合起来：**
    $$
    (cl(r) : r) \cdot (r:p) = (cl(r) : p) = (p^* : r^*) \le (r:p)
    $$
* 即 $(cl(r) : r) \cdot (r:p) \le (r:p)$。
* 因为 $(r:p)$ 是有限的，我们可以约去它。
* 得到 $(cl(r) : r) \le 1$。
* 根据定义 (5)，这必然意味着 $(cl(r) : r) = 1$，且 $cl(r) = r$。
* 因此 $r$ 是闭元。

### 最终总结

**伽罗瓦理论基本定理**是上述抽象理论的一个完美实例：

1.  假设 $E/F$ 是一个**伽罗瓦扩张**。
2.  这意味着 $F$ 是一个**闭元** ($F = fix(G_F(E))$)。
3.  假设 $E/F$ 是**有限扩张** ($[E:F] < \infty$)。
4.  根据**定理 2** (有限扩张是闭的)，$F$ 的任何有限扩张（即任何中间域 $L$）也**都是闭元** ($L = fix(G_L(E))$)。
5.  (同时，对于群，在伽罗瓦扩张下，所有子群 $H$ 也都是闭元 $H = G_{fix(H)}(E)$。)
6.  因此，在有限伽罗瓦扩张 $E/F$ 中，**所有**中间域和**所有**子群都是闭元。
7.  根据**抽象伽罗瓦基本定理**，这两个集合（中间域集合与子群集合）通过 $L \mapsto G_L(E)$ 和 $H \mapsto fix(H)$ 建立了一个完美的**反向双射**。
8.  根据**定理 1** (度保持)，这个双射还保持度与指数的相等关系：
    $[L:F] = (G_F(E) : G_L(E))$。