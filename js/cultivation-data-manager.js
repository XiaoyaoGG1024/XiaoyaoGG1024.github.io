// 修仙系统数据管理器
// 保护全局声明
window.CultivationDataManager = window.CultivationDataManager || class CultivationDataManager {
  constructor() {
    this.cache = new Map();
    this.baseUrl = '/js/data/';
  }
//   // ...保留原来的方法
// };

// class CultivationDataManager {
//   constructor() {
//     this.cache = new Map();
//     this.baseUrl = '/js/data/';
//   }

  // CSV解析器
  parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length >= headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          let value = values[index] || '';
          // 尝试解析JSON对象
          if (value.startsWith('{') || value.startsWith('[')) {
            try {
              value = JSON.parse(value);
            } catch (e) {
              // 保持原始字符串
            }
          }
          // 尝试解析数字
          else if (!isNaN(value) && value !== '') {
            value = parseFloat(value);
          }
          row[header] = value;
        });
        rows.push(row);
      }
    }

    return rows;
  }

  // 解析CSV行，处理引号内的逗号
  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // 双引号转义
          current += '"';
          i += 2;
          continue;
        }
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
        i++;
        continue;
      } else {
        current += char;
      }
      i++;
    }

    values.push(current.trim());
    return values;
  }

  // 对象转CSV
  objectToCSV(data, headers) {
    if (!data || data.length === 0) return '';

    const csvHeaders = headers || Object.keys(data[0]);
    let csv = csvHeaders.join(',') + '\n';

    data.forEach(row => {
      const values = csvHeaders.map(header => {
        let value = row[header] || '';
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        // 如果包含逗号、引号或换行符，需要用引号包围
        if (value.toString().includes(',') || value.toString().includes('"') || value.toString().includes('\n')) {
          value = '"' + value.toString().replace(/"/g, '""') + '"';
        }
        return value;
      });
      csv += values.join(',') + '\n';
    });

    return csv;
  }

  // 异步加载CSV数据
  async loadCSVData(filename) {
    const cacheKey = filename;

    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(this.baseUrl + filename);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const csvText = await response.text();
      const data = this.parseCSV(csvText);

      // 缓存数据
      this.cache.set(cacheKey, data);
      return data;

    } catch (error) {
      console.warn(`加载CSV文件失败: ${filename}`, error);
      return [];
    }
  }

  // 加载境界数据
  async loadRealms() {
    const data = await this.loadCSVData('realms.csv');
    return data.map(realm => ({
      name: realm.name,
      desc: realm.desc,
      breakthrough: realm.breakthrough
    }));
  }

  // 加载修炼日志模板
  async loadCultivationLogs() {
    const data = await this.loadCSVData('cultivation_logs.csv');
    return data.map(log => ({
      content: log.content || log.template || log.text || "静心调息，真元缓缓流转。",
      weight: this.parseNumericField(log.weight, 1)
    }));
  }

  // 加载奇遇数据（增强版 - 支持更多字段）
  async loadAdventures() {
    const data = await this.loadCSVData('adventures.csv');
    return data.map(adventure => {
      // 基础字段
      const result = {
        id: adventure.id || adventure.name,
        type: adventure.type || "misc",
        name: adventure.name || "未知奇遇",
        desc: adventure.desc || adventure.description || "",
        weight: this.parseNumericField(adventure.weight, 1),
      };

      // 奖励数据（支持多种格式）
      result.rewards = this.parseRewardsField(adventure);

      // 条件数据（支持多种字段名）
      result.conditions = adventure.conditions || adventure.condition || adventure.requirements || "";

      // 扩展字段
      if (adventure.minLevel !== undefined) result.minLevel = this.parseNumericField(adventure.minLevel, 0);
      if (adventure.minRealm !== undefined) result.minRealm = this.parseNumericField(adventure.minRealm, 0);
      if (adventure.minStage !== undefined) result.minStage = this.parseNumericField(adventure.minStage, 0);
      if (adventure.rarity !== undefined) result.rarity = adventure.rarity;
      if (adventure.cooldown !== undefined) result.cooldown = this.parseNumericField(adventure.cooldown, 0);

      // 概率字段
      if (adventure.triggerRate !== undefined) result.triggerRate = this.parseNumericField(adventure.triggerRate, 1.0);
      if (adventure.baseRate !== undefined) result.baseRate = this.parseNumericField(adventure.baseRate, 0.15);

      // 分类标签
      if (adventure.tags) result.tags = this.parseArrayField(adventure.tags);
      if (adventure.category) result.category = adventure.category;

      return result;
    });
  }

  // 解析奖励字段（支持多种格式）
  parseRewardsField(adventure) {
    // 优先使用 rewards_json
    if (adventure.rewards_json) {
      if (typeof adventure.rewards_json === 'object') {
        return adventure.rewards_json;
      }
      if (typeof adventure.rewards_json === 'string') {
        try {
          return JSON.parse(adventure.rewards_json);
        } catch (e) {
          console.warn('解析 rewards_json 失败:', adventure.rewards_json);
        }
      }
    }

    // 备用：使用 rewards 字段
    if (adventure.rewards) {
      if (typeof adventure.rewards === 'object') {
        return adventure.rewards;
      }
      if (typeof adventure.rewards === 'string') {
        try {
          return JSON.parse(adventure.rewards);
        } catch (e) {
          console.warn('解析 rewards 失败:', adventure.rewards);
        }
      }
    }

    // 兼容：分别解析各个奖励字段
    const rewards = {};
    const rewardFields = ['exp', 'attack', 'defense', 'hp', 'mana', 'spirit', 'luck', 'comprehension', 'spiritualStone'];

    for (const field of rewardFields) {
      if (adventure[field] !== undefined && adventure[field] !== '') {
        const value = this.parseNumericField(adventure[field], 0);
        if (value !== 0) {
          rewards[field] = value;
        }
      }
    }

    return rewards;
  }

  // 解析数值字段
  parseNumericField(value, defaultValue = 0) {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
  }

  // 解析数组字段
  parseArrayField(value) {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      try {
        // 尝试 JSON 解析
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // JSON 解析失败，尝试逗号分割
        return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }
    }
    return [];
  }

  // 导出数据到CSV文件
  exportToCSV(data, filename, headers) {
    const csvContent = this.objectToCSV(data, headers);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // 清除缓存
  clearCache() {
    this.cache.clear();
  }

  // 统一的权重/条件抽取函数
 selectByWeightAndCondition(items, userState = {}, options = {}) {
  if (!Array.isArray(items) || items.length === 0) {
    if (options.debug) {
      console.warn('[selectByWeightAndCondition] 输入数组为空或非法:', items);
    }
    return null;
  }

  // 默认选项
  const defaultOptions = {
    triggerRate: 1.0, // 触发概率 (0-1)
    allowEmpty: true,  // 允许返回空结果
    debug: false       // 调试模式
  };
  const opts = { ...defaultOptions, ...options };

  // 第一步：条件过滤
  const validItems = items.filter(item => this.checkConditions(item, userState));

  if (validItems.length === 0) {
    if (opts.debug) {
      console.log('[selectByWeightAndCondition] 没有满足条件的项目:', items);
    }
    return opts.allowEmpty ? null : items[0]; // fallback 返回原数组第一个
  }

  // 第二步：触发概率判断
  if (Math.random() > opts.triggerRate) {
    if (opts.debug) {
      console.log('[selectByWeightAndCondition] 未触发，返回 fallback');
    }
    return opts.allowEmpty ? null : validItems[0];
  }

  // 第三步：权重选择
  const selected = this.weightedRandomSelect(validItems, userState, opts);

  if (opts.debug) {
    console.log('[selectByWeightAndCondition] 权重选择结果:', {
      totalItems: items.length,
      validItems: validItems.length,
      selected
    });
  }

  return selected;
}


  // 条件检查函数
  checkConditions(item, userState) {
    if (!item.conditions) {
      return true; // 没有条件限制
    }

    const conditions = this.parseConditions(item.conditions);

    for (const condition of conditions) {
      if (!this.evaluateCondition(condition, userState)) {
        return false;
      }
    }

    return true;
  }

  // 解析条件字符串
 parseConditions(conditionStr) {
  if (!conditionStr || typeof conditionStr !== 'string') {
    return [];
  }

  const parts = conditionStr.split(',').map(s => s.trim());
  const conditions = [];

  for (const part of parts) {
    const condition = this.parseConditionPart(part);
    if (condition) {
      conditions.push(condition);
    } else if (this.debug) {
      console.warn('[parseConditions] 条件解析失败:', part);
    }
  }

  return conditions;
}


  // 解析单个条件部分
  parseConditionPart(part) {
    // 支持格式： // "level>=5" - 等级要求 // "realm>=1" - 境界要求 // "attack>=20" - 属性要求 // "stage>=1" - 阶段要求
  const operators = ['>=', '<=', '>', '<', '==', '!='];
  for (const op of operators) {
    const index = part.indexOf(op);
    if (index !== -1) {
      const field = part.substring(0, index).trim();
      const valueStr = part.substring(index + op.length).trim();
      let value = parseFloat(valueStr);
      if (isNaN(value)) value = valueStr; // 支持字符串值
      return { field, operator: op, value };
    }
  }

  if (this.debug) {
    console.warn('[parseConditionPart] 条件解析失败:', part);
  }
  return null;
}


  // 评估单个条件
evaluateCondition(condition, userState) {
  const { field, operator, value } = condition;
  let actualValue;

  // 获取实际值
  switch (field) {
    case 'level': actualValue = userState.level ?? 1; break;
    case 'realm':
    case 'realmIndex': actualValue = userState.realmIndex ?? 0; break;
    case 'stage':
    case 'stageIndex': actualValue = userState.stageIndex ?? 0; break;
    case 'exp': actualValue = userState.exp ?? 0; break;
    default:
      if (userState.attributes && field in userState.attributes) {
        actualValue = userState.attributes[field];
      } else {
        if (this.debug) console.warn('[evaluateCondition] 未知字段:', field);
        return false;
      }
  }

  // 执行比较
  let result = false;
  switch (operator) {
    case '>=': result = actualValue >= value; break;
    case '<=': result = actualValue <= value; break;
    case '>': result = actualValue > value; break;
    case '<': result = actualValue < value; break;
    case '==': result = actualValue === value; break;
    case '!=': result = actualValue !== value; break;
    default:
      if (this.debug) console.warn('[evaluateCondition] 未知运算符:', operator);
      return false;
  }

  if (this.debug) {
    console.log(`[evaluateCondition] ${field}(${actualValue}) ${operator} ${value} => ${result}`);
  }

  return result;
}


  // 权重随机选择
  weightedRandomSelect(items, userState = {}, options = {}) {
  if (!Array.isArray(items) || items.length === 0) return null;
  if (items.length === 1) return items[0];

  const weightedItems = items.map(item => {
    let weight = Number(this.calculateItemWeight(item, userState)) || 0;
    return { item, weight };
  });

  const totalWeight = weightedItems.reduce((sum, w) => sum + w.weight, 0);

  if (options.debug) {
    console.log('[weightedRandomSelect] 权重列表:', weightedItems, '总权重:', totalWeight);
  }

  if (totalWeight <= 0) {
    if (options.debug) console.warn('[weightedRandomSelect] 总权重 <= 0，随机选择一个元素');
    return items[Math.floor(Math.random() * items.length)];
  }

  let random = Math.random() * totalWeight;

  for (const weighted of weightedItems) {
    random -= weighted.weight;
    if (random <= 0) {
      if (options.debug) console.log('[weightedRandomSelect] 选择结果:', weighted.item);
      return weighted.item;
    }
  }

  // fallback 返回最后一个
  return weightedItems[weightedItems.length - 1].item;
}


  // 计算单个项目的权重
 calculateItemWeight(item, userState) {
  // 基础权重
  let baseWeight = 1;
  if (typeof item.weight === 'number') {
    baseWeight = item.weight;
  } else if (typeof item.weight === 'string') {
    const parsed = parseFloat(item.weight);
    baseWeight = !isNaN(parsed) ? parsed : 1;
  }

  // 权重修正
  let weightModifier = Number(this.calculateWeightModifier(item, userState)) || 1;

  const finalWeight = Math.max(0, baseWeight * weightModifier);

  if (this.debug) {
    console.log('[calculateItemWeight]', { item, baseWeight, weightModifier, finalWeight });
  }

  return finalWeight;
}


  // 计算权重修正系数
  calculateWeightModifier(item, userState) {
  let modifier = 1.0;
  const { attributes = {}, realmIndex = 0 } = userState;

  if (item.type) {
    switch (item.type) {
      case 'rare':
        modifier *= (1 + Math.min(attributes.luck || 0, 100) * 0.01); // capped
        break;
      case 'cultivation':
        modifier *= (1 + Math.log10((attributes.comprehension || 0) + 1) * 0.05);
        break;
      case 'combat':
        modifier *= (1 + Math.log10((attributes.attack || 0) + 1) * 0.03);
        break;
    }
  }

  if (item.minRealm !== undefined) {
    const realmDiff = realmIndex - item.minRealm;
    if (realmDiff < 0) {
      modifier *= 1 / (1 + Math.abs(realmDiff)); // 平滑衰减
    }
  }

  return Math.max(0.01, modifier); // 保证不为 0
}


  // 重新加载指定数据
  async reloadData(filename) {
    const cacheKey = filename;
    this.cache.delete(cacheKey);
    return this.loadCSVData(filename);
  }

  // 批量加载所有修仙数据
  async loadAllCultivationData() {
    try {
      const [realms, logs, adventures] = await Promise.all([
        this.loadRealms(),
        this.loadCultivationLogs(),
        this.loadAdventures()
      ]);

      return {
        realms,
        cultivationLogs: logs,
        adventures,
        stages: ['前期', '中期', '后期'] // 固定数据
      };
    } catch (error) {
      console.error('批量加载修仙数据失败:', error);
      // 返回默认数据作为回退
      return await this.getDefaultCultivationData();
    }
  }

  // 获取默认数据（回退方案）- 从CSV文件读取前几行
  async getDefaultCultivationData() {
    try {
      // 尝试从CSV文件获取前几行作为默认数据
      const [realmsData, logsData, adventuresData] = await Promise.all([
        this.loadCSVData('realms.csv'),
        this.loadCSVData('cultivation_logs.csv'),
        this.loadCSVData('adventures.csv')
      ]);

      return {
        realms: realmsData.slice(0, 3).map(realm => ({
          name: realm.name,
          desc: realm.desc,
          breakthrough: realm.breakthrough
        })),
        cultivationLogs: logsData.slice(0, 3).map(log => ({
          content: log.content || log.template || log.text || "静心调息，真元缓缓流转。",
          weight: this.parseNumericField(log.weight, 1)
        })),
        adventures: adventuresData.slice(0, 2).map(adventure => ({
          type: adventure.type,
          name: adventure.name,
          desc: adventure.desc,
          rewards: adventure.rewards_json  || {}
        })),
        stages: ['前期', '中期', '后期']
      };
    } catch (error) {
      console.warn('无法从CSV获取默认数据，使用硬编码回退:', error);
      // 最终回退方案
      return this.getHardcodedFallbackData();
    }
  }

  // 最终回退数据（硬编码）
  getHardcodedFallbackData() {
    const realmsCSV = `id,name,desc,breakthrough
0,炼气,"凡胎肉体，初窥仙途。","灵气汇聚丹田，真元初生！"
1,筑基,"筑道基，固根本。","天地共鸣，道基成型！"`;

    const logsCSV = `id,content,weight
0,"静心调息，真元缓缓流转。",1
1,"感悟天地灵气，心境渐趋空明。",1`;

    const adventuresCSV = `id,type,name,desc,rewards_json
0,treasure,发现灵草,"发现珍贵灵草。","{""hp"":30,""mana"":10}"`;

    const realmsData = this.parseCSV(realmsCSV);
    const logsData = this.parseCSV(logsCSV);
    const adventuresData = this.parseCSV(adventuresCSV);

    return {
      realms: realmsData.map(realm => ({
        name: realm.name,
        desc: realm.desc,
        breakthrough: realm.breakthrough
      })),
      cultivationLogs: logsData.map(log => ({
        content: log.content || log.template || log.text || "静心调息，真元缓缓流转。",
        weight: this.parseNumericField(log.weight, 1)
      })),
      adventures: adventuresData.map(adventure => ({
        type: adventure.type,
        name: adventure.name,
        desc: adventure.desc,
        rewards: adventure.rewards_json || adventure.rewards || {}
      })),
      stages: ['前期', '中期', '后期']
    };
  }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CultivationDataManager;
} else if (typeof window !== 'undefined') {
  window.CultivationDataManager = CultivationDataManager;
}