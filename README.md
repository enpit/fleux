First of all: This is very WIP!

## Running the Examples

With Parcel installed (`yarn global add parcel-bundler`) you should just need to run `parcel index.html` and the rest should be done for you.

## Contents of this Repo

The repo contains branches that contain little steps of my journey towards sane state management in react. Checkout each branch to see the evolution from `setState` to something kinda cool. The first two steps are more significant, while 5,6,7 are more or less details, step 8 is a bigger one again.

- Step 1: Vanilla React using `setState`
- Step 2: Global State Store incl. PubSub and nifty accessors
- Step 3: HOC to wire things up easily
- Step 4: Adding injected setter function
- Step 5: Make said setter accept a function that takes the current state (to be consistent with `setState`)
- Step 6: Slightly change the API to allow for the use as a decorator
- Step 7: Add capability to distinguish between readable and writeable values (optional and only for perf reasons)
- Step 8: Add behind-the-scenes usage of the Context API to allow for cleaner API
