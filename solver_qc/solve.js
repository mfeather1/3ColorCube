// Author: Michael Feather 

"use strict";

var depth = 0;
var depth2 = 0;
var dist_gen_depth = 8;
var distp2_gen_depth = 8;
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
var dist_loaded = [0, 0, 0];
var dist3_gen_depth = 0;
var minmv;
var USE_DIST3 = 0;
var USE_DIST4 = 0;
var disp = ['R','L','U','D','F','B'];
var disp2 = ['','2','\''];
var stime0;
var show_methods = 0;
var stl = 5;
var stoplen = 0;
var init_done = 0;
var sol_dep1, sol_dep2;
var worker, worker_mvlist;
var worker_node_count = 0;
var worker_nodes = [];
var gdone;
var conc;
var get_etsym, get_ctsym;
var search_time;
var first_time = 1;
var solution = [];
var uniq_nodes = 244;  // unique 3-color nodes at depth 4
var show_node_counts = 0;
var use_p2seq, inv_mv, p2seq, p2idx;

// shared arrays
var dist1, dist2, dist3, dist4, dist9, distp2;
var ept_min_op, ept_min_ops, ept_op_idx;
var ept_ops_ix1, ept_ops_ix2;
var ep_mov, cp6c_mov, cpt_min;
var et_sym, et_sym_FR, et_sym_UF;
var ep_slice, epr_mov;
var cp_mov, et_mov, ct_mov;
var ep_min, ep_min_op, cp_sym;
var cpt_sym, cpt_sym2, ct_sym, ct_ud_fb;
var ct_op_type, op16e, cp6c_cpr;
var b3_ep, ep_b3, op_op, inv_op, cp6c_cp3c;

// If the last move of the 3-color solution is to the same face as the
// first move of the 6-color solution (phase 2) then the two moves are
// combined into one or if they cancel each other then both are removed
// from the sequence, setting show_combine=1 will show the sequence before
// it is modified

var show_combine = 0;

importScripts('rch.js');
importScripts('../rclib.js');

addEventListener('message', ipc);

function ipc(e) {
  var cmd = e.data.cmd;

  if (cmd == 'init') {
    worker = e.data.worker;
    postMessage({'cmd': 'msg', 'msg': 'Initializing'});
    dist1 = new Uint8Array(e.data.dist1);
    dist2 = new Uint8Array(e.data.dist2);
    dist3 = new Uint8Array(e.data.dist3);
    dist4 = new Uint8Array(e.data.dist4);
    distp2 = new Uint8Array(e.data.distp2);
    ept_min_op = new Int8Array(e.data.ept_min_op);
    ept_min_ops = new Uint16Array(e.data.ept_min_ops);
    ept_op_idx = new Int16Array(e.data.ept_op_idx);
    ept_ops_ix1 = new Int8Array(e.data.ept_ops_ix1);
    ept_ops_ix2 = new Int16Array(e.data.ept_ops_ix2);
    ep_mov = new Uint16Array(e.data.ep_mov);
    cp6c_mov = new Uint16Array(e.data.cp6c_mov);
    cpt_min = new Uint16Array(e.data.cpt_min);
    et_sym = new Uint16Array(e.data.et_sym);
    et_sym_FR = new Uint16Array(e.data.et_sym_FR);
    et_sym_UF = new Uint16Array(e.data.et_sym_UF);
    ep_slice = new Uint16Array(e.data.ep_slice);
    epr_mov = new Uint8Array(e.data.epr_mov);
    cp_mov = new Uint8Array(e.data.cp_mov);
    ct_mov = new Uint16Array(e.data.ct_mov);
    et_mov = new Uint16Array(e.data.et_mov);
    ep_min = new Uint16Array(e.data.ep_min);
    ep_min_op = new Uint8Array(e.data.ep_min_op);
    cp_sym = new Uint8Array(e.data.cp_sym);
    op16e = new Uint8Array(e.data.op16e);
    cp6c_cpr = new Uint16Array(e.data.cp6c_cpr);
    ep_b3 = new Uint32Array(e.data.ep_b3);
    b3_ep = new Uint16Array(e.data.b3_ep);
    op_op = new Uint8Array(e.data.op_op);
    inv_op = new Uint8Array(e.data.inv_op);
    cp6c_cp3c = new Uint8Array(e.data.cp6c_cp3c);
    dist_files_loaded = e.data.dist_files_loaded;
    dist_gen_depth = e.data.dist_gen_depth;
    conc = e.data.conc;
    use_p2seq = e.data.use_p2seq;
    USE_DIST3 = e.data.use_dist3;
    USE_DIST4 = e.data.use_dist4;
    if (USE_DIST4)
      dist9 = new Uint8Array(e.data.dist9);
    if (CT_SYM_METHOD == 1)
      cpt_sym = new Uint16Array(e.data.cpt_sym);
    else if (CT_SYM_METHOD == 2)
      cpt_sym2 = new Uint16Array(e.data.cpt_sym2);
    else {
      ct_sym = new Uint16Array(e.data.ct_sym);
      ct_ud_fb = new Uint16Array(e.data.ct_ud_fb);
      ct_op_type = new Uint8Array(e.data.ct_op_type);
    }
    if (use_p2seq == 1) {
      p2seq = new Int8Array(e.data.p2seq);
      p2idx = new Int32Array(e.data.p2idx);
    }
    var time0 = Date.now(); 
    init();
    load_search_code();
    if (USE_DIST3 == 1)
      dist3_gen_depth = 10;
    if (use_p2seq == 1 && dist_files_loaded == 1 && worker == 1) {
      if (Date.now() - time0 > 2000)
        postMessage({'cmd': 'msg', 'msg': 'Making Phase 2 Sequences'});
      populate_distp2();
    }
    if (USE_DIST4 && worker == 1)
      populate_dist9();
    postMessage({'cmd': 'init_done', 'worker': worker});
  }

  if (cmd == 'mkd_dep8') {
    var msg = 'Making Search Arrays<br>Generating to Depth ' + dist_gen_depth;
    postMessage({'cmd': 'msg', 'msg': msg});
    populate_dist_arrays(1, 8);
    postMessage({'cmd': 'mkd_dep8_done'});
  }

  if (cmd == 'mkd_dep9') {
    worker = e.data.worker;
    if (worker == 1) {
      var msg = 'Making Search Arrays<br>Generating to Depth 9';
      postMessage({'cmd': 'msg', 'msg': msg});
    }
    populate_worker_nodes();
    populate_dist_arrays(9, 9);
    postMessage({'cmd': 'mkd_dep9_done', 'worker': worker});
  }

  if (cmd == 'mkdp2') {
    update_dist_arrays();
    populate_distp2();
    postMessage({'cmd': 'mkdp2_done'});
  }

  if (cmd == 'solve') {
    var facelets = e.data.facelets;
    stl = e.data.stl;
    stoplen = e.data.stoplen;
    // USE_DIST3 = e.data.use_dist3;
    // if (USE_DIST3 == 1)
    //   dist3_gen_depth = 10;
    // USE_DIST4 = e.data.use_dist4;
    worker_mvlist = e.data.mvlist;
    gdone = new Uint8Array(e.data.gdone);
    show_node_counts = e.data.show_node_counts;
    if (!first_time) 
      logtxt.length = 0;
    if (e.data.worker == 1 && gdone[0] == 0) {
      var msg = 'Searching &nbsp; ';
      msg += '<button class="btn svw1" onclick=stop_search()>Stop</button><br>';
      postMessage({'cmd': 'msg', 'msg': msg})
    }
    solver_main(facelets, e.data.worker);
    postMessage({
      'worker': worker,
      'cmd': 'show_solution',
      'done': done,
      'moves': solution,
      'search_time': search_time,
      'sol_dep1': sol_dep1,
      'sol_dep2': sol_dep2,
      'logtxt': logtxt});
    first_time = 0;
  }
}

function load_search_code()
{
  if (USE_DIST3 == 0)
    importScripts('search.js');
  else if (USE_DIST4 == 1)
    importScripts('search_d4.js');
  else if (USE_DIST3 == 1)
    importScripts('search_d3a.js');
  else if (USE_DIST3 == 2)
    importScripts('search_d3b.js');
}

function solver_main(facelets, worker)
{
  stime0 = Date.now();

  if (show_methods == 1) {
    document_write('CT_SYM_METHOD = ' + CT_SYM_METHOD + '<br>');
    document_write('ET_SYM_METHOD = ' + ET_SYM_METHOD + '<br>');
    document_write('EPT_OP_METHOD = ' + EPT_OP_METHOD + '<br><br>');
  }
  document_write('Worker ' + worker + ':<br>');
  solve_cube(facelets);
}

function solve_cube(facelets)
{
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
  solution.length = 0;
  sol_dep1 = 0; sol_dep2 = 0;
  var search_depth = (stoplen == 0) ? 20 : stoplen;
  if (ep == 0 && et == 0 && cp == 0 && ct == 0) {
    var cpr = cp6c_cpr[cp6c];
    var eprn = eprsum(epr);
    var presolved_dist = distp2[cpr*13824 + eprn];
    if (use_p2seq && presolved_dist < 9) {
      if (worker == 1)
        show_solution_from_p2seq(cpr, eprn);
      return;
    }
  }
  for (depth = 1; depth <= search_depth; depth++)
  {
    if (done > 0)
      break;
    count[0] = count[1] = count[2] = 0;
    count2[0] = count2[1] = count2[2] = 0;
    solver_search (ep, et, cp, ct, cp6c, epr, 1, worker_mvlist);
    var stat = (done == 0 && gdone[0] == 0) ? 'completed' : 'stopped';
    if (count[0] > worker_mvlist.length - 1) {
      if (show_node_counts%2 == 0)
        document_write('Depth ' + depth + ' ' + stat + '<br>');
      else
        document_write('Depth ' + depth + ' ' + stat + ', ' +
          count[0] + ' nodes, ' + count[1] + ' / ' + count[2] + ' tests<br>');
    }
    if (gdone[0] > 0)
      done = 1;
    else if (done == 0)
      if (minmv == depth+1 || depth >= gdone[1]-1)
        done = 2;
  }
  var time1 = Date.now();
  var time2 = ((time1-stime0)/1000).toFixed(2)
  search_time = (time_format) ? convert_time(time2) : time2;
  document_write(search_time + ' Search Time<br><br>');
}

function show_solution_from_p2seq(cpr, epr) {
  var x1 = bsearch_p2idx(cpr*13824+epr);
  var x2 = p2idx[x1*2+1];
  for (var j=0; j < 8 && p2seq[x2*8+j] != -1; j++) {
    var v = p2seq[x2*8+j];
    solution[j] = disp[Math.floor(v/3)] + disp2[v%3];
  }
  sol_dep1 = 0;
  sol_dep2 = solution.length;
  var s = solution.join(' ');
  s += ' [0+' + sol_dep2 + '] (' + sol_dep2 + 'f*)';
  document_write(s + '<br>');
  var time = ((Date.now()-stime0)/1000).toFixed(2);
  search_time = (time_format) ? convert_time(time) : time;
  document_write(search_time + ' Search Time<br><br>');
  done = 1;
  gdone[2] = 1;
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
  document_write(s + '(' + solution.length + 'f)<br>');
  if (minmv == depth)
    done = 2;
  if (minmv <= stoplen)
    done = 1;
  if (show_node_counts > 1)
    document_write('Phase 2: ' + count2[0] + ' nodes, ' + 
      count2[1] + ' / ' + count2[2] + ' tests<br>');
  postMessage({'cmd': 'solve_status', 'msg': minmv});
}

function get_p2_seq(cpr, epr) {
  var x1 = bsearch_p2idx(cpr*13824+epr);
  var x2 = p2idx[x1*2+1];
  for (var j=0; j < 8 && p2seq[x2*8+j] != -1; j++)
    seq2[j+1] = p2seq[x2*8+j];
  show_moves();
}

function chk_sol(cpr, epr) {
  if (cpr == 0 && epr[0] == 0 && epr[1] == 0 && epr[2] == 0) {
    show_optimal_solution();
    done = 2;
    return 1;
  }
  return 0;
}

function stl_msg(n) {
  if (n == 2) {
    document_write('Search Time Limit Reached<br>');
    document_write('Solution not found, extending search<br>');
  }
}

function solver_search2(epn, etn, cpn, ctn, cp6cn, eprn, n, mvlist)
{ 
  var epr = new Uint8Array(3);
  for (var i=0, mv=0; (mv=mvlist[i]) != NIL; i++) {
    if (done2 == 1 || gdone[0] == 1)
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
          // if (auto_extend_search == 1)
          //   done = 1;
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
    solution[i-1] = disp[Math.floor(seq[i]/3)] + disp2[seq[i]%3];
  solution.length = depth;
  sol_dep1 = depth;
  sol_dep2 = 0;
  var s = ' [' + sol_dep1 + '+' + sol_dep2 + '] ';
  document_write(solution.join(' ') + s + '(' + depth + 'f)<br>');
}

// ----------------------------------------------------------------------------
// Populate Search Arrays Dist1 & Dist2
// ----------------------------------------------------------------------------

function init()
{
  init_seq();

  if (ET_SYM_METHOD == 1)
    get_etsym = get_etsym_m1;
  else if (ET_SYM_METHOD == 2)
    get_etsym = get_etsym_m2;

  if (CT_SYM_METHOD == 1)
    get_ctsym = get_ctsym_m1;
  else if (CT_SYM_METHOD == 2)
    get_ctsym = get_ctsym_m2;
  else
    get_ctsym = get_ctsym_m3;

  if (worker == 1) {
    init2();
    set_colors_3c(0, 1, 2);
    init_map(map, sym_op_FR, sym_op_UR, reflect);
    populate_op_tables();
    populate_cp_sym();
    populate_ep_min();
    populate_et_sym();
    populate_ept_min_op();
    populate_cpt_min();
    populate_ept_ops_indexes();
    populate_cp6c_mov();
    populate_epr_mov();
    if (CT_SYM_METHOD == 1)
      populate_cpt_sym();
    else if (CT_SYM_METHOD == 2)
      populate_cpt_sym2();
    else {
      populate_ct_sym();
      update_ct_sym();
    }
  }
  if (use_p2seq == 1)
    inv_mv = new Int8Array([2,1,0,5,4,3,8,7,6,11,10,9,14,13,12,17,16,15]);
}

function populate_dist_arrays(d1, d2)
{
  mvlist1[1] = NIL;
  if (USE_DIST3) 
    dist3[0] = 1;
  for (depth = d1; depth <= d2; depth++) {
    cfg_idx = 0;
    mkd_search (0, 0, 0, 0, 1, mvlist1);
  }
}

function update_dist_arrays() {
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
      }
      ix = epmin*C_PRM*1024 + cpsym*1024 + (etsym>>1);
      dist = ((etsym&1) ? dist2[ix]>>4 : dist2[ix]&0xF);
      if (dist == 0) {
        dist2[ix] |= ((etsym&1)?n<<4:n);
      }
      if (USE_DIST3) {
        ix = epmin*C_TWIST*256 + ctsym*256 + (etsym>>3);
        var tmp = 1<<(etsym&7);
        dist = dist3[ix] & tmp; 
        if (dist == 0) {
          dist3[ix] |= tmp; 
        }
      }
    }
    else {
      if (n <= 5) {
        if (chk_dup_3c(epmin, etsym, cpsym, ctsym, n)) 
          continue;
        if (n == 4 && depth == 9) {
          if (worker != worker_nodes[worker_node_count++])
            continue;
          if (worker == 1)
            dep9stat();
        }
      }
      seq[n] = mv;
      mkd_search (ep, et, cp, ct, n+1, seq_gen[mv]);
    }
  }
}

function dep9stat() {
  postMessage({
    'cmd': 'dep9stat', 
    'count': worker_node_count, 
    'len': worker_nodes.length
  });
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
  distp2[0] = 1;
  for (depth=1; depth <= distp2_gen_depth; depth++)
    distp2_search(ep, et, cp, ct, cp6c, epr, 1, mvlist2);
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

function populate_worker_nodes() {
  var div = Math.floor(uniq_nodes / conc);
  var n = uniq_nodes % conc;
  for (var i=0, j=1; i < uniq_nodes && j <= conc; i+=div, j++) {
    var y = (n > 0) ? 1 : 0;
    if (n > 0) n--;
    for (var k=i; k < i+div+y; k++)
        worker_nodes[k] = j;
    i += y;
  }
}

// ----------------------------------------------------------------------------
// Populate Search Array Dist9
// ----------------------------------------------------------------------------

function populate_dist9()
{ /*
    Dist9 uses the part of the cube config that remains after the 3-Color
    components are factored out.  The corner component (CPR) has 576 possible
    configs and the edge component (EPR) has 13824 possible configs.

    Moves      Dist9
      0            1
      1           18
      2          243
      3         3234  
      4        40758  
      5       491522  .0617   6%
      6      3942536  .4951  50%
      7      3482891  .4374  44%
      8         1421
    Total    7962624  576 * 13824
  */
  var epr = new Uint8Array(3);
  dist9[0] = 1;
  for (depth=1; depth <= 6; depth++)
    dist9_search(0, 0, epr, 1, mvlist2);
  for (var i=0; i < dist9.length; i++)
    if (dist9[i] == 0) 
      dist9[i] = 7;
  dist9[0] = 0;
}

function dist9_search(epn, cp6cn, eprn, n, mvlist)
{ 
  var epr = new Uint8Array(3);
  for (var i=0, mv=0; (mv=mvlist[i]) != NIL; i++) {
    var cp6c = cp6c_mov[cp6cn*MOVES+mv];
    get_epr_mov(epr, epn, eprn, mv);
    if (n == depth) {
      var ix = cp6c_cpr[cp6c]*E_PRMr + eprsum(epr);
      if (dist9[ix] == 0)
        dist9[ix] = n;
    }
    else {
      var ep = ep_mov[epn*MOVES+mv];
      seq[n] = mv;
      dist9_search(ep, cp6c, epr, n+1, seq_gen[mv]);
    }
  }
}

