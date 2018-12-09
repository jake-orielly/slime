function Block(x,y,slime,img) {
    this.x = x;
    this.y = y;
    this.blocks = [];
    this.slime = slime;
    this.class = ["block"];
    if (slime.length == 1) {
        if (arrayCompare(slime,[[-1,0]]))
            this.class.push("top");
        else if (arrayCompare(slime,[[0,-1]]))
            this.class.push("left");
        else if (arrayCompare(slime,[[1,0]]))
            this.class.push("bottom");
    }
    else if (slime.length == 2) {
        if (arrayCompare(slime,[[0,1],[-1,0]]))
            this.class.push("left");
        else if (arrayCompare(slime,[[0,1],[1,0]]))
            this.class.push("top");
        else if (arrayCompare(slime,[[0,-1],[-1,0]]))
            this.class.push("bottom");
    }
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
            if (arrayCompare([this.x,this.y],exitTiles[i]))
                temp = exitTile;
        document.getElementById(this.y + ',' + this.x).innerHTML = backgroundTile + temp;
    }

    this.fade = function() {
        var curr = document.getElementById(this.y + ',' + this.x).childNodes;
        curr[curr.length-1].style.opacity = 0;
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
            if (this.dirKey([0,0]) == this.blocks[i].dirKey(this.blocks[i].slime[0]))
                this.blocks[i].inverseExtend();
            else
                this.blocks[i].toggle();
        this.showBlock();
    }
    //this.dirKey([0,0]) == this.head.blocks[0].dirKey(this.blocks[0].slime[0])) 
    this.extend = function() { // Extends piston head in given direction
        if (this.head.onBoard(this.slime[0]) && !this.blockCollide(this.slime[0]) && !this.head.blockCollide(this.slime[0])) {
            this.head.move(this.slime[0]);
            this.extended = true;
        }
        //If all blocks except this and it's children could move the opposite direction
        else if (player.onBoard(arrayNegate(this.slime[0]),this) && !player.blockCollide(arrayNegate(this.slime[0]),this)) {
            player.move(arrayNegate(this.slime[0]),this.head);
            this.extended = true;
        }
        endLevel();
        this.showBlock();
    }

    this.inverseExtend = function() {
        /*((this.x + this.slime[0][1] == player.x && this.y + this.slime[0][0] == player.y) || blocks[this.dirKey(this.slime[0])]) &&
            this.onBoard(arrayNegate(this.slime[0])) && !this.blockCollide(arrayNegate(this.slime[0]))*/
        this.move(arrayNegate(this.slime[0]),this.head);
        for (var i = 0; i < this.head.blocks.length; i++)
            this.head.blocks[i].move(arrayNegate(this.slime[0]));
        this.extended = 'inverse';
        this.head.toggle();
    }

    this.retract = function() { // Retracts piston head
        var tempDir = arrayNegate(this.slime[0]);
        var pushedDir = [this.head.x + this.slime[0][1],this.head.y + this.slime[0][0]];
        if (this.extended == 'inverse'){
            this.clear();
            if (this.head) {
                this.move(this.slime[0],this.head);
                for (var i = 0; i < this.head.blocks.length; i++)
                    this.head.blocks[i].move((this.slime[0]));
            }
            this.showBlock();
            this.extended = false;
            endLevel();
        }
        else if (this.head.onBoard(tempDir) && !this.blockCollide(tempDir)) {
            this.clear();
            if (this.head)
                this.head.move(arrayNegate(this.slime[0]));
            this.head.showBlock();
            this.extended = false;
            endLevel();
        }
        else if (player.onBoard(this.slime[0],this) && !player.blockCollide(this.slime[0],this)) {
            player.move(this.slime[0],this.head);
            this.extended = false;
            endLevel();
        }
        this.showBlock();
    }

    this.blockStick = function() { // Sticks blocks to other blocks
        var currKey, blockPos;
        // if our position + our slime direction is a block's position
        for (var i = 0; i < this.slime.length; i++) {
            currKey = this.dirKey(this.slime[i]);
            if(blocks[currKey])
                this.doStick(currKey);
        }
        for (key in blocks) {
            for (var i = 0; i < blocks[key].slime.length; i++) {
                currKey = blocks[key].dirKey(blocks[key].slime[i]);
                blockPos = currKey.split(',').map(function(x){return parseInt(x)});
                if (blockPos[0] == this.x && blockPos[1] == this.y)
                    this.doStick(key);
            }
        }
        for (var i = 0; i < this.blocks.length; i++)
            this.blocks[i].blockStick();
        if (this.head)
            this.head.blockStick();
    }

    this.doStick = function(key) {
        this.head && this.head.dirKey(this.slime[0]) == key ? next = this.head : next = this; // if this block has a head that's what block[key] will stick to
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
                this.blocks[i].fade();
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