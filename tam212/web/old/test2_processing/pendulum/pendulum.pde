float framerate = 30;
int w = 200;
int h = 200;
float length = w / 2.0;
float ox = length;
float oy = 50;

void setup() {
  size(w, h);
  frameRate(framerate);
  noLoop();
}

void draw() {
  background(#ffffff);

  float theta = sin(frameCount / framerate);
  float omega = cos(frameCount / framerate);

  strokeWeight(2);
  stroke(#000000);
  fill(#000000);
  float ex = ox + length * sin(theta);
  float ey = oy + length * cos(theta);
  line(ox, oy, ex, ey);
  ellipse(ex, ey, 10, 10);

  strokeWeight(abs(10 * omega));
  stroke(#f00000);
  noFill();
  circle_arrow(ox, oy, 20 * abs(omega), PI / 2, 2 * omega);
}

void circle_arrow(float x, float y, float r, float angle, float delta_angle) {
  float a0;
  float a1;
  if (delta_angle > 0) {
    a0 = angle - delta_angle;
    a1 = angle + delta_angle;
    arc(ox, oy, 2 * r, 2 * r, a0, a1);
    arrow_head(ox + r * cos(a0), oy + r * sin(a0), cos(a0) - cos(a0 + PI / 6), sin(a0) - sin(a0 + PI / 6), r);
  } else {
    a0 = angle + delta_angle;
    a1 = angle - delta_angle;
    arc(ox, oy, 2 * r, 2 * r, a0, a1);
    arrow_head(ox + r * cos(a1), oy + r * sin(a1), cos(a1) - cos(a1 - PI / 6), sin(a1) - sin(a1 - PI / 6), r);
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

