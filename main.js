var ctx = document.getElementById('ctx').getContext('2d');

// modify settings

ctx.font = "30px Arial";
var enemyList = {};
var frames = 30;
var height = 500;
var width = 500;
var collisionArea = 30;
var framesCount = 0;
var score = 0;
var upgradeList = {};
var bulletList = {};
var canShort;

var player = {
    name:'P',
    x:50,
    y:50,
    xspd:30,
    yspd:5,
    width:20,
    height:20,
    hp:10,
    color:'green',
    pressingRight: false,
    pressingDown: false,
    pressingLeft: false,
    pressingUp: false,
    angle: 0
};

function enemy(id,x,y,xspd,yspd,width,height,color) {
    var enemy = {
        id:id,
        x:x,
        y:y,
        xspd:xspd,
        width:width,
        height:height,
        yspd:yspd,
        color:color
    };
    enemyList[id] = enemy;
}

bullets = (id,x,y,xspd,yspd,width,height,color,angle)=> {
    var bulletEntity = {
        id:id,
        x:x,
        y:y,
        xspd:xspd,
        yspd:yspd,
        angle:angle,
        width:width,
        height:height,
        color:color,
        timer:0
    };
    bulletList[id] = bulletEntity;
}

function upgrade(rid,rx,ry) {
    var entity = {
        id:rid,
        x:rx,
        y:ry,
        xspd:0,
        width:20,
        height:20,
        yspd:0,
        color: 'green',
        timer:0
    };
    upgradeList[rid] = entity;
}

var drawEntity = (entity)=> {
    ctx.save();
    ctx.fillStyle=entity.color;
    ctx.fillRect(entity.x-entity.width/2,entity.y-entity.height/2,entity.width,entity.height);
    ctx.restore();
}

function updateEntityPosition(entity) {
    entity.x+=entity.xspd;
    entity.y+=entity.yspd;
    if(entity.x>width || entity.x<0) {
        entity.xspd=-entity.xspd;
    }if(entity.y>height || entity.y<0) {
        entity.yspd=-entity.yspd;
    }
}

var updateEntity = (entity)=> {
    updateEntityPosition(entity);
    drawEntity(entity);
}

function getDistance(player, enemy) {
    var x = Math.abs(player.x - enemy.x);
    var y = Math.abs(player.y - enemy.y);
    return Math.sqrt(x*x + y*y);
}
function testCollisionRect (player, entity) {
    return player.x<=entity.x+entity.width
            && entity.x<=player.x+player.width
            && player.y<=entity.y+entity.width
            && entity.y<=player.y+player.width
}
function testCollision(player, entity) {
    rect1 = {
        x:player.x - player.width/2,
        y:player.y - player.height/2,
        width:player.width,
        height:player.height
    }
    rect2 = {
        x:entity.x - entity.width/2,
        y:entity.y - entity.height/2,
        width:entity.width,
        height:entity.height
    }
    return testCollisionRect(rect1, rect2)
}

var randomlyGenerateEnemy = ()=> {
    var rid = Math.random();
    var rx = Math.random()*width;
    var ry = Math.random()*width;
    var rxspd = 1  + Math.random()*10;
    var ryspd = 1  + Math.random()*10;
    var rwidth = 10 + Math.random()*30;
    var rheight = 10 + Math.random()*30;
    var rcolor = `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255}`;
    //id,x,y,xspd,yspd,width,height,color
    enemy(rid,rx,ry,rxspd,ryspd,rwidth,rheight,rcolor);
} 

var randomlyGenerateBullet = (entity,overwriteAngle)=> {
    var bid = Math.random();
    var bx = entity.x;
    var by = entity.y;
    var bwidth = 10 ;
    var bheight = 10;
    var bcolor = `black`;
    var bangle = entity.angle;
    if(overwriteAngle !== undefined) {
        bangle = overwriteAngle;
    }
    var byspd = Math.cos(bangle/180*Math.PI)*5;
    var bxspd = Math.sin(bangle/180*Math.PI)*5;
    //id,x,y,xspd,yspd,width,height,color
    bullets(bid,bx,by,bxspd,byspd,bwidth,bheight,bcolor,bangle);
} 

var randomlyGenerateUpgrade = ()=> {
    var rid = Math.random();
    var rx = Math.random()*width;
    var ry = Math.random()*width;
    upgrade(rid,rx,ry);
} 

var startNewGame = ()=> {
    player.hp = 10;
    framesCount = 0;
    score = 0;
    upgradeList = {};
    enemyList = {};
    bulletList = {};
    randomlyGenerateEnemy();
    randomlyGenerateEnemy();
    randomlyGenerateEnemy();
}
stayInBoundary = ()=> {
    if(player.x < player.width/2)
    player.x = player.width/2;
    if(player.x > width - player.width/2)
        player.x = width - player.width/2;
    if(player.y < player.height/2)
        player.y = player.height/2;
    if(player.y > height - player.height/2)
        player.y = height - player.height/2;
}
updatePlayerPosition = ()=> {
    if(player.pressingRight == true) {
        player.x+=10;
    }
    if(player.pressingDown == true) {
        player.y+=10;
    }
    if(player.pressingLeft == true) {
        player.x-=10;
    }
    if(player.pressingUp == true) {
        player.y-=10;
    }
    stayInBoundary();
}

function update() {
    var todelete = false;
    ctx.clearRect(0, 0, width, height);
    if(framesCount%50 == 0) 
        randomlyGenerateEnemy();
    if(framesCount%100 == 0)
        randomlyGenerateUpgrade();
    // if(framesCount%25 == 0)
    //     randomlyGenerateBullet();
    framesCount++; 
    // for enemies
    for(var item in enemyList) {
        updateEntity(enemyList[item]);
        var isColliding = testCollision(player, enemyList[item]);
        if(isColliding) {
            player.hp--;
        }
    } 
    // for bullets
    for(var bullet in bulletList) {
        bulletList[bullet].timer++;
        for( item in enemyList) {
            var isColliding = testCollision(bulletList[bullet], enemyList[item]);
            if(isColliding) {
                delete bulletList[bullet];
                delete enemyList[item];
                break;
            } else if(bulletList[bullet].timer >= 50) {
                delete bulletList[bullet]; 
                break;
            }
        }
    }
    //for upgrade
    for(var upgradeItem in upgradeList) {
        upgradeList[upgradeItem].timer++;
        updateEntity(upgradeList[upgradeItem]);
        var isColliding = testCollision(player, upgradeList[upgradeItem]);
        if(isColliding) {
            score+=1000;
            player.hp++;
            delete upgradeList[upgradeItem];
        } else if(upgradeList[upgradeItem].timer>=100) {
            delete upgradeList[upgradeItem];
        }
    }

    for( bullet in bulletList) {
        updateEntity(bulletList[bullet]);
    }

    if(player.hp<=0) {
    ctx.save()
    ctx.font = '40px Arial';    
    ctx.fillText("Game Over " + "Score:" + score,25,height/2);
        setTimeout(() => {
            startNewGame();            
        }, 2000);
    ctx.restore();
    } else {
        drawEntity(player);
        ctx.fillText("HP" + player.hp,20,20);
        ctx.fillText("Score " + score,200,20);
        score++;
    }
    updatePlayerPosition();
}

var ant = setInterval(() => {
    update();
}, frames);


document.onmousemove = (mouse)=> {
    mouseX = mouse.clientX - document.getElementById('ctx').getBoundingClientRect().left;
    mouseY = mouse.clientY - document.getElementById('ctx').getBoundingClientRect().top;
    
    mouseX-=player.x;
    mouseY-=player.y;

    player.angle = Math.atan2(mouseX,mouseY)/Math.PI * 180;
}
shoot = (entity,owa)=> {
    if(canShort == true)
            randomlyGenerateBullet(entity,owa);
        canShort = false;
}
wait = ()=> {
    setTimeout(() => {
        canShort = true;            
    }, 300);
}
document.onclick = ()=> {
    shoot(player);
    wait();
} 
document.oncontextmenu = (event)=> {
    event.preventDefault();
    var angle=0;
    while(angle <=360) {
        shoot(player,player.angle - angle++);
        canShort = true;
    }
    wait();
}
document.onkeydown =(event)=> {
    if(event.keyCode == 68 || event.keyCode == 39) {
        player.pressingRight = true;
    } if(event.keyCode == 83 || event.keyCode == 40) {
        player.pressingDown = true;        
    } if(event.keyCode == 65 || event.keyCode == 37) {
        player.pressingLeft = true;        
    } if(event.keyCode == 87 || event.keyCode == 38) {
        player.pressingUp = true;        
    } if(event.keyCode == 32) {
        shoot(player);        
    }
}

document.onkeyup =(event)=> {
    if(event.keyCode == 68 || event.keyCode == 39) {
        player.pressingRight = false;
    }if(event.keyCode == 83 || event.keyCode == 40) {
        player.pressingDown = false;        
    }if(event.keyCode == 65 || event.keyCode == 37) {
        player.pressingLeft = false;        
    }if(event.keyCode == 87 || event.keyCode == 38) {
        player.pressingUp = false;        
    } if(event.keyCode == 32) {
        wait();
    }
}

