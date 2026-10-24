/* Draws every dither canvas off the main thread (OffscreenCanvas), so the
   page scrolls and responds while the patterns move. Protocol: see main.js. */
importScripts("dither-scenes.js" + self.location.search);

const schedule = self.requestAnimationFrame ? (f) => self.requestAnimationFrame(f) : (f) => setTimeout(() => f(performance.now()), 16);
const eng = self.TSCDither.engine(schedule);

self.onmessage = ({ data: m }) => {
  if (m.type === "add") eng.add(m.id, m.canvas, m);
  else if (m.type === "size") eng.size(m.id, m.w, m.h);
  else if (m.type === "vis") eng.vis(m.id, m.v);
  else if (m.type === "hover") eng.hover(m.id, m.v);
  else if (m.type === "pause") eng.pause(m.v);
  else if (m.type === "still") eng.still(m.v);
};
