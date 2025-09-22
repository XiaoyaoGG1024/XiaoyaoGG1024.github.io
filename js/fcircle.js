// 摸鱼时间管理
class FishTimeManager {
  constructor() {
    this.initStartTime();
    this.updateTimer();

    // 页面卸载时保存当前状态
    window.addEventListener('beforeunload', () => this.saveCurrentState());
  }

  initStartTime() {
    try {
      // 检查是否有保存的开始时间
      const savedStartTime = localStorage.getItem('fishStartTime');
      const savedTotalTime = parseInt(localStorage.getItem('fishTotalTime') || '0');
      const savedLastSaveTime = localStorage.getItem('fishLastSaveTime');

      if (savedStartTime && savedLastSaveTime) {
        // 检查是否超过24小时，如果超过则重置
        const lastSaveTime = parseInt(savedLastSaveTime);
        const hoursElapsed = (Date.now() - lastSaveTime) / (1000 * 60 * 60);

        if (hoursElapsed > 24 || isNaN(lastSaveTime)) {
          this.resetTimer();
        } else {
          // 继续累积时间
          this.totalAccumulatedTime = isNaN(savedTotalTime) ? 0 : savedTotalTime;
          this.startTime = Date.now(); // 重新设置当前会话的开始时间
          localStorage.setItem('fishStartTime', this.startTime.toString());
        }
      } else {
        // 第一次访问，记录开始时间
        this.startTime = Date.now();
        this.totalAccumulatedTime = 0;
        localStorage.setItem('fishStartTime', this.startTime.toString());
        localStorage.setItem('fishLastSaveTime', this.startTime.toString());
      }
    } catch (error) {
      console.error('初始化摸鱼时间失败:', error);
      this.resetTimer();
    }
  }

  resetTimer() {
    try {
      // 重置计时器（比如每日重置）
      this.startTime = Date.now();
      this.totalAccumulatedTime = 0;
      localStorage.setItem('fishStartTime', this.startTime.toString());
      localStorage.setItem('fishTotalTime', '0');
      localStorage.setItem('fishLastSaveTime', this.startTime.toString());

      // 清除旧的计时器
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }

      // 重新启动计时器
      this.updateTimer();
    } catch (error) {
      console.error('重置计时器时出错:', error);
    }
  }

  updateTimer() {
    this.timerInterval = setInterval(() => {
      try {
        const currentElapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const totalElapsed = this.totalAccumulatedTime + currentElapsed;
        this.displayTime(totalElapsed);

        // 每30秒自动保存一次状态
        if (totalElapsed % 30 === 0) {
          this.saveCurrentState();
        }

        // 将总秒数同步给修仙模块（如果存在）
        if (window.cultivationManager && typeof window.cultivationManager.syncWithTotalSeconds === 'function') {
          try {
            window.cultivationManager.syncWithTotalSeconds(totalElapsed);
          } catch (e) {
            console.error('同步修仙时出错：', e);
          }
        }
      } catch (error) {
        console.error('更新计时器时出错:', error);
      }
    }, 1000);
  }

  saveCurrentState() {
    try {
      // 保存当前累积时间
      const currentElapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const totalTime = this.totalAccumulatedTime + currentElapsed;
      localStorage.setItem('fishTotalTime', totalTime.toString());
      localStorage.setItem('fishLastSaveTime', Date.now().toString());

      // 同步一次（防止在卸载前未同步）
      if (window.cultivationManager && typeof window.cultivationManager.syncWithTotalSeconds === 'function') {
        try {
          window.cultivationManager.syncWithTotalSeconds(totalTime);
        } catch (e) {
          console.error('卸载时同步修仙出错：', e);
        }
      }
    } catch (error) {
      console.error('保存状态时出错:', error);
    }
  }

  displayTime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let timeStr = '';
    if (days > 0) timeStr += `${days}天 `;
    if (hours > 0) timeStr += `${hours}时 `;
    if (minutes > 0) timeStr += `${minutes}分 `;
    timeStr += `${secs}秒`;

    document.getElementById("fish-time").innerText = timeStr;
  }

  // 手动重置功能（可选）
  manualReset() {
    if (confirm('⚠️ 确定要重置吗？\n\n这将会清空：\n• 所有累积摸鱼时间\n• 修仙等级和进度\n\n此操作不可撤销！')) {
      try {
        this.resetTimer();
        // 重置摸鱼时间追踪和修仙等级
        if (window.cultivationManager && typeof window.cultivationManager.handleFishReset === 'function') {
          try {
            window.cultivationManager.handleFishReset();
          } catch (e) {
            console.error('处理修仙重置时出错：', e);
          }
        }

        // 显示成功消息
        const fishTimeDisplay = document.getElementById('fish-time');
        if (fishTimeDisplay) {
          fishTimeDisplay.style.color = '#4CAF50';
          setTimeout(() => {
            fishTimeDisplay.style.color = '';
          }, 2000);
        }

        // 显示重置成功提示
        alert('🎉 重置成功！摸鱼时间和修仙等级已清零，开始新的修仙之旅吧！');
      } catch (error) {
        console.error('手动重置时出错:', error);
        alert('重置失败，请刷新页面后重试！');
      }
    }
  }
}

// ---------------- 修仙系统管理器 ----------------
class CultivationManager {
  constructor() {
    // 境界系统 - 更具修仙小说风格
    this.REALMS = [
      {
        name: "炼气",
        desc: "凡胎肉体，初窥仙途。纳天地灵气入体，洗涤凡骨，脱胎换骨始于此境。",
        breakthrough: "灵气汇聚丹田，真元初生，踏入修仙门槛！"
      },
      {
        name: "筑基",
        desc: "筑道基，固根本。真元凝实如液，可御器飞行，寿增百载。",
        breakthrough: "天地共鸣，道基成型，真正踏入修仙正途！"
      },
      {
        name: "金丹",
        desc: "凝聚金丹，点石成金。一粒金丹吞入腹，我命由我不由天。",
        breakthrough: "丹田金光大盛，金丹凝成，脱离凡俗之境！"
      },
      {
        name: "元婴",
        desc: "元神化婴，神魂不灭。纵然肉身毁灭，元婴亦可夺舍重生。",
        breakthrough: "元神蜕变，婴形初现，神识暴增百倍！"
      },
      {
        name: "化神",
        desc: "神通广大，移山填海。一念之间，千里之外取人首级。",
        breakthrough: "神识化虚为实，领悟天地法则，神通初显！"
      },
      {
        name: "炼虚",
        desc: "炼化虚空，掌控空间。举手投足间，虚空破碎，万物湮灭。",
        breakthrough: "虚空在握，空间之力尽在掌控！"
      },
      {
        name: "合体",
        desc: "天人合一，道法自然。与天地同寿，日月同辉。",
        breakthrough: "天地认可，道心圆满，与天地法则融为一体！"
      },
      {
        name: "大乘",
        desc: "道法大成，无所不能。一念生死，众生如蝼蚁。",
        breakthrough: "道法圆满，超脱生死，世间再无敌手！"
      },
      {
        name: "渡劫",
        desc: "天劫降临，九死一生。渡过此劫，便可飞升仙界。",
        breakthrough: "九九天劫，劫雷洗礼，凤凰涅槃，仙路在望！"
      },
      {
        name: "真仙",
        desc: "飞升仙界，位列仙班。不老不死，与天地同存。",
        breakthrough: "白日飞升，列位仙班，从此长生不死！"
      },
      {
        name: "太乙",
        desc: "太乙金仙，法则化身。掌控一方天地，众仙朝拜。",
        breakthrough: "太乙道果成就，超脱五行，执掌天地法则！"
      },
      {
        name: "大罗",
        desc: "大罗金仙，超脱时空。过去现在未来，无所不在，无所不能。",
        breakthrough: "大罗道果圆满，超脱一切，与道同存！"
      }
    ];

    this.STAGES = ["前期", "中期", "后期"];

    // 修炼日志模板
    this.CULTIVATION_LOGS = [
      "静心调息，真元缓缓流转，丹田微暖。",
      "感悟天地灵气，心境渐趋空明。",
      "真元运转一个大周天，修为略有精进。",
      "参悟功法奥义，对境界理解更深一层。",
      "引导灵气入体，洗练筋骨经脉。",
      "冥想中偶有所悟，心境更加澄澈。",
      "专注修炼，真元纯度再次提升。",
      "感受天地大道，修为稳步增长。"
    ];

    // 奇遇事件库
    this.ADVENTURES = [
      {
        type: "treasure",
        name: "发现灵草",
        desc: "闭关时偶然发现一株百年灵草，服用后气血大增。",
        rewards: { hp: 30, mana: 10 }
      },
      {
        type: "battle",
        name: "击败妖兽",
        desc: "出关途中遇到妖兽，经过一番激战，成功将其击败。",
        rewards: { attack: 5, defense: 3, exp: 50 }
      },
      {
        type: "enlightenment",
        name: "顿悟天机",
        desc: "观看日出时突然顿悟，对修炼有了新的理解。",
        rewards: { spirit: 15, comprehension: 10 }
      },
      {
        type: "resource",
        name: "获得灵石",
        desc: "在山洞中发现了前人留下的灵石宝藏。",
        rewards: { spiritualStone: 100 }
      },
      {
        type: "mentor",
        name: "高人指点",
        desc: "遇到一位隐世高人，得到了珍贵的修炼指导。",
        rewards: { comprehension: 20, luck: 5 }
      }
    ];

    this.STORAGE_KEY = 'cultivationState_v2';
    this.APPLIED_KEY = 'cultivationAppliedMinutes_v2';
    this.LOGS_KEY = 'cultivationLogs_v1';

    // 初始化
    this.loadState();
    this.renderCultivation();
    this.setupEventListeners();
  }

  loadState() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        this.state = JSON.parse(raw);
        // 确保所有属性存在
        this.state.realmIndex = this.state.realmIndex || 0;
        this.state.stageIndex = this.state.stageIndex || 0;
        this.state.level = this.state.level || 1;
        this.state.exp = this.state.exp || 0;
        this.state.tribulation = this.state.tribulation || {needed:false, successRate:0.3, failCount:0};

        // 新增属性系统
        this.state.attributes = this.state.attributes || {
          attack: 10,
          defense: 8,
          hp: 100,
          mana: 50,
          spirit: 30,
          luck: 5,
          comprehension: 7,
          spiritualStone: 0
        };

        this.state.totalCultivationTime = this.state.totalCultivationTime || 0;
      } else {
        this.resetState();
      }

      this.appliedMinutes = parseInt(localStorage.getItem(this.APPLIED_KEY)) || 0;
      this.loadLogs();
    } catch (e) {
      console.warn('读取修仙状态失败，重置为初始状态。', e);
      this.resetState();
    }
  }

  resetState() {
    this.state = {
      realmIndex: 0,
      stageIndex: 0,
      level: 1,
      exp: 0,
      tribulation: { needed: false, successRate: 0.3, failCount: 0 },
      attributes: {
        attack: 10,
        defense: 8,
        hp: 100,
        mana: 50,
        spirit: 30,
        luck: 5,
        comprehension: 7,
        spiritualStone: 0
      },
      totalCultivationTime: 0
    };
    this.appliedMinutes = 0;
    this.logs = [];
    this.saveState();
  }

  saveState() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    localStorage.setItem(this.APPLIED_KEY, String(this.appliedMinutes || 0));
    localStorage.setItem(this.LOGS_KEY, JSON.stringify(this.logs));
  }

  loadLogs() {
    try {
      const savedLogs = localStorage.getItem(this.LOGS_KEY);
      this.logs = savedLogs ? JSON.parse(savedLogs) : [];
    } catch (e) {
      this.logs = [];
    }
  }

  addLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.unshift(`[${timestamp}] ${message}`);

    // 只保留最新的20条日志
    if (this.logs.length > 20) {
      this.logs = this.logs.slice(0, 20);
    }

    this.saveState();
    this.renderLogs();
  }

  renderLogs() {
    const logsElement = document.getElementById('cultivation-logs');
    if (logsElement) {
      logsElement.innerHTML = this.logs.slice(0, 10).map(log =>
        `<div class="log-entry">${log}</div>`
      ).join('');
    }
  }

  renderAttributes() {
    const attrElement = document.getElementById('player-attributes');
    if (attrElement) {
      attrElement.innerHTML = `
        <div class="attr-row">
          <span class="attr-item">⚔️ 攻击: <strong>${this.state.attributes.attack}</strong></span>
          <span class="attr-item">🛡️ 防御: <strong>${this.state.attributes.defense}</strong></span>
        </div>
        <div class="attr-row">
          <span class="attr-item">❤️ 气血: <strong>${this.state.attributes.hp}</strong></span>
          <span class="attr-item">🔮 真元: <strong>${this.state.attributes.mana}</strong></span>
        </div>
        <div class="attr-row">
          <span class="attr-item">🧠 神识: <strong>${this.state.attributes.spirit}</strong></span>
          <span class="attr-item">🍀 福缘: <strong>${this.state.attributes.luck}</strong></span>
        </div>
        <div class="attr-row">
          <span class="attr-item">💎 悟性: <strong>${this.state.attributes.comprehension}</strong></span>
          <span class="attr-item">💰 灵石: <strong>${this.state.attributes.spiritualStone}</strong></span>
        </div>
      `;
    }
  }

  getNeedExp() {
    // 经验需求随境界和悟性调整
    const baseExp = 5 * (this.state.realmIndex + 1) * (this.state.stageIndex + 1);
    const comprehensionBonus = Math.max(0.5, 1 - this.state.attributes.comprehension * 0.02);
    return Math.floor(baseExp * comprehensionBonus);
  }

  triggerAdventure() {
    // 基于福缘属性的奇遇触发概率
    const luckBonus = this.state.attributes.luck * 0.1;
    const baseChance = 0.15; // 15%基础概率
    const totalChance = Math.min(0.5, baseChance + luckBonus);

    if (Math.random() < totalChance) {
      const adventure = this.ADVENTURES[Math.floor(Math.random() * this.ADVENTURES.length)];
      this.executeAdventure(adventure);
    }
  }

  executeAdventure(adventure) {
    let logMessage = `🎲 奇遇：${adventure.desc}`;
    let rewards = [];

    // 应用奖励
    for (const [attr, value] of Object.entries(adventure.rewards)) {
      if (attr === 'exp') {
        this.state.exp += value;
        rewards.push(`经验+${value}`);
      } else if (this.state.attributes.hasOwnProperty(attr)) {
        this.state.attributes[attr] += value;
        const attrNames = {
          attack: '攻击',
          defense: '防御',
          hp: '气血',
          mana: '真元',
          spirit: '神识',
          luck: '福缘',
          comprehension: '悟性',
          spiritualStone: '灵石'
        };
        rewards.push(`${attrNames[attr]}+${value}`);
      }
    }

    if (rewards.length > 0) {
      logMessage += ` (${rewards.join('，')})`;
    }

    this.addLog(logMessage);
    this.saveState();
    this.renderCultivation();
    this.renderAttributes();
  }

  updateCultivation(minutes) {
    if (!minutes || minutes <= 0) return;

    try {
      // 如果已到达最高境界，仍然可以增加属性
      this.state.totalCultivationTime += minutes;

      // 每次修炼都有机会触发奇遇
      this.triggerAdventure();

      // 修炼日志
      const logTemplate = this.CULTIVATION_LOGS[Math.floor(Math.random() * this.CULTIVATION_LOGS.length)];
      const attrGains = [];

      // 随机属性提升
      if (Math.random() < 0.3) { // 30%概率获得属性提升
        const attrs = ['attack', 'defense', 'hp', 'mana', 'spirit'];
        const randomAttr = attrs[Math.floor(Math.random() * attrs.length)];
        const gain = Math.floor(Math.random() * 3) + 1;
        this.state.attributes[randomAttr] += gain;

        const attrNames = {
          attack: '攻击',
          defense: '防御',
          hp: '气血',
          mana: '真元',
          spirit: '神识'
        };
        attrGains.push(`${attrNames[randomAttr]}+${gain}`);
      }

      let logMessage = `💪 修炼：${logTemplate}`;
      if (attrGains.length > 0) {
        logMessage += ` (${attrGains.join('，')})`;
      }
      this.addLog(logMessage);

      // 如果已到达最高境界，不再升级
      if (this.state.realmIndex >= this.REALMS.length - 1) {
        this.saveState();
        this.renderCultivation();
        this.renderAttributes();
        return;
      }

      this.state.exp += minutes;
      let needExp = this.getNeedExp();
      let levelUps = 0;

      while (!this.state.tribulation.needed && this.state.exp >= needExp && levelUps < 100) {
        this.state.exp -= needExp;
        levelUps++;

        if (this.state.level < 10) {
          this.state.level++;
          this.addLog(`⬆️ 等级提升：修为更进一步，当前${this.state.level}重。`);
        } else {
          // 十重完成，进入下一阶段
          this.state.level = 1;
          if (this.state.stageIndex < 2) {
            this.state.stageIndex++;
            const stage = this.STAGES[this.state.stageIndex];
            const realm = this.REALMS[this.state.realmIndex];
            this.addLog(`🌟 阶段突破：进入${realm.name}${stage}，实力大增！`);

            // 阶段突破奖励
            this.state.attributes.attack += 10;
            this.state.attributes.defense += 8;
            this.state.attributes.hp += 50;
            this.state.attributes.mana += 30;
          } else {
            // 阶段完整，触发渡劫
            this.state.stageIndex = 0;
            this.state.tribulation.needed = true;
            this.addLog(`⚡ 境界圆满：感受到天劫将至，准备渡劫突破！`);
            break;
          }
        }
        needExp = this.getNeedExp();
      }

      this.saveState();
      this.renderCultivation();
      this.renderAttributes();
    } catch (error) {
      console.error('更新修仙进度时出错:', error);
    }
  }

  tryTribulation() {
    if (!this.state.tribulation.needed) return;

    try {
      const t = this.state.tribulation;
      const rand = Math.random();

      if (rand < t.successRate) {
        // 渡劫成功
        const oldRealmIndex = this.state.realmIndex;
        this.state.realmIndex = Math.min(this.state.realmIndex + 1, this.REALMS.length - 1);
        this.state.stageIndex = 0;
        this.state.level = 1;
        this.state.exp = 0;
        this.state.tribulation = { needed: false, successRate: 0.3, failCount: 0 };

        const newRealm = this.REALMS[this.state.realmIndex];
        let message;

        if (oldRealmIndex === this.state.realmIndex) {
          message = `⚡ 渡劫成功！已达最高境界【${newRealm.name}】！`;
        } else {
          message = newRealm.breakthrough;

          // 境界突破巨大奖励
          this.state.attributes.attack += 30;
          this.state.attributes.defense += 25;
          this.state.attributes.hp += 200;
          this.state.attributes.mana += 150;
          this.state.attributes.spirit += 50;
          this.state.attributes.luck += 2;
          this.state.attributes.spiritualStone += 500;
        }

        this.addLog(`🎉 ${message}`);
        alert(`⚡ 渡劫成功！\n\n${message}`);
      } else {
        // 渡劫失败
        t.failCount = (t.failCount || 0) + 1;
        t.successRate = Math.min(0.95, (t.successRate || 0.3) + 0.1);
        const failMessage = `天劫威能恐怖，这次未能成功，但对天劫的理解更深了。`;
        this.addLog(`💀 渡劫失败：${failMessage}`);
        alert(`💀 渡劫失败！\n\n${failMessage}\n下一次成功率 ${(t.successRate * 100).toFixed(0)}%`);
      }

      this.saveState();
      this.renderCultivation();
      this.renderAttributes();
    } catch (error) {
      console.error('渡劫时出错:', error);
      alert('渡劫过程中出现错误，请稍后重试！');
    }
  }

  syncWithTotalSeconds(totalSeconds) {
    if (typeof totalSeconds !== 'number') return;
    const totalMinutes = Math.floor(totalSeconds / 60);

    if (totalMinutes < this.appliedMinutes) {
      this.appliedMinutes = totalMinutes;
      localStorage.setItem(this.APPLIED_KEY, String(this.appliedMinutes));
      return;
    }

    const delta = totalMinutes - this.appliedMinutes;
    if (delta > 0) {
      this.updateCultivation(delta);
      this.appliedMinutes = totalMinutes;
      localStorage.setItem(this.APPLIED_KEY, String(this.appliedMinutes));
    }
  }

  handleFishReset() {
    this.appliedMinutes = 0;
    localStorage.setItem(this.APPLIED_KEY, '0');
    this.resetState();
    this.renderCultivation();
    this.renderAttributes();
    this.renderLogs();
  }

  renderCultivation() {
    const statusEl = document.getElementById("cultivation-status");
    const descEl = document.getElementById("cultivation-desc");
    const progressEl = document.getElementById("cultivation-progress");
    const btnTrib = document.getElementById("btn-tribulation");

    if (!statusEl || !progressEl) return;
    const realm = this.REALMS[this.state.realmIndex];

    if (this.state.tribulation.needed) {
      statusEl.innerText = `【${realm.name} 圆满】准备渡劫`;
      descEl.innerText = `即将面临天劫考验，成功则可突破至更高境界。当前成功率：${(this.state.tribulation.successRate * 100).toFixed(0)}%`;
      progressEl.style.width = "100%";
      if (btnTrib) btnTrib.style.display = "inline-block";
    } else {
      const stage = this.STAGES[this.state.stageIndex];
      const needExp = this.getNeedExp();
      const percent = needExp > 0 ? Math.min(100, Math.round((this.state.exp / needExp) * 100)) : 0;
      statusEl.innerText = `境界：${realm.name} ${stage} ${this.state.level}重`;
      descEl.innerText = realm.desc;
      progressEl.style.width = percent + "%";
      if (btnTrib) btnTrib.style.display = "none";
    }
  }

  setupEventListeners() {
    const btn = document.getElementById('btn-tribulation');
    if (btn) btn.addEventListener('click', () => this.tryTribulation());
  }
}
// ---------------- 修仙系统管理器 结束 ----------------

// 昵称验证器
class NicknameValidator {
  constructor() {
    // 敏感词列表 - 实际应用中应该更完善
    this.bannedWords = [
      '管理员', '客服', '系统', '官方', '政府', '习近平', '毛泽东', '邓小平',
      '法轮功', '台独', '港独', '疆独', '藏独', '反华', '共产党', '民主党',
      '操', '妈的', '傻逼', '草泥马', '尼玛', '卧槽', '我靠', '他妈的',
      '脑残', '智障', '白痴', '弱智', '贱人', '婊子', '妓女', '鸡巴',
      '赌博', '代孕', '色情', '毒品', '贷款', '投资', '理财', '股票',
      '彩票', '中奖', '兼职', '招聘', '刷单', '微商', 'QQ', '微信'
    ];
  }

  validate(nickname) {
    const errors = [];

    // 检查长度
    if (!nickname || nickname.trim().length < 2) {
      errors.push('昵称至少需要2个字符');
    }
    if (nickname.length > 10) {
      errors.push('昵称最多10个字符');
    }

    // 检查字符类型
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9_\-]+$/.test(nickname)) {
      errors.push('昵称只能包含中文、英文、数字、下划线和横线');
    }

    // 检查敏感词
    const lowerNickname = nickname.toLowerCase();
    for (const word of this.bannedWords) {
      if (lowerNickname.includes(word.toLowerCase())) {
        errors.push('昵称包含不当内容，请重新输入');
        break;
      }
    }

    // 检查是否全是数字
    if (/^\d+$/.test(nickname)) {
      errors.push('昵称不能全是数字');
    }

    // 检查连续字符
    if (/(.)\1{2,}/.test(nickname)) {
      errors.push('昵称不能包含3个以上连续相同字符');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

// 积分排行榜管理
class ScoreLeaderboard {
  constructor() {
    this.validator = new NicknameValidator();
    this.currentPlayer = '';
    this.currentScore = 0;
    this.playerNicknameSet = false;
    this.loadLeaderboard();
    this.updateDisplay();
    this.setupNicknameInput();
  }

  setupNicknameInput() {
    const nicknameInput = document.getElementById('player-nickname');
    const nicknameSection = document.getElementById('nickname-section');

    // 检查是否有保存的昵称
    const savedNickname = localStorage.getItem('playerNickname');
    if (savedNickname) {
      this.currentPlayer = savedNickname;
      this.playerNicknameSet = true;
      nicknameSection.classList.add('hidden');
      this.updateDisplay();
    }

    // 实时验证
    nicknameInput.addEventListener('input', (e) => {
      this.validateNicknameInput(e.target.value);
    });

    // 回车确认
    nicknameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.setPlayerNickname(e.target.value);
      }
    });
  }

  validateNicknameInput(nickname) {
    const input = document.getElementById('player-nickname');
    const validation = this.validator.validate(nickname);

    // 清除之前的错误信息
    const existingError = document.querySelector('.nickname-error');
    if (existingError) {
      existingError.remove();
    }

    if (!validation.isValid) {
      input.classList.add('invalid');

      // 显示错误信息
      const errorDiv = document.createElement('div');
      errorDiv.className = 'nickname-error';
      errorDiv.textContent = validation.errors[0];
      input.parentNode.appendChild(errorDiv);
    } else {
      input.classList.remove('invalid');
    }

    return validation.isValid;
  }

  setPlayerNickname(nickname) {
    if (!this.validateNicknameInput(nickname)) {
      return false;
    }

    this.currentPlayer = nickname.trim();
    this.playerNicknameSet = true;

    // 保存昵称到localStorage
    localStorage.setItem('playerNickname', this.currentPlayer);

    // 隐藏昵称输入区域
    document.getElementById('nickname-section').classList.add('hidden');

    this.updateDisplay();
    return true;
  }

  changeNickname() {
    // 允许用户更改昵称
    this.playerNicknameSet = false;
    this.currentPlayer = '';
    localStorage.removeItem('playerNickname');

    const nicknameSection = document.getElementById('nickname-section');
    const nicknameInput = document.getElementById('player-nickname');

    nicknameSection.classList.remove('hidden');
    nicknameInput.value = '';
    nicknameInput.focus();

    this.updateDisplay();
  }

  updateCurrentScore(score) {
    this.currentScore = Math.max(this.currentScore, score);
    this.updateDisplay();
  }

  saveScore(score) {
    if (!this.currentPlayer || score < 10) return; // 需要昵称且分数不能太低

    try {
      const localRecords = this.getLocalRecords();
      const record = {
        name: this.currentPlayer,
        score: score,
        date: new Date().toLocaleString(),
        timestamp: Date.now(),
        id: this.generateRecordId(),
        isGlobal: false
      };

      // 查找该玩家的现有记录
      const existingRecordIndex = localRecords.findIndex(r => r.name === this.currentPlayer);
      let isNewRecord = false;

      if (existingRecordIndex !== -1) {
        // 如果新分数更高，更新记录
        if (score > localRecords[existingRecordIndex].score) {
          localRecords[existingRecordIndex] = record;
          isNewRecord = true;
        }
      } else {
        // 新玩家，直接添加
        localRecords.push(record);
        isNewRecord = true;
      }

      if (isNewRecord) {
        // 按分数排序并保留前100名
        const sortedRecords = localRecords
          .sort((a, b) => b.score - a.score)
          .slice(0, 100);

        // 使用带版本的key，便于未来数据迁移
        const storageKey = 'snakeScoreRecords_v2';
        localStorage.setItem(storageKey, JSON.stringify({
          records: sortedRecords,
          lastUpdated: Date.now(),
          version: 2
        }));

        // 显示新记录提示
        this.showNewRecordNotification(score);
      }

      this.loadLeaderboard();
    } catch (error) {
      console.error('保存分数时出错:', error);
    }
  }

  generateRecordId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getGlobalRecords() {
    // 模拟全局排行榜数据 - 根据当前日期动态生成
    const today = new Date();
    const baseScores = [520, 480, 450, 420, 390, 360, 330, 300, 280, 260];
    const names = [
      '摸鱼王者', '代码侠', '算法大师', '键盘飞侠',
      '编程小白', '调试专家', '代码诗人', '函数猎手',
      'Bug终结者', '逻辑大师'
    ];

    return names.map((name, index) => {
      const recordDate = new Date(today);
      recordDate.setDate(today.getDate() - index);

      // 随机波动分数
      const randomVariation = Math.floor(Math.random() * 41) - 20; // -20 到 +20
      const finalScore = baseScores[index] + randomVariation;

      return {
        name,
        score: Math.max(finalScore, 100), // 保证最低100分
        date: recordDate.toLocaleDateString(),
        isGlobal: true
      };
    }).sort((a, b) => b.score - a.score);
  }

  getLocalRecords() {
    // 获取本地玩家记录
    const newData = localStorage.getItem('snakeScoreRecords_v2');
    if (newData) {
      try {
        const parsed = JSON.parse(newData);
        return (parsed.records || []).map(r => ({ ...r, isGlobal: false }));
      } catch (e) {
        console.error('解析排行榜数据失败:', e);
      }
    }

    // 兼容旧版本数据
    const oldData = localStorage.getItem('snakeScoreRecords');
    if (oldData) {
      try {
        const oldRecords = JSON.parse(oldData);
        const migratedRecords = oldRecords.map(r => ({
          ...r,
          id: this.generateRecordId(),
          isGlobal: false
        }));

        localStorage.setItem('snakeScoreRecords_v2', JSON.stringify({
          records: migratedRecords,
          lastUpdated: Date.now(),
          version: 2
        }));

        localStorage.removeItem('snakeScoreRecords');
        return migratedRecords;
      } catch (e) {
        console.error('迁移旧排行榜数据失败:', e);
      }
    }

    return [];
  }

  getRecords() {
    // 合并本地记录和全局记录
    const localRecords = this.getLocalRecords();
    const globalRecords = this.getGlobalRecords();

    // 合并并按分数排序
    const allRecords = [...localRecords, ...globalRecords];
    return allRecords.sort((a, b) => b.score - a.score);
  }

  loadLeaderboard() {
    const records = this.getRecords();
    this.displayLeaderboard(records);
  }

  displayLeaderboard(records) {
    const sortedRecords = records.sort((a, b) => b.score - a.score).slice(0, 10);
    const listElement = document.getElementById('score-leaderboard');

    if (sortedRecords.length === 0) {
      listElement.innerHTML = '<li style="text-align: center; color: #999; padding: 20px; border: none; background: none;">暂无记录，快来成为第一名吧！</li>';
      return;
    }

    listElement.innerHTML = sortedRecords.map((record, index) => {
      const rank = index + 1;
      const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;

      // 确保记录对象有必要的属性
      const playerName = record.name || '匿名玩家';
      const playerScore = record.score || 0;
      const playDate = record.date ? new Date(record.date).toLocaleDateString() : '未知日期';

      // 判断玩家类型
      const isCurrentPlayer = !record.isGlobal && playerName === this.currentPlayer;
      const isGlobalPlayer = record.isGlobal;

      // 设置图标和样式
      let playerIcon = '';
      let extraStyle = '';
      let playerBadge = '';

      if (isCurrentPlayer) {
        playerIcon = '👤 ';
        extraStyle = ' style="background: linear-gradient(45deg, #FFE082, #FFF3E0); border-left-color: #FF9800; animation: pulse 2s infinite;"';
        playerBadge = ' <span style="font-size: 0.7em; color: #FF5722;">[ME]</span>';
      } else if (isGlobalPlayer) {
        playerIcon = '🌐 ';
      } else {
        playerIcon = '💻 ';
      }

      // 分数颜色根据排名设置
      let scoreColor = '#333';
      if (rank === 1) scoreColor = '#FFD700';
      else if (rank === 2) scoreColor = '#C0C0C0';
      else if (rank === 3) scoreColor = '#CD7F32';

      return `
        <li title="游戏时间: ${playDate} | 点击查看详情" ${extraStyle}>
          <div class="rank-info">
            <span class="rank-number" style="color: ${scoreColor};">${rankEmoji}</span>
            <span class="player-name-rank">${playerIcon}${playerName}${playerBadge}</span>
          </div>
          <span class="score-value" style="color: ${scoreColor}; font-weight: ${rank <= 3 ? 'bold' : 'normal'};">${playerScore}分</span>
        </li>
      `;
    }).join('');

    // 添加脉冲动画
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
      }
    `;
    if (!document.querySelector('style[data-pulse]')) {
      style.setAttribute('data-pulse', 'true');
      document.head.appendChild(style);
    }
  }

  updateDisplay() {
    const playerName = this.currentPlayer || '未设置昵称';
    const playerNameElement = document.getElementById('current-player-name');
    const playerScoreElement = document.getElementById('current-player-score');

    if (playerNameElement) {
      playerNameElement.textContent = playerName;
      // 如果是默认名称，添加提示样式
      if (playerName === '未设置昵称') {
        playerNameElement.style.opacity = '0.7';
        playerNameElement.style.fontStyle = 'italic';
      } else {
        playerNameElement.style.opacity = '1';
        playerNameElement.style.fontStyle = 'normal';
      }
    }

    if (playerScoreElement) {
      playerScoreElement.textContent = this.currentScore + '分';
      // 添加分数变化动画
      if (this.currentScore > 0) {
        playerScoreElement.style.color = '#4CAF50';
        playerScoreElement.style.fontWeight = 'bold';
      }
    }
  }

  // 检查是否可以开始游戏
  canStartGame() {
    return this.playerNicknameSet && this.currentPlayer.length > 0;
  }

  // 获取当前玩家昵称（用于游戏开始验证）
  getCurrentPlayer() {
    return this.currentPlayer;
  }

  // 显示新记录通知
  showNewRecordNotification(score) {
    try {
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(45deg, #4CAF50, #45a049);
          color: white;
          padding: 15px 20px;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          z-index: 10000;
          font-weight: bold;
          animation: slideIn 0.5s ease-out;
        ">
          🎉 新记录！${score}分
        </div>
      `;

      document.body.appendChild(notification);

      // 添加动画样式
      if (!document.querySelector('style[data-notification]')) {
        const style = document.createElement('style');
        style.setAttribute('data-notification', 'true');
        style.textContent = `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `;
        document.head.appendChild(style);
      }

      // 3秒后自动消失
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 500);
      }, 3000);
    } catch (error) {
      console.error('显示通知时出错:', error);
    }
  }
}

// 贪吃蛇游戏
class SnakeGame {
  constructor(leaderboard) {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.gridSize = 20;
    this.tileCount = this.canvas.width / this.gridSize;

    this.snake = [{x: 10, y: 10}];
    this.food = this.generateFood();
    this.dx = 0;
    this.dy = 0;
    this.score = 0;
    this.gameRunning = false;
    this.gamePaused = false;

    this.leaderboard = leaderboard;
    this.loadHighScore();
    this.setupControls();
    this.setupButtons();

    this.draw();
  }

  loadHighScore() {
    const saved = localStorage.getItem('snakeHighScore');
    this.highScore = saved ? parseInt(saved) : 0;
    document.getElementById('high-score').textContent = this.highScore;
  }

  saveHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('snakeHighScore', this.highScore);
      document.getElementById('high-score').textContent = this.highScore;
    }

    // 保存到排行榜
    this.leaderboard.saveScore(this.score);
  }

  setupControls() {
    document.addEventListener('keydown', (e) => {
      if (!this.gameRunning || this.gamePaused) return;

      const direction = {
        'ArrowUp': {x: 0, y: -1},
        'ArrowDown': {x: 0, y: 1},
        'ArrowLeft': {x: -1, y: 0},
        'ArrowRight': {x: 1, y: 0}
      }[e.key];

      if (direction) {
        // 防止反向移动
        if (direction.x !== -this.dx || direction.y !== -this.dy) {
          this.dx = direction.x;
          this.dy = direction.y;
        }
      }

      if (e.key === ' ') { // 空格键暂停
        this.togglePause();
      }
    });
  }

  setupButtons() {
    document.getElementById('start-btn').addEventListener('click', () => this.startGame());
    document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
    document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
  }

  startGame() {
    // 检查是否已设置昵称
    if (!this.leaderboard.canStartGame()) {
      const nicknameInput = document.getElementById('player-nickname');
      const nickname = nicknameInput.value.trim();

      if (nickname) {
        // 尝试设置昵称
        if (this.leaderboard.setPlayerNickname(nickname)) {
          // 昵称设置成功，开始游戏
          this.actuallyStartGame();
        } else {
          // 昵称验证失败，聚焦到输入框
          nicknameInput.focus();
          return;
        }
      } else {
        // 提示用户输入昵称
        alert('请先输入您的昵称才能开始游戏！');
        nicknameInput.focus();
        return;
      }
    } else {
      // 已有昵称，直接开始游戏
      this.actuallyStartGame();
    }
  }

  actuallyStartGame() {
    if (!this.gameRunning) {
      this.gameRunning = true;
      this.gamePaused = false;
      this.dx = 1;
      this.dy = 0;
      this.gameLoop();
    }
  }

  togglePause() {
    if (this.gameRunning) {
      this.gamePaused = !this.gamePaused;
      if (!this.gamePaused) {
        this.gameLoop();
      }
    }
  }

  resetGame() {
    this.gameRunning = false;
    this.gamePaused = false;
    this.snake = [{x: 10, y: 10}];
    this.food = this.generateFood();
    this.dx = 0;
    this.dy = 0;
    this.score = 0;
    document.getElementById('score').textContent = this.score;
    this.draw();
  }

  generateFood() {
    return {
      x: Math.floor(Math.random() * this.tileCount),
      y: Math.floor(Math.random() * this.tileCount)
    };
  }

  gameLoop() {
    if (!this.gameRunning || this.gamePaused) return;

    setTimeout(() => {
      this.clearCanvas();
      this.moveSnake();
      this.drawFood();
      this.drawSnake();

      if (this.checkCollision()) {
        this.gameOver();
        return;
      }

      if (this.checkFoodCollision()) {
        this.score += 10;
        document.getElementById('score').textContent = this.score;
        this.leaderboard.updateCurrentScore(this.score);
        this.food = this.generateFood();
      } else {
        this.snake.pop();
      }

      this.gameLoop();
    }, 150 - Math.floor(this.score / 50) * 10); // 随分数增加速度
  }

  clearCanvas() {
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  moveSnake() {
    const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
    this.snake.unshift(head);
  }

  drawSnake() {
    this.ctx.fillStyle = '#4CAF50';
    this.snake.forEach((segment, index) => {
      if (index === 0) {
        this.ctx.fillStyle = '#2E7D32'; // 蛇头颜色深一点
      } else {
        this.ctx.fillStyle = '#4CAF50';
      }
      this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
    });
  }

  drawFood() {
    this.ctx.fillStyle = '#F44336';
    this.ctx.fillRect(this.food.x * this.gridSize, this.food.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
  }

  checkCollision() {
    const head = this.snake[0];

    // 撞墙
    if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
      return true;
    }

    // 撞自己
    for (let i = 1; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
        return true;
      }
    }

    return false;
  }

  checkFoodCollision() {
    const head = this.snake[0];
    return head.x === this.food.x && head.y === this.food.y;
  }

  gameOver() {
    this.gameRunning = false;
    this.saveHighScore();

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '30px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('游戏结束!', this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`分数: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
  }

  draw() {
    this.clearCanvas();
    this.drawFood();
    this.drawSnake();
  }
}

// 初始化（注意：先创建修仙管理器，以便计时器能同步）
const cultivationManager = new CultivationManager();
window.cultivationManager = cultivationManager;

const fishTimeManager = new FishTimeManager();
const scoreLeaderboard = new ScoreLeaderboard();
const snakeGame = new SnakeGame(scoreLeaderboard);

// 绑定重置按钮事件
document.getElementById('reset-fish-time').addEventListener('click', () => {
  fishTimeManager.manualReset();
});

// 绑定更改昵称按钮事件
document.getElementById('change-nickname-btn').addEventListener('click', () => {
  scoreLeaderboard.changeNickname();
});