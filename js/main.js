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
img.bg = new Image();
img.bg.src = './img/bg.png';

stayInBoundary = (self) => {
    if(self.x < self.width/2)
        self.x = self.width/2;
    if(self.x > currentMap.width - self.width/2)
        self.x = currentMap.width - self.width/2;
    if(self.y < self.height/2)
        self.y = self.height/2;
    if(self.y > currentMap.height - self.height/2)
        self.y = currentMap.height - self.height/2;
}

var randomlyGenerateEnemy = ()=> {
    var rid = Math.random();
    var rx = Math.random()*currentMap.width;
    var ry = Math.random()*currentMap.height;
    var rxspd = 1  + Math.random()*4;
    var ryspd = 1  + Math.random()*4;
    var rwidth = 50;
    var rheight = 50;
    enemy(rid,rx,ry,rxspd,ryspd,rwidth,rheight);
} 

var performAttack = (entity,atkspd,overwriteAngle)=> {
    var bid = Math.random();
    var bx = entity.x;
    var by = entity.y;
    var bwidth = 22 ;
    var bheight = 22;
    var baimAngle = entity.aimAngle;
    if(overwriteAngle !== undefined) {
        baimAngle = overwriteAngle;
    }
    if(atkspd === undefined) {
        var byspd = Math.cos(baimAngle/180*Math.PI)*2;
        var bxspd = Math.sin(baimAngle/180*Math.PI)*2;
    } else {
        var byspd = Math.cos(baimAngle/180*Math.PI)*8;
        var bxspd = Math.sin(baimAngle/180*Math.PI)*8;
    }
   
    bullets(bid,bx,by,bxspd,byspd,bwidth,bheight,baimAngle,entity.type);
} 

var randomlyGenerateUpgrade = ()=> {
    var rid = Math.random();
    var rx = Math.random()*currentMap.width;
    var ry = Math.random()*currentMap.height;
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

Maps = (id,imgSrc,width,height)=> {
    var self = {
        id:id,
        image:new Image(),
        width:width,
        height:height
    }
    self.image.src = imgSrc;

    self.drawMap = () => {
        var x = widthFrame/2 - player.x;
        var y = heightFrame/2 - player.y;
        ctx.drawImage(img.bg,0,0,img.bg.width,img.bg.height,x,y,img.bg.width*30,img.bg.height*30);
    }
    return self;
}

currentMap = Maps('field','../img/bg.png',1200,1050);

function update() {
    var todelete = false;
    ctx.clearRect(0, 0, widthFrame, heightFrame);
    currentMap.drawMap();
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
    
    mouseX-=widthFrame/2;
    mouseY-=heightFrame/2;

    player.aimAngle = Math.atan2(mouseX,mouseY)/Math.PI * 180;
}

document.onclick = ()=> {
    performAttack(player,8)
} 
// performAttack  = actor => {
//     generateBullets(actor);
// }
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