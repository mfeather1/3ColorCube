"use strict";

var fnames = [];

function init_fnames() {
  var n = 0;
  var dep = ((dist_gen_depth < 10) ? '0' : '') + dist_gen_depth;
  var dep2 = ((distp2_gen_depth < 10) ? '0' : '') + distp2_gen_depth;
  fnames[n++] = 'Dist1_' + dep + 'F.dat'; 
  fnames[n++] = 'Dist2_' + dep + 'F.dat'; 
  if (USE_DIST3) {
    var dep3 = ((dist3_gen_depth < 10) ? '0' : '') + dist3_gen_depth;
    fnames[n++] = 'Dist3_' + dep3 + 'F' + (USE_DIST3==2?'Q':'') + '.dat'; 
  }
  if (USE_DIST4)
    fnames[n++] = 'Dist4_11F.dat';
  fnames[n] = 'DistP2_' + dep2 + 'F.dat'; 
}

function readfiles(files) {
  var to_load = [];
  var stat = document.getElementById('status').innerHTML;
  if (stat.substr(0,4) != 'Load')
    document.getElementById('status').innerHTML = '';
  for (var i=0, n=0; i < files.length; i++) {
    for (var j=0; j < fnames.length; j++) {
      if (files[i].name == fnames[j] && dist_loaded[j] == 0) {
        to_load[j] = 1;
        n++;
      }
    }
  }
  if (n > 0) {
    var s = ((n==1) ? '' : 's');
    document.getElementById('status').innerHTML = 'Loading File' + s;
    for (var i = 0; i < files.length; i++) {
      for (var j=0; j < fnames.length; j++) {
        if (files[i].name == fnames[j] && dist_loaded[j] == 0) {
          try {
            if (files[i].name.substring(0,5) == 'Dist3')
              load_dist3(files[i]);
            else if (files[i].name.substring(0,5) == 'Dist4')
              load_dist4(files[i], j);
            else
              readfile(files[i]);
          }
          catch (e) {
            document.getElementById('status').innerHTML = 'Error Loading Files';
            alert(e);
          }
        }
      }
    }
  }
}

function readfile(file) {
  var name = file.name;
  var reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onload = function(e) {
    if (name == fnames[0]) {
      var d1 = new Uint8Array(e.target.result);
      var d1s = new Uint8Array(dist1_shared);
      for (var i=0; i < d1.length; i++)
        d1s[i] = d1[i];
      dist_loaded[0] = 1;
      load_msg();
    }
    if (name == fnames[1]) {
      var d2 = new Uint8Array(e.target.result);
      var d2s = new Uint8Array(dist2_shared);
      for (var i=0; i < d2.length; i++)
        d2s[i] = d2[i];
      dist_loaded[1] = 1;
      load_msg();
    }
    if (USE_DIST3) {
      if (name == fnames[2]) {
        var d3 = new Uint8Array(e.target.result);
        var d3s = new Uint8Array(dist3_shared);
        for (var i=0; i < d3.length; i++)
          d3s[i] = d3[i];
        dist_loaded[2] = 1;
        load_msg();
      }
    }
    if (name == fnames[fnames.length-1]) {
      var p2 = new Uint8Array(e.target.result);
      var p2s = new Uint8Array(distp2_shared);
      for (var i=0; i < p2.length; i++)
        p2s[i] = p2[i];
      dist_loaded[fnames.length-1] = 1;
      load_msg();
    }
  }
}

function load_msg() {
  var list = 'Loaded:<br>';
  for (var i=0; i < fnames.length; i++)
    if (dist_loaded[i])
      list += fnames[i] + '<br>';
  document.getElementById('status').innerHTML = list;
  if (dist_files_loaded == 0) {
    for (var i=0, n=0; i < dist_loaded.length; i++)
      n += dist_loaded[i];
    if (n == dist_loaded.length) {
      dist_files_loaded = 1;
      readfiles_done();
    }
  }
}

function load_dist3(file) {
  var fileSize = file.size;
  var bufSize = file.size/16;
  var offset = 0;
  var readbuf = null;
  var d3s = new Uint8Array(dist3_shared);
  var readEventHandler = function(e) {
    if (e.target.error == null) {
      var buf = new Uint8Array(e.target.result);
      for (var i=0; i < bufSize; i++)
        d3s[offset+i] = buf[i];
      offset += buf.length; 
    } else {
      console.log("Dist3 Read Error: " + e.target.error);
      return;
    }
    if (offset >= fileSize) {
      dist_loaded[2] = 1;
      load_msg();
      return;
    }
    readbuf(offset, bufSize, file);
  }
  readbuf = function(ofs, len, f) {
    var r = new FileReader();
    var blob = f.slice(ofs, len + ofs);
    r.onload = readEventHandler;
    r.readAsArrayBuffer(blob);
  }
  readbuf(0, bufSize, file);
}

function load_dist4(file, ix) {
  var fileSize = file.size;
  var bufSize = file.size/32;
  var offset = 0;
  var readbuf = null;
  var d4s = new Uint8Array(dist4_shared);
  var readEventHandler = function(e) {
    if (e.target.error == null) {
      var buf = new Uint8Array(e.target.result);
      for (var i=0; i < bufSize; i++)
        d4s[offset+i] = buf[i];
      offset += buf.length; 
    } else {
      console.log("Dist4 Read Error: " + e.target.error);
      return;
    }
    if (offset >= fileSize) {
      dist_loaded[ix] = 1;
      load_msg();
      return;
    }
    readbuf(offset, bufSize, file);
  }
  readbuf = function(ofs, len, f) {
    var r = new FileReader();
    var blob = f.slice(ofs, len + ofs);
    r.onload = readEventHandler;
    r.readAsArrayBuffer(blob);
  }
  readbuf(0, bufSize, file);
}

