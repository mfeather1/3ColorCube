function randMovesHTA(h, n) {
  // param 1: HTA goal, 0=all, 1=U,D,L,R,F2,B2, 2=U,D,L2,R2,F2,B2, 3=U2,D2,L2,R2,F2,B2
  // param 2: #moves, 0 defaults to 30 
  var face = ["R","L","F","B","U","D"];
  var twist = ["", "2", "'"];
  var r1 = 0, prev = 0, r2, r3;
  var randmoves = '';
  if (n == 0) n = 30;
  for (var i=0; i < n; i++) {
    while (r1 == prev) 
      r1 = Math.floor(Math.random()*6);
    prev = r1;
    r2 = Math.floor(Math.random()*3);
    if (h == 1 && (r1 == 2 || r1 == 3))
      r2 = 1;
    else if (h == 2 && !(r1 == 4 || r1 == 5))
      r2 = 1;
    else if (h == 3)
      r2 = 1;
    randmoves += face[r1] + twist[r2] + ' '; 
  }
  return(randmoves);
}
