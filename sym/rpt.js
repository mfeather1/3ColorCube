function rpt(arr, title) {
  document.write('<font size=+2>' + title + '</font><br><br>');
  document.write('<table border=1>');
  document.write('<tr><td><b>Mins</b></td><td><b>Syms</b></td>');
  document.write('<td><b>Configs</b></td></tr>'); 
  var sum1=0, sum2=0;
  for (var i=CUBE_SYM; i > 0; i--) {
    if (arr[i] != 0) {
      sum1 += arr[i];
      sum2 += arr[i]*i;
      document.write('<tr><td>' + arr[i] + '</td><td>' + i + '</td><td>');
      document.write(arr[i]*i + '</td></tr>');
    }
  }
  document.write('<tr><td><b>' + sum1 + '</b></td><td></td><td><b>');
  document.write(sum2 + '</b></td></tr>');
  document.write('<tr><td colspan=3 style=text-align:center>Ratio = ');
  document.write((sum2/sum1).toFixed(2) + '</td></tr>');
  document.write('</table><br>');
  document.write('<a href="javascript: history.go(-1)">Back</a><br><br>');
}

function count_mins(n1, n2) {
  var count3 = new Uint32Array(49);
  for (var i=0; i < n1; i++)
    for (var j=0; j < n2; j++)
      count2[count1[i*n2 + j]]++;
  for (var i=0; i < n1*n2; i++)
    if (count2[i] != 0)
      count3[count2[i]]++;
  rpt(count3, title);
}
