# Getting Started

Copy `.env.template` to `.env`. You shouldn't need to edit any of the values in `.env` unless you plan on using a local instance of MySQL. If so, edit the `DATABASE_URL` environment variable to match the following pattern:

```json
DATABASE_URL="mysql://{USER}:{PASSWORD}@{HOST}:{PORT}/{DATABASE}"
```

Head into `./server` and `./client` and run the following command in each directory:

```bash
npm install
```

*If you are setting up with Docker, the `node_modules` folder in each directory will expedite the time it takes for Express and React to start.*

## Docker

In your terminal, run the following commands:

```bash
docker-compose build
docker-compose up -d
```

You should see three containers through Docker Desktop under the name "vutastic"

* db
* server
* client

Check the server container and make sure Prisma is properly connected to the database. If an exception occurred, restart the container.
(_Given how first time setup takes about ten seconds longer than usual, it's not unlikely that the server will not wait for the database to be fully functional._)

## Local

In `./client/package.json` change the following line:

```json
"proxy": "http://server:5000"
```

to

```json
"proxy": "http://localhost:5000"
```

In `./client` run the following command to make sure npm takes in the change made to the `package.json`:

```bash
npm install
```

In both `./client` and `./server` run the following command:

```bash
npm start
```

## Testing If It Worked

On your web browser, head to `http://localhost:5000/express_backend`. You should see the following JSON object:

```json
"express": "YOUR EXPRESS BACKEND IS CONNECTED TO REACT"
```

This confirms that the server is running as appropriate. To see if React is running, head to `http://localhost:3000`. You should see a spinning React logo. At the bottom of the page (you may need to scroll down), you should see the same message defined in the JSON above. This confirms that the client is running as appropriate and is sending and receiving requests and responses successfully.
