// ==UserScript==
// @name        iwantmyname nameserver multiline paste
// @namespace   iwantmyname.dnspaste
// @description Allows you to paste multiple dns servers at once at iwantmyname.com
// @include     https://iwantmyname.com/dashboard/domains/ns-update/*
// @version     1
// @grant       none
// ==/UserScript==

var strip = function(s) { return s.replace(/^\s*|\s*$/g, ''); }

document.getElementById('ns1').addEventListener('paste', function(e) {
  var lines = strip(e.clipboardData.getData('Text')).split(/\r?\n/);
  if (lines.length == 1) {
  	return; 
  }
  for (var i = 1; i <= Math.min(5, lines.length); i++) {
  	var el = document.getElementById('ns'+i);
    el.value = strip(lines[i-1] || '');
    var ev = document.createEvent('HTMLEvents');
    ev.initEvent('blur', true, true);
    el.dispatchEvent(ev);
  }
  e.preventDefault();
});