# Getting Started

Copy `.env.template` to `.env`.

Generate a sha256 hash (online or through the terminal) and edit `JWT_TOKEN` to match it. The hash must be at least 32 characters.

Edit `SERVERADMIN_USER` and `SERVERADMIN_PASSWORD` to whatever you want the Server Admin's account to be. This account will be considered a `SERVERADMIN` and can send requests where a `SUPERADMIN` would be forbidden to.

If you plan on using a local instance of MySQL, edit the `DATABASE_URL` environment variable to match the following pattern:

```env
DATABASE_URL="mysql://{USER}:{PASSWORD}@{HOST}:{PORT}/{DATABASE}"
```

Head into `./server` and `./client` and run the following command in each directory:

```bash
npm install
```

*If you are setting up with Docker, the `node_modules` folder in each directory will expedite the time it takes for Express and React to start.*

## Setup Processes

### Using Docker for Development

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

In the `server` container, access the terminal and run the following command to migrate the database:

```bash
npx prisma migrate dev
```

This will populate the `db` container's MySQL instance with appropriate tables and columns.

### Local Development

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

In `./server` run the following command to migrate the database:

```bash
npx prisma migrate dev
```

This will populate the MySQL instance with appropriate tables and columns.\

Afterwards, in both `./client` and `./server` run the following command to start the application:

```bash
npm start
```

## Testing If It Worked

On your web browser, head to `http://localhost:5000/api/`. You should see the following JSON object:

```json
"express": "YOUR EXPRESS BACKEND IS CONNECTED TO REACT"
```

This confirms that the server is running as appropriate. To see if React is running, head to `http://localhost:3000`. You should see a spinning React logo. At the bottom of the page (you may need to scroll down), you should see the same message defined in the JSON above. This confirms that the client is running as appropriate and is sending and receiving requests and responses successfully.

# Authorization

If you need to use the `SERVERADMIN` account for an API call (i.e., changing a user's role or changing a user's university), use the `api/login` route with the `SERVERADMIN_USER` and `SERVERADMIN_PASSWORD` as credentials for the email and password. Once a successful response is received, grab the token from the body and input it into another request as part of the Authorization header:

```js
fetch('/api/users/1', {
    method: 'put',
    headers: new Headers({
        'Authorization': `${token}`,
        'Content-Type': 'application/json',
    }),
    body: {...},
});
```
