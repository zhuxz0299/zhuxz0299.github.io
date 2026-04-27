#!/bin/bash

# 获取当前日期和时间，格式化为: 2023-10-27 14:30:05
# %Y=年, %m=月, %d=日, %H=时, %M=分, %S=秒
current_datetime=$(date "+%Y-%m-%d %H:%M:%S")

# 打印一下时间（可选，让你知道脚本在运行）
echo "Current time: $current_datetime"

# 执行 Git 命令
# 使用 && 确保上一步成功才执行下一步
git add . && \
git commit -m "Code updated: $current_datetime" && \
git push origin hexo-v2

echo "Done!"