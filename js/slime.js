document.addEventListener('keydown', keyResponse);

var boardWidth = 8;
var boardHeight = 8;
var blocks;
var walls;
var exitTiles;
var player;
var offsets = [[0,1],[1,0],[0,-1],[-1,0]];
var keyToDir = {65:[0,-1],37:[0,-1],83:[1,0],40:[1,0],68:[0,1],39:[0,1],87:[-1,0],38:[-1,0]}; // Maps a keypress code to a direction on the board
var currLevel = 0;
var levels = [level1,level2,level3,level4,complexStick,complexStick2,bomb1,bomb3,bomb2,piston1,piston2,piston3,pistonDeSync,movingParts];
var animationInterval;
var canMove = true;
levels[currLevel]();
setupBlocks();

function backgroundTile (x,y) {
    temp = (Math.abs(Math.pow(x,y) + Math.pow(y,x) + (3-x) * (3-y)))%4 + 1;
    return '<img src="art/grass_' + temp + '.png">';
}

function exitTile(y,x) {
    var addon = '';
    var dirMap = [];
    var direction = ''; // Direction the block should be rotated
    for(var i = 0; i < exitTiles.length; i++) {
        var xDiff = exitTiles[i][0] - x;
        var yDiff = exitTiles[i][1] - y;
        if (Math.abs(xDiff) + Math.abs(yDiff) == 1) {
            if (dirMap && dirMap[0] + xDiff == 0 && dirMap[1] + yDiff == 0) //If a tile on each side map to H block 
                addon = '_H';
            dirMap.push(xDiff);
            dirMap.push(yDiff);
        }
    }
    if (dirMap.length != 4)
        addon = '';
    for(var i = 2; i < dirMap.length; i++)
        dirMap[(i%2)] += dirMap[i]
    console.log(x,y,dirMap);
    if ((dirMap[1] == 1 && dirMap[0] + dirMap[1]) || (dirMap.length == 4 && dirMap[0] == 0 && dirMap[1] == 0 && dirMap[3]))
        direction = '';
    else if (dirMap[1] == -1 && dirMap[0] + dirMap[1])
        direction = 'up';
    else if (dirMap[0] == -1)
        direction = 'left';
    else
        direction = 'right';
    return '<img class="exit exit_' + direction + '" src="art/exit_' + dirMap.length/2 + addon +'.png">'
};

function blockKey(x,y) {
    return '' + x + ',' + y;
}

function hideTutorial(given) {
    setTimeout(function(){
        clearInterval(animationInterval);
        $('#' + given + '-tutorial').hide();
        canMove = true;
    }, 75);
}

function movementAnimationMaster() {
    $('#move-tutorial').css('display','inline-block');
    setTimeout(function() {
        moveAnimation();
        animationInterval = setInterval(function() {
            moveAnimation();
        }, 4000);
    },250);
}

function moveAnimation() {
    bounce('up-key','.');
    setTimeout(function() {$("#tutorial-player").css('transform','translateY(-2rem)');},350);
    setTimeout(function() {
        bounce('right-key','.');
        setTimeout(function() {$("#tutorial-player").css('transform','translate(5rem,-2rem)');},350);
        setTimeout(function() {
            bounce('down-key','.');
            setTimeout(function() {$("#tutorial-player").css('transform','translate(5rem,2rem)');},350);
            setTimeout(function() {
                bounce('left-key','.');
                setTimeout(function() {$("#tutorial-player").css('transform','translateY(2rem)');},350);
            },1000);
        },1000);
    },1000);
}

function bombAnimationMaster() {
    $('#bomb-tutorial').css('display','inline-block');
    setTimeout(function() {
        bombAnimation();
        animationInterval = setInterval(function() {
            bombAnimation();
        }, 2500);
    },500);
}

function bombAnimation() {
    bounce('bomb-tutorial-button');
    setTimeout(function() {
        fade('bomb-image');
        setTimeout(function() {
            $('#bomb-image').removeClass('transition-med');
            $('#bomb-image').css('opacity','1');
            setTimeout(function() {
                $('#bomb-image').addClass('transition-med');
            },500);
        },1500);
    },500);
}

function pistonAnimationMaster() {
    $('#piston-tutorial').css('display','inline-block');
    setTimeout(function() {
        pistonAnimation();
        animationInterval = setInterval(function() {
            pistonAnimation();
        },4000);
    },500);
}

function pistonAnimation() {
    bounce('piston-tutorial-button');
    setTimeout(function() {
        $('#piston-head-image').css('transform','translateX(0)');
        setTimeout(function() {
            bounce('piston-tutorial-button');
            setTimeout(function() {
                $('#piston-head-image').css('transform','translateX(-100%)');
            },500);
        },1500);
    },500);
}

function bounce(given, identifier='#') {
    $(identifier + given).css('transform','translateY(.25rem) scale(.98)');
    setTimeout(function(){
        $(identifier + given).css('transform','translateY(0)');
    },250);
}

function fade(given) {
    $('#' + given).css('opacity','0');
}

function setupBlocks() {
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
}

function Wall(x,y) {
    this.x = x;
    this.y = y;
    this.img = 'art/wall.png';
}

function keyResponse(event) {
    if (canMove) {
        if (event.keyCode in keyToDir || event.keyCode == 32 || event.keyCode == 16) {
            player.blockStick(); // Workaround for a bug where the player can't move into a block after sticking it, TODO replace
        }
        if (event.keyCode in keyToDir) {
            direction = keyToDir[event.keyCode];
            if (!player.blockCollide(direction) && player.onBoard(direction)) {
                player.move(direction);
            }
        }
        else if (event.keyCode == 82) {
            levels[currLevel]();
            setupBlocks();
        }
        else if (event.keyCode == 32)
            player.explode();
        else if (event.keyCode == 16) {
            player.toggle();
        }
        player.showBlock();  
        endLevel(); // Checks if player has beaten the level
    }
}

function coordOnBoard(x,y) {
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
            for (var i = 0; i < given.head.blocks.length; i++)
                elimTemp(given.head.blocks[i]);
    }
    for (var key in blocks)
        elimTemp(blocks[key]);
    elimTemp(player);
    return temp.length == 0;
}

function endLevel() {
    if (checkExit()) {
        canMove = false;
        document.getElementById("levelTransition").style.opacity = 1;
        setTimeout(function(){
            if (currLevel == levels.length - 1)
                alert("You win!");
            else {
                currLevel++;
                if (levels[currLevel] == bomb1) {
                    canMove = false;
                    bombAnimationMaster();
                }
                else if (levels[currLevel] == piston1) {
                    canMove = false;
                    pistonAnimationMaster();
                }
                levels[currLevel]();
                setupBlocks();
                document.getElementById("levelTransition").style.opacity = 0;
                setTimeout(function() {
                    canMove = true;
                },500);
            }
        } , 1000);
    }
}

function drawBoard() {
    var result = '';
    for (var i = 0; i < boardHeight; i++) {
        result += '<tr>';
        for (var j = 0; j < boardWidth; j++) {
            result += '<td id="' + i + ',' + j + '">';
            temp = backgroundTile(i,j)
            result += temp;
            result += '</td>';
        }
        result += '</tr>';
    }
    
    document.getElementById("board").innerHTML = result;
    for (key in blocks) {
        blocks[key].showBlock();
        if (blocks[key].head)
            blocks[key].head.showBlock();
    }
    for (key in walls)
        document.getElementById(walls[key].y + ',' + walls[key].x).innerHTML += '<img class="block" src=' + walls[key].img + '>';
    for (var i = 0; i < exitTiles.length; i++) 
        document.getElementById(exitTiles[i][1] + ',' + exitTiles[i][0]).innerHTML += exitTile(exitTiles[i][1],exitTiles[i][0]);
    player.showBlock();
}

function arrayCompare (array1, array2) { //array1 == array2 doesn't work the way you would hope, so this does that (checks if elements are same & same order, works for nested arrays)
    if (!array1 || !array2)
        return false;
    if (array1.length != array2.length)
        return false
    for (var i = 0; i < array1.length; i++) //for each element of the array
        if (Array.isArray(array1[i]) && Array.isArray(array2[i])) {
            if (!(arrayCompare(array1[i],array2[i]))) //if its a nested array recurse
                return false;
        }
        else if (!(array1[i] == array2[i])) //if they're not the same return false
            return false;
    return true;
}

function arrayNegate(array) {
    return array.map(function(x){return x*-1});
}
