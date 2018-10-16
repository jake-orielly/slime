document.addEventListener('keydown', keyResponse);

var boardWidth = 8;
var boardHeight = 8;
var blocks = [
    new Block(3,2,[1,0],"block_1"),
    new Block(3,4,[1,0],"block_1"),
    new Block(3,6,[0,1],"block_1"),
    new Block(2,5,[-1,0],"block_1"),
    new Block(5,5,[0,-1],"block_1")
];
var playerBlocks = [];
var offsets = [[0,1],[1,0],[0,-1],[-1,0]];
var exitTiles = [[4,4],[3,4],[5,4],[5,5]];

var player = new Block(0,0,[1,0],"player_1");

function Block(x,y,slime,img) {
    this.x = x;
    this.y = y;
    this.slime = slime;
    this.class = "";
    if (img == "block_1") {
        console.log(slime == [0,-1]);
        if (compare(slime,[0,-1]))
            this.class = "top";
        else if (compare(slime,[-1,0]))
            this.class = "left";
        else if (compare(slime, [0,1]))
            this.class = "bottom";
    }
    this.img = "art/" + img + ".png";
}

function keyResponse(event) {
        if (event.keyCode == 65)
            movePlayer(0,-1);
        else if (event.keyCode == 83)
            movePlayer(1,0);
        else if (event.keyCode == 68)
            movePlayer(0,1);
        else if (event.keyCode == 87)
            movePlayer(-1,0);
}

function movePlayer(y,x) {
    if (onBoard(player.x + x, player.y + y) && !blockCollide(x,y) && allOnBoard(x,y)) {
        player.x += x;
        player.y += y;
        for (var i = 0; i < playerBlocks.length; i++) {
            playerBlocks[i].x += x;
            playerBlocks[i].y += y;
        }
        blockStick(player);
        for (var i = 0; i < playerBlocks.length; i++)
            blockStick(playerBlocks[i]);
        if (checkExit())
            alert("You Win!");
    }
}

function onBoard(x,y) {
    if (x >= 0 && x < boardHeight && y >= 0 && y < boardWidth)
        return true;
    return false;
}

function allOnBoard(x,y) {
    var curr;
    for (var i = 0; i < playerBlocks.length; i++) {
        curr = playerBlocks[i];
        if (!onBoard(curr.y+y,curr.x+x))
            return false;
    }
    return true;
}

function blockCollide(x,y) {
    var curr;
    for (var i = 0; i < blocks.length; i++) {
        if (player.x + x == blocks[i].x && player.y + y == blocks[i].y)
            return true;
        for (var j = 0; j < playerBlocks.length; j++) {
            curr = playerBlocks[j];
            if (curr.x + x == blocks[i].x && curr.y + y == blocks[i].y)
                return true;
        }
    }
    return false;
} 

function blockStick(given) {
    for (var i = 0; i < blocks.length; i++)
        if (given.x + given.slime[0] == blocks[i].x && given.y + given.slime[1] == blocks[i].y) {
            playerBlocks.push(blocks[i]);
            blocks.splice(i, 1);
            return;
        }
}

function checkExit() {
    var found = 0;
    for (var i = 0; i < exitTiles.length; i++) {
        for (var j = 0; j < playerBlocks.length; j++)
            if (playerBlocks[j].y == exitTiles[i][1] && playerBlocks[j].x == exitTiles[i][0])
                found++;
        if (player.y == exitTiles[i][1] && player.x == exitTiles[i][0])
            found++;
    }
    if(found == exitTiles.length)
        return true;
    else
        return false;
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
    for (var i = 0; i < playerBlocks.length; i++) 
        document.getElementById(playerBlocks[i].y + ',' + playerBlocks[i].x).innerHTML += '<img class="block ' + playerBlocks[i].class + '" src=' + playerBlocks[i].img + '>';
    for (var i = 0; i < exitTiles.length; i++) 
        document.getElementById(exitTiles[i][1] + ',' + exitTiles[i][0]).innerHTML += '<img class="exit" src="art/exit.png">';
    document.getElementById(player.y + ',' + player.x).innerHTML += '<img id="player" src=' + player.img + '>';
}

function compare (arr1,arr2) {
    if (arr1.length != arr2.length)
        return false;
    for (var i = 0; i < arr1.length; i++)
        if (arr1[i] != arr2[i])
            return false;
    return true;
}