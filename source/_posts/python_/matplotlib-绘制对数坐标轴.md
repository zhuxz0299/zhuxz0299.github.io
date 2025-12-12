---
title: matplotlib 绘制对数坐标轴
cover: https://source.fomal.cc/img/default_cover_33.webp
tags:
  - python
  - matplotlib
abbrlink: 8eb72eaa
date: 2024-04-02 23:41:15
---
使用 `matplotlib` 绘图时，有时候由于某个变量呈指数式增加，因此需要对数坐标轴。

### 二维图像
绘制二维图像时使用对数坐标轴较为方便，使用 `xscale()` 或者 `yscale()` 直接设置即可。

使用如下代码，可以绘制得到：
```python
font = {'family': 'Times New Roman', 'size': 12}
plt.rc('font', **font)
plt.figure(figsize=(8, 6))
plt.plot(C_values, accuracy_values, marker='o', color= 'r')
plt.xscale('log')
plt.xlabel('C (hyperparameter of SVM)', fontsize=16)
plt.ylabel('Accuracy in Cross-validation', fontsize=16)
sns.set_style("whitegrid")
plt.show()
```
<img src='../../figure/matplotlib 绘制对数坐标轴/no_reduction.png' width=500 style="display: block; margin-left: auto; margin-right: auto;">


### 三维图像
绘制三维图像时较为麻烦，如果直接使用 `set_xscale()` 之类的函数，会导致图片非常奇怪，因此需要手动设置。例如以下代码：

```python
# 设置字体
font = {'family': 'Times New Roman', 'size': 12}
plt.rc('font', **font)
plt.rcParams['text.usetex'] = True

# 创建 3D 图形
fig = plt.figure(figsize=(8, 6))
ax = fig.add_subplot(111, projection='3d')

# 绘制曲面图
n_features, C = np.meshgrid(num_features, C)
accuracy = np.array(accuracy).reshape(n_features.shape)

ax.plot_trisurf(n_features.flatten(), np.log10(C).flatten(), accuracy.flatten(), cmap='viridis')

# 设置坐标轴标签
ax.set_xlabel('n_components')
ax.set_ylabel('C')
ax.set_zlabel('Accuracy while training')

# 设置对数坐标轴
def log_tick_formatter(val, pos=None):
    return "{:.0}".format(10**val)

ax.yaxis.set_major_formatter(mticker.FuncFormatter(log_tick_formatter))
plt.show()
```

在绘制图像时，首先使用 `np.log10(C).flatten()`，手动将数据取为对数；然后需要手动设置坐标轴数值，这里使用了 `ax.yaxis.set_major_formatter()` 函数与 `mticker.FuncFormatter()` 函数，并且自定义了 `log_tick_formatter()`，用于生成正确的做标数值。最后得到的图片结果如下：

<img src='../../figure/matplotlib 绘制对数坐标轴/feature_selection.png' width=500 style="display: block; margin-left: auto; margin-right: auto;">


