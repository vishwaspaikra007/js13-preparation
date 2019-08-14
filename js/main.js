var ctx = document.getElementById('ctx').getContext('2d');
var ctxS = document.getElementById('ctx');
var body = document.querySelector('body');
var fullScreenBtn = document.getElementById('fullScreenBtn');
// modify settings

ctx.font = "30px Arial";
var enemyList = {};
var frames = 30;
var widthFrame = ctxS.clientWidth;
var heightFrame = ctxS.clientHeight;
var collisionArea = 30;
var framesCount = 0;
var score = 0;
var upgradeList = {};
var bulletList = {};
var bossList = {};
var canShort;
var player;
var sx,sy; 
var sw,sh;
var fullScreenbool = true;

wait = false; 
firedelay = false;

function startScreenConfig() {
    widthFrame = 900;
    heightFrame = 500;
    ctxS.width  = widthFrame;
    ctxS.height = heightFrame;
    fullScreenbool=true;
    fullScreenBtn.innerHTML = "Full Screen";
}

function changeSize() {
    if(fullScreenbool==true) {
        widthFrame = body.clientWidth;
        heightFrame = body.clientHeight;
        ctxS.width  = widthFrame;
        ctxS.height = heightFrame;
        fullScreenbool=false;
        fullScreenBtn.innerHTML = "Escape Full Screen";
        if (body.requestFullscreen) {
            body.requestFullscreen();
        } else if (body.mozRequestFullScreen) { /* Firefox */
            body.mozRequestFullScreen();
        } else if (body.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
            body.webkitRequestFullscreen();
        } else if (body.msRequestFullscreen) { /* IE/Edge */
            body.msRequestFullscreen();
        }
    } else {
        startScreenConfig();
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        }
    }
    document.addEventListener('fullscreenchange', exitHandler);
    document.addEventListener('webkitfullscreenchange', exitHandler);
    document.addEventListener('mozfullscreenchange', exitHandler);
    document.addEventListener('MSFullscreenChange', exitHandler);

    function exitHandler() {
        if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
        startScreenConfig();
        ///fire your event
        }
    }  
}

stayInBoundary = (self) => {
    if(self.x < self.width/2)
        self.x = self.width/2;
    if(self.x > currentMap.width - img.player.width/2)
        self.x = currentMap.width - img.player.width/2;
    if(self.y < self.height/2)
        self.y = self.height/2;
    if(self.y > currentMap.height - img.player.height/2)
        self.y = currentMap.height - img.player.height/2;
}

var randomlyGenerateEnemy = ()=> {
    var rid = Math.random();
    var rx = Math.random()*currentMap.width;
    var ry = Math.random()*currentMap.height;
    var rwidth = 50;
    var rheight = 50;
    enemy(rid,rx,ry,rwidth,rheight);
} 

var randomlyGenerateBoss = ()=> {
    var rid = Math.random();
    var rx = Math.random()*currentMap.width;
    var ry = Math.random()*currentMap.height;
    var rwidth = 80;
    var rheight = 80;
    boss(rid,rx,ry,rwidth,rheight);
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
    bossList = {};
    createPlayer();
    randomlyGenerateEnemy();
    randomlyGenerateEnemy();
    randomlyGenerateEnemy();
}

Maps = (id,imgSrc,width,height)=> {
    var self = {
        id:id,
        img:new Image(),
        width:width*60,
        height:height*50
    }
    self.img.src = imgSrc;
    self.drawMap = () => {
// my logic for map movement .............................
        sw = self.width - widthFrame/2;
        sh = self.height - heightFrame/2;
        if(player.x < widthFrame/2){
            var x = 0;
        } else if(player.x >= self.width - widthFrame/2) {
            var x = sx;
        } else {
            x = widthFrame/2 - player.x;
            sx = x;
        }
        if(player.y < heightFrame/2){
            var y = 0;
        } else if(player.y >= self.height - heightFrame/2){
            var y = sy;
        } else {
            y = heightFrame/2 - player.y;
            sy = y;
        }
// ...........................................................................
        ctx.drawImage(self.img,0,0,self.width,self.height,
                        x,y,self.width*60,self.height*60);
    }
    return self;
}

currentMap = Maps('field','./img/bg.png',40,35);

function update() {
    var todelete = false;
    ctx.clearRect(0, 0, widthFrame, heightFrame);
    currentMap.drawMap();
    if(framesCount%50 == 0) 
        randomlyGenerateEnemy();
    if(framesCount%100 == 0)
        randomlyGenerateUpgrade();
    if(framesCount%400 == 0)
        randomlyGenerateBoss();
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
    for( item in bossList) {
        bossList[item].update();
    }
    player.update();
}

var ant = setInterval(() => {
    update();
}, frames);


document.onmousemove = (mouse)=> {
    mouseX = mouse.clientX - document.getElementById('ctx').getBoundingClientRect().left;
    mouseY = mouse.clientY - document.getElementById('ctx').getBoundingClientRect().top;
    mouseX-=bx;
    mouseY-=by;
    player.aimAngle = Math.atan2(mouseX,mouseY)/Math.PI * 180;
}

document.onclick = ()=> {
    if(firedelay === false) {
        firedelay = true;
        performAttack(player,8);
        setTimeout(() => {
            firedelay = false;            
        }, 400);
    } 
} 
// performAttack  = actor => {
//     generateBullets(actor);
// }
document.oncontextmenu = (event)=> {
    event.preventDefault();
    if(firedelay === false) {
        firedelay = true;
        player.performSpecialAttack();
        setTimeout(() => {
            firedelay = false;            
        }, 400);
    } 
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
