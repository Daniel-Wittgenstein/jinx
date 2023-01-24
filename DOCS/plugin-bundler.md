




The Plugin Bundler takes data and outputs a plugin file.


OUTPUT:
It can output a plugin in two formats:
- as a JS file (for built-in plugins, that are directly loaded as JS)
- as a JSON file (for external plugins, that are loaded via file upload button)



INPUT:
- a json file with all the meta data
- a javascript file that will go into implementation.js
- a css file that will go into implementation.css

That's it. There is no support for multiple js files, but that's hardly needed.
It all ends up as one JS string in the end, anyway.


