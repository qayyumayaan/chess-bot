var pos = 'start'
// var pos = 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R'
var config = {
    draggable: true,
    position: pos,
    dropOffBoard: 'trash',
    onDrop: function(source, target, piece, newPos, oldPos, orientation) {
        console.log('Piece ' + piece + ' dropped on ' + target);
    }
}
var board = Chessboard('board', config);

$('#startBtn').on('click', board.start);
$('#clearBtn').on('click', board.clear);
$('#move2Btn').on('click', function () {
    board.move('d2-d4', 'g8-f6')
})