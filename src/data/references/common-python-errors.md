# Common Python errors translated

Every long error message has a one-sentence English translation. This page is the dictionary for the ones AtlasLearning students hit most often.

## ValueError: shapes (a,b) and (c,d) not aligned

You tried to multiply two arrays whose inner dimensions don't match. For `A @ B`, NumPy requires `A.shape[-1] == B.shape[0]`. Print both shapes; you almost certainly need a transpose somewhere.

## ValueError: could not broadcast together with shapes ...

You tried an element-wise op between two arrays that don't share a compatible broadcast shape. Two arrays broadcast if, reading from the right, every dimension is either equal or one of them is 1. Shapes `(3, 1)` and `(1, 5)` broadcast to `(3, 5)`. Shapes `(3,)` and `(5,)` do not.

## TypeError: only size-1 arrays can be converted to Python scalars

Somewhere you tried to use a NumPy array where a single number was expected — usually inside `float()`, `int()`, or a matplotlib argument. Trace back to find where the input became multi-element. Often you meant `.item()` (returns a scalar) or `[0]` (returns the first element).

## TypeError: 'NoneType' object is not subscriptable / iterable

A function returned `None` instead of what you expected, and the next line tried to index it or loop over it. Most common cause in this repo: forgetting a `return` statement in a function with branches.

## RecursionError: maximum recursion depth exceeded

You wrote a recursive function and forgot the base case, or the base case never triggers because of a comparison bug (e.g., comparing floats with `==` instead of `abs(a - b) < tol`).

## ZeroDivisionError / RuntimeWarning: divide by zero encountered

Self-explanatory. In a simulation, often happens because the integrator stepped into a singular configuration (manipulator at a kinematic singularity, denominator in a dynamics term going to zero). Fix the math, don't catch the exception.

## NaN poisoning

NumPy will not raise on `1.0 / 0.0` — it returns `inf` or `nan` and propagates silently. A single NaN in your state vector turns into all-NaN within a few timesteps. Symptoms: animation freezes, plot is blank, controller behaves oddly. Insert `assert np.all(np.isfinite(state))` after each integration step to catch this on the first frame it appears.

## "My code runs in the Python REPL but fails inside the Pyodide worker"

Two likely causes:

1. You used a package not in `DEFAULT_PACKAGES` and didn't list it in `pythonPackages`. Pyodide will refuse to import it.
2. You imported from a file (`from utils import ...`) — the worker has its own filesystem and your file isn't on it. Put helper code inline.

## "My matplotlib animation shows a blank plot"

You did `from matplotlib.animation import FuncAnimation` at the top of a module. Switch to `import matplotlib.animation as _mpl_anim` and call `_mpl_anim.FuncAnimation(...)` at function-call time. See the matplotlib animation cookbook for details.
