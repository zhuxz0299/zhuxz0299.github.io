---
title: FOL semantics
cover: 'https://source.fomal.cc/img/default_cover_138.webp'
categories: discrete math
katex: true
description: 'FOL semantics, Properties of first order propositions'
abbrlink: b98d1e32
date: 2025-04-04 15:24:42
tags:
---

### FOL semantics
可以由一阶逻辑结构($S$-structures)来决定真假的命题：
$\forall x(L(x, f(x)))\quad \forall x(M(x))\quad \exists x(P(x)\land E(x)) \quad G(c)$

这些命题的真假和变量符号 $x$ 的具体取值无关，而是与 $\forall$ 或者 $\exists$ 描述的范围范围有关。但是有些一阶逻辑命题也是可以没有量词的，比如：
$L(x, y) \quad L(x,f(x))$

但是这些命题的真与假就取决于变量的赋值。

**Definition 1** (Free occurrence and binded occurrence，约束出现和自由出现). Assume $x$ is a variable symbol. In $\forall x \phi$ and $\exists x \phi$, all occurrences of $x$ are called binded occurrences. All other occurrences of $x$ are free occurrences.

例如上述 $L(x, y)$ 中的 $x, y$ 都是自由出现；但如果是 $\forall x\exists y(L(x, y))$，那么 $x, y$ 就都是约束出现。

**Definition 2** (Open proposition and closed proposition，开命题和闭命题). A FOL proposition $\phi$ is open if it contains at least one free occurrence of variables. Otherwise, $\phi$ is called a closed proposition.

也就是说只要命题中至少有一个自由出现的变量符号，那这个一阶逻辑命题就是开命题。根据上节课的内容，对于闭命题而言，只要通过一阶逻辑的结构（$S$-structure）就可以判断命题的真值。但如果是开命题，就还和变量值有关。

**Example 3.**
一些开闭命题的例子，没什么好说的。

**Definition 4** ($S$-interpretation，$S$ 解释).
Given a symbol set $S$, a $S$-interpretation $\mathcal{J} = (\mathcal{A}, \beta)$ is
* a $S$-structure $\mathcal{A} = (A, \alpha)$
* a $S$-assignment $\beta$: a mapping from variables to elements in the domain $A$
For $\mathcal{J} = (\mathcal{A}, \beta)$ and $\mathcal{A} = (A, \alpha)$, we usually use $\mathcal{J}(P)$ and $\mathcal{A}(P)$ to represent $\alpha(P)$, use $\mathcal{J}(f)$ and $\mathcal{A}(f)$ to represent $\alpha(f)$, use $\mathcal{J}(c)$ and $\mathcal{A}(c)$ to represent $\alpha(c)$ and use $\mathcal{J}(x)$ to represent $\beta(x)$.

就是说 $S$-interpretation 就是在 $S$-structure 的基础上加了一个对变量符号的解释，即把每一个变量符号都映射到论域中的元素。通常用字母 $\mathcal{J}$ 来表示一个解释。

**Defination 5** (Terms’ denotation). For $S$-interpretation $\mathcal{J}$ and a $S$-term $t$,
* $[\![x]\!]_{\mathcal{J}} = \mathcal{J}(x)$
* $[\![c]\!]_{\mathcal{J}} = \mathcal{J}(c)$
* $[\![f(t_1, t_2, \ldots ,t_n)]\!]_{\mathcal{J}} = \mathcal{J}(f) ([\![t_1]\!]_{\mathcal{J}}, [\![t_2]\!]_{\mathcal{J}}, \ldots [\![t_n]\!]_{\mathcal{J}})$

这里定义了 term 的语义，方便后面定义命题真值。

**Definition 6** (Propositions' truth).
For $S$-interpretation $\mathcal{J}$ and a $S$-proposition $t$,
* $[\![\mathrm{P}\left(t_{1}, t_{2}, \ldots, t_{n}\right)]\!]_{\mathcal{J}}=\mathcal{J}(P)\left([\![t_{1}]\!]_{\mathcal{J}},[\![t_{2}]\!]_{\mathcal{J}}, \ldots,[\![t_{n}]\!]_{\mathcal{J}}\right)$
* $[\![\phi \wedge \psi]\!]_{\mathcal{J}}=[\![\wedge]\!]\left([\![\phi]\!]_{\mathcal{J}},[\![\psi]\!]_{\mathcal{J}}\right)$
* $[\![\neg \phi]\!]_{\mathcal{J}}=[\![\neg]\!]\left([\![\phi]\!]_{\mathcal{J}}\right)$
* $[\![\forall x \phi]\!]_{\mathcal{J}}=\mathbf{T}$ if and only if for every $a$ in $\mathcal{A}$ 's domain, $[\![\phi]\!]_{\mathcal{J}[x \mapsto a]}=\mathbf{T}$
* $[\![\exists x \phi]\!]_{\mathcal{J}}=\mathbf{T}$ if and only if for at least one $a$ in $\mathcal{A}$ 's domain, $[\![\phi]\!]_{\mathcal{J}[x \mapsto a]}=\mathbf{T}$

where $\mathcal{J}[x \mapsto a]$ is a S-interpretation which keeps all other interpretations in $\mathcal{J}$ and interprets $x$ by $a$.

**Example 7**
- $L$ is a binary predicate symbol.
- $f$ is a unary function symbol.
- $S = \{L, f\}$ is a set of symbols.
- For any $a, b \in \mathbb{R}$, $\alpha(L)(a, b) = \text{T}$ if $a < b$; otherwise $\alpha(L)(a, b) = \text{F}$
- For any $a \in \mathbb{R}$, $\alpha(f)(a) = 2a$
- $\mathcal{A} = (\mathbb{R}, \alpha)$ is an S-structure.
- $\mathcal{J}_1 = (\mathcal{A}, \beta_1)$ is an S-interpretation, s.t. $\beta_1(x) = 0$.
- $\mathcal{J}_2 = (\mathcal{A}, \beta_2)$ is an S-interpretation, s.t. $\beta_2(x) = 1$.
- $\mathcal{J}_6 = \mathcal{J}_1[x \mapsto 1]$. Remark: it is not necessary that $\mathcal{J}_2 = \mathcal{J}_6$.
- $[\![ x ]\!]_{\mathcal{J}_1} = \mathcal{J}_1(x) = 0$.
- $[\![ f(x) ]\!]_{\mathcal{J}_1} = \mathcal{J}_1(f)([\![ x ]\!]_{\mathcal{J}_1}) = \mathcal{J}_1(f)(0) = 0$.
- $[\![ L(x, f(x)) ]\!]_{\mathcal{J}_1} = \mathcal{J}_1(L)([\![ x ]\!]_{\mathcal{J}_1}, [\![ f(x) ]\!]_{\mathcal{J}_1}) = \mathcal{J}_1(L)(0, 0) = \text{F}$.
- $[\![ x ]\!]_{\mathcal{J}_2} = \mathcal{J}_2(x) = 1$.
- $[\![ f(x) ]\!]_{\mathcal{J}_2} = \mathcal{J}_2(f)([\![ x ]\!]_{\mathcal{J}_2}) = \mathcal{J}_2(f)(1) = 2$.
- $[\![ L(x, f(x)) ]\!]_{\mathcal{J}_2} = \mathcal{J}_2(L)([\![ x ]\!]_{\mathcal{J}_2}, [\![ f(x) ]\!]_{\mathcal{J}_2}) = \mathcal{J}_2(L)(1, 2) = \text{T}$.
- $[\![ x ]\!]_{\mathcal{J}_6} = \mathcal{J}_6(x) = 1$.
- $[\![ f(x) ]\!]_{\mathcal{J}_6} = \mathcal{J}_6(f)([\![ x ]\!]_{\mathcal{J}_6}) = \mathcal{J}_6(f)(1) = \mathcal{J}_1(f)(1) = 2$.
- $[\![ L(x, f(x)) ]\!]_{\mathcal{J}_1[x \mapsto 1]} = [\![ L(x, f(x)) ]\!]_{\mathcal{J}_6} = \mathcal{J}_6(L)([\![ x ]\!]_{\mathcal{J}_6}, [\![ f(x) ]\!]_{\mathcal{J}_6}) = \mathcal{J}_6(L)(1, 2) = \mathcal{J}_1(L)(1, 2) = \text{T}$.
- Thus, $[\![ \exists x (L(x, f(x))) ]\!]_{\mathcal{J}_1} = \text{T}$.

最后一条体现了如果 $x$ 是约束出现的，那么在计算真值的时候，$x$ 的解释（也就是 $\beta$）不重要。也就是说虽然真值还是定义在解释 $\mathcal{J}_{1}$ 上，但是这里面起作用的只有结构 $\mathcal{A}$。

### Properties of first order propositions
**Definition 9**. Suppose $\Phi$ is a set of $S$-propositions and $\psi$ is one single $S$-proposition. We say that $\psi$ is a consequence (语义后承) of $\Phi$, written as $\Phi \models \psi$, if for any $S$-interpretation $\mathcal{J}$, $[\![\phi]\!]_{\mathcal{J}} = \mathbf{T}$ for any $\phi \in \Phi$ implies $[\![\psi]\!]_{\mathcal{J}} = \mathbf{T}$.

**Example 10.** $G(c) \models \exists x(G(x))$.
*Proof.*
Assume $\mathcal{J}$ is an interpretation, s.t. $[\![G(c)]\!]_{\mathcal{J}} = \mathbf{T}$. In other words, $\mathcal{J}(G)(\mathcal{J}(c)) = \mathbf{T}$.
On the other hand $[\![\exists x(G(x))]\!]_{\mathcal{J}} = \mathbf{T}$ iff. there exists at least an element $a$ in $\mathcal{J}$'s domain, s.t. $[\![G(x)]\!]_{\mathcal{J}[x \mapsto a]} = \mathbf{T}$, i.e. $\mathcal{J}(G)(a) = \mathbf{T}$.
This is obviously because we can pick $a = \mathcal{J}(c)$.
Qed.

**Example 11.** $\forall x(M(x)) \models M(c)$.
*Proof.*
Assume $\mathcal{J}$ is an interpretation, s.t. $[\![\forall x(M(x))]\!]_{\mathcal{J}} = \mathbf{T}$. That means, for every $a$ in $\mathcal{J}$'s domain,
$[\![M(x)]\!]_{\mathcal{J}[x \mapsto a]} = \mathbf{T}$,
i.e. $\mathcal{J}(M)(a) = \mathbf{T}$.
Therefore, $[\![M(c)]\!]_{\mathcal{J}} = \mathcal{J}(M)(\mathcal{J}(c)) = \mathbf{T}$.
Qed.