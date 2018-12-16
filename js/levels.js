function level1() { 
    player = new Block(1,1,[[]],"player");
    blocks = [];
    walls = [];
    exitTiles = [[5,2]];
    drawBoard();
}

function level2() {
    player = new Block(0,0,[[0,1]],"player_1");
    blocks = [new Block(3,2,[[]],"block")];
    walls = [];
    exitTiles = [[5,1],[6,1]];
    drawBoard();
}

function level3() {
    player = new Block(1,1,[[0,1]],"player_1");
    blocks = [
        new Block(3,3,[[-1,0]],"block_1"),
        new Block(5,4,[[]],"block"),
        new Block(6,6,[[0,1]],"block_1"),
        new Block(3,5,[[0,1]],"block_1"),
    ];
    walls = [];
    exitTiles = [[3,2],[4,2],[5,2],[6,2],[6,1]];
    drawBoard();
}

function level4() {
    player = new Block(1,1,[[0,1]],"player_1");
    blocks = [
        new Block(2,3,[[-1,0]],"block_1"),
        new Block(3,6,[[1,0]],"block_1"),
        new Block(6,3,[[0,1]],"block_1"),
        new Block(5,5,[[]],"block")
    ];
    walls = [];
    exitTiles = [[4,2],[5,2],[6,2],[5,3],[5,1]];
    drawBoard();
}

function complexStick() {
    player = new Block(1,1,[[0,1]],"player_1");
    blocks = [
        new Block(3,2,[[0,1]],"block_1"),
        new Block(3,4,[[0,1]],"block_1"),
        new Block(3,6,[[1,0]],"block_1"),
        new Block(2,5,[[0,-1]],"block_1"),
        new Block(5,5,[[-1,0]],"block_1")
    ];
    walls = [
        new Wall(6,0)
    ];
    exitTiles = [[6,1],[5,1],[5,0],[7,0],[7,1]];
    drawBoard();
}

function complexStick2() {
    player = new Block(1,1,[[0,1]],"player_1");
    blocks = [
        new Block(3,3,[[0,1],[-1,0]],"block_L"),
        new Block(1,6,[[0,1]],"block_1"),
        new Block(4,5,[[]],"block"),
        new Block(6,6,[[]],"block")
    ];
    walls = [];
    exitTiles = [[5,2],[4,2],[4,1],[5,1],[6,2]];
    drawBoard();
}

function bomb1() {
    player = new Block(0,0,[[0,1]],"player_1");
    blocks = [
        new Block(2,4,[[0,1]],"block_1"),
        new Block(3,2,[[]],"block"),
        new Block(4,5,[[0,1]],"bomb_block_1")];
    walls = [];
    exitTiles = [[2,5],[3,5],[6,1]];
    drawBoard();
}

function bomb2() {
    player = new Block(0,0,[[0,1]],"player_1");
    blocks = [
        new Block(2,1,[[1,0]],"block_1"),
        new Block(3,0,[[0,-1],[1,0]],"block_L"),
        new Block(6,1,[[]],"block"),
        new Block(5,2,[[0,1]],"block_1"),
        new Block(4,3,[[0,1]],"bomb_block_1"),
        new Block(6,5,[[]],"block"),
        new Block(6,6,[[0,-1]],"bomb_block_1")];
    walls = [];
    exitTiles = [[1,6],[2,6],[4,1],[5,1],[6,1],[6,2],[6,3]];
    drawBoard();
}

function piston1() {
    player = new Block(1,1,[[0,1]],"player_1");
    blocks = [
        new Block(4,1,[[]],"block"),
        piston(3,3,[[-1,0]]),
    ];
    walls = [];
    exitTiles = [[6,1],[6,3],[5,3]];
    drawBoard();
}

function piston2() {
    player = new Block(1,1,[[0,1]],"player_1");
    blocks = [
        new Block(6,3,[[]],"block"),
        piston(2,4,[[-1,0]]),
        piston(4,2,[[0,1]]),
        piston(4,5,[[1,0]]),
    ];
    walls = [new Wall(5,1)];
    exitTiles = [[6,1],[3,1]];
    drawBoard();
}

function piston3() {
    player = new Block(1,1,[[0,1]],"player_1");
    blocks = [
        piston(1,3,[[-1,0]]),
        piston(4,2,[[1,0]]),
        piston(1,6,[[0,-1]]),
        piston(3,4,[[0,-1]]),
        piston(5,4,[[0,1]])
    ];
    walls = [];
    exitTiles = [[4,1],[6,1],[4,3],[6,3],[4,5],[6,5]];
    drawBoard();
}

function pistonDeSync() {
    player = new Block(1,5,[[0,1]],"player_1");
    blocks = [
        new Block(3,3,[[-1,0]],"bomb_block_1"),
        new Block(4,6,[[]],"block"),
        piston(6,2,[[-1,0]]),
        piston(6,5,[[0,1]])
    ];
    walls = [];
    exitTiles = [[2,2],[3,2],[4,0]];
    drawBoard();
}

function movingParts() { // I predict players will find this one very hard
    player = new Block(1,1,[[-1,0]],"player_1");
    blocks = [
        new Block(4,3,[[0,-1]],"bomb_block_1"),
        new Block(6,3,[[0,-1]],"block_1"),
        new Block(7,4,[[0,-1],[-1,0]],"block_L"),
        new Block(0,0,[[]],"block"),
        new Block(5,7,[[0,-1]],"block_1"),
        piston(1,5,[[0,-1]]),
        piston(6,5,[[-1,0]]),
        piston(7,6,[[0,-1]])
    ];
    walls = [
        new Wall(4,0), new Wall(5,0), new Wall(6,0), new Wall(7,0),
        new Wall(4,2), new Wall(5,2), new Wall(6,2), new Wall(7,2)
    ];
    exitTiles = [[1,3],[7,1],[6,7]];
    drawBoard();
}