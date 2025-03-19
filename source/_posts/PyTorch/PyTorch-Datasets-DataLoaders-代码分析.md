---
title: PyTorch Datasets & DataLoaders 代码分析
cover: https://source.fomal.cc/img/default_cover_36.webp
tags: PyTorch
abbrlink: 2432c26f
date: 2023-03-26 20:22:58
---

代码内容来自[PyTorch官网](https://pytorch.org/tutorials/beginner/basics/data_tutorial.html)

## Loading a Dataset
首先展示一个从Fashion-MNIST中加载数据集的例子
```python
import torch
from torch.utils.data import Dataset
from torchvision import datasets
from torchvision.transforms import ToTensor
import matplotlib.pyplot as plt


training_data = datasets.FashionMNIST(
    root="data",
    train=True,
    download=True,
    transform=ToTensor()
)

test_data = datasets.FashionMNIST(
    root="data",
    train=False,
    download=True,
    transform=ToTensor()
)
```

## Iterating and Visualizing the Dataset

我们可以像 `list` 一样使用 ``Datasets`` : ``training_data[index]``.
我们可以用 ``matplotlib`` 展示部分数据集中的数据

```python
labels_map = {
    0: "T-Shirt",
    1: "Trouser",
    2: "Pullover",
    3: "Dress",
    4: "Coat",
    5: "Sandal",
    6: "Shirt",
    7: "Sneaker",
    8: "Bag",
    9: "Ankle Boot",
}
figure = plt.figure(figsize=(8, 8)) # figure()函数用于创建一个新的绘图窗口。
cols, rows = 3, 3
for i in range(1, cols * rows + 1):
    sample_idx = torch.randint(len(training_data), size=(1,)).item() # 是使用PyTorch张量操作随机选择一个训练样本的索引号。
    img, label = training_data[sample_idx]
    figure.add_subplot(rows, cols, i) # 当前图像添加到指定位置的子图中，其中i表示当前要添加的子图的位置编号
    plt.title(labels_map[label]) 
    plt.axis("off") # 关闭坐标轴显示
    # squeeze()函数将张量形状中的维度为1的维度去掉，
    # 因为imshow()函数只接受二维数组作为输入    
    plt.imshow(img.squeeze(), cmap="gray") 
plt.show()
```

## Creating a Custom Dataset for your files
一个自定义的数据集类(继承自 `Dataset`)需要有 `__init__`,`__len__` 和 `__getitem__` 这三个函数。

```python
import os
import pandas as pd
from torchvision.io import read_image

class CustomImageDataset(Dataset):
    def __init__(self, annotations_file, img_dir, transform=None, target_transform=None):
        self.img_labels = pd.read_csv(annotations_file)
        self.img_dir = img_dir
        self.transform = transform
        self.target_transform = target_transform

    def __len__(self): # 返回数据集中的图像数量
        return len(self.img_labels) 

    def __getitem__(self, idx): # 加载和处理单个图像及其标签
        img_path = os.path.join(self.img_dir, self.img_labels.iloc[idx, 0])
        image = read_image(img_path) # 读取图像文件，并形成一个PyTorch张量
        label = self.img_labels.iloc[idx, 1]
        if self.transform:
            image = self.transform(image) # 对加载的图像进行预处理，例如裁剪、缩放、翻转
        if self.target_transform:
            label = self.target_transform(label) # 对加载的标签进行预处理，例如进行独热编码、转换为张量
        return image, label
```

说明：
* `labels.csv` 文件中包含的是图片的名称和label。
    ```csv
    tshirt1.jpg, 0
    tshirt2.jpg, 0
    ......
    ankleboot999.jpg, 9
    ```

* 想要使用上述定义的类，可以使用
  ```python
  dataset = CustomImageDataset(annotations_file='labels.csv', img_dir='images/', transform=transforms.ToTensor())
  ```

  来加载数据

## Preparing your data for training with DataLoaders
`DataLoaders` 用于将数据集变成可迭代对象，相当于是处理数据，让训练更加方便。

```python
from torch.utils.data import DataLoader

train_dataloader = DataLoader(training_data, batch_size=64, shuffle=True)
test_dataloader = DataLoader(test_data, batch_size=64, shuffle=True)
```

## Iterate through the DataLoader
```python
# Display image and label.
train_features, train_labels = next(iter(train_dataloader))
# train_features是一个batch的图像数据，它是一个四维的张量，第一个维度是batch size，
# 第二个维度是通道数，第三个和第四个维度是图像的高和宽。
print(f"Feature batch shape: {train_features.size()}")
print(f"Labels batch shape: {train_labels.size()}")
img = train_features[0].squeeze()
label = train_labels[0] # 获取一张图像
plt.imshow(img, cmap="gray")
plt.show()
print(f"Label: {label}")
```