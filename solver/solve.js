// Author: Michael Feather 

"use strict";

var depth = 0;
var depth2 = 0;
var dist_gen_depth = 8;
var distp2_gen_depth = 8;
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
var load_dist_files = 0;
var dist_files_loaded = 0;
var dist_loaded = [0, 0, 0];
var dist3_gen_depth = 0;
var dist1, dist2, dist3, distp, distp2;
var USE_DIST3 = 0;
var disp = ['R','L','U','D','F','B'];
var disp2 = [' ','2','\''];
var stime0;
var show_methods = 0;
var stl = 5;
var stoplen = 0;
var init_done = 0;
var sol_dep1, sol_dep2, p1_nodes;
var show_node_counts = 0;
var use_p2seq, inv_mv, p2seq, p2idx;

// If the last move of the 3-color solution is to the same face as the
// first move of the 6-color solution (phase 2) then the two moves are
// combined into one or if they cancel each other then both are removed
// from the sequence, setting show_combine=1 will show the sequence before
// it is modified

var show_combine = 0;

if (typeof(importScripts) != 'undefined') {
  importScripts('../rch.js');
  importScripts('../rclib.js');
  importScripts('readfiles.js');
}

addEventListener('message', ipc);

function ipc(e) {
  var cmd = e.data.cmd;
  if (cmd == 'solve') {
    gtime0 = Date.now();
    var facelets = e.data.facelets;
    stl = e.data.stl;
    dist_gen_depth = e.data.dist_gen_depth;
    stoplen = e.data.stoplen;
    load_dist_files = e.data.load_dist_files;
    USE_DIST3 = e.data.use_dist3;
    show_node_counts = e.data.show_node_counts;
    use_p2seq = e.data.use_p2seq;
    logtxt.length = 0;
    show_cube_layout(facelets);
    if (init_done == 0) {
      if (USE_DIST3 == 0)
        importScripts('search.js');
      else if (USE_DIST3 == 1)
        importScripts('search_d3a.js');
      else if (USE_DIST3 == 2)
        importScripts('search_d3b.js');
      postMessage({'cmd': 'msg', 'msg': 'Initializing'});
      init();
      if (load_dist_files == 0) {
        var msg = 'Making Search Arrays<br>Generating to Depth ' + dist_gen_depth;
        postMessage({'cmd': 'msg', 'msg': msg});
        mkd();
          postMessage({'cmd': 'msg', 'msg': 'Making DistP2'});
        mkdp2(0);
      }
      else if (use_p2seq == 1)
        mkdp2(1);
      init_done = 1;
    }
    solver_main(facelets);
    first_time = 0;
  }
  if (cmd == 'readfiles') {
    dist_gen_depth = e.data.dist_gen_depth;
    USE_DIST3 = e.data.use_dist3;
    if (USE_DIST3 > 0) {
      dist3_gen_depth = 10;
      dist_loaded = [0, 0, 0, 0];
    }
    init_fnames()
    readfiles(e.data.files);
  }
}

function solver_main(facelets)
{
  stime0 = Date.now();
  var time0 = Date.now();
  postMessage({'cmd': 'msg', 'msg': 'Searching for Solution'});

  if (show_methods == 1) {
    document_write('CT_SYM_METHOD = ' + CT_SYM_METHOD + '<br>');
    document_write('ET_SYM_METHOD = ' + ET_SYM_METHOD + '<br>');
    document_write('EPT_OP_METHOD = ' + EPT_OP_METHOD + '<br><br>');
  }
  if (first_time == 0) {
    if (USE_DIST3)
      document_write('Search Array Gen Depth = ' + dist3_gen_depth + '<br>');
    else
      document_write('Search Array Gen Depth = ' + dist_gen_depth + '<br>');
    document_write('<br>');
  }
  document_write('Search:<br>');
  solve_cube(facelets);
  if (first_time) {
    var time1 = Date.now();
    document_write(((time1-gtime0)/1000).toFixed(2) + ' Total Time<br><br>');
  }
  postMessage({
    'cmd': 'show_solution',
    'moves': solution,
    'search_time': search_time,
    'sol_dep1' : sol_dep1,
    'sol_dep2' : sol_dep2,
    'p1_nodes' : p1_nodes,
    'logtxt': logtxt});
}

function get_p2_seq(cpr, epr)
{
  var x1 = bsearch_p2idx(cpr*13824+epr);
  var x2 = p2idx[x1*2+1];
  for (var j=0; j < 8 && p2seq[x2*8+j] != -1; j++)
    seq2[j+1] = p2seq[x2*8+j];
  show_moves();
}

function solve_cube(facelets)
{
  var time0 = Date.now();
  var epr = new Uint8Array(3);
  convert_edg_6c(facelets, eps, ets);
  convert_cnr_6c(facelets, cps, cts);
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
  p1_nodes = 0;
  sol_dep1 = sol_dep2 = 0;
  var search_depth = (stoplen == 0) ? 18 : stoplen;
  for (depth = 1; depth <= search_depth; depth++)
  {
    if (done == 1)
      break;
    count[0] = count[1] = count[2] = 0;
    solver_search (ep, et, cp, ct, cp6c, epr, 1, mvlist2);
    var stat = (done == 0) ? 'completed' : 'stopped';
    if (count[0] != 18) {
      if (show_node_counts%2 == 0)
        document_write('Depth ' + depth + ' ' + stat + '<br>');
      else
        document_write('Depth ' + depth + ' ' + stat + ', ' +
          count[0] + ' nodes, ' + count[1] + ' / ' + count[2] + ' tests<br>');
      p1_nodes += count[0];
    }
    if (minmv == depth+1 && done == 0) {
      document_write('Optimal Solution Found (proved optimal)<br>');
      done = 1;
    }
    else if (depth == stoplen && done == 0)
      document_write('Search stopped (stoplen=' + stoplen + ')<br>');
  }
  var time1 = Date.now();
  var time2 = ((time1-stime0)/1000).toFixed(2)
  search_time = (time_format) ? convert_time(time2) : time2;
  // document_write('Solution Length Found: ' + solution.length + '<br>');
  document_write(search_time + ' Search Time<br><br>');
}

function show_moves()
{
  var adj = 0;
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
      // combined moves result in ccw qtr-twist which yields 3-color solution
      // so adjust N+N total to match moves shown in cube area, this differs
      // from the other two cases which do not yield a 3-color solution at any
      // point in the solve sequence
      if (seq2[1]%3 == 1)
        adj = 1;
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
  sol_dep1 = depth;
  sol_dep2 = depth2 - adj;
  var s = ' [' + sol_dep1 + '+' + sol_dep2 + '] ';
  if (minmv == depth) {
    document_write(s + '(' + solution.length + 'f*)<br>');
    document_write('Optimal Solution Found<br>');
    done = 1;
  }
  else
      document_write(s + '(' + solution.length + 'f)<br>');
  if (minmv <= stoplen)
    done = 1;
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
    count2[0]++;
    var ep = ep_mov[epn*MOVES+mv];
    var et = et_mov[etn*MOVES+mv];
    var cp = cp_mov[cpn*MOVES+mv];
    var ct = ct_mov[ctn*MOVES+mv];
    if (n == depth2) {
      count2[1]++;
      if (ep == 0 && et == 0 && cp == 0 && ct == 0) {
        count2[2]++;
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
  sol_dep1 = depth;
  sol_dep2 = 0;
  var s = ' [' + sol_dep1 + '+' + sol_dep2 + '] ';
  document_write(solution.join(' ') + s + '(' + depth + 'f*)<br>');
  document_write('Optimal Solution Found<br>');
}

// ----------------------------------------------------------------------------
// Populate Search Arrays Dist1 & Dist2
// ----------------------------------------------------------------------------

function mkd()
{
  var time0 = Date.now();
  allocate_dist_arrays();
  populate_dist_arrays();
  var time1 = Date.now();
  var time2 = ((time1-time0)/1000).toFixed(2);
  var tstr2 = (time_format) ? convert_time(time2) : time2;
  document_write(tstr2 + ' Populate Dist1 & Dist2<br><br>');
}

function mkdp2(n)
{
  var time0 = Date.now();
  if (n) {
    if (Date.now() - gtime0 > 2000)
      postMessage({'cmd': 'msg', 'msg': 'Making Phase 2 Sequences'});
    distp2 = new Uint8Array(C_PRMr*E_PRMr);
  }
  populate_distp2();
  var time1 = Date.now();
  var time2 = ((time1-time0)/1000).toFixed(2);
  var time3 = ((time1-gtime0)/1000).toFixed(2); 
  var tstr2 = (time_format) ? convert_time(time2) : time2;
  var tstr3 = (time_format) ? convert_time(time3) : time3;
  if (use_p2seq == 1 && load_dist_files == 1) {
    document_write(tstr2 + '&nbsp; Phase 2 Sequences<br>');
    document_write(tstr3 + '&nbsp; Init + P2 Seq Time<br><br>');
  }
  else {
    document_write(tstr2 + ' Populate DistP2<br><br>');
    document_write(tstr3 + ' Init + Dist Time<br><br>');
  }
}

function init()
{
  if (ET_SYM_METHOD == 1)
    get_etsym = get_etsym_m1;
  else if (ET_SYM_METHOD == 2)
    get_etsym = get_etsym_m2;
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
  if (use_p2seq == 1) {
    inv_mv = new Int8Array([2,1,0,5,4,3,8,7,6,11,10,9,14,13,12,17,16,15]);
    p2seq = new Int8Array(117264*8);   // 916 KB, 117264 = distp2 nodes <= 8
    p2idx = new Int32Array(117264*2);  // 916 KB
  }
  var time1 = Date.now();
  var time2 = ((time1-gtime0)/1000).toFixed(2);
  init_time = (time_format) ? convert_time(time2) : time2;
  if (use_p2seq == 1 && load_dist_files == 1)
    document_write(init_time + '&nbsp; Init Time (Move and Symmetry Tables)<br>');
  else
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
      if (n <= 5) {
        if (chk_dup_3c(epmin, etsym, cpsym, ctsym, n)) 
          continue;
        if (depth == 9 && n == 4) // progress
          postMessage({'cmd': 'dep9stat', 'stat': Math.round(count[1]/3450000)*10});
      }
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
  var show_counts = (use_p2seq == 1 && load_dist_files == 1) ? 0 : 1;

  if (show_counts) {
    document_write('<table class=tabdata style=border-collapse:collapse;border-color:white; border=1>');
    document_write('<tr><td>Depth</td><td>DistP2</td></tr>');
  }

  distp2[0] = 1;
  for (depth=1; depth <= distp2_gen_depth; depth++)
    {
      count[0] = 0;
      distp2_search(ep, et, cp, ct, cp6c, epr, 1, mvlist2);
      if (show_counts)
        show_line_distp2(depth);
    }
  if (show_counts)
    document_write('</table>');
  for (var i=0; i < distp2.length; i++)
    if (distp2[i] == 0) 
      distp2[i] = distp2_gen_depth + 1;
  distp2[0] = 0;
  if (use_p2seq)
    qsort(p2idx, 0, p2idx.length/2-1);
}

var p2x = 0;  // static local

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
          if (use_p2seq) {
            p2idx[p2x*2] = ix;
            p2idx[p2x*2+1] = p2x;
            seq[n] = mv;
            for (var j=0, k=n; j < n; j++, k--)
              p2seq[p2x*8+j] = inv_mv[seq[k]];
            if (j < 8)
              p2seq[p2x*8+j] = -1;
            p2x++;
          }
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
      seq[n] = mv;
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
  document_write('Phase 2: ' + count2[0] + ' nodes, ' + 
    count2[1] + ' / ' + count2[2] + ' tests <br>');
}
