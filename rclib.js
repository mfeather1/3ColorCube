// Author: Michael Feather

"use strict";

function init1()
{
  var i, j, k;

  // assign cubie locations for cw moves

  copy(cmv, "07254163", 8, 0);  // right 
  copy(cmv, "61430527", 8, 3);  // left  
  copy(cmv, "51264307", 8, 6);  // up    
  copy(cmv, "04732561", 8, 9);  // down  
  copy(cmv, "45231067", 8, 12); // front  
  copy(cmv, "01674532", 8, 15); // back  

  copy(emv, "0A934567812B", 12, 0);
  copy(emv, "812B456739A0", 12, 3);
  copy(emv, "0123956847AB", 12, 6);
  copy(emv, "01234BA78956", 12, 9);
  copy(emv, "5423016789AB", 12, 12);
  copy(emv, "0167453289AB", 12, 15);

  // apply primary moves to fill in remaining moves 
 
  for(i=0; i < 2; i++)	   // populate cmv[1,2,4,5,7,8...] 
    for(j=0; j < 18; j+=3)
      for(k=0; k < 8; k++)
	cmv[(i+j+1)*8+k] = cmv[(i+j)*8+cmv[j*8+k]];

  for(i=0; i < 2; i++)	   
    for(j=0; j < 18; j+=3)
      for(k=0; k < 12; k++)
	emv[(i+j+1)*12+k] = emv[(i+j)*12+emv[j*12+k]];
}

function init2()
{
  /* This populates the following arrays:
     b2_cp, cp_b2
     b3_ep, ep_b3
     cp_mov, ct_mov
     ep_mov, et_mov
     b2_slice, ep_slice, slice_ep
  */

  var time0 = Date.now();
  var i, j, k;
  var s = new Int8Array(12);
  var tmp = new Int8Array(12);
  var ctw = [], etw = [];

  ctw[0]  = crtw;  ctw[2]  = crtw;  
  ctw[3]  = cltw;  ctw[5]  = cltw;  
  ctw[12] = cftw;  ctw[14] = cftw;
  ctw[15] = cbtw;  ctw[17] = cbtw;
  etw[12] = eftw;  etw[14] = eftw; 
  etw[15] = ebtw;  etw[17] = ebtw;

  init1();

  init_conv();
    
  // populate tables for converting between perm & int for 3C perms 

  for(i=j=0; i < B2_MAX; i++)
    if (int_to_str_lim(i, s, 7, 2, 4))
      {
	b2_cp[i] = j;
	cp_b2[j++] = i;
      }

  for(i=j=0; i < B3_MAX; i++) {
    if (int_to_str_lim(i, s, 11, 3, 4))
      {
	b3_ep[i] = j;
	ep_b3[j++] = i;
      }
  }
 
  for(i=0; i < C_PRM; i++)   
    {
      int_to_strp(cp_b2[i], s, 7, 2);

      for(j=0; j < MOVES; j++)
	{	
	  for(k=0; k < 8; k++) 
	    tmp[k] = s[cmv[j*8+k]]; 

	  cp_mov[i*MOVES+j] = b2_cp[str_to_int(tmp,7,2)];
	}		
    }

  for(i=0; i < C_PERM; i++)
    {
      int_to_perm(i, s, 8);

      for(j=0; j < 8; j++) 
	tmp[j] = s[j]/4;

      cp6c_cp3c[i] = b2_cp[str_to_int(tmp,7,2)];
    }

  for(i=0; i < C_TWIST; i++)
    {
      int_to_strp(i,s,7,3);

      for(j=0; j < MOVES; j++)
	{
	  for(k=0; k < 7; k++) 
	    tmp[k] = s[cmv[j*8+k]]; 

	  if (ctw[j]) 
	    ctw[j](tmp); 

	  ct_mov[i*MOVES+j] = str_to_int(tmp,7,3); 
	}
    }

  for(i=0; i < E_PRM; i++)
    {
      int_to_strp(ep_b3[i], s, 11, 3);

      for(j=0; j < MOVES; j++)
	{
	  for(k=0; k < 12; k++) 
	    tmp[k] = s[emv[j*12+k]]; 

	  ep_mov[i*MOVES+j] = b3_ep[str_to_int(tmp,11,3)];
	}		
    }

  for(i=0; i < E_TWIST; i++)
    {
      int_to_strp(i,s,11,2);

      for(j=0; j < MOVES; j++)
	{
	  for(k=0; k < 11; k++) 
	    tmp[k] = s[emv[j*12+k]]; 

	  if (etw[j])
	    etw[j](tmp); 

	  et_mov[i*MOVES+j] = str_to_int(tmp,11,2); 
	}		
    }

  populate_b2_slice();
  populate_ep_slice();
  populate_slice_ep();
  populate_cp6c_cpr();

  // populated.push("init2");

  if (show_init_time_details == 1) {
    var time1 = Date.now();
    document_write(((time1-time0)/1000).toFixed(2) + ' init2<br>');
  }
}

function populate_cp6c_cpr()
{
  var s = new Uint8Array(8);
  var t1 = new Uint8Array(8);
  var t2 = new Uint8Array(8);

  for (var i=0; i < C_PERM; i++)
    {
      int_to_perm(i, s, 8);

      for (var j=0, x1=0, x2=0; j < 8; j++)
	if (Math.floor(s[j]/4) == 0)
	  t1[x1++] = s[j];
	else
	  t2[x2++] = s[j]-4;

      cp6c_cpr[i] = perm_to_int(t1,4)*24 + perm_to_int(t2,4);
    }
  // populated.push("cp6c_cpr");
}

function memcpy(a, b, n)
{
  for (var i=0; i < n; i++)
    a[i] = b[i];
}

function populate_slice_ep()
{
  var a = new Uint8Array(12);
  var b = new Uint8Array(12);

  for (var i=0, ix=0; i < 4096; i++)
    {
      int_to_str(i, a, 12, 2);
 
      for (var c=0, j=0; j < 12; j++)
        if (a[j] == 1)
          c++;
 
      if (c == 4)
        {
          memcpy(b, a, 12);
 
          for (j=0; j < 12; j++)
            b[j] = b[j] ? 0 : 1;
           
          for (c=0, j=0; j < 12; j++)
            if (b[j] == 1 && c++ >= 4)
              b[j] = 2;
               
          slice_ep[ix*3] = b3_ep[str_to_int(b,11,3)];
          memcpy(b, a, 12);
 
          for (c=j=0; j < 12; j++)
            if (b[j] == 0 && c++ >= 4)
              b[j] = 2;
               
          slice_ep[ix*3+1] = b3_ep[str_to_int(b,11,3)];
          memcpy(b, a, 12);
 
          for (j=0; j < 12; j++)
            if (b[j])
              b[j] = 2;

          for (c=0, j=0; j < 12; j++)
            if (b[j] == 0 && c++ >= 4)
              b[j] = 1;
 
          slice_ep[ix*3+2] = b3_ep[str_to_int(b,11,3)];
          ix++;
        }
    }
  // populated("slice_ep");
}

function populate_b2_slice()
{
  var s = new Uint8Array(12);

  for (var i=0, k=0; i < 4096; i++)
    {
      int_to_str(i, s, 12, 2);

      for (var c=0, j=0; j < 12; j++)
	if (s[j] == 1)
	  c++;

      if (c == 4)
        b2_slice[i] = k++;
    }
}

function populate_ep_slice()
{
  var s = new Uint8Array(12);
  var t = new Uint8Array(12);

  for (var i=0; i < E_PRM; i++)
    {
      int_to_strp(ep_b3[i], s, 11, 3);

      for (var j=0; j < 3; j++)
	{
	  for (var k=0; k < 12; k++)
	    t[k] = (s[k] == j) ? 1 : 0;

	  ep_slice[i*3+j] = b2_slice[str_to_int(t, 12, 2)];
	}
    }
  // populated.push("ep_slice");
}

function copy(dst, src, n, row)
{
  for(var i=0; i < n; i++)
    dst[row*n + i] = (src[i]=='A') ? 10 : (src[i]=='B')?11:src[i];
}

function crtw(s)  // corner right twist 
{
  s[1] = cw[s[1]];	
  s[7] = ccw[s[7]]; 
  s[3] = cw[s[3]];	
  s[5] = ccw[s[5]]; 
}

function cltw(s)  // corner left twist 
{
  s[2] = cw[s[2]];	
  s[4] = ccw[s[4]];
  s[0] = cw[s[0]];	
  s[6] = ccw[s[6]];
}

function cftw(s)  // corner front twist 
{
  s[4] = cw[s[4]];	
  s[1] = ccw[s[1]];
  s[5] = cw[s[5]];	
  s[0] = ccw[s[0]];
}

function cbtw(s)  // corner back twist 
{
  s[7] = cw[s[7]];	
  s[2] = ccw[s[2]];
  s[6] = cw[s[6]];	
  s[3] = ccw[s[3]];
}

function eftw(s)  // edge front twist 
{
  s[0] = flip[s[0]]; 	
  s[5] = flip[s[5]];
  s[1] = flip[s[1]]; 	
  s[4] = flip[s[4]];
}

function ebtw(s)  // edge back twist 
{
  s[3] = flip[s[3]];	
  s[6] = flip[s[6]];
  s[2] = flip[s[2]];	
  s[7] = flip[s[7]];
}

function init_op16e()
{
  /* symmetry operations that maintain consistent edge twist values 
     for all edge position values */

  var op_fb = new Uint8Array([0,5,6,7,8,21,22,23,24,29,30,31,32,45,46,47]);

  /* for the symmetry operations that are not consistent, make the equivalent
     from a pair of operations using one of either UF or FR and one of the 16 
     consistent symmetries
  */
  
  // dependency("op_op", "init_op16e");

  for (var i=0; i < 2; i++)
    {
      var op1 = (i) ? OP_UF : OP_FR;

      for (var j=0; j < 16; j++)
	{
	  var op2 = op_fb[j];
	  op16e[op_op[op1*CUBE_SYM+op2]*2] = op1;
	  op16e[op_op[op1*CUBE_SYM+op2]*2+1] = op2;
	}
    }
  // populated.push("op16e");
}

function make_cubestr()
{
  set_colors_6c(0,1,2,3,4,5);

  for  (var i=0; i < 12; i++)
    for (var j=0; j < 2; j++)
      cubestr[edg_idx[i*2+j]] = edg[eps[i]*2 + ((ets[i]+j)&1)];

  for  (i=0; i < 8; i++)
    for (j=0; j < 3; j++)
      cubestr[cnr_idx[i*3+j]] = cnr[cps[i]*3 + ((untwc[cts[i]]+j)%3)];
}

//----------------------------------------------------------------------------
// mkt
//----------------------------------------------------------------------------

function populate_cp_sym() {
  var tmpstr = new Uint8Array(FACELETS);
  assign_centers_3c();
  for (var cp=1; cp < C_PRM; cp++) {
    int_to_strp(cp_b2[cp], cps, 7, 2);
    make_cubestr_cnr(cnr2);
    cp_sym[cp*CUBE_SYM] = cp;
    for (var op=1; op < CUBE_SYM; op++) {
      sym_op(tmpstr, cubestr, op);
      cp_sym[cp*CUBE_SYM+op] = convert_cnr_3c(tmpstr)>>16; 
    }
  }
  // populated.push("cp_sym");
}

function populate_ep_min() {
  var time0 = Date.now();
  var tmpstr = new Uint8Array(FACELETS);
  // dependency("inv_op", "populate_ep_min");
  assign_centers_3c();
  for (var ep=1; ep < E_PRM; ep++)
    ep_min_op[ep] = 99;
  for (var ep=1, min=1; ep < E_PRM; ep++) {
    if (ep_min[ep] != 0)
      continue;
    int_to_strp(ep_b3[ep], eps, 11, 3);
    make_cubestr_edg(edg2);
    ep_min[ep] = min;
    ep_min_op[ep] = 0;
    for (var op=1; op < CUBE_SYM; op++) {
      sym_op(tmpstr, cubestr, op);
      var epsym = convert_edg_3c(tmpstr);
      ep_min[epsym] = min;
      if (inv_op[op] < ep_min_op[epsym])
        ep_min_op[epsym] = inv_op[op];
    }
    min++;
  }
  // populated.push("ep_min");
  // populated.push("ep_min_op");
  if (show_init_time_details == 1) {
    var time1 = Date.now();
    document_write(((time1-time0)/1000).toFixed(2) + ' ep_min<br>');
  }
}
/*
function populate_ep_sym() {
  var time0 = Date.now();
  var tmpstr = new Uint8Array(FACELETS);
  var min_ix = new Uint16Array(E_PRM);  // 68 KB
  assign_centers_3c();
  for (var ep=1, mx=1; ep < E_PRM; ep++) {
    int_to_strp(ep_b3[ep], eps, 11, 3);
    make_cubestr_edg(edg2);
    var ix = ep * CUBE_SYM;
    ep_sym[ix] = ep;
    var min = ep;
    var min_op = 0;
    for (var op=1; op < CUBE_SYM; op++) {
      sym_op(tmpstr, cubestr, op);
      var epsym = convert_edg_3c(tmpstr); 
      ep_sym[ix + op] = epsym;
      if (epsym < min) {
        min = epsym;
        min_op = op;
      }
    }
    if (min_ix[min] == 0)
      min_ix[min] = mx++;
    ep_min[ep] = min_ix[min];
    ep_min_op[ep] = min_op;
  }
  // populated.push("ep_sym");
  // populated.push("ep_min");
  // populated.push("ep_min_op");
  if (show_init_time_details == 1) {
    var time1 = Date.now();
    document_write(((time1-time0)/1000).toFixed(2) + ' populate_ep_sym<br>');
  }
}
*/
function populate_min_ep()
{
  // dependency("ep_min_op", "populate_min_ep");
  for (var ep=0, i=0; ep < E_PRM; ep++)
    if (ep_min_op[ep] == 0)
      min_ep[i++] = ep;
  // populated.push("min_ep");
}

function make_cubestr_edg(edg)
{
  for (var i=0; i < 12; i++)
    for (var j=0; j < 2; j++)
      cubestr[edg_idx[i*2+j]] = edg[eps[i]*2 + ((ets[i]+j)&1)];
}

function make_cubestr_cnr(cnr)
{
  for (var i=0; i < 8; i++)
    for (var j=0; j < 3; j++)
      cubestr[cnr_idx[i*3+j]] = cnr[cps[i]*3 + ((untwc[cts[i]]+j)%3)];
}

function sym_op(dst, src, op)
{
  for (var i=0; i < FACELETS; i++) 
    dst[i] = src[map[op*FACELETS+i]];
}

function convert_edg_3c(s)
{
  var R = s[28];    
  var U = s[4];     
  var F = s[25];

  for (var i=0; i < 12; i++)
    {
      var x = s[edg_idx[i*2]];
      var y = s[edg_idx[i*2+1]];

      // eps[i]:  0=(FR,RF)  1=(UF,FU)  2=(UR,RU)

      if ((x == U) || ((x == F) && (y == R)))           // UF UR FR
	{
	  ets[i] = 0;
	  eps[i] = (x == F) ? 0 : (y == R) ? 2 : 1;
	}
      else                                              // FU RU RF
	{
	  ets[i] = 1;
	  eps[i] = (x == F) ? 1 : (y == U) ? 2 : 0;
	}
    }
  return(b3_ep[str_to_int(eps,11,3)]);
}

function convert_cnr_3c(s)
{
  var U = s[4];     
  var F = s[25];

  for (var i=0; i < 8; i++)
    {
      var x = s[cnr_idx[i*3]];
      var y = s[cnr_idx[i*3+1]];
      var z = s[cnr_idx[i*3+2]];

      if (x == U) 
	{
	  cts[i] = 0;	   // no twist
	  cps[i] = (y == F) ? 0 : 1;
	}
      else if (y == U) 
	{
	  cts[i] = 1;	   // 1/3 clockwise twist
	  cps[i] = (z == F) ? 0 : 1;
	}
      else 
	{
	  cts[i] = 2;	   // 1/3 counter-clockwise twist
	  cps[i] = (x == F) ? 0 : 1;
	}
    }

  i = b2_cp[str_to_int(cps, 7, 2)];
  var j = str_to_int(cts, 7, 3);
  return((i<<16)+ j);
}

function init_map(map, op_FR, op_UR, reflect)
{
  for (var i=0; i < 54; i++)               // map[0]
    map[i] = i;

  for (i=0; i < 54; i++)                   // map[1]
    map[54+i] = op_FR[i];

  for (i=0; i < 54; i++)                   // map[21]
    map[21*54+i] = op_UR[i];

  map_sym_op(2, 1, op_UR);    // FR1 UR1      map[2]
  map_sym_op(3, 2, op_UR);    // FR1 UR2      map[3]
  map_sym_op(4, 3, op_UR);    // FR1 UR3      map[4]
  map_sym_op(5, 1, op_FR);    // FR2
  map_sym_op(6, 5, op_UR);    // FR2 UR1
  map_sym_op(7, 6, op_UR);    // FR2 UR2
  map_sym_op(8, 7, op_UR);    // FR2 UR3 
  map_sym_op(9, 5, op_FR);    // FR3
  map_sym_op(10, 9, op_UR);   // FR3 UR1 
  map_sym_op(11, 10, op_UR);  // FR3 UR2 
  map_sym_op(12, 11, op_UR);  // FR3 UR3 
  map_sym_op2(13, 2, 9);      // UF1
  map_sym_op(14, 13, op_UR);  // UF1 UR1
  map_sym_op(15, 14, op_UR);  // UF1 UR2
  map_sym_op(16, 15, op_UR);  // UF1 UR3
  map_sym_op2(17, 7, 13);     // UF3
  map_sym_op(18, 17, op_UR);  // UF3 UR1
  map_sym_op(19, 18, op_UR);  // UF3 UR2
  map_sym_op(20, 19, op_UR);  // UF3 UR3
  map_sym_op(22, 21, op_UR);  // UR2
  map_sym_op(23, 22, op_UR);  // UR3

  // map[24]
  for(i=0; i < 54; i++) 
    map[24*54 + i] = reflect[i];                         

  // map[25-47]
  for (i=25; i < CUBE_SYM; i++) 
    map_sym_op(i, i-24, reflect);
}

function map_sym_op(dst, src, op)
{
  for (var i=0; i < FACELETS; i++) 
    map[dst*54+i] = map[src*54+op[i]];
}

function map_sym_op2(dst, src, op)
{
  for (var i=0; i < FACELETS; i++) 
    map[dst*54+i] = map[src*54+map[op*54+i]];
}

function populate_et_sym()
{
  var time0 = Date.now();
  var tmpstr = new Uint8Array(FACELETS);
  init_op16e();
  assign_centers_3c();
  int_to_strp(ep_b3[0], eps, 11, 3);
  for(var i=0; i < E_TWIST;  i++)
    for (var j=0; j < CUBE_SYM; j++)
      if (op16e[j*2] == 0) {
        int_to_strp(i, ets, 11, 2);
        make_cubestr_edg(edg2);
        sym_op(tmpstr, cubestr, map[j]);
        // convert_edg_3c(tmpstr);
        cubestr_to_ets(tmpstr);
        et_sym[i*CUBE_SYM+j] = str_to_int(ets,11,2);
    }
  if (show_init_time_details == 1) {
    var time1 = Date.now();
    document_write(((time1-time0)/1000).toFixed(2) + ' populate_et_sym part1<br>');
  }
  populate_et_sym_FR();
  if (show_init_time_details == 1) {
    var time2 = Date.now();
    document_write(((time2-time1)/1000).toFixed(2) + ' populate_et_sym part2 (FR)<br>');
  }

  if (ET_SYM_METHOD == 1)
    populate_et_sym_UF_m1();
  else
    populate_et_sym_UF_m2();

  // if (ET_SYM_METHOD == 3)
  //   populate_et_fr();
   
  update_et_sym();

  // populated.push("et_sym");
  if (show_init_time_details == 1) {
    var time3 = Date.now();
    document_write(((time3-time2)/1000).toFixed(2) + ' populate_et_sym part3 (UF)<br>');
    document_write(((time3-time0)/1000).toFixed(2) + ' populate_et_sym total<br>');
  }
}

function populate_et_sym_FR() {
  // var sav = new Uint8Array(12);
  var tmpstr = new Uint8Array(FACELETS);
  assign_centers_3c();
  var etsa = new Uint8Array(E_TWIST*12)
  for (var et=0; et < E_TWIST; et++) {
    int_to_strp(et, ets, 11, 2);
    for (var i=0; i < 12; i++)
      etsa[et*12+i] = ets[i];
  }
  for (var slice=0; slice < SLICE_PRM; slice++) {
    int_to_strp(ep_b3[slice_ep[slice*3]], eps, 11, 3);
    // memcpy(sav, eps, 12);
    for (var et=0; et < E_TWIST; et++) {
      // memcpy(eps, sav, 12);
      // int_to_strp(et, ets, 11, 2);
      for (i=0; i < 12; i++)
        ets[i] = etsa[et*12+i];
      make_cubestr_edg(edg2);
      sym_op(tmpstr, cubestr, OP_FR);
      // convert_edg_3c(tmpstr);
      cubestr_to_ets(tmpstr);
      et_sym_FR[slice*E_TWIST+et] = str_to_int(ets,11,2);
    }
  }
  // populated.push("et_sym_FR");
}

function cubestr_to_ets(s)
{
  for (var i=0; i < 12; i++) {
    var x = s[edg_idx[i*2]];
    var y = s[edg_idx[i*2+1]];
    ets[i] = ((x == s[4]) || ((x == s[25]) && (y == s[28]))) ? 0 : 1;
  }
}

function populate_et_sym_UF_m1() {
  // var sav = new Uint8Array(12);
  var tmpstr = new Uint8Array(FACELETS);
  assign_centers_3c();
  for (var slice=0; slice < SLICE_PRM; slice++) {
    int_to_strp(ep_b3[slice_ep[slice*3+1]], eps, 11, 3);
    // memcpy(sav, eps, 12);
    for (var et=0; et < E_TWIST; et++) {
      // memcpy(eps, sav, 12);
      int_to_strp(et, ets, 11, 2);
      make_cubestr_edg(edg2);
      sym_op(tmpstr, cubestr, OP_UF);
      // convert_edg_3c(tmpstr);
      cubestr_to_ets(tmpstr);
      et_sym_UF[slice*E_TWIST+et] = str_to_int(ets,11,2);
    }
  }
  // populated.push("et_sym_UF");
}

function populate_et_sym_UF_m2() {
  // for et_sym_method 2 populate first row only
  // var sav = new Uint8Array(12);
  var tmpstr = new Uint8Array(FACELETS);
  assign_centers_3c();
  int_to_strp(ep_b3[slice_ep[1]], eps, 11, 3);
  // memcpy(sav, eps, 12);
  for (var et=0; et < E_TWIST; et++) {
    // memcpy(eps, sav, 12);
    int_to_strp(et, ets, 11, 2);
    make_cubestr_edg(edg2);
    sym_op(tmpstr, cubestr, OP_UF);
    // convert_edg_3c(tmpstr);
    cubestr_to_ets(tmpstr);
    et_sym_UF[et] = str_to_int(ets,11,2);
  }
  // populated.push("et_sym_UF");
}

function dependency(arr, func) {
  // functions can check dependencies here (for arrays not already populated by init2)
  if (populated.indexOf(arr) == -1) {
    document.write('ERROR: prerequisite array [' + arr + '] is not populated, ');
    document.write('caller: ' + func + '()<br>');
  }
}

function update_et_sym()
{
  // update et_sym[] so that op16e[op*2+1] can be replaced by just op in get_etsym()
  for (var op=0; op < CUBE_SYM; op++) {
    if (op16e[op*2] != 0) {
      for (var et=0; et < E_TWIST; et++) {
        if (op16e[op*2] == OP_FR || ET_SYM_METHOD == 1)
          et_sym[et*CUBE_SYM + op] = et_sym[et*CUBE_SYM + op16e[op*2+1]];
        else {
          // for ET_SYM_METHOD 2, update so et_sym_UF[] is no longer needed 
          var et_fr = et_sym_FR[et];
          var et_uf = et_sym_UF[et];
          et_sym[et_fr*CUBE_SYM + op] = et_sym[et_uf*CUBE_SYM + op16e[op*2+1]];
        }
      }
    }
  }
}

function assign_centers_6c()
{
  cubestr[28] = 0;  
  cubestr[25] = 1;  
  cubestr[4]  = 2;
  cubestr[22] = 3;  
  cubestr[31] = 4;  
  cubestr[49] = 5; 
}

function assign_centers_3c()
{
  cubestr[28] = 0;  
  cubestr[25] = 1;  
  cubestr[4]  = 2;
  cubestr[22] = 0;  
  cubestr[31] = 1;  
  cubestr[49] = 2; 
}

function set_colors_3c(r, f, u)
{
  cnr2[0] = u;
  cnr2[1] = f;
  cnr2[2] = r;
  cnr2[3] = u;
  cnr2[4] = r;
  cnr2[5] = f;

  edg2[0] = f;   
  edg2[1] = r;   
  edg2[2] = u;
  edg2[3] = f;
  edg2[4] = u;
  edg2[5] = r;
}

function get_etsym_m1(ep, et, op) {
  return ((op16e[op*2] == 0) ? et_sym[et*CUBE_SYM+op] :
    ((op16e[op*2] == OP_FR) ?
     et_sym[et_sym_FR[ep_slice[ep*3]*E_TWIST+et]*CUBE_SYM+op] :
     et_sym[et_sym_UF[ep_slice[ep*3+1]*E_TWIST+et]*CUBE_SYM+op]));
}

function get_etsym_m2(ep, et, op) {
  return ((op16e[op*2] == 0) ? et_sym[et*CUBE_SYM+op] :
    ((op16e[op*2] == OP_FR) ?
    et_sym[et_sym_FR[ep_slice[ep*3]*E_TWIST+et]*CUBE_SYM+op] :
    et_sym[et_sym_FR[ep_slice[ep*3+1]*E_TWIST+et]*CUBE_SYM+op]));
}

function get_ctsym_m1(cpt, op) {
  return cpt_sym[cpt*CUBE_SYM + op];
}

function get_ctsym_m2(cpt, op) {
  return cpt_sym2[cpt_min[cpt*2]*CUBE_SYM + op_op[cpt_min[cpt*2+1]*CUBE_SYM+op]];
}

function get_ctsym_m3(cpsym, ct, op) {
  return ((ct_op_type[op] == 0) ? ct_sym[ct*CUBE_SYM+op] :
    ((ct_op_type[op] == 1) ?
    ct_ud_fb[cpsym*C_TWIST + ct_sym[ct*CUBE_SYM+op]] :
    ct_ud_fb[(69-cpsym)*C_TWIST + ct_sym[ct*CUBE_SYM+op]]));
}

function populate_cpt_sym() {
  var time0 = Date.now();
  var tmpstr = new Uint8Array(FACELETS);
  var op_type = new Uint8Array(CUBE_SYM); 
  var op_init = new Uint8Array([0,1,3,5,7,9,11,22,24,25,27,29,31,33,35,46]);
  for (var i=0; i < 16; i++)
    op_type[op_init[i]] = 1;
  assign_centers_3c();
  for (var cp=0; cp < C_PRM; cp++) {
    for (var ct=0; ct < C_TWIST; ct++) {
      var cpt = cp*C_TWIST + ct;
      int_to_strp(cp_b2[cp], cps, 7, 2);
      int_to_strp(ct, cts, 7, 3);
      make_cubestr_cnr(cnr2);
      cpt_sym[cpt*CUBE_SYM] = ct;
      for (var op=1; op < CUBE_SYM; op++) {
        // copy first row for the 16 consistent symmetries 
        if (op_type[op] == 1 && cp > 0)
          cpt_sym[cpt*CUBE_SYM+op] = cpt_sym[ct*CUBE_SYM+op]
        else {
          sym_op(tmpstr, cubestr, op);
          cpt_sym[cpt*CUBE_SYM+op] = convert_cnr_3c(tmpstr)&0xFFFF; 
        }
      }
    }
  }
  if (show_init_time_details == 1) {
    var time1 = Date.now();
    document_write(((time1-time0)/1000).toFixed(2) + ' populate_cpt_sym<br>');
  }
}

function populate_cpt_sym2() {
  var time0 = Date.now();
  var tmpbit = new Uint8Array(C_PRM_TW);  // 150 KB
  var tmpstr = new Uint8Array(FACELETS);
  assign_centers_3c();
  for (var cp=0, ix=0; cp < C_PRM; cp++) {
    for (var ct=0; ct < C_TWIST; ct++) {
      var cpt = cp*C_TWIST + ct;
      if (tmpbit[cpt] == 1)
        continue;
      int_to_strp(cp_b2[cp], cps, 7, 2);
      int_to_strp(ct, cts, 7, 3);
      make_cubestr_cnr(cnr2);
      cpt_sym2[ix*CUBE_SYM] = ct;
      for (var op=1; op < CUBE_SYM; op++) {
        sym_op(tmpstr, cubestr, op);
        var cptsym = convert_cnr_3c(tmpstr);
        var ctsym = cptsym&0xFFFF;
        cpt_sym2[ix*CUBE_SYM+op] = ctsym;
        cptsym = (cptsym>>16)*C_TWIST + ctsym;
        tmpbit[cptsym] = 1;
      }
      ix++;
    }
  }
  // populated.push("cpt_sym2");
  if (show_init_time_details == 1) {
    var time1 = Date.now();
    document_write(((time1-time0)/1000).toFixed(2) + ' populate_cpt_sym2<br>');
  }
}

function populate_cpt_min() {
  var time0 = Date.now();
  var tmpstr = new Uint8Array(FACELETS);
  assign_centers_3c();
  for (var cp=0, min=0; cp < C_PRM; cp++) {
    for (var ct=0; ct < C_TWIST; ct++) {
      var cpt = cp*C_TWIST + ct;
      if (cpt_min[cpt*2] != 0) 
        continue;
      int_to_strp(cp_b2[cp], cps, 7, 2);
      int_to_strp(ct, cts, 7, 3);
      make_cubestr_cnr(cnr2);
      cpt_min[cpt*2] = min;
      for (var op=1; op < CUBE_SYM; op++) {
        sym_op(tmpstr, cubestr, op);
        var cptsym = convert_cnr_3c(tmpstr);
        cptsym = (cptsym>>16)*C_TWIST + (cptsym&0xFFFF);
        cpt_min[cptsym*2] = min;
        cpt_min[cptsym*2+1] = op;
      }
      min++;
    }
  }
  if (show_init_time_details == 1) {
    var time1 = Date.now();
    document_write(((time1-time0)/1000).toFixed(2) + ' populate_cpt_min<br>');
  }
}

function populate_ept_op_idx()
{
  var tmp = new Uint8Array(E_PRM);  // 34 KB

  for (var i=1; i < E_PRM; i++)
    ept_op_idx[i] = NIL;

  for (var i=0; i < E_PRM; i++)
    tmp[ep_min[i]]++;

  for (var i=1, k=1, ct=1; i < E_PRM; i++)
    if (tmp[ep_min[i]] != CUBE_SYM)
      ept_op_idx[i] = k++;
}

function populate_ept_min_op()
{
  var time0 = Date.now();

  var oplist = new Uint8Array(50);
  var tmp_idx = new Int16Array(EP_MULTI_MIN_OP);  // 4 KB
  var ep_sym_tmp = new Uint16Array(CUBE_SYM);
  var tmpstr = new Uint8Array(FACELETS);
 
  if (EPT_OP_METHOD == 1)
    var ept_op_tmp = ept_min_op;
  else 
    var ept_op_tmp = new Int8Array(EP_MULTI_MIN_OP*E_TWIST);  //  4116 KB

  // dependency("ep_min", "populate_ept_min_op");
  // dependency("et_sym", "populate_ept_min_op");
  // dependency("inv_op", "populate_ept_min_op");

  populate_ept_op_idx();

  // for (var i=0; i < EP_MULTI_MIN_OP*E_TWIST; i++)
  //   ept_op_tmp[i] = NIL;

  for (var i=0, ix=0; i < E_PRM; i++) 
    {
      if (ep_min_op[i] != 0 || ept_op_idx[i] == NIL)
	continue;

      int_to_strp(ep_b3[i], eps, 11, 3);
      make_cubestr_edg(edg2);
      ep_sym_tmp[0] = i;
      for (var op=1; op < CUBE_SYM; op++) {
        sym_op(tmpstr, cubestr, op);
        ep_sym_tmp[op] = convert_edg_3c(tmpstr);
      }

      for (var j=0; j < E_TWIST; j++)
	{
	  if (ept_op_tmp[ept_op_idx[i]*E_TWIST+j] != 0)
	    continue;

          ept_op_tmp[ept_op_idx[i]*E_TWIST+j] = 0;
	  var min = i*E_TWIST + j;

	  for (var n=0, k=1; k < CUBE_SYM; k++)
	    {
	      var ep = ep_sym_tmp[k];
	      var et = get_etsym(i, j, k);
	      ept_op_tmp[ept_op_idx[ep]*E_TWIST+et] = inv_op[k];
	      if (ep*E_TWIST + et == min)
		oplist[n++] = k;
	    }  

	  if (n)
	    {
	      ept_min_ops[ix*27] = i;
	      ept_min_ops[ix*27+1] = j;
	      ept_min_ops[ix*27+2] = n;
	      
	      if (n < 47)
		for (k=0; k < n; k++)
		  ept_min_ops[ix*27+(k+3)] = oplist[k];
	      ix++;
	    }
	}
    }

  if (show_init_time_details == 1) {
    var time1 = Date.now();
    document_write(((time1-time0)/1000).toFixed(2) + ' populate_ept_min_op part1<br>');
  }

  if (EPT_OP_METHOD == 2) {

  // the following eliminates duplicate rows which reduces the ept_min_op 
  // array from 2058 to 1290 rows (see rch.js for size difference)

  var ept_op_sort = [];  // 4116 KB (after populating)

  for (var i=0, j=0; i < EP_MULTI_MIN_OP; i++) {
    ept_op_sort[i] = new Int8Array(E_TWIST);
    substr_int8(ept_op_sort[i], ept_op_tmp, i*E_TWIST, E_TWIST);
  }

  ept_op_sort.sort(ept_op_row_compare);

  for (i=ix=1; i < EP_MULTI_MIN_OP; i++)
    if (ept_op_row_compare(ept_op_sort[i], ept_op_sort[ix-1]) != 0) 
      memcpy(ept_op_sort[ix++], ept_op_sort[i], E_TWIST);

  ept_op_sort.length = ix;

  if (ept_op_sort.length != N_EPT_MIN_OP) 
    document_write('Program Error in populate_ept_min_op, ept_op_sort.length != ' + 
      N_EPT_MIN_OP + '<br>');

  var row = new Int8Array(E_TWIST);  // 2 KB

  for (i=0; i < EP_MULTI_MIN_OP; i++) {
    substr_int8(row, ept_op_tmp, i*E_TWIST, E_TWIST);
    tmp_idx[i] = bsearch(row, ept_op_sort);
    if (tmp_idx[i] == NIL)
      document_write('Program Error in populate_ept_min_op, row not found<br>');
  }

  for (i=0; i < E_PRM; i++)
    if (ept_op_idx[i] != NIL)
      ept_op_idx[i] = tmp_idx[ept_op_idx[i]];

  for (i=0; i < N_EPT_MIN_OP; i++)
    for (j=0; j < E_TWIST; j++)
      ept_min_op[i*E_TWIST+j] = ept_op_sort[i][j];

  }

  // populated.push('ept_min_op');
  // populated.push('ept_min_ops');

  if (show_init_time_details == 1) {
    var time2 = Date.now();
    document_write(((time2-time1)/1000).toFixed(2) + ' populate_ept_min_op part2<br>');
    document_write(((time2-time0)/1000).toFixed(2) + ' populate_ept_min_op total<br>');
  }
}

function substr_int8(sub, str, start, len) {
  for (var i=start, j=0; i < start+len; i++, j++)
    sub[j] = str[i];
}

function ssearch(row, arr) {
  for (var i=0; i < arr.length; i++) {
    for (var f=j=0; j < row.length; j++) 
      if (row[j] != arr[i][j]) {
        f = 1;
        break;
      }
    if (f == 0)
      return(i); 
  }
  return(-1);
}

function bsearch(row, arr) {
  var lo = 0;
  var hi = arr.length;
  for (var c=0; c <= 10; c++) {
    var mid = Math.floor((lo+hi)/2);
    if (ept_op_row_compare(row, arr[mid]) > 0)
       lo = mid;
    else if (ept_op_row_compare(row, arr[mid]) < 0)
       hi = mid;
    else
      return(mid);
  }
  return(-1);
}

function ept_op_row_compare(a, b) {
  for (var i=0; i < E_TWIST; i++) {
    if(a[i] < b[i]) return -1; 
    if(a[i] > b[i]) return 1; 
  } 
  return(0);
}

function init_seq() {
  mvlist1[0] = 0;
  mvlist1[1] = 1;
  mvlist1[2] = NIL;
  for (var i=0; i < MOVES; i++)
    mvlist2[i] = i;
  mvlist2[i] = NIL;
  init_seq_gen(6,3);
}

function init_seq_gen(x, y) {
  for (var i=0; i < MOVES; i++) {
    seq_gen[i] = new Int8Array(MOVES);
    for (var j=0, k=0; j < Math.floor(i/x)*x; j++, k++)
      seq_gen[i][k] = j;
    for (j=Math.floor(i/y)*y+y; j < MOVES; j++, k++)
      seq_gen[i][k] = j;
    seq_gen[i][k] = NIL;
  }
}

var cfg_list = new Uint32Array(CFG_LIST_3C*3);  // 47 KB

function chk_dup_3c(ep, et, cp, ct, n)
{	
  var ept = ep*E_TWIST + et;
  var cpt = cp*C_TWIST + ct;
  for (var i=0; i < cfg_idx; i++)
    if (cfg_list[i*3] == ept && cfg_list[i*3+1] == cpt && cfg_list[i*3+2] <= n)
      return(1);
  if (cfg_idx >= CFG_LIST_3C)
    document_write("ERROR: Max size exceeded in chk_dup_3c()<br>");
  cfg_list[cfg_idx*3] = ept;
  cfg_list[cfg_idx*3+1] = cpt;
  cfg_list[cfg_idx*3+2] = n;
  cfg_idx++;
  return(0);
}

function populate_ept_ops_indexes() {
  // dependency("ep_min", "populate_ept_ops_indexes");
  // dependency("ept_min_ops", "populate_ept_ops_indexes");
  for (var i=0; i < MIN_EP; i++)
    ept_ops_ix1[i] = NIL;

  for (var i=0; i < N_EPT_OPS_IX2; i++)  // 103
    for (var j=0; j < E_TWIST; j++)
      ept_ops_ix2[i*E_TWIST+j] = NIL;

  for (var i=0, ix=0; i < N_EPT_MIN_OPS; i++) {  // 7331
    var ep = ep_min[ept_min_ops[i*27]];
    if (ept_ops_ix1[ep] == NIL)
      ept_ops_ix1[ep] = ix++;

    // ept_ops_ix2[ix-1][ept_min_ops[i][1]] = i;
    ept_ops_ix2[(ix-1)*E_TWIST + ept_min_ops[i*27+1]] = i;
  }
  // populated.push("ept_ops_ix1");
  // populated.push("ept_ops_ix2");
}

function get_min_op_3c(cp, ct, op, ix) {	
  var n = ept_min_ops[ix*27+2];
  var cpt = cp*C_TWIST + ct;
  if (n == 47)
    return(inv_op[cpt_min[cpt*2+1]]);
  var cpsav = cp_sym[cp*CUBE_SYM+op];
  var ctsav = (CT_SYM_METHOD == 3) ?
    get_ctsym(cpsav, ct, op) :
    get_ctsym(cpt, op);
  var cptsav = cpsav*C_TWIST + ctsav;
  var min = cptsav;
  for (var i=dif=0; i < n; i++) {
    var iop = ept_min_ops[ix*27+(i+3)];
    var cpsym = cp_sym[cpsav*CUBE_SYM+iop];
    var ctsym = (CT_SYM_METHOD == 3) ?
      get_ctsym(cpsym, ctsav, iop) :
      get_ctsym(cptsav, iop);
    var sym = cpsym*C_TWIST + ctsym;
    if (sym < min) {
      var min = sym;
      var min_op = iop;
      var dif = 1;
    }
  }
  if (dif)
    return(op_op[op*CUBE_SYM+min_op]);
  else
    return(op);
}

function populate_cp6c_mov()
{
  var time0 = Date.now();
  var s = new Uint8Array(8);
  var tmp = new Uint8Array(8);
  
  for (var i=0; i < C_PERM; i++)
    {
      int_to_perm(i, s, 8);

      for (var j=0; j < 8; j++) 
	tmp[j] = s[j]/4;
	// tmp[j] = Math.floor(s[j]/4);

      for (j=0; j < MOVES; j++)
	{
	  for (var k=0; k < 8; k++) 
	    tmp[k] = s[cmv[j*8+k]]; 

	  cp6c_mov[i*MOVES+j] = perm_to_int(tmp, 8);
	}
    }
  // populated.push("cp6c_mov");
  if (show_init_time_details == 1) {
    var time1 = Date.now();
    document_write(((time1-time0)/1000).toFixed(2) + ' populate_cp6c_mov<br>');
  }
}

function populate_op_tables() 
{
  var time0 = Date.now();
  var mp = new Uint16Array(CUBE_SYM);
  var tmpstr = new Uint8Array(FACELETS);
  var ep_sym_tmp = [];

  // populate mp with with an ep that has 48 uniq symmetries (ep=EP_OP_ROW)
  assign_centers_3c();
  int_to_strp(ep_b3[EP_OP_ROW], eps, 11, 3);
  make_cubestr_edg(edg2);
  mp[0] = EP_OP_ROW;
  for (var op=1; op < CUBE_SYM; op++) {
    sym_op(tmpstr, cubestr, op);
    mp[op] = convert_edg_3c(tmpstr);
  }

  // populate ep_sym_tmp with a row for each of the 48 ep values in mp
  for (var i=0; i < CUBE_SYM; i++) {
    var ep = mp[i];
    ep_sym_tmp[ep] = [];
    int_to_strp(ep_b3[ep], eps, 11, 3);
    make_cubestr_edg(edg2);
    ep_sym_tmp[ep][0] = ep;
    for (var op=1; op < CUBE_SYM; op++) {
      sym_op(tmpstr, cubestr, op);
      ep_sym_tmp[ep][op] = convert_edg_3c(tmpstr);
    }
  }

  for (var i=0; i < CUBE_SYM; i++)
    for (var j=0; j < CUBE_SYM; j++)
      if (ep_sym_tmp[mp[i]][j] == mp[0])
	inv_op[i] = j;

  for (i=0; i < CUBE_SYM; i++)  
    for (j=0; j < CUBE_SYM; j++)
      for (var k=0; k < CUBE_SYM; k++)
	if (mp[i] == ep_sym_tmp[mp[j]][k])
	  op_op[j*CUBE_SYM+k] = i;

  // populated.push("inv_op");
  // populated.push("op_op");
  if (show_init_time_details == 1) {
    var time1 = Date.now();
    document_write(((time1-time0)/1000).toFixed(2) + ' populate_op_tables<br>');
  }
}

function populate_epr_mov()
{
  var time0 = Date.now();
  var s = new Uint8Array([0,1,2,3,0,1,2,3,0,0,0,0]);
  var s2 = new Uint8Array(4);
  var tmp = new Uint8Array(12);
  var epr = new Uint8Array(3);
  var eps_3c = new Uint8Array(12);
  var eps_6c = new Uint8Array(12);

  for (var mv=0; mv < MOVES; mv++)
      for (var i=0; i < SLICE_PRM; i++)
	{
	  int_to_strp(ep_b3[slice_ep[i*3+2]], eps_3c, 11, 3);
	  
	  for (var j=0; j < 24; j++)
	    {
              int_to_perm(j, s2, 4);

              for (var k=0; k < 4; k++) 
                s[8+k] = s2[k];

	      mk_eps_6c(eps_6c, eps_3c, s);

	      for (var k=0, x=0; k < 12; k++) 
		{
                  var n = eps_6c[emv[mv*12+k]]-8;

		  if (n >= 0)
		    tmp[x++] = n;
		}

                epr_mov[i*24*MOVES + j*MOVES + mv] = perm_to_int(tmp, 4); 
	    }
	}
  // populated.push("epr_mov");
  if (show_init_time_details == 1) {
    var time1 = Date.now();
    document_write(((time1-time0)/1000).toFixed(2) + ' populate_epr_mov<br>');
  }
}

function populate_epr_mov2() {
  var i, j, k, ix, mv;
  var epr = new Int8Array(3);
  var eprs = new Int8Array([0,1,2,3,0,1,2,3,0,0,0,0]);
  var eps_3c = new Int8Array(12);
  var eps_6c = new Int8Array(12);
  var tmp = new Int8Array(12);
  var tmp2 = new Int8Array(24);
  for (mv=0; mv < MOVES; mv++) {
    for (i=0; i < SLICE_PRM; i++) {
      int_to_strp(ep_b3[slice_ep[i*3+2]], eps_3c, 11, 3);
      for (j=0; j < 24; j++) {
        int_to_perm(j, tmp, 4);
        for (var k=0; k < 4; k++)
          eprs[8+k] = tmp[k];
        mk_eps_6c(eps_6c, eps_3c, eprs);
        for (k=0; k < 12; k++)                   
          tmp[k] = eps_6c[emv[mv*12+k]];
        ep6c_epr(tmp, epr);
        tmp2[j] = epr[2];
        if (j == 0) {
          ix = tmp2[0];
          epr_mov_idx[i*18+mv] = ix;
          if (epr_mov2[ix*24] != 0)
            break;
        }
      }
      if (epr_mov2[ix*24] == 0)
        for (k=0; k < 24; k++)
          epr_mov2[ix*24+k] = tmp2[k];
    }
  }
}

function mk_eps_6c(eps_6c, eps_3c, s)
{
  var y = 4;
  var z = 8;
  for (var i=0, x=0; i < 12; i++)
    {
      if (eps_3c[i] == 0)
	eps_6c[i] = s[x++];
      
      else if (eps_3c[i] == 1)
	eps_6c[i] = s[y++] + 4;
      
      else if (eps_3c[i] == 2)
	eps_6c[i] = s[z++] + 8;
    }
}

function ep6c_ep3c(s) {
  var tmp = new Uint8Array(12);
  for (var i=0; i < 12; i++)
    tmp[i] = s[i]/4;
  return(b3_ep[str_to_int(tmp,11,3)]);
}

function ep6c_epr(s, epr)
{
  var t0 = new Uint8Array(4);
  var t1 = new Uint8Array(4);
  var t2 = new Uint8Array(4);

  /* example:

       ep6c: 3768B9042A15
       ep3c: 011222010201
             ------------
     epr[0]: 3     0 2 1   3021 -> 19
     epr[1]:  32    0   1  3201 -> 22
     epr[2]:    031   2    0312 ->  4
 */

  for (var i=0, x0=0, x1=0, x2=0; i < 12; i++)
    if (s[i]>>2 == 0)
      t0[x0++] = s[i];
    else if (s[i]>>2 == 1)
      t1[x1++] = s[i]-4;
    else 
      t2[x2++] = s[i]-8;		
  
  epr[0] = perm_to_int(t0, 4);
  epr[1] = perm_to_int(t1, 4);
  epr[2] = perm_to_int(t2, 4);
}

function convert_edg_6c(s, eps, ets)
{	
  var L = s[22];   var D = s[49];   var B = s[31];
  var R = s[28];   var U = s[4];    var F = s[25];

  set_colors_6c(R, F, U, L, B, D);

  for (var i=0; i < 12; i++)
    {
      var x = s[edg_idx[i*2]];
      var y = s[edg_idx[i*2+1]];

      if ((x == U || x == D) || 
	  ((x == F || x == B) && (y == L || y == R))) 
	{
	  ets[i] = 0;
	  eps[i] = get_eps(x, y);
	}
      else 
	{
	  ets[i] = 1;
	  eps[i] = get_eps(y, x);
	}
    }
}

function get_eps(a, b)
{
  for (var i=0; i < 12; i++)
    if ((edg[i*2] == a) && (edg[i*2+1] == b))
      return(i);
}

function convert_cnr_6c(s, cps, cts)
{
  var L = s[22];   var D = s[49];  var B = s[31];
  var R = s[28];   var U = s[4];   var F = s[25];

  set_colors_6c(R, F, U, L, B, D);

  for (var i=0; i < 8; i++)
    {
      var x = s[cnr_idx[i*3]];
      var y = s[cnr_idx[i*3+1]];
      var z = s[cnr_idx[i*3+2]];

      if (x == U || x == D)
	{
	  cts[i] = 0;               /* no twist */
	  cps[i] = get_cps(x,y,z);
	}
      else if (y == U || y == D) 
	{
	  cts[i] = 1;	            /* 1/3 clockwise twist */
	  cps[i] = get_cps(y,z,x);
	}
      else 
	{
	  cts[i] = 2;	            /* 1/3 counter-clockwise twist */
	  cps[i] = get_cps(z,x,y);
	}
    }
  return(perm_to_int(cps,8));
}

function get_cps(a, b, c)
{
  for (var i=0; i < 8; i++)
    if ((cnr[i*3] == a) && (cnr[i*3+1] == b) && (cnr[i*3+2] == c))
      return(i);
  return(9);
}	

function set_colors_6c(r, f, u, l, b, d)
{
  cnr = [u,f,l,d,f,r,d,b,l,u,b,r,d,l,f,u,r,f,u,l,b,d,r,b];
  edg = [f,l,f,r,b,r,b,l,u,f,d,f,d,b,u,b,u,l,u,r,d,r,d,l];

  // cnr = [[u,f,l],[d,f,r],[d,b,l],[u,b,r],[d,l,f],[u,r,f],[u,l,b],[d,r,b]];
  // edg = [[f,l],[f,r],[b,r],[b,l],[u,f],[d,f],[d,b],[u,b],[u,l],[u,r],[d,r],[d,l]];
}

function parity(s, len)
{
  var tmp = [];

  for (var i = 0; i < len; i++) 
    tmp[i] = s[i];

  for (var i=0, n=0; i < len; i++)
    while (tmp[i] != i)
      {	
	var x = tmp[i];
	tmp[i] = tmp[x];
	tmp[x] = x;
	n++;
      }
  return(n%2);
}

function color_str(c)
{   
  if      (c == "W") return "white";
  else if (c == "Y") return "yellow";
  else if (c == "R") return "red";
  else if (c == "O") return "orange";
  else if (c == "B") return "blue";
  else if (c == "G") return "green";
  else if (c == "L") return "lightgray";
}

function populate_ct_sym()
{
  var time0 = Date.now();
  var s = new Int8Array(FACELETS);
  assign_centers_3c();
  populate_ct_op_type();
  for (var ct=0, ix=0; ct < C_TWIST; ct++, ix+=CUBE_SYM)
    ct_sym[ix] = ct;
  int_to_strp(cp_b2[0], cps, 7, 2);
  for (var ct=1, ix=CUBE_SYM; ct < C_TWIST; ct++, ix+=CUBE_SYM) {
    int_to_strp(ct, cts, 7, 3);
    make_cubestr_cnr(cnr2);
    for (var op=1; op < CUBE_SYM; op++) {
      sym_op(s, cubestr, map[op]);
      ct_sym[ix+op] = get_ct(s);
    }
  }
  for (var cp=0, ix=0; cp < C_PRM; cp++, ix+=C_TWIST) {
    int_to_strp(cp_b2[cp], cps, 7, 2);
    for (var ct=0; ct < C_TWIST; ct++) {
      int_to_strp(ct, cts, 7, 3);
      var i = 0;
      for (; i < 4; i++) if (cps[i] == 1) cts[i] = (cts[i]+2)%3;
      for (; i < 8; i++) if (cps[i] == 0) cts[i] = (cts[i]+1)%3;
      ct_ud_fb[ix+ct] = str_to_int(cts, 7, 3);
    }
  }
  // populated.push('ct_sym');
  if (show_init_time_details == 1) {
    var time1 = Date.now();
    document_write(((time1-time0)/1000).toFixed(2) + ' populate_ct_sym total<br>');
  }
}

function populate_ct_op_type() {
  var op0 = new Uint8Array([ 0, 1, 3, 5, 7, 9,11,22,24,25,27,29,31,33,35,46]); // UD -> UD
  var op1 = new Uint8Array([13,14,15,16,17,18,19,20,37,38,39,40,41,42,43,44]); // UD -> FB
  var op2 = new Uint8Array([ 2, 4, 6, 8,10,12,21,23,26,28,30,32,34,36,45,47]); // UD -> LR
  for (var i=0; i < 16; i++) {
    ct_op_type[op1[i]] = 1;
    ct_op_type[op2[i]] = 2;
  }
}

function get_ct(s) {
  for (var i=0, ix=0; i < 8; i++, ix+=3)
    cts[i] = ((s[cnr_idx[ix]]==s[4])?0:((s[cnr_idx[ix+1]]==s[4])?1:2));
  return(str_to_int(cts, 7, 3));
}

function update_ct_sym() {
  var tmp = new Int16Array(C_TWIST);
  for (var ct=0; ct < C_TWIST; ct++)
    tmp[ct_ud_fb[69*C_TWIST + ct]]= ct;
  for (var ct=0, ix=0; ct < C_TWIST; ct++, ix+=CUBE_SYM)
    for (var op=0; op < CUBE_SYM; op++)
      if (ct_op_type[op] == 2)
        ct_sym[ix+op] = tmp[ct_sym[ix+op]];
}

function document_write(s) {
  // document.write(s);
  logtxt.push(s);
}

var logdiv;

function show_log(title, params) { 
  var fse = getFullscreenElement();
  if (typeof title == 'undefined')
     title = 'Solve Log:';
  if (!(typeof fse == 'undefined' || fse == null)) {
    var s = '<style>\n';
    s += ' .btn {height:28px; width:100px; border-radius:15px;\n';
    s += '   background:white; padding:0px; border:none}\n';
    s += ' .tabdata td {text-align:right; padding:2px 10px;\n';
    s += '   border-color:black}\n';
    s += '</style>\n';
    s += '<br>' + title + '<br>\n';
    for (var i=0; i < logtxt.length; i++)
      s += logtxt[i] + '\n';
    s += '<button class=btn onclick="exitFullScreen()">Back</button>\n';
    s += '<br><br><br>\n';
    logdiv = document.createElement('div'); 
    logdiv.id = 'log';
    logdiv.style.overflow = 'auto';
    logdiv.style.paddingLeft = '10%';
    logdiv.style.backgroundColor = '#38383D';
    logdiv.style.textAlign = 'left';
    document.body.appendChild(logdiv);
    logdiv.innerHTML = s;
    requestFullscreenFunc(logdiv);
  } 
  else {
    if (typeof(logwin) != 'undefined')
      logwin.close();
    logwin = window.open('', 'rc_solve_log');
    logwin.document.write('<!doctype html>\n');
    logwin.document.write('<html>\n');
    logwin.document.write('<head>\n');
    logwin.document.write('<meta name=viewport\n');
    logwin.document.write('  content="width=device-width, initial-scale=1">\n');
    logwin.document.write('<style>\n');
    logwin.document.write(' body {color:white; background-color:#38383D;\n');
    logwin.document.write('   margin-left:10%; margin-right:10%}\n');
    logwin.document.write(' table {border-style:solid; border-color:#38383D;}\n');
    logwin.document.write(' .tabdata td {text-align:right; padding:2px 10px;\n');
    logwin.document.write('   border-color:black}\n');
    logwin.document.write(' .btn {height:28px; width:100px; border-radius:15px;\n');
    logwin.document.write('   background:white; padding:0px; border:none;}\n');
    logwin.document.write('</style>\n');
    logwin.document.write('</head>\n');
    logwin.document.write('<body >\n');
    logwin.document.write('<br>' + title + '<br>\n');
    if (typeof params != 'undefined') {
      logwin.document.write('<br>Params: ' + params + '<br><br>\n\n');
      logwin.document.write('Concurrent Processes: ' + conc + '<br>\n');
    }
    for (var i=0; i < logtxt.length; i++)
      logwin.document.write(logtxt[i] + '\n');
    logwin.document.write('<button class=btn\n');
    logwin.document.write('  onclick="window.close()">Close</button>\n');
    logwin.document.write('<br><br>\n');
    logwin.document.write('</body>\n');
    logwin.document.write('</html>\n');
    logwin.document.title = title;
    logwin.document.close();
  }
}

function exitFullScreen() {
  exitFullscreenFunc();
  document.body.removeChild(logdiv);
  if (fs == 1 && typeof fullscreenElement == 'undefined')
    requestFullscreenFunc(document.body);
}

function getFullscreenElement() {
  return (document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement);
}

function requestFullscreenFunc(elem) {
  if (elem.requestFullscreen) 
    elem.requestFullscreen();
  else if (elem.mozRequestFullScreen)
    elem.mozRequestFullScreen();
  else if (elem.webkitRequestFullscreen)
    elem.webkitRequestFullscreen();
  else if (elem.msRequestFullscreen)
    elem.msRequestFullscreen();
}

function exitFullscreenFunc() {
  if (document.exitFullscreen)
    document.exitFullscreen();
  else if (document.mozCancelFullScreen)
    document.mozCancelFullScreen();
  else if (document.webkitExitFullscreen)
    document.webkitExitFullscreen();
  else if (document.msExitFullscreen)
    document.msExitFullscreen();
}

function show_cube_layout(s)
{
  // document_write('<pre style=margin:0>');
  document_write('<pre>');
  document_write('    ' + s[0] + s[1] + s[2]);
  document_write('    ' + s[3] + s[4] + s[5]);
  document_write('    ' + s[6] + s[7] + s[8]);
  document_write(s[9]  + s[10] + s[11] + ' ' + s[12] + s[13] + s[14] + ' ' + 
                 s[15] + s[16] + s[17] + ' ' + s[18] + s[19] + s[20]);
  document_write(s[21] + s[22] + s[23] + ' ' + s[24] + s[25] + s[26] + ' ' +
                 s[27] + s[28] + s[29] + ' ' + s[30] + s[31] + s[32]);
  document_write(s[33] + s[34] + s[35] + ' ' + s[36] + s[37] + s[38] + ' ' +
                 s[39] + s[40] + s[41] + ' ' + s[42] + s[43] + s[44]);
  document_write('    ' + s[45] + s[46] + s[47]);
  document_write('    ' + s[48] + s[49] + s[50]);
  document_write('    ' + s[51] + s[52] + s[53]);
  document_write('</pre>');
}

function animcube_params() {
  var p = '';
  if (typeof align != 'undefined')         p += '&align=' + align;
  if (typeof bgcolor != 'undefined')       p += '&bgcolor=' + bgcolor;
  if (typeof borderwidth != 'undefined')   p += '&borderwidth=' + borderwidth;
  if (typeof butbgcolor != 'undefined')    p += '&butbgcolor=' + butbgcolor;
  if (typeof buttonheight != 'undefined')  p += '&buttonheight=' + buttonheight;
  if (typeof clickprogress != 'undefined') p += '&clickprogress=' + clickprogress;
  if (typeof counter != 'undefined')       p += '&counter=' + counter;
  if (typeof cubecolor != 'undefined')     p += '&cubecolor=' + cubecolor;
  if (typeof doublespeed != 'undefined')   p += '&doublespeed=' + doublespeed;
  if (typeof edit != 'undefined')          p += '&edit=' + edit;
  if (typeof fonttype != 'undefined')      p += '&fonttype=' + fonttype;
  if (typeof hint != 'undefined')          p += '&hint=' + hint;
  if (typeof hintborder != 'undefined')    p += '&hintborder=' + hintborder;
  if (typeof hinthoriz != 'undefined')     p += '&hinthoriz=' + hinthoriz;
  if (typeof hintvert != 'undefined')      p += '&hintvert=' + hintvert;
  if (typeof metric != 'undefined')        p += '&metric=' + metric;
  if (typeof movetext != 'undefined')      p += '&movetext=' + movetext;
  if (typeof movetextspace != 'undefined') p += '&movetextspace=' + movetextspace;
  if (typeof perspective != 'undefined')   p += '&perspective=' + perspective;
  if (typeof position != 'undefined')      p += '&position=' + position;
  if (typeof repeat != 'undefined')        p += '&repeat=' + repeat;
  if (typeof scale != 'undefined')         p += '&scale=' + scale;
  if (typeof slidercolor != 'undefined')   p += '&slidercolor=' + slidercolor;
  if (typeof snap != 'undefined')          p += '&snap=' + snap;
  if (typeof speed != 'undefined')         p += '&speed=' + speed;
  if (typeof textsize != 'undefined')      p += '&textsize=' + textsize;
  if (typeof troughcolor != 'undefined')   p += '&troughcolor=' + troughcolor;
  if (typeof yz != 'undefined')            p += '&yz=' + yz;
  return p;
  /* these params are not allowed:
     buttonbar, colorscheme, colors, config, demo, facelets, 
     gabbacolors, initmove, initrevmove, move, pos, randmoves,
     scramble, scw, supercube, superfacelets
  */
}

// ----------------------------------------------------------------------------
// convlib
// ----------------------------------------------------------------------------

var last_digit = new Uint8Array([0,0,0,0,0,0,0,0,0,1,0,0,0,2,1,0,2,1,0,3]);
var exp = new Uint32Array(75);
var fac = new Uint32Array(15);

function init_conv() {
  for (var i=2; i <= 4; i++) {
    exp[i*15+1] = i;
    for (var j=2; j <= 12; j++) 
      exp[i*15+j] = exp[i*15+(j-1)]*i;
  }
  fac[2] = 2;
  for (var i=3; i <= 12; i++)
    fac[i] = i*fac[i-1];
}

function int_to_str(n, s, len, base) {
  for (var i=0, j=exp[base*15+(len-1)]; i < len; n%=j, j/=base, i++)
    s[i] = Math.floor(n/j);
}

function int_to_strp(n, s, len, base) {
  for (var i=0, j=exp[base*15+(len-1)]; i < len; n%=j, j/=base, i++)
    s[i] = Math.floor(n/j);
  for (var i=j=0; i < len; i++) 
    j += s[i]; 
  s[len] = last_digit[base*4+(j%base)];
}

var gcta = new Uint32Array(10);

function int_to_str_lim(n, s, len, base, lim) {
  for (var i=0; i < base; i++) 
    gcta[i] = 0;
  for (var i=0, j=exp[base*15+(len-1)]; i < len; n%=j, j/=base, i++) { 
      s[i] = Math.floor(n/j);
      gcta[s[i]]++;
      if (gcta[s[i]] > lim)
	return(0);
    }
  for (var i=0; i < base; i++) 
    if (gcta[i] < lim) 
      s[len] = i;
  return(1);
}

var gtmp = new Uint8Array(15);

function int_to_perm(n, s, len) {
  for (var i=0; i < len; i++) 
    gtmp[i] = i;
  len--;
  for (var i=0, j=fac[len]; i < len; n%=j, j/=(len-i), i++) {
    var k = Math.floor(n/j);
    s[i] = gtmp[k]; 
    for (; k < len-i; k++)
      gtmp[k] = gtmp[k+1];
  }
  s[len] = gtmp[0];
}

function str_to_int(s, len, base) {
  var n = s[0];
  for (var i=1; i < len; i++) {
    n *= base;
    n += s[i];
  }
  return(n);
}

function perm_to_int(s, len) {
  for (var q=0, i=len-2, j=1; i > 0; i--) {
    j *= (len-(i+1));
    for (var v=0, k=i+1; k < len; k++)
      if (s[i] > s[k]) 
        v++;
    q += (j*v);
  }
  j *= len-1;
  q += (s[0] * j);
  return q;
}

function convert_time(n) {
  var h, m, s, ms;
  m = Math.floor((n/60)%60);
  s = Math.floor(n%60);
  ms = n.substr(n.length-2, 2);
  if (m < 10) m = '0' + m;
  if (s < 10) s = '0' + s;
  if (n < 3600)
    return(m + ':' + s + '.' + ms)
  else {
    h = Math.floor(n/3600);
    if (m < 10) m = '0' + m;
    return(h  + ':' + m + ':' + s  + '.' + ms);
  }
}

// ----------------------------------------------------------------------------
// p2idx qsort & bsearch
// ----------------------------------------------------------------------------

function qsort(arr, lo, hi) {
  var ix = qs(arr, lo, hi); 
  if (lo < ix-1)
    qsort(arr, lo, ix-1);
  if (ix < hi)
    qsort(arr, ix, hi);
}

function qs(arr, lo, hi) {
  var mid = arr[Math.floor((lo+hi)/2)*2]; 
  while (lo <= hi) {
    while (arr[lo*2] < mid)
      lo++;
    while (arr[hi*2] > mid)
      hi--;
    if (lo <= hi) {
      swap(arr, lo, hi); 
      lo++;
      hi--;
    }
  }
  return lo;
}

function swap(arr, a, b) {
  var tmp = [arr[a*2], arr[a*2+1]];
  arr[a*2] = arr[b*2];
  arr[a*2+1] = arr[b*2+1];
  arr[b*2] = tmp[0];
  arr[b*2+1] = tmp[1];
}

function bsearch_p2idx(n) {
  var lo = 0;
  var hi = p2idx.length/2;
  for (var c=0; c <= 20; c++) {
    var mid = Math.floor((lo+hi)/2);
    if (n > p2idx[mid*2])
       lo = mid;
    else if (n < p2idx[mid*2])
       hi = mid;
    else
      return mid;
  }
  return(-1);
}

