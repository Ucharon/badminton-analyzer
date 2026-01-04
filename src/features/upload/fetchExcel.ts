import { parseExcelFile, type ParseResult } from './excelParser';

// 获取代理API基础URL
const getProxyBaseUrl = () => {
  // 生产环境使用Vercel部署的域名
  // 开发环境使用本地API（需要vercel dev）
  return import.meta.env.VITE_PROXY_BASE || '/api';
};

// 从URL获取Excel文件（通过代理）
export async function fetchExcelFromURL(url: string): Promise<ParseResult> {
  try {
    const proxyUrl = `${getProxyBaseUrl()}/fetch-excel?url=${encodeURIComponent(url)}`;

    const response = await fetch(proxyUrl);

    if (!response.ok) {
      // 尝试解析错误信息
      try {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || `请求失败: ${response.status}`,
        };
      } catch {
        return {
          success: false,
          error: `文件下载失败: ${response.status} ${response.statusText}`,
        };
      }
    }

    const blob = await response.blob();
    const file = new File([blob], 'downloaded.xls', { type: blob.type });

    return parseExcelFile(file);
  } catch (error) {
    return {
      success: false,
      error: `URL访问失败: ${error instanceof Error ? error.message : '未知错误'}`,
    };
  }
}
