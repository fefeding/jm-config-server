# 配置系统

* 部署
```js
> git clone https://github.com/jiamao/jm-config-server.git
> cd jm-config-server
> npm i
```

> 修改 `config/config.local.ts`中的数据配置库
> 如果初次运行，需要创建表，可以把DB配置中的 `synchronize: false`,  设为`true`，会自动创建表。当发布上线后请把它置为`false`，以免不必要的修改。

> `npm run dev` 即可启动，  

> dev环境下会自动生成表，只需配置库名即可

* [发布配置帮助](./docs/发布脚本配置.md)

* 登录态
 > 现写死在 `app/middleware/access.ts` 中，请自行处理

