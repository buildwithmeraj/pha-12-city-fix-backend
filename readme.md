# CityFix Backend API

Backend service for CityFix, a community platform for reporting and tracking city issues.

Live URL: [https://bwm-cityfix.vercel.app](https://bwm-cityfix.vercel.app)

## Tech Stack

- Node.js
- Express.js
- MongoDB (Node.js driver)
- dotenv
- cors

## Project Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```env
mongodb_uri=your_mongodb_connection_string
```

3. Start the server:

```bash
node index.js
```

## API Endpoints

### Health / Base

- `GET /` - API info page

### Categories

- `GET /categories` - Get all categories

### Issues

- `GET /issues` - Get issues (supports `email`, `limit`, `category`, `status` query params)
- `GET /issue/:id` - Get a single issue by id
- `POST /issues` - Create a new issue
- `PUT /issue/:id` - Update an issue
- `DELETE /issue/:id` - Delete an issue

### Contributions

- `GET /contributions?email=...` - Get contributions by user email
- `GET /contributions?id=...` - Get contributions by issue id
- `POST /contributions` - Add a contribution

## Response Notes

- Invalid issue id format returns `400` on issue-specific `GET`, `PUT`, and `DELETE`.
- `GET /issue/:id`, `PUT /issue/:id`, and `DELETE /issue/:id` return `404` when the issue is not found.
