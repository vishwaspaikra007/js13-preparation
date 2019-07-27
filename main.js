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
var player;

Entity = (type,id,x,y,xspd,yspd,width,height,color)=> {
    var self = {
        type:type,
        id:id,
        x:x,
        y:y,
        xspd:xspd,
        yspd:yspd,
        width:width,
        height:height,
        color:color,
    }
    self.update = () => {
        updateEntityPosition(self);
        drawEntity(self);
    }
    return self;
}
createPlayer = ()=> {
    var self = Entity('player','myId',50,40,30,5,20,20,'green');
    self.hp = 10;
    self.pressingRight = false,
    self.pressingDown = false,
    self.pressingLeft = false,
    self.pressingUp = false,
    self.aimAngle = 0
    player = self;
}

function enemy(id,x,y,xspd,yspd,width,height,color) {
    var self = Entity('enemy',id,x,y,xspd,yspd,width,height,color);
    self.aimAngle = 0;
    self.attackSpeed = 0;
    self.attackCounter = 0;
    enemyList[id] = self;
}

bullets = (id,x,y,xspd,yspd,width,height,color,aimAngle)=> {
    var self = Entity('bullets',id,x,y,xspd,yspd,width,height,color);
    self.timer = 0;
    bulletList[id] = self;
}

function upgrade(id,x,y,xspd,yspd,width,height,color) {
    var self = Entity('upgrade',id,x,y,xspd,yspd,width,height,color);
    self.timer = 0;
    upgradeList[id] = self;
}

var drawEntity = (entity)=> {
    ctx.save();
    ctx.fillStyle=entity.color;
    ctx.fillRect(entity.x-entity.width/2,entity.y-entity.height/2,entity.width,entity.height);
    ctx.restore();
}

function updateEntityPosition(entity) {
    if(entity.type === 'player') {
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
    } else {
        entity.x+=entity.xspd;
        entity.y+=entity.yspd;
        if(entity.x>width || entity.x<0) {
            entity.xspd=-entity.xspd;
        }if(entity.y>height || entity.y<0) {
            entity.yspd=-entity.yspd;
        }
    }
    
}
function getDistance(player, enemy) {
    var x = Math.abs(player.x - enemy.x);
    var y = Math.abs(player.y - enemy.y);
    return Math.sqrt(x*x + y*y);
}
function testCollisionRect (entity1, entity) {
    return entity1.x<=entity.x+entity.width
            && entity.x<=entity1.x+entity1.width
            && entity1.y<=entity.y+entity.width
            && entity.y<=entity1.y+entity1.width
}
function testCollision(entity1, entity) {
    rect1 = {
        x:entity1.x - entity1.width/2,
        y:entity1.y - entity1.height/2,
        width:entity1.width,
        height:entity1.height
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
    enemy(rid,rx,ry,rxspd,ryspd,rwidth,rheight,rcolor);
} 

var generateBullets = (entity,overwriteAngle)=> {
    var bid = Math.random();
    var bx = entity.x;
    var by = entity.y;
    var bwidth = 10 ;
    var bheight = 10;
    var bcolor = `black`;
    var baimAngle = entity.aimAngle;
    if(overwriteAngle !== undefined) {
        baimAngle = overwriteAngle;
    }
    var byspd = Math.cos(baimAngle/180*Math.PI)*5;
    var bxspd = Math.sin(baimAngle/180*Math.PI)*5;
    bullets(bid,bx,by,bxspd,byspd,bwidth,bheight,bcolor,baimAngle);
} 

var randomlyGenerateUpgrade = ()=> {
    var rid = Math.random();
    var rx = Math.random()*width;
    var ry = Math.random()*width;
    upgrade(rid,rx,ry);
} 
createPlayer();
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
function update() {

    var todelete = false;
    ctx.clearRect(0, 0, width, height);
    if(framesCount%50 == 0) 
        randomlyGenerateEnemy();
    if(framesCount%100 == 0)
        randomlyGenerateUpgrade();
    framesCount++; 
    // for enemies
    for(var item in enemyList) {
        enemyList[item].update();
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
        upgradeList[upgradeItem].update();
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
        bulletList[bullet].update();
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
    player.update();
}

var ant = setInterval(() => {
    update();
}, frames);


document.onmousemove = (mouse)=> {
    mouseX = mouse.clientX - document.getElementById('ctx').getBoundingClientRect().left;
    mouseY = mouse.clientY - document.getElementById('ctx').getBoundingClientRect().top;
    
    mouseX-=player.x;
    mouseY-=player.y;

    player.aimAngle = Math.atan2(mouseX,mouseY)/Math.PI * 180;
}

document.onclick = ()=> {
    performAttack(player)
} 
performAttack  = actor => {
    generateBullets(actor);
}
document.oncontextmenu = (event)=> {
    event.preventDefault();
    performSpecialAttack(player);
}
performSpecialAttack = actor => {
    generateBullets(actor,actor.aimAngle - 5);
    generateBullets(actor,actor.aimAngle);
    generateBullets(actor,actor.aimAngle + 5);
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

