;(function(){

	function extend(a,b){
		for(var i in b){
			if(b.hasOwnProperty(i)){
				a[i] = b[i];
			}
		}
		return a;
	}

	var Slider = function(el, config){
		this.el = el;
		this.config = extend( {}, this.defConfig );
  		extend( this.config, config );
		this.index = 0;
		this.timer = null;
		this.inter = null;
		this.w = el.offsetWidth;
		this.createDom();
		this.tabs = el.querySelector(".bd ul");
		this.len = this.tabs.children.length;
		this.btns = el.querySelector(".hd ul");
		//移动端事件
		var isTouchPad = (/hp-tablet/gi).test(navigator.appVersion);
		var hasTouch = this.hasTouch = 'ontouchstart' in window && !isTouchPad;
		this.touchStart = hasTouch ? 'touchstart' : 'mousedown';
		this.touchMove = hasTouch ? 'touchmove' : '';
		this.touchEnd = hasTouch ? 'touchend' : 'mouseup';
		this.sY = null;
		this.distX = 0;
		this.startX = this.startY = this.dist = 0;
		this.init();
	}

	Slider.prototype = {
		defConfig: {
			// 需要切换的dom结构
			tabs: '.bd ul',
			// 小圆点 切换的结构
			btns: '.hd ul',
			// 切换方式（目前只支持 左）
			effect: 'left',
			// 是否切换小圆点
			autoPage: true,
			// 是否自动播放
			autoPlay: true,
			//切换效果的速度
			delayTime: 1000,
			//每一次切换的时间间隔
			interTime: 2500,
			// 小圆点的样式
			currClass: 'on',
			// 鼠标拖动单张slider，需要到什么位置切换
			// 计算方式为 单张的宽度/distance  2为一半
			distance: 2,
			//图片链接
			imgUrl: [
				"img/1.jpg",
				"img/2.jpg",
				"img/3.jpg",
				"img/4.jpg"
			],
			title:[
				"A",
				"B",
				"C",
				"D"
			]
		},
		createDom: function(){
			var _Html = "",
				imgUrl = this.defConfig.imgUrl,
				title = this.defConfig.title;
			_Html = "<div class=\"bd\"><ul>";
			for (var i = 0; i < imgUrl.length; i++){
				_Html += "<li><a class=\"pic\" href=\"javascript:void(0)\"><img src="+imgUrl[i]+" /></a>";
				if(title && title[i]){
					_Html += "<a class=\"tit\" href=\"javascript:void(0)\">"+title[i]+"</a>"
				}
				_Html += "</li>";
			}
			_Html += "</ul></div><div class=\"hd\"><ul></ul></div>";
			this.el.innerHTML = _Html;
		},
		// 添加类名
		addClass: function(obj, sClass){
			var aClass = obj.className.split(' ');

			if(!aClass[0]){
				obj.className = sClass;
				return;
			}

			for (var i = 0; i < aClass.length; i++) {
				if(aClass[i] == sClass){
					return;
				}
			}

			obj.className += ' '+ sClass;
		},

		// 删除类名
		removeClass: function(obj, sClass){
			var aClass = obj.className.split(' ');

			if(!aClass[0])return;

			for (var i = 0; i < aClass.length; i++) {
				if(aClass[i] == sClass){
					aClass.splice(i, 1);
					obj.className = aClass.join(' ');
					return;
				}
			}

		},

		// 是否含有类名
		hasClass: function(obj, sClass){
			var aClass = obj.className.split(' ');

			if(!aClass[0])return false;

			for (var i = 0; i < aClass.length; i++) {
				if(aClass[i] == sClass)return true;
			}

			return false;
		},

		//兄弟节点
		siblings: function(elem){
			var obj = [];//定义一个数组，用来存elem的兄弟元素 
			var p = elem.previousSibling; 
			while(p){//先取elem的哥哥们 判断有没有上一个哥哥元素，如果有则往下执行 p表示previousSibling 
				if(p.nodeType===1){ 
					obj.push(p); 
				} 
				p = p.previousSibling//最后把上一个节点赋给p 
			} 
			obj.reverse()//把顺序反转一下 这样元素的顺序就是按先后的了 
			var n = elem.nextSibling;//再取elem的弟弟 
			while(n){//判断有没有下一个弟弟结点 n是nextSibling的意思 
				if(n.nodeType===1){ 
					obj.push(n); 
				} 
				n = n.nextSibling; 
			} 
			return obj;//最后按从老大到老小的顺序，把这一组元素返回 
	    },

		init: function(){
			var that = this,
				tabsNode = that.tabs,
				config = that.config

			var navArr = []
			if(config.autoPage){
				that.btns.innerHTML = "";
				for(var i = 0; i < that.len; i++){
					navArr.push("<li>"+(i+1)+"</li>");
				}
				that.btns.innerHTML = navArr.join('');
				that.btns = that.el.querySelectorAll(".hd ul li");
			}

			var tempSize = that.len;

			// 循环播放 复制前一个后一个
			if(config.effect == 'left'){
				tempSize += 2;

				var children = that.el.querySelectorAll(".bd ul li"),
					childrenLen = children.length,
					first = children[0],
					last = children[childrenLen-1];

				for(var i =0; i < childrenLen; i ++){
					children[i].style.width = that.w + "px";
				}

				tabsNode.appendChild(first.cloneNode(true));
				tabsNode.insertBefore(last.cloneNode(true),first);//父.insertBefore(new,old)
			}
			tabsNode.style.width = tempSize * that.w + "px";
			tabsNode.style.position = "relative";
			tabsNode.style.overflow = "hidden";

			that.el.querySelector(".bd").innerHTML = "<div class=\"slider-wrap\" style=\"overflow:hidden; position:relative;\">" + that.el.querySelector(".bd").innerHTML + "</div>";
			//tabsNode.wrap('<div class="slider-wrap" style="overflow:hidden; position:relative;"></div>');

			//MARK innerHTML导致tabsNode已经无效了，需要重新赋值
			that.tabs = that.el.querySelector(".bd ul");

			that.play();

			if(config.autoPlay){
				that.inter = setInterval(function(){
					that.index++;
					that.play();
				}, config.interTime);
			}

			that.bind();


		},

		play: function(){
			var that = this,
				config = that.config,
				currClass = config.currClass,
				w = that.w,
				len = that.len,
				delayTime = config.delayTime

			that.translate(-(that.index+1) * w, delayTime);

			if(that.index == -1){
				that.timer = setTimeout(function(){
					that.translate(-len * w, 0);
					that.index = len - 1;
				},delayTime);
			}else if(that.index == len){
				that.timer = setTimeout(function(){
					that.translate(-w, 0);
					that.index = 0
				},delayTime);
			}

			var n = that.index;
			// 修正最后一个等于length的数
			n = n == len ? 0 : n;

			that.addClass(that.btns[n],currClass);
			var sArray = that.siblings(that.btns[n]);
			for(var i = 0; i < sArray.length; i++){
				that.removeClass(sArray[i],currClass);
			}
		},

		translate: function(dist, speed){
			var el = this.tabs.style;
			el.webkitTransitionDuration = speed + 'ms';
			el.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
		},

		bind: function(){
			var that = this,
				tabsNode = that.tabs;
			var touchEvent = {
				TStart: function(ev){
					clearTimeout(that.timer);

					that.sY = void 0;
					that.distX = 0;
					//获得屏幕上第一个touch
					var point = that.hasTouch ? ev.touches[0] : ev;

					that.startX = point.pageX;
					that.startY = point.pageY;

					// move 事件
					tabsNode.addEventListener(that.touchMove, touchEvent.TMove)
					// end 事件
					tabsNode.addEventListener(that.touchEnd, touchEvent.TEnd)
				},

				TMove: function(ev){
					// 多点或者缩放
					if(that.hasTouch){
						if(ev.touches.length > 1 || ev.scale && ev.scale !==1) return;
					}

					var point = that.hasTouch ? ev.touches[0] : ev;

					that.distX = point.pageX - that.startX;
					that.distY = point.pageY - that.startY;

					that.sY = that.sY || Math.abs(that.distX) < Math.abs(that.distY);

					if(!that.sY){
						ev.preventDefault()
						if(that.config.autoPlay) clearInterval(that.inter);

						that.translate(-(that.index+1)*that.w + that.distX, 0);
					}

				},
				TEnd: function(ev){
					if(!that.distX) return
					ev.preventDefault();

					if(!that.sY){
						if(Math.abs(that.distX) > that.w/that.config.distance){
							that.distX > 0 ? that.index-- : that.index++;
						}

						that.play();

						if(that.config.autoPlay){
							that.inter = setInterval(function(){
								that.index++;
								that.play();
							}, that.config.interTime);
						}

					}

					tabsNode.removeEventListener(that.touchMove, touchEvent.TMove);
					tabsNode.removeEventListener(that.touchEnd, touchEvent.TEnd);
				}
			}

			tabsNode.addEventListener(that.touchStart, touchEvent.TStart)
		}
	}
	window.Slider = Slider;
})();

