function show_edge_seq_6c() {
document.getElementById('edge_seq_6c').innerHTML = 
`<style>
 td {text-align:center}
 .es6d {width:100px; height:100px}
</style>
<table border=0>
 <tr height=10>
 <tr>
  <td><div id=ec61 class=es6d></div><br>6C-E1</td>
  <td width=30>
  <td><div id=ec62 class=es6d></div><br>6C-E2</td>
  <td width=30>
  <td><div id=ec63 class=es6d></div><br>6C-E3</td>
  <td width=30>
  <td><div id=ec64 class=es6d></div><br>6C-E4</td>
 </tr>
</table>`
AnimCube3("config=medium.txt&id=ec61&initrevmove=#&move=R2'Um2'R2'Um2'&colorscheme=roywgb");
AnimCube3("config=medium.txt&id=ec62&initrevmove=#&move=R'Um2'R2'Um2'R'&colorscheme=roywgb");
AnimCube3("config=medium.txt&id=ec63&initrevmove=#&move=R2'F2R2'F2R2'F2&colorscheme=roywgb");
AnimCube3("config=medium.txt&id=ec64&initrevmove=#&move=R2'Um'R2'Um&colorscheme=roywgb");
}

