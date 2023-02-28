/**
 * Ultimate Video Player PACKAGED v8.4
 * Video screen.
 *
 * @author Tibi - FWDesign [https://webdesign-flash.ro/]
 * Copyright © 2006 All Rights Reserved.
 */
(function(window){
	
	var FWDUVPVideoScreen = function(prt, volume){
		
		'use strict';

		var _s = this;
		var prototype = FWDUVPVideoScreen.prototype;
	
		_s.controllerHeight = prt._d.controllerHeight;
		_s.sW = 0;
		_s.sH = 0;
		_s.lastPercentPlayed = 0;
		_s.volume = volume;
		_s.curDuration = 0;
		_s.countNormalMp3Errors = 0;
		_s.countShoutCastErrors = 0;
		_s.maxShoutCastCountErrors = 5;
		_s.maxNormalCountErrors = 1;
		_s.hasError_bl = true;
		_s.isStopped_bl = true;
		_s.isMbl = FWDUVPUtils.isMobile;
		

		//###############################################//
		/* init */
		//###############################################//
		_s.init = function(){
			_s.setBkColor(prt.videoBackgroundColor_str);
			_s.setupVideo();
		};
	

		//###############################################//
		/* Setup audio element */
		//##############################################//
		_s.setupVideo = function(){
			if(_s.video_el == null){
				_s.video_el = document.createElement("video");
				_s.video_el.controls = false;
				_s.video_el.volume = _s.volume;
				if(prt._d.playsinline){
					_s.video_el.WebKitPlaysInline = true;
					_s.video_el.playsinline = true;
					_s.video_el.setAttribute("playsinline", "");
					_s.video_el.setAttribute("webkit-playsinline", "");
				}

				if(prt.fillEntireVideoScreen_bl){
					_s.video_el.style.objectFit = 'cover';
				}
				
				if(prt._d.autoPlay_bl){
					_s.video_el.muted = true;
				}
				
				_s.video_el.style.position = "relative";
				_s.video_el.style.left = "0px";
				_s.video_el.style.top = "0px";
				_s.video_el.style.width = "100%";
				_s.video_el.style.height = "100%";
				_s.video_el.style.margin = "0px";
				_s.video_el.style.padding = "0px";
				_s.video_el.style.maxWidth = "none";
				_s.video_el.style.maxHeight = "none";
				_s.video_el.style.border = "none";
				_s.video_el.style.lineHeight = "0";
				_s.video_el.style.msTouchAction = "none";
			
				_s.screen.appendChild(_s.video_el);
			}

			_s.video_el.addEventListener("error", _s.errorHandler);
			_s.video_el.addEventListener("progress", _s.updateProgress);
			_s.video_el.addEventListener("timeupdate", _s.updateVideo);
			_s.video_el.addEventListener("pause", _s.pauseHandler);
			_s.video_el.addEventListener("play", _s.playHandler);
			if(!FWDUVPUtils.isIE){
				_s.video_el.addEventListener("waiting", _s.startToBuffer);
			}
			_s.video_el.addEventListener("playing", _s.stopToBuffer);
			_s.video_el.addEventListener("canplaythrough", _s.stopToBuffer);
			_s.video_el.addEventListener("ended", _s.endedHandler);
			_s.resizeAndPosition();
		};	
		
		
		_s.destroyVideo = function(){
			clearTimeout(_s.showErrorWithDelayId_to);
			if(_s.video_el){
				_s.stopToUpdateSubtitles();
				_s.video_el.removeEventListener("error", _s.errorHandler);
				_s.video_el.removeEventListener("progress", _s.updateProgress);
				_s.video_el.removeEventListener("timeupdate", _s.updateVideo);
				_s.video_el.removeEventListener("pause", _s.pauseHandler);
				_s.video_el.removeEventListener("play", _s.playHandler);
				if(!FWDUVPUtils.isIE){
					_s.video_el.removeEventListener("waiting", _s.startToBuffer);
				}
				_s.video_el.removeEventListener("playing", _s.stopToBuffer);
				_s.video_el.removeEventListener("canplaythrough", _s.stopToBuffer);
				_s.video_el.removeEventListener("ended", _s.endedHandler);

				_s.video_el.style.visibility = "hidden";
				_s.video_el.src = "";
				_s.video_el.load();
			}
		};
		
		_s.startToBuffer = function(overwrite){
			_s.dispatchEvent(FWDUVPVideoScreen.START_TO_BUFFER);
		};
		
		_s.stopToBuffer = function(){
			_s.dispatchEvent(FWDUVPVideoScreen.STOP_TO_BUFFER);
		};
		

		//##########################################//
		/* Video error handler. */
		//##########################################//
		_s.errorHandler = function(e){
			if(prt.videoType_str == 'DASH') return;
			var error_str;
			_s.hasError_bl = true;
			
			if(_s.video_el.networkState == 0){
				error_str = "error '_s.video_el.networkState = 0'";
			}else if(_s.video_el.networkState == 1){
				error_str = "error '_s.video_el.networkState = 1'";
			}else if(_s.video_el.networkState == 3){
				error_str = "source not found";
			}else{
				error_str = e;
			}
			
			if(window.console) window.console.log(_s.video_el.networkState);
			
			clearTimeout(_s.showErrorWithDelayId_to);
			_s.showErrorWithDelayId_to = setTimeout(function(){
					_s.dispatchEvent(FWDUVPVideoScreen.ERROR, {text:error_str });
			}, 200);
		};
		

		//##############################################//
		/* Resize and position */
		//##############################################//
		_s.resizeAndPosition = function(width, height, newX, newY){
			if(width){
				_s.sW = width;
				_s.sH = height;
			}
		
			_s.setWidth(_s.sW);
			_s.setHeight(_s.sH);		
			_s.setX(newX);
			_s.setY(newY);
			
			if(prt.is360 && _s.renderer){
				_s.camera.aspect = _s.sW / _s.sH;
				_s.camera.updateProjectionMatrix();
				_s.renderer.setSize(_s.sW, _s.sH);
			}
		};
	

		//##############################################//
		/* Set path */
		//##############################################//
		_s.setSource = function(sourcePath){
			_s.stopToUpdateSubtitles();
			_s.sourcePath_str = sourcePath;
			if(prt.is360 && _s.video_el){
				_s.video_el.style.visibility = "hidden";
			}
		
			if(_s.video_el) _s.stop();
			_s.initVideo();
		};
	

		//##########################################//
		/* Play / pause / stop methods */
		//##########################################//
		_s.play = function(overwrite){
			
			var prm;

			clearTimeout(_s.playWithDelayId_to);
			FWDUVPlayer.curInstance = prt;

			if(_s.isStopped_bl){
				_s.initVideo();
				_s.setVolume();
				if(_s.isMbl){
					_s.play();
				}else{
					_s.playWithDelayId_to = setTimeout(_s.play, 1000);
				}	
				_s.hasStrtLivStrm = true;
				_s.startToBuffer(true);
				_s.isPlaying_bl = true;
			}else if(!_s.video_el.ended || overwrite){
				try{
					_s.hasStrtLivStrm = true;
					_s.isPlaying_bl = true;
					_s.hasPlayedOnce_bl = true;
					prm = _s.video_el.play();
					if(prm !== undefined) {
					    prm.then(function(){}, function(){});
					}
					if(FWDUVPUtils.isIE) _s.dispatchEvent(FWDUVPVideoScreen.PLAY);
				}catch(e){
					
				};
			}
			if(prt.is360) _s.add360Vid();
		};
		
		_s.initVideo = function(){
			
			_s.setupVideo();
			_s.setVolume();
			_s.isPlaying_bl = false;
			_s.hasError_bl = false;
			_s.allowScrubing_bl = false;
			_s.isStopped_bl = false;
			
			if(_s.video_el.src != _s.sourcePath_str){
				_s.video_el.src = _s.sourcePath_str;
			}
		}

		_s.pause = function(){
			if(_s == null || _s.isStopped_bl || _s.hasError_bl) return;
			if(!_s.video_el.ended){
				try{
					_s.video_el.pause();
					_s.isPlaying_bl = false;
					if(FWDUVPUtils.isIE) _s.dispatchEvent(FWDUVPVideoScreen.PAUSE);
				}catch(e){};
			}
		};
		
		_s.togglePlayPause = function(){
			if(_s == null) return;
			if(!_s.isSafeToBeControlled_bl) return;
			if(_s.isPlaying_bl){
				_s.pause();
			}else{
				_s.play();
			}
		};
		
		_s.resume = function(){
			if(_s.isStopped_bl) return;
			_s.play();
		};
		
		_s.pauseHandler = function(){
			if(_s.allowScrubing_bl) return;
			_s.dispatchEvent(FWDUVPVideoScreen.PAUSE);
		};
		
		_s.playHandler = function(){
			if(_s.allowScrubing_bl) return;

			if(!_s.isStartEventDispatched_bl){
				_s.dispatchEvent(FWDUVPVideoScreen.START);
				_s.isStartEventDispatched_bl = true;
			}
			if(prt.is360) _s.start360Render();
			_s.startToUpdateSubtitles();
			_s.stopToBuffer();
			_s.dispatchEvent(FWDUVPVideoScreen.PLAY);
		};
		
		_s.endedHandler = function(){

			_s.stopToUpdateSubtitles();
			_s.dispatchEvent(FWDUVPVideoScreen.PLAY_COMPLETE);
		};
		
		_s.stop = function(overwrite){
			if((_s == null || _s.video_el == null || _s.isStopped_bl) && !overwrite) return;
			clearTimeout(_s.sizeId_to);
			_s.isPlaying_bl = false;
			_s.isStopped_bl = true;
			_s.hasPlayedOnce_bl = true;
			_s.hasStrtLivStrm = false;
			_s.isSafeToBeControlled_bl = false;
			_s.isStartEventDispatched_bl = false;
			_s.stopToUpdateSubtitles();
			clearTimeout(_s.playWithDelayId_to);
			_s.stop360Render();
			_s.destroyVideo();
			_s.dispatchEvent(FWDUVPVideoScreen.LOAD_PROGRESS, {percent:0});
			_s.dispatchEvent(FWDUVPVideoScreen.UPDATE_TIME, {curTime:"00:00" , totalTime:"00:00"});
			_s.dispatchEvent(FWDUVPVideoScreen.STOP);
			_s.stopToBuffer();
		};


		//###########################################//
		/* Check if audio is safe to be controlled */
		//###########################################//
		_s.safeToBeControlled = function(){

			if((prt.videoType_str == FWDUVPlayer.HLS_JS || prt.videoType_str == FWDUVPlayer.DASH) && !_s.hasStrtLivStrm) return;
			
			if(!_s.isSafeToBeControlled_bl){
				_s.stopToScrub();
				_s.resizeAndPosition();
				_s.hasHours_bl = Math.floor(_s.video_el.duration / (60 * 60)) > 0;
				_s.isPlaying_bl = true;
				_s.isSafeToBeControlled_bl = true;
				if(!prt.is360) _s.video_el.style.visibility = "visible";
				setTimeout(function(){
					if(_s.renderer) _s.renderer.domElement.style.left = "0px";
				},1000);
				if(prt.fillEntireVideoScreen_bl){
					_s.sizeId_to = setTimeout(function(){
					_s.dispatchEvent(FWDUVPVideoScreen.SAFE_TO_SCRUBB);
					}, 500);
				}else{
					_s.dispatchEvent(FWDUVPVideoScreen.SAFE_TO_SCRUBB);
				}
			}
		};
	
		//###########################################//
		/* Update progress */
		//##########################################//
		_s.updateProgress = function(){
			if(prt.videoType_str == FWDUVPlayer.HLS_JS && !_s.hasStrtLivStrm) return;
			var buffered;
			var percentLoaded = 0;
			
			if(_s.video_el.buffered.length > 0){
				buffered = _s.video_el.buffered.end(_s.video_el.buffered.length - 1);
				percentLoaded = buffered.toFixed(1)/_s.video_el.duration.toFixed(1);
				if(isNaN(percentLoaded) || !percentLoaded) percentLoaded = 0;
			}
			
			if(percentLoaded == 1) _s.video_el.removeEventListener("progress", _s.updateProgress);
			
			_s.dispatchEvent(FWDUVPVideoScreen.LOAD_PROGRESS, {percent:percentLoaded});
		};
		

		//##############################################//
		/* Update audio */
		//#############################################//
		_s.updateVideo = function(){

			var percentPlayed; 
			if (!_s.allowScrubing_bl) {
				percentPlayed = _s.video_el.currentTime /_s.video_el.duration;
				_s.dispatchEvent(FWDUVPVideoScreen.UPDATE, {percent:percentPlayed});
			}
			
			var totalTime = FWDUVPUtils.formatTime(_s.video_el.duration);
			var curTime = FWDUVPUtils.formatTime(_s.video_el.currentTime);
			if(_s.video_el.currentTime) _s.safeToBeControlled();

			if(!isNaN(_s.video_el.duration) && (prt.videoType_str == FWDUVPlayer.VIDEO || prt.videoType_str == FWDUVPlayer.HLS_JS || prt.videoType_str == FWDUVPlayer.DASH)){
				_s.dispatchEvent(FWDUVPVideoScreen.UPDATE_TIME, {curTime: curTime, totalTime:totalTime, seconds:_s.video_el.currentTime, totalTimeInSeconds:_s.video_el.duration});
			}else{
				_s.dispatchEvent(FWDUVPVideoScreen.UPDATE_TIME, {curTime:"00:00" , totalTime:"00:00", seconds:0, totalTimeInSeconds:0});
			}
		
			_s.lastPercentPlayed = percentPlayed;
			_s.curDuration = curTime;
		};
		

		//###############################################//
		/* Scrub */
		//###############################################//
		_s.startToScrub = function(){
			_s.allowScrubing_bl = true;
		};
		
		_s.stopToScrub = function(){
			_s.allowScrubing_bl = false;
		};
		
		_s.scrubbAtTime = function(duration){
			_s.video_el.currentTime = duration;
			var totalTime = FWDUVPUtils.formatTime(_s.video_el.duration);
			var curTime = FWDUVPUtils.formatTime(_s.video_el.currentTime);
			_s.dispatchEvent(FWDUVPVideoScreen.UPDATE_TIME, {curTime: curTime, totalTime:totalTime});
		}
		
		_s.scrub = function(percent, e){
			if(e) _s.startToScrub();
			try{
				_s.video_el.currentTime = _s.video_el.duration * percent;
				var totalTime = FWDUVPUtils.formatTime(_s.video_el.duration);
				var curTime = FWDUVPUtils.formatTime(_s.video_el.currentTime);
				_s.dispatchEvent(FWDUVPVideoScreen.UPDATE_TIME, {curTime: curTime, totalTime:totalTime});
			}catch(e){}
		};
		

		//###############################################//
		/* replay */
		//###############################################//
		_s.replay = function(){
			_s.scrub(0);
			_s.play();
		};
		

		//###############################################//
		/* Volume */
		//###############################################//
		_s.setVolume = function(vol){
			if(vol != undefined) _s.volume = vol;
			if(_s.video_el){
				_s.video_el.volume = _s.volume;
				if(vol) _s.video_el.muted = false;
			}
		};
		
		_s.setPlaybackRate = function(rate){
			if(!_s.video_el) return;
			_s.video_el.defaultPlaybackRate = rate;
			_s.video_el.playbackRate = rate;
		}
		

		//###############################################//
		/* Setup 360 vid */
		//###############################################//
		_s.add360Vid = function(){
			
			if(_s.renderer){
				_s.screen.appendChild(_s.renderer.domElement);
				return;
			}
			if(window['THREE'] == undefined) return;

			_s.renderer = new THREE.WebGLRenderer({ antialias: true });
			_s.renderer.setSize(_s.sW, _s.sH);
			_s.renderer.domElement.style.position = "absolute";
			_s.renderer.domElement.style.left = "0px";
			_s.renderer.domElement.style.top = "0px";
			_s.renderer.domElement.style.margin = "0px";
			_s.renderer.domElement.style.padding = "0px";
			_s.renderer.domElement.style.maxWidth = "none";
			_s.renderer.domElement.style.maxHeight = "none";
			_s.renderer.domElement.style.border = "none";
			_s.renderer.domElement.style.lineHeight = "1";
			_s.renderer.domElement.style.backgroundColor = "transparent";
			_s.renderer.domElement.style.backfaceVisibility = "hidden";
			_s.renderer.domElement.style.webkitBackfaceVisibility = "hidden";
			_s.renderer.domElement.style.MozBackfaceVisibility = "hidden";	
			_s.renderer.domElement.style.MozImageRendering = "optimizeSpeed";	
			_s.renderer.domElement.style.WebkitImageRendering = "optimizeSpeed";
			_s.screen.appendChild(_s.renderer.domElement);
			
			_s.scene = new THREE.Scene();
			
			_s.video_el.setAttribute('crossorigin', 'anonymous');
			
			_s.canvas = document.createElement('canvas');
			_s.context = _s.canvas.getContext('2d');
			
			if(FWDUVPUtils.isFirefox){
				_s.videoTexture = new THREE.Texture(_s.video_el);
			}else{
				_s.videoTexture = new THREE.Texture(_s.canvas);
			}
			
			_s.videoTexture.minFilter = THREE.LinearFilter;
			_s.videoTexture.magFilter = THREE.LinearFilter;
			_s.videoTexture.format = THREE.RGBFormat;

			_s.cubeGeometry = new THREE.SphereGeometry(500, 60, 40);
			_s.sphereMat = new THREE.MeshBasicMaterial({map: _s.videoTexture});
			_s.sphereMat.side = THREE.BackSide;
			_s.cube = new THREE.Mesh(_s.cubeGeometry, _s.sphereMat);
			_s.scene.add(_s.cube);

			_s.camera = new THREE.PerspectiveCamera(45, _s.sW / _s.sH, 0.1, 10000);
			_s.camera.position.y = 0;
			_s.camera.position.z = 500;
			_s.camera.position.x = 0;

			_s.scene.add(_s.camera);
			
			_s.controls = new THREE.OrbitControls(_s.camera, prt.dClk_do.screen);
			_s.controls.enableDamping = true;
			_s.controls.enableZoom = false; 
			_s.controls.dampingFactor = 0.25;
			_s.controls.maxDistance = 500;
			_s.controls.minDistance = 500;
			_s.controls.rotateLeft(90 * Math.PI/180);
			
			_s.controls.enabled=true;
			_s.render();
			setTimeout(function(){
				prt.preloader_do.hide(true);
			 }, 1000);
		}
		
		_s.start360Render = function(){
			_s.is360Rendering_bl = true;
			cancelAnimationFrame(_s.requestId);
			_s.requestId = requestAnimationFrame(_s.render);
		}
		
		_s.stop360Render = function(){
			_s.is360Rendering_bl = false;
			if(!_s.camera) return;
			_s.camera.position.y = 0;
			_s.camera.position.z = 500;
			_s.camera.position.x = 0;
			_s.renderer.domElement.style.left = "-10000px";
			cancelAnimationFrame(_s.requestId);
			try{
				_s.screen.removeChild(_s.renderer.domElement);
			}catch(e){};
		}
		
		_s.render = function(){
			if(!_s.is360Rendering_bl || !_s.camera || !prt.is360){
				cancelAnimationFrame(_s.requestId);
				return;
			}
			
			if( _s.video_el.readyState === _s.video_el.HAVE_ENOUGH_DATA ){
				_s.videoTexture.needsUpdate = true;
			}
			
			if(!FWDUVPUtils.isFirefox && _s.context && !_s.isStopped_bl){
				if(_s.video_el.videoWidth != 0){
					_s.canvas.width = _s.video_el.videoWidth;
					_s.canvas.height = _s.video_el.videoHeight;
				}
				_s.context.save();
				_s.context.scale(-1,1);
				_s.context.drawImage(_s.video_el, 0,0,_s.canvas.width * -1,_s.canvas.height);
				_s.context.restore();
			}
			
			_s.controls.update();
			_s.renderer.render(_s.scene, _s.camera);
			_s.requestId = requestAnimationFrame(_s.render);
		}
		

		//##################################################//
		/* Subtitles */
		//##################################################//
		_s.stopToUpdateSubtitles = function(){
			clearInterval(_s.startToUpdateSubtitleId_int);	
		}
		
		_s.startToUpdateSubtitles = function(){
			clearInterval(_s.startToUpdateSubtitleId_int);
			_s.startToUpdateSubtitleId_int = setInterval(_s.updateSubtitleHandler, 10);
		}
		
		_s.updateSubtitleHandler = function(){
			_s.dispatchEvent(FWDUVPVideoScreen.UPDATE_SUBTITLE, {curTime:_s.video_el.currentTime});
		}
	
		_s.init();
	};


	/* set prototype */
	FWDUVPVideoScreen.setPrototype = function(){
		FWDUVPVideoScreen.prototype = new FWDUVPDisplayObject("div");
	};
	
	FWDUVPVideoScreen.UPDATE_SUBTITLE = "updateSubtitle";
	FWDUVPVideoScreen.ERROR = "error";
	FWDUVPVideoScreen.UPDATE = "update";
	FWDUVPVideoScreen.UPDATE_TIME = "updateTime";
	FWDUVPVideoScreen.SAFE_TO_SCRUBB = "safeToControll";
	FWDUVPVideoScreen.LOAD_PROGRESS = "loadProgress";
	FWDUVPVideoScreen.START = "start";
	FWDUVPVideoScreen.PLAY = "play";
	FWDUVPVideoScreen.PAUSE = "pause";
	FWDUVPVideoScreen.STOP = "stop";
	FWDUVPVideoScreen.PLAY_COMPLETE = "playComplete";
	FWDUVPVideoScreen.START_TO_BUFFER = "startToBuffer";
	FWDUVPVideoScreen.STOP_TO_BUFFER = "stopToBuffer";


	window.FWDUVPVideoScreen = FWDUVPVideoScreen;

}(window));