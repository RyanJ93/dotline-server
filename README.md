# DotLine server

DotLine is an instant messaging application with end-to-end encryption support out of the box built on top of Node.js and Apache Cassandra. <br />
DotLine supports several type of contents, such as text messages, attachments, geo positions, voice messages and stickers.  <br />
This is the official server repository, if you are interested in DotLine client instead, [head to this repository](https://github.com/RyanJ93/dotline-client). <br />
Most important DotLine features:

- End-to-end encryption support based on AES-256 and RSA.
- User account recovery support through secret recovery key.
- Supports text messages, attachments, geo positions, voice messages and stickers (static and animated).
- Discrete with very low privacy footprint and accesses tracking for additional account security.

[image]

Disclaimer: I made this as part of my graduation project, for this reason this software is provided "as is", without any sort of warranty or guaranty for future updates. <br />
If you feel a little curious you can [try out DotLine here](https://dotline.enricosola.dev).

## Setting up your very personal IM service

You can set up your personal DotLine instance using the ready-to-use Docker image available for Linux (both amd64 and arm64) [here](https://hub.docker.com/r/enricosola/dotline-server); alternatively you can simply clone this repository and follow install instruction to set up DotLine without using Docker on your local environment to try out or customise the software.

### Requirements

Before start installing DotLine on your local environment please make sure you have all the required dependencies:

- Node.js version 18 or greater.
- Apache Cassandra 3.11 or greater, alternatively you can use a DBaaS such as DataStax Astra.
- Redis 7 or greater, again feel free to use a DBaaS such as Redis Enterprise Cloud if you prefer.

### Installation

Once external dependencies are ready you can simply clone this repository and then install all the required modules running `npm install` in the project root directory. <br />
Before running the application place your configuration file in `config/config.json`, you can find a configuration sample in the `config` directory. <br />
Note that the configuration file and its sample are in JSON 5 format, then feel free to use comments if you need. <br />
Now you are ready to start your own server, you can do that simply running one of the following commands: `node index.js` or `npm start`.

If you are looking for instructions to install the software as a Docker container refer to the [official page on Docker Hub](https://hub.docker.com/r/enricosola/dotline-server).

## License

This work is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg

Developed with ❤️ by [Enrico Sola](https://www.enricosola.dev).
