import * as XLSX from 'xlsx';
import type { OrderRow } from '../../types/order';
import { REQUIRED_COLUMNS } from '../../lib/constants';

export interface ParseResult {
  success: boolean;
  data?: OrderRow[];
  error?: string;
  warnings?: string[];
}

export function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve({ success: false, error: '文件读取失败' });
          return;
        }

        // 读取Excel
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // 转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (jsonData.length === 0) {
          resolve({ success: false, error: 'Excel文件为空' });
          return;
        }

        // 验证必需列
        const firstRow = jsonData[0];
        const missingColumns = REQUIRED_COLUMNS.filter(
          (col) => !(col in firstRow)
        );

        if (missingColumns.length > 0) {
          resolve({
            success: false,
            error: `缺少必需列: ${missingColumns.join(', ')}`,
          });
          return;
        }

        // 数据清洗和类型转换
        const warnings: string[] = [];
        const orders: OrderRow[] = [];

        jsonData.forEach((row, index) => {
          try {
            // 解析金额
            const amount = parseFloat(row['金额']);
            if (isNaN(amount)) {
              warnings.push(`第${index + 2}行: 金额格式无效`);
              return;
            }

            // 解析日期
            const startTime = parseDate(row['活动开始时间']);
            const payTime = parseDate(row['支付时间']);

            if (!startTime || !payTime) {
              warnings.push(`第${index + 2}行: 日期格式无效`);
              return;
            }

            // 验证出款/入款字段
            const direction = row['出款/入款'];
            if (direction !== '出款(-)' && direction !== '入款(+)') {
              warnings.push(`第${index + 2}行: 出款/入款字段值无效: ${direction}`);
              return;
            }

            const order: OrderRow = {
              ...row,
              金额: amount,
              活动开始时间: startTime,
              支付时间: payTime,
            };

            // 验证关键字段
            if (!order.活动标题 || !order.发布者) {
              warnings.push(`第${index + 2}行: 缺少活动标题或发布者`);
              return;
            }

            orders.push(order);
          } catch (error) {
            warnings.push(`第${index + 2}行: 解析失败 - ${error}`);
          }
        });

        resolve({
          success: true,
          data: orders,
          warnings: warnings.length > 0 ? warnings : undefined,
        });
      } catch (error) {
        resolve({
          success: false,
          error: `Excel解析失败: ${error instanceof Error ? error.message : '未知错误'}`,
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: '文件读取失败' });
    };

    reader.readAsBinaryString(file);
  });
}

// 日期解析辅助函数
function parseDate(value: any): Date | null {
  if (!value) return null;

  // 如果已经是Date对象
  if (value instanceof Date) return value;

  // 如果是字符串
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  // 如果是Excel日期数字
  if (typeof value === 'number') {
    try {
      const parsed = XLSX.SSF.parse_date_code(value);
      if (!parsed) return null;

      // 正确转换为Date对象
      const date = new Date(
        parsed.y,
        parsed.m - 1,
        parsed.d,
        parsed.H || 0,
        parsed.M || 0,
        parsed.S || 0
      );

      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  return null;
}
