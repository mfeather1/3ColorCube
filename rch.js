"use strict";
/* 
  CT_SYM_METHOD: 
    Method 1 uses cpt_sym (14 MB)
    Method 2 uses cpt_sym2 (318 KB) and cpt_min (600 KB)
    Method 3 uses ct_sym (205 KB) and ct_ud_fb (300 KB)

  ET_SYM_METHOD:
    Method 1 uses et_sym_UF (2 MB)
    Method 2 does not use et_sym_UF for search, uses 4 KB for init only

  EPT_OP_METHOD:
    Method 1 uses ept_min_op 4 MB
    Method 2 reduces ept_min_op to 2.5 MB, uses 8 MB of temp during init,
             takes slightly longer on startup
*/
var CT_SYM_METHOD = 3;
var ET_SYM_METHOD = 2;
var EPT_OP_METHOD = 1;

var show_init_time_details = 0;

var MOVES     = 18;         // moves in face-turn metric
var E_PRM     = 34650;      // 3C edge perms
var E_TWIST   = 2048;       // edge twist (flip)
var C_PRM     = 70;         // 3C corner perms
var C_TWIST   = 2187;       // corner twist
var C_PERM    = 40320;      // 6C corner perms
var C_PRM_TW  = 153090;     // 3C corners
var MIN_CPT   = 3393;       // 3C corners reduced by symmetry
var MIN_EP    = 782;        // 3C edge perms reduced by symmetry
var E_PRMr    = 13824;      // 6C/3C edge perms
var C_PRMr    = 576;        // 6C/3C corner perms
var CUBE_SYM  = 48;         // cube symmetries
var EP_OP_ROW = 72;         // row in ep_sym with 48 unique symmetries
var OP_FR     = 1;          // sym op that moves cube Front -> Right 
var OP_UF     = 13;         // sym op that moves cube Up -> Front
var OP_UR     = 21;         // sym op that moves cube Up -> Right
var B2_MAX    = 128;        // 2^7
var B3_MAX    = 177147;     // 3^11
var SLICE_PRM = 495;        // 3C slice permutations
var FACELETS  = 54
var NIL       = -1;

var CFG_LIST_3C     = 4000; // max size of 3C cfg list used by chk_dup()
var EP_MULTI_MIN_OP = 2058; // EPs with multiple symmetry min ops
var N_EPT_MIN_OP    = 1290  // #rows in ept_min_op (deduplicated)
var N_EPT_MIN_OPS   = 7331; // #rows in ept_min_ops
var N_EPT_OPS_IX2   = 103;  // #rows in ept_ops_ix2

var cfg_idx = 0;

// Arrays with size less than 1 KB

var flip        = new Uint8Array([1,0]);
var cw          = new Uint8Array([1,2,0]);
var ccw         = new Uint8Array([2,0,1]);
var untwc       = new Uint8Array([0,2,1]);
var cps         = new Uint8Array(8);
var cts         = new Uint8Array(8);
var eps         = new Uint8Array(12);
var ets         = new Uint8Array(12);
var cnr         = new Uint8Array(24); 
var edg         = new Uint8Array(24); 
var cnr2        = new Uint8Array(24); 
var edg2        = new Uint8Array(24); 
var inv_op      = new Uint8Array(CUBE_SYM);
var ct_op_type  = new Uint8Array(CUBE_SYM);
var cubestr     = new Uint8Array(FACELETS);
var cp_b2       = new Uint8Array(C_PRM);
var op16e       = new Uint8Array(CUBE_SYM * 2);
var b2_cp       = new Uint8Array(B2_MAX);
var cmv         = new Uint8Array(MOVES * 8);
var emv         = new Uint8Array(MOVES * 12);
var mvlist1     = new Int8Array(3);
var mvlist2     = new Int8Array(MOVES+1);

// Arrays larger than 1 KB
//                                                           Size(KB)
var cp_mov      = new Uint8Array(C_PRM * MOVES);          //     1
var min_ep      = new Uint16Array(MIN_EP);                //     2
var op_op       = new Uint8Array(CUBE_SYM*CUBE_SYM);      //     2
var slice_ep    = new Uint16Array(SLICE_PRM * 3);         //     3
var map         = new Uint8Array(CUBE_SYM * FACELETS);    //     3
var cp_sym      = new Uint8Array(C_PRM*CUBE_SYM);         //     3
var b2_slice    = new Uint16Array(4096);                  //     8
var ep_min_op   = new Uint8Array(E_PRM);                  //    34
var cp6c_cp3c   = new Uint8Array(C_PERM);                 //    40 
var ep_min      = new Uint16Array(E_PRM);                 //    68
var ept_op_idx  = new Int16Array(E_PRM);                  //    68
var et_mov      = new Uint16Array(E_TWIST * MOVES);       //    72
var ct_mov      = new Uint16Array(C_TWIST * MOVES);       //    77 
var cp6c_cpr    = new Uint16Array(C_PERM);                //    80 
var ep_b3       = new Uint32Array(E_PRM);                 //   135
var et_sym      = new Uint16Array(E_TWIST * CUBE_SYM);    //   192
var ep_slice    = new Uint16Array(E_PRM * 3);             //   203
var epr_mov     = new Uint8Array(SLICE_PRM*24*MOVES);     //   209
var b3_ep       = new Uint16Array(B3_MAX);                //   346
var cpt_min     = new Uint16Array(C_PRM_TW * 2);          //   600
var ep_mov      = new Uint16Array(E_PRM * MOVES);         //  1218
var cp6c_mov    = new Uint16Array(C_PERM * MOVES);        //  1418
var et_sym_FR   = new Uint16Array(SLICE_PRM * E_TWIST);   //  1980

if (CT_SYM_METHOD == 1) 
  var cpt_sym   = new Uint16Array(C_PRM_TW * CUBE_SYM);   // 14352
else if (CT_SYM_METHOD == 2)
  var cpt_sym2  = new Uint16Array(MIN_CPT * CUBE_SYM);    //   318
else {
  var ct_sym    = new Uint16Array(C_TWIST * CUBE_SYM);    //   205 
  var ct_ud_fb  = new Uint16Array(C_PRM * C_TWIST);       //   300
}

if (ET_SYM_METHOD == 1) 
  var et_sym_UF = new Uint16Array(SLICE_PRM * E_TWIST);   //  1980 
else
  var et_sym_UF = new Uint16Array(E_TWIST);               //     4

// Used 6% of the time (2058/34650)
var ept_ops_ix1 = new Int8Array(MIN_EP);                  //     1
var ept_ops_ix2 = new Int16Array(N_EPT_OPS_IX2*E_TWIST);  //   412

// Used 6% of the time (same as above)
if (EPT_OP_METHOD == 1)
var ept_min_op  = new Int8Array(EP_MULTI_MIN_OP*E_TWIST); //  4116
else
var ept_min_op  = new Int8Array(N_EPT_MIN_OP*E_TWIST);    //  2580

// Used .24% of the time (170928/70963200)
var ept_min_ops = new Uint16Array(N_EPT_MIN_OPS * 27);    //   387

// var ep_sym      = new Uint16Array(E_PRM * CUBE_SYM);   //  3248 

/* Cube Layout:

           00 01 02
           03 04 05
           06 07 08
  09 10 11 12 13 14 15 16 17 18 19 20
  21 22 23 24 25 26 27 28 29 30 31 32
  33 34 35 36 37 38 39 40 41 42 43 44
           45 46 47
           48 49 50
           51 52 53
*/
var center_idx = [4,22,25,28,31,49];

var cnr_idx = new Uint8Array 
([6,12,11,47,38,39,51,44,33,2,18,17,45,35,36,8,15,14,0,9,20,53,41,42]);
// [[6,12,11],[47,38,39],[51,44,33],[2,18,17],[45,35,36],[8,15,14],[0,9,20],[53,41,42]];

var edg_idx = new Uint8Array 
([24,23,26,27,30,29,32,21,7,13,46,37,52,43,1,19,3,10,5,16,50,40,48,34]);
// [[24,23],[26,27],[30,29],[32,21],[7,13],[46,37],[52,43],[1,19],[3,10],[5,16],[50,40],[48,34]];

var sym_op_FR = new Uint8Array([  // Front -> Right
  2, 5, 8, 1, 4, 7, 0, 3, 6,18,19,20, 9,10,11,12,13,14,
  15,16,17,30,31,32,21,22,23,24,25,26,27,28,29,42,43,44,
  33,34,35,36,37,38,39,40,41,51,48,45,52,49,46,53,50,47]);

var sym_op_UR = new Uint8Array([  // Up -> Right
  33,21, 9,34,22,10,35,23,11,51,48,45,36,24,12, 6, 3, 0,
  20,32,44,52,49,46,37,25,13, 7, 4, 1,19,31,43,53,50,47,
  38,26,14, 8, 5, 2,18,30,42,39,27,15,40,28,16,41,29,17]);

var reflect = new Uint8Array([
   2, 1, 0, 5, 4, 3, 8, 7, 6,17,16,15,14,13,12,11,10, 9,
  20,19,18,29,28,27,26,25,24,23,22,21,32,31,30,41,40,39,
  38,37,36,35,34,33,44,43,42,47,46,45,50,49,48,53,52,51]);

var ctw = [];
var etw = [];
var seq_gen = [];
var populated = [];
var solution = [];
var logtxt = [];
var logwin;
var get_etsym;
var get_ctsym;
var color;
var first_time = 1;
var gtime0;
var init_time;
var search_time;
