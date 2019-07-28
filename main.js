var ctx = document.getElementById('ctx').getContext('2d');

// modify settings

ctx.font = "30px Arial";
var enemyList = {};
var frames = 30;
var heightFrame = 500;
var widthFrame = 500;
var collisionArea = 30;
var framesCount = 0;
var score = 0;
var upgradeList = {};
var bulletList = {};
var canShort;
var player;
wait = false;                

stayInBoundary = (self) => {
    if(self.x < self.width/2)
    self.x = self.width/2;
    if(self.x > widthFrame - self.width/2)
        self.x = widthFrame - self.width/2;
    if(self.y < self.height/2)
        self.y = self.height/2;
    if(self.y > heightFrame - self.height/2)
        self.y = heightFrame - self.height/2;
}

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
    self.updatePosition = () => {
        if(self.type === 'player') {
            if(self.pressingRight == true) {
                self.x+=10;
            }
            if(self.pressingDown == true) {
                self.y+=10;
            }
            if(self.pressingLeft == true) {
                self.x-=10;
            }
            if(self.pressingUp == true) {
                self.y-=10;
            }
            stayInBoundary(self);
        } else {
            self.x+=self.xspd;
            self.y+=self.yspd;
            if(self.x>widthFrame || self.x<0) {
                self.xspd=-self.xspd;
            }if(self.y>heightFrame || self.y<0) {
                self.yspd=-self.yspd;
            }
        }
    }
    self.draw = ()=> {
        ctx.fillStyle=self.color;
        ctx.fillRect(self.x-self.width/2,self.y-self.height/2,self.width,self.height);
    }
    self.update = () => {
        self.updatePosition();
        self.draw();
    }
    self.getDistance = (entity) => {
        var x = Math.abs(self.x - entity.x);
        var y = Math.abs(self.y - entity.y);
        return Math.sqrt(x*x + y*y);
    }
    self.testCollisionRect = (rect1,rect2) => {
        return rect1.x<=rect2.x+rect2.width
                && rect2.x<=rect1.x+rect1.width
                && rect1.y<=rect2.y+rect2.width
                && rect2.y<=rect1.y+rect1.width
    }
    self.testCollision = (entity) => {
        rect1 = {
            x:self.x - self.width/2,
            y:self.y - self.height/2,
            width:self.width,
            height:self.height
        }
        rect2 = {
            x:entity.x - entity.width/2,
            y:entity.y - entity.height/2,
            width:entity.width,
            height:entity.height
        }
        return self.testCollisionRect(rect1, rect2)
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
    var super_update = self.update;
    self.update = () => {
        super_update();
        if(self.hp<=0) {
            ctx.save()
            ctx.font = '40px Arial';    
            ctx.fillText("Game Over " + "Score:" + score,25,heightFrame/2);
                setTimeout(() => {
                    startNewGame();            
                }, 0);
            ctx.restore();
            } else {
                self.draw();
                ctx.fillText("HP" + self.hp,20,20);
                ctx.fillText("Score " + score,200,20);
                score++;
            }
    }
    self.performSpecialAttack = () => {
        generateBullets(self,self.aimAngle - 5);
        generateBullets(self,self.aimAngle);
        generateBullets(self,self.aimAngle + 5);
    }
    player = self;
}

function enemy(id,x,y,xspd,yspd,width,height,color) {
    var self = Entity('enemy',id,x,y,xspd,yspd,width,height,color);
    self.aimAngle = 0;
    self.attackSpeed = 0;
    self.attackCounter = 0;
    var super_update = self.update;
    self.update = () => {
        super_update();
        if(framesCount%25 == 0) 
            performAttack(self)
        var isColliding = player.testCollision(self);
        if(isColliding && wait === false) {
            wait = true;
            player.hp--;
            setTimeout(() => {
                wait = false;                
            }, 200);
        }
    }
    enemyList[id] = self;
}

bullets = (id,x,y,xspd,yspd,width,height,color,aimAngle)=> {
    var self = Entity('bullets',id,x,y,xspd,yspd,width,height,color);
    self.timer = 0;
    self.aimAngle = aimAngle;
    var super_update = self.update;
    self.update = () => {
        super_update();
        // for( item in enemyList) {
            // var isColliding = self.testCollision(enemyList[item]);
            // if(isColliding) {
            //     delete self;
            //     delete enemyList[item];
            //     break;
            // } else 
            if(self.timer++ >= 50) {
                delete bulletList[self.id]; 
                // break;
            // }
        }
    }
    bulletList[id] = self;
}

function upgrade(id,x,y) {
    var self = Entity('upgrade',id,x,y,0,0,20,20,'greenyellow');
    self.timer = 0;
    var super_update = self.update;
    self.update = () => {
        super_update();
        self.timer++;
        var isColliding = player.testCollision(self);
        if(isColliding) {
            score+=1000;
            player.hp++;
            delete upgradeList[self.id];
        } else if(self.timer>=100) {
            delete upgradeList[self.id];
        }
    }
    upgradeList[id] = self;
}


var randomlyGenerateEnemy = ()=> {
    var rid = Math.random();
    var rx = Math.random()*widthFrame;
    var ry = Math.random()*widthFrame;
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
    var rx = Math.random()*widthFrame;
    var ry = Math.random()*widthFrame;
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
    createPlayer();
    randomlyGenerateEnemy();
    randomlyGenerateEnemy();
    randomlyGenerateEnemy();
}
function update() {

    var todelete = false;
    ctx.clearRect(0, 0, widthFrame, heightFrame);
    if(framesCount%50 == 0) 
        randomlyGenerateEnemy();
    if(framesCount%100 == 0)
        randomlyGenerateUpgrade();
    framesCount++; 
    // for enemies
    for(var item in enemyList) {
        enemyList[item].update();
    } 
    // for bullets
    for(var bullet in bulletList) {
        bulletList[bullet].update();
    }
    //for upgrade
    for(var upgradeItem in upgradeList) {
        upgradeList[upgradeItem].update();
    }
    //for bullets
    for( bullet in bulletList) {
        bulletList[bullet].update();
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
    player.performSpecialAttack();
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

