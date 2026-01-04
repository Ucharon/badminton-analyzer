import type { VercelRequest, VercelResponse } from '@vercel/node';

// 允许的域名白名单（防止SSRF攻击）
const ALLOWED_HOSTS = [
  'www.yemaozontech.com',
  'yemaozontech.com',
  // 可以添加更多允许的域名
];

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.end();
  }

  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.query;

    // 验证URL参数
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: '缺少url参数' });
    }

    // 验证URL格式
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return res.status(400).json({ error: 'URL格式无效' });
    }

    // 验证协议
    if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
      return res.status(400).json({ error: '只支持http/https协议' });
    }

    // 验证域名白名单（防止SSRF）
    if (!ALLOWED_HOSTS.includes(targetUrl.hostname)) {
      return res.status(403).json({
        error: `域名 ${targetUrl.hostname} 不在允许列表中`,
      });
    }

    // 获取远程文件
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `文件下载失败: ${response.status} ${response.statusText}`,
      });
    }

    // 获取文件内容
    const buffer = await response.arrayBuffer();

    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    // 设置内容类型
    const contentType = response.headers.get('content-type') ||
      'application/vnd.ms-excel';
    res.setHeader('Content-Type', contentType);

    // 设置内容长度
    res.setHeader('Content-Length', buffer.byteLength.toString());

    // 返回文件内容
    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      error: `代理请求失败: ${error instanceof Error ? error.message : '未知错误'}`,
    });
  }
}
