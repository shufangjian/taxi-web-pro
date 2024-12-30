// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取菜单数据 GET /api/menu */
export async function getMenuData(options?: { [key: string]: any }) {
  return request<API.MenuData[]>('/api/menu', {
    method: 'GET',
    ...(options || {}),
  });
}
