# KGZ 脚本指南

> 推荐在 Windows 环境下执行



### 目录结构

```txt
./kzg-script
├── cli
│   ├── <options> 0x....bat
│   ├── kzgcli-mac
│   └── kzgcli-win.exe
├── config.ini
├── kzg-script-macos
├── kzg-script-win.exe
├── session.txt
└── success.txt

config.ini - 脚本配置文件
kzg-script-macos - mac session 脚本执行程序
kgz-script-win.exe - windows session 脚本执行程序
session.txt - 脚本执行记录文件
success.txt - 已经成功贡献的记录文件
cli/kzgcli-mac.exe - mac contribution 脚本执行程序
cli/kzgcli-win.exe - windows contribution 脚本执行程序，Mac 程序不生成 bat 脚本
cli/0x.XXX.bat - session 程序自动生成的 bat 执行 contribution 程序
```



#### config.ini 配置

> 请遵循 .ini 文件规范

```ini
[account_config]
; Multiple private keys can be configured
privateKeys[] = -, 0x1...
privateKeys[] = 101, 0x2...
...

[environment]
; 不设置代理或填写错误默认使用系统代理
proxy = http://127.0.0.1:7890
; 运行结束后直接是否关闭窗口
complete_close = false
;win or mac
system = mac 
; google chrome path
chrome_path = /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
; Mac eg: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
; Windows eg: C:\Users\Administrator\AppData\Local\Google\Chrome\Application\chrome.exe
debug_chrome = false
```

**[account_config]**

- privateKeys <string"[]"[]>

执行主要需要配置之处，将私钥配置于此处即可，可配置一个或多个账号

多个账号请一行一个 `privateKeys[] =  Ads编号, 私钥`  配置

```
privateKeys[] = -, e14b54c146...0e7150d3a076744c53d
privateKeys[] = 102, e3a4388a1f...93e8bf680c94
```



**[environment]**

- proxy <string>

配置环境代理，不设置代理或填写错误默认使用系统代理

- system < win | mac>

执行的系统环境，推荐 windows

windows 可生成 .bat 执行脚本，而 macOS 不支持

- complete_close<booble>

运行结束后直接是否关闭窗口，开启将会执行结束后30s 自动关闭

- chrome_path<string>

本地环境 Google 浏览器位置的绝对路径

Mac eg: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
Windows eg: C:\Users\Administrator\AppData\Local\Google\Chrome\Application\chrome.exe

- debug_chrome<booble>

无头模式调试开关，默认`false` 关闭，打开后执行脚本将开关本地浏览器



### 运行流程

1. 按要求配置好 `config.ini` 文件

2. 执行 `kzg-script`

   1. Mac 请在终端中打开，并 cd 到脚本目录下，执行`./kzg-script-macos`
   2. Windows 直接双击执行既可

   ![image-20230215192850287](http://yitian-2020.oss-cn-shenzhen.aliyuncs.com/img/image-20230215192850287.png)

   执行完成可以在 `/session.txt` 看到脚本执行记录

   如果是 windows 环境，则会在 `/cli` 目录下生成 `0x....bat` 执行脚本

3. 执行 `kzgcli`

   1. Mac 请在终端中打开，并 cd 到 /cli 目录下，执行命令

   ``./kzgcli-mac contribute --session-id {your session_id} ` `

   注意：Mac 直接执行会有权限问题，请参考解决：[链接](https://www.educative.io/answers/how-to-resolve-the-permission-denied-error-in-linux)

   2. Windows 在终端中打开，并 cd 到 /cli 目录下，执行命令

   ``./kzgcli-win.exe contribute --session-id {your session_id} ` `

   或者推荐直接双击执行生成出来的对应账号的 `0x....bat` 脚本文件

4. 有账号贡献成功后，会在当前文件夹下生成两个贡献记录文件

