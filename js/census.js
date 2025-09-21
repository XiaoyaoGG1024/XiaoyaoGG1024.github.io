// 网站统计页面 - 动态版本
// 基于博客content.json数据生成统计信息

// 主题适配
var color = document.documentElement.getAttribute('data-theme') === 'light' ? '#4c4948' : 'rgba(255,255,255,0.7)'

// 博客数据缓存
let blogData = null

// 获取博客数据
async function fetchBlogData() {
  if (blogData) return blogData

  try {
    const response = await fetch('/content.json')
    blogData = await response.json()
    return blogData
  } catch (error) {
    console.error('获取博客数据失败:', error)
    return []
  }
}

// 分析博客数据
function analyzeBlogData(posts) {
  const analysis = {
    postsCount: posts.length,
    tagsCount: 0,
    categoriesCount: 0,
    wordsCount: 0,
    oldestPost: null,
    tagStats: {},
    categoryStats: {},
    postsByDate: {},
    postsByMonth: {}
  }

  // 收集所有标签和分类
  const allTags = new Set()
  const allCategories = new Set()

  posts.forEach(post => {
    // 分析文章日期
    const postDate = new Date(post.date)
    const dateStr = postDate.toISOString().split('T')[0]
    const monthStr = postDate.toISOString().slice(0, 7)

    if (!analysis.oldestPost || postDate < new Date(analysis.oldestPost)) {
      analysis.oldestPost = post.date
    }

    // 统计每日发布文章数
    analysis.postsByDate[dateStr] = (analysis.postsByDate[dateStr] || 0) + 1
    analysis.postsByMonth[monthStr] = (analysis.postsByMonth[monthStr] || 0) + 1

    // 统计字数
    if (post.text) {
      analysis.wordsCount += post.text.length
    }

    // 收集标签
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach(tag => {
        allTags.add(tag.name)
        analysis.tagStats[tag.name] = (analysis.tagStats[tag.name] || 0) + 1
      })
    }

    // 收集分类
    if (post.categories && Array.isArray(post.categories)) {
      post.categories.forEach(category => {
        allCategories.add(category.name)
        analysis.categoryStats[category.name] = (analysis.categoryStats[category.name] || 0) + 1
      })
    }
  })

  analysis.tagsCount = allTags.size
  analysis.categoriesCount = allCategories.size

  return analysis
}

// 1. 站点基础信息
async function siteInfoChart() {
  const posts = await fetchBlogData()
  const analysis = analyzeBlogData(posts)

  const buildDate = analysis.oldestPost ? new Date(analysis.oldestPost) : new Date('2023-08-01')
  const today = new Date()
  const runDays = Math.floor((today - buildDate) / (1000 * 60 * 60 * 24))

  if (document.getElementById('site-info')) {
    document.getElementById('site-info').innerHTML = `
      <div class="site-info-cards">
        <div class="info-card">
          <div class="card-icon">📅</div>
          <div class="card-content">
            <div class="card-number">${runDays}</div>
            <div class="card-label">运行天数</div>
          </div>
        </div>
        <div class="info-card">
          <div class="card-icon">📝</div>
          <div class="card-content">
            <div class="card-number">${analysis.postsCount}</div>
            <div class="card-label">文章总数</div>
          </div>
        </div>
        <div class="info-card">
          <div class="card-icon">🏷️</div>
          <div class="card-content">
            <div class="card-number">${analysis.tagsCount}</div>
            <div class="card-label">标签数量</div>
          </div>
        </div>
        <div class="info-card">
          <div class="card-icon">📚</div>
          <div class="card-content">
            <div class="card-number">${analysis.categoriesCount}</div>
            <div class="card-label">分类数量</div>
          </div>
        </div>
        <div class="info-card">
          <div class="card-icon">✍️</div>
          <div class="card-content">
            <div class="card-number">${(analysis.wordsCount/1000).toFixed(1)}k</div>
            <div class="card-label">总字数</div>
          </div>
        </div>
      </div>
    `
  }
}

// 2. 技术栈展示
async function techStackChart() {
  // 从package.json获取实际的插件数据
  const techData = {
    core: [
      { name: 'Hexo', version: '6.3.0', type: '静态博客生成器' },
      { name: 'Butterfly', version: '4.x', type: '主题框架' },
      { name: 'ECharts', version: '5.x', type: '数据可视化' }
    ],
    plugins: [
      'hexo-butterfly-tag-plugins-plus',
      'hexo-butterfly-swiper',
      'hexo-filter-gitcalendar',
      'hexo-magnet-fomal',
      'hexo-wordcount',
      'hexo-blog-encrypt',
      'hexo-algoliasearch',
      'hexo-deployer-git',
      'hexo-generator-sitemap',
      'hexo-generator-feed'
    ]
  }

  if (document.getElementById('tech-stack')) {
    let script = document.createElement("script")
    script.innerHTML = `
      var techChart = echarts.init(document.getElementById('tech-stack'), 'light');
      var techOption = {
        title: {
          text: '技术栈组成🛠️',
          x: 'center',
          textStyle: {
            color: '${color}'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          bottom: '5%',
          textStyle: {
            color: '${color}'
          }
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          data: [
            {value: 1, name: 'Hexo核心'},
            {value: 1, name: 'Butterfly主题'},
            {value: ${techData.plugins.length}, name: '功能插件'},
            {value: 3, name: '自定义功能'}
          ],
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      };
      techChart.setOption(techOption);
      window.addEventListener("resize", () => {
        techChart.resize();
      });`
    document.getElementById('tech-stack').after(script);
  }
}

// 3. 内容活跃度热力图
async function contentHeatmap() {
  const posts = await fetchBlogData()
  const analysis = analyzeBlogData(posts)

  // 生成热力图数据
  const heatmapData = []
  const startDate = analysis.oldestPost ? new Date(analysis.oldestPost) : new Date('2023-08-01')
  const endDate = new Date()

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    const count = analysis.postsByDate[dateStr] || 0
    heatmapData.push([dateStr, count])
  }

  if (document.getElementById('content-heatmap')) {
    let script = document.createElement("script")
    script.innerHTML = `
      var heatmapChart = echarts.init(document.getElementById('content-heatmap'), 'light');
      var heatmapOption = {
        title: {
          text: '内容发布活跃度📈',
          x: 'center',
          textStyle: {
            color: '${color}'
          }
        },
        tooltip: {
          formatter: function(params) {
            return params.value[0] + ': ' + (params.value[1] || 0) + ' 篇文章'
          }
        },
        visualMap: {
          min: 0,
          max: 3,
          type: 'piecewise',
          orient: 'horizontal',
          left: 'center',
          bottom: '10%',
          pieces: [
            {min: 0, max: 0, color: '#ebedf0'},
            {min: 1, max: 1, color: '#c6e48b'},
            {min: 2, max: 2, color: '#7bc96f'},
            {min: 3, max: 10, color: '#239a3b'}
          ],
          textStyle: {
            color: '${color}'
          }
        },
        calendar: {
          top: 60,
          left: 30,
          right: 30,
          cellSize: ['auto', 13],
          range: ['2023-08', '2025-09'],
          itemStyle: {
            borderWidth: 0.5
          },
          yearLabel: { show: false },
          dayLabel: {
            color: '${color}'
          },
          monthLabel: {
            color: '${color}'
          }
        },
        series: [{
          type: 'heatmap',
          coordinateSystem: 'calendar',
          data: ${JSON.stringify(heatmapData)}
        }]
      };
      heatmapChart.setOption(heatmapOption);
      window.addEventListener("resize", () => {
        heatmapChart.resize();
      });`
    document.getElementById('content-heatmap').after(script);
  }
}

// 4. 文章分类分析
async function categoriesAnalysis() {
  const posts = await fetchBlogData()
  const analysis = analyzeBlogData(posts)

  // 转换分类数据为图表格式
  const categoriesData = Object.entries(analysis.categoryStats).map(([name, value]) => ({
    name,
    value
  }))

  if (document.getElementById('categories-analysis')) {
    let script = document.createElement("script")
    script.innerHTML = `
      var categoriesChart = echarts.init(document.getElementById('categories-analysis'), 'light');
      var categoriesOption = {
        title: {
          text: '内容分类分布🎯',
          x: 'center',
          textStyle: {
            color: '${color}'
          }
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          bottom: '5%',
          textStyle: {
            color: '${color}'
          }
        },
        series: [{
          type: 'pie',
          radius: '60%',
          data: ${JSON.stringify(categoriesData)},
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            color: '${color}',
            formatter: '{b}\\n{c}篇 ({d}%)'
          }
        }]
      };
      categoriesChart.setOption(categoriesOption);
      window.addEventListener("resize", () => {
        categoriesChart.resize();
      });`
    document.getElementById('categories-analysis').after(script);
  }
}

// 5. 简化版访问统计
function visitStatistics() {
  // 使用localStorage模拟访问统计
  const today = new Date().toDateString()
  let visitData = JSON.parse(localStorage.getItem('visitData') || '{}')

  // 更新今日访问数据
  if (!visitData[today]) {
    visitData[today] = 0
  }
  visitData[today]++
  localStorage.setItem('visitData', JSON.stringify(visitData))

  // 计算总访问量和今日访问量
  const totalVisits = Object.values(visitData).reduce((sum, count) => sum + count, 0)
  const todayVisits = visitData[today] || 0

  // 生成最近7天的访问趋势
  const last7Days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toDateString()
    last7Days.push({
      date: date.toLocaleDateString('zh-CN', {month: 'short', day: 'numeric'}),
      visits: visitData[dateStr] || 0
    })
  }

  if (document.getElementById('visit-stats')) {
    let script = document.createElement("script")
    script.innerHTML = `
      var visitChart = echarts.init(document.getElementById('visit-stats'), 'light');
      var visitOption = {
        title: {
          text: '访问统计 (本地模拟)📊',
          x: 'center',
          textStyle: {
            color: '${color}'
          },
          subtext: '总访问: ${totalVisits} | 今日: ${todayVisits}',
          subtextStyle: {
            color: '${color}'
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ${JSON.stringify(last7Days.map(d => d.date))},
          axisLabel: {
            color: '${color}'
          },
          axisLine: {
            lineStyle: {
              color: '${color}'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '${color}'
          },
          axisLine: {
            lineStyle: {
              color: '${color}'
            }
          },
          splitLine: {
            show: false
          }
        },
        series: [{
          data: ${JSON.stringify(last7Days.map(d => d.visits))},
          type: 'line',
          smooth: true,
          areaStyle: {
            opacity: 0.3,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: '#4ECDC4'
            }, {
              offset: 1,
              color: 'rgba(78, 205, 196, 0.1)'
            }])
          },
          lineStyle: {
            color: '#4ECDC4'
          },
          itemStyle: {
            color: '#4ECDC4'
          }
        }]
      };
      visitChart.setOption(visitOption);
      window.addEventListener("resize", () => {
        visitChart.resize();
      });`
    document.getElementById('visit-stats').after(script);
  }
}

// 主题切换适配
function switchThemeAdaptation() {
  color = document.documentElement.getAttribute('data-theme') === 'light' ? '#4c4948' : 'rgba(255,255,255,0.7)'

  // 重新渲染所有图表
  setTimeout(() => {
    if (typeof techChart !== 'undefined') techChart.dispose()
    if (typeof heatmapChart !== 'undefined') heatmapChart.dispose()
    if (typeof categoriesChart !== 'undefined') categoriesChart.dispose()
    if (typeof visitChart !== 'undefined') visitChart.dispose()

    techStackChart()
    contentHeatmap()
    categoriesAnalysis()
    visitStatistics()
  }, 100)
}

// 初始化所有图表
async function initCensusCharts() {
  try {
    await siteInfoChart()
    await techStackChart()
    await contentHeatmap()
    await categoriesAnalysis()
    visitStatistics()
  } catch (error) {
    console.error('初始化图表失败:', error)
  }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCensusCharts)
} else {
  initCensusCharts()
}

// 监听主题切换
var censusTimer;
try {
  document.addEventListener("click", function () {
    clearTimeout(censusTimer);
    censusTimer = setTimeout(switchThemeAdaptation, 100);

  });
} catch (err) { }
