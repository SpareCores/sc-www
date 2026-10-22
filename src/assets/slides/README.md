This folder contains the R Markdown files used to generate HTML slides via [Quarto](https://quarto.org).

To render a slide, [install the CLI](https://quarto.org/docs/get-started/) and run:

```sh
quarto render <slide-name>.Rmd  
```

Here's a script that listens to file changes in the current directory and always
renders the most recently modified file:

```sh
ls -1 *.Rmd css/* | entr Rscript --vanilla -e '
  Sys.setenv(QUARTO_CHROMIUM = "/usr/bin/google-chrome-stable")
  files <- list.files(pattern = ".Rmd")
  lastfile <- names(sort(
    unlist(t(sapply(files, file.info)))[, "mtime"],
    decreasing = TRUE
  )[1])
  quarto::quarto_render(lastfile)
'
```

Then open up the rendered HTML file in your browser. To avoid JS security
problems, you might better start a quick HTTP server instead of browsing via
`file://` protocol:

```sh
python3 -m http.server 8888
```
