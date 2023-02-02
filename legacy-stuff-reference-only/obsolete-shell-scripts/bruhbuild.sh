
./bruh/bruh -input=./runtime/runner.js -output=./runtime-auto-built/runner.js -prefix="window.runTimeData.runner = " -postfix="" -meta="runner.js"
./bruh/bruh -input=./runtime/jinx.js -output=./runtime-auto-built/jinx.js -prefix="window.runTimeData.jinx = " -postfix="" -meta="jinx.js"
./bruh/bruh -input=./utils.js -output=./runtime-auto-built/utils.js -prefix="window.runTimeData.utils = " -postfix="" -meta="utils.js"
./bruh/bruh -input=./runtime/index.htm -output=./runtime-auto-built/index.js -prefix="window.runTimeData.index = " -postfix="" -meta="index.htm"
./bruh/bruh -input=./runtime/style.css -output=./runtime-auto-built/style.js -prefix="window.runTimeData.style = " -postfix="" -meta="style.css"

