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
var currLevel = complexStick;
//var currLevel = movingParts;
//var currLevel = slimex2;

currLevel();

function blockKey(x,y) {
    return "" + x + "," + y;
}

var temp = {};
var key;
for (var i = 0; i < blocks.length; i++) {
    key = blockKey(blocks[i].x,blocks[i].y);
    temp[key] = blocks[i];
}
blocks = temp;
temp = {};
for (var i = 0; i < walls.length; i++) {
    key = blockKey(walls[i].x,walls[i].y);
    temp[key] = walls[i];
}
walls = temp;


function piston(x,y,slime) {
    var piston = new Block(x,y,slime,"piston_block_1");
    piston.head = new Block(x,y,slime,"piston_head");
    piston.head.class.push("piston_head");
    piston.extended = false;
    return piston;
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
    this.class = ["block"];
    if (compare(slime,[-1,0]))
        this.class.push("top");
    else if (compare(slime,[0,-1]))
        this.class.push("left");
    else if (compare(slime, [1,0]))
        this.class.push("bottom");
    this.img = "art/" + img + ".png";

    this.dirKey = function(dir) {
        return blockKey(this.x + dir[1], this.y + dir[0]);
    }

    this.move = function (given, excludes=0) { // Moves the block in given direction
        this.clear();
        this.blockStick();
        this.x += given[1];
        this.y += given[0];
        for (var i = 0; i < this.blocks.length; i++)
            if (this.blocks[i] != excludes)
                this.blocks[i].move(given,excludes);
        if (this.head && this.head != excludes) {
            this.head.move(given,excludes);
        }
        else if (this.head)
            this.head.showBlock();
        this.showBlock();
    }

    this.clear = function() {
        var temp = "";
        for (var i = 0; i < exitTiles.length; i++)
            if (compare([this.x,this.y],exitTiles[i]))
                temp = exitTile;
        document.getElementById(this.y + ',' + this.x).innerHTML = backgroundTile + temp;
    }

    this.toggle = function(){
        if (this.head) {
            if (!this.extended)
                this.extend();
            else
                this.retract();
            for (var i = 0; i < this.head.blocks.length; i++)
                this.head.blocks[i].toggle();
        }
        for (var i = 0; i < this.blocks.length; i++)
            this.blocks[i].toggle();
        this.showBlock();
    }

    this.extend = function() { // Extends piston head in given direction
        if (this.head.onBoard(this.slime) && !this.blockCollide(this.slime)) {
            this.head.move(this.slime);
            this.extended = true;
            if (checkExit())
                setTimeout(function(){alert("You Win!")} , 50);
        }
        //If all blocks except this and it's children could move the opposite direction
        else if (player.onBoard(arrayNegate(this.slime),this) && !player.blockCollide(arrayNegate(this.slime),this)) {
            player.move(arrayNegate(this.slime),this.head);
            this.extended = true;
            if (checkExit())
                setTimeout(function(){alert("You Win!")} , 50);
        }
        this.showBlock();
    }

    this.retract = function() { // Retracts piston head
        var tempDir = arrayNegate(this.slime);
        if (this.head.onBoard(tempDir) && !this.blockCollide(tempDir)) {
            this.clear();
            if (this.head)
                this.head.move(arrayNegate(this.slime));
            this.head.showBlock();
            this.extended = false;
            if (checkExit())
                setTimeout(function(){alert("You Win!")} , 50);
        }
        else if (player.onBoard(this.slime,this) && !player.blockCollide(this.slime,this)) {
            player.move(this.slime,this.head);
            this.extended = false;
            if (checkExit())
                setTimeout(function(){alert("You Win!")} , 50);
        }
        this.showBlock();
    }

    this.blockStick = function() { // Sticks blocks to other blocks
        var currKey = this.dirKey(this.slime);
        var blockPos;
        // if our position + our slime direction is a block's position
        if(blocks[currKey])
            this.doStick(currKey);
        for (key in blocks) {
            currKey = blocks[key].dirKey(blocks[key].slime);
            blockPos = currKey.split(',').map(function(x){return parseInt(x)});
            if (blockPos[0] == this.x && blockPos[1] == this.y)
                this.doStick(key);
        }
        for (var i = 0; i < this.blocks.length; i++)
            this.blocks[i].blockStick();
        if (this.head)
            this.head.blockStick();
    }

    this.doStick = function(key) {
        this.head ? next = this.head : next = this; // if this block has a head that's what block[key] will stick to
        next.blocks.push(blocks[key]); // stick them to this block
        delete blocks[key];
        next.blockStick();
    }

    this.onBoard = function(direction,excludes=0) { // checks if move would send us off the board
        x = direction[1];
        y = direction[0];
        for (var i = 0; i < this.blocks.length; i++) // if any of this block's children are on the board return false
            if (this.blocks[i] != excludes && !this.blocks[i].onBoard(direction))
                return false;
        if (this.head && !this.head.onBoard(direction,excludes))
            return false;
        return onBoard(this.x + x,this.y + y); // return whether this block is on the board
    }

    this.blockCollide = function(direction, excludes = 0) {
        x = direction[1];
        y = direction[0];
        if (blocks[this.dirKey(direction)] || walls[this.dirKey(direction)]) // if this blocks position + move direction == any free block's position 
            return true;
        for (var i = 0; i < this.blocks.length; i++) // if any of this blocks children collide in the above checks
            if(this.blocks[i] != excludes && this.blocks[i].blockCollide(direction,excludes))
                return true;
        if (this.head)
            if (this.head.blockCollide(direction,excludes))
                return true
        return false;
    } 

    this.showBlock = function() { // makes block display on the board
        document.getElementById(this.y + ',' + this.x).innerHTML += '<img class="' + this.class.join(" ") + '" src=' + this.img + '>';
    }

    this.explode = function() {
        for (var i = 0; i < this.blocks.length; i++)
            if (this.blocks[i].img == 'art/bomb_block_1.png') {
                for (var j = 0; j < this.blocks[i].blocks.length; j++)
                    this.blocks[i].blocks[j].destroy();
                this.blocks[i].clear();
                this.blocks.splice(i,1);
            }
            else
                this.blocks[i].explode();
        if(this.head)
            this.head.explode();
    }

    this.destroy = function() {
        if (this.extended)
            this.retract();
        blocks[blockKey(this.x,this.y)] = this;
        for (var i = 0; i < this.blocks.length; i++)
            this.blocks[i].destroy();
        this.blocks = [];
    }
}

function keyResponse(event) {
    if (event.keyCode in keyToDir) {
        direction = keyToDir[event.keyCode];
        player.blockStick(); // Workaround for a bug where the player can't move into a block after sticking it, TODO replace
        if (!player.blockCollide(direction) && player.onBoard(direction)) {
            player.move(direction);
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
        player.toggle();
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
        if (given.head)
            elimTemp(given.head);
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
    for (key in blocks)
        blocks[key].showBlock();
    for (key in walls)
        document.getElementById(walls[key].y + ',' + walls[key].x).innerHTML += '<img class="block" src=' + walls[key].img + '>';
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

function arrayNegate(array) {
    return array.map(function(x){return x*-1});
}