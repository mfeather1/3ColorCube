var cpr_cp6c = new Int16Array(576);
var epr_ep6c = new Int32Array(13824);
var cpr_sym = new Int16Array(576*48);
var epr_sym3 = new Int16Array(13824*48); //  2.5 MB
function populate_rr_min() {
  /*
  80649  48  3871152
   4338  24   104112
     23  16      368
    408  12     4896
      6   8       48
    115   6      690
     14   3       42
      1   2        2
      2   1        2
  85556      3981312  576*13824/2 = 3981312
  */
  init_map(map, sym_op_FR, sym_op_UR, reflect);
  populate_cpr_cp6c();
  populate_epr_ep6c();
  // populate_op_mv();
  populate_cpr_sym();
  populate_epr_sym3();
  var epr = new Int8Array(3);
  var cpar = new Int8Array(576);
  var epar = new Int8Array(13824);
  var tmp = new Int32Array(576*6912);  // 15.2 MB
  for (var a=0; a < 24; a++)
  for (var b=0; b < 24; b++)
  for (var c=0; c < 24; c++) {
    epr[0]=a; epr[1]=b; epr[2]=c;
    var eprn = eprsum(epr);
    int_to_perm(epr_ep6c[eprn], eps, 12);
    epar[eprn] = parity(eps, 12);
  }
  for (var cpr=0; cpr < 576; cpr++) {
    var cp6c = cpr_cp6c[cpr];
    int_to_perm(cp6c, cps, 8);
    cpar[cpr] = parity(cps, 8);
  }
  for (var cpr=0; cpr < 576; cpr++) {
    var cp6c = cpr_cp6c[cpr];
    for (var a=0; a < 24; a++)
    for (var b=0; b < 24; b++)
    for (var c=0; c < 24; c++) {
      epr[0]=a; epr[1]=b; epr[2]=c;
      var eprn = eprsum(epr);
      if (cpar[cpr] != epar[eprn])
	continue;
      var min = cpr*6912 + Math.floor(eprn/2);
      if (rr_min[min] != 0)
        continue;
      rr_min[min] = min;
      for (var op=1; op < 48; op++) {
        var cprsym = cpr_sym[cpr*48+op];
        var eprsym = epr_sym3[eprn*48+op];
        var ix = cprsym*6912 + Math.floor(eprsym/2);
        rr_min[ix] = min;
        rr_min_op[ix] = inv_op[op];
      }
      rr_min_op[min] = 0;
    }
  }
  for (var i=0, ix=0; i < 576; i++)
    for (var j=0; j < 6912; j++) {
      var n = rr_min[i*6912+j];
      if (n != 0) {
        if (tmp[n] == 0)
          tmp[n] = ix++; 
      }
    }
  for (var i=0, ix=0; i < 576; i++)
    for (var j=0; j < 6912; j++) {
       var ix = i*6912+j;
       rr_min[ix] = tmp[rr_min[ix]];
    }
}
function populate_cpr_cp6c() {
  for (var i=0, j=0; i < 40320; i++)
    if (cp6c_cp3c[i] == 0)
      cpr_cp6c[j++] = i;
}
function populate_epr_ep6c() {
  var i, j, k, n, ix;
  var eps = new Int8Array(12);
  var eps3c = new Int8Array([0,0,0,0,1,1,1,1,2,2,2,2]);
  var a = new Int8Array(4);
  var b = new Int8Array(4);
  for (i=0, ix=0; i < 24; i++) {
    int_to_perm(i, eps, 4);
    for (j=0; j < 24; j++) {
      int_to_perm(j, a, 4);
      for (n=4; n < 8; n++)
        eps[n] = eps3c[n]*4 + a[n-4];
      for (k=0; k < 24; k++) {
        int_to_perm(k, b, 4);
        for (n=8; n < 12; n++)
          eps[n] = eps3c[n]*4 + b[n-8];
        var ep6c = perm_to_int(eps, 12);
        epr_ep6c[ix++] = ep6c;
      }
    }
  }
}
function populate_cpr_sym() {
  // cpr_sym is for use with configs where 3-color corners
  // are already solved (cp=0)
  var tmpstr = new Int8Array(54);
  for (var i=0; i < 8; i++)
    cts[i] = 0;
  assign_centers_6c(cubestr);
  for (var cpr=0, ix=0; cpr < C_PRMr; cpr++) {
    var cp6c = cpr_cp6c[cpr];
    int_to_perm(cp6c, cps, 8);
    set_colors_6c(0,1,2,3,4,5,6);
    make_cubestr_cnr(cnr);
    cpr_sym[ix*48] = cpr;
    for (var op=1; op < CUBE_SYM; op++) {
      sym_op(tmpstr, cubestr, map[op]);
      cpr_sym[ix*48+op] = cp6c_cpr[convert_cnr_6c(tmpstr, cps, cts)];
    }
    ix++;
  }
}
function populate_epr_sym3() {
  // epr_sym3 is for use with configs where 3-color edges
  // are already solved (ep=0)
  var eprsym = new Int8Array(12);
  var tmpstr = new Int8Array(54);
  for (var i=0; i < 12; i++)
    ets[i] = 0;
  assign_centers_6c(cubestr);
  for (var epr=0, ix=0; epr < E_PRMr; epr++) {
    var ep6c = epr_ep6c[epr];
    int_to_perm(ep6c, eps, 12);
    set_colors_6c(0,1,2,3,4,5,6);
    make_cubestr_edg(edg);
    epr_sym3[ix*48] = epr;
    for (var op=1; op < CUBE_SYM; op++) {
      sym_op(tmpstr, cubestr, map[op]);
      convert_edg_6c(tmpstr, eps, ets);
      ep6c_epr(eps, eprsym);
      epr_sym3[ix*48+op] = eprsum(eprsym); 
    }
    ix++;
  }
}
function eprsum(epr) {
  return(epr[0]*576 + epr[1]*24 + epr[2]);
}
function populate_op_mv2() {
  // comparison of mv_op & op_mv2 (Z = rotation on UD axis):
  // op_mv[Z][F] = R
  // op_mv2[Z][F] = L
  var mp = new Uint16Array([  // cp6c_sym[CP6C_OP_ROW]
    32,32648,43,14553,386,36150,3126,3747,20880,15894,3755,960,
    36166,25230,3756,7320,36145,16473,394,920,39,6705,405,10592,
    15320,36,31712,389,19713,26166,36146,2160,3751,36154,11040,
    3767,1494,36157,20280,3744,7950,393,11025,44,1952,398,6393,35
  ]);
  for (var i=0; i < MOVES; i++)
    for (var j=0; j < CUBE_SYM; j++)
      for (var k=0; k < MOVES; k++)
	if (cp6c_min[cp6c_mov[mp[0]*18+i]] ==
            cp6c_min[cp6c_mov[mp[j]*18+k]])
	  op_mv2[j*18+i] = k;
}
function rr_min_fdist() {
  var ct = new Int8Array(85556);
  var fd = new Int32Array(49);
  console.log('rr_min fdist:');
  for (var i=0; i < rr_min.length; i++)
    ct[rr_min[i]]++
  for (var i=0; i < ct.length; i++)
    fd[ct[i]]++;
  for (var i=fd.length-1; i > 0; i--)
    if (fd[i] != 0)
      console.log(i, fd[i]);
}
function readBinaryFile(url, callback) {
  var req = new XMLHttpRequest();
  req.open('get', url);
  req.responseType = 'arraybuffer';
  req.onload = function () {
    if (req.status != 200) {
      console.log('Error loading file: ' + url + ', status = ' + req.status);
      return;
    }
    var resp = new Int8Array(req.response);
    callback(resp);
  }
  req.send();
}
var op_mv = new Int8Array([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,12,13,14,15,16,17,6,7,8,9,10,11,3,4,5,0,1,2,6,7,8,9,10,11,15,16,17,12,13,14,3,4,5,0,1,2,15,16,17,12,13,14,9,10,11,6,7,8,3,4,5,0,1,2,9,10,11,6,7,8,12,13,14,15,16,17,3,4,5,0,1,2,3,4,5,0,1,2,6,7,8,9,10,11,15,16,17,12,13,14,6,7,8,9,10,11,0,1,2,3,4,5,15,16,17,12,13,14,0,1,2,3,4,5,9,10,11,6,7,8,15,16,17,12,13,14,9,10,11,6,7,8,3,4,5,0,1,2,15,16,17,12,13,14,15,16,17,12,13,14,6,7,8,9,10,11,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,0,1,2,3,4,5,12,13,14,15,16,17,9,10,11,6,7,8,0,1,2,3,4,5,9,10,11,6,7,8,15,16,17,12,13,14,0,1,2,3,4,5,0,1,2,3,4,5,15,16,17,12,13,14,6,7,8,9,10,11,15,16,17,12,13,14,3,4,5,0,1,2,6,7,8,9,10,11,3,4,5,0,1,2,12,13,14,15,16,17,6,7,8,9,10,11,12,13,14,15,16,17,0,1,2,3,4,5,6,7,8,9,10,11,0,1,2,3,4,5,12,13,14,15,16,17,9,10,11,6,7,8,12,13,14,15,16,17,3,4,5,0,1,2,9,10,11,6,7,8,3,4,5,0,1,2,15,16,17,12,13,14,9,10,11,6,7,8,15,16,17,12,13,14,0,1,2,3,4,5,9,10,11,6,7,8,6,7,8,9,10,11,3,4,5,0,1,2,12,13,14,15,16,17,3,4,5,0,1,2,9,10,11,6,7,8,12,13,14,15,16,17,9,10,11,6,7,8,0,1,2,3,4,5,12,13,14,15,16,17,5,4,3,2,1,0,8,7,6,11,10,9,14,13,12,17,16,15,17,16,15,14,13,12,8,7,6,11,10,9,5,4,3,2,1,0,11,10,9,8,7,6,17,16,15,14,13,12,5,4,3,2,1,0,14,13,12,17,16,15,11,10,9,8,7,6,5,4,3,2,1,0,8,7,6,11,10,9,14,13,12,17,16,15,5,4,3,2,1,0,2,1,0,5,4,3,8,7,6,11,10,9,17,16,15,14,13,12,11,10,9,8,7,6,2,1,0,5,4,3,17,16,15,14,13,12,5,4,3,2,1,0,11,10,9,8,7,6,17,16,15,14,13,12,8,7,6,11,10,9,5,4,3,2,1,0,17,16,15,14,13,12,14,13,12,17,16,15,8,7,6,11,10,9,2,1,0,5,4,3,11,10,9,8,7,6,14,13,12,17,16,15,2,1,0,5,4,3,17,16,15,14,13,12,11,10,9,8,7,6,2,1,0,5,4,3,8,7,6,11,10,9,17,16,15,14,13,12,2,1,0,5,4,3,5,4,3,2,1,0,17,16,15,14,13,12,8,7,6,11,10,9,14,13,12,17,16,15,5,4,3,2,1,0,8,7,6,11,10,9,2,1,0,5,4,3,14,13,12,17,16,15,8,7,6,11,10,9,17,16,15,14,13,12,2,1,0,5,4,3,8,7,6,11,10,9,5,4,3,2,1,0,14,13,12,17,16,15,11,10,9,8,7,6,17,16,15,14,13,12,5,4,3,2,1,0,11,10,9,8,7,6,2,1,0,5,4,3,17,16,15,14,13,12,11,10,9,8,7,6,14,13,12,17,16,15,2,1,0,5,4,3,11,10,9,8,7,6,11,10,9,8,7,6,5,4,3,2,1,0,14,13,12,17,16,15,2,1,0,5,4,3,11,10,9,8,7,6,14,13,12,17,16,15,8,7,6,11,10,9,2,1,0,5,4,3,14,13,12,17,16,15]);
/*
function populate_op_mv() {
  var CP6C_OP_ROW = 32 // row in cp6c_sym with 48 uniq sym
  var mp = new Uint16Array(CUBE_SYM);
  var tmpstr = new Uint8Array(FACELETS);
  var cp6c_sym_tmp = [];
  var cts = [0,0,0,0,0,0,0,0];
  // populate mp with with a cp6c that has 48 uniq symmetries (op=CP6C_OP_ROW)
  assign_centers_6c();
  int_to_perm(CP6C_OP_ROW, cps, 8);
  make_cubestr_cnr(cnr2);
  mp[0] = CP6C_OP_ROW;
  for (var op=1; op < CUBE_SYM; op++) {
    sym_op(tmpstr, cubestr, op);
    mp[op] = convert_cnr_6c(tmpstr, cps, cts);
  }
  // populate cp6c_sym_tmp with a row for each of the 48 ep values in mp
  for (var i=0; i < CUBE_SYM; i++) {
    var cp6c = mp[i];
    cp6c_sym_tmp[cp6c] = [];
    int_to_perm(CP6C_OP_ROW, cps, 8);
    make_cubestr_cnr(cnr2);
    cp6c_sym_tmp[cp6c][0] = cp6c;
    for (var op=1; op < CUBE_SYM; op++) {
      sym_op(tmpstr, cubestr, op);
      cp6c_sym_tmp[cp6c][op] = convert_cnr_6c(tmpstr, cps, cts);
    }
  }
  for (i=0; i < MOVES; i++)
    for (j=0; j < CUBE_SYM; j++)
      for (k=0; k < MOVES; k++)
        if (cp6c_min[cp6c_mov[mp[0]][i]] ==
            cp6c_min[cp6c_mov[mp[j]][k]])
          op_mv2[j][k] = i;
  console.log(op_mv2);
}
*/
