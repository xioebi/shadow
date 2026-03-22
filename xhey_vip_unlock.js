/**
 * 今日相机VIP解锁 + 去广告脚本
 * 功能：1. 关闭所有广告  2. 强制开启VIP功能  3. 解锁会员专属功能
 * 作者：Kimi
 * 日期：2026-03-22
 * 版本：2.0.0
 */

const SCRIPT_NAME = "今日相机VIP解锁";
const DEBUG = true;

// ==================== 配置区域 ====================

// 广告实验特征库（去广告用）
const AD_PATTERNS = {
    exactIds: {
        "11339": { name: "and_ad_inter_container", action: "disable" },
        "11334": { name: "group_desktop_widgetAB", action: "disable" },
        "11147": { name: "and_ad_sen_01", action: "disable" },
        "10936": { name: "and_asyn_request_switch_splash", action: "disable" },
        "10988": { name: "and_xheySDK_sdk_token_pre_fetch", action: "disable" },
        "10400": { name: "android_new_oaid", action: "disable" },
    },
    keywords: [
        { pattern: /splashad/i, name: "开屏广告" },
        { pattern: /inter.*ad/i, name: "插屏广告" },
        { pattern: /ad_sen/i, name: "广告敏感度" },
        { pattern: /xheyunion/i, name: "广告联盟" },
        { pattern: /xheySDK.*token/i, name: "广告SDK预加载" },
        { pattern: /reward.*ad/i, name: "激励视频" },
        { pattern: /banner.*ad/i, name: "横幅广告" },
        { pattern: /native.*ad/i, name: "原生广告" },
    ]
};

// VIP实验配置（强制开启）
const VIP_CONFIG = {
    // 实验ID -> VIP配置
    exactIds: {
        // 用户会员商品 - 强制开启全功能
        "11410": {
            name: "userMemberGoodsAB",
            type: "INTEGER",
            fakeValue: "999",  // 999 = 全功能VIP标识
            isVip: true,
            vipLevel: "svip"
        },
        // 应用内购买升级 - 强制开启
        "11350": {
            name: "inAppPurchaseUpgradeAB",
            type: "BOOLEAN",
            fakeValue: "true",
            isVip: true
        },
        // 群组VIP推广 - 强制显示VIP入口
        "11416": {
            name: "groupVipPromotionAB",
            type: "JSON",
            fakeValue: JSON.stringify({
                header: true,
                pic: "https://net-cloud.xhey.top/data/vip_crown.png",
                vipBadge: true,
                svipBadge: true,
                expireTime: "2099-12-31",
                isPermanent: true
            }),
            isVip: true
        },
        // 群组Web VIP - 全功能开启
        "11418": {
            name: "groupWebVipAB",
            type: "JSON",
            fakeValue: JSON.stringify({
                entry: true,
                benifitPage: true,
                chargePage: true,
                upgrade: true,
                btnText: "已开通VIP",
                isVip: true,
                vipType: "svip",
                expireTime: "2099-12-31T23:59:59Z"
            }),
            isVip: true
        },
        // 高级会员连续包季 - 改为永久会员
        "11420": {
            name: "groupVvipQuarterWebAB",
            type: "JSON",
            fakeValue: JSON.stringify({
                sku_id: "SVIP_PERMANENT_001",
                name: "永久超级会员",
                price: "0",
                cardText: "脚本解锁 - 永久有效",
                isFree: true,
                expireTime: "2099-12-31",
                features: ["unlimited_export", "no_watermark", "4k_export", "all_templates", "ai_features"]
            }),
            isVip: true
        },
        // 团队VIP升级间隔 - 开启
        "11236": {
            name: "teamVipUpgradeGapAB",
            type: "BOOLEAN",
            fakeValue: "true",
            isVip: true
        },
        // 群管理页VIP - 强制开启（原false）
        "11260": {
            name: "groupManagePageVIPAB",
            type: "BOOLEAN",
            fakeValue: "true",
            isVip: true
        },
        // 商品推荐VIP - 改为商业版无限次
        "10982": {
            name: "itemRecommendVipAB",
            type: "JSON",
            fakeValue: JSON.stringify({
                isBusiness: true,           // 商业版
                numLimitDaily: 999999,      // 无限次
                vipText: "永久VIP会员",
                isVip: true,
                unlimited: true
            }),
            isVip: true
        },
    },
    
    // VIP功能关键词（自动识别并开启）
    keywords: [
        { pattern: /vip/i, name: "VIP功能", action: "enable" },
        { pattern: /svip/i, name: "超级VIP", action: "enable" },
        { pattern: /member/i, name: "会员功能", action: "enable" },
        { pattern: /premium/i, name: "高级功能", action: "enable" },
        { pattern: /unlimited/i, name: "无限功能", action: "enable" },
        { pattern: /watermark.*remove/i, name: "去水印", action: "enable" },
        { pattern: /export.*hd/i, name: "高清导出", action: "enable" },
        { pattern: /template/i, name: "模板功能", action: "enable" },
        { pattern: /ai.*feature/i, name: "AI功能", action: "enable" },
    ]
};

// 全局VIP注入配置（添加到所有响应）
const GLOBAL_VIP_PAYLOAD = {
    isVip: true,
    vipType: "svip",           // svip / vip / permanent
    vipLevel: 3,               // 1=普通VIP, 2=高级VIP, 3=超级VIP
    expireTime: "2099-12-31T23:59:59Z",
    startTime: "2024-01-01T00:00:00Z",
    isPermanent: true,
    isAutoRenew: false,
    remainingDays: 99999,
    
    // 功能开关
    features: {
        noWatermark: true,           // 无水印导出
        hdExport: true,              // 高清导出
        4kExport: true,              // 4K导出
        unlimitedTemplates: true,    // 无限模板
        aiEnhance: true,             // AI增强
        batchEdit: true,             // 批量编辑
        cloudStorage: true,          // 云存储
        advancedFilters: true,       // 高级滤镜
        allFonts: true,              // 全部字体
        allStickers: true,           // 全部贴纸
        prioritySupport: true,       // 优先客服
    },
    
    // 显示配置
    uiConfig: {
        showVipBadge: true,
        showSvipBadge: true,
        vipIcon: "https://net-cloud.xhey.top/data/vip_crown.png",
        vipColor: "#FFD700",
        btnText: "永久VIP",
        btnSubText: "脚本解锁"
    }
};

// ==================== 工具函数 ====================

function log(message, level = "info") {
    const prefix = `[${SCRIPT_NAME}]`;
    const timestamp = new Date().toLocaleTimeString();
    if (DEBUG || level === "error") {
        console.log(`${prefix} [${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
}

function isAdExperiment(exp) {
    const expId = exp.abtest_experiment_id;
    const varName = exp.variables?.[0]?.name || "";
    
    if (AD_PATTERNS.exactIds[expId]) return true;
    for (const kw of AD_PATTERNS.keywords) {
        if (kw.pattern.test(varName)) return true;
    }
    return false;
}

function isVipExperiment(exp) {
    const expId = exp.abtest_experiment_id;
    const varName = exp.variables?.[0]?.name || "";
    
    if (VIP_CONFIG.exactIds[expId]) return true;
    for (const kw of VIP_CONFIG.keywords) {
        if (kw.pattern.test(varName)) return true;
    }
    return false;
}

function processAdVariable(variable, expId) {
    const type = variable.type;
    switch (type) {
        case "BOOLEAN": return "false";
        case "INTEGER": return "0";
        case "STRING": return "";
        case "JSON": return "{}";
        default: return "";
    }
}

function processVipVariable(variable, expId) {
    const config = VIP_CONFIG.exactIds[expId];
    if (config && config.fakeValue !== undefined) {
        return config.fakeValue;
    }
    
    // 根据类型返回VIP开启值
    const type = variable.type;
    switch (type) {
        case "BOOLEAN": return "true";
        case "INTEGER": return "999";
        case "STRING": return "svip";
        case "JSON": 
            return JSON.stringify({
                isVip: true,
                vipType: "svip",
                expireTime: "2099-12-31",
                unlimited: true
            });
        default: return "true";
    }
}

// ==================== 核心处理函数 ====================

function processExperiment(exp) {
    const expId = exp.abtest_experiment_id;
    const varName = exp.variables?.[0]?.name || "unknown";
    
    // 1. 处理广告实验 - 关闭
    if (isAdExperiment(exp)) {
        log(`🚫 关闭广告实验: ${expId} - ${varName}`);
        exp.is_control_group = true;
        exp.abtest_experiment_group_id = "0";
        exp.is_white_list = false;
        exp.cacheable = false;
        
        if (exp.variables) {
            exp.variables.forEach(v => {
                const oldVal = v.value;
                v.value = processAdVariable(v, expId);
                log(`   ${v.name}: ${oldVal} -> ${v.value}`);
            });
        }
        return exp;
    }
    
    // 2. 处理VIP实验 - 强制开启
    if (isVipExperiment(exp)) {
        log(`👑 开启VIP实验: ${expId} - ${varName}`);
        exp.is_control_group = false;  // 非对照组 = 实验组（开启）
        exp.is_white_list = true;       // 白名单用户
        exp.cacheable = true;
        
        const config = VIP_CONFIG.exactIds[expId];
        if (config) {
            exp.abtest_experiment_group_id = "1";  // 实验组ID通常为1
        }
        
        if (exp.variables) {
            exp.variables.forEach(v => {
                const oldVal = v.value;
                v.value = processVipVariable(v, expId);
                log(`   ${v.name}: ${oldVal} -> ${v.value}`);
            });
        }
        return exp;
    }
    
    return exp;
}

function filterFuzzyExperiments(list) {
    if (!Array.isArray(list)) return list;
    return list.filter(name => {
        const isAd = AD_PATTERNS.keywords.some(kw => kw.pattern.test(name));
        if (isAd) {
            log(`🚫 过滤广告实验: ${name}`);
            return false;
        }
        return true;
    });
}

function injectGlobalVip(body) {
    // 在响应根级别注入VIP状态
    body.userVipInfo = GLOBAL_VIP_PAYLOAD;
    body.isVip = true;
    body.vipStatus = "active";
    body.vipExpireTime = "2099-12-31T23:59:59Z";
    
    // 如果存在properties，也注入VIP标记
    if (body.properties) {
        body.properties.$is_vip = true;
        body.properties.$vip_type = "svip";
        body.properties.$vip_expire = "2099-12-31";
    }
    
    log(`💎 注入全局VIP配置: ${JSON.stringify(GLOBAL_VIP_PAYLOAD.vipType)}`);
    return body;
}

// ==================== 主函数 ====================

function main() {
    let body;
    
    try {
        body = JSON.parse($response.body);
    } catch (e) {
        log(`JSON解析失败: ${e.message}`, "error");
        $done({});
        return;
    }
    
    log("========================================");
    log("🚀 今日相机 VIP解锁 + 去广告 启动");
    log("========================================");
    
    let adCount = 0;
    let vipCount = 0;
    let totalExp = 0;
    
    // 处理 results
    if (body.results && Array.isArray(body.results)) {
        totalExp += body.results.length;
        body.results = body.results.map(exp => {
            if (isAdExperiment(exp)) {
                adCount++;
                return processExperiment(exp);
            } else if (isVipExperiment(exp)) {
                vipCount++;
                return processExperiment(exp);
            }
            return exp;
        });
    }
    
    // 处理 out_list
    if (body.out_list && Array.isArray(body.out_list)) {
        totalExp += body.out_list.length;
        body.out_list = body.out_list.map(exp => {
            if (isAdExperiment(exp)) {
                adCount++;
                return processExperiment(exp);
            } else if (isVipExperiment(exp)) {
                vipCount++;
                return processExperiment(exp);
            }
            return exp;
        });
    }
    
    // 过滤模糊实验
    if (body.fuzzy_experiments) {
        body.fuzzy_experiments = filterFuzzyExperiments(body.fuzzy_experiments);
    }
    
    // 注入全局VIP配置
    body = injectGlobalVip(body);
    
    // 强制成功状态
    body.status = "SUCCESS";
    body.is_custom_cache = false;
    
    log("----------------------------------------");
    log(`📊 统计: 总实验=${totalExp}, 关闭广告=${adCount}, 开启VIP=${vipCount}`);
    log(`👑 VIP状态: ${GLOBAL_VIP_PAYLOAD.vipType} | 到期: ${GLOBAL_VIP_PAYLOAD.expireTime}`);
    log("✅ 处理完成 - 享受VIP功能吧！");
    log("========================================");
    
    $done({ body: JSON.stringify(body) });
}

main();
