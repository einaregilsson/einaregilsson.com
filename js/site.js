$(function() {
	syntaxHighlightCodeBlocks();
	setupAnalytics();
	//setupDisqus();
});

function syntaxHighlightCodeBlocks() {
	var codeBlocks = $('code[data-language]');
	if (codeBlocks.length) {
		$('head').append('<link rel="stylesheet" href="/css/shCore.css" type="text/css" />');
		$('head').append('<link rel="stylesheet" href="/css/shThemeDefault.css" type="text/css" />');

		$.getScript('/js/shCore.js', function() {
			var langBlocks = {};
			var langs = [];
			var brushCount = 0;
			codeBlocks.each(function() {
				var lang = $(this).data('language');
				if (!langBlocks[lang]) {
					langBlocks[lang] = [this];
					brushCount++;
				} else {
					langBlocks[lang].push(this);
				}
			});
			
			for (var lang in langBlocks) {
				$.getScript('/js/brush-'+lang+'.js', function(data) {
					brushCount--;
					if (brushCount == 0) {
						$.each(langBlocks, function(lang, blocks) {
							for (var i = 0; i < blocks.length;i++) {
								SyntaxHighlighter.highlight({brush:lang},blocks[i]);
							}
						});
					}
				});
			}
		});
	}
}

function setupAnalytics() {
	_gaq = [['_setAccount', 'UA-5098292-1'],['_trackPageview']];
	$.getScript('//www.google-analytics.com/ga.js');
}

function setupDisqus() {
	disqus_shortname = 'einaregilsson'; 
	disqus_identifier = document.location.pathname.replace(/\//g, '');
	if (disqus_identifier) {
		$.getScript('//' + disqus_shortname + '.disqus.com/embed.js');
	}
}
