function show_edge_seq_3c() {
document.getElementById('edge_seq_3c').innerHTML = 
`<style>
 td {text-align:center}
 .esd {width:100px; height:100px}
</style>
<table border=0>
 <tr>
  <td>Solve 4<br><div id=ec1 class=esd></div><br>3C-E1</td>
  <td width=30>
  <td>Solve 2<br><div id=ec2 class=esd></div><br>3C-E2</td>
  <td width=30>
  <td><br><div id=ec3 class=esd></div><br>3C-E3</td>
  <td width=30>
  <td><br><div id=ec4 class=esd></div><br>3C-E4</td>
 </tr>
</table>`;
AnimCube3("config=medium.txt&id=ec1&initrevmove=#&move=R'Um2'R&colorscheme=rryybb");
AnimCube3("config=medium.txt&id=ec2&initrevmove=#&move=R'Um'R2'UmR&colorscheme=rryybb");
AnimCube3("config=medium.txt&id=ec3&initrevmove=#&move=R'UmL'D2LUm'R&colorscheme=rryybb");
AnimCube3("config=medium.txt&id=ec4&initmove=R'UmLD2L'Um'R&move=R'UmLD2L'Um'R&colorscheme=rryybb");
}
