---
title: PyTorch Quickstart 代码分析
cover: https://source.fomal.cc/img/default_cover_37.webp
tags: pytorch
abbrlink: f5508786
date: 2023-03-25 17:19:10
---

代码内容来自[PyTorch官网](https://pytorch.org/tutorials/beginner/basics/quickstart_tutorial.html)

## Wroking With data
PyTorch提供了两种数据处理的基本组件：`torch.utils.data.DataLoader`和`torch.utils.data.Dataset`。`Dataset`用来存储样本及其对应的标签，而`DataLoader`则在`Dataset`周围封装一个可迭代对象。

```python
import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets
from torchvision.transforms import ToTensor
```


`torchvision.datasets` 模块包含许多实际视觉数据的 Dataset 对象，例如 CIFAR、COCO。这里我们将使用 FashionMNIST 数据集。每个 TorchVision Dataset 包括两个参数：`transform` 和 `target_transform`，分别用于修改样本和标签。

一些参数的解释

* `root`：这是数据集将存储的目录。如果数据集已经被下载过，它将不会被重新下载。
* `transform`：这个参数指定了在加载数据集中的图像之前将应用的转换。在本例中，使用了`ToTensor()`转换，它将图像数据从形状为（H，W，C）的numpy数组转换为形状为（C，H，W）的PyTorch张量，并将值从0到255转换为0到1的范围内。

```python
# Download training data from open datasets.
training_data = datasets.FashionMNIST(
    root="data",
    train=True,
    download=True,
    transform=ToTensor(),
)

# Download test data from open datasets.
test_data = datasets.FashionMNIST(
    root="data",
    train=False,
    download=True,
    transform=ToTensor(),
)
```


我们将`Dataset`作为参数传递给`DataLoader`。这将在我们的数据集上创建一个可迭代对象，支持自动分批、采样、洗牌和多进程数据加载。更重要的是，`DataLoader`允许您一次加载一小批数据，处理它，然后继续处理下一批数据。在这里，我们定义了`batch`大小为64，即`dataloader`迭代器中的每个元素将返回一个批次包含64个特征和标签.

```python
batch_size = 64

# Create data loaders.
train_dataloader = DataLoader(training_data, batch_size=batch_size)
test_dataloader = DataLoader(test_data, batch_size=batch_size)

for X, y in test_dataloader:
    print(f"Shape of X [N, C, H, W]: {X.shape}")
    print(f"Shape of y: {y.shape} {y.dtype}")
    break
```

## Creating Models

```python
# Get cpu or gpu device for training.
device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
print(f"Using {device} device")

# Define model
class NeuralNetwork(nn.Module):
    def __init__(self):
        super().__init__()

        # 将形状为(batch_size, num_channels, height, width)的张量reshape为
        # (batch_size, num_channels * height * width)的张量。
        self.flatten = nn.Flatten()
        self.linear_relu_stack = nn.Sequential(
            nn.Linear(28*28, 512), # 28*28维度的输入,512维的输出
            nn.ReLU(),
            nn.Linear(512, 512),
            nn.ReLU(),
            nn.Linear(512, 10) # 分类结果,这里分成10类
        )

    def forward(self, x):
        x = self.flatten(x)
        logits = self.linear_relu_stack(x)
        return logits

model = NeuralNetwork().to(device)
print(model)
```

## Optimizing the Model Parameters
```python
loss_fn = nn.CrossEntropyLoss() # 用于多分类问题的损失函数。它将softmax激活函数和负对数似然损失结合成一个函数
optimizer = torch.optim.SGD(model.parameters(), lr=1e-3) #  stochastic gradient descent (SGD),随机梯度下降算法
```

```python
def train(dataloader, model, loss_fn, optimizer):
    size = len(dataloader.dataset) # 数据集中包含的样本数量
    model.train() # 将model设置为训练模式
    for batch, (X, y) in enumerate(dataloader):
        X, y = X.to(device), y.to(device) # 将数据转移到计算设备上

        # 输入的数据 X 会被传递给模型的 forward 方法，并返回模型的输出结果 pred
        pred = model(X)
        loss = loss_fn(pred, y) # Compute prediction error

        # Backpropagation
        optimizer.zero_grad() # 模型参数的梯度设置为0，以避免梯度叠加。
        loss.backward() # 计算损失函数对模型所有参数的梯度
        optimizer.step() # 根据计算出的梯度更新模型的参数

        if batch % 100 == 0:
            loss, current = loss.item(), batch * len(X)
            print(f"loss: {loss:>7f}  [{current:>5d}/{size:>5d}]")
```

```python
def test(dataloader, model, loss_fn):
    size = len(dataloader.dataset)
    num_batches = len(dataloader)
    model.eval() # 将模型设置为测试模式
    test_loss, correct = 0, 0

    # torch.no_grad() 表示在不计算梯度的情况下进行前向传递，以避免不必要的计算和内存消耗
    with torch.no_grad():
        for X, y in dataloader:
            X, y = X.to(device), y.to(device)
            pred = model(X)
            test_loss += loss_fn(pred, y).item()

            # pred 是模型对输入数据的预测结果，它的形状为 (batch_size, num_classes)
            # 使用 argmax(1) 取出每个样本的预测结果的下标，即预测类别。
            correct += (pred.argmax(1) == y).type(torch.float).sum().item()
    test_loss /= num_batches
    correct /= size
    print(f"Test Error: \n Accuracy: {(100*correct):>0.1f}%, Avg loss: {test_loss:>8f} \n")
```

```python
epochs = 20
for t in range(epochs):
    print(f"Epoch {t+1}\n-------------------------------")
    train(train_dataloader, model, loss_fn, optimizer)
    test(test_dataloader, model, loss_fn)
print("Done!")
```

