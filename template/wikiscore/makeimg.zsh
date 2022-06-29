#!/usr/bin/zsh
for i in {1..450}
do
		convert -font "Macklin-Sans-Variable" -fill black -pointsize 120 -draw "text 350,220 '$i'" wikiscore-base.png temp.png
        ((r = 255 - 43* i/450))
        ((g = 255 - 26* i/450))
        ((b = 255 - 97* i/450))
        echo "$i $r $g $b"
        convert temp.png -fuzz 5% -fill "rgb($r,$g,$b)" -draw 'color 50,50 replace' wikiscore-$i.png
        echo "convert temp.png -fuzz 5% -fill 'rgb($r,$g,$b)' -draw 'color 50,50 replace' wikiscore-$i.png"
done