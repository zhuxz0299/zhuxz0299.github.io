---
title: python的引用传递
cover: https://source.fomal.cc/img/default_cover_35.webp
tags: python
description: 在项目debug时发现的自己原先没注意到的问题
abbrlink: e6761492
date: 2024-05-22 20:40:17
---

python没有像C++的指针操作，不能自己指定值传递或者引用传递。

python在创建类的时候，默认使用的是引用传递。例如以下代码：
```python
def test():
    class A:
        def __init__(self, posn):
            self.posn = posn

        def get_posn(self):
            return self.posn

        def update_posn(self):
            self.posn[0] += 1

    class B:
        def __init__(self, posn):
            self.posn_b = posn

        def get_posn(self):
            return self.posn_b

    a = A([2, 2, 2])
    posn = a.get_posn()
    b = B(posn)
    a.update_posn()
    print(a.get_posn())
    print(b.get_posn())
```

最后输出的结果为
```
[3, 2, 2]
[3, 2, 2]
```

可以看出，像 `posn` 这种数组，无论是从一个类中读取，还是用来初始化另一个类，默认的都是引用传递。

如果希望使用值传递，可以类似如下操作，比如对 `class B` 进行改动
```python
    class B:
        def __init__(self, posn):
            self.posn_b = copy.deepcopy(posn)

        def get_posn(self):
            return self.posn_b
```

此时最终输出结果为：
```
[3, 2, 2]
[2, 2, 2]
```
