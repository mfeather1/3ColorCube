"use strict";

var fnames = [];

function init_fnames() {
  var dep = ((dist_gen_depth < 10) ? '0' : '') + dist_gen_depth;
  var dep2 = ((distp2_gen_depth < 10) ? '0' : '') + distp2_gen_depth;
  fnames[0] = 'Dist1_' + dep + 'F.dat'; 
  fnames[1] = 'Dist2_' + dep + 'F.dat'; 
  if (USE_DIST3) {
    var dep3 = ((dist3_gen_depth < 10) ? '0' : '') + dist3_gen_depth;
    fnames[2] = 'Dist3_' + dep3 + 'F' + (USE_DIST3==2?'Q':'') + '.dat'; 
    fnames[3] = 'DistP2_' + dep2 + 'F.dat'; 
  }
  else
    fnames[2] = 'DistP2_' + dep2 + 'F.dat'; 
}

function readfiles(files) {
  var to_load = [];
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
    postMessage({'cmd': 'msg', 'msg': 'Loading File' + s});
    for (var i = 0; i < files.length; i++) {
      for (var j=0; j < fnames.length; j++) {
        if (files[i].name == fnames[j] && dist_loaded[j] == 0) {
          try {
            /* if (files[i].name.substring(0,5) == 'Dist3')
              load_dist3(files[i]);
            else */
              readfile(files[i]);
          }
          catch (e) {
            postMessage({'cmd': 'msg', 'msg': 'Error Loading Files'});
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
      dist1 = new Uint8Array(e.target.result);
      dist_loaded[0] = 1;
      load_msg();
    }
    if (name == fnames[1]) {
      dist2 = new Uint8Array(e.target.result);
      dist_loaded[1] = 1;
      load_msg();
    }
    if (USE_DIST3) {
      if (name == fnames[2]) {
        dist3 = new Uint8Array(e.target.result);
        dist_loaded[2] = 1;
        load_msg();
      }
    }
    if (name == fnames[fnames.length-1]) {
      distp2 = new Uint8Array(e.target.result);
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
  postMessage({'cmd': 'msg', 'msg': list});
  postMessage({'cmd': 'fileLoadStatus', 'dist_loaded': dist_loaded});
  if (dist_files_loaded == 0) {
    for (var i=0, n=0; i < dist_loaded.length; i++)
      n += dist_loaded[i];
    if (n == dist_loaded.length) {
      dist_files_loaded = 1;
      postMessage({'cmd': 'readFilesDone'});
    }
  }
}

function load_dist3(file) {
  var fileSize = file.size;
  var bufSize = file.size/16;
  var offset = 0;
  var readbuf = null;
  dist3 = new Uint8Array(fileSize); 
  var readEventHandler = function(e) {
    if (e.target.error == null) {
      var buf = new Uint8Array(e.target.result);
      for (var i=0; i < bufSize; i++)
        dist3[offset+i] = buf[i];
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
