/*
 *  Project: BeforeAfterEffect.js
 *  Description:
 *  Author: Eder Fortunato
 *  License: WTFPL
 */

;(function ( $, window, document, undefined ) {

    var pluginName = 'BeforeAfterEffect',
        defaults = {
             width:100,
             height:100,
             orientation:'H'
        };

    function BeforeAfterEffect( element, options ) {

        this.element = element;
        this.line    = null,
        this.divisor = null,
        this.newDiv  = null;

        this.options = $.extend( {}, defaults, options) ;
        this.options.orientation = this.options.orientation === 'H' ? this.options.orientation : 'V';

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
                _ori    = this.options.orientation,
                imgA    = _elem.find('img').eq(0),
                imgB    = _elem.find('img').eq(1),
                captionA=  $('<span class="capA"></span>'),
                captionB=  $('<span class="capB"></span>');

            this.line     = $('<div class="lineDivisor"></div>');
            this.divisor  = $('<div class="hoverDivisor'+_ori+'"></div>');
            this.newDiv   = $('<div></div>');

            _elem.addClass('BeforeAfterEffect')
                 .width(_w)
                 .height(_h)
                 .append(captionB)
                 .append(this.newDiv)
                 .append(this.line)
                 .append(this.divisor);

            this.newDiv.append(imgA)
                       .append(captionA);

            captionA.html(imgA.attr('alt'));

            captionB.html(imgB.attr('alt'));

            if(_ori == 'H'){
                this.line.height(_h);
            }else{
                this.line.width(_w);
                captionB.css('top', _h - (captionB.height() + parseInt(captionB.css('top').replace('px', ''), 10)));
            }

            _elem.bind('mousedown', function(e){
                _this.setPosition({
                        x: e.pageX - _elem.offset().left,
                        y: e.pageY - _elem.offset().top
                    },
                    true
                );
            });

            addDragDrop(this.divisor, {
                                        limitX: _w,
                                        limitY: _h,
                                        onMove: $.proxy(this, 'setPosition')
                                      });

            this.setPosition({y: _h / 2, x: _w / 2});

            // hack for IE
            this.divisor.attr('unselectable', 'on');
            // hack for chrome
            _elem.attr('onselectstart', 'return false;');

        },
        setPosition : function (p, isAnimate){
            var t = 500;

            if(this.options.orientation == 'H'){
                p.y = this.options.height / 2;
                p.xG = p.x;
                p.yG = p.y * 2;
            }else{
                p.x = this.options.width / 2;
                p.xG = p.x * 2;
                p.yG = p.y;
           }

            if(isAnimate){
                this.newDiv.stop().animate({ width: p.xG  , height: p.yG  }, t);
                this.divisor.stop().animate({ left: p.x - (this.divisor.width() / 2), top: p.y - (this.divisor.height() / 2) }, t);
                this.line.stop().animate({ left: p.x - (this.line.width() / 2) , top: p.y - (this.line.height() / 2) }, t);
            }else{
                this.newDiv.css({ width: p.xG  , height: p.yG });
                this.divisor.css({ left: p.x - (this.divisor.width() / 2), top: p.y - (this.divisor.height() / 2) });
                this.line.css({ left: p.x - (this.line.width() / 2) , top: p.y - (this.line.height() / 2) });
            }
        }
    };

    function addDragDrop (me, opts) {
        var handler = $(me),
            ps = $.extend({
                    limitX: 1000,
                    limitY: 1000,
                    onMove: function(){},
                    onDrop: function(){}
                },
                opts
            ),
            dragndrop = {
                drag: function(e) {
                    var dragData = e.data.dragData,
                        targetX  = dragData.left + (e.pageX - dragData.offLeft) + dragData.limitMinX - dragData.hoverLeft,
                        targetY  = dragData.top  + (e.pageY - dragData.offTop)  + dragData.limitMinY - dragData.hoverTop,
                        pTarget  = {
                            x: Math.min(dragData.limitMaxX, Math.max(0, targetX)),
                            y: Math.min(dragData.limitMaxY, Math.max(0, targetY))
                        };
                    dragData.onMove(pTarget);
                },
                drop: function(e) {
                    var dragData = e.data.dragData;
                    dragData.onDrop(e);
                    $(document).unbind('mousemove', dragndrop.drag)
                               .unbind('mouseup', dragndrop.drop);
                }
            };

        handler.bind('mousedown', function(s) {
            s.stopPropagation();

            var target = $(this);

            target.getCss = function (key) {
                var v = parseInt(this.css(key), 10);
                if (isNaN(v))
                    return false;
                return v;
            };

            var dragData = {
                left: target.getCss('left') || 0,
                top:target.getCss('top') || 0,
                hoverLeft: s.layerX || s.offsetX || s.pageX - target.offset().left,
                hoverTop: s.layerY || s.offsetY || s.pageY - target.offset().top,
                offLeft: target.offset().left ,
                offTop: target.offset().top ,
                onMove: ps.onMove,
                onDrop: ps.onDrop,
                limitMinX: (target.width() / 2 ),
                limitMinY: (target.height() / 2 ),
                limitMaxX: ps.limitX,
                limitMaxY: ps.limitY,
                target: target
            };

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
    };

})(jQuery, window, document);