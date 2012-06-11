import processing.opengl.*;

float framerate = 30;
int w = 200;
int h = 200;
float length = w / 2.0;
float ox = 0;
float oy = 0;

float ground = 120;

void setup() {
  size(200, 200, OPENGL);
  frameRate(framerate);
  noLoop();
}

void draw() {
  camera(100, 170, 170, 0, 0, 0, 0, 0, -1);
  background(#ffffff);

  strokeWeight(1);
  stroke(#000000);
  noFill();
  draw_ground();
  draw_axes();
  
  float theta = sin(frameCount / framerate);
  float omega = cos(frameCount / framerate);

  strokeWeight(2);
  stroke(#000000);
  fill(#000000);
  float ex = ox + length * sin(theta);
  float ey = oy + length * cos(theta);
  line(ox, oy, 0, ex, ey, 0);
  pushMatrix();
  translate(ex, ey, 0);
  sphere(5);
  popMatrix();
  
  strokeWeight(0);
  fill(#ff0000);
  stroke(#ff0000);
  circle_arrow(ox, oy, 20 * abs(omega), PI / 2, 2 * omega);
  fill(#0000ff);
  stroke(#0000ff);
  z_arrow_tube(5 * omega, 100 * omega);
}

void draw_axes() {
  line(0, 0, 0, 200, 0, 0);
  line(0, 0, 0, 0, 200, 0);
  line(0, 0, 0, 0, 0, 200);
}

void draw_ground() {
  beginShape();
  vertex(ground, ground, 0);
  vertex(-ground, ground, 0);
  vertex(-ground, -ground, 0);
  vertex(ground, -ground, 0);
  endShape(CLOSE);
}

void circle_arrow(float x, float y, float r, float angle, float delta_angle) {
  float a0;
  float a1;
  a0 = angle + delta_angle;
  a1 = angle - delta_angle;
  arc_3d(ox, oy, 2 * r, 2 * r, r / 2, a0, a1, true);
}

void arc_3d(float x, float y, float dx, float dy, float w, float a0, float a1, boolean with_arrow) {
  int n = 10;
  int i;
  float a, uw;
  beginShape(QUAD_STRIP);
  for (i = 0; i <= n; i++) {
    a = ((float)(n - i) / n) * a0 + ((float)i / n) * a1;
    if (!(with_arrow && i >= n - 1)) {
      vertex(x + cos(a) * (dx - w) / 2, y + sin(a) * (dy - w) / 2);
      vertex(x + cos(a) * (dx + w) / 2, y + sin(a) * (dy + w) / 2);
    }
    if ((with_arrow) && (i == n - 2)) {
      uw = 2 * w;
      vertex(x + cos(a + 0.001) * (dx - uw) / 2, y + sin(a + 0.001) * (dy - uw) / 2);
      vertex(x + cos(a + 0.001) * (dx + uw) / 2, y + sin(a + 0.001) * (dy + uw) / 2);
      if (a1 > a0) {
        vertex(x + cos(a) * dx / 2 - sin(a) * dy / 2, y + sin(a) * dy / 2 + cos(a) * dx / 2);
        vertex(x + cos(a) * dx / 2 - sin(a) * dy / 2, y + sin(a) * dy / 2 + cos(a) * dx / 2);
      } else {
        vertex(x + cos(a) * dx / 2 + sin(a) * dy / 2, y + sin(a) * dy / 2 - cos(a) * dx / 2);
        vertex(x + cos(a) * dx / 2 + sin(a) * dy / 2, y + sin(a) * dy / 2 - cos(a) * dx / 2);
      }
    }
  }
  endShape();
}

void z_arrow_tube(float r, float h) {
  int n = 10;
  int i;
  float a;
  
  beginShape(QUAD_STRIP);
  for (i = 0; i <= n; i++) {
    a = TWO_PI * i / n;
    vertex(r * cos(a), r * sin(a), 0);
    vertex(r * cos(a), r * sin(a), h);
  }
  endShape();

  beginShape(QUAD_STRIP);
  for (i = 0; i <= n; i++) {
    a = TWO_PI * i / n;
    vertex(r * cos(a), r * sin(a), h);
    vertex(2 * r * cos(a), 2 * r * sin(a), h);
  }
  endShape();

  beginShape(QUAD_STRIP);
  for (i = 0; i <= n; i++) {
    a = TWO_PI * i / n;
    vertex(2 * r * cos(a), 2 * r * sin(a), h);
    vertex(0, 0, h + 6 * r);
  }
  endShape();
}

