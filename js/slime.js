document.addEventListener('keydown', keyResponse);

var boardWidth = 8;
var boardHeight = 8;
var blocks;
var walls;
var exitTiles;
var player;
var offsets = [[0,1],[1,0],[0,-1],[-1,0]];
var keyToDir = {65:[0,-1],83:[1,0],68:[0,1],87:[-1,0]};

level1();

function level1() {
    player = new Block(0,0,[1,0],"player_1");
    blocks = [
        new Block(3,2,[1,0],"block_1"),
        new Block(3,4,[1,0],"block_1"),
        new Block(3,6,[0,1],"block_1"),
        new Block(2,5,[-1,0],"block_1"),
        new Block(5,5,[0,-1],"block_1")
    ];
    walls = [
        new Wall(6,0,"wall")
    ];
    exitTiles = [[6,1],[5,1],[5,0],[7,0],[7,1]];
}

function Wall(x,y,img) {
    this.x = x;
    this.y = y;
    this.img = "art/" + img + ".png";
}

function Block(x,y,slime,img) {
    this.x = x;
    this.y = y;
    this.blocks = [];
    this.slime = slime;
    this.class = "";
    if (img == "block_1") {
        if (compare(slime,[0,-1]))
            this.class = "top";
        else if (compare(slime,[-1,0]))
            this.class = "left";
        else if (compare(slime, [0,1]))
            this.class = "bottom";
    }
    this.img = "art/" + img + ".png";

    this.move = function (given) {
        this.x += given[1];
        this.y += given[0];
    }

    this.blockStick = function() {
        for (var i = 0; i < blocks.length; i++)
            if (this.x + this.slime[0] == blocks[i].x && this.y + this.slime[1] == blocks[i].y || 
               this.x == blocks[i].x + blocks[i].slime[0] && this.y == blocks[i].y + blocks[i].slime[1]) {
                this.blocks.push(blocks[i]);
                blocks.splice(i, 1);
                return;
            }
    }

    this.onBoard = function(x,y) {
        for (var i = 0; i < this.blocks.length; i++)
            if (!this.blocks[i].onBoard(x,y))
                return false;
        return onBoard(this.x + x,this.y + y);
    }

    this.blockCollide = function(x,y) {
        for (var i = 0; i < blocks.length; i++)
            if (this.x + x == blocks[i].x && this.y + y == blocks[i].y)
                return true;
        for (var i = 0; i < walls.length; i++)
            if (this.x + x == walls[i].x && this.y + y == walls[i].y)
                return true;
        for (var i = 0; i < this.blocks.length; i++)
            if(this.blocks[i].blockCollide(x,y))
                return true;
        return false;
    } 

    this.showBlock = function() {
        document.getElementById(this.y + ',' + this.x).innerHTML += '<img class="block ' + this.class + '" src=' + this.img + '>';
        for (var i = 0; i < this.blocks.length; i++)
            this.blocks[i].showBlock();
    }
}

function keyResponse(event) {
    if (event.keyCode in keyToDir) {
        direction = keyToDir[event.keyCode];
        x = direction[1];
        y = direction[0];
        if (!player.blockCollide(x,y) && player.onBoard(x,y)) {
            callOnPlayerBlocks("move",direction);
            callOnPlayerBlocks("blockStick");
            if (checkExit())
                setTimeout(function(){alert("You Win!")} , 50);
        }
    }
    else if (event.keyCode == 82)
        level1(); 
}

function onBoard(x,y) {
    if (x >= 0 && x < boardHeight && y >= 0 && y < boardWidth)
        return true;
    return false;
}

function checkExit() {
    var temp = exitTiles.slice();
    function elimTemp(given) {
        for (var i = 0; i < temp.length; i++)
            if (given.x == temp[i][0] && given.y == temp[i][1])
                temp.splice(i,1);
        for (var i = 0; i < given.blocks.length; i++)
            elimTemp(given.blocks[i]);
    }
    elimTemp(player);
    return temp.length == 0;
}

function callOnPlayerBlocks(funcName,val=0) {
    callOnBlocks(player,funcName,val);
}

function callOnBlocks(block,funcName,val) {
    block[funcName](val);
    for (var i = 0; i < block.blocks.length; i++)
        callOnBlocks(block.blocks[i], funcName, val);
}

var mainLoop = setInterval(function() {
    updateBoard();
}, 20);
function updateBoard() {
    var result = '';
    for (var i = 0; i < boardHeight; i++) {
        result += '<tr>';
        for (var j = 0; j < boardWidth; j++) {
            result += '<td id="' + i + ',' + j + '">';
            result += '<img src="art/grass.png">';
            result += '</td>';
        }
        result += '</tr>';
    }
    
    document.getElementById("board").innerHTML = result;
    for (var i = 0; i < blocks.length; i++) 
        document.getElementById(blocks[i].y + ',' + blocks[i].x).innerHTML += '<img class="block ' + blocks[i].class + '" src=' + blocks[i].img + '>';
    for (var i = 0; i < walls.length; i++) 
        document.getElementById(walls[i].y + ',' + walls[i].x).innerHTML += '<img class="block" src=' + walls[i].img + '>';
    for (var i = 0; i < exitTiles.length; i++) 
        document.getElementById(exitTiles[i][1] + ',' + exitTiles[i][0]).innerHTML += '<img class="exit" src="art/exit.png">';
    player.showBlock();
}

function compare (arr1,arr2) {
    if (arr1.length != arr2.length)
        return false;
    for (var i = 0; i < arr1.length; i++)
        if (arr1[i] != arr2[i])
            return false;
    return true;
}