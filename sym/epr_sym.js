// EPR Sym Method 1
var epr_sym = new Uint8Array(CUBE_SYM * SLICE_PRM * 24 * 3);  // 1671 KB

// EPR Sym Method 2
var epr_sym2 = new Uint8Array(176 * 24);                      //  4 KB
var epr_idx = new Uint8Array(CUBE_SYM * SLICE_PRM *3);        // 70 KB

var slice_map = new Uint8Array([
  0,1,2,0,2,1,1,2,0,0,2,1,1,2,0,0,1,2,1,0,2,0,1,2,
  1,0,2,0,2,1,1,2,0,0,2,1,1,2,0,2,1,0,2,0,1,2,1,0,
  2,0,1,2,1,0,2,0,1,2,1,0,2,0,1,1,0,2,0,1,2,1,0,2,
  0,1,2,0,2,1,1,2,0,0,2,1,1,2,0,0,1,2,1,0,2,0,1,2,
  1,0,2,0,2,1,1,2,0,0,2,1,1,2,0,2,1,0,2,0,1,2,1,0,
  2,0,1,2,1,0,2,0,1,2,1,0,2,0,1,1,0,2,0,1,2,1,0,2
]);

function populate_epr_sym() {
  var init_str = new Uint8Array([0,1,2,3,0,1,2,3,0,1,2,3]);
  var v = new Uint8Array(4);
  var epr = new Uint8Array(3);
  var eps_3c = new Uint8Array(12);
  var eps_3r = new Uint8Array(12);
  var tempstr = new Uint8Array(FACELETS);
  assign_centers_6c();
  for (var slice=0; slice < 3; slice++) {
    for (var op=0; op < CUBE_SYM; op++) {
      var slice_sym = slice_map[op*3+slice];
      for (var i=0; i < SLICE_PRM; i++) {
        int_to_strp(ep_b3[slice_ep[i*3+slice]], eps_3c, 11, 3);
        memcpy(eps_3r, init_str, 12);
        for (var j=0; j < 24; j++) {
          int_to_perm(j, v, 4);
          for (var k=0; k < 4; k++)
            eps_3r[slice*4+k] = v[k];
          mk_eps_6c(eps, eps_3c, eps_3r);
          set_colors_6c(0,1,2,3,4,5);
          make_cubestr_edg(edg);
          sym_op(tempstr, cubestr, map[op]);
          convert_edg_6c(tempstr, eps, ets);
          ep6c_epr(eps, epr);
          var ix = op*35640 + i*72 + j*3 + slice;
          epr_sym[ix] = epr[slice_sym];
        }
      }
    }
  }
}

function populate_epr_sym2() {
  var init_str = new Uint8Array([0,1,2,3,0,1,2,3,0,1,2,3]);
  var v = new Uint8Array(4);
  var s = new Uint8Array(24);
  var epr = new Uint8Array(3);
  var eps_3c = new Uint8Array(12);
  var eps_3r = new Uint8Array(12);
  var tempstr = new Uint8Array(FACELETS);
  var tmp_idx = new Int16Array(E_PRMr);
  assign_centers_6c();
  for (var i=0; i < E_PRMr; i++)
    tmp_idx[i] = NIL;
  for (var ix=slice=0; slice < 3; slice++) {
    for (var op=0; op < CUBE_SYM; op++) {
      var slice_sym = slice_map[op*3+slice];
      for (var i=0; i < SLICE_PRM; i++) {
        int_to_strp(ep_b3[slice_ep[i*3+slice]], eps_3c, 11, 3);
        memcpy(eps_3r, init_str, 12);
        for (var j=0; j < 24; j++) {
          int_to_perm(j, v, 4);
          for (var k=0; k < 4; k++)
            eps_3r[slice*4+k] = v[k];
          mk_eps_6c(eps, eps_3c, eps_3r);
          set_colors_6c(0,1,2,3,4,5);
          make_cubestr_edg(edg);
          sym_op(tempstr, cubestr, map[op]);
          convert_edg_6c(tempstr, eps, ets); 
          ep6c_epr(eps, epr);
          s[j] = epr[slice_sym];
          if (j == 2) {
            key = (s[0]*24 + s[1])*24 + s[2];
            if (tmp_idx[key] == NIL) {
              tmp_idx[key] = ix++;
              epr_idx[op*1485 + i*3 + slice] = tmp_idx[key];
            }
            else { 
              epr_idx[op*1485 + i*3 + slice] = tmp_idx[key];
              break;
            } 
          }
        }
        if (j > 2) {
          for (k=0; k < 24; k++)
            epr_sym2[tmp_idx[key]*24+k] = s[k]; 
        }
      }
    }
  }
}

function get_eprsym(eprsym, ep, epr, op) {
  for (var i=0; i < 3; i++) {
    var ix = op*35640 + ep_slice[ep*3+i]*72 + epr[i]*3 + i;
    eprsym[slice_map[op*3+i]] = epr_sym[ix];
  }
}

function get_eprsym2(eprsym, ep, epr, op) {
  for (var i=0; i < 3; i++) {
    var ix = epr_idx[op*1485 + ep_slice[ep*3+i]*3 + i];
    eprsym[slice_map[op*3+i]] = epr_sym2[ix*24 + epr[i]];
  }
}

function eprsum(epr) {
  return(epr[0]*576 + epr[1]*24 + epr[2]);
}


