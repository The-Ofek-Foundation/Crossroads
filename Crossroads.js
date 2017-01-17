var docWidth, docHeight;
var boardWidth, squareWidth;
var board;

var boardui = getElemId("board");
var brush = boardui.getContext("2d");

function pageReady() {
	resizeBoard();
	newGame();
}

function resizeBoard() {
	docWidth = getElemWidth(contentWrapper);
	docHeight = getElemHeight(contentWrapper);
	wrapperTop = contentWrapper.offsetTop;

	boardWidth = docWidth < docHeight ? docWidth:docHeight;

	setElemWidth(boardui, boardWidth);
	setElemHeight(boardui, boardWidth);
	setElemStyle(boardui, 'left', (docWidth - boardWidth) / 2 + "px")
	boardui.setAttribute('width', boardWidth);
	boardui.setAttribute('height', boardWidth);
	squareWidth = boardWidth / 7;
}

function onResize() {
	resizeBoard();
	drawBoard();
}

function newGame() {
	board = new Array(5);
	for (var i = 0; i < board.length; i++) {
		board[i] = new Array(5);
		for (var a = 0; a < board[i].length; a++)
			board[i][a] = 0;
	}

	drawBoard();
}

function clearBoard() {
	brush.clearRect(0, 0, boardWidth, boardWidth);
	brush.fillStyle = "white";
	brush.fillRect(0, 0, boardWidth, boardWidth);
}

var brushX, brushY;
function brushMove(x, y) {
	x *= squareWidth;
	y *= squareWidth;
	brushX = x;
	brushY = y;
	brush.moveTo(brushX, brushY);
}

function lineMove(dx, dy) {
	dx *= squareWidth;
	dy *= squareWidth;
	brushX += dx;
	brushY -= dy;
	brush.lineTo(brushX, brushY);
}

function drawOuterBoard() {

	brush.beginPath();

	// Top Side
	brushMove(1, 2);
	lineMove(1, 0);
	lineMove(0, 1);
	lineMove(1, 0);
	lineMove(0, -1);
	lineMove(1, 0);
	lineMove(0, 1);
	lineMove(0.5, -1/3);
	lineMove(0.5, 1/3);
	lineMove(0, -1);
	lineMove(1, 0);

	// Right Side
	lineMove(0, -1);
	lineMove(-1, 0);
	lineMove(0, -1);
	lineMove(1, 0);
	lineMove(-1/3, -0.5);
	lineMove(1/3, -0.5);
	lineMove(-1, 0);
	lineMove(0, -1);

	// Bottom Side
	lineMove(-1, 0);
	lineMove(0, 1);
	lineMove(-1, 0);
	lineMove(0, -1);
	lineMove(-0.5, 1/3);
	lineMove(-0.5, -1/3);
	lineMove(0, 1);
	lineMove(-1, 0);

	// Left Side
	lineMove(0, 1);
	lineMove(1, 0);
	lineMove(0, 1);
	lineMove(-1, 0);
	lineMove(1/3, 0.5);
	lineMove(-1/3, 0.5);

	// Center Square
	brushMove(3, 3);
	lineMove(1, 0);
	lineMove(0, -1);
	lineMove(-1, 0);
	lineMove(0, 1);

	brush.strokeStyle = 'black';
	brush.lineWidth = squareWidth / 25;
	brush.stroke();
	brush.closePath();
}

function drawInnerBoard() {

	brush.beginPath();

	// Top Side
	brushMove(4/3, 7/3);
	lineMove(1, 0);
	lineMove(0, 1);
	lineMove(1/3, 0);
	lineMove(0, -1);
	lineMove(5/3, 0);
	lineMove(0, 1);
	lineMove(1/6, -1/9);
	lineMove(1/6, 1/9);
	lineMove(0, -1);
	lineMove(1, 0);

	// Right Side
	lineMove(0, -1/3);
	lineMove(-1, 0);
	lineMove(0, -5/3);
	lineMove(1, 0);
	lineMove(-1/9, -1/6);
	lineMove(1/9, -1/6);
	lineMove(-1, 0);
	lineMove(0, -1);

	// Bottom Side
	lineMove(-1/3, 0);
	lineMove(0, 1);
	lineMove(-5/3, 0);
	lineMove(0, -1);
	lineMove(-1/6, 1/9);
	lineMove(-1/6, -1/9);
	lineMove(0, 1);
	lineMove(-1, 0);

	// Left Side
	lineMove(0, 1/3);
	lineMove(1, 0);
	lineMove(0, 5/3);
	lineMove(-1, 0);
	lineMove(1/9, 1/6);
	lineMove(-1/9, 1/6);

	// Center Square
	brushMove(2 + 2/3, 2 + 2/3);
	lineMove(5/3, 0);
	lineMove(0, -5/3);
	lineMove(-5/3, 0);
	lineMove(0, 5/3);

	brush.strokeStyle = 'black';
	brush.lineWidth = 1;
	brush.stroke();
	brush.closePath();
}

function drawBoard(hover=-1) {
	clearBoard();
	drawOuterBoard();
	drawInnerBoard();
	// if (hover !== -1)
	// 	drawHover(hover);
}
