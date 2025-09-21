var leonus = {
    // 清除评论框缓存和状态
    clearCommentCache: () => {
        // 清除localStorage中的评论相关缓存
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('comment') || key.includes('waline') || key.includes('twikoo') || key.includes('valine'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // 清除sessionStorage中的评论相关缓存
        const sessionKeysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && (key.includes('comment') || key.includes('waline') || key.includes('twikoo') || key.includes('valine'))) {
                sessionKeysToRemove.push(key);
            }
        }
        sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));

        console.log('评论缓存已清除');
    },

    // 重置评论框状态
    resetCommentBox: () => {
        const commentBox = document.querySelector(".el-textarea__inner") ||
                          document.querySelector(".wl-editor") ||
                          document.querySelector(".wl-input") ||
                          document.querySelector("textarea[placeholder*='评论']") ||
                          document.querySelector("textarea");

        if (commentBox) {
            // 清空内容
            commentBox.value = '';

            // 触发清空事件
            commentBox.dispatchEvent(new Event('input', { bubbles: true }));
            commentBox.dispatchEvent(new Event('change', { bubbles: true }));

            // 移除焦点
            commentBox.blur();

            console.log('评论框已重置');
        }
    },

    linkCom: e => {
        // 先清除缓存和重置状态
        leonus.clearCommentCache();

        // 等待一小段时间确保清除完成
        setTimeout(() => {
            // 兼容多种评论系统的文本域选择器
            var t = document.querySelector(".el-textarea__inner") ||
                    document.querySelector(".wl-editor") ||
                    document.querySelector(".wl-input") ||
                    document.querySelector("textarea[placeholder*='评论']") ||
                    document.querySelector("textarea");

            if (!t) {
                alert("未找到评论框，请确保页面已完全加载");
                return;
            }

            // 先清空现有内容
            t.value = '';
            t.dispatchEvent(new Event('input', { bubbles: true }));

            // 短暂延迟后填入模板
            setTimeout(() => {
                if ("bf" == e) {
                    t.value = "```yml\n- name: \n  link: \n  avatar: \n  descr: \n  siteshot: \n```";
                    t.setSelectionRange(15, 15);
                } else {
                    t.value = "站点名称：\n站点地址：\n头像链接：\n站点描述：\n站点截图：";
                    t.setSelectionRange(5, 5);
                }

                t.focus();

                // 触发input事件，确保评论系统识别内容变化
                t.dispatchEvent(new Event('input', { bubbles: true }));
                t.dispatchEvent(new Event('change', { bubbles: true }));

                console.log('友链申请模板已填入');
            }, 100);
        }, 100);
    },
    owoBig: () => {
        if (!document.getElementById("post-comment") || document.body.clientWidth < 768) return;
        let e = 1,
            t = "",
            o = document.createElement("div"),
            n = document.querySelector("body");
        o.id = "owo-big", n.appendChild(o), new MutationObserver((l => {
            for (let a = 0; a < l.length; a++) {
                let i = l[a].addedNodes,
                    s = "";
                if (2 == i.length && "OwO-body" == i[1].className) s = i[1];
                else {
                    if (1 != i.length || "tk-comment" != i[0].className) continue;
                    s = i[0]
                }
                s.onmouseover = l => {
                    e && ("OwO-body" == s.className && "IMG" == l.target.tagName || "tk-owo-emotion" == l.target.className) && (e = 0, t = setTimeout((() => {
                        let e = 3 * l.path[0].clientHeight,
                            t = 3 * l.path[0].clientWidth,
                            a = l.x - l.offsetX - (t - l.path[0].clientWidth) / 2,
                            i = l.y - l.offsetY;
                        a + t > n.clientWidth && (a -= a + t - n.clientWidth + 10), a < 0 && (a = 10), o.style.cssText = `display:flex; height:${e}px; width:${t}px; left:${a}px; top:${i}px;`, o.innerHTML = `<img src="${l.target.src}">`
                    }), 300))
                }, s.onmouseout = () => {
                    o.style.display = "none", e = 1, clearTimeout(t)
                }
            }
        })).observe(document.getElementById("post-comment"), {
            subtree: !0,
            childList: !0
        })
    },
};