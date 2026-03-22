/**
 * 今日相机请求修改 - 预防性注入VIP标记
 * 在请求阶段就标记用户为VIP，确保后端返回VIP配置
 */

const SCRIPT_NAME = "今日相机VIP请求修改";

function main() {
    let body;
    
    try {
        body = JSON.parse($request.body || "{}");
    } catch (e) {
        body = {};
    }
    
    // 在请求中注入VIP用户特征
    // 这会影响后端的分流决策，使其返回VIP实验组配置
    
    // 修改设备属性，标记为VIP设备
    if (body.properties) {
        body.properties.$is_vip = true;
        body.properties.$vip_type = "svip";
        body.properties.$purchase_history = "permanent";
        body.properties.$user_value = "high";
        body.properties.$ltv = "9999";
    }
    
    // 修改登录ID格式（如果可能触发VIP规则）
    // 保持原ID不变，但添加VIP标记到anonymous_id
    if (body.anonymous_id) {
        // 添加VIP前缀标记（某些系统会识别）
        body.anonymous_id_vip_flag = "svip_" + body.anonymous_id;
    }
    
    console.log(`[${SCRIPT_NAME}] 请求已修改，注入VIP标记`);
    
    $done({ body: JSON.stringify(body) });
}

main();
