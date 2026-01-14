# grammY-bot-template

A boilerplate template that applies the GrammY framework to help you get started with the Telegram bot.

## Features

* Structured & modularized code practice
* TypeScript & ESLint 
* Mongodb(Mongoose&Typegoose) support

## Startup

Rename `.env.example` to `.env`, replace values of `BOT_TOKEN` and `USER_CHAT_ID`  to yours.

### How to create a Telegram chatbot yourself?

Add [Bot Father](https://telegram.me/BotFather) to your contact, use `/newbot` command to create your own bot. You will get your HTTP api token as `BOT_TOKEN` eventually.

![20240101153019](https://raw.githubusercontent.com/flynncao/blog-images/main/img/20240101153019.png)

### How to get my own chatid?

* Fastest way: Add [Get My ID](https://t.me/getmyid_bot) to your contact, use `/start` command and you will get your current chatid as your `USER_CHAT_ID`.

* Conventional way: Visit [Telegram Web](https://web.telegram.org/), open Saved Messages chat window, the number behind `web.telegram.org/a/#` is your user chatid, sometimes it is a negative figure.
(You can also appy this approach to get your group channel chatid, etc.)

## Commands Preset

* `/start` Welcome text
* `/help` Show help text
* `/settings` Open settings
* `/wallpaper` Get a random wallpaper from Unsplash(need to fill in access token in .env file under root directory)

> To enable the `/wallpaper` command, you need to apply a [unsplah api key](https://unsplash.com/documentation) and insert it into `.env`

* `/about` Show information about the bot

## Thanks to

<https://github.com/grammyjs/grammY>
<https://github.com/ShoroukAziz/notion-potion>
