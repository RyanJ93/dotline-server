# DotLine server

DotLine is an instant messaging application with end-to-end encryption support out of the box built on top of Node.js and Apache Cassandra. <br />
DotLine supports several type of content, such as text messages, attachments, geo positions, voice messages, and stickers.  <br />
This is the official server repository, if you are interested in DotLine client instead, [head to this repository](https://github.com/RyanJ93/dotline-client). <br />
Most important DotLine features:

- End-to-end encryption support based on AES-256 and RSA.
- User account recovery support through secret recovery key.
- Supports text messages, attachments, geo positions, voice messages, and stickers (static and animated).
- Discrete with a very low privacy footprint and access tracking for additional account security.

Disclaimer: I made this as part of my graduation project, for that reason this piece of software is provided "as is" and without any sort of warranty or guarantee for future updates. <br />
If you feel a little curious you can [try out DotLine here](https://dotline.enricosola.dev).

## Quick reference

- Project GitHub repository: [https://github.com/RyanJ93/dotline-server](https://github.com/RyanJ93/dotline-server)
- DotLine client image: [https://hub.docker.com/r/enricosola/dotline-client](https://hub.docker.com/r/enricosola/dotline-client)
- DotLine client GitHub repository: [https://github.com/RyanJ93/dotline-client](https://github.com/RyanJ93/dotline-client)

## How to use this image

To run your very own instance of the DotLine server issue the following command (further configuration may be required):

````bash
docker run -p 8888:8888 -v [path to config]:/home/app/config -d --name dotline-server enricosola/dotline-server:latest
````

You must provide the path where the configuration is stored, you can configure your container with additional options as follows.

### Customizing port

By default, the DotLine server listens on port 8888, you can change this behavior in the configuration file, however, you could simply change the port mapping, then, in general, you can replace the default configuration with `-p [PORT]:8888`.

### Customizing configuration path

You must define a volume bound to the directory where the configuration file is stored; please mind that inside that folder the configuration file must be named `config.json`. <br />
You can provide a configuration folder location, that may include additional assets, involved, for example, in the database connection/authentication process, using this option: `[config path]:/home/app/config`.

### Persisting logs

By default, logs are stored within the container, this behavior leads to log file loss if the container gets recreated, to persist the log file you should define a volume where the log file should be stored, you can do that using this option: `[path to logs directory]:/home/app/logs`.

### Persisting user uploaded files

As said about logs, also user uploaded files are stored inside the container; you may want to persist uploaded files to prevent data losses, to do that you can use the following option to define the volume where user-uploaded files will be stored: `[path to storage directory]:/home/app/storage`.

## License

This work is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg

Developed with ❤️ by [Enrico Sola](https://www.enricosola.dev).
