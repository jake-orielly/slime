function Block(x,y,slime,img) {
    this.x = x;
    this.y = y;
    this.blocks = [];
    this.slime = slime;
    this.class = ["block"];
    if (slime.length == 1) { // Gives the block a CSS class that rotates the image correctly
        if (arrayCompare(slime,[[-1,0]]))
            this.class.push("top");
        else if (arrayCompare(slime,[[0,-1]]))
            this.class.push("left");
        else if (arrayCompare(slime,[[1,0]]))
            this.class.push("bottom");
    }
    else if (slime.length == 2) { // Same as above for two sides
        if (arrayCompare(slime,[[0,1],[-1,0]]))
            this.class.push("left");
        else if (arrayCompare(slime,[[0,1],[1,0]]))
            this.class.push("top");
        else if (arrayCompare(slime,[[0,-1],[-1,0]]))
            this.class.push("bottom");
    }
    this.img = "art/" + img + ".png";

    this.dirKey = function(dir) { // Returns a key for a position in the given direction away from this block
        return blockKey(this.x + dir[1], this.y + dir[0]);
    }

    this.move = function (given, excludes=0) { // Moves this block and its children in given direction, excludes given block and all its children
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
    }

    this.clear = function() { // Erases this block from the screen
        var temp = "";
        for (var i = 0; i < exitTiles.length; i++)
            if (arrayCompare([this.x,this.y],exitTiles[i]))
                temp = exitTile(this.y,this.x);
        document.getElementById(this.y + ',' + this.x).innerHTML = backgroundTile(this.y,this.x) + temp;
    }

    this.fade = function() { // Makes this block fade from view
        var curr = document.getElementById(this.y + ',' + this.x).childNodes;
        curr[curr.length-1].style.opacity = 0;
    }

    this.toggle = function(onlyChildren = false){ // Extends or retracts piston as appropriate, recurses to children, if onlyChildren, doesn't affect this block  
        if (this.head && !onlyChildren) {
            if (!this.extended)
                this.extend();
            else
                this.retract();
            this.head.toggle();
        }
        var curr;
        for (var i = 0; i < this.blocks.length; i++) {
            curr = this.blocks[i];
            currDir = arrayNegate(curr.slime[0]);
            if (curr.head && // If curr is a piston and 
                (curr.dirKey(curr.slime[0]) == player.dirKey([0,0]) || // The the position in the direction of its slime is the player's position 
                curr.dirKey(curr.slime[0]) == this.dirKey([0,0]))) { // Or is the position of a block
                if (curr.onBoard(currDir) && !curr.blockCollide(currDir))  // Then that piston is attached head first and should inverse extend if it can
                    curr.inverseExtend();
                else if (player.onBoard(curr.slime[0]) && !player.blockCollide(curr.slime[0])) // Or else inverse reverse extend (I know, it's confusing terminology)
                    curr.inverseReverse();
                curr.toggle(true);
            }
            else
                curr.toggle();
        }
    }

    this.extend = function() { // Extends piston head
        var tempClass;
        if (this.head.onBoard(this.slime[0]) && !this.blockCollide(this.slime[0]) && !this.head.blockCollide(this.slime[0])) { // If the head will be on board and nothing will collide, then extend
            this.head.move(this.slime[0]);
            this.extended = true;
        }
        else if (player.onBoard(arrayNegate(this.slime[0])) && !player.blockCollide(arrayNegate(this.slime[0]))) { // If this can reverse and not go off board or collide, do that
            player.move(arrayNegate(this.slime[0]),this.head); // Reverse extend, aka move everything but this block and its children
            this.extended = true;
        }
        if (this.extended)
            this.extensionVisual();
    }

    this.inverseExtend = function() { // When the piston is attached head first we want to extend backwards
        this.move(arrayNegate(this.slime[0]),this.head); // Move this backwards but not it's head and it's heads children
        for (var i = 0; i < this.head.blocks.length; i++) // Move the heads children (since we skipped them in order to leave head in place)
            this.head.blocks[i].move(arrayNegate(this.slime[0]));
        this.extended = 'inverse';
        this.extensionVisual();
        this.head.toggle(); // Toggle head so it's children still get toggled
    }

    this.inverseReverse = function() { // When the piston is attached head first and can't extend backwards, push everything else forwards
        player.move(this.slime[0],this); // Move everything except this and its children
        this.head.move(this.slime[0]);
        this.extensionVisual();
        this.extended = 'inverse';
        player.showBlock();
    }

    this.extensionVisual = function() { // Handles some visual aspects of extension
        this.class[1] ? tempClass = this.class[1] : tempClass = ""; // Temp holds the orientation class
        this.head.class.push ('piston_head' + '_' + tempClass + '_extended'); // Gives it the correctly oriented class
    }

    this.retract = function() { // Retracts piston head
        var tempDir = arrayNegate(this.slime[0]); // Hold onto the reverse direction, we'll need it
        if (this.extended == 'inverse'){
            if (this.head && this.onBoard(this.slime[0]) && !this.blockCollide(this.slime[0])) { // If this can move in slime[0] direction without issue
                this.move(this.slime[0],this.head); // Move all but head and its children 
                for (var i = 0; i < this.head.blocks.length; i++) // Then move the head's children, effectively leaving head in place
                    this.head.blocks[i].move((this.slime[0]));
                this.extended = false;
            }
        }
        else if (this.head.onBoard(tempDir) && !this.blockCollide(tempDir)) { // If not inverse extended and we can retract in the reverse direction of our extension
            this.head.move(tempDir); // Move this and it's children in the reverse of the direction it extends 
            this.extended = false;
        }
        else if (player.onBoard(this.slime[0],this) && !player.blockCollide(this.slime[0],this)) { // If this piston can pull the player in to retract
            player.move(this.slime[0],this.head);
            this.extended = false;
        }
        if (!this.extended) { // If we retracted
            if (this.head) {
                this.head.class = this.head.class.slice(0, this.head.class.length-1); // Remove the special class that makes an extended head display correctly
                this.head.clear();
            }
            this.showBlock();
        }
    }

    this.blockStick = function() { // Sticks blocks to other blocks and recurses to it's children
        var currKey, blockPos;
        for (var i = 0; i < this.slime.length; i++) {
            currKey = this.dirKey(this.slime[i]); // this blocks position + this blocks slime direction
            if(blocks[currKey]) // if it's a blocks position
                this.doStick(currKey);
        }
        for (key in blocks) {
            var curr = blocks[key];
            for (var i = 0; i < curr.slime.length; i++) {
                currKey = curr.dirKey(curr.slime[i]); // Get a key for the pos that equals this blocks position plus its slime direction
                if (this.dirKey([0,0]) == currKey) // If this blocks position as a dir key equals the currKey
                    this.doStick(key);
            }
        }
        for (var i = 0; i < this.blocks.length; i++)
            this.blocks[i].blockStick();
        if (this.head)
            this.head.blockStick();
    }

    this.doStick = function(key) { // Actually does the physical act of sticking 
        this.head && this.head.dirKey(this.slime[0]) == key ? target = this.head : target = this; // if this block has a head that's what block[key] will stick to
        target.blocks.push(blocks[key]); // Stick them to this block
        delete blocks[key]; // Remove that block from the list of free blocks
        target.blockStick(); 
    }

    this.onBoard = function(direction,excludes=0) { // Checks if moveing in direction would send this block or its children off the board
        x = direction[1];
        y = direction[0];
        for (var i = 0; i < this.blocks.length; i++)
            if (this.blocks[i] != excludes && !this.blocks[i].onBoard(direction)) // If any of this blocks children would go off
                return false;
        if (this.head && !this.head.onBoard(direction,excludes))
            return false;
        return coordOnBoard(this.x + x,this.y + y); // Checks if 2 coordinates are within board bounds
    }

    this.blockCollide = function(direction, excludes = 0) { // Checks whether this block or its children will collide with anything
        x = direction[1];
        y = direction[0];
        if (blocks[this.dirKey(direction)] || walls[this.dirKey(direction)]) // If this blocks position + move direction == any free block's position 
            return true;
        for (var i = 0; i < this.blocks.length; i++) 
            if(this.blocks[i] != excludes && this.blocks[i].blockCollide(direction,excludes)) // If any of this blocks children collide
                return true;
        if (this.head)
            if (this.head.blockCollide(direction,excludes))
                return true
        return false;
    } 

    this.showBlock = function() { // Makes block and its children display on the board
        if (this.class.indexOf('piston_head') == -1) // If this isn't a piston head (that would clear this piston as well)
            this.clear();
        document.getElementById(this.y + ',' + this.x).innerHTML += '<img class="' + this.class.join(" ") + '" src=' + this.img + '>';
        if (this.head)
            this.head.showBlock();
        for (var i = 0; i < this.blocks.length; i++)
            this.blocks[i].showBlock();
    }

    this.explode = function() { // Triggered by bomb block, destroys all attached bombs, and removes their children
        for (var i = 0; i < this.blocks.length; i++)
            if (this.blocks[i].img == 'art/bomb_block_1.png') { // If this child is a bomb block
                for (var j = 0; j < this.blocks[i].blocks.length; j++)
                    this.blocks[i].blocks[j].remove(); // Remove the bombs children
                this.blocks[i].fade();
                this.blocks.splice(i,1);
            }
            else
                this.blocks[i].explode();
        if(this.head)
            this.head.explode();
    }

    this.remove = function() { // Add this and it's children to list of free blocks
        if (this.extended) {
            this.extended = true; // In case this.extended == reverse before
            this.retract();
        }
        blocks[blockKey(this.x,this.y)] = this; 
        for (var i = 0; i < this.blocks.length; i++)
            this.blocks[i].remove();
        this.blocks = [];
    }
}

function piston(x,y,slime) { // Creates a new piston
    var piston = new Block(x,y,slime,'piston_block_1');
    piston.head = new Block(x,y,slime,'piston_head');
    piston.head.class.push('piston_head');
    piston.extended = false;
    return piston;
}