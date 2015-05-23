# Streamflix

A cli tool for searching streaming sites and streaming using a player of your choice.

It currently supports yify.tv, view47.com, popcorntimefree.info.

Want more ? Create an issue with a request, Alternatively you can contribute your own scrapers.

Pull requests are welcome.

## Preview
Here is a shot video showing the interface off: http://a.pomf.se/ajsloe.webm

## Key features
*   Automatic subtitle downloader.
*   Stream or download options avaliable.

## Install (manual)

Clone the repository:

```
git clone git@github.com:ItzBlitz98/streamflix.git
```


Install dependencies:

```
npm install
```

You can now run the executable in the bin directory.

You can update by doing a:
```
git pull
```
updates are important as sites change and this is still in active development.

If you update and get an error like "module not found" when launching, Do another npm install.

## Alias
I would reccomend creating a bash/zsh alias to make launching the app easier.
```
alias streamflix="/home/geewiz/Apps/streamflix/bin/streamflix"
```

## Configuration

Streamflix comes with a default config. Open up config.yaml and tweak things to your prefrence.

*Not if you want to download files you have to set a downloaod location in the config file.


## Subtitles
Streamflix can fetch subtitles automagically for you, Subtitles can be enabled from the config.yaml file. Just set subtitles to true.

I can't guarantee that the subtitles will match but in my limited testing they were spot on.
