// Search with 835 MB Dist3 (in addition to Dists 1-2)

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
            count2[0] = count2[1] = count2[2] = 0;
            if (use_p2seq) 
              get_p2_seq(cpr, eprsum(epr));
            else
              solver_search2 (0, 0, 0, 0, cp6c, epr, 1, mvlist2);
            if (show_node_counts > 1)
              show_p2_counts(); 
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
      if (depth-n <= 10 && depth-n >= 8) {
        ix = epmin*1119744 + ctsym*512 + (etsym>>2);  // C_TWIST*512 = 1119744
        var tmp = ((dist3[ix]>>((etsym&3)<<1))&3);
        dist = (tmp) ? tmp+8+n : 0;
        if (dist > depth)
          continue;
      }
      if (depth-n <= 9) {
        ix = epmin*76580 + cpsym*1094 + (ctsym>>1);  // C_PRM*1094 = 76580
        var dist = n + ((ctsym&1) ? dist1[ix]>>4 : dist1[ix]&0xF);
        if (dist > depth) 
          continue;
        ix = epmin*71680 + cpsym*1024 + (etsym>>1);  // C_PRM*1024 = 71680
        dist = n + ((etsym&1) ? dist2[ix]>>4 : dist2[ix]&0xF);
        if (dist > depth) 
          continue;
      }
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


