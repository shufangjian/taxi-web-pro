import { ProLayoutProps } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  // 拂晓蓝
  colorPrimary: '#1890ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: '云享出租车监控平台',
  pwa: false,
  logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
  iconfontUrl: '',
  token: {
    // 设置菜单背景色为白色
    header: {
      colorBgHeader: '#fff',
      colorHeaderTitle: '#1890ff',
    },
    sider: {
      colorMenuBackground: '#fff',
      colorBgMenuItemSelected: '#e6f7ff',
    },
  },
  // 移除水印
  waterMarkProps: undefined,
};

export default Settings;
