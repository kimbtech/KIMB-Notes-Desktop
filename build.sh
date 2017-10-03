#!/bin/bash

electron-packager ./ --platform=linux --arch=x64 --asar --icon=./assets/icons/png/128x128.png --out=./dist/
electron-packager ./ --platform=darwin --arch=x64 --asar --icon=./assets/icons/mac/notes.icns --out=./dist/
electron-packager ./ --platform=win32 --arch=x64 --asar --icon=./assets/icons/win/notes.ico --out=./dist/