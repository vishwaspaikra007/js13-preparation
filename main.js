var ctx = document.getElementById('ctx').getContext('2d');

// modify settings

ctx.font = "30px Arial";
var enemy = {
    name:'P',
    x:350,
    y:350,
    xspd:3,
    yspd:-50
};

var player = {
    name:'E',
    x:50,
    y:50,
    xspd:30,
    yspd:5
};

var frames = 20;
var height = 500;
var width = 500;

function updateCharacter(character) {
    character.x+=character.xspd;
    character.y+=character.yspd;
    ctx.fillText(character.name,character.x,character.y);
    if(character.x>width || character.x<0) {
        character.xspd=-character.xspd;
    } else if(character.y>height || character.y<0) {
        character.yspd=-character.yspd;
    }
}

function update() {
    ctx.clearRect(0, 0, width, height);
    
    updateCharacter(player);
    updateCharacter(enemy);
}

var ant = setInterval(() => {
    update();
}, frames);
