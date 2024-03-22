function show_starter_seq() {
document.getElementById('starter_seq').innerHTML = 
`<style>
 .ssd td {padding-left:6px; padding-right:6px; border-color:black; text-align:center;}
 .ssd2 td {padding-left:12px; padding-right:12px; border-color:black; text-align:center;}
 .ssz {width:86px; height:86px}
</style>
<table class=ssd2 style="border-collapse:collapse;border:1px solid black;" border=1>
 <tr>
  <td>Solve 2<br><div id=sc1 class=ssz></div><br>S1</td>
  <td>Solve 4<br><div id=sc2 class=ssz></div><br>S2</td>
 </tr>
</table>
<br>
<table class=ssd style="border-collapse:collapse; border:1px solid black;" border=1><tr><td>
<table class=ssd style=border-collapse:collapse border=0>
 <tr>
  <td colspan=3 style=text-align:center>Make S1</td>
 </tr>
 <tr>
  <td><div id=sc3 class=ssz></div><br>M1</td>
  <td><div id=sc4 class=ssz></div><br>M2</td>
 </tr>
</table>
</td><td>
<table class=ssd style=border-collapse:collapse border=0>
 <tr>
  <td colspan=5>Make S2</td>
 </tr>
 <tr>
  <td><div id=sc5 class=ssz></div><br>M3</td>
  <td><div id=sc6 class=ssz></div><br>M4</td>
  <td><div id=sc7 class=ssz></div><br>M5</td>
 </tr>
</table>
</td></tr></table>`;
AnimCube3("id=sc1&config=small.txt&initrevmove=#&move=RD2RD2R&facelets=rlrlrlrlrrlrlrlrlrllllllllllllllllllllllllllllllllllll");
AnimCube3("id=sc2&config=small.txt&initrevmove=#&move=R2D2R&facelets=rlrlrlrlrrlrlrlrlrllllllllllllllllllllllllllllllllllll");
AnimCube3("id=sc3&config=small.txt&initrevmove=B2'R'D2RD2R&move=B2'R2'&facelets=rlrlrlrlrrlrlrlrlrllllllllllllllllllllllllllllllllllll");
AnimCube3("id=sc4&config=small.txt&position=lluuu&initrevmove=R2'F'R'DR&move=R2'U'R2'&facelets=rlrlrlrlrrlrlrlrlrllllllllllllllllllllllllllllllllllll");
AnimCube3("id=sc5&config=small.txt&initrevmove=FDF'R2D2R&move=FDF'&facelets=rlrlrlrlrrlrlrlrlrllllllllllllllllllllllllllllllllllll");
AnimCube3("id=sc6&config=small.txt&position=lluuu&initrevmove=FD'F'R2D2R&move=FD'F'&facelets=rlrlrlrlrrlrlrlrlrllllllllllllllllllllllllllllllllllll");
AnimCube3("id=sc7&config=small.txt&position=lluuu&initrevmove=R'DRF2'D2F&move=R'DRZ&facelets=rlrlrlrlrrlrlrlrlrllllllllllllllllllllllllllllllllllll");
}
