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

function do_move(mv, s1, s2, moves)
{
  for (var i=0; i < 54; i++)
    s2[i] = s1[moves[mv][i]];
}

function cvt_mv(m)
{
  // make CCW half-twists CW
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

  if (m == "Um")  return 18;
  if (m == "Um2") return 19;
  if (m == "Um'") return 20;

  if (m == "Fm")  return 21;
  if (m == "Fm2") return 22;
  if (m == "Fm'") return 23;
  
  if (m == "Rm")  return 24;
  if (m == "Rm2") return 25;
  if (m == "Rm'") return 26;

  if (m == "X")  return 27;
  if (m == "S2") return 28;
  if (m == "S'") return 29;
  
  if (m == "Y")  return 30;
  if (m == "Y2") return 31;
  if (m == "Y'") return 32;
  
  if (m == "Z")  return 33;
  if (m == "Z2") return 34;
  if (m == "Z'") return 35;

  if (m == "E")  return 18;
  if (m == "E2") return 19;
  if (m == "E'") return 20;

  if (m == "S")  return 21;
  if (m == "S2") return 22;
  if (m == "S'") return 23;
  
  if (m == "M")  return 24;
  if (m == "M2") return 25;
  if (m == "M'") return 26;
}

function populate_moves(moves)
{
  var R, U, F, Um, Fm, Rm, RL, UD, FB, X, Y, Z;
  init();
  for (var i=0; i < 36; i++)
    moves[i] = [];

  for (i=0; i < 54; i++) moves[0][i] = R[i];
  for (i=0; i < 54; i++) moves[1][i] = R[moves[0][i]];
  for (i=0; i < 54; i++) moves[2][i] = R[moves[1][i]];
 
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

  for (i=0; i < 54; i++) moves[18][i] = Um[i]; 
  for (i=0; i < 54; i++) moves[19][i] = Um[moves[18][i]];  
  for (i=0; i < 54; i++) moves[20][i] = Um[moves[19][i]];

  for (i=0; i < 54; i++) moves[21][i] = Fm[i]; 
  for (i=0; i < 54; i++) moves[22][i] = Fm[moves[21][i]];  
  for (i=0; i < 54; i++) moves[23][i] = Fm[moves[22][i]];

  for (i=0; i < 54; i++) moves[24][i] = Rm[i]; 
  for (i=0; i < 54; i++) moves[25][i] = Rm[moves[24][i]];  
  for (i=0; i < 54; i++) moves[26][i] = Rm[moves[25][i]];

  for (i=0; i < 54; i++) moves[27][i] = X[i]; 
  for (i=0; i < 54; i++) moves[28][i] = X[moves[27][i]];
  for (i=0; i < 54; i++) moves[29][i] = X[moves[28][i]];

  for (i=0; i < 54; i++) moves[30][i] = Y[i]; 
  for (i=0; i < 54; i++) moves[31][i] = Y[moves[30][i]];
  for (i=0; i < 54; i++) moves[32][i] = Y[moves[31][i]];

  for (i=0; i < 54; i++) moves[33][i] = Z[i]; 
  for (i=0; i < 54; i++) moves[34][i] = Z[moves[33][i]];
  for (i=0; i < 54; i++) moves[35][i] = Z[moves[34][i]];

  function init() {
    // Right Twist CW
    R = [ 
       0, 1,14, 3, 4,26, 6, 7,38, 9,10,11,12,13,47,39,27,15,
       8,19,20,21,22,23,24,25,50,40,28,16, 5,31,32,33,34,35,
      36,37,53,41,29,17, 2,43,44,45,46,42,48,49,30,51,52,18
    ];
    
    // Up Twist CW
    U = [ 
       6, 3, 0, 7, 4, 1, 8, 5, 2,12,13,14,15,16,17,18,19,20,
       9,10,11,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,
      36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53
    ];
 
    // Front Twist CW
    F = [ 
       0, 1, 2, 3, 4, 5,35,23,11, 9,10,45,36,24,12, 6,16,17,
      18,19,20,21,22,46,37,25,13, 7,28,29,30,31,32,33,34,47,
      38,26,14, 8,40,41,42,43,44,39,27,15,48,49,50,51,52,53
    ];
      
    // UD Slice Twist CW
    Um = [ 
       0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,16,17,
      18,19,20,24,25,26,27,28,29,30,31,32,21,22,23,33,34,35,
      36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53
    ];
      
    // FB Slice Twist CW
    Fm = [ 
       0, 1, 2,34,22,10, 6, 7, 8, 9,48,11,12,13,14,15, 3,17,
      18,19,20,21,49,23,24,25,26,27, 4,29,30,31,32,33,50,35,
      36,37,38,39, 5,41,42,43,44,45,46,47,40,28,16,51,52,53
    ];
    
    // LR Slice Twist CW
    Rm = [ 
       0,13, 2, 3,25, 5, 6,37, 8, 9,10,11,12,46,14,15,16,17,
      18, 7,20,21,22,23,24,49,26,27,28,29,30, 4,32,33,34,35,
      36,52,38,39,40,41,42, 1,44,45,43,47,48,31,50,51,19,53
    ];
    
    // Mirror Right-Left
    RL = [ 
       2, 1, 0, 5, 4, 3, 8, 7, 6,17,16,15,14,13,12,11,10, 9,
      20,19,18,29,28,27,26,25,24,23,22,21,32,31,30,41,40,39,
      38,37,36,35,34,33,44,43,42,47,46,45,50,49,48,53,52,51
    ];  
    
    // Mirror Up-Down
    UD = [ 
      51,52,53,48,49,50,45,46,47,33,34,35,36,37,38,39,40,41,
      42,43,44,21,22,23,24,25,26,27,28,29,30,31,32, 9,10,11,
      12,13,14,15,16,17,18,19,20, 6, 7, 8, 3, 4, 5, 0, 1, 2
    ];
    
    // Mirror Front-Back
    FB = [ 
       6, 7, 8, 3, 4, 5, 0, 1, 2,11,10, 9,20,19,18,17,16,15,
      14,13,12,23,22,21,32,31,30,29,28,27,26,25,24,35,34,33,
      44,43,42,41,40,39,38,37,36,51,52,53,48,49,50,45,46,47
    ];
    
    // Sym X
    X = [ 
      12,13,14,24,25,26,36,37,38,11,23,35,45,46,47,39,27,15,
       8, 7, 6,10,22,34,48,49,50,40,28,16, 5, 4, 3, 9,21,33,
      51,52,53,41,29,17, 2, 1, 0,44,43,42,32,31,30,20,19,18
    ];
    
    // Sym Y
    Y = [ 
      33,21, 9,34,22,10,35,23,11,51,48,45,36,24,12, 6, 3, 0,
      20,32,44,52,49,46,37,25,13, 7, 4, 1,19,31,43,53,50,47,
      38,26,14, 8, 5, 2,18,30,42,39,27,15,40,28,16,41,29,17
    ];
    
    // Sym Z
    Z = [
       6, 3, 0, 7, 4, 1, 8, 5, 2,12,13,14,15,16,17,18,19,20, 
       9,10,11,24,25,26,27,28,29,30,31,32,21,22,23,36,37,38,
      39,40,41,42,43,44,33,34,35,47,50,53,46,49,52,45,48,51
    ];
  }
}
