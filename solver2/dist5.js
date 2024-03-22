// ----------------------------------------------------------------------------
// Populate Search Array Dist5a (CP6C, CT) 84 MB
// ----------------------------------------------------------------------------
var dist_count;
function populate_dist5a() {
  /* Moves    Configs 
       1           18
       2          243
       3         2874
       4        28000
       5       205416
       6      1168516  .0133
       7      5402628  .0613
       8     20776176  .2356
       9     45391616  .5148
      10     15139616  .1717
      11        64736
     Total   88179840 
  */
  var t0 = Date.now();
  postMessage({'cmd': 'msg', 'msg': 'Generating Dist5a'});
  console.log('Dist5 size: ' + Math.round(dist5.length/1024**2) + ' MB');
  console.log('Generating Dist5a to Depth 11');
  dist5[0] = 1;
  for (depth=1; depth <= 6; depth++) {
    dist_count = 0;
    dist5_searcha(0, 0, 1, mvlist2);
    console.log('s1: ' + depth + ' ' + dist_count);
  }
  for (var n=7; n <= 11; n++) {
    dist_count = 0;
    for (var i=0; i < 40320; i++)
      for (var j=0; j < 2187; j++)
        if (dist5[i*2187+j] == n-1)
          for (var mv=0; mv < 18; mv++) {
            cp6c = cp6c_mov[i*18+mv];
            ct = ct_mov[j*18+mv];
            if (dist5[cp6c*2187+ct] == 0) {
              dist5[cp6c*2187+ct] = n;
              dist_count++;
          } }
    console.log('s2: ' + n + ' ' + dist_count);
  }
  dist5[0] = 0;
  var t1 = ((Date.now()-t0)/1000).toFixed(2);
  console.log('Dist5 Gen Time: ' + t1);
}
function dist5_searcha(cp6cn, ctn, n, mvlist) { 
  for (var i=0, mv=0; (mv=mvlist[i]) != NIL; i++) {
    var cp6c = cp6c_mov[cp6cn*18+mv];
    var ct = ct_mov[ctn*18+mv];
    if (n == depth) {
      var ix = cp6c*2187 + ct;
      if (dist5[ix] == 0) {
        dist5[ix] = n;
        dist_count++;
    } }
    else {
      seq[n] = mv;
      dist5_searcha(cp6c, ct, n+1, seq_gen[mv]);
} } }
// ----------------------------------------------------------------------------
// Populate Search Array Dist5b (CP6C, CT) 44 MB
// ----------------------------------------------------------------------------
function populate_dist5b() {
  var t0 = Date.now();
  postMessage({'cmd': 'msg', 'msg': 'Generating Dist5b'});
  console.log('Dist5 size: ' + Math.round(dist5.length/1024**2) + ' MB');
  console.log('Generating Dist5b to Depth 11');
  dist5[0] = 1;
  for (depth=1; depth <= 6; depth++) {
    dist_count = 0;
    dist5_searchb(0, 0, 1, mvlist2);
    console.log('s1: ' + depth + ' ' + dist_count);
  }
  for (var n=7; n <= 9; n++) {
    dist_count = 0;
    for (var i=0; i < 40320; i++) {
      for (var j=0; j < 2187; j++) {
        var ix = i*1094 + (j>>1);
        var dist = (j&1) ? dist5[ix]>>4 : dist5[ix]&0xF;
        if (dist == n-1) {
          for (var mv=0; mv < 18; mv++) {
            cp6c = cp6c_mov[i*18+mv];
            ct = ct_mov[j*18+mv];
            ix = cp6c*1094 + (ct>>1);
            dist = (ct&1) ? dist5[ix]>>4 : dist5[ix]&0xF;
            if (dist == 0) {
              dist5[ix] |= ((ct&1)?n<<4:n);
              dist_count++;
    } } } } }
    console.log('s2: ' + n + ' ' + dist_count);
  }
  // for (var n=9; n <= 10; n++) {  //  5.82
  for (var n=10; n <= 10; n++) {  // 5.27
    dist_count = 0;
    for (var i=0; i < 40320; i++) {
      for (var j=0; j < 2187; j++) {
        var ix = i*1094 + (j>>1);
        var dist = (j&1) ? dist5[ix]>>4 : dist5[ix]&0xF;
        if (dist == 0) {
          for (var mv=0; mv < 18; mv++) {
            cp6c = cp6c_mov[i*18+mv];
            ct = ct_mov[j*18+mv];
            ix2 = cp6c*1094 + (ct>>1);
            dist = (ct&1) ? dist5[ix2]>>4 : dist5[ix2]&0xF;
            if (dist == n-1) {
              dist5[ix] |= ((j&1)?n<<4:n);
              dist_count++;
              break;
    } } } } }
    console.log('s3: ' + n + ' ' + dist_count);
  }
  dist_count = 0;
  for (var i=0; i < 40320; i++) {
    for (var j=0; j < 2187; j++) {
      var ix = i*1094 + (j>>1);
      var dist = (j&1) ? dist5[ix]>>4 : dist5[ix]&0xF;
      if (dist == 0) {
        dist5[ix] |= ((j&1)?11<<4:11);
        dist_count++;
  } } }
  console.log('s4: 11 ' + dist_count);
  dist5[0] &= 0xF0;
  var t1 = ((Date.now()-t0)/1000).toFixed(2);
  console.log('Dist5 Gen Time: ' + t1);
}
function dist5_searchb(cp6cn, ctn, n, mvlist) { 
  for (var i=0, mv=0; (mv=mvlist[i]) != NIL; i++) {
    var cp6c = cp6c_mov[cp6cn*18+mv];
    var ct = ct_mov[ctn*18+mv];
    if (n == depth) {
      var ix = cp6c*1094 + (ct>>1);
      var dist = (ct&1) ? dist5[ix]>>4 : dist5[ix]&0xF;
      if (dist == 0) {
        dist5[ix] |= ((ct&1)?n<<4:n);
        dist_count++;
    } }
    else {
      seq[n] = mv;
      dist5_searchb(cp6c, ct, n+1, seq_gen[mv]);
} } }
