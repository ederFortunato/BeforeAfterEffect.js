/*
 *  Project: BeforeAfterEffect.js
 *  Description: 
 *  Author: Eder Fortunato
 *  License: WTFPL
 */

;(function ( $, window, document, undefined ) {
            
    // Create the defaults once
    var pluginName = 'BeforeAfterEffect',
        defaults = {
             width:100,
             height:100 
        };       

    // The actual plugin constructor
    function BeforeAfterEffect( element, options ) {

        this.element = element;
        this.line    = null, 
        this.divisor = null, 
        this.newDiv  = null;

        this.options = $.extend( {}, defaults, options) ;
        
        this._defaults = defaults;
        this._name = pluginName;
        
        this.init();
    }

    BeforeAfterEffect.prototype = {
        init : function () {

            var _this   = this,
                _elem	= $(this.element),          
                _w      = this.options.width, 
                _h      = this.options.height,
            	imgA 	= _elem.find('img').eq(0),
            	imgB 	= _elem.find('img').eq(1),
                captionA=  $('<span></span>'), 
                captionB=  $('<span></span>'); 

            this.line     = $('<div></div>');
            this.divisor  = $('<div></div>');
            this.newDiv   = $('<div></div>');
              
    		_elem.addClass('BeforeAfterEffect')
                 .width(_w)
                 .height(_h)
                 .append(captionB)
                 .append(this.newDiv)            
                 .append(this.line)  
                 .append(this.divisor);

             

            this.divisor.addClass('hoverDivisor')
                   .css({top: _h / 2});

            captionA.addClass('capA')
                    .html(imgA.attr('alt'));

            captionB.addClass('capB')
                    .html(imgB.attr('alt'));

            this.line.addClass('lineDivisor')           
                .height(_h);

            this.newDiv.append(imgA)
                  .append(captionA)
                  .height(_h);                      
     
            _elem.bind('mousedown', function(e){
               _this.setPosition(e.pageX - _elem.offset().left, true);
            });

            addDragDrop(this.divisor, {limitX: _w, onMove: $.proxy(this, 'setPosition')});        
            
            this.setPosition(_w / 2);

            // hack for IE       
            this.divisor.attr('unselectable', 'on');
            // hack for chrome
            _elem.attr('onselectstart', 'return false;');

        },
        setPosition : function (p, isAnimate){
        
            if(isAnimate){           
                this.newDiv.stop().animate({width: p }, 500);
                this.divisor.stop().animate({left: p - (this.divisor.width() / 2)}, 500);
                this.line.stop().animate({left: p - (this.line.width() / 2) }, 500);
            }else{            
                this.newDiv.width( p );
                this.divisor.css('left', p - (this.divisor.width() / 2));  
                this.line.css('left', p - (this.line.width() / 2) );
            }
        }
    };

    function addDragDrop (me, opts) {
        var handler = $(me),
            ps = $.extend({ limitX: 1000, onMove: function(){}, onDrop: function(){} }, opts),
            dragndrop = {
                drag: function(e) {
                    var dragData = e.data.dragData,
                        targetX  =  dragData.left + (e.pageX - dragData.offLeft) + dragData.limitMin - dragData.hoverLeft ;
                    
                    dragData.onMove(Math.min(dragData.limitMax, Math.max(0, targetX) ) );
                },
                drop: function(e) {
                    var dragData = e.data.dragData;
                    dragData.onDrop(e);
                    $(document).unbind('mousemove', dragndrop.drag)
                               .unbind('mouseup', dragndrop.drop);
                }
            };        
 
        handler.bind('mousedown', { e: me }, function(s) {
            s.stopPropagation();

            var target = $(s.data.e);

            target.getCss = function (key) {
                var v = parseInt(this.css(key));
                if (isNaN(v))
                    return false;
                return v;
            } 
 

            var dragData = {
                left: target.getCss('left') || 0,
                top:target.getCss('left') || 0,
                hoverLeft: s.layerX || s.offsetX,
                hoverTop: s.layerY || s.offsetY,
                offLeft: target.offset().left ,
                offTop: target.offset().top ,
                onMove: ps.onMove,
                onDrop: ps.onDrop,                
                limitMin: (target.width() / 2 ),
                limitMax: ps.limitX  ,
                target: target
            }

            $(document).bind('mousemove', { dragData: dragData }, dragndrop.drag)
                       .bind('mouseup', { dragData: dragData }, dragndrop.drop);
        });
    }

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new BeforeAfterEffect( this, options ));
            }
        });
    }

})(jQuery, window, document);