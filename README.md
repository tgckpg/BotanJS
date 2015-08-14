# BotanJS
A working concept of Js/Css framework for web browsers

### Features
- Compressable by Closure Compiler (Advanced Compression)
- Python-like, class oriented syntax structure
- Everything is merged into one file for that page
- css class inheritance

### Disclaimer
- This is a working concept. So it works on me. And may have a bunch of useless dependency. Use at your own risks!
- It requires Python 3!


### Documentation
- Will be added later

### Prerequisties
#### For Service.WebAPI
- pip install Flask
- pip install Celery
- pip install redis
- pip install compressinja

### Before start, run
```
./botan-rebuild
```

#### To start just run ( need to be root )
Don't worry, this will immediately drop root permission and switch to the user defined in settings.ini
```
./botan-start
```
