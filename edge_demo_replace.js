  function replm(s) { 
    s = s.replace(/Q1/g, "R'Um2'R");
    s = s.replace(/Q2/g, "R'Um'R2'UmR");
    s = s.replace(/Q3/g, "R'UmL'D2LUm'R");
    s = s.replace(/Q4/g, "R'UmLD2L'Um'R");
    return (s);
  } 
  function replm2(s) { 
    s = s.replace(/Q1/g, "R2'Um2'R2'Um2'");
    s = s.replace(/Q2/g, "R'Um2'R2'Um2'R'");
    s = s.replace(/Q3/g, "R2'F2R2'F2R2'F2");
    s = s.replace(/Q4/g, "R2'Um'R2'Um");
    s = s.replace(/Q5/g, "Rm2Dm2Fm2");
    s = s.replace(/Q6/g, "F'R2F2R2F2R2F'");
    return (s);
  } 
  function repl(s) { 
    s = s.replace("A1", "Make setup");
    s = s.replace("A2", "Sequence ");
    s = s.replace("A3", "Restore corners");
    s = s.replace("E", "3C-E");
    s = s.replace("-", "&#8209;");
    return (s);
  } 
  function repl2(s) { 
    s = s.replace("A1", "Turn cube to match setup");
    s = s.replace("A2", "Sequence ");
    s = s.replace("A3", "Half-twist slices");
    s = s.replace("E", "6C-E");
    s = s.replace("-", "&#8209;");
    s = s.replace("SC1", " (<a href=edge_6c_hints3.html#cube1>SC1</a>)");
    s = s.replace("SC2", " (<a href=edge_6c_hints3.html#cube2>SC2</a>)");
    return (s);
  } 
