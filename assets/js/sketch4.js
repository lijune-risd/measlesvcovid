//helper
function CalculateAngle(x, y) {
	var tresult = {};

	if (x == 0 && y == 0) {
		tresult = { data: 0, flag: false };
	} else {
		tresult = { data: Math.atan(y / x), flag: true };
		if (x < 0) {
			tresult.data += Math.PI;
		}
	}

	return tresult;
}

//img
function ImageFind(imgid) {
	return document.querySelector("#img_" + imgid);
}

var canvas = document.querySelector("#canvas");
var ctx = canvas.getContext("2d");

var base_w, base_h, normal_w, normal_h;

//window resize
function windowResize() {
	base_w = window.innerWidth * window.devicePixelRatio;
	base_h = window.innerHeight * window.devicePixelRatio;

	var tcanvas = document.querySelectorAll(".canvas");
	for (var i = 0; i < tcanvas.length; i++) {
		tcanvas[i].style = "transform: scale(" + 1 / window.devicePixelRatio + ")";
		tcanvas[i].style.width = base_w + "px";
		tcanvas[i].style.height = base_h + "px";
		tcanvas[i].width = base_w;
		tcanvas[i].height = base_h;
	}

	normal_w = base_w / 100;
	normal_h = base_h / 100;
}
windowResize();

window.onresize = function () {
	windowResize();
};

var Game;

function GameRestart() {
	Game = { Score: 0, Unit: [], Deco: [] };
	GameScoreChange(0);
}
GameRestart();

function GameScoreChange(score) {
	Game.Score += score;
	var tobj = document.querySelector("#score");
    if (Game.Score < 67) {
        tobj.innerHTML = Game.Score;
    } else {
        score = 0;
        tobj.innerHTML = "Disease remains. 260K cases still remain";

    }
  }

function GameAddFly() {
	//state: stop 0 fly 0-1-2-1-0
	Game.Unit.push({
		type: "fly",
		x: Math.random() * 100,
		y: Math.random() * 100,
		vx: (Math.random() - 0.5) * 0.5,
		vy: (Math.random() - 0.5) * 0.5,
		vm: 2,
		angle: 0,
		amax: 0.1,
		size: Math.random() * 1.4 + 0.1,
		state: "stop",
		interval: 0,
		intervalmax: 2000
	});
}

GameAddFly();

function GameAddSwat(x, y) {
	var tsize = Math.random() * 1 + 0.5;
	Game.Deco.push({
		type: "pow",
		x: x,
		y: y,
		angle: Math.random() * Math.PI * 2,
		size: tsize,
		interval: 0,
		intervalmax: 5
	});

	//test fly die
	var tscore = 1;
	for (var i = 0; i < Game.Unit.length; i++) {
		var tobj = Game.Unit[i];
		if (tobj.state == "die") continue;
		if (
			(tobj.x - x) * (tobj.x - x) + (tobj.y - y) * (tobj.y - y) <
			(tobj.size + tsize) * (tobj.size + tsize) * 4
		) {
			tobj.state = "die";
			tscore++;
		}
	}
	GameScoreChange(tscore);
}
function GameFlyChange() {
	if (Game.Unit.length < 100) GameAddFly();

	for (var i = 0; i < Game.Unit.length; i++) {
		var tobj = Game.Unit[i];

		//clean fly
		if (tobj.state == "die") {
			tobj.interval++;
			if (tobj.interval > tobj.intervalmax) {
				Game.Unit.splice(i, 1);
				i--;
			}
			continue;
		}

		tobj.x += tobj.vx;
		tobj.y += tobj.vy;
		tobj.vx += tobj.amax * (Math.random() - 0.5);
		tobj.vy += tobj.amax * (Math.random() - 0.5);
		if (tobj.vx > tobj.vm) tobj.vx = tobj.vm;
		if (tobj.vx < -tobj.vm) tobj.vx = -tobj.vm;
		if (tobj.vy > tobj.vm) tobj.vy = tobj.vm;
		if (tobj.vy < -tobj.vm) tobj.vy = -tobj.vm;
		if (tobj.x < 0) {
			tobj.vx = Math.abs(tobj.vx);
			tobj.vx *= 0.5;
		}
		if (tobj.x > 100) {
			tobj.vx = -Math.abs(tobj.vx);
			tobj.vx *= 0.5;
		}
		if (tobj.y < 0) {
			tobj.vy = Math.abs(tobj.vy);
			tobj.vy *= 0.5;
		}
		if (tobj.y > (100 / base_w) * base_h) {
			tobj.vy = -Math.abs(tobj.vy);
			tobj.vy *= 0.5;
		}
		tobj.angle = CalculateAngle(tobj.vx, tobj.vy).data;
	}
}
function GameDecoChange() {
	for (var i = 0; i < Game.Deco.length; i++) {
		var tobj = Game.Deco[i];
		tobj.size *= 0.99;
		tobj.interval++;
		if (tobj.interval >= tobj.intervalmax) {
			Game.Deco.splice(i, 1);
			i--;
		}
	}
}

function Draw_Refresh() {
	function GameDraw() {
		ctx.clearRect(0, 0, base_w, base_h);
		var nowtime = Date.now();
		var nowtimek = Math.floor(nowtime / 10) % 3;
		for (var i = 0; i < Game.Unit.length; i++) {
			var tobj = Game.Unit[i];
			if (tobj.state != "die") continue;

			var tangle = tobj.angle;
			var tsize = tobj.size * normal_w * 10;

			var te = tobj.x * normal_w;
			var tf = tobj.y * normal_w;

			var tx = -tsize / 2;
			var ty = -tsize / 2;

			var ta = Math.cos(tangle);
			var tb = Math.sin(tangle);
			var tc = -Math.sin(tangle);
			var td = Math.cos(tangle);

			ctx.setTransform(ta, tb, tc, td, te, tf);

			if (tobj.state != "die") {
				ctx.drawImage(ImageFind(tobj.type + nowtimek), tx, ty, tsize, tsize);
			} else {
				ctx.globalAlpha = 1 - tobj.interval / tobj.intervalmax;
				ctx.drawImage(ImageFind(tobj.type + "die"), tx, ty, tsize, tsize);
				ctx.globalAlpha = 1;
			}
			ctx.setTransform(1, 0, 0, 1, 0, 0);
		}
		for (var i = 0; i < Game.Unit.length; i++) {
			var tobj = Game.Unit[i];
			if (tobj.state == "die") continue;

			var tangle = tobj.angle;
			var tsize = tobj.size * normal_w * 10;

			var te = tobj.x * normal_w;
			var tf = tobj.y * normal_w;

			var tx = -tsize / 2;
			var ty = -tsize / 2;

			var ta = Math.cos(tangle);
			var tb = Math.sin(tangle);
			var tc = -Math.sin(tangle);
			var td = Math.cos(tangle);

			ctx.setTransform(ta, tb, tc, td, te, tf);

			if (tobj.state != "die") {
				ctx.drawImage(ImageFind(tobj.type + nowtimek), tx, ty, tsize, tsize);
			} else {
				ctx.globalAlpha = 1 - tobj.interval / tobj.intervalmax;
				ctx.drawImage(ImageFind(tobj.type + "die"), tx, ty, tsize, tsize);
				ctx.globalAlpha = 1;
			}
			ctx.setTransform(1, 0, 0, 1, 0, 0);
		}
		for (var i = 0; i < Game.Deco.length; i++) {
			var tobj = Game.Deco[i];

			var tangle = tobj.angle;
			var tsize = tobj.size * normal_w * 10;

			var te = tobj.x * normal_w;
			var tf = tobj.y * normal_w;

			var tx = -tsize / 2;
			var ty = -tsize / 2;

			var ta = Math.cos(tangle);
			var tb = Math.sin(tangle);
			var tc = -Math.sin(tangle);
			var td = Math.cos(tangle);

			ctx.setTransform(ta, tb, tc, td, te, tf);

			ctx.drawImage(ImageFind(tobj.type), tx, ty, tsize, tsize);
			ctx.setTransform(1, 0, 0, 1, 0, 0);
		}
	}

	GameFlyChange();
	GameDecoChange();
	GameDraw();

	requestAnimationFrame(Draw_Refresh);
}
Draw_Refresh();

//User Control-->
canvas.onmousedown = function (e) {
	var x = e.x;
	var y = e.y;
	GameAddSwat(x / normal_w, y / normal_w);
};

//touch events
canvas.ontouchstart = function (e) {
	e.preventDefault();
	var x = e.touches[0].clientX * window.devicePixelRatio;
	var y = e.touches[0].clientY * window.devicePixelRatio;
	GameAddSwat(x / normal_w, y / normal_w);
};


const btnSec = document.querySelectorAll('.btn');
const modalSection = document.querySelector('.modal-section');
const overlay = document.querySelector('.overlay');
const closeSpan = document.querySelector('.modal-section span');

function showModalItem(show) {
	show.style.transform = 'scale(1)';
	show.style.opacity = '1';
}
function hideModalItem(hide) {
	hide.style.transform = 'scale(0)';
	hide.style.opacity = '0';
}
for (let i = 0; i < btnSec.length; i++) {
	btnSec[i].addEventListener('click', function () {
		showModalItem(modalSection);
		showModalItem(overlay);
	});
}
closeSpan.addEventListener('click', function () {
	hideModalItem(modalSection);
	hideModalItem(overlay);
});
overlay.addEventListener('click', function () {
	hideModalItem(modalSection);
	hideModalItem(overlay);
});
