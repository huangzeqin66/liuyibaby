// 初始化物理引擎
const Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Events = Matter.Events;

// 游戏配置
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const FRUIT_TYPES = 6; // 改为6种水果
const INITIAL_TYPES = 3; // 随机生成前3种大小的水果

// 创建引擎
const engine = Engine.create();
const world = engine.world;

// 创建渲染器
const render = Render.create({
    canvas: document.getElementById('gameCanvas'),
    engine: engine,
    options: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        wireframes: false,
        background: 'white' // 添加白色背景
    }
});

// 创建边界
const walls = [
    Bodies.rectangle(CANVAS_WIDTH/2, CANVAS_HEIGHT, CANVAS_WIDTH, 60, { isStatic: true }), // 底部
    Bodies.rectangle(0, CANVAS_HEIGHT/2, 60, CANVAS_HEIGHT, { isStatic: true }), // 左边
    Bodies.rectangle(CANVAS_WIDTH, CANVAS_HEIGHT/2, 60, CANVAS_HEIGHT, { isStatic: true }) // 右边
];
World.add(world, walls);

// 当前分数
let score = 0;

// 在文件开头添加图片预加载
// 你可以根据需要修改图片路径
const fruitImages = [
    'fruits/0.png',    // 最小
    'fruits/1.png',
    'fruits/2.png',
    'fruits/3.png',
    'fruits/4.png',
    'fruits/5.png' // 最大
].map(src => {
    const img = new Image();
    img.src = src;
    return img;
});


// 预加载图片
for (let i = 0; i < FRUIT_TYPES; i++) {
    const img = new Image();
    img.src = `fruits/${i}.png`; // 你需要准备 0.png, 1.png ... 5.png 这些图片
    fruitImages[i] = img;
}

// 添加游戏状态
let gameActive = true;

// 在游戏配置后添加
let nextFruitType = Math.floor(Math.random() * INITIAL_TYPES);

// 添加更新预览的函数
function updateNextFruit() {
    nextFruitType = Math.floor(Math.random() * INITIAL_TYPES);
    const nextFruitElement = document.getElementById('nextFruit');
    nextFruitElement.style.backgroundImage = `url(${fruitImages[nextFruitType].src})`;
}

// 修改创建水果的函数，使用图片
function createFruit(x, y, type) {
    const radius = 20 + type * 5;
    const fruit = Bodies.circle(x, y, radius, {
        restitution: 0.5,
        label: 'fruit',
        fruitType: type,
        render: {
            sprite: {
                texture: fruitImages[type].src,
                xScale: (radius * 2) / Math.max(fruitImages[type].width, fruitImages[type].height),
                yScale: (radius * 2) / Math.max(fruitImages[type].width, fruitImages[type].height)
            },
            // 添加圆形遮罩
            circleRadius: radius
        }
    });
    return fruit;
}

// 修改重置游戏函数
function resetGame() {
    // 清除所有水果
    const fruits = world.bodies.filter(body => body.label === 'fruit');
    fruits.forEach(fruit => World.remove(world, fruit));
    
    // 重置分数
    score = 0;
    document.getElementById('scoreText').textContent = score;
    
    // 重新激活游戏
    gameActive = true;
    
    // 隐藏重置按钮
    document.getElementById('resetButton').style.display = 'none';

    // 更新下一个水果预览
    updateNextFruit();
}

// 修改点击事件
document.getElementById('gameCanvas').addEventListener('click', (e) => {
    if (!gameActive) return; // 如果游戏结束则不再生成水果
    
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const fruit = createFruit(x, 50, nextFruitType); // 使用预览的水果类型
    World.add(world, fruit);
    
    // 更新下一个水果预览
    updateNextFruit();
});

// 添加重置按钮事件监听
document.getElementById('resetButton').addEventListener('click', resetGame);

// 修改碰撞处理中的胜利判定
Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        
        if (bodyA.label === 'fruit' && bodyB.label === 'fruit') {
            if (bodyA.fruitType === bodyB.fruitType) {
                World.remove(world, [bodyA, bodyB]);
                
                const newType = bodyA.fruitType + 1;
                if (newType < FRUIT_TYPES) {
                    const newX = (bodyA.position.x + bodyB.position.x) / 2;
                    const newY = (bodyA.position.y + bodyB.position.y) / 2;
                    const newFruit = createFruit(newX, newY, newType);
                    World.add(world, newFruit);
                    
                    score += 10;
                    document.getElementById('scoreText').textContent = score;

                    if (newType === FRUIT_TYPES - 1) {
                        setTimeout(() => {
                            alert('恭喜你赢了！！！');
                            gameActive = false; // 停止游戏
                            document.getElementById('resetButton').style.display = 'block'; // 显示重置按钮
                        }, 100);
                    }
                }
            }
        }
    });
});

// 运行游戏
Engine.run(engine);
Render.run(render);

// 在游戏初始化时显示第一个预览
updateNextFruit(); 