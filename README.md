# bc-map

Map of [Bezier City](beziercity.com)

And messy glitch art

For the glitch art

```
node hmm.js
```

then

```
ffmpeg -r 50 -i %04d.png -i long.wav -filter:a "atempo=2.0" -c:v libx264 -vf fps=25 -pix_fmt yuv420p -shortest out.mp4
```
