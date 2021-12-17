# Sphere Defense
### 3D Tower defense game

#### Authored by Nathan Alam and Liam Johansson
In fulfillment of Princeton's COS 426 Final Project

## Demo
Play the game at [https://liamdj.github.io/spheredefense/](https://liamdj.github.io/spheredefense/)

## Development
Clone the repository and run the following commands to run the site locally:
```
git clone https://github.com/cos426nathanliam/spheredefense.git
cd spheredefense
npm build
npm start
```
And then open up the demo site at [http://0.0.0.0:8000/](http://0.0.0.0:8000/)

If editing the scripts, run the following to prettify them:
```
npm run-script pretty
```

## Code Structure
World parameters are set in the index.html file to allow global visibility across javascript files.

Animation, rendering, lighting, and camera controls are all established in render.js

Object files are all in the object directory under scripts.

## Contributing
The main branch is a protected branch, and pull requests are required to push to it.
Feel free to fork and create your own branch, however, and develop there in the meantime.

## Model Credits
Planet model: https://poly.google.com/view/dsrYdi4GZ8U 
