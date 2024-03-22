"use strict";
function cube_move(f, m) { 
  // params:
  // f = facelets, text_input_cube.html for format
  // m = moves
  var cubes = [];
  var moves = [];
  populate_moves(moves);
  cubes[0] = f;
  var mva = m.split(' ');
  if (mva[mva.length-1].length == 0)
    mva.length--;
  for (var i=0; i < mva.length; i++) {
    cubes[i+1] = [];
    if (mva[i].length != 0)
      do_move(cvt_mv(mva[i]), cubes[i], cubes[i+1], moves);
  }
  return(cubes[i].join(''));
}

function cvt_to_anim(c) {
  var m = [];
  var anim = [
    6,7,8,3,4,5,0,1,2,45,48,51,46,49,52,47,50,53,12,24,
    36,13,25,37,14,26,38,18,30,42,19,31,43,20,32,44,11,
    10,9,23,22,21,35,34,33,15,27,39,16,28,40,17,29,41];
  for (var i=0; i < 54; i++)
    m[i] = c[anim[i]];
  return(m.join(''));
}

function cvt_from_anim(c) {
  var ca = new Array(54);
  var from_anim = [
    6,7,8,3,4,5,0,1,2,38,37,36,18,21,24,45,48,51,27,30,
    33,41,40,39,19,22,25,46,49,52,28,31,34,44,43,42,20,
    23,26,47,50,53,29,32,35,9,12,15,10,13,16,11,14,17];
  for (var i=0; i < 54; i++)
    ca[i] = c[from_anim[i]];
  return(ca.join(''));
}

function do_move(mv, s1, s2, moves) {
  for (var i=0; i < 54; i++)
    s2[i] = s1[moves[mv][i]];
}

function cvt_mv(m) {
  // make ccw half-twists cw
  if (m.length == 3 && m.substr(1,1) == '2' && m.substr(2,1) == "'")
    m = m.substr(0,2);
  if (m == "R")  return 0;
  if (m == "R2") return 1;
  if (m == "R'") return 2;
  if (m == "L")  return 3;
  if (m == "L2") return 4;
  if (m == "L'") return 5;
  if (m == "U")  return 6;
  if (m == "U2") return 7;
  if (m == "U'") return 8;
  if (m == "D")  return 9;
  if (m == "D2") return 10;
  if (m == "D'") return 11;
  if (m == "F")  return 12;
  if (m == "F2") return 13;
  if (m == "F'") return 14;
  if (m == "B")  return 15;
  if (m == "B2") return 16;
  if (m == "B'") return 17;
}

function populate_moves(moves) {
  var R, U, F, RL, UD, FB;
  init();
  for (var i=0; i < 18; i++)
    moves[i] = [];
  for (i=0; i < 54; i++) moves[0][i] = R[i];
  for (i=0; i < 54; i++) moves[1][i] = R[moves[0][i]];
  for (i=0; i < 54; i++) moves[2][i] = R[moves[1][i]];
  for (i=0; i < 54; i++) moves[3][i] = RL[moves[2][RL[i]]];
  for (i=0; i < 54; i++) moves[4][i] = RL[moves[1][RL[i]]];
  for (i=0; i < 54; i++) moves[5][i] = RL[moves[0][RL[i]]];
  for (i=0; i < 54; i++) moves[6][i] = U[i];
  for (i=0; i < 54; i++) moves[7][i] = U[moves[6][i]];
  for (i=0; i < 54; i++) moves[8][i] = U[moves[7][i]];
  for (i=0; i < 54; i++) moves[9][i]  = UD[moves[8][UD[i]]];
  for (i=0; i < 54; i++) moves[10][i] = UD[moves[7][UD[i]]];
  for (i=0; i < 54; i++) moves[11][i] = UD[moves[6][UD[i]]];
  for (i=0; i < 54; i++) moves[12][i] = F[i];
  for (i=0; i < 54; i++) moves[13][i] = F[moves[12][i]];
  for (i=0; i < 54; i++) moves[14][i] = F[moves[13][i]];
  for (i=0; i < 54; i++) moves[15][i] = FB[moves[14][FB[i]]];
  for (i=0; i < 54; i++) moves[16][i] = FB[moves[13][FB[i]]];
  for (i=0; i < 54; i++) moves[17][i] = FB[moves[12][FB[i]]];

  function init() {
    R = [ // R twist
       0, 1,14, 3, 4,26, 6, 7,38, 9,10,11,12,13,47,39,27,15,
       8,19,20,21,22,23,24,25,50,40,28,16, 5,31,32,33,34,35,
      36,37,53,41,29,17, 2,43,44,45,46,42,48,49,30,51,52,18
    ];
    U = [ // U twist
       6, 3, 0, 7, 4, 1, 8, 5, 2,12,13,14,15,16,17,18,19,20,
       9,10,11,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,
      36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53
    ];
    F = [ // F twist
       0, 1, 2, 3, 4, 5,35,23,11, 9,10,45,36,24,12, 6,16,17,
      18,19,20,21,22,46,37,25,13, 7,28,29,30,31,32,33,34,47,
      38,26,14, 8,40,41,42,43,44,39,27,15,48,49,50,51,52,53
    ];
    RL = [ // Mirror Right-Left
       2, 1, 0, 5, 4, 3, 8, 7, 6,17,16,15,14,13,12,11,10, 9,
      20,19,18,29,28,27,26,25,24,23,22,21,32,31,30,41,40,39,
      38,37,36,35,34,33,44,43,42,47,46,45,50,49,48,53,52,51
    ];  
    UD = [ // Mirror Up-Down
      51,52,53,48,49,50,45,46,47,33,34,35,36,37,38,39,40,41,
      42,43,44,21,22,23,24,25,26,27,28,29,30,31,32, 9,10,11,
      12,13,14,15,16,17,18,19,20, 6, 7, 8, 3, 4, 5, 0, 1, 2
    ];
    FB = [ // Mirror Front-Back
       6, 7, 8, 3, 4, 5, 0, 1, 2,11,10, 9,20,19,18,17,16,15,
      14,13,12,23,22,21,32,31,30,29,28,27,26,25,24,35,34,33,
      44,43,42,41,40,39,38,37,36,51,52,53,48,49,50,45,46,47
    ];
  }
}
