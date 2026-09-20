# SLA Monitoring Dashboard

A serverless SLA monitoring dashboard built as a take-home assignment for the **Full Stack Engineer** position at EarthRe.

The application allows users to upload health-check CSV data, validates and cleans the records, stores the processed data in PostgreSQL, and provides monitoring statistics and filterable logs.

## Live Application

**Live URL:**
https://sla-monitoring-case-study-earthre-sooty.vercel.app

---

## Architecture

```text
React Frontend
      |
      | HTTPS
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

#### React

Used for:

* CSV file upload
* Dashboard UI
* Statistics display
* Date/date-range filtering
* Monitoring logs table
* Loading and error states

#### AWS API Gateway

Provides the HTTP API endpoints and routes requests to the Lambda function.

#### AWS Lambda

The backend is implemented as a stateless serverless function.

It handles:

1. CSV parsing
2. Required-column validation
3. Data cleaning
4. Duplicate removal
5. Database insertion
6. Statistics queries
7. Log queries

#### Neon PostgreSQL

Used as the persistent database for cleaned health-check records.

---

# API Endpoints

## `POST /upload`

Accepts a CSV file and processes the records.

```text
CSV
 ↓
Parse
 ↓
Validate columns
 ↓
Clean records
 ↓
Remove exact duplicates
 ↓
Store in PostgreSQL
```

## `GET /stats`

Returns dashboard statistics calculated from the stored monitoring records.

The dashboard currently displays:

* Total checks
* Total services
* Successful checks
* Failed checks
* Availability
* Average latency
* P95 latency

## `GET /logs`

Returns the underlying monitoring records.

The endpoint supports date-based filtering for the dashboard.

---

# Data Quality Handling

The provided datasets contain several data-quality issues. The application handles them during ingestion.

## Mixed latency units

Latency values can be provided in milliseconds or seconds.

All values are normalized to milliseconds.

```text
100 ms → 100 ms
1.5 s  → 1500 ms
```

## Missing latency

Missing latency values are stored as `NULL`.

They are not replaced with an arbitrary value because doing so could affect latency statistics.

## Negative latency

Negative latency values are considered invalid and are converted to `NULL`.

## Invalid status codes

Status codes are validated to ensure they are between `100` and `599`.

Invalid values such as `999` are converted to `NULL`.

## Mixed timestamp formats

The input data contains both ISO timestamps and Unix timestamps.

They are normalized to UTC before being stored in PostgreSQL.

## Exact duplicate rows

Exact duplicate rows are removed before insertion.

A record is considered a duplicate only when the complete record is identical.

Records with the same service and timestamp but different values are not automatically treated as duplicates.

## Agent data

The supplied data contains a regular monitoring sequence from `agent-1` and intermittent records from `agent-2`.

The application does not assume that every missing `agent-2` record represents a monitoring failure.

---

# Statistics Assumptions

Availability is calculated using HTTP status codes.

```text
200–399 → Successful
400–599 → Failed
```

Records with invalid or missing status codes are excluded from the availability calculation.

Availability is calculated as:

```text
Successful valid checks
---------------------- × 100
Total valid status checks
```

Average latency and P95 latency are calculated using available latency values.

P95 latency represents the latency value below which approximately 95% of the available latency observations fall.

---

# Upload Behaviour

Each CSV upload is treated as a **new monitoring dataset**.

The existing dataset is replaced when a new CSV is uploaded.

This keeps the dashboard statistics and logs representative of the currently uploaded dataset rather than combining multiple independent datasets.

The replacement and insertion are performed within a database transaction so that a failed upload does not leave the database partially updated.

---

# Database Schema

The application uses the following PostgreSQL table:

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

# Frontend

The dashboard contains three main areas.

### Statistics

A collapsible statistics section displays the calculated monitoring metrics.

### Logs

A table displays the underlying health-check records.

### Filtering

The logs can be filtered by:

* Single date
* Date range

The UI also handles:

* Loading states
* Empty states
* API errors
* Upload status

---

# Technology Stack

### Frontend

* React
* JavaScript
* Axios
* Vite

### Backend

* Node.js
* AWS Lambda
* AWS API Gateway

### Database

* PostgreSQL
* Neon

### Other

* `csv-parse`

---

# Project Structure

```text
project/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── handler.js
│   ├── db.js
│   ├── column_validator.js
│   ├── cleanRecord.js
│   ├── latency_validator.js
│   ├── statusCode_validator.js
│   ├── timeStamp_validator.js
│   ├── duplicateRow_validator.js
│   ├── insertRecord.js
│   ├── stats.js
│   ├── logs.js
│   └── package.json
│
└── README.md
```

---

# Running Locally

## Frontend

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at the local Vite development URL.

## Backend

The backend is deployed as an AWS Lambda function and uses the deployed API Gateway endpoint.

The Lambda function requires a PostgreSQL connection string through the `DATABASE_URL` environment variable.

Example:

```env
DATABASE_URL=your_neon_database_connection_string
```

Database credentials should not be committed to GitHub.

---

# Deployment

## Frontend

The React frontend is deployed using Vercel.

**Live application:**

https://sla-monitoring-case-study-earthre-sooty.vercel.app

The frontend communicates with the deployed AWS API Gateway endpoint.

## Backend

The backend is deployed using:

* AWS Lambda
* AWS API Gateway

The database is hosted on Neon PostgreSQL.

---

# Deployment Architecture

```text
                         Internet
                            |
                            v
                  +-------------------+
                  |      Vercel       |
                  |  React Frontend   |
                  +---------+---------+
                            |
                            | HTTPS
                            v
                  +-------------------+
                  |   API Gateway     |
                  +---------+---------+
                            |
                            v
                  +-------------------+
                  |    AWS Lambda     |
                  +---------+---------+
                            |
                            | PostgreSQL
                            v
                  +-------------------+
                  |  Neon PostgreSQL  |
                  +-------------------+
```

---

# Design Decisions

The implementation intentionally focuses on the requirements of the assignment.

Authentication, multi-tenancy and CI/CD pipelines were not implemented because they were outside the requested scope.

The backend is stateless and the persistent application data is stored in PostgreSQL.

Batch database inserts are used during CSV ingestion to avoid sending an excessive number of PostgreSQL parameters in a single query.

---

# What I Would Improve With More Time

With additional time, I would consider:

* Service-specific SLA calculations
* More detailed service-level metrics
* Latency and availability charts
* More advanced log filtering
* Pagination for very large datasets
* More comprehensive automated tests
* Improved upload progress feedback
* More detailed error reporting

These were intentionally kept outside the current implementation to keep the solution focused on the assignment requirements.

---

# Live Demo

**Application:**
https://sla-monitoring-case-study-earthre-sooty.vercel.app

The deployed application can be used to upload the provided monitoring CSV data and view the resulting statistics and monitoring logs.
