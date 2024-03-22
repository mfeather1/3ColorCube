function repl(s) { 
  s = s.replace("A1", "Solve top face"); 
  s = s.replace("A2", "Turn cube to match setup for "); 
  s = s.replace("A3", "Apply sequence ");
  s = s.replace("A4", "Move solved faces to left & right");
  s = s.replace("A5", "Solve top face with left twist");
  s = s.replace("A6", "Solve top face with right twist");
  s = s.replace("A7", "Solve top face with left & right twists");
  s = s.replace("A8", "Solve top face with front twist (<a href=corners2.html>WW</a>)");
  s = s.replace("A9", "Solve top face with back twist (<a href=corners2.html>WW</a>)");
  s = s.replace("-", "&#8209;");
  return (s);
} 
function repl2(s) { 
  s = s.replace("B01", "Half-twist the front face to make the setup for the Parallel Sequence.");
  s = s.replace("B02", "No faces are solvable with half-twists and no faces have parallel pairs, half-twist the right face to make parallel pairs and then half-twist the front face to make the setup for the Parallel Sequence.");
  s = s.replace("B03", "No faces are solvable with half-twists and no faces have parallel pairs, half-twist the right face to make parallel pairs and then turn the cube to make the setup for the Parallel Sequence.");
  s = s.replace("B04", "No faces are solvable with half-twists and no faces have parallel pairs, half-twist the right face to make parallel pairs, turn the cube and then half-twist the front face to make the setup for the Parallel Sequence.");
  s = s.replace("B05", "No faces are solvable with half-twists and no faces have parallel pairs, half-twist the right face to make parallel pairs which in this case also makes the setup for the Parallel Sequence.");
  s = s.replace("B06", "No faces are solvable with half-twists, turn the cube and then half-twist the front face to make the setup for the Parallel Sequence.");
  s = s.replace("B07", "No faces are solvable with half-twists, turn the cube to make the setup for the Parallel Sequence.");
  s = s.replace("B08", "No faces are solvable with half-twists, use the Parallel Sequence (this configuration already matches the setup).");
  s = s.replace("B09", "The front &amp; back faces are solvable, solve with a half twist and then turn the cube so they are on the left &amp; right to make the setup for the Waterwheel Sequence.");
  s = s.replace("B10", "The front &amp; back faces are solvable, solve with half-twists and then turn the cube so they are on the left &amp; right to make the setup for the Waterwheel Sequence.");
  s = s.replace("B11", "The front &amp; back faces are solved, turn the cube so they are on the left &amp; right to make the setup for the Waterwheel Sequence.");
  s = s.replace("B12", "The left &amp; right faces are solvable, solve with a half twist and use the Waterwheel Sequence.");
  s = s.replace("B13", "The left &amp; right faces are solvable, solve with half-twists and use the Waterwheel Sequence.");
  s = s.replace("B14", "The left &amp; right faces are solved, use the Waterwheel Sequence");
  s = s.replace("B15", "The top &amp; bottom faces are solvable, solve with a half twist and then turn the cube so they are on the left &amp; right to make the setup for the Waterwheel Sequence.");
  s = s.replace("B16", "The top &amp; bottom faces are solvable, solve with half-twists and then turn the cube so they are on the left &amp; right to make the setup for the Waterwheel Sequence.");
  s = s.replace("B17", "The top &amp; bottom faces are solved, turn the cube so they are on the left &amp; right to make the setup for the Waterwheel Sequence.");
  s = s.replace("B18", "This configuration can be solved with half-twists.");
  return (s);
}
function repl3(s) { 
  s = s.replace("A1", "Make setup"); 
  s = s.replace("A2", "Waterwheel Sequence"); 
  s = s.replace("A3", "Parallel Sequence");
  s = s.replace("A4", "Solve with half-twists");
  s = s.replace("-", "&#8209;");
  return (s);
} 
