import type { RawFeedback } from '../types/pipeline'

/**
 * CSV 解析器（支持 UTF-8 BOM）
 * 解析 CSV 字符串为 RawFeedback 数组
 */
export function parseCSV(csvText: string): RawFeedback[] {
  // 移除 BOM
  const text = csvText.replace(/^\uFEFF/, '')
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '')
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0])
  const records: RawFeedback[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length !== headers.length) continue

    const record: Record<string, string> = {}
    headers.forEach((header, index) => {
      record[header.trim()] = values[index].trim()
    })

    records.push({
      feedback_id: record.feedback_id || '',
      timestamp: record.timestamp || '',
      channel: (record.channel as RawFeedback['channel']) || 'app_review',
      product_name: record.product_name || '',
      store_id: record.store_id || '',
      city: record.city || '',
      content: record.content || '',
      rating: parseInt(record.rating, 10) || 3,
    })
  }

  return records
}

/**
 * 解析单行 CSV（处理引号包裹的字段）
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++ // skip next quote
        } else {
          inQuotes = false
        }
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
  }
  result.push(current)
  return result
}