/******************
Code by Vamoss
Original code link:
https://openprocessing.org/sketch/1462702

Author links:
http://vamoss.com.br
http://twitter.com/vamoss
http://github.com/vamoss
******************/

var circles = []

function setup() {
	var y = windowHeight * 0.5;
	var canvas = createCanvas(windowWidth, y);
	canvas.parent('sketch-holder');
	canvas.position(0, 0, 'relative');

    
}

function addCircle(x, y, life, followAngle){
	circles.push({
		pos: {x, y},
		prevPos: {x, y},
		dir: random() > 0.5 ? 1 : -1,
		radius: random(3, 10),
		angle: followAngle,
		followAngle,
		iniLife: life*0.6,
		life
	});
}

function draw() {	
	for(var i = circles.length-1; i >=0; i--){
		var circle = circles[i];
		
		if(abs(circle.angle-circle.followAngle) > 0.8){
			circle.dir *= -1;
			circle.angle = angleLerp(circle.angle, circle.followAngle, 0.1);
		}
		
		circle.angle += 1/circle.radius*circle.dir;
		circle.pos.x += cos(circle.angle) * circle.radius;
		circle.pos.y += sin(circle.angle) * circle.radius;
		
		if(circle.pos.x < 0 || circle.pos.x > width || circle.pos.y < 0 || circle.pos.y > height){
			circle.angle += PI;
		}
		
		strokeWeight(pow(circle.iniLife, 2)/30);
		stroke(color("#3B54A4"));
		line(circle.prevPos.x, circle.prevPos.y, circle.pos.x, circle.pos.y);

		circle.prevPos.x = circle.pos.x;
		circle.prevPos.y = circle.pos.y;
		
		circle.life--;
		if(circle.life<=0){
			if(circle.iniLife>5){
				addCircle(circle.pos.x, circle.pos.y, circle.iniLife*0.85, circle.followAngle+0.5);
				addCircle(circle.pos.x, circle.pos.y, circle.iniLife*0.85, circle.followAngle-0.5);
			}
			circles.splice(i, 1);
		}
	}
	          
	strokeWeight(5);
	ellipse(width/2, height/2, 100, 100);
}

function mousePressed(){
	var angle = atan2(mouseY - height / 2, mouseX - width / 2);
	addCircle(width/2, height/2, 10, angle);
}



//https://gist.github.com/shaunlebron/8832585
/*
2D Angle Interpolation (shortest distance)
Parameters:
a0 = start angle
a1 = end angle
t = interpolation factor (0.0=start, 1.0=end)
Benefits:
1. Angles do NOT need to be normalized.
2. Implementation is portable, regardless of how the modulo "%" operator outputs sign (i.e. Python, Ruby, Javascript)
3. Very easy to remember.
Thanks to Trey Wilson for the closed-form solution for shortAngleDist!
*/
function shortAngleDist(a0,a1) {
    var max = Math.PI*2;
    var da = (a1 - a0) % max;
    return 2*da % max - da;
}

function angleLerp(a0,a1,t) {
    return a0 + shortAngleDist(a0,a1)*t;
}