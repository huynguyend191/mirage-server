# MIRAGE

Mirage is an online English tutor platform where tutors and students communicate through video call.

## Setup project

Connect your project to MySQL database

> Create database "mirage", edit config database/config.json (host, user, password,...) , change connection.json "env" variabe to "deploy" or "dev" to match your demand

Setup default data in database

> Use query in resources/sql

Create .env file in root directory of the project

    PORT = 3003
    JWT_KEY = <your_key>
    SALT_ROUND = 10
    EMAIL_USER = <email_user>
    EMAIL_PASS = <email_pass>
    EMAIL_HOST = <email_host>
    EMAIL_SENDER = 'MIRAGE <your_email@email.com>'
    SERVER_URL = <server_url>/api
    CLIENT_URL = <server_url>

For testing and developing locally

> Generate self-signed certificate, place them in /resources/cert, modify index.js

    const https = require('https');

    // const http = require('http');


    const certOptions = require('./lib/utils/httpsCert');

    const server = https.createServer(certOptions, app);

    // const server = http.createServer(app);



Run project (install nodemon and edit start script in package json if you want reload app on update)

    npm i
    npm start

## Setup production environment on Digital Ocean

Setup domain

> Register domain, config DNS record to point your doman to Droplet's IP

Install NGINX

> Use config in /resources

Install NodeJS ver 10.x

    curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh

    nano nodesource_setup.sh

    sudo bash nodesource_setup.sh

    sudo apt install nodejs

Install MySQL Server 8.0

    sudo apt install wget

    wget -c https://dev.mysql.com/get/mysql-apt-config_0.8.10-1_all.deb

    sudo dpkg -i mysql-apt-config_0.8.10-1_all.deb

    sudo apt-key adv --keyserver keys.gnupg.net --recv-keys 8C718D3B5072E1F5

    sudo apt install mysql-server

Install Cerbot for SSL

    sudo apt-get updateenter code here

    sudo apt-get install software-properties-common

    sudo add-apt-repository universe

    sudo add-apt-repository ppa:certbot/certbot

    sudo apt-get update

    sudo apt-get install certbot python3-certbot-nginx

Install pm2

> Use pm2 to start Node server
