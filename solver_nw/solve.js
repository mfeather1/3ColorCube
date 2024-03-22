// Author: Michael Feather 

"use strict";

var depth = 0;
var depth2 = 0;
var dist_gen_depth = 8;
var distp2_gen_depth = 8;
var search_depth = 18;
var minmv = 99;
var count = new Uint32Array(4);
var count2 = new Uint32Array(4);
var seq = new Uint8Array(20);
var seq2 = new Uint8Array(20);
var sol3c = [];
var done  = 0;
var done2 = 0;
var auto_extend_search = 0;
var time_format = 0;
var dist_files_loaded = 0;
var show_phase2_counts = 0;

var dist1;
var dist2;
var dist3;
var distp2;
var distp;

var USE_DIST3 = 0;

var disp = ['R','L','U','D','F','B'];
var disp2 = [' ','2','\''];
var stime0;
var show_methods = 0;

// If the last move of the 3-color solution is to the same face as the
// first move of the 6-color solution (phase 2) then the two moves are
// combined into one or if they cancel each other then both are removed
// from the sequence, setting show_combine=1 will show the sequence before
// it is modified

var show_combine = 0;

function solver_main()
{
  var cs = facelets;
  stime0 = Date.now();
  var time0 = Date.now();

  if (show_methods == 1) {
    document_write('CT_SYM_METHOD = ' + CT_SYM_METHOD + '<br>');
    document_write('ET_SYM_METHOD = ' + ET_SYM_METHOD + '<br>');
    document_write('EPT_OP_METHOD = ' + EPT_OP_METHOD + '<br><br>');
  }
  if (first_time == 0) {
    /*
    document_write('Files Loaded:<br>');
    if (load_dist_files) {
      for (var i=0; i < fnames.length; i++)
        document_write(fnames[i] + '<br>');
    }
    else
      document_write('Search Array Gen Depth = ' + dist_gen_depth + '<br>');
    */
    if (USE_DIST3)
      document_write('Search Array Gen Depth = ' + dist3_gen_depth + '<br>');
    else
      document_write('Search Array Gen Depth = ' + dist_gen_depth + '<br>');
    
    document_write('<br>');
  }
  document_write('Search:<br>');
  solve_cube(cs);
  if (first_time) {
    var time1 = Date.now();
    // subtract 100ms delay so total time = init + dist time + search time 
    document_write(((time1-gtime0)/1000-.1).toFixed(2) + ' Total Time<br><br>');
  }
}

function solve_cube(cs)
{
  var time0 = Date.now();
  var epr = new Uint8Array(3);
  convert_edg_6c(cs, eps, ets);
  convert_cnr_6c(cs, cps, cts);
  var ep6c = perm_to_int(eps,12)
  var cp6c = perm_to_int(cps,8)
  var ep = ep6c_ep3c(eps);
  var cp = cp6c_cp3c[cp6c];
  var et = str_to_int(ets, 11, 2);
  var ct = str_to_int(cts, 7, 3);
  ep6c_epr(eps, epr);
  minmv = 99;
  done = 0;
  done2 = 0;
  auto_extend_search = 0;
  for (depth = 1; depth <= search_depth; depth++)
  {
    if (done == 1)
      break;
    count[0] = count[1] = count[2] = 0;
    solver_search (ep, et, cp, ct, cp6c, epr, 1, mvlist2);
    var stat = (done == 0) ? 'completed' : 'stopped';
    if (count[0] != 18) 
      document_write('Depth ' + depth + ' ' + stat + ', ' +
        count[0] + ' nodes, ' + count[1] + ' / ' + count[2] + ' tests<br>');
    if (minmv == depth+1 && done == 0) {
      document_write('Optimal Solution Found (proved optimal)<br>');
      done = 1;
    }
  }
  var time1 = Date.now();
  var time2 = ((time1-stime0)/1000).toFixed(2)
  search_time = (time_format) ? convert_time(time2) : time2;
  document_write('Solution Length Found: ' + solution.length + '<br>');
  document_write(search_time + ' Search Time<br><br>');
}

function show_moves()
{
  seq2[0] = depth2;
  if (Math.floor(sol3c[sol3c[0]]/3) == Math.floor(seq2[1]/3)) {
     if (show_combine) {
      document_write('Combine: ');
      for (var i=1; i <= sol3c[0]; i++) 
        document_write(disp[Math.floor(sol3c[i]/3)] + disp2[sol3c[i]%3]);
      for (j=1; j <= depth2; i++, j++)
        document_write(disp[Math.floor(seq2[j]/3)] + disp2[seq2[j]%3]);
      i--;
      document_write(' (' + i + 'f)<br>');
    }
    var cm = combine_moves(sol3c[sol3c[0]], seq2[1]);
    if (cm == NIL) {
      // the moves cancel each other, delete both from the sequence
      sol3c[0]--;  // shorten sol3c by 1
      for (var i=1; i <= seq2[0]; i++)  // left-shift seq2 by one move
       seq2[i] = seq2[i+1];
      seq2[0]--;  // shorten seq2 by 1
      minmv -= 2;
    }
    else {
      // make first move of seq2 the combined move 
      seq2[1] = cm;  
      sol3c[0]--;  // shorten sol3c by 1
      minmv--;
    } 
  }
  for (var i=1; i <= sol3c[0]; i++) 
    solution[i-1] = disp[Math.floor(sol3c[i]/3)] + disp2[sol3c[i]%3];
  for (var j=1; j <= seq2[0]; i++, j++)
    solution[i-1] = disp[Math.floor(seq2[j]/3)] + disp2[seq2[j]%3];
  solution.length = i-1;
  document_write(solution.join(' '));
  if (minmv == depth) {
    document_write(' (' + solution.length + 'f*)<br>');
    document_write('Optimal Solution Found<br>');
    done = 1;
  }
  else
      document_write(' (' + solution.length + 'f)<br>');
  if (minmv <= stoplen)
    done = 1;
}

// Apparently there is an undocumented code size limit for the optimizer which
// was reduced as of Firefox version 67 and the solver_search function code
// exceeded it.  Solver performance was reduced to 1/3 the speed of previous
// versions.  To fix, some code was moved out of the solver_search function
// (see new functions chk_sol & stl_msg) and the define variables were replaced
// with their actual values.

function solver_search(epn, etn, cpn, ctn, cp6cn, eprn, n, mvlist)
{
  for (var i=0, mv=0; (mv=mvlist[i]) != -1; i++) {
    if (done == 1)
      return;
    count[0]++;
    var ep = ep_mov[epn*18+mv];
    var et = et_mov[etn*18+mv];
    var cp = cp_mov[cpn*18+mv];
    var ct = ct_mov[ctn*18+mv];
    if (n == depth) {
      count[1]++;
      if (ep == 0 && et == 0 && cp == 0 && ct == 0) {
        count[2]++;
        var cp6c = cp6c_mov[cp6cn*18+mv];
        var cpr = cp6c_cpr[cp6c];
        var epr = new Uint8Array(3);
        get_epr_mov(epr, epn, eprn, mv);
        seq[n] = mv;
        if (chk_sol(cpr, epr))
          return;
        var ix = cpr*13824 + eprsum(epr);
        var dst = distp2[ix];
        if (dst < 9) {
          if (n + dst < minmv) {
            minmv = dst + n;
            sol3c[0] = n;
            for (var j=1; j <= n; j++)
              sol3c[j] = seq[j];
            depth2 = dst;
            // count2[0] = count2[1] = count2[2] = 0;
            solver_search2 (0, 0, 0, 0, cp6c, epr, 1, mvlist2);
            // show_p2_counts(); 
            done2 = 0;
          }
        }
      }
    }
    else {
      var ix = ept_op_idx[ep];
      if (ix != -1) 
        var op = ept_min_op[ix*2048+et];
      else
        op = ep_min_op[ep];
      var epmin = ep_min[ep];
      var etsym = get_etsym(ep, et, op);
      if (ix != -1) {
        var ix2 = ept_ops_ix2[ept_ops_ix1[epmin]*2048+etsym];
        if (ix2 != -1) {
          op = get_min_op_3c(cp, ct, op, ix2);
          var time1 = Date.now();
          if ((time1-stime0)/1000 >= stl) {
            if (minmv == 99) {
              if (auto_extend_search == 0) {
                auto_extend_search = 1;
                stl_msg(2);
              }
            }
            else {
              if (auto_extend_search == 0)
                stl_msg(1);
              done = 1;
            }
          }
        }
      }
      var cpsym = cp_sym[cp*48+op];
      if (CT_SYM_METHOD == 3)
        var ctsym = get_ctsym(cpsym, ct, op);
      else {
        var cpt = cp*2187 + ct;
        var ctsym = get_ctsym(cpt, op);
      }
      if (USE_DIST3) {
        ix = epmin*559872 + ctsym*256 + (etsym>>3);  // C_TWIST*256 = 559872
        var tmp = dist3[ix] & (1<<(etsym&7));
        dist = (tmp) ? 0 : dist3_gen_depth+1+n;
        if (dist > depth)
          continue; 
      }
      ix = epmin*76580 + cpsym*1094 + (ctsym>>1);  // C_PRM*1094 = 76580
      var dist = n + ((ctsym&1) ? dist1[ix]>>4 : dist1[ix]&0xF);
      if (dist > depth) 
        continue;
      ix = epmin*71680 + cpsym*1024 + (etsym>>1);  // C_PRM*1024 = 71680
      dist = n + ((etsym&1) ? dist2[ix]>>4 : dist2[ix]&0xF);
      if (dist > depth) 
        continue;
      var epr = new Uint8Array(3);
      get_epr_mov(epr, epn, eprn, mv);
      var cp6c = cp6c_mov[cp6cn*18+mv];
      if (ep == 0 && et == 0 & cp == 0 && ct == 0) {
        ix = cp6c_cpr[cp6c]*13824 + eprsum(epr);
        if (distp2[ix] + n > depth)
          continue;
      }
      seq[n] = mv;
      solver_search(ep, et, cp, ct, cp6c, epr, n+1, seq_gen[mv]);
    }
  }
}

function chk_sol(cpr, epr) {
  if (cpr == 0 && epr[0] == 0 && epr[1] == 0 && epr[2] == 0) {
    show_optimal_solution();
    done = 1; 
    return 1;
  }
  return 0;
}

function stl_msg(n) {
  document_write('Search Time Limit Reached<br>');
  if (n == 2)
    document_write('Solution not found, extending search<br>');
}

function solver_search2(epn, etn, cpn, ctn, cp6cn, eprn, n, mvlist)
{ 
  var epr = new Uint8Array(3);
  for (var i=0, mv=0; (mv=mvlist[i]) != NIL; i++) {
    if (done2 == 1)
      return;
    // count2[0]++;
    var ep = ep_mov[epn*MOVES+mv];
    var et = et_mov[etn*MOVES+mv];
    var cp = cp_mov[cpn*MOVES+mv];
    var ct = ct_mov[ctn*MOVES+mv];
    if (n == depth2) {
      // count2[1]++;
      if (ep == 0 && et == 0 && cp == 0 && ct == 0) {
        // count2[2]++;
        var cp6c = cp6c_mov[cp6cn*MOVES+mv];
        var cpr = cp6c_cpr[cp6c];
        get_epr_mov(epr, epn, eprn, mv);
        seq2[n] = mv;
        if (cpr == 0 && epr[0] == 0 && epr[1] == 0 && epr[2] == 0) {
          show_moves();
          done2 = 1;
          if (auto_extend_search == 1)
            done = 1;
        }
      }
    }
    else {
      var ix = ept_op_idx[ep];
      if (ix != NIL) 
        var op = ept_min_op[ix*E_TWIST+et];
      else
        op = ep_min_op[ep];
      var epmin = ep_min[ep];
      var etsym = get_etsym(ep, et, op);
      if (ix != NIL) {
        var ix2 = ept_ops_ix2[ept_ops_ix1[epmin]*E_TWIST+etsym];
        if (ix2 != NIL) 
          op = get_min_op_3c(cp, ct, op, ix2);
      }
      var cpsym = cp_sym[cp*CUBE_SYM+op];
      if (CT_SYM_METHOD == 3)
        var ctsym = get_ctsym(cpsym, ct, op);
      else {
        var cpt = cp*C_TWIST + ct;
        var ctsym = get_ctsym(cpt, op);
      }
      ix = epmin*C_PRM*1094 + cpsym*1094 + (ctsym>>1);
      var dist = n + ((ctsym&1) ? dist1[ix]>>4 : dist1[ix]&0xF);
      if (dist > depth2) 
        continue;
      ix = epmin*C_PRM*1024 + cpsym*1024 + (etsym>>1);
      dist = n + ((etsym&1) ? dist2[ix]>>4 : dist2[ix]&0xF);
      if (dist > depth2)
        continue;
      get_epr_mov(epr, epn, eprn, mv);
      cp6c = cp6c_mov[cp6cn*MOVES+mv];
      if (ep == 0 && et == 0 & cp == 0 && ct == 0) {
        ix = cp6c_cpr[cp6c]*E_PRMr + eprsum(epr);
        if (distp2[ix] + n > depth2)
          continue;
      }
      seq2[n] = mv;
      solver_search2(ep, et, cp, ct, cp6c, epr, n+1, seq_gen[mv]);
    }
  }
}

function combine_moves(a, b) {
  if (a == b && a%3 != 1)
    return(Math.floor(a/3)*3+1);
  else if ((a+b)%3 != 2)
    return(Math.floor(a/3)*3 + ((a+b)%3)*2);
  else
    return(NIL);
}

function show_optimal_solution() {
  for (var i=1; i <= depth; i++)
    solution[i-1] = disp[Math.floor(seq[i]/3)] + disp2[seq[i]%3] + ' ';
  solution.length = depth;
  document_write(solution.join(' ') + ' (' + depth + 'f*)<br>');
}

// ----------------------------------------------------------------------------
// Populate Search Arrays Dist1 & Dist2
// ----------------------------------------------------------------------------

function mkd()
{
  var time0 = Date.now();
  allocate_dist_arrays();
  populate_dist_arrays();
  var delay = ((dist_files_loaded) ? 0 : .1);
  var time1 = Date.now();
  var time2 = ((time1-time0)/1000+delay).toFixed(2);
  var tstr2 = (time_format) ? convert_time(time2) : time2;
  document_write(tstr2 + ' Populate Dist1 & Dist2<br><br>');
}

function mkdp2()
{
  var time0 = Date.now();
  populate_distp2();
  var delay = ((dist_files_loaded) ? 0 : .1);
  var time1 = Date.now();
  var time2 = ((time1-time0)/1000+delay).toFixed(2);
  var time3 = ((time1-gtime0)/1000).toFixed(2); 
  var tstr2 = (time_format) ? convert_time(time2) : time2;
  var tstr3 = (time_format) ? convert_time(time3) : time3;
  document_write(tstr2 + ' Populate DistP2<br><br>');
  document_write(tstr3 + ' Init + Dist Time<br><br>');
}

function init()
{
  var time0 = Date.now();
  if (ET_SYM_METHOD == 1)
    get_etsym = get_etsym_m1;
  else if (ET_SYM_METHOD == 2)
    get_etsym = get_etsym_m2;
  else
    get_etsym = get_etsym_m3;
  init2();
  init_seq();
  set_colors_3c(0, 1, 2);
  init_map(map, sym_op_FR, sym_op_UR, reflect);
  populate_op_tables();
  populate_ep_min();
  populate_et_sym();
  populate_min_ep();
  populate_ept_min_op();
  populate_cp_sym();
  populate_cpt_min();
  if (CT_SYM_METHOD == 1) {
    populate_cpt_sym();
    get_ctsym = get_ctsym_m1;
  }
  else if (CT_SYM_METHOD == 2) {
    populate_cpt_sym2();
    get_ctsym = get_ctsym_m2;
  }
  else {
    populate_ct_sym();
    update_ct_sym();
    get_ctsym = get_ctsym_m3;
  }
  populate_ept_ops_indexes();
  populate_cp6c_mov();
  populate_epr_mov();
  if (dist_files_loaded) {
    document_write('Files Loaded:<br>');
    for (var i=0; i < fnames.length; i++)
      document_write(fnames[i] + '<br>');
    document_write('<br>');
  }
  var time1 = Date.now();
  var time2 = ((time1-time0)/1000+.1).toFixed(2);
  init_time = (time_format) ? convert_time(time2) : time2;
  document_write(init_time + ' Init Time (Move and Symmetry Tables)<br><br>');
}

function allocate_dist_arrays()
{
  if (dist1 == null) {                                 // MB
    dist1  = new Uint8Array(MIN_EP*C_PRM*1094);        // 57
    dist2  = new Uint8Array(MIN_EP*C_PRM*1024);        // 53
    distp2 = new Uint8Array(C_PRMr*E_PRMr);            //  8
  }
  else if (dist1[1] != 0) {
    if (dist_files_loaded == 0) {
      for (var i=0; i < dist1.length; i++) dist1[i] = 0;
      for (var i=0; i < dist2.length; i++) dist2[i] = 0;
    }
  }
}

function populate_dist_arrays()
{
  mvlist1[1] = NIL;
  dist1[0] = 1;
  dist2[0] = 1;
  if (USE_DIST3) 
    dist3[0] = 1;

  document_write('<table class=tabdata style="border-collapse:collapse;border-color:white" border=1>');
  document_write('<tr><td colspan=3 style=text-align:center;border-color:white>Search Arrays</td></tr>');

  if (USE_DIST3) 
    document_write('<tr><td>Depth</td><td>Dist1</td><td>Dist2</td><td>Dist3</td></tr>');
  else  
    document_write('<tr><td>Depth</td><td>Dist1</td><td>Dist2</td></tr>');

  for (depth = 1; depth <= dist_gen_depth; depth++)
    {
      cfg_idx = 0;
      count[1] = count[2] = count[3] = 0;
      mkd_search (0, 0, 0, 0, 1, mvlist1);
      show_line_mkd (depth);
    }
  document_write('</table>');
  for (var i=0; i < dist1.length; i++) {
    if ((dist1[i]&0xF) == 0)
      dist1[i] |= dist_gen_depth+1;
    if ((dist1[i]>>4) == 0)
      dist1[i] |= (dist_gen_depth+1)<<4;
  }
  for (var i=0; i < dist2.length; i++) {
    if ((dist2[i]&0xF) == 0)
      dist2[i] |= dist_gen_depth+1;
    if ((dist2[i]>>4) == 0)
      dist2[i] |= (dist_gen_depth+1)<<4;
  }
  dist1[0] &= 0xF0;
  dist2[0] &= 0xF0;
  // dist3 first bit should remain set (unset means not reached)
}

function mkd_search (epn, etn, cpn, ctn, n, mvlist)
{
  for (var i=0, mv=0; (mv=mvlist[i]) != NIL; i++) 
  {
    var ep = ep_mov[epn*MOVES+mv];
    var et = et_mov[etn*MOVES+mv];
    var cp = cp_mov[cpn*MOVES+mv];
    var ct = ct_mov[ctn*MOVES+mv];
    var ix = ept_op_idx[ep];
    if (ix != NIL) 
      var op = ept_min_op[ix*E_TWIST+et];
    else
      op = ep_min_op[ep];
    var epmin = ep_min[ep];
    var etsym = get_etsym(ep, et, op);
    if (ix != NIL) {
      var ix2 = ept_ops_ix2[ept_ops_ix1[epmin]*E_TWIST+etsym];
      if (ix2 != NIL)
        op = get_min_op_3c(cp, ct, op, ix2);
    }
    var cpsym = cp_sym[cp*CUBE_SYM+op];
    if (CT_SYM_METHOD == 3)
      var ctsym = get_ctsym(cpsym, ct, op);
    else {
      var cpt = cp*C_TWIST + ct;
      var ctsym = get_ctsym(cpt, op);
    }
    if (n == depth) {
      ix = epmin*C_PRM*1094 + cpsym*1094 + (ctsym>>1);
      var dist = ((ctsym&1) ? dist1[ix]>>4 : dist1[ix]&0xF);
      if (dist == 0) {
        dist1[ix] |= ((ctsym&1)?n<<4:n);
        count[1]++;
      }
      ix = epmin*C_PRM*1024 + cpsym*1024 + (etsym>>1);
      dist = ((etsym&1) ? dist2[ix]>>4 : dist2[ix]&0xF);
      if (dist == 0) {
        dist2[ix] |= ((etsym&1)?n<<4:n);
        count[2]++;
      }
      if (USE_DIST3) {
        ix = epmin*C_TWIST*256 + ctsym*256 + (etsym>>3);
        var tmp = 1<<(etsym&7);
        dist = dist3[ix] & tmp; 
        if (dist == 0) {
          dist3[ix] |= tmp; 
          count[3]++;
        }
      }
    }
    else {
      if (n <= 5)
        if (chk_dup_3c(epmin, etsym, cpsym, ctsym, n)) 
          continue;
      seq[n] = mv;
      mkd_search (ep, et, cp, ct, n+1, seq_gen[mv]);
    }
  }
}

function show_line_mkd (mv)
{
  document_write('<tr>');
  document_write('<td style=text-align:center>' + mv + '</td>');
  document_write('<td>' + count[1] + '</td>');
  document_write('<td>' + count[2] + '</td>');
  if (USE_DIST3)
    document_write('<td>' + count[3] + '</td>');
  document_write('</tr>');
}

// ----------------------------------------------------------------------------
// Populate Search Array Distp2
// ----------------------------------------------------------------------------

function populate_distp2()
{
  var epr = new Uint8Array(3);
  var cp = 0;
  var ct = 0;
  var ep = 0;
  var et = 0;
  var cp6c = 0;

  document_write('<table class=tabdata style=border-collapse:collapse;border-color:white; border=1>');
  document_write('<tr><td>Depth</td><td>DistP2</td></tr>');

  distp2[0] = 1;
  for (depth=1; depth <= distp2_gen_depth; depth++)
    {
      count[0] = 0;
      distp2_search(ep, et, cp, ct, cp6c, epr, 1, mvlist2);
      show_line_distp2(depth);
    }
  document_write('</table>');
  for (var i=0; i < distp2.length; i++)
    if (distp2[i] == 0) 
      distp2[i] = distp2_gen_depth + 1;
  distp2[0] = 0;
}

function distp2_search(epn, etn, cpn, ctn, cp6cn, eprn, n, mvlist)
{ 
  var epr = new Uint8Array(3);
  for (var i=0, mv=0; (mv=mvlist[i]) != NIL; i++) {
    var ep = ep_mov[epn*MOVES+mv];
    var et = et_mov[etn*MOVES+mv];
    var cp = cp_mov[cpn*MOVES+mv];
    var ct = ct_mov[ctn*MOVES+mv];
    if (n == depth) {
      if (ep == 0 && et == 0 && cp == 0 && ct == 0) {
        var cpr = cp6c_cpr[cp6c_mov[cp6cn*MOVES+mv]];
        get_epr_mov(epr, epn, eprn, mv);
        var ix = cpr*E_PRMr + eprsum(epr);
        if (distp2[ix] == 0) {
          distp2[ix] = n;
          count[0]++;
        }
      }
    }
    else {
      var ix = ept_op_idx[ep];
      if (ix != NIL) 
        var op = ept_min_op[ix*E_TWIST+et];
      else
        op = ep_min_op[ep];
      var epmin = ep_min[ep];
      var etsym = get_etsym(ep, et, op);
      if (ix != NIL) {
        var ix2 = ept_ops_ix2[ept_ops_ix1[epmin]*E_TWIST+etsym];
        if (ix2 != NIL) 
          op = get_min_op_3c(cp, ct, op, ix2);
      }
      var cpsym = cp_sym[cp*CUBE_SYM+op];
      if (CT_SYM_METHOD == 3)
        var ctsym = get_ctsym(cpsym, ct, op);
      else {
        var cpt = cp*C_TWIST + ct;
        var ctsym = get_ctsym(cpt, op);
      }
      var ix = epmin*C_PRM*1094 + cpsym*1094 + (ctsym>>1);
      var dist = n + ((ctsym&1) ? dist1[ix]>>4 : dist1[ix]&0xF);
      if (dist > depth) 
        continue;
      ix = epmin*C_PRM*1024 + cpsym*1024 + (etsym>>1);
      dist = n + ((etsym&1) ? dist2[ix]>>4 : dist2[ix]&0xF);
      if (dist > depth) 
        continue;
      get_epr_mov(epr, epn, eprn, mv);
      var cp6c = cp6c_mov[cp6cn*MOVES+mv];
      distp2_search(ep, et, cp, ct, cp6c, epr, n+1, seq_gen[mv]);
    }
  }
}

function get_epr_mov(eprmv, ep, epr, mv)
{
  for (var i=0; i < 3; i++)
    eprmv[i] = epr_mov[ep_slice[ep*3+i]*24*MOVES + epr[i]*MOVES + mv];
}

function eprsum(epr) 
{
  return(epr[0]*576 + epr[1]*24 + epr[2]);
}

function show_line_distp2 (mv)
{
  document_write('<tr>');
  document_write('<td style=text-align:center>' + mv + '</td>');
  document_write('<td>' + count[0] + '</td>');
  document_write('</tr>');
}

function show_p2_counts()
{
  if (show_phase2_counts) 
    document_write('Phase 2 solution, ' + 
      count2[0] + ' nodes, ' + 
      count2[1] + ' tests, ' +
      count2[2] + ' 3C<br>');
}
