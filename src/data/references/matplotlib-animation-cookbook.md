# Matplotlib animation cookbook (for AtlasLearning Pyodide)

Animations in AtlasLearning are tracked by the Pyodide worker: it monkey-patches `matplotlib.animation.FuncAnimation` per-run, captures every instance, replays frames, and ships them to the browser as base64 PNGs. This cookbook shows the patterns that work *inside that environment*.

## Late-bound FuncAnimation

```python
import matplotlib.pyplot as plt
import matplotlib.animation as _mpl_anim  # GOOD

def my_anim():
    fig, ax = plt.subplots()
    # ... build artists ...
    return _mpl_anim.FuncAnimation(fig, update, frames=N, interval=33)
```

**Never** write `from matplotlib.animation import FuncAnimation` at the top of a module. That captures a reference to the unpatched class at import time, and the worker's tracker is bypassed forever after. Your animation will silently render as an empty static plot. This bug has happened in this codebase before; treat it as a tripwire.

## Drawing frame 0 before returning

Always call `update(0)` once before returning the animation. Two reasons:

1. If anything in the worker's tracker fails, the figure is still non-empty and shows up as a static fallback.
2. Lines you initialized with `set_data([], [])` look like a blank rectangle until the first frame populates them.

```python
def update(i):
    line.set_data(xs[:i+1], ys[:i+1])
    return (line,)

update(0)  # warm the figure
return _mpl_anim.FuncAnimation(fig, update, frames=N, interval=33, blit=False)
```

## Choosing the interval

`interval` is in milliseconds, not seconds. For a sim with timestep `dt` seconds:

```python
interval_ms = max(16, min(500, int(round(1000.0 * dt))))
```

The clamp keeps real-time-faster sims watchable and very-slow sims from looking frozen.

## blit=False, always

Blitting (`blit=True`) is faster but requires very strict artist accounting and is brittle inside Pyodide's offscreen rendering. Use `blit=False` until you have a measurable reason not to.

## Combining artists in one frame

`update` should return an iterable of every artist you mutated. If you only return a subset, the missing ones will look like they froze. With `blit=False` this is mostly cosmetic, but consistency makes copy-pasted frames behave the same as live ones.

```python
def update(i):
    cart.set_x(x[i])
    rod.set_data([x[i], tip_x[i]], [0, tip_y[i]])
    bob.set_data([tip_x[i]], [tip_y[i]])
    return cart, rod, bob
```

## Don't call plt.show()

It does nothing inside the worker and can mask the real animation. Just return the FuncAnimation — the worker captures from construction.
