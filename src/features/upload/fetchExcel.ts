import { parseExcelFile, type ParseResult } from './excelParser';

// 从URL获取Excel文件（通过本地/云端API代理）
export async function fetchExcelFromURL(url: string): Promise<ParseResult> {
  try {
    // 开发和生产环境统一使用 /api 路径
    // 开发环境: Vite proxy -> vercel dev (localhost:3000)
    // 生产环境: Vercel Serverless API
    const proxyUrl = `/api/fetch-excel?url=${encodeURIComponent(url)}`;

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
