// 修仙系统管理器
class CultivationManager {
  constructor() {
    console.log('修仙系统初始化开始...');

    // 初始化数据管理器
    this.dataManager = new CultivationDataManager();
    this.isDataLoaded = false;

    // 默认数据（作为回退）
    this.REALMS = [];
    this.STAGES = ["前期", "中期", "后期"];
    this.CULTIVATION_LOGS = [];
    this.ADVENTURES = [];

    this.STORAGE_KEY = 'cultivationState_v2';
    this.APPLIED_KEY = 'cultivationAppliedMinutes_v2';
    this.LOGS_KEY = 'cultivationLogs_v1';
    this.CHARACTER_NAME_KEY = 'cultivationCharacterName';

    // 异步初始化
    this.initializeAsync();
  }

  async initializeAsync() {
    try {
      console.log('开始加载修仙数据...');
      await this.loadCultivationData();
      console.log('修仙数据加载完成');

      // 初始化状态
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
    } catch (error) {
      console.error('修仙系统初始化失败:', error);
      // 使用默认数据继续初始化
      await this.loadDefaultData();
      this.loadState();
      this.renderAllWithRetry();
      this.setupEventListeners();
    }
  }

  async loadCultivationData() {
    try {
      const data = await this.dataManager.loadAllCultivationData();
      this.REALMS = data.realms || this.REALMS;
      this.CULTIVATION_LOGS = data.cultivationLogs;
      this.ADVENTURES = data.adventures;
      this.STAGES = data.stages;
      this.isDataLoaded = true;
      console.log('从CSV加载数据成功:', data);
    } catch (error) {
      console.warn('加载CSV数据失败，使用默认数据:', error);
      await this.loadDefaultData();
    }
  }

  async loadDefaultData() {
    try {
      const defaultData = await this.dataManager.getDefaultCultivationData();
      this.REALMS = defaultData.realms;
      this.CULTIVATION_LOGS = defaultData.cultivationLogs;
      this.ADVENTURES = defaultData.adventures;
      this.STAGES = defaultData.stages;
      this.isDataLoaded = true;
    } catch (error) {
      console.error('加载默认数据失败:', error);
      // 使用最基础的硬编码数据
      this.REALMS = [{ name: "炼气", desc: "凡胎肉体，初窥仙途。", breakthrough: "灵气汇聚丹田！" }];
      this.CULTIVATION_LOGS = [{ content: "静心调息，真元缓缓流转。", weight: 1 }];
      this.ADVENTURES = [{ type: "treasure", name: "发现灵草", desc: "发现珍贵灵草。", rewards: { hp: 30 } }];
      this.STAGES = ["前期", "中期", "后期"];
      this.isDataLoaded = true;
    }
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
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100);
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
    // 使用统一的权重/条件抽取函数
    if (!this.ADVENTURES || this.ADVENTURES.length === 0) {
      return;
    }

    // 基于福缘属性的奇遇触发概率
    const luckBonus = this.state.attributes.luck * 0.02; // 降低福缘影响，避免过于强力
    const baseChance = 0.15; // 15%基础概率
    const totalChance = Math.min(0.95, baseChance + luckBonus); // 最大95%触发概率

    // 使用数据管理器的统一抽取函数
    const selectedAdventure = this.dataManager.selectByWeightAndCondition(
      this.ADVENTURES,
      this.state,
      {
        triggerRate: totalChance,
        allowEmpty: true,
        debug: false
      }
    );

    if (selectedAdventure) {
      this.executeAdventure(selectedAdventure);
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

      // 修炼日志 - 使用统一的权重选择函数
      const selectedLogTemplate = this.dataManager.selectByWeightAndCondition(
        this.CULTIVATION_LOGS,
        this.state,
        {
          triggerRate: 1.0,
          allowEmpty: false,
          debug: false
        }
      );
      const logTemplate = selectedLogTemplate ? selectedLogTemplate.content : "静心调息，真元缓缓流转。";
      const attrGains = [];

      // 随机属性提升 - 使用统一的权重选择函数
      const attributeBoosts = [
        { content: 'attack', rewards: { attack: () => Math.floor(Math.random() * 3) + 1 }, weight: 1 },
        { content: 'defense', rewards: { defense: () => Math.floor(Math.random() * 3) + 1 }, weight: 1 },
        { content: 'hp', rewards: { hp: () => Math.floor(Math.random() * 15) + 5 }, weight: 1 },
        { content: 'mana', rewards: { mana: () => Math.floor(Math.random() * 10) + 3 }, weight: 1 },
        { content: 'spirit', rewards: { spirit: () => Math.floor(Math.random() * 3) + 1 }, weight: 1 }
      ];

      const selectedBoost = this.dataManager.selectByWeightAndCondition(
        attributeBoosts,
        this.state,
        {
          triggerRate: 0.3, // 30%概率获得属性提升
          allowEmpty: true,
          debug: false
        }
      );

      if (selectedBoost) {
        const attrNames = {
          attack: '攻击',
          defense: '防御',
          hp: '气血',
          mana: '真元',
          spirit: '神识'
        };

        for (const [attr, gainFunc] of Object.entries(selectedBoost.rewards)) {
          const gain = typeof gainFunc === 'function' ? gainFunc() : gainFunc;
          this.state.attributes[attr] += gain;
          attrGains.push(`${attrNames[attr]}+${gain}`);
        }
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
      const saveData = this.createVersionedSaveData();
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

  // 创建版本化存档数据
  createVersionedSaveData() {
    return {
      // 主版本号：重大结构变更
      // 次版本号：新增字段或功能
      // 修订版本号：bug修复或小优化
      version: '3.0.0',
      formatVersion: 3, // 数字版本，便于比较
      timestamp: Date.now(),
      date: new Date().toLocaleString(),
      gameVersion: '修仙系统 v3.0',

      // 核心数据
      cultivation: {
        // 基础状态
        state: {
          ...this.state,
          // 确保包含所有可能的字段
          realmIndex: this.state.realmIndex || 0,
          stageIndex: this.state.stageIndex || 0,
          level: this.state.level || 1,
          exp: this.state.exp || 0,
          tribulation: this.state.tribulation || { needed: false, successRate: 0.3, failCount: 0 },
          attributes: {
            attack: this.state.attributes?.attack || 10,
            defense: this.state.attributes?.defense || 8,
            hp: this.state.attributes?.hp || 100,
            mana: this.state.attributes?.mana || 50,
            spirit: this.state.attributes?.spirit || 30,
            luck: this.state.attributes?.luck || 5,
            comprehension: this.state.attributes?.comprehension || 7,
            spiritualStone: this.state.attributes?.spiritualStone || 0,
            // 预留扩展字段
            ...this.state.attributes
          },
          totalCultivationTime: this.state.totalCultivationTime || 0,
          characterName: this.state.characterName || ''
        },
        appliedMinutes: this.appliedMinutes || 0,
        logs: this.logs || []
      },

      // 兼容性信息
      compatibility: {
        minSupportedVersion: '1.0.0',
        requiredFeatures: ['基础修仙', '属性系统', '渡劫系统'],
        optionalFeatures: ['奇遇系统', '日志系统']
      },

      // 元数据
      metadata: {
        characterName: this.state.characterName || '',
        description: '修仙系统存档文件 - 支持向后兼容',
        exportedBy: 'CultivationManager v3.0',
        platform: typeof window !== 'undefined' ? 'Web' : 'Node.js'
      }
    };
  }

  // 导入存档
  importSave(file) {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const rawData = JSON.parse(e.target.result);

          // 识别并迁移存档格式
          const migratedData = this.migrateSaveData(rawData);

          if (!migratedData) {
            alert('❗ 存档文件格式不支持或已损坏！');
            return;
          }

          // 验证迁移后的数据
          if (!this.validateSaveData(migratedData)) {
            alert('❗ 存档数据验证失败，可能存在兼容性问题！');
            return;
          }

          // 生成导入确认信息
          const confirmMsg = this.generateImportConfirmation(migratedData, rawData);

          if (confirm(confirmMsg)) {
            this.loadSaveData(migratedData);
            const welcomeMsg = this.generateWelcomeMessage(migratedData, rawData);
            alert(welcomeMsg);
          }
        } catch (parseError) {
          console.error('解析存档文件失败:', parseError);
          alert('❗ 存档文件格式错误，无法解析！请检查文件是否完整。');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('读取存档文件失败:', error);
      alert('❗ 读取存档文件失败！');
    }
  }

  // 数据迁移 - 支持多版本向后兼容
  migrateSaveData(rawData) {
    try {
      // 检测数据版本
      const version = this.detectSaveVersion(rawData);
      console.log('检测到存档版本:', version);

      // 根据版本进行迁移
      switch (version.major) {
        case 1:
          return this.migrateFromV1(rawData);
        case 2:
          return this.migrateFromV2(rawData);
        case 3:
          return this.migrateFromV3(rawData);
        default:
          console.warn('未知的存档版本:', version);
          return this.tryGenericMigration(rawData);
      }
    } catch (error) {
      console.error('数据迁移失败:', error);
      return null;
    }
  }

  // 检测存档版本
  detectSaveVersion(data) {
    // 新版本格式（v3.0+）
    if (data.formatVersion && typeof data.formatVersion === 'number') {
      return { major: data.formatVersion, minor: 0, patch: 0, format: 'new' };
    }

    // 字符串版本格式（v2.0）
    if (data.version && typeof data.version === 'string') {
      if (data.version === '2.0') {
        return { major: 2, minor: 0, patch: 0, format: 'v2' };
      }
    }

    // 旧版本格式（v1.x 或更早）
    if (data.cultivation && data.cultivation.state) {
      return { major: 1, minor: 0, patch: 0, format: 'legacy' };
    }

    // 极旧格式（直接包含状态数据）
    if (data.realmIndex !== undefined || data.state) {
      return { major: 0, minor: 1, patch: 0, format: 'ancient' };
    }

    return { major: 0, minor: 0, patch: 0, format: 'unknown' };
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

  // 加载存档数据（增强版）
  loadSaveData(saveData) {
    try {
      console.log('开始加载存档数据:', saveData);

      // 备份当前数据
      const backup = {
        state: JSON.parse(JSON.stringify(this.state)),
        appliedMinutes: this.appliedMinutes,
        logs: [...this.logs]
      };

      try {
        // 加载新数据
        const newState = { ...saveData.cultivation.state };

        // 数据修复和补全
        this.fixAndValidateState(newState);

        this.state = newState;
        this.appliedMinutes = Math.max(0, saveData.cultivation.appliedMinutes || 0);
        this.logs = Array.isArray(saveData.cultivation.logs) ? saveData.cultivation.logs : [];

        // 保存到本地存储
        this.saveState();

        // 刷新界面
        this.renderAll();
        this.renderLogs();

        console.log('存档导入成功:', saveData);
      } catch (loadError) {
        console.error('加载新数据失败，还原备份:', loadError);

        // 还原备份数据
        this.state = backup.state;
        this.appliedMinutes = backup.appliedMinutes;
        this.logs = backup.logs;
        this.saveState();
        this.renderAll();

        throw loadError;
      }
    } catch (error) {
      console.error('加载存档数据失败:', error);
      alert('❗ 导入存档失败，已还原原有数据。请检查文件格式！');
    }
  }

  // V3格式迁移（当前最新格式，直接使用）
  migrateFromV3(rawData) {
    console.log('V3格式数据，直接使用');
    return rawData;
  }

  // V2格式迁移
  migrateFromV2(rawData) {
    console.log('从V2格式迁移数据');
    try {
      const migratedData = {
        version: "3.0.0",
        formatVersion: 3,
        timestamp: Date.now(),
        date: new Date().toLocaleString('zh-CN'),
        gameVersion: "修仙系统 v3.0",
        cultivation: rawData.cultivation || rawData,
        compatibility: {
          minSupportedVersion: "1.0.0",
          requiredFeatures: ["基础修仙", "属性系统", "渡劫系统"],
          optionalFeatures: ["奇遇系统", "日志系统"]
        },
        metadata: {
          characterName: rawData.cultivation?.state?.characterName || "道友",
          description: "修仙系统存档文件 - 从V2迁移",
          exportedBy: "CultivationManager v3.0",
          platform: "Web"
        }
      };
      return migratedData;
    } catch (error) {
      console.error('V2迁移失败:', error);
      return null;
    }
  }

  // V1格式迁移
  migrateFromV1(rawData) {
    console.log('从V1格式迁移数据');
    try {
      const migratedData = {
        version: "3.0.0",
        formatVersion: 3,
        timestamp: Date.now(),
        date: new Date().toLocaleString('zh-CN'),
        gameVersion: "修仙系统 v3.0",
        cultivation: {
          state: rawData.cultivation?.state || rawData,
          appliedMinutes: rawData.cultivation?.appliedMinutes || 0,
          logs: rawData.cultivation?.logs || []
        },
        compatibility: {
          minSupportedVersion: "1.0.0",
          requiredFeatures: ["基础修仙", "属性系统"],
          optionalFeatures: ["渡劫系统", "奇遇系统", "日志系统"]
        },
        metadata: {
          characterName: rawData.cultivation?.state?.characterName || "道友",
          description: "修仙系统存档文件 - 从V1迁移",
          exportedBy: "CultivationManager v3.0",
          platform: "Web"
        }
      };
      return migratedData;
    } catch (error) {
      console.error('V1迁移失败:', error);
      return null;
    }
  }

  // 通用迁移（兜底方案）
  tryGenericMigration(rawData) {
    console.log('尝试通用迁移');
    try {
      // 如果数据有cultivation字段，尝试包装
      if (rawData.cultivation) {
        return this.migrateFromV2(rawData);
      }

      // 如果直接是状态数据，包装为V1格式再迁移
      if (rawData.realmIndex !== undefined || rawData.attributes) {
        const wrappedData = {
          cultivation: {
            state: rawData,
            appliedMinutes: 0,
            logs: []
          }
        };
        return this.migrateFromV1(wrappedData);
      }

      console.warn('无法识别的数据格式');
      return null;
    } catch (error) {
      console.error('通用迁移失败:', error);
      return null;
    }
  }

  // 修复和验证状态数据
  fixAndValidateState(state) {
    // 修复境界索引超出范围的问题
    if (this.REALMS && state.realmIndex >= this.REALMS.length) {
      console.warn(`修复境界索引: ${state.realmIndex} -> ${this.REALMS.length - 1}`);
      state.realmIndex = this.REALMS.length - 1;
    }

    // 修复阶段索引
    if (this.STAGES && state.stageIndex >= this.STAGES.length) {
      console.warn(`修复阶段索引: ${state.stageIndex} -> ${this.STAGES.length - 1}`);
      state.stageIndex = this.STAGES.length - 1;
    }

    // 确保所有必要属性存在
    const defaultAttributes = {
      attack: 10,
      defense: 8,
      hp: 100,
      mana: 50,
      spirit: 30,
      luck: 5,
      comprehension: 7,
      spiritualStone: 0
    };

    if (!state.attributes) {
      state.attributes = defaultAttributes;
    } else {
      // 补全缺少的属性
      for (const [key, defaultValue] of Object.entries(defaultAttributes)) {
        if (typeof state.attributes[key] !== 'number' || isNaN(state.attributes[key])) {
          console.warn(`修复属性 ${key}: ${state.attributes[key]} -> ${defaultValue}`);
          state.attributes[key] = defaultValue;
        }
      }
    }

    // 确保渡劫数据结构正确
    if (!state.tribulation || typeof state.tribulation !== 'object') {
      state.tribulation = { needed: false, successRate: 0.3, failCount: 0 };
    } else {
      state.tribulation.needed = Boolean(state.tribulation.needed);
      state.tribulation.successRate = typeof state.tribulation.successRate === 'number' ?
        Math.max(0, Math.min(1, state.tribulation.successRate)) : 0.3;
      state.tribulation.failCount = Math.max(0, parseInt(state.tribulation.failCount) || 0);
    }

    // 确保数值字段正确
    state.realmIndex = Math.max(0, parseInt(state.realmIndex) || 0);
    state.stageIndex = Math.max(0, parseInt(state.stageIndex) || 0);
    state.level = Math.max(1, parseInt(state.level) || 1);
    state.exp = Math.max(0, parseInt(state.exp) || 0);
    state.totalCultivationTime = Math.max(0, parseInt(state.totalCultivationTime) || 0);

    // 确保字符串字段
    state.characterName = typeof state.characterName === 'string' ? state.characterName : '';

    console.log('状态数据修复完成:', state);
  }
}

// 导出修仙管理器类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CultivationManager;
} else if (typeof window !== 'undefined') {
  window.CultivationManager = CultivationManager;
}