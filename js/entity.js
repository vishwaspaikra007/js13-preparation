
// load images
var img = {};
img.player = new Image();
img.player.src = './img/player.png';

img.enemy = new Image();
img.enemy.src = './img/enemy.png';

img.bullet = new Image();
img.bullet.src = './img/bullet.png';

img.upgrade = new Image();
img.upgrade.src = './img/upgrade.png';

img.bg = new Image();
img.bg.src = './img/bg.png';
// display image
// ctx.drawImage(img, 0, 0, 20, 20);

Entity = (type,id,x,y,xspd,yspd,width,height,img)=> {
    var self = {
        type:type,
        id:id,
        x:x,
        y:y,
        xspd:xspd,
        yspd:yspd,
        width:width,
        height:height,
        img:img,
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
        ctx.save();
        var x = self.x-self.width/2;
        var y = self.y-self.height/2;
        ctx.drawImage(self.img, x, y, 50, 50);
        ctx.restore();
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
    var self = Entity('player','myId',50,40,30,5,20,20,img.player);
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

function enemy(id,x,y,xspd,yspd,width,height) {
    var self = Entity('enemy',id,x,y,xspd,yspd,width,height,img.enemy);
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

bullets = (id,x,y,xspd,yspd,width,height,aimAngle)=> {
    var self = Entity('bullets',id,x,y,xspd,yspd,width,height,img.bullet);
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
    var self = Entity('upgrade',id,x,y,0,0,20,20,img.upgrade);
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
