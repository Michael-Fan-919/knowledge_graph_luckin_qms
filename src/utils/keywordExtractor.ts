/**
 * 关键词提取工具
 * 基于规则引擎的简单关键词提取
 */

/** 关键词词典 - 按问题类型分类（55+场景覆盖） */
export const KEYWORD_DICT: Record<string, string[]> = {
  涩味: ['涩', '巨涩', '发苦', '没熟', '口感差', '苦味', '涩味', '不甜', '苦涩', '像中药', '茶味太重'],
  外观变色: ['发紫', '变色', '颜色不正常', '变黑', '氧化', '褐变', '不新鲜', '发黑', '颜色变了'],
  絮状物: ['絮状物', '沉淀', '分层', '结块', '颗粒', '豆腐渣', '凝固', '有块', '像豆腐'],
  口感异常: ['酸败', '异味', '怪味', '难喝', '恶心', '化学味', '哈喇味', '苦味', '酸了'],
  消费者认知: ['像坏了', '是不是坏了', '不敢喝', '是不是变质', '颜色奇怪', '看着不放心'],
  奶盖塌陷: ['塌了', '融化', '消泡', '没有奶盖了', '流下来了', '奶盖没了', '塌陷'],
  珍珠品质: ['太硬', '硬芯', '不Q弹', '粘连', '像塑料', '太软', '太烂', '不弹', '坨了'],
  果籽异物: ['虫子', '异物', '黑色的东西', '有虫', '果籽', '颗粒物', '脏东西'],
  农残食安: ['味道不对', '化学味', '头晕', '拉肚子', '肚子疼', '呕吐', '过敏', '痒', '红肿', '呼吸困难'],
  甜度浓度: ['太甜', '不够甜', '没味道', '甜死了', '像白水', '太淡', '没茶味', '糖精味'],
  温度异常: ['不够冰', '不够热', '温的', '不凉', '冰化了', '常温'],
  料不够: ['料太少', '果肉少', '没什么料', '空杯', '冰太多', '不满'],
  芝麻过敏: ['过敏', '痒', '红肿', '起疹子', '呼吸困难', '花生', '坚果'],
  微生物: ['拉肚子', '肚子疼', '呕吐', '变质', '酸了', '臭了', '发霉', '长毛'],
  咖啡品质: ['油脂', '分离', '淡了', '苦了', '没有咖啡味', '像水'],
  芒果品质: ['发黑', '太软', '催熟', '纤维', '塞牙', '纤维感'],
  西米品质: ['硬芯', '粘连', '太烂', '糊了', '不透明'],
}

/** 从文本中提取关键词 */
export function extractKeywords(text: string): string[] {
  const found: string[] = []
  const allKeywords = Object.values(KEYWORD_DICT).flat()

  for (const keyword of allKeywords) {
    if (text.includes(keyword)) {
      found.push(keyword)
    }
  }

  return [...new Set(found)] // 去重
}

/** 统计关键词频次 */
export function countKeywords(texts: string[]): { word: string; count: number }[] {
  const counter: Record<string, number> = {}

  for (const text of texts) {
    const keywords = extractKeywords(text)
    for (const kw of keywords) {
      counter[kw] = (counter[kw] || 0) + 1
    }
  }

  return Object.entries(counter)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
}