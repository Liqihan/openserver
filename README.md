# openServer 一个可以到处运行的静态服务器

Running static file server anywhere. 随时随地将你的当前目录变成一个静态文件服务器的根目录。如果配置的端口已被占用，会默认往上加1


## Installation

```
npm install git+https://github.com/Liqihan/openserver.git
```

## Usage 
 ```
    openserver 
    <!--or with port-->
    openserver -p 8080
    <!--or with dir,需要启动的目录-->
    openserver -dir ./
    
 ```

 ## Help
  ```
    <!--help-->
    openserver -h
    <!--version-->
    openserver -v
  ```

