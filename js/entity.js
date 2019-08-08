
// load images
var img = {};
var spx,spy;
var bx,by;
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

img.boss = new Image();
img.boss.src = './img/boss.png';

// display image
// ctx.drawImage(img, 0, 0, 20, 20);

Entity = (type,id,x,y,width,height,img)=> {
    var self = {
        id: id,
        type:type,
        x:x,
        y:y,
        width:width,
        height:height,
        img:img,
    }
    self.draw = ()=> {
        ctx.save();

        var x = self.x-player.x;
        var y = self.y-player.y;
// my very first logic in this game
        if(player.x>=widthFrame/2-player.width/2 && player.x < sw) {
            x += widthFrame/2-self.width/2;
            spx = player.x;
        } else if(player.x >= sw) {
            x += widthFrame/2+player.x-spx-self.width/2;
        } else {
            x += player.x;
        }
        if (player.y>=heightFrame/2-player.height/2 && player.y < sh) {
            y += heightFrame/2-self.height/2;
            spy = player.y;
        } else if(player.y >= sh){
            y += heightFrame/2+player.y-spy-self.height/2;
        }  else {
            y += player.y;
        }
        bx = x;
        by = y;

// end of my logic..........................................................
        x -= self.width/2;
        y -= self.height/2;
        // ctx.drawImage(self.img, x, y, 50, 50);
        ctx.drawImage(self.img,0,0,self.img.width,self.img.height,x,y,self.width,self.height)
        ctx.restore();
    }
    self.update = () => {
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
    var self = Entity('player','myId',50,40,40,40,img.player);
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
                }, 1500);
            ctx.restore();
            } else {
                self.draw();
                ctx.fillText("HP" + self.hp,20,20);
                ctx.fillText("Score " + score,200,20);
                score++;
            }
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
    }
    self.performSpecialAttack = () => {
        performAttack(self,8,self.aimAngle - 15);
        performAttack(self,8,self.aimAngle);
        performAttack(self,8,self.aimAngle + 15);
    }
    player = self;
}

function enemy(id,x,y,width,height) {
    var self = Entity('enemy',id,x,y,width,height,img.enemy);
    self.aimAngle = 0;
    self.attackSpeed = 0;
    self.attackCounter = 0;
    
    var super_update = self.update;
    self.update = () => {
        super_update();
        if(framesCount%125 == 0) 
            performAttack(self)
        var isColliding = player.testCollision(self);
        if(isColliding && wait === false) {
            wait = true;
            player.hp--;
            setTimeout(() => {
                wait = false;                
            }, 600);
        }
        var diffx = player.x - self.x;
        var diffy = player.y - self.y;

        if(diffx > 0)
            self.x +=3;
        else
            self.x -=3;

            if(diffy > 0)
            self.y +=3;
        else
            self.y -=3;

        var diffx = player.x - self.x;
        var diffy = player.y - self.y;

        self.aimAngle = Math.atan2(diffx,diffy)/Math.PI * 180;

    }
    enemyList[id] = self;
}

function boss(id,x,y,width,height) {
    var self = Entity('boss',id,x,y,width,height,img.boss);
    self.aimAngle = 0;
    self.attackSpeed = 0;
    self.attackCounter = 0;
    self.hp = 10;
    
    var super_update = self.update;
    self.update = () => {
        super_update();
        if(framesCount%125 == 0) 
            performAttack(self)
        var isColliding = player.testCollision(self);
        if(isColliding && wait === false) {
            wait = true;
            player.hp--;
            setTimeout(() => {
                wait = false;                
            }, 600);
        }
        var diffx = player.x - self.x;
        var diffy = player.y - self.y;

        if(diffx > 0)
            self.x +=3;
        else
            self.x -=3;

            if(diffy > 0)
            self.y +=3;
        else
            self.y -=3;

        var diffx = player.x - self.x;
        var diffy = player.y - self.y;

        self.aimAngle = Math.atan2(diffx,diffy)/Math.PI * 180;

    }
    bossList[id] = self;
}

bullets = (id,x,y,xspd,yspd,width,height,aimAngle,combatType)=> {
    var self = Entity('bullets',id,x,y,width,height,img.bullet);
    self.timer = 0;
    self.aimAngle = aimAngle;
    self.combatType = combatType;
    self.xspd = xspd;
    self.yspd = yspd;
    var super_update = self.update;
    self.update = () => {
        super_update();
        if(self.combatType === 'player') {
            for( item in enemyList) {
                if(self.testCollision(enemyList[item])){
                delete bulletList[self.id];
                    delete enemyList[item];
                    score+=200;
                    break;
                } 
            }
            for( item in bossList) {
                if(self.testCollision(bossList[item])){
                    bossList[item].hp--;
                    delete bulletList[self.id];
                    if(bossList[item].hp <= 0) {
                        delete bossList[item];
                        score+=1000;
                        break;
                    }
                } 
            }
        }else if(self.combatType === 'enemy') {
            if(self.testCollision(player) && wait===false){
                delete bulletList[self.id];
                wait = true;
                player.hp--;
                setTimeout(() => {
                    wait = false;                
                }, 600);
            } 
        }
        if (self.timer++ >= 150) {
            delete bulletList[self.id]; 
        }
        self.x+=self.xspd;
        self.y+=self.yspd;
        if(self.x>currentMap.width || self.x<0) {
            self.xspd=-self.xspd;
        }if(self.y>currentMap.height || self.y<0) {
            self.yspd=-self.yspd;
        }
    }
    bulletList[id] = self;
}

function upgrade(id,x,y) {
    var self = Entity('upgrade',id,x,y,40,40,img.upgrade);
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
