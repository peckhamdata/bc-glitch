# bc-glitch

![](assets/example.png)

Messy glitch art from Bezier City

Dependencies: 

* [node.js](https://nodejs.org)
* [ffmpeg](https://www.ffmpeg.org/) - optional 

Install with `npm i`

This makes a bunch of png frames:

```
node glitch.js
```

Which you can then animate with `ffmpeg` (Not supplied)

```
ffmpeg -r 50 -i %04d.png -c:v libx264 -vf fps=25 -pix_fmt yuv420p out.mp4
```
