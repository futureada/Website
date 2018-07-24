require([],function(){
	function App() {
		console.log('%c####################\n#App.js Initializing\n####################', 'background: #bada55; color: #222');
		this.registeredModules = require.s.contexts['_'].registry
		this.init();
	}

	App.prototype.init = function(){
		this.initViewsLayouts();
		this.addOffsetClass();
	};

	App.prototype.initViewsLayouts = function() {
		for( module in this.registeredModules) {
			if( module !== "_@r4" ) { // don't load this one, some requirejs obj.
				(function(module) {
					require([module], function(thisModule){
						if(thisModule !== undefined) {
							var $elements = $('.'+module);
							$elements.each(function(){
								thisModule($(this));
							})
						}
					});
				}(module));
			}
		}
	};

	App.prototype.addOffsetClass = function() {
		var $scrollTops = $('[scroll-top]');
		$(window).scroll(function(){
			var scrollTop = $(window).scrollTop() + $(window).height();
			var height = $(window).height();
			$scrollTops.each(function(){
				var top = $(this).offset().top;
				if(top <= scrollTop && (top + height) >= scrollTop ) {
					$(this).addClass( 'scrolled-in' );
				}
			})
		});

	}

	return new App();

});