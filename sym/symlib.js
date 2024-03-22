function populate_ep_sym() {
  assign_centers_3c();
  var tmpstr = new Uint8Array(FACELETS);
  for (var ep=0; ep < E_PRM; ep++) {
    ep_sym[ep*CUBE_SYM] = ep;
    int_to_strp(ep_b3[ep], eps, 11, 3);
    make_cubestr_edg(edg2);
    for (var op=1; op < CUBE_SYM; op++) {
      sym_op(tmpstr, cubestr, op);
      ep_sym[ep*CUBE_SYM+op] = convert_edg_3c(tmpstr); 
    }
  }
}

function populate_cp6c_sym() {
  assign_centers_6c();
  var tmpstr = new Uint8Array(FACELETS);
  for (var cp=0; cp < C_PERM; cp++) {
    int_to_perm(cp, cps, 8);
    set_colors_6c(0,1,2,3,4,5,6);
    make_cubestr_cnr(cnr);
    cp6c_sym[cp*CUBE_SYM] = cp;
    for (var op=1; op < CUBE_SYM; op++) {
      sym_op(tmpstr, cubestr, op);
      cp6c_sym[cp*CUBE_SYM+op] = convert_cnr_6c(tmpstr, cps, cts);
    }
  }
}

function populate_list(perm, symfunc) {
  // list CP or EP mins that do not have 48 unique symmetries
  // for 6-color CP pass (C_PERM, cp6c_sym)
  // for 3-color EP pass (E_PRM, ep_sym)
  var tmp = new Int32Array(perm);
  var mins = 0;
  var count = 0;
  for (var i=0; i < perm; i++) {
    if (tmp[i] == 0) {
      mins++;
      tmp[i] = i;
      var n = 0;
      for (var op=1; op < CUBE_SYM; op++) {
        var sym = symfunc[i*CUBE_SYM + op];
        if (tmp[sym] == 0)
          n++;
        tmp[sym] = i;
      }
      if (n < 47) {
        tmp[i] *= -1;
        count++;
      }
    }
  }
  count++;
  tmp[0] = -1;
  list = new Int32Array(count+1);
  list[0] = mins - count;
  for (var i=0, j=1; i < perm; i++) {
    if (tmp[i] < 0)
      list[j++] = i;
  }
  return(list);
}

function populate_et_sym_no_update() {
  init_op16e();
  assign_centers_3c();
  int_to_strp(ep_b3[0], eps, 11, 3);
  var tmpstr = new Uint8Array(FACELETS);
  for(var i=0; i < E_TWIST;  i++)
    for (var j=0; j < CUBE_SYM; j++)
      if (op16e[j*2] == 0) {
        int_to_strp(i, ets, 11, 2);
        make_cubestr_edg(edg2);
        sym_op(tmpstr, cubestr, map[j]);
        convert_edg_3c(tmpstr);
        et_sym[i*CUBE_SYM+j] = str_to_int(ets,11,2);
    }
}

function cubestr_to_ep(s) {
  var eps = new Uint8Array(12);
  var U = s[4];     
  var F = s[25];
  var R = s[28];    
  for (var i=0; i < 12; i++) {
    var x = s[edg_idx[i*2]];
    var y = s[edg_idx[i*2+1]];
    if (x == U || (x == F && y == R))
      eps[i] = (x == F) ? 0 : (y == R) ? 2 : 1;
    else 
      eps[i] = (x == F) ? 1 : (y == U) ? 2 : 0;
  }
  return b3_ep[str_to_int(eps,11,3)];
}

function cubestr_to_et(s) {
  var ets = new Uint8Array(12);
  var U = s[4];
  var F = s[25];
  var R = s[28];
  for (var i=0; i < 12; i++) {
    var x = s[edg_idx[i*2]];
    var y = s[edg_idx[i*2+1]];
    ets[i] = (x == U || (x == F && y == R)) ? 0 : 1;
  }
  return str_to_int(ets,11,2); 
}

function cubestr_to_ct(s) {
  var cts = new Uint8Array(8);
  var U = s[4];
  for (var i=0; i < 8; i++) {
    var x = s[cnr_idx[i*3]];
    var y = s[cnr_idx[i*3+1]];
    if (x == U)
      cts[i] = 0;
    else if (y == U)
       cts[i] = 1;
    else
       cts[i] = 2;
  }
  return(str_to_int(cts, 7, 3));
}

function rpt(arr) {
  var s = '<table border=1>';
  s += '<tr><td><b>Mins</b></td><td><b>Syms</b></td>';
  s += '<td><b>Configs</b></td></tr>';
  var sum1=0, sum2=0;
  for (var i=CUBE_SYM; i > 0; i--) {
    if (arr[i] != 0) {
      sum1 += arr[i];
      sum2 += arr[i] * i;
      s += '<tr><td>' + arr[i] + '</td><td>' + i + '</td><td>';
      s += arr[i]*i + '</td></tr>';
    }
  }
  s += '<tr><td><b>' + sum1 + '</b></td><td></td><td><b>';
  s += sum2 + '</b></td></tr>';
  s += '<tr><td colspan=3 style=text-align:center>Ratio = ';
  s += (sum2/sum1).toFixed(2) + '</td></tr>';
  s += '</table>';
  document.getElementById('status').innerHTML = s;
}

function rpt2(sym48, dec) {
  var t1 = 0;
  var t2 = 0;
  var n1, n2;  
  var arr = [];
  for (var i=CUBE_SYM, ix=0; i > 0; i--)
    if (count2[i] != 0) {
      n1 = count2[i];
      n2 = i*count2[i];
      if (i == CUBE_SYM) {
        n1 += sym48;
        n2 += sym48 * CUBE_SYM;
      }
      arr[ix] = [];
      arr[ix][0] = n1;
      arr[ix][1] = i;
      arr[ix++][2] = n2;
      t1 += n1;
      t2 += n2;
    }
  var s = '<table border=1>';
  s += '<tr><td><b>Mins</b></td><td><b>Syms</b></td><td><b>Configs</b></td></tr>';
  for (var i=0; i < arr.length; i++)
    s += '<tr><td>' + arr[i][0] + '</td><td>' + arr[i][1] + 
        '</td><td>' + arr[i][2] + '</td></tr>';
  s += '<tr><td><b>' + t1 + '</b></td><td></td><td><b>' + t2 + '</b></td></tr>';
  s += '<tr><td colspan=3 style=text-align:center>Ratio = ';
  s += (t2/t1).toFixed(dec) + '</td></tr>';
  s += '</table>';
  document.getElementById('status').innerHTML = s;
}

function count_mins(n1, n2) {
  var count3 = new Uint32Array(49);
  for (var i=0; i < n1; i++)
    for (var j=0; j < n2; j++)
      count2[count1[i*n2 + j]]++;
  for (var i=0; i < n1*n2; i++)
    if (count2[i] != 0)
      count3[count2[i]]++;
  rpt(count3);
}

function rpt3(oix, ocount, osub_count, sym48, dec) {
  var syms = new Int8Array([48,24,16,12,8,6,4,3,2,1]);
  var s = '<table border=1>';
  s += '<tr><td><b>Mins</b></td><td><b>Syms</b></td><td><b>Configs</b></td></tr>';
  var t1=0, t2=0;
  for (i=0; i < 10; i++) {
    var sum = 0;
    for (var j=0; j < oix; j++)
      sum += ocount[j] * osub_count[j*10 + i];
    t1 += sum;
    t2 += sum * syms[i];
    if (i == 0)
      s += '<tr><td>' + (sum+sym48) + '</td><td>' + syms[i] + '</td><td>' +
           (sum+sym48)*CUBE_SYM + '</td></tr>';
    else 
      s += '<tr><td>' + sum + '</td><td>' + syms[i] + '</td><td>' +
           sum*syms[i] + '</td></tr>';
  }
  t1 += sym48;
  t2 += sym48 * CUBE_SYM;
  s += '<tr><td><b>' + t1 + '</b></td><td></td><td><b>' + t2 + '</b></td></tr>'; 
  s += '<tr><td colspan=3 style=text-align:center>Ratio = ' +
       (t2/t1).toFixed(dec) + '</td></tr>';
  s += '</table>';
  return s;
}

function uniq(arr) {
  var n = 1;
  for (var i=1; i < CUBE_SYM; i++) {
    var j;
    for (j=0; j < i; j++)
      if (arr[i] == arr[j])
        break;
    if (i == j)
      n++;
    if (n > 24) {
      n = CUBE_SYM;
      break;
    }
  }
  return n;
}

