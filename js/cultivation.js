// 修仙系统管理器
class CultivationManager {
  constructor() {
    console.log('修仙系统初始化开始...');
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
    this.CHARACTER_NAME_KEY = 'cultivationCharacterName';

    // 初始化
    this.loadState();

    // 确保 DOM 元素存在后再渲染
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.renderAllWithRetry();
      });
    } else {
      // DOM 已经加载完成，立即尝试渲染
      this.renderAllWithRetry();
    }

    this.setupEventListeners();
    console.log('修仙系统初始化完成');
  }

  renderAll() {
    console.log('开始渲染修仙系统界面...');
    this.renderCultivation();
    this.renderAttributes();
    console.log('修仙系统界面渲染完成');
  }

  renderAllWithRetry(attempt = 1, maxAttempts = 10) {
    console.log(`尝试渲染修仙系统界面... (第${attempt}次)`);

    // 检查关键DOM元素是否存在
    const cultivationStatus = document.getElementById("cultivation-status");
    const playerAttributes = document.getElementById('player-attributes');

    if (!cultivationStatus || !playerAttributes) {
      if (attempt < maxAttempts) {
        console.log(`DOM元素未就绪，${50}ms后重试...`);
        setTimeout(() => this.renderAllWithRetry(attempt + 1, maxAttempts), 50);
        return;
      } else {
        console.warn('DOM元素未找到，渲染失败');
        return;
      }
    }

    // DOM元素已就绪，开始渲染
    this.renderAll();
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

        // 新增角色名字
        this.state.characterName = this.state.characterName || localStorage.getItem(this.CHARACTER_NAME_KEY) || '';
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
      totalCultivationTime: 0,
      characterName: localStorage.getItem(this.CHARACTER_NAME_KEY) || ''
    };
    this.appliedMinutes = 0;
    this.logs = [];
    this.saveState();
  }

  saveState() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    localStorage.setItem(this.APPLIED_KEY, String(this.appliedMinutes || 0));
    localStorage.setItem(this.LOGS_KEY, JSON.stringify(this.logs));
    if (this.state.characterName) {
      localStorage.setItem(this.CHARACTER_NAME_KEY, this.state.characterName);
    }
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

  // 设置角色名字
  setCharacterName(name) {
    if (name && name.trim()) {
      this.state.characterName = name.trim();
      this.saveState();
      this.renderCharacterName();
      return true;
    }
    return false;
  }

  // 获取角色名字
  getCharacterName() {
    return this.state.characterName || '';
  }

  // 检查是否可以玩贪吃蛇（需要设置道号）
  canPlaySnake() {
    return this.state.characterName && this.state.characterName.trim().length > 0;
  }

  renderCharacterName() {
    const characterNameElement = document.getElementById('character-name-display');
    const nameInputElement = document.getElementById('character-name-input');
    const nameEditButton = document.getElementById('edit-character-name');

    if (characterNameElement) {
      if (this.state.characterName) {
        characterNameElement.textContent = this.state.characterName;
        characterNameElement.style.display = 'inline';
        if (nameInputElement) nameInputElement.style.display = 'none';
        if (nameEditButton) nameEditButton.style.display = 'inline';
      } else {
        characterNameElement.textContent = '未设置';
        characterNameElement.style.display = 'inline';
        if (nameInputElement) nameInputElement.style.display = 'none';
        if (nameEditButton) nameEditButton.style.display = 'inline';
      }
    }
  }

  renderAttributes() {
    const attrElement = document.getElementById('player-attributes');
    if (attrElement) {
      attrElement.innerHTML = `
        <div class="character-name-section" style="margin-bottom: 15px; padding: 10px; background: rgba(255, 193, 7, 0.1); border-radius: 5px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-weight: bold; color: #FF6B6B;">✨ 仙号：</span>
            <span id="character-name-display" style="color: #030d03ff; font-weight: bold;">未设置</span>
            <input type="text" id="character-name-input" placeholder="请输入您的仙号" maxlength="10"
                   style="display: none; padding: 2px 8px; border: 1px solid #ddd; border-radius: 3px; font-size: 12px;">
            <button id="edit-character-name" style="background: #FFC107; border: none; padding: 2px 8px; border-radius: 3px; cursor: pointer; font-size: 12px;">⚙️ 修改</button>
            <button id="save-character-name" style="display: none; background: #4CAF50; color: white; border: none; padding: 2px 8px; border-radius: 3px; cursor: pointer; font-size: 12px;">✔️ 确定</button>
            <button id="cancel-character-name" style="display: none; background: #f44336; color: white; border: none; padding: 2px 8px; border-radius: 3px; cursor: pointer; font-size: 12px;">❌ 取消</button>
            <button id="export-save" style="background: #2196F3; color: white; border: none; padding: 2px 8px; border-radius: 3px; cursor: pointer; font-size: 12px; margin-left: 5px;">💾 导出</button>
            <button id="import-save" style="background: #9C27B0; color: white; border: none; padding: 2px 8px; border-radius: 3px; cursor: pointer; font-size: 12px;">📁 导入</button>
            <input type="file" id="save-file-input" accept=".json" style="display: none;">
          </div>
          <div style="font-size: 11px; color: #666; margin-top: 5px;">📝 设置仙号后可解锁贪吃蛇游戏，不设置不影响修仙进度</div>
        </div>
        <div class="attr-row">
          <span class="attr-item" style="color: #d32f2f;">⚔️ 攻击: <strong style="color: #f44336;">${this.state.attributes.attack}</strong></span>
          <span class="attr-item" style="color: #1976d2;">🛡️ 防御: <strong style="color: #2196f3;">${this.state.attributes.defense}</strong></span>
        </div>
        <div class="attr-row">
          <span class="attr-item" style="color: #c62828;">❤️ 气血: <strong style="color: #e53935;">${this.state.attributes.hp}</strong></span>
          <span class="attr-item" style="color: #7b1fa2;">🔮 真元: <strong style="color: #9c27b0;">${this.state.attributes.mana}</strong></span>
        </div>
        <div class="attr-row">
          <span class="attr-item" style="color: #455a64;">🧠 神识: <strong style="color: #607d8b;">${this.state.attributes.spirit}</strong></span>
          <span class="attr-item" style="color: #388e3c;">🍀 福缘: <strong style="color: #5e0530ff;">${this.state.attributes.luck}</strong></span>
        </div>
        <div class="attr-row">
          <span class="attr-item" style="color: #f57c00;">💎 悟性: <strong style="color: #ff9800;">${this.state.attributes.comprehension}</strong></span>
          <span class="attr-item" style="color: #fbc02d;">💰 灵石: <strong style="color: #ffeb3b;">${this.state.attributes.spiritualStone}</strong></span>
        </div>
      `;

      // 重新设置角色名字显示
      this.renderCharacterName();
      this.setupCharacterNameEvents();
      this.setupSaveEvents(); // 设置导入导出事件
    }
  }

  setupCharacterNameEvents() {
    const editButton = document.getElementById('edit-character-name');
    const saveButton = document.getElementById('save-character-name');
    const cancelButton = document.getElementById('cancel-character-name');
    const input = document.getElementById('character-name-input');
    const display = document.getElementById('character-name-display');

    if (editButton) {
      editButton.addEventListener('click', () => {
        display.style.display = 'none';
        input.style.display = 'inline';
        input.value = this.state.characterName || '';
        editButton.style.display = 'none';
        saveButton.style.display = 'inline';
        cancelButton.style.display = 'inline';
        input.focus();
      });
    }

    if (saveButton) {
      saveButton.addEventListener('click', () => {
        const newName = input.value.trim();
        if (newName.length >= 2 && newName.length <= 10) {
          this.setCharacterName(newName);
          this.showEditMode(false);
        } else {
          alert('✨ 仙号需要2-10个字符！请输入一个合适的仙号。');
        }
      });
    }

    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        this.showEditMode(false);
      });
    }

    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          saveButton.click();
        }
      });
    }
  }

  showEditMode(show) {
    const editButton = document.getElementById('edit-character-name');
    const saveButton = document.getElementById('save-character-name');
    const cancelButton = document.getElementById('cancel-character-name');
    const input = document.getElementById('character-name-input');
    const display = document.getElementById('character-name-display');

    if (show) {
      display.style.display = 'none';
      input.style.display = 'inline';
      editButton.style.display = 'none';
      saveButton.style.display = 'inline';
      cancelButton.style.display = 'inline';
    } else {
      display.style.display = 'inline';
      input.style.display = 'none';
      editButton.style.display = 'inline';
      saveButton.style.display = 'none';
      cancelButton.style.display = 'none';
      this.renderCharacterName();
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
    const totalChance = 1 - Math.exp(-(baseChance + luckBonus))

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
      statusEl.innerText = `⚡ 【${realm.name} 圆满】天劫将至`;
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

  // 设置导入导出事件
  setupSaveEvents() {
    const exportBtn = document.getElementById('export-save');
    const importBtn = document.getElementById('import-save');
    const fileInput = document.getElementById('save-file-input');

    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportSave());
    }

    if (importBtn) {
      importBtn.addEventListener('click', () => {
        if (fileInput) {
          fileInput.click();
        }
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.importSave(file);
        }
      });
    }
  }

  // 导出存档
  exportSave() {
    try {
      const saveData = {
        version: '2.0',
        timestamp: Date.now(),
        date: new Date().toLocaleString(),
        cultivation: {
          state: this.state,
          appliedMinutes: this.appliedMinutes,
          logs: this.logs
        },
        characterName: this.state.characterName || '',
        description: '修仙系统存档文件'
      };

      const jsonString = JSON.stringify(saveData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      const fileName = `修仙存档_${this.state.characterName || '未命名'}_${new Date().toISOString().slice(0, 10)}.json`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('💾 存档导出成功！\n\n文件名：' + fileName);
      console.log('存档导出成功:', saveData);
    } catch (error) {
      console.error('导出存档失败:', error);
      alert('❗ 导出存档失败，请稍后重试！');
    }
  }

  // 导入存档
  importSave(file) {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const saveData = JSON.parse(e.target.result);

          // 验证数据格式
          if (!this.validateSaveData(saveData)) {
            alert('❗ 存档文件格式错误或损坏！');
            return;
          }

          // 确认导入
          const confirmMsg = `確定要导入以下存档吗？\n\n` +
            `👤 仙号：${saveData.cultivation.state.characterName || '未设置'}\n` +
            `⚔️ 境界：${this.REALMS[saveData.cultivation.state.realmIndex].name} ${this.STAGES[saveData.cultivation.state.stageIndex]} ${saveData.cultivation.state.level}重\n` +
            `🔥 修炼时间：${Math.floor(saveData.cultivation.state.totalCultivationTime)}分钟\n` +
            `📅 存档时间：${saveData.date}\n\n` +
            `⚠️ 注意：导入将覆盖当前所有进度！`;

          if (confirm(confirmMsg)) {
            this.loadSaveData(saveData);
            alert('🎉 存档导入成功！\n\n欢迎回来，' + (saveData.cultivation.state.characterName || '道友') + '！');
          }
        } catch (parseError) {
          console.error('解析存档文件失败:', parseError);
          alert('❗ 存档文件格式错误，无法解析！');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('读取存档文件失败:', error);
      alert('❗ 读取存档文件失败！');
    }
  }

  // 验证存档数据
  validateSaveData(saveData) {
    try {
      // 检查必要的字段
      if (!saveData.cultivation || !saveData.cultivation.state) {
        return false;
      }

      const state = saveData.cultivation.state;

      // 检查境界数据
      if (typeof state.realmIndex !== 'number' ||
          state.realmIndex < 0 ||
          state.realmIndex >= this.REALMS.length) {
        return false;
      }

      // 检查属性数据
      if (!state.attributes || typeof state.attributes !== 'object') {
        return false;
      }

      return true;
    } catch (error) {
      console.error('验证存档数据失败:', error);
      return false;
    }
  }

  // 加载存档数据
  loadSaveData(saveData) {
    try {
      // 备份当前数据
      const backup = {
        state: { ...this.state },
        appliedMinutes: this.appliedMinutes,
        logs: [...this.logs]
      };

      // 加载新数据
      this.state = { ...saveData.cultivation.state };
      this.appliedMinutes = saveData.cultivation.appliedMinutes || 0;
      this.logs = saveData.cultivation.logs || [];

      // 确保所有属性存在
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

      // 保存到本地存储
      this.saveState();

      // 刷新界面
      this.renderAll();

      console.log('存档导入成功:', saveData);
    } catch (error) {
      console.error('加载存档数据失败:', error);
      alert('❗ 导入存档失败，请检查文件格式！');
    }
  }
}

// 导出修仙管理器类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CultivationManager;
} else if (typeof window !== 'undefined') {
  window.CultivationManager = CultivationManager;
}