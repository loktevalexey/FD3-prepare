babel --presets react,es2015 js/source -d js/build - в папке js/build появляются транспилированные js-файлы
browserify js/build/app.js -o bundle.js - появляется bundle.js
type css\components\* css\* > bundle.css - появляется bundle.css (пути в css надо сразу писать относительно корня; в конце и начале файла оставлять пустые строки)

налаживаем автоматическую сборку через watch:
npm install --global watch
watch "scripts\build.bat" js\source css --wait=5
работает, но при каждом изменении запускается lite-server на новых портах, т.е. утекает память; после останова lite-server через Ctrl+C все порты закрываются
