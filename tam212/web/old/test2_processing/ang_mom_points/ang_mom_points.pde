float framerate = 30;
int w = 250;
int h = 250;
float length = w / 2.0;
float ox = length;
float oy = length;
float len = 40;

void setup() {
  size(w, h);
  frameRate(framerate);
  noLoop();
}

void draw() {
  background(#ffffff);
  
  float t = (2 * frameCount / framerate) % (4 * PI);
  float d = sin(t);
  float v = cos(t);
  float x, y, vx, vy;
  if (t < PI / 2) {
    x = -1;
    y = d;
    vx = 0;
    vy = v;
  } else if (t < 3 * PI / 2) {
    x = -d;
    y = 1;
    vx = -v;
    vy = 0;
  } else if (t < 5 * PI / 2) {
    x = 1;
    y = -d;
    vx = 0;
    vy = -v;
  } else if (t < 7 * PI / 2) {
    x = d;
    y = -1;
    vx = v;
    vy = 0;
  } else {
    x = -1;
    y = d;
    vx = 0;
    vy = v;
  }
  
  strokeWeight(2);
  stroke(#000000);
  fill(#000000);
  float px = x * len + ox;
  float py = y * len + oy;
  ellipse(px, py, 10, 10);

  ang_mom(x, y, vx, vy, "i", 2, 2);
  ang_mom(x, y, vx, vy, "h", 0, 2);
  ang_mom(x, y, vx, vy, "g", -2, 2);
  ang_mom(x, y, vx, vy, "f", 2, 0);
  ang_mom(x, y, vx, vy, "e", 0, 0);
  ang_mom(x, y, vx, vy, "d", -2, 0);
  ang_mom(x, y, vx, vy, "c", 2, -2);
  ang_mom(x, y, vx, vy, "b", 0, -2);
  ang_mom(x, y, vx, vy, "a", -2, -2);
}

void ang_mom(float x, float y, float vx, float vy, String n, float cx, float cy) {
  float h = - ((x - cx) * vy - (y - cy) * vx);
  float px = cx * len + ox;
  float py = cy * len + oy;
  stroke(#f00000);
  noFill();
  strokeWeight(abs(5 * h));
  circle_arrow(px, py, abs(h * 10), PI / 2, h);
  strokeWeight(1);
  fill(#000000);
  stroke(#000000);
  ellipse(px, py, 2, 2);
  textAlign(CENTER, BOTTOM);
  text(n, px, py - 5);
}

void circle_arrow(float x, float y, float r, float angle, float delta_angle) {
  float a0;
  float a1;
  if (delta_angle > 0) {
    a0 = angle - delta_angle;
    a1 = angle + delta_angle;
    arc(x, y, 2 * r, 2 * r, a0, a1);
    arrow_head(x + r * cos(a0), y + r * sin(a0), cos(a0) - cos(a0 + PI / 6), sin(a0) - sin(a0 + PI / 6), r);
  } else {
    a0 = angle + delta_angle;
    a1 = angle - delta_angle;
    arc(x, y, 2 * r, 2 * r, a0, a1);
    arrow_head(x + r * cos(a1), y + r * sin(a1), cos(a1) - cos(a1 - PI / 6), sin(a1) - sin(a1 - PI / 6), r);
  }
}

void arrow_head(float x, float y, float dx, float dy, float s) {
  float alpha = PI / 6;
  float ndx = dx / sqrt(dx*dx + dy*dy);
  float ndy = dy / sqrt(dx*dx + dy*dy);
  beginShape();
  vertex(x - s * cos(alpha) * ndx - s * sin(alpha) * ndy, y - s * cos(alpha) * ndy + s * sin(alpha) * ndx);
  vertex(x, y);
  vertex(x - s * cos(alpha) * ndx + s * sin(alpha) * ndy, y - s * cos(alpha) * ndy - s * sin(alpha) * ndx);
  endShape();
}

