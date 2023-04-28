// imports chess.js via cloudflare

var board = null
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')


// function makeMove () { // gamblebot
//   var possibleMoves = game.moves()
//   if (isGameOver(possibleMoves.length)) return

//   var randomIdx = Math.floor(Math.random() * possibleMoves.length)
//   game.move(possibleMoves[randomIdx])
//   board.position(game.fen())
// }


var depthLimit = 3;

var depthSlider = document.getElementById("depth-slider");
var depthValue = document.getElementById("depth-value");

depthSlider.addEventListener("input", function() {
  depthValue.innerHTML = this.value;
  depthLimit = parseInt(this.value);
  console.log(depthLimit)
});

function makeMove() {
  var possibleMoves = game.moves();
  if (isGameOver(possibleMoves.length)) return;

  var bestMove = null;
  var bestScore = -Infinity;
  for (var i = 0; i < possibleMoves.length; i++) {
    game.move(possibleMoves[i]);
    var score = minimax(depthLimit - 1, -Infinity, Infinity, false);
    game.undo();
    if (score > bestScore) {
      bestScore = score;
      bestMove = possibleMoves[i];
    }
  }
  game.move(bestMove);
  board.position(game.fen());
}

function minimax(depth, alpha, beta, isMaximizingPlayer) {
  if (depth == 0 || isGameOver()) {
    return evaluateBoard();
  }

  var possibleMoves = game.moves();
  if (isMaximizingPlayer) {
    var bestScore = -Infinity;
    for (var i = 0; i < possibleMoves.length; i++) {
      game.move(possibleMoves[i]);
      var score = minimax(depth - 1, alpha, beta, false);
      game.undo();
      bestScore = Math.max(bestScore, score);
      alpha = Math.max(alpha, bestScore);
      if (beta <= alpha) {
        break;
      }
    }
    return bestScore;
  } else {
    var bestScore = Infinity;
    for (var i = 0; i < possibleMoves.length; i++) {
      game.move(possibleMoves[i]);
      var score = minimax(depth - 1, alpha, beta, true);
      game.undo();
      bestScore = Math.min(bestScore, score);
      beta = Math.min(beta, bestScore);
      if (beta <= alpha) {
        break;
      }
    }
    return bestScore;
  }
}





function evaluateBoard() {
  const pieceValues = {
    p: -1,
    n: -3,
    b: -3,
    r: -5,
    q: -9,
    P: 1,
    N: 3,
    B: 3,
    R: 5,
    Q: 9,
  };
  const fen = game.fen();
  return [...fen].reduce((sum, piece) => sum + (pieceValues[piece] || 0), 0);
}











function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}

function chooseAlgorithm () {
  document.getElementById("active-algorithm").innerHTML = "Active bot: minimax";
}

function isGameOver (possibleMoveslength) {
      // game over
    if (possibleMoveslength === 0) {
      document.getElementById("game-over").innerHTML = "Game over!";
      return true
    }
    return false
}


function onDrop (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'

  // make move for black
  window.setTimeout(makeMove, 250)
  updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}

function updateStatus () {
  var status = ''

  var moveColor = 'White'
  if (game.turn() === 'b') {
    moveColor = 'Black'
  }

  // checkmate?
  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.'
  }

  // draw?
  else if (game.in_draw()) {
    status = 'Game over, drawn position'
  }

  // game still on
  else {
    status = moveColor + ' to move'

    // check?
    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check'
    }
  }

  $status.html(status)
  $fen.html(game.fen())
  $pgn.html(game.pgn())
}


var pos = 'start'
// // var pos = 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R'

var config = {
  draggable: true,
  position: pos,
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}
board = Chessboard('board', config)

chooseAlgorithm()
updateStatus()

$('#startBtn').on('click', function() {
  board.clear();
  game.reset();
  board.position(game.fen());
  board.start();
  updateStatus();

});

$('#clearBtn').on('click', function() {
  board.position(game.fen());
  game.reset();
  updateStatus();
  board.clear();
});
