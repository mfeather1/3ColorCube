/* Author: Michael Feather 

  Depth        Dist1        Dist2        Dist3     DistP2
  -----  -----------  -----------  -----------  ---------
    1              1            1            1          6
    2              3            3            3         27
    3             23           23           23        120
    4            241          237          230        519
    5           2948         2888         2823       2124
    6          36359        35002        35462       8188
    7         433044       401664       444312      27636
    8        4641716      4183059      5449213      78644
    9       33429131     30828052     62907892     175497
   10       69728531     62279903    584924996     248288
  Array    119716380    112107520   3502559232    7962624
*/

"use strict";

var depth = 0;
var depth2 = 0;
var dist_gen_depth = 8;
var distp2_gen_depth = 8;
var search_depth = 18;
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
var dist_loaded = [0, 0, 0];
var dist3_gen_depth = 0;
var minmv;
var USE_DIST3 = 0;
var disp = ['R','L','U','D','F','B'];
var disp2 = [' ','2','\''];
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

// shared arrays
var dist1, dist2, dist3, distp2;
var ept_min_op, ept_min_ops, ept_op_idx;
var ept_ops_ix1, ept_ops_ix2;
var ep_mov, cp6c_mov, cpt_min;
var et_sym, et_sym_FR, et_sym_UF;
var ep_slice, epr_mov;
var cp_mov, et_mov, ct_mov;
var ep_min, ep_min_op, cp_sym;
var cpt_sym, cpt_sym2, ct_sym, ct_fb_ud;
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
importScripts('readfiles.js');

addEventListener('message', ipc);

function ipc(e) {
  var cmd = e.data.cmd;

  if (cmd == 'init') {
    worker = e.data.worker;
    postMessage({'cmd': 'msg', 'msg': 'Initializing'});
    dist1 = new Uint8Array(e.data.dist1);
    dist2 = new Uint8Array(e.data.dist2);
    dist3 = new Uint8Array(e.data.dist3);
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
    if (CT_SYM_METHOD == 1)
      cpt_sym = new Uint16Array(e.data.cpt_sym);
    else if (CT_SYM_METHOD == 2)
      cpt_sym2 = new Uint16Array(e.data.cpt_sym2);
    else {
      ct_sym = new Uint16Array(e.data.ct_sym);
      ct_fb_ud = new Uint16Array(e.data.ct_fb_ud);
      ct_op_type = new Uint8Array(e.data.ct_op_type);
    }
    init();
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
    USE_DIST3 = e.data.use_dist3;
    if (USE_DIST3 == 1)
      dist3_gen_depth = 10;
    worker_mvlist = e.data.mvlist;
    gdone = new Uint8Array(e.data.gdone);
    if (!first_time) 
      logtxt.length = 0;
    if (e.data.worker == 1 && gdone[0] == 0)
      postMessage({'cmd': 'msg', 'msg': 'Searching for Solution'});
    solver_main(facelets);
    postMessage({
      'worker': worker,
      'cmd': 'show_solution',
      'moves': solution,
      'search_time': search_time,
      'sol_dep1': sol_dep1,
      'sol_dep2': sol_dep2,
      'logtxt': logtxt});
    first_time = 0;
  }
}

function show_dist_counts() {
  var count1 = [];
  var count2 = [];
  var count3 = [];
  for (var i=0; i < 12; i++) {
    count1[i] = 0;
    count2[i] = 0;
    count3[i] = 0;
  }
  for (var i=0; i < dist1.length; i++) {
    count1[dist1[i]&0xF]++;
    count1[dist1[i]>>4]++;
  }
  for (var i=0; i < dist2.length; i++) {
    count2[dist2[i]&0xF]++;
    count2[dist2[i]>>4]++;
  }
  for (var i=0; i < distp2.length; i++)
    count3[distp2[i]]++;
  document_write('<table class=tabdata style="border-collapse:collapse;border-color:white" border=1>');
  document_write('<tr><td colspan=4 style=text-align:center;border-color:white>Search Arrays</td></tr>');
  document_write('<tr><td>Depth</td><td>Dist1</td><td>Dist2</td><td>DistP2</td></tr>');
  for (i=1; i <= dist_gen_depth; i++) {
    document_write('<tr><td>' + i + '</td><td>' + count1[i] + '</td><td>');
    document_write(count2[i] + '</td><td>' + ((i<9)?count3[i]:'n/a') + '</td></tr>');
  }
  document_write('</table>'); 
  document_write('<br>');
}

function solver_main(facelets)
{
  stime0 = Date.now();

  if (show_methods == 1) {
    document_write('CT_SYM_METHOD = ' + CT_SYM_METHOD + '<br>');
    document_write('ET_SYM_METHOD = ' + ET_SYM_METHOD + '<br>');
    document_write('EPT_OP_METHOD = ' + EPT_OP_METHOD + '<br><br>');
  }
  if (first_time == 1)
    if (dist_files_loaded == 0)
      show_dist_counts();
    else
      show_files_loaded();
  document_write('Search:<br>');
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
  for (depth = 1; depth <= search_depth; depth++)
  {
    if (done == 1)
      break;
    count[0] = count[1] = count[2] = 0;
    solver_search (ep, et, cp, ct, cp6c, epr, 1, worker_mvlist);
    var stat = (done == 0 && gdone[0] == 0) ? 'completed' : 'stopped';
    if (count[0] > 18) 
      document_write('Depth ' + depth + ' ' + stat + '<br>');
      // node counts are disabled for quad-core because the log will only show
      // counts for the worker that found the solution
      // document_write('Depth ' + depth + ' ' + stat + ', ' +
      //   count[0] + ' nodes, ' + count[1] + ' / ' + count[2] + ' tests<br>');
    if (minmv == depth+1 && done == 0 && gdone[0] == 0) {
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
      // if first move of phase 2 is half-twist then skip this solution,
      // the shortened version will immediately follow
      if (seq2[1]%3 == 1)
        return;
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
  sol_dep1 = depth;
  sol_dep2 = depth2;
}

function solver_search(epn, etn, cpn, ctn, cp6cn, eprn, n, mvlist)
{
  for (var i=0, mv=0; (mv=mvlist[i]) != -1; i++) {
    if (done == 1 || gdone[0] == 1)
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
            solver_search2 (0, 0, 0, 0, cp6c, epr, 1, mvlist2);
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
    document_write('Optimal Solution Found<br>');
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
    var ep = ep_mov[epn*MOVES+mv];
    var et = et_mov[etn*MOVES+mv];
    var cp = cp_mov[cpn*MOVES+mv];
    var ct = ct_mov[ctn*MOVES+mv];
    if (n == depth2) {
      if (ep == 0 && et == 0 && cp == 0 && ct == 0) {
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
  sol_dep1 = depth;
  sol_dep2 = 0;
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
}

function show_files_loaded() {
  init_fnames();
  document_write('Files Loaded:<br>');
  for (var i=0; i < fnames.length; i++)
    document_write(fnames[i] + '<br>');
  document_write('<br>');
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
