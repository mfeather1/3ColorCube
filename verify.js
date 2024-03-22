"use strict";

var msgtxt = [];

var CENTERS = [4, 22, 25, 28, 31, 49];

var CORNERS = [
   0,  2,  6,  8,  9, 11, 33, 35, 12, 14, 36, 38,
  15, 17, 39, 41, 18, 20, 42, 44, 45, 47, 51, 53];

var EDGES =  [
   1,  3,  5,  7, 10, 21, 23, 34, 13, 24, 26, 37,
  16, 27, 29, 40, 19, 30, 32, 43, 46, 48, 50, 52];

function verify_main(c) {
  var n;
  var tmp_stl = stl;
  var v = stl.substr(stl.length-1);
  if (v == 's' || v == 't')
    tmp_stl = stl.substr(0, stl.length-1);
  if (isNaN(tmp_stl)) {
    msgtxt.push('Search Time is invalid: ' + stl);
    return(2);
  }
  n = check_blank(c);   if (n) return(n);
  n = check_centers(c); if (n) return(n);
  n = check_corners(c); if (n) return(n);
  n = check_edges(c);   if (n) return(n);
  n = verify_cubestr(c);
  return(n);
}

function check_blank(c) {
  for (var i=0, n=0; i < 54; i++)
    if (c[i] == 'L')
      n++;
  if (n == 54) {
    msgtxt.push("No colors have been entered<br>Color the cube layout before solving");
    return(1);
  }
  return(0);
}

function check_centers(c) {
  var centers = [];
  for (var i=0; i < 6; i++)
    centers[i] = c[CENTERS[i]];
  for (i=0; i < 6; i++)
    if (centers[i] == 'L') {
      msgtxt.push("There is a problem with the CENTERS, one or more is blank<br>");
      return(1);
    }
  centers.sort();
  var rtn = uniq(centers, 6, 1, 0);
  if (rtn != 0) {
    msgtxt.push("There is a problem with the CENTERS, ");
    msgtxt.push("there should be one of each color but you have:<br>");
    uniq(centers, 6, 1, 1);
    return(1);
  }
  return(0);
}

function check_corners(c) {
  var corners = [];
  for (var i=0; i < 24; i++)
    corners[i] = c[CORNERS[i]];
  for (i=0; i < 24; i++)
    if (corners[i] == 'L') {
      msgtxt.push("There is a problem with the CORNERS, one or more is blank");
      return(1);
    }
  corners.sort();
  var rtn = uniq(corners, 24, 4, 0);
  if (rtn != 0) {
    msgtxt.push("There is a problem with the CORNERS, ");
    msgtxt.push("there should be four of each color but you have:<br>");
    uniq(corners, 24, 4, 1);
    return(1);
  }
  return(0);
}

function check_edges(c) {
  var edges = [];
  for (var i=0; i < 24; i++)
    edges[i] = c[EDGES[i]];
  for (i=0; i < 24; i++)
    if (edges[i] == 'L') {
      msgtxt.push("There is a problem with the EDGES, one or more is blank");
      return(1);
    }
  edges.sort();
  var rtn = uniq(edges, 24, 4, 0);
  if (rtn != 0) {
    msgtxt.push("There is a problem with the EDGES, ");
    msgtxt.push("there should be four of each color but you have:<br>");
    uniq(edges, 24, 4, 1);
    return(1);
  }
  return(0);
}

function uniq(s, n, v, f) {
  var stat = 0;
  var p = s[0];
  for (var i=1, j=1; i < n; i++)
    if (s[i] == p)
      j++;
    else {
      if (j != v) {
         stat = 1;
         if (f) msgtxt.push(j + ' ' + color_str(s[i-1]) + '<br>');
      }
      p = s[i];
      j = 1;
    }
  if (j != v) {
     stat = 1;
     if (f) msgtxt.push(j + ' ' + color_str(s[i-1]) + '<br>');
  }
  return(stat);
}

function verify_cubestr(s) {
  var check = [];
  // init_conv();
  convert_cnr_6c(s, cps, cts);
  convert_edg_6c(s, eps, ets);
  for (var i=0; i < 8; i++)
    check[i] = 0;
  for (var i=0, tw=0; i < 8; i++) {
    check[cps[i]] = 1;
    tw += cts[i];
  }
  for (var i=0, pos=0; i < 8; i++)
    pos += check[i];
  if (pos == 8 && tw%3 != 0) {
    // to get this error twist one corner
    msgtxt.push("There is a problem with the input, check the CORNERS\n");
    return(1);
  }
  if (pos != 8) {
    if (check_corners2(s))
      // to get this error swap two centers
      msgtxt.push("There is a problem with the input, check the CENTERS\n");
    else
      // to get this error switch two facelets on same cubie
      msgtxt.push("There is a problem with the input, check the CORNERS\n");
    return(1);
  }
  for (i=0; i < 12; i++)
    check[i] = 0;
  for (i=tw=0; i < 12; i++) {
    check[eps[i]] = 1;
    tw += ets[i];
  }
  for (i=pos=0; i < 12; i++)
    pos += check[i];
  // to get this error flip one edge
  if (pos != 12 || tw%2 != 0) {
    msgtxt.push("There is a problem with the input, check the EDGES\n");
    return(1);
  }
  /* ways to get this error:
     1. swap two edge cubies
     2. swap two corner cubies
     3. 4-cycle centers */
  if (parity(eps, 12) != parity(cps, 8)) {
    msgtxt.push("There is a problem with the input, fix incorrect squares and try again\n");
    return(1);
  }
  if (perm_to_int(cps,8)  == 0 && str_to_int(cts,7,3) == 0 &&
      perm_to_int(eps,12) == 0 && str_to_int(ets,11,2) == 0) {
    msgtxt.push("Cube already solved<br>No moves required\n");
    return(1);
  }
  return(0);
}

function check_corners2(c) {
  // check if corners are solvable independently
  var cps = new Uint8Array(8);
  var cts = new Uint8Array(8);
  for (var i=0, s=[]; i < 54; i++)
    s[i] = c[i];
  // assign UFR centers from UFR cubie
  s[4]=c[8];  s[25]=c[14];  s[28]=c[15];
  // get opposite face colors (with respect to UFR cubie)
  var ubl = get_ubl_cubie(c);
  var x = s[cnr_idx[ubl*3]];
  var y = s[cnr_idx[ubl*3+1]];
  var z = s[cnr_idx[ubl*3+2]];
  s[22] = (x==c[8]) ? y : (y==c[8]) ? z : x;  // left
  s[31] = (x==c[8]) ? z : (y==c[8]) ? x : y;  // back
  s[49] = get_remaining_color(s);             // down
  convert_cnr_6c(s, cps, cts);
  for (var i=0, check=[]; i < 8; i++)
    check[i] = 0;
  for (var i=0, tw=0; i < 8; i++) {
    check[cps[i]] = 1;
    tw += cts[i];
  }
  for (var i=0, pos=0; i < 8; i++)
    pos += check[i];
  if (pos == 8 && tw%3 == 0)
    return (1)
  return(0);
}

function get_ubl_cubie(c) {
  var u=c[8], f=c[14], r=c[15];
  for (var i=0; i < 8; i++) {
    var s = '' + c[cnr_idx[i*3]] + c[cnr_idx[i*3+1]] + c[cnr_idx[i*3+2]];
    if (s.indexOf(u) >= 0)
      if (s.indexOf(f) < 0 && s.indexOf(r) < 0)
        return(i);
  }
}

function get_remaining_color(c) {
  var s1 = 'BGORWY';
  var s2 = (c[4]+c[22]+c[25]+c[28]+c[31]).split('').sort().join('');
  for (var i=0; i < 8; i++)
    if (s1[i] != s2[i])
      return(s1[i]);
}
