function randMoves(s, n) {
  // param 1 is cube size (3 = 3x3, 4 = 4x4, etc)
  // param 2 is #moves, 0 defaults to 10x cube size
  var face = ["R","L","F","B","U","D"];
  var slice = ["", "m", "n"];
  var twist = ["", "2", "'"];
  var r1 = 0, prev = 0, r2, r3;
  var randmoves = '';
  if (n == 0) n = s * 10;
  for (var i=0; i < n; i++) {
    while (r1 == prev) 
      r1 = Math.floor(Math.random()*6);
    prev = r1;
    r2 = Math.floor(Math.random()*3);
    if (s <= 3)
      randmoves += face[r1] + twist[r2] + ' '; 
   else {
      r3 = Math.floor(Math.random()*((s>4)?3:2))
      randmoves += face[r1] + slice[r3] + twist[r2] + ' '; 
    }
  }
  return(randmoves);
}
