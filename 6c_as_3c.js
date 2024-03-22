function var_color(ro, yw, gb) {
  r = red(ro);
  o = orange(ro);
  g = green(gb);
  b = blue(gb);
  y = yellow(yw);
  w = white(yw);
  return(r + o + y + w + g + b);
}
function rgb_to_hex(r, g, b) {
 return (hex(r) + hex(g) + hex(b));
}
function hex(n) {
  var h = n.toString(16);
  return ((h.length == 1) ? '0' + h : h).toUpperCase();
}
function scale(base, n, max, sign) {
  return(Math.floor(base + n/100 * max *sign));
}
//   R  G  B
// 208  0  0  red
// 232 48 16
// 255 96 32  orange
function red(n) {
  R = scale(232, n, 24, -1);
  G = scale(48, n, 48, -1);
  B = scale(16, n, 16, -1);
  return(rgb_to_hex(R, G, B));
}
function orange(n) {
  R = scale(232, n, 23, 1);
  G = scale(48, n, 48, 1);
  B = scale(16, n, 16, 1);
  return(rgb_to_hex(R, G, B));
}
//  R   G   B
//  0 144   0  green
// 16 104 104
// 32  64 208  blue
function green(n) {
  R = scale(16, n, 16, -1);
  G = scale(104, n, 40, 1);
  B = scale(104, n, 104, -1);
  return(rgb_to_hex(R, G, B));
}
function blue(n) {
  var R = scale(16, n, 16, 1);
  var G = scale(104, n, 40, -1);
  var B = scale(104, n, 104, 1);
  return(rgb_to_hex(R, G, B));
}
//   R   G   B
// 255 255   0  yellow
// 255 255 128
// 255 255 255  white
function yellow(n) {
  var R = 255;
  var G = 255;
  var B = scale(128, n, 128, -1);
  return(rgb_to_hex(R, G, B));
}
function white(n) {
  var R = 255;
  var G = 255;
  var B = scale(128, n, 127, 1);
  return(rgb_to_hex(R, G, B));
}
