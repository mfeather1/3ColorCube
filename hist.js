params = location.search.substr(1).split('&');
for (var i=0; i < params.length; i++) {
  var p = params[i].split('=');
  window[p[0]] = p[1];
}
function hst() {
  if (!history.state && typeof(history.replaceState) == "function")
    if (typeof(rand) == 'undefined')
      history.replaceState({ page: history.length }, "");
    else
      history.replaceState({ page: history.length, rand: rand }, "");
  if (history.state && history.state.page == 1)
    hist = 0;
  else if (typeof(hist) == 'undefined')
    hist = 1;
  else 
    hist++;
}
