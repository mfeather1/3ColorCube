// Author: Michael Feather 

"use strict";

var depth, depth2;
var dist_gen_depth = 8;
var search_depth = 9;
var count = new Uint32Array(3);
var seq = new Uint8Array(20);
var disp = ['R','L','U','D','F','B'];
var disp2 = [' ','2','\''];
var show_methods = 0;
var solution_found = 0;
var dist1;
var fs = [];

function solver_main()
{
  var cs = facelets;
  document_write('Search:<br>');
  solve_cube(cs);
  cp_sol(solution, fs, fs.length);
  document_write('<br>')
}
function solve_cube(cs)
{
  convert_cnr_6c(cs, cps, cts);
  var cp6c = perm_to_int(cps,8)
  var cp = cp6c_cp3c[cp6c];
  var ct = str_to_int(cts, 7, 3);
  solution_found = 0;
  for (depth=1; depth <= search_depth; depth++)
  {
    if (solution_found > 0)
      break;
    count[0] = count[1] = count[2] = 0;
    solver_search (cp, ct, 1, mvlist2);
    document_write('Depth ' + depth + ' completed<br>');
  }
  var s = (solution_found == 1) ? '' : 's';
  document_write(solution_found + ' Optimal Solution' + s + ' Found<br>');
}

var skip_mv = [0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1]; 

function solver_search(cpn, ctn, n, mvlist)
{ 
  for (var i=0, mv=0; (mv=mvlist[i]) != NIL; i++) {
    if (skip_mv[mv])  // skip DBL moves
      continue;
    count[0]++;
    var cp = cp_mov[cpn*MOVES+mv];
    var ct = ct_mov[ctn*MOVES+mv];
    if (n == depth) {
      count[1]++;
      if (cp == 0 && ct == 0) {
        count[2]++;
        seq[n] = mv;
        if (mv%3 != 2) {
          show_moves();
          if (solution_found == 0)
            cp_sol(fs, solution, n);
          solution_found++;
        }
      }
    }
    else {
      var cpt = cp*C_TWIST + ct;
      var ix = cpt_min[cpt*2]
      var dist = n + dist1[ix];
      if (dist > depth) 
        continue;
      seq[n] = mv;
      solver_search(cp, ct, n+1, seq_gen[mv]);
    }
  }
}

function show_moves() {
  for (var j=1; j <= depth; j++) {
    var m = get_move(seq[j]);
    document_write(m + ' ');
    solution[j-1] = m;
  }
  document_write('(' + depth + 'f*)<br>');
}

function get_move(n) {
  return disp[Math.floor(n/3)] + disp2[n%3];
}

function cp_sol(s, t, n) {
  for (var j=0; j < t.length; j++)
    s[j] = t[j];
  s.length = n;
}

// ----------------------------------------------------------------------------
// Populate Search Array Dist1
// ----------------------------------------------------------------------------

function mkd()
{
  dist1  = new Uint8Array(MIN_CPT);
  populate_dist1();
}

function init()
{
  init2();
  init_seq();
  set_colors_3c(0, 1, 2);
  init_map(map, sym_op_FR, sym_op_UR, reflect);
  populate_op_tables();
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
}

function populate_dist1()
{
  /*       cpt  cptmin  cptmin
  moves    all     all     ufr
    0        1       1       1
    1        6       1       1
    2       63       3       2
    3      468      15      11
    4     3068      71      53
    5    15438     357     263
    6    53814    1183     886
    7    71352    1548    1167
    8     8784     210     154
    9       96       4       2
  total 153090    3393    2540
  */
  dist1[0] = 1;
  for (depth = 1; depth <= dist_gen_depth; depth++)
    {
      count[1] = count[2] = 0;
      mkd_search (0, 0, 1, mvlist2);
      // console.log(depth, count);
    }
  for (var i=0; i < MIN_CPT; i++) {
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
