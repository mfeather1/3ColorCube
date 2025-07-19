// Author: Michael Feather 

"use strict";

var depth, depth2;
var dist_gen_depth = 8;
var search_depth = 18;
var count = new Uint32Array(3);
var seq = new Uint8Array(20);
var disp = ['R','L','U','D','F','B'];
var disp2 = [' ','2','\''];
var stime0;
var show_methods = 0;
var solution_found = 0;
var dist1;
var minmv;

function solver_main()
{
  var cs = facelets;
  stime0 = new Date().getTime();
  var time0 = new Date().getTime();
  if (show_methods == 1) {
    document_write('ET_SYM_METHOD = ' + ET_SYM_METHOD + '<br>');
    document_write('CT_SYM_METHOD = ' + CT_SYM_METHOD + '<br>');
    document_write('EPT_OP_METHOD = ' + EPT_OP_METHOD + '<br>');
  }
  if (first_time == 0) {
    document_write('Search Array Gen Depth = ' + dist_gen_depth + '<br>');
    document_write('<br>');
  }
  document_write('Search:<br>');
  solve_cube(cs);
  if (first_time) {
    var time1 = new Date().getTime();
    // subtract 100ms delay so total time = init + dist time + search time 
    document_write(((time1-gtime0)/1000-.1).toFixed(2) + ' Total Time<br><br>');
  }
}
function solve_cube(cs)
{
  var time0 = new Date().getTime();
  convert_cnr_6c(cs, cps, cts);
  var cp6c = perm_to_int(cps,8)
  var cp = cp6c_cp3c[cp6c];
  var ct = str_to_int(cts, 7, 3);
  solution_found = 0;
  minmv = 99;
  dep1 = dep2 = 0;
  for (depth=1; depth <= search_depth; depth++)
  {
    if (solution_found == 1 || depth > minmv || 
       (!show_all_solutions && (depth >= minmv || depth > stoplen)))
      break;
    count[0] = count[1] = count[2] = 0;
    solver_search (cp, ct, cp6c, 1, mvlist2);
    if (show_all_solutions == 1)
      var stat = 'completed';
    else 
      stat = (solution_found == 0) ? 'completed' : 'stopped';
    document_write('Depth ' + depth + ' ' + stat + '<br>');
  }
  var time1 = new Date().getTime();
  search_time = ((time1-stime0)/1000).toFixed(2)
  document_write(search_time + ' Search Time<br><br>');
}

var skip_mv = [0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1]; 

function solver_search(cpn, ctn, cp6cn, n, mvlist)
{ 
  for (var i=0, mv=0; (mv=mvlist[i]) != NIL; i++) {
    if (skip_mv[mv])  // skip DBL moves
      continue;
    if (solution_found == 1 && !show_all_solutions)
      return;
    count[0]++;
    var cp = cp_mov[cpn*MOVES+mv];
    var ct = ct_mov[ctn*MOVES+mv];
    var cp6c = cp6c_mov[cp6cn*MOVES+mv];
    if (n == depth) {
      count[1]++;
      var cpr = cp6c_cpr[cp6c];
      depth2 = distp2[cpr];
      if (cp == 0 && ct == 0 && depth2 < 5) {
        var len = depth + depth2;
        solution.length = len;
        if (len < minmv || (show_all_solutions && len <= minmv)) {
          minmv = len;
          count[2]++;
          seq[n] = mv;
          show_moves(cpr, len);
        }
        if (len <= stoplen && !show_all_solutions)
          solution_found = 1;
      }
    }
    else {
      var cpt = cp*C_TWIST + ct;
      var ix = cpt_min[cpt*2]
      var dist = n + dist1[ix];
      if (dist > depth) 
        continue;
      seq[n] = mv;
      solver_search(cp, ct, cp6c, n+1, seq_gen[mv]);
    }
  }
}

function show_moves(cpr, len) {
  for (var j=1; j <= depth; j++) {
    var m = get_move(seq[j]);
    document_write(m + ' ');
    solution[j-1] = m;
  }
  j--;
  for (var k=0; k < depth2; k++) {
    var m0 = p2seq[cpr*4+k];
    var m1 = get_move(m0) + ' ';
    document_write(m1 + ' ');
    solution[j+k] = m1; 
  }
  if (depth + depth2 <= stoplen && depth2 > 0) {
    if (Math.floor(seq[depth]/3) == Math.floor(p2seq[cpr*4]/3)) {
      var a = get_move(seq[depth])
      var b = get_move(p2seq[cpr*4]);
      console.log('reduce:', a, b);
    }
  }
  document_write('[' + depth + '+' + depth2 + '] ');
  document_write('(' + len + 'f)<br>');
  dep1 = depth;
  dep2 = depth2;
}

function get_move(n) {
  return disp[Math.floor(n/3)] + disp2[n%3];
}

// ----------------------------------------------------------------------------
// Populate Search Arrays Dist1 & Dist2
// ----------------------------------------------------------------------------

function mkd()
{
  var time0 = new Date().getTime();
  allocate_dist_arrays();
  populate_dist_arrays();
  populate_distp2();
  var time1 = new Date().getTime();
  document_write(((time1-time0)/1000+.1).toFixed(2) + ' Populate Dist1<br><br>');
}

function init()
{
  var time0 = new Date().getTime();
  if (ET_SYM_METHOD == 1) 
    get_etsym = get_etsym_m1; 
  else
    get_etsym = get_etsym_m2; 
  init2();
  init_seq();
  set_colors_3c(0, 1, 2);
  init_map(map, sym_op_FR, sym_op_UR, reflect);
  populate_op_tables();
  populate_cpt_min();
  populate_cp6c_mov();
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
  var time1 = new Date().getTime();
  document_write(((time1-time0)/1000+.1).toFixed(2) + ' Init Time (Move and Symmetry Tables)<br>');
}

function allocate_dist_arrays()
{
  dist1  = new Uint8Array(MIN_CPT);
  if (solve_option != 'none' && first_time == 1) {
    dist_gen_depth = 9;   
  }
}

function populate_dist_arrays()
{ /* 
  moves  count
    0       1
    1       1
    2       2
    3      11
    4      53
    5     263
    6     886
    7    1167
    8     154
  total  2538
  */
  mvlist1[1] = NIL;
  dist1[0] = 1;
  for (depth = 1; depth <= dist_gen_depth; depth++)
    {
      count[1] = count[2] = 0;
      mkd_search (0, 0, 1, mvlist1);
    }
  for (var i=0; i < MIN_CPT; i++) {
    /* depth 9: 2, 14, 59, 3335 */
    if (dist1[i] == 0)
      dist1[i] = 9;
  }
  dist1[0] = 0;
}

function mkd_search (cpn, ctn, n, mvlist)
{
  for (var i=0, mv=0; (mv=mvlist[i]) != NIL; i++) 
  {
    if (skip_mv[mv])  // skip DBL moves
      continue;
    var cp = cp_mov[cpn*MOVES+mv];
    var ct = ct_mov[ctn*MOVES+mv];
    if (n == depth) {
      var cpt = cp*C_TWIST + ct;
      var ix = cpt_min[cpt*2]
      if (dist1[ix] == 0) {
        dist1[ix] = n;
        count[1]++;
      }
    }
    else {
      seq[n] = mv;
      mkd_search (cp, ct, n+1, seq_gen[mv]);
    }
  }
}

// ----------------------------------------------------------------------------
// Populate Search Array Distp2
// ----------------------------------------------------------------------------

var countp2;
var distp2 = new Uint8Array(C_PRMr);
var p2seq = new Int8Array(C_PRMr*4);

function populate_distp2()
{ /*
  moves  count 
    0      1
    1      3
    2      6
    3      9
    4      5
  total   24 
  */
  distp2[0] = 1;
  for (depth=1; depth <= 4; depth++) {
    countp2 = 0;
    distp2_search(0, 0, 0, 1, mvlist2);
  }
  for (var i=0; i < C_PRMr; i++)
    if (distp2[i] == 0) 
      distp2[i] = 5;
  distp2[0] = 0;
}

function distp2_search(cpn, ctn, cp6cn, n, mvlist)
{ 
  for (var i=0, mv=0; (mv=mvlist[i]) != NIL; i++) {
    if (skip_mv[mv])  // skip DBL moves
      continue;
    var cp = cp_mov[cpn*MOVES+mv];
    var ct = ct_mov[ctn*MOVES+mv];
    if (n == depth) {
      if (cp == 0 && ct == 0) {
        var cp6c = cp6c_mov[cp6cn*MOVES+mv];
        var cpr = cp6c_cpr[cp6c];
        if (distp2[cpr] == 0) {
          distp2[cpr] = n;
          seq[n] = mv;
          for (var j=0; j < n; j++)
            p2seq[cpr*4+j] = seq[n-j];
          countp2++;
        }
      }
    }
    else {
      cp6c = cp6c_mov[cp6cn*MOVES+mv];
      seq[n] = mv;
      distp2_search(cp, ct, cp6c, n+1, seq_gen[mv]);
    }
  }
}
