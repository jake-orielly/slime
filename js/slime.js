document.addEventListener('keydown', keyResponse);

var boardWidth = 8;
var boardHeight = 8;
var blocks;
var walls;
var exitTiles;
var player;
var offsets = [[0,1],[1,0],[0,-1],[-1,0]];
var keyToDir = {65:[0,-1],83:[1,0],68:[0,1],87:[-1,0]}; // Maps a keypress code to a direction on the board
var backgroundTile = '<img src="art/grass.png">';
var exitTile = '<img class="exit" src="art/exit.png">';
var currLevel = experimental;

currLevel();

function level1() {
    player = new Block(0,0,[0,1],"player_1");
    blocks = [
        new Block(3,2,[0,1],"block_1"),
        new Block(3,4,[0,1],"block_1"),
        new Block(3,6,[1,0],"block_1"),
        new Block(2,5,[0,-1],"block_1"),
        new Block(5,5,[-1,0],"block_1")
    ];
    walls = [
        new Wall(6,0,"wall")
    ];
    exitTiles = [[6,1],[5,1],[5,0],[7,0],[7,1]];
    drawBoard();
}

function experimental() {
    player = new Block(4,0,[0,1],"player_1");
    player.extended = false;
    blocks = [
        new Block(3,2,[0,1],"block_1"),
        new Block(3,4,[0,1],"bomb_block_1"),
        new Block(2,5,[0,-1],"block_1"),
        new Block(5,5,[-1,0],"block_1")
    ];
    var piston = new Block(2,0,[0,1],"piston_block_1");
    piston.head = new Block(2,0,[0,1],"piston_head");
    piston.head.class += "piston_head";
    blocks.push(piston);
    walls = [
        new Wall(6,0,"wall")
    ];
    exitTiles = [[6,1],[5,1],[5,0],[7,0],[7,1]];
    drawBoard();
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
    if (compare(slime,[-1,0]))
        this.class = "top";
    else if (compare(slime,[0,-1]))
        this.class = "left";
    else if (compare(slime, [1,0]))
        this.class = "bottom";
    this.img = "art/" + img + ".png";

    this.move = function (given) { // Moves the block in given direction
        var temp = "";
        for (var i = 0; i < exitTiles.length; i++)
            if (compare([this.x,this.y],exitTiles[i]))
                temp = exitTile;
        document.getElementById(this.y + ',' + this.x).innerHTML = backgroundTile + temp;
        this.x += given[1];
        this.y += given[0];
        for (var i = 0; i < this.blocks.length; i++)
            this.blocks[i].move(given);
        if (this.head) {
            this.head.move(given);
            this.head.showBlock();
        }
    }

    this.extend = function() { // Extends piston head in given direction
        if (this.head) {
            this.head.move(this.slime);
            this.head.blockStick();
            player.extended = true;
        }
        for (var i = 0; i < this.blocks.length; i++)
            this.blocks[i].extend();
        player.showBlock();
    }

    this.retract = function() { // Retracts piston head
        if (this.head) {
            var temp = "";
            for (var i = 0; i < exitTiles.length; i++)
                if (compare([this.head.x,this.head.y],exitTiles[i]))
                    temp = exitTile;
            document.getElementById(this.head.y + ',' + this.head.x).innerHTML = backgroundTile + temp;
            if (this.head)
                this.head.move([this.slime[0]*-1,this.slime[1]*-1]);
            this.head.showBlock();
            player.extended = false;
        }
        for (var i = 0; i < this.blocks.length; i++)
            this.blocks[i].retract();
    }

    this.blockStick = function() { // Sticks blocks to other blocks
        for (var i = 0; i < blocks.length; i++) // Check every free block
            // if our position + our slime direction is their position
            if (this.x + this.slime[1] == blocks[i].x && this.y + this.slime[0] == blocks[i].y || 
               // or their position + their slime direction is our position
               this.x == blocks[i].x + blocks[i].slime[1] && this.y == blocks[i].y + blocks[i].slime[0]) {
                if (!this.head)
                    this.blocks.push(blocks[i]); // stick them to this block
                else
                    this.head.blocks.push(blocks[i]);
                blocks.splice(i, 1); // remove the stuck block from the list of free blocks
                return;
            }
        for (var i = 0; i < this.blocks.length; i++)
            this.blocks[i].blockStick();
        if (this.head)
            this.head.blockStick();
    }

    this.onBoard = function(direction) { // checks if move would send us off the board
        x = direction[1];
        y = direction[0];
        for (var i = 0; i < this.blocks.length; i++) // if any of this block's children are on the board return false
            if (!this.blocks[i].onBoard(direction))
                return false;
        return onBoard(this.x + x,this.y + y); // return whether this block is on the board
    }

    this.blockCollide = function(direction) {
        x = direction[1];
        y = direction[0];
        for (var i = 0; i < blocks.length; i++) // if this blocks position + move direction == any free block's position there's a collision
            if (this.x + x == blocks[i].x && this.y + y == blocks[i].y)
                return true;
        for (var i = 0; i < walls.length; i++) // if this blocks position + move direction == any wall's position there's a collision
            if (this.x + x == walls[i].x && this.y + y == walls[i].y)
                return true;
        for (var i = 0; i < this.blocks.length; i++) // if any of this blocks children collide in the above checks
            if(this.blocks[i].blockCollide(direction))
                return true;
        return false;
    } 

    this.showBlock = function() { // makes all blocks display on the board
        document.getElementById(this.y + ',' + this.x).innerHTML += '<img class="block ' + this.class + '" src=' + this.img + '>';
        for (var i = 0; i < this.blocks.length; i++)
            this.blocks[i].showBlock();
        if (this.head)
            this.head.showBlock();
    }

    this.explode = function() {
        for (var i = 0; i < this.blocks.length; i++)
            if (this.blocks[i].img == 'art/bomb_block_1.png') {
                for (var j = 0; j < this.blocks[i].blocks.length; j++)
                    this.blocks[i].blocks[j].destroy();
                this.blocks[i].move([0,0]); // Redraw block aka remove visual representation
                this.blocks.splice(i,1);
            }
            else
                this.blocks[i].explode();
        for (var i = 0; i < blocks.length; i++)
            blocks[i].showBlock();
    }

    this.destroy = function() {
        blocks.push(this);
        for (var i = 0; i < this.blocks.length; i++)
            this.blocks[i].destroy();
        this.blocks = [];
    }
}

function keyResponse(event) {
    if (event.keyCode in keyToDir) {
        direction = keyToDir[event.keyCode];
        if (!player.blockCollide(direction) && player.onBoard(direction)) {
            player.move(direction);
            player.blockStick();
            player.showBlock();
            if (checkExit())
                setTimeout(function(){alert("You Win!")} , 50);
        }
    }
    else if (event.keyCode == 82)
        currLevel(); 
    else if (event.keyCode == 32)
        player.explode();
    else if (event.keyCode == 16)
        if (!player.extended)
            player.extend();
        else
            player.retract();
}

function onBoard(x,y) {
    if (x >= 0 && x < boardHeight && y >= 0 && y < boardWidth)
        return true;
    return false;
}

function checkExit() {
    var temp = exitTiles.slice(); // temp is a copy of exit tiles 
    function elimTemp(given) {
        for (var i = 0; i < temp.length; i++) // if this block is on any of temp's tiles remove it from the list
            if (given.x == temp[i][0] && given.y == temp[i][1])
                temp.splice(i,1);
        for (var i = 0; i < given.blocks.length; i++) // check this blocks children as well
            elimTemp(given.blocks[i]);
    }
    elimTemp(player);
    return temp.length == 0;
}

function drawBoard() {
    var result = '';
    for (var i = 0; i < boardHeight; i++) {
        result += '<tr>';
        for (var j = 0; j < boardWidth; j++) {
            result += '<td id="' + i + ',' + j + '">';
            result += backgroundTile;
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
        document.getElementById(exitTiles[i][1] + ',' + exitTiles[i][0]).innerHTML += exitTile;
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