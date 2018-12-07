function level1() { 
    player = new Block(0,0,[[]],"player");
    blocks = [];
    walls = [];
    exitTiles = [[6,1]];
    drawBoard();
}

function level2() {
    player = new Block(0,0,[[0,1]],"player_1");
    blocks = [new Block(3,2,[[]],"block")];
    walls = [];
    exitTiles = [[5,1],[6,1]];
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
        new Wall(6,0,"wall")
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
    exitTiles = [[6,1],[6,2],[6,3],[5,3]];
    drawBoard();
}

function movingParts() {
    player = new Block(0,5,[[0,1]],"player_1");
    blocks = [
        //new Block(4,4,[0,1],"block_1"),
        new Block(4,5,[[0,1]],"bomb_block_1"),
        piston(5,5,[[-1,0]]),
        piston(2,5,[[0,1]])
    ];
    walls = [
        new Wall(6,0,"wall"),
        new Wall(7,0,"wall"),
        new Wall(7,2,"wall")
    ];
    exitTiles = [[6,1],[5,1],[5,0],[7,0],[7,1]];
    drawBoard();
}

function slimex2() {
    player = new Block(1,5,[[0,1],[-1,0]],"player_L");
    blocks = [
        new Block(3,0,[[]],"block"),
        new Block(5,3,[[]],"block"),
        new Block(3,3,[[0,1],[-1,0]],"block_L"),
        new Block(5,5,[[]],"block")
    ];
    walls = [];
    exitTiles = [[6,1],[5,1],[5,0],[7,0],[7,1]];
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