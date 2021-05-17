export default interface RootState {
    origin: string;
    csrf: string;
    title: string;
    /**
     * 当前部署目录名
     */
    prefix: string;
    /**
     * 左侧菜单
     */
    menus: any;
}
