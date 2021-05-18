# 配置系统

* 部署

> git clone https://github.com/jiamao/jm-config-server.git
> cd jm-config-server
> npm i

> 修改 `config/config.local.ts`中的数据配置库

> `npm run dev` 即可启动，  

> dev环境下会自动生成表，只需配置库名即可

* [发布配置帮助](./docs/发布脚本配置.md)

* 登录态
 > 现写死在 `app/middleware/access.ts` 中，请自行处理

