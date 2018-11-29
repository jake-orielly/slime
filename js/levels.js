function level1() { 
    player = new Block(0,0,[0,0],"player");
    blocks = [];
    walls = [];
    exitTiles = [[6,1]];
    drawBoard();
}

function level2() {
    player = new Block(0,0,[0,1],"player_1");
    blocks = [new Block(3,2,[0,0],"block")];
    walls = [];
    exitTiles = [[5,1],[6,1]];
    drawBoard();
}

function complexStick() {
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
    player = new Block(0,5,[0,1],"player_1");
    blocks = [
        //new Block(4,4,[0,1],"block_1"),
        new Block(3,5,[0,1],"bomb_block_1"),
        piston(4,5,[-1,0]),
        piston(2,5,[0,1])
    ];
    walls = [
        new Wall(6,0,"wall"),
        new Wall(7,0,"wall"),
        new Wall(7,2,"wall")
    ];
    exitTiles = [[6,1],[5,1],[5,0],[7,0],[7,1]];
    drawBoard();
}