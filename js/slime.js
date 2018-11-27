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

experimental();

function level1() {
    player = new Block(0,0,[1,0],"player_1");
    player.extended = false;
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
    drawBoard();
}

function experimental() {
    player = new Block(0,0,[1,0],"player_1");
    blocks = [
        new Block(3,2,[1,0],"block_1"),
        new Block(3,4,[1,0],"bomb_block_1"),
        new Block(2,5,[-1,0],"block_1"),
        new Block(5,5,[0,-1],"block_1")
    ];
    var piston = new Block(3,6,[1,0],"piston_block_1");
    piston.head = new Block(3,6,[1,0],"piston_head");
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
    if (compare(slime,[0,-1]))
        this.class = "top";
    else if (compare(slime,[-1,0]))
        this.class = "left";
    else if (compare(slime, [0,1]))
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
        
        if (this.head) {
            this.head.move(given);
            this.head.showBlock();
        }
    }

    this.extend = function() { // Extends piston head in given direction
        if (this.head) {
            this.head.x += this.slime[0];
            this.head.y += this.slime[1];
            this.head.showBlock();
        }
        for (var i = 0; i < this.blocks.length; i++)
            this.blocks[i].extend();
    }

    this.retract = function() { // Retracts piston head
        if (this.head) {
            var temp = "";
            for (var i = 0; i < exitTiles.length; i++)
                if (compare([this.head.x,this.head.y],exitTiles[i]))
                    temp = exitTile;
            document.getElementById(this.head.y + ',' + this.head.x).innerHTML = backgroundTile + temp;
            this.head.x += this.slime[0] * -1;
            this.head.y += this.slime[1] * -1;
            this.head.showBlock();
        }
        for (var i = 0; i < this.blocks.length; i++)
            this.blocks[i].retract();
    }

    this.blockStick = function() { // Sticks blocks to other blocks
        for (var i = 0; i < blocks.length; i++) // Check every free block
            // if our position + our slime direction is their position
            if (this.x + this.slime[0] == blocks[i].x && this.y + this.slime[1] == blocks[i].y || 
               // or their position + their slime direction is our position
               this.x == blocks[i].x + blocks[i].slime[0] && this.y == blocks[i].y + blocks[i].slime[1]) {
                this.blocks.push(blocks[i]); // stick them to this block
                blocks.splice(i, 1); // remove the stuck block from the list of free blocks
                return;
            }
    }

    this.onBoard = function(x,y) { // checks if move would send us off the board
        for (var i = 0; i < this.blocks.length; i++) // if any of this block's children are on the board return false
            if (!this.blocks[i].onBoard(x,y))
                return false;
        return onBoard(this.x + x,this.y + y); // return whether this block is on the board
    }

    this.blockCollide = function(x,y) {
        for (var i = 0; i < blocks.length; i++) // if this blocks position + move direction == any free block's position there's a collision
            if (this.x + x == blocks[i].x && this.y + y == blocks[i].y)
                return true;
        for (var i = 0; i < walls.length; i++) // if this blocks position + move direction == any wall's position there's a collision
            if (this.x + x == walls[i].x && this.y + y == walls[i].y)
                return true;
        for (var i = 0; i < this.blocks.length; i++) // if any of this blocks children collide in the above checks
            if(this.blocks[i].blockCollide(x,y))
                return true;
        return false;
    } 

    this.showBlock = function() { // makes all blocks display on the board
        document.getElementById(this.y + ',' + this.x).innerHTML += '<img class="block ' + this.class + '" src=' + this.img + '>';
        for (var i = 0; i < this.blocks.length; i++)
            this.blocks[i].showBlock();
    }

    this.explode = function() {
        for (var i = 0; i < this.blocks.length; i++)
            if (this.blocks[i].img == 'art/bomb_block_1.png') {
                for (var j = 0; j < this.blocks[i].blocks.length; j++)
                    this.blocks[i].blocks[j].destroy();
                this.blocks[i].move(0,0); // Redraw block aka remove visual representation
                this.blocks.splice(i,1);
            }
            else
                this.blocks[i].explode();
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
        x = direction[1];
        y = direction[0];
        if (!player.blockCollide(x,y) && player.onBoard(x,y)) {
            callOnPlayerBlocks("move",direction); // move all player blocks
            callOnPlayerBlocks("blockStick"); // and stick them
            player.showBlock();
            if (checkExit())
                setTimeout(function(){alert("You Win!")} , 50);
        }
    }
    else if (event.keyCode == 82)
        level1(); 
    else if (event.keyCode == 32)
        player.explode();
    else if (event.keyCode == 16)
        if (!player.extended) {
            player.extend();
            player.extended = true;
        }
        else {
            player.retract();
            player.extended = false;
        }
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

function callOnPlayerBlocks(funcName,val=0) {
    callOnBlocks(player,funcName,val);
}

function callOnBlocks(block,funcName,val) { // call the given method on this block and all its children
    block[funcName](val);
    for (var i = 0; i < block.blocks.length; i++)
        callOnBlocks(block.blocks[i], funcName, val);
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