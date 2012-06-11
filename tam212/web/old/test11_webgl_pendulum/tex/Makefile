
FORMULAS = O.tex P.tex v.tex H.tex formula.tex

all: $(FORMULAS:.tex=_rescaled.png) $(FORMULAS:.tex=_outline_rescaled.png)

.SECONDARY:

%_outline_rescaled.png: %_outline.png
	convert $< -resize 512x512\! $@

%_rescaled.png: %_plain.png
	convert $< -resize 512x512\! $@

%_outline.png: %_thick_white.png %_plain.png
	convert $^ -composite $@

%_thick_white.png: %_plain.png
	convert $< -background white -flatten -monochrome -negate -morphology Dilate Disk -transparent black $@

%_plain.png: %.pdf
	convert -density 300 $< -trim +repage -bordercolor none -border 10 $@

%.pdf: %.tex
	pdflatex $<

clean:
	rm -f $(FORMULAS:.tex=_rescaled.png) $(FORMULAS:.tex=_outline_rescaled.png) $(FORMULAS:.tex=_outline.png) $(FORMULAS:.tex=_thick_white.png) $(FORMULAS:.tex=_plain.png) $(FORMULAS:.tex=.pdf) $(FORMULAS:.tex=.aux) $(FORMULAS:.tex=.log)
