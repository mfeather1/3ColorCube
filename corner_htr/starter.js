// Author: Michael Feather 

"use strict";

var depth;
var count;
var seq = new Uint8Array(20);
var disp = ['R','L','U','D','F','B'];
var disp2 = [' ','2','\''];
var solution_found = 0;
var dist1;
var ccw_mv = [0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1];
var inv_mv = new Int8Array([2,1,0,5,4,3,8,7,6,11,10,9,14,13,12,17,16,15]);
var fs = [];

function solver_main()
{
  var cs = facelets;
  solve_cube(cs);
  cp_sol(solution, fs, fs.length);
}
function solve_cube(cs)
{
  convert_cnr_6c(cs, cps, cts);
  var ct = str_to_int(cts, 7, 3);
  solution_found = 0;
  for (depth=1; depth <= 6; depth++)
  {
    if (solution_found > 0)
      break;
    solver_search (ct, 1, mvlist2);
    document_write('Depth ' + depth + ' completed<br>');
  }
  var s = (solution_found == 1) ? '' : 's';
  document_write(solution_found + ' Optimal Solution' + s + ' Found');
  document_write('<br><br>');
}

function solver_search(ctn, n, mvlist)
{ 
  for (var i=0, mv=0; (mv=mvlist[i]) != NIL; i++) {
    var ct = ct_mov[ctn*MOVES+mv];
    if (n == depth) {
      if (ct == 0) {
        if (!ccw_mv[mv]) {
          seq[n] = mv;
          show_moves();
          if (solution_found == 0)
            cp_sol(fs, solution, n);
          solution_found++;
        }
      }
    }
    else {
      seq[n] = mv;
      solver_search(ct, n+1, seq_gen[mv]);
    }
  }
}

function show_moves() {
  for (var j=1; j <= depth; j++) {
    var m = get_move(seq[j]);
    document_write(m + ' ');
    solution[j-1] = m;
  }
  solution.length = depth; 
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
  dist1  = new Uint8Array(C_TWIST);
  populate_dist_arrays();
}

function init()
{
  init2();
  init_seq();
  set_colors_3c(0, 1, 2);
  init_map(map, sym_op_FR, sym_op_UR, reflect);
}

function populate_dist_arrays()
{ /* 
  moves  count
    0       1
    1       4 
    2      34 
    3     186 
    4     816 
    5    1018 
    6     128 
  total  2187
  */
  dist1[0] = 1;
  var mvlist3 = [0,3,12,15,-1];  // R L F B
  for (depth = 1; depth <= 6; depth++)
    {
      cfg_idx = 0;
      count = 0;
      mkd_search (0, 1, mvlist3);
      // console.log(depth, count);
    }
  dist1[0] = 0;
}

function mkd_search (ctn, n, mvlist)
{
  for (var i=0, mv=0; (mv=mvlist[i]) != NIL; i++) 
  {
    var ct = ct_mov[ctn*MOVES+mv];
    if (n == depth) {
      if (dist1[ct] == 0) {
        dist1[ct] = n;
        count++;
        seq[n] = mv;
      }
    }
    else {
      seq[n] = mv;
      mkd_search (ct, n+1, seq_gen[mv]);
    }
  }
}
