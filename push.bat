@echo off

REM 获取标准化日期和时间（兼容不同系统区域设置）
for /f "tokens=1-3 delims=/- " %%a in ('date /t') do (
  set _year=%%a
  set _month=%%b
  set _day=%%c
)
@REM REM 补零：确保月份和日期是两位数
@REM if %_month% lss 10 set _month=0%_month%
@REM if %_day% lss 10 set _day=0%_day%
set _date=%_year%-%_month%-%_day%

for /f "tokens=1-3 delims=:." %%a in ("%time%") do (
  set _hour=%%a
  set _minute=%%b
  set _second=%%c
)
REM 处理小时空格（例如 " 9:30" 变成 "09"）
set _hour=%_hour: =%
if %_hour% lss 10 set _hour=0%_hour%
set _time=%_hour%:%_minute%:%_second%

REM 提交源码到 Git
git add . && git commit -m "Code updated: %_date% %_time%" && git push origin hexo
