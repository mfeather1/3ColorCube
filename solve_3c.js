// Author: Michael Feather 

"use strict";

var depth = 0;
var dist_gen_depth = 8;
var search_depth = 18;
var count = new Uint32Array(3);
var seq = new Uint8Array(20);
var disp = ['R','L','U','D','F','B'];
var disp2 = [' ','2','\''];
var stime0;
var show_methods = 0;
var solution_found = 0;
var show_all_solutions = 0;
var dist1;
var dist2;

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
  convert_edg_6c(cs, eps, ets);
  convert_cnr_6c(cs, cps, cts);
  conv_perm_3C(eps, 12);
  conv_perm_3C(cps, 12);
  var ep = b3_ep[str_to_int(eps,11,3)];
  var cp = b2_cp[str_to_int(cps,7,2)];
  var et = str_to_int(ets, 11, 2);
  var ct = str_to_int(cts, 7, 3);
  solution_found = 0;
  if (document.getElementById('all_solutions').checked == true)
    show_all_solutions = 1;
  else
    show_all_solutions = 0;
  for (depth = 1; depth <= search_depth; depth++)
  {
    if (solution_found == 1)
      break;
    count[0] = count[1] = count[2] = 0;
    solver_search (ep, et, cp, ct, 1, mvlist2);
    if (show_all_solutions == 1)
      var stat = 'completed';
    else 
      stat = (solution_found == 0) ? 'completed' : 'stopped';
    document_write('Depth ' + depth + ' ' + stat + ', nodes=' + count[0] +
                   ', tests=' + count[1] + '<br>');
  }
  if (count[2] == 1)
    document_write('Optimal Solution Found<br>');
  else
    document_write(count[2] + ' Optimal Solutions Found<br>');
  var time1 = new Date().getTime();
  search_time = ((time1-stime0)/1000).toFixed(2)
  document_write(search_time + ' Search Time<br><br>');
}

function conv_perm_3C(s, n) 
{
  for (var i=0; i < n; i++) {
    if (s[i] == 4) 
      s[i] = 1;
    if (s[i] == 8) 
      s[i] = 2;
  }
}

function solver_search(epn, etn, cpn, ctn, n, mvlist)
{ 
  for (var i=0, mv=0; (mv=mvlist[i]) != NIL; i++) {
    if (show_all_solutions == 0 && solution_found == 1)
      return;
    // eliminate duplicate solutions that differ only by the last move
    if (n == depth && i%3 == 2)
      continue;
    count[0]++;
    var ep = ep_mov[epn*MOVES+mv];
    var et = et_mov[etn*MOVES+mv];
    var cp = cp_mov[cpn*MOVES+mv];
    var ct = ct_mov[ctn*MOVES+mv];
    if (n == depth) {
      count[1]++;
      if (ep == 0 && et == 0 && cp == 0 && ct == 0) {
        count[2]++;
        seq[n] = mv;
        for (var j=1; j <= depth; j++) {
          document_write(disp[Math.floor(seq[j]/3)] + disp2[seq[j]%3] + ' ');
          if (solution_found == 0)
            solution[j-1] = disp[Math.floor(seq[j]/3)] + disp2[seq[j]%3]; 
        }
        document_write(' (' + depth + 'f*)<br>');
        if (solution_found == 0) 
          solution.length = j-1;
        solution_found = 1;
	solution_count++;
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
      if (dist > depth) 
        continue;
      ix = epmin*C_PRM*1024 + cpsym*1024 + (etsym>>1);
      dist = n + ((etsym&1) ? dist2[ix]>>4 : dist2[ix]&0xF);
      if (dist > depth) 
        continue;
      seq[n] = mv;
      solver_search(ep, et, cp, ct, n+1, seq_gen[mv]);
    }
  }
}

// ----------------------------------------------------------------------------
// Populate Search Arrays Dist1 & Dist2
// ----------------------------------------------------------------------------

function mkd()
{
  var time0 = new Date().getTime();
  allocate_dist_arrays();
  populate_dist_arrays();
  var time1 = new Date().getTime();
  document_write(((time1-time0)/1000+.1).toFixed(2) + ' Populate Dist1 & Dist2<br><br>');
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
  var time1 = new Date().getTime();
  document_write(((time1-time0)/1000+.1).toFixed(2) + ' Init Time (Move and Symmetry Tables)<br><br>');
}

function allocate_dist_arrays()
{
  dist1  = new Uint8Array(MIN_EP*C_PRM*1094);        // 57 MB
  dist2  = new Uint8Array(MIN_EP*C_PRM*1024);        // 53 MB

  if (solve_option != 'none' && first_time == 1) {
    dist_gen_depth = 9;   
  }
}

function populate_dist_arrays()
{
  mvlist1[1] = NIL;
  dist1[0] = 1;
  dist2[0] = 1;

  document_write('<table class=tabdata style=border-collapse:collapse;border-color:white border=1>');
  document_write('<tr><td colspan=3 style=text-align:center;border-color:white>Search Arrays</td></tr>');
  document_write('<tr><td>Depth</td><td>Dist1</td><td>Dist2</td></tr>');

  for (depth = 1; depth <= dist_gen_depth; depth++)
    {
      cfg_idx = 0;
      count[1] = count[2] = 0;
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
  dist1[0] = 0;
  dist2[0] = 0;
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
  document_write('</tr>');
}
