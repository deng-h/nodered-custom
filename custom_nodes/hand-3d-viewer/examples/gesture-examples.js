/**
 * 手部3D查看器手势控制示例
 * 
 * 这个脚本展示了如何通过JavaScript代码来控制手部3D模型的手势
 * 可以在浏览器控制台中运行这些代码
 */

// ===== 基础手势控制 =====

// 应用石头手势
function showRock() {
    if (window.Hand3DViewer && window.Hand3DViewer.Gestures) {
        window.Hand3DViewer.Gestures.applyGesture('rock');
        console.log('✊ 应用石头手势');
    } else {
        console.error('❌ 手势控制模块未加载');
    }
}

// 应用布手势
function showPaper() {
    if (window.Hand3DViewer && window.Hand3DViewer.Gestures) {
        window.Hand3DViewer.Gestures.applyGesture('paper');
        console.log('✋ 应用布手势');
    } else {
        console.error('❌ 手势控制模块未加载');
    }
}

// 应用剪刀手势
function showScissors() {
    if (window.Hand3DViewer && window.Hand3DViewer.Gestures) {
        window.Hand3DViewer.Gestures.applyGesture('scissors');
        console.log('✌️ 应用剪刀手势');
    } else {
        console.error('❌ 手势控制模块未加载');
    }
}

// 重置到自然姿态
function resetToNatural() {
    if (window.Hand3DViewer && window.Hand3DViewer.Gestures) {
        window.Hand3DViewer.Gestures.resetToNaturalPose();
        console.log('🖐️ 重置到自然姿态');
    } else {
        console.error('❌ 手势控制模块未加载');
    }
}

// ===== 高级功能 =====

// 石头剪刀布游戏模拟
function playRockPaperScissors() {
    const gestures = ['rock', 'paper', 'scissors'];
    const names = ['石头', '布', '剪刀'];
    const icons = ['✊', '✋', '✌️'];
    
    console.log('🎮 开始石头剪刀布游戏模拟');
    
    let round = 1;
    const maxRounds = 3;
    
    function nextRound() {
        if (round <= maxRounds) {
            const randomIndex = Math.floor(Math.random() * gestures.length);
            const gesture = gestures[randomIndex];
            const name = names[randomIndex];
            const icon = icons[randomIndex];
            
            console.log(`🎯 第${round}轮: ${icon} ${name}`);
            
            if (window.Hand3DViewer && window.Hand3DViewer.Gestures) {
                window.Hand3DViewer.Gestures.applyGesture(gesture);
            }
            
            round++;
            setTimeout(nextRound, 2000);
        } else {
            console.log('🏁 游戏结束');
            setTimeout(() => {
                if (window.Hand3DViewer && window.Hand3DViewer.Gestures) {
                    window.Hand3DViewer.Gestures.resetToNaturalPose();
                }
            }, 1000);
        }
    }
    
    nextRound();
}

// 手势序列演示
function demonstrateGestureSequence() {
    const sequence = [
        { gesture: 'paper', duration: 1500, name: '布' },
        { gesture: 'rock', duration: 1500, name: '石头' },
        { gesture: 'scissors', duration: 1500, name: '剪刀' },
        { gesture: 'paper', duration: 1500, name: '布' },
        { gesture: null, duration: 1000, name: '自然姿态' }
    ];
    
    console.log('🎭 开始手势序列演示');
    
    let index = 0;
    
    function nextGesture() {
        if (index < sequence.length) {
            const step = sequence[index];
            console.log(`${index + 1}. ${step.name}`);
            
            if (step.gesture) {
                if (window.Hand3DViewer && window.Hand3DViewer.Gestures) {
                    window.Hand3DViewer.Gestures.applyGesture(step.gesture);
                }
            } else {
                if (window.Hand3DViewer && window.Hand3DViewer.Gestures) {
                    window.Hand3DViewer.Gestures.resetToNaturalPose();
                }
            }
            
            index++;
            setTimeout(nextGesture, step.duration);
        } else {
            console.log('✅ 手势序列演示完成');
        }
    }
    
    nextGesture();
}

// ===== 关节控制示例 =====

// 单个手指控制示例
function controlSingleFinger() {
    console.log('👆 单个手指控制示例');
    
    if (!window.Hand3DViewer || !window.Hand3DViewer.currentModel) {
        console.error('❌ 手部模型未加载');
        return;
    }
    
    const handType = window.Hand3DViewer.currentHandType || 'left';
    const suffix = handType.toUpperCase()[0];
    
    // 控制食指
    const indexMCP = `index_MCP_${suffix}`;
    const indexPIP = `index_PIP_${suffix}`;
    const indexDIP = `index_DIP_${suffix}`;
    
    console.log(`控制食指关节: ${indexMCP}, ${indexPIP}, ${indexDIP}`);
    
    // 弯曲食指
    window.Hand3DViewer.setJointAngle(indexMCP, 1.2);
    
    setTimeout(() => {
        // 伸直食指
        window.Hand3DViewer.setJointAngle(indexMCP, 0);
        console.log('✅ 食指控制演示完成');
    }, 2000);
}

// 逐个弯曲手指
function bendFingersSequentially() {
    console.log('🤏 逐个弯曲手指演示');
    
    if (!window.Hand3DViewer || !window.Hand3DViewer.currentModel) {
        console.error('❌ 手部模型未加载');
        return;
    }
    
    const handType = window.Hand3DViewer.currentHandType || 'left';
    const suffix = handType.toUpperCase()[0];
    
    const fingers = [
        { name: '拇指', joint: `thumb_CMC_${suffix}`, angle: 0.8 },
        { name: '食指', joint: `index_MCP_${suffix}`, angle: 1.2 },
        { name: '中指', joint: `middle_MCP_${suffix}`, angle: 1.2 },
        { name: '无名指', joint: `ring_MCP_${suffix}`, angle: 1.2 },
        { name: '小指', joint: `little_MCP_${suffix}`, angle: 1.2 }
    ];
    
    let index = 0;
    
    function bendNext() {
        if (index < fingers.length) {
            const finger = fingers[index];
            console.log(`弯曲${finger.name}: ${finger.joint} -> ${finger.angle}`);
            window.Hand3DViewer.setJointAngle(finger.joint, finger.angle);
            
            index++;
            setTimeout(bendNext, 800);
        } else {
            console.log('✅ 所有手指弯曲完成');
            
            // 2秒后重置
            setTimeout(() => {
                console.log('🔄 重置所有手指');
                fingers.forEach(finger => {
                    window.Hand3DViewer.setJointAngle(finger.joint, 0);
                });
            }, 2000);
        }
    }
    
    bendNext();
}

// ===== 实用工具函数 =====

// 获取当前手部状态
function getHandStatus() {
    console.log('📊 当前手部状态:');
    
    if (!window.Hand3DViewer) {
        console.log('❌ Hand3DViewer 未加载');
        return;
    }
    
    console.log(`手型: ${window.Hand3DViewer.currentHandType || '未知'}`);
    console.log(`模型加载: ${window.Hand3DViewer.currentModel ? '是' : '否'}`);
    console.log(`手势模块: ${window.Hand3DViewer.Gestures ? '是' : '否'}`);
    
    if (window.Hand3DViewer.Gestures) {
        const availableGestures = window.Hand3DViewer.Gestures.getAvailableGestures();
        console.log(`可用手势: ${availableGestures.map(g => g.name).join(', ')}`);
    }
    
    if (window.Hand3DViewer.currentModel && window.Hand3DViewer.currentModel.joints) {
        const jointCount = Object.keys(window.Hand3DViewer.currentModel.joints).length;
        console.log(`关节数量: ${jointCount}`);
    }
}

// 导出所有函数到全局作用域以便在控制台中使用
window.HandGestureExamples = {
    // 基础手势
    showRock,
    showPaper,
    showScissors,
    resetToNatural,
    
    // 高级功能
    playRockPaperScissors,
    demonstrateGestureSequence,
    
    // 关节控制
    controlSingleFinger,
    bendFingersSequentially,
    
    // 工具函数
    getHandStatus
};

// 使用说明
console.log(`
🎮 手部3D查看器手势控制示例脚本已加载

基础手势控制:
- HandGestureExamples.showRock()          // 石头手势
- HandGestureExamples.showPaper()         // 布手势
- HandGestureExamples.showScissors()      // 剪刀手势
- HandGestureExamples.resetToNatural()    // 自然姿态

高级功能:
- HandGestureExamples.playRockPaperScissors()        // 石头剪刀布游戏
- HandGestureExamples.demonstrateGestureSequence()   // 手势序列演示

关节控制:
- HandGestureExamples.controlSingleFinger()         // 单个手指控制
- HandGestureExamples.bendFingersSequentially()     // 逐个弯曲手指

工具函数:
- HandGestureExamples.getHandStatus()               // 获取手部状态

在浏览器控制台中调用这些函数来测试手势功能！
`);