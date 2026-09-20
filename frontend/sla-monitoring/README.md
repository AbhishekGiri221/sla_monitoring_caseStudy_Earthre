# SLA Monitoring Dashboard

A serverless SLA monitoring dashboard that accepts health-check CSV files, validates and cleans the data, stores the cleaned records in PostgreSQL, and provides statistics and filterable monitoring logs.

## Live Demo

**Dashboard:** `YOUR_FRONTEND_DEPLOYED_URL`

**API:** `YOUR_API_GATEWAY_URL`

> Last verified live: `YYYY-MM-DD`

---

## Architecture

```text
React Frontend
      |
      | CSV Upload / API Requests
      v
AWS API Gateway
      |
      v
AWS Lambda
      |
      | Parse → Validate → Clean → Deduplicate
      v
Neon PostgreSQL
      |
      v
Stats / Logs
      |
      v
React Dashboard
```

### Components

**React**

Used for the dashboard UI, CSV upload, statistics display, date filtering and logs table.

**AWS API Gateway**

Provides HTTP endpoints for the frontend and routes requests to the Lambda function.

**AWS Lambda**

Acts as the stateless backend. It receives the CSV, parses and validates records, cleans invalid values, removes exact duplicates and stores the cleaned records.

**Neon PostgreSQL**

Persistent database used to store the cleaned health-check records.

---

## API Endpoints

### `POST /upload`

Accepts a CSV file as the request body.

Processing flow:

```text
CSV
 ↓
Parse
 ↓
Validate columns
 ↓
Clean data
 ↓
Remove exact duplicates
 ↓
Insert into PostgreSQL
```

### `GET /stats`

Returns dashboard statistics calculated from the stored records.

Current statistics:

* Total checks
* Total services
* Successful checks
* Failed checks
* Availability
* Average latency
* P95 latency

### `GET /logs`

Returns the underlying health-check records.

Supports filtering by date/date range.

---

## Data Quality Handling

The input data contains several data-quality issues.

### 1. Mixed latency units

Latency can be provided in milliseconds or seconds.

The application normalizes all values to milliseconds.

```text
100 ms → 100 ms
1.5 s  → 1500 ms
```

### 2. Missing latency

Missing latency values are stored as `NULL`.

They are not replaced with an arbitrary value because doing so could distort latency statistics.

### 3. Negative latency

Negative latency values are invalid.

They are converted to `NULL`.

### 4. Invalid status codes

HTTP status codes are expected to be between `100` and `599`.

Values outside this range are treated as invalid and stored as `NULL`.

For example:

```text
999 → NULL
```

### 5. Mixed timestamp formats

The input contains ISO timestamps and Unix timestamps.

All timestamps are normalized to UTC before being stored.

### 6. Exact duplicate rows

Exact duplicate rows are removed before insertion.

A duplicate means the complete record is identical.

Records with the same service and timestamp but different values are not automatically considered duplicates.

### 7. Agent records

`agent-1` provides the regular 15-minute monitoring sequence.

`agent-2` is intermittent/secondary in the provided data, so its absence is not automatically treated as missing monitoring data.

---

## Statistics Assumptions

Availability is calculated using HTTP status codes:

```text
200–399 → successful
400–599 → failed
```

Invalid/NULL status codes are excluded from the availability calculation.

Availability:

```text
successful checks
----------------- × 100
valid checks
```

Average latency and P95 latency are calculated from available valid latency values.

P95 latency represents the latency threshold below which approximately 95% of the available latency observations fall.

---

## Upload Behaviour

Each CSV upload is treated as a new monitoring dataset.

The existing dataset is replaced when a new CSV is uploaded.

This keeps the dashboard statistics and logs representative of the currently uploaded dataset and avoids mixing multiple independent datasets.

The replacement is performed within the database transaction so that a failed upload does not leave the database partially replaced.

---

## Database

PostgreSQL table:

```sql
CREATE TABLE health_checks(
  id BIGSERIAL PRIMARY KEY,
  service_id VARCHAR(100) NOT NULL,
  service_name VARCHAR(100) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  status_code INTEGER,
  latency_ms INTEGER,
  agent VARCHAR(100) NOT NULL,
  region VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Dashboard

The dashboard contains:

### Statistics

A collapsible statistics section displaying the calculated monitoring metrics.

### Logs

A table containing the underlying health-check records.

### Date filtering

Logs can be filtered using:

* A single date
* A date range

### Loading and empty states

The frontend distinguishes between:

* Loading data
* Successfully loaded data
* No data available
* Request failure

---

## Running Locally

### Backend

Install dependencies:

```bash
npm install
```

Set the PostgreSQL connection string:

```env
DATABASE_URL=your_neon_database_url
```

Deploy/run the Lambda using the configured AWS setup.

### Frontend

Install dependencies:

```bash
npm install
```

Configure the API URL:

```js
const API_URL = "https://leszkwm423.execute-api.eu-north-1.amazonaws.com";
```

Run the development server:

```bash
npm run dev
```

---

## Deployment

### Backend

The backend is deployed using:

* AWS Lambda
* AWS API Gateway
* Neon PostgreSQL

### Frontend

The React application is deployed using:

`YOUR_FRONTEND_HOSTING_PLATFORM`

The deployed frontend communicates with the deployed API Gateway endpoint.

---

## Redeployment

### Backend

Update the Lambda source/deployment package and redeploy the Lambda function.

Verify:

```text
GET /stats
GET /logs
POST /upload
```

### Frontend

Build the application:

```bash
npm run build
```

Deploy the generated production build using the configured hosting provider.

---

## What I Would Improve With More Time

With more time, I would consider:

* More detailed service-level SLA calculations
* Service-specific dashboards
* More advanced log filtering
* Pagination for very large datasets
* Better visualization of latency and availability trends
* More comprehensive automated tests
* Improved upload progress and error reporting

These were intentionally kept out of the current implementation to keep the solution focused on the requirements of the assignment.

---

## Tech Stack

* React
* JavaScript
* Axios
* Node.js
* AWS Lambda
* AWS API Gateway
* PostgreSQL
* Neon
* `csv-parse`
