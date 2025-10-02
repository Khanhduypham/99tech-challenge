# Score Update and Real-time Leaderboard Module Specification

## 1\. Overview and Goals

This module is responsible for storing user scores, securely processing user score increments resulting from completed in-app actions, persisting the updated score, and ensuring the global Top 10 leaderboard is updated in real-time for all active users.

The primary goal is to provide a highly available, low-latency, and **secure** mechanism for score updates.

| Feature            | Requirement                           | Implementation Note                                                    |
| ------------------ | ------------------------------------- | ---------------------------------------------------------------------- |
| **Secure Update**  | Prevent score manipulation.           | Requires mandatory JWT/Auth token and server-side action verification. |
| **Persistence**    | Store and update user scores.         | PostgreSQL/MongoDB for primary data storage.                           |
| **Real-time Feed** | Live update of the Top 10 scoreboard. | Dedicated **WebSockets** (or SSE) server/integration.                  |
| **Efficiency**     | Fast retrieval of the Top 10 scores.  | Utilize a dedicated in-memory cache (like **Redis Sorted Set**).       |

## 2\. Data Model

### `UserScore` (Primary Storage - PostgreSQL/MongoDB)

| Field Name     | Type              | Description                                        | Indexing                          |
|----------------|-------------------|----------------------------------------------------|-----------------------------------|
| `userId`       | `UUID` / `String` | Unique identifier for the user.                    | Primary Key                       |
| `score`        | `Integer` / `Long`| The user's current total score.                    | **Indexed (for Top 10 queries)**  |
| `lastActionId` | `String`          | Unique ID of the last processed action (idempotency). | Standard Index                   |
| `lastUpdated`  | `Timestamp`       | Time of the last score modification.               | Standard Index                     |


### `LeaderboardCache` (Dedicated Cache - Redis Sorted Set)

The cache will be structured as a **Redis Sorted Set** (`ZSET`) where:

- **Key:** `global:scoreboard:top10`

- **Member:** `userId`

- **Score:** The user's `score` value.

## 3\. API Specification

### Endpoint: `POST /api/v1/scores/update`

This endpoint is used by the frontend client to dispatch a score update request upon completion of a legitimate in-app action.

| Parameter         | Value                  | Description                                      | Required |
|-------------------|------------------------|--------------------------------------------------|----------|
| **Method**        | `POST`                 |                                                  | Yes      |
| **Path**          | `/api/v1/scores/update`|                                                  | Yes      |
| **Authentication**| Bearer Token (JWT)     | Must be present in the `Authorization` header.   | Yes      |

#### Request Body (JSON)

| Field Name  | Type            | Description                                                                 |
|-------------|-----------------|-----------------------------------------------------------------------------|
| `actionId`  | `String (UUID)` | A unique, client-generated ID for this specific action attempt. **CRITICAL for Idempotency.** |
| `actionType`| `String`        | Identifier for the action completed (e.g., `"DAILY_QUEST"`, `"ENEMY_DEFEATED"`). |
| `scoreDelta`| `Integer`       | The score increase amount (must be positive).                               |
| `timestamp` | `Timestamp`     | Client-side time of action completion (for fraud analysis).                  |


#### Response Codes

| Code                  | Reason        | Description                                                                 |
|-----------------------|---------------|-----------------------------------------------------------------------------|
| `200 OK`              | Success       | Score successfully updated. Response can optionally contain the user's new score. |
| `401 Unauthorized`    | Security      | Invalid or missing authentication token.                                   |
| `400 Bad Request`     | Validation    | Missing fields, invalid `actionType`, or attempting to re-process an existing `actionId`. |
| `429 Too Many Requests`| Rate Limiting | User is attempting to update scores too frequently.                        |
| `500 Internal Server Error` | System Failure | Database or cache communication failure.                                |


## 4\. Security, Validation, and Scalability

### 4.1. Security (Preventing Malicious Scores)

1.  **Authentication & Identity Mapping:**

    - The API layer must first validate the JWT.

    - The service must extract the **authenticated `userId`** from the JWT payload.

    - **The service MUST ignore any `userId` passed in the request body.** The only valid `userId` is the one derived from the securely signed token.

2.  **Server-Side Action Validation:**

    - The service must verify that the requested `actionType` and `scoreDelta` are consistent with what the server expects. (e.g., A "DAILY_QUEST" action should only grant 100 points, not 100,000). **The client-supplied `scoreDelta` should be considered a hint, not a source of truth.** The server should look up the definitive score value based on `actionType`.

3.  **Idempotency Check:**

    - Before processing the score update, check the user's `lastActionId` in the database. If the incoming `actionId` is already processed (or is identical to the last one), return `400 Bad Request` or `200 OK` without modification. This prevents double-counting if the client retries the request.

4. **Rate Limit:**

    - Avoid one user calls many request at time, return `429 Too Many Requests`
        + Per-User: e.g., max 10 score updates/minute.
        + Global: e.g., circuit breaker if the system sees anomalous spikes.
        + Use Redis sliding window counters for efficiency.

### 4.2. Real-time Update Mechanism

1.  **Technology:** Utilize a dedicated **WebSocket** server (e.g., using technologies like Socket.IO, or native WebSockets).

2.  **Channel:** All clients subscribe to a single public channel: `/ws/scoreboard/top10`.

3.  **Data Flow:**

    - After the score is successfully updated in the primary DB and the Redis Cache is updated, the API service checks if the user's new score has affected the Top 10 list.

    - If the Top 10 list changed (either the user is now on it, or their position changed, or they pushed someone else off), the API service fetches the current Top 10 from the Redis cache.

    - The API service then publishes the new Top 10 data structure to the dedicated WebSocket channel.

    - The WebSocket server broadcasts the data to all connected clients.

5\. Error Handling Edge Cases
-----------------------------

To ensure data integrity and system stability under failure conditions, the following error handling policies must be implemented.

### 5.1. DB/Cache Inconsistency (Redis Failure)

-   **Policy:** The **PostgreSQL/MongoDB** remains the single **Source of Truth**.

-   **Scenario:** If the primary database transaction succeeds, but the subsequent **Redis update (`ZADD`) fails** (e.g., Redis is unreachable, timeout):

    -   The API service **MUST** log a critical error (e.g., to Sentry/DataDog).

    -   The API service **MUST** still return `200 OK` to the client, as the canonical score has been successfully persisted.

    -   **Suggestion actions:** 
        + Write an event (e.g., "score_updated") into a durable DB table in the same transaction as the score update.
        + A worker service picks up outbox events and retries updating Redis + WebSocket broadcasts.
        
### 5.2. Idempotency Edge Case (Mid-Process Failure)

-   **Policy:** Use the `lastActionId` in the database as the guardrail against duplicate processing.

-   **Scenario:** An API request is received, the `actionId` is new, but a system failure occurs *after* the score has been updated in the DB and the `lastActionId` has been set, but *before* the API can send the final `200 OK` response. The client retries the request with the **same `actionId`**.

    -   **Outcome:** The subsequent request will be caught by the **Idempotency Check** (Step 3 in 4.1), which will see the `actionId` already exists. The service will safely return `200 OK` without re-processing the score, guaranteeing the user is not double-charged for the action, even if they only received the successful response on the second attempt.

-   **Recommended Long-Term Fix (Transactional Outbox):** To eliminate inconsistency risks entirely, adopt the **Asynchronous Score Processing** (Section 6) using a Message Queue. This pattern inherently handles retries and guarantees "at-least-once" delivery, with the consumer service enforcing idempotency.

## 6\. Comments for Improvement (Future Considerations)

This section highlights areas for potential improvement and increased robustness:

- **Action Catalog:** Move action validation into a configurable server-side catalog (DB table or config) mapping actionType → scoreDelta. Makes the system extensible without code changes. So far, we can also store user's actions history for tracing and monitoring.

- **Leaderboard Scope:** Extend beyond global Top 10 — support filters like daily, weekly, per-region, or per-game-mode leaderboards. Use Redis key namespacing (e.g., scoreboard:daily:2025-10-02).

- **Asynchronous Score Processing:** For very high-throughput systems, decouple the update process. Instead of having the API service directly update the DB and cache, it should only validate the request and push the validated payload onto a **Message Queue (e.g., Kafka or SQS)**. A separate worker service consumes the queue, handles the database/cache updates, and triggers the WebSocket broadcast. This drastically improves the API response time.

- **Database vs. Cache of Record:** Currently, the cache is used for reading the Top 10, and the primary DB is the source of truth for the user's total score. Consider using a system like Redis or Memcached as the _sole_ source of truth for the score, and periodically batch write the updates to the relational/document DB for long-term archiving and reporting.

- **WebSockets Scaling:** Implement clustered WebSockets (e.g., using a Redis Pub/Sub backend for the WebSocket cluster) to handle horizontal scaling of real-time connections efficiently.

- **Cheating Prevention:** Implement more sophisticated anti-cheat logic, such as a rolling window counter on the user's side to detect impossible score-per-second rates, which would lead to temporary API bans or flagging the account.
