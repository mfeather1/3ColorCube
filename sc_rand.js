arr = [
  "0000 0","0031 1","0310 1","0332 0","0211 0","0202 1","3100 1","3131 0",
  "3320 0","3333 1","3221 1","3203 0","2110 0","2132 1","2020 1","2033 0",
  "2222 0","2213 1","1111 1","1102 0","1021 0","1003 1","1322 1","1313 0"];
function sc_rand() {
  var randArr = [];
  var parity = 1;
  while (parity != 0) {
    var sum = 0; 
    for (i=0; i < 6; i++) {
      var rand = Math.floor(Math.random()*24);
      sum += Number(arr[rand].substr(5));
      randArr[i] = rand;
    }
    parity = sum%2;
  }
  return(randArr);
}
function super_twist(n, a, b, c, d) {
  tw = arrows[n].split('');
  sf[a] = tw[0];
  sf[b] = tw[1];
  sf[c] = tw[2];
  sf[d] = tw[3];
}
