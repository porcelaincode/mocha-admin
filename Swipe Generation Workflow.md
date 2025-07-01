# Workflow to Generate Ordered Swipes Based on Profile Compatibility

## Objective
Generate a prioritized list of swipeable profiles for each user, ordered by compatibility (based on interests, preferences, and activity), while ensuring:
- Profiles already swiped on are excluded (using the `unique_swipe` constraint).
- User preferences (e.g., age, distance, interests) from the `userFilters` table are respected.
- Swipe limits (`swipe_credits`) are enforced.
- Profiles are ranked to maximize mutual interest and engagement.

## Workflow Overview
1. **Validate Swipe Credits**: Check if the user has available `swipe_credits` to generate profiles.
2. **Fetch User Preferences**: Retrieve the user’s filters (age range, distance, interests, etc.) from the `userFilters` table.
3. **Calculate Compatibility Scores**: Score potential profiles based on shared interests, proximity, activity level, and other factors.
4. **Filter Eligible Profiles**: Exclude profiles that don’t match filters, are inactive, or have been swiped on.
5. **Order Profiles**: Rank profiles by compatibility score, prioritizing verified users, recent activity, and mutual interest potential.
6. **Insert Swipe Actions**: Record swipes in the `swipes` table when the user takes an action.
7. **Update Credits and Matches**: Deduct credits and handle matches for `like` or `superlike` actions.

## Detailed Steps

### 1. Validate Swipe Credits
- **Purpose**: Ensure the user has enough `swipe_credits` (or `super_likes` for superlikes) to swipe.
- **Implementation**:
  - Query the `users` table for the user’s credits:
    ```sql
    SELECT swipe_credits, super_likes
    FROM users
    WHERE id = :currentUserId;
    ```
  - If `swipe_credits <= 0`, return an error prompting the user to wait for the daily reset or purchase credits.
  - For `superlike` actions, ensure `super_likes > 0`.

### 2. Fetch User Preferences
- **Purpose**: Retrieve the user’s preferences to filter and rank profiles.
- **Implementation**:
  - Query the `userFilters` table:
    ```sql
    SELECT age_min, age_max, max_distance, show_verified_only, show_online_only, interests
    FROM user_filters
    WHERE user_id = :currentUserId;
    ```
  - If no filters exist, use defaults from the `users.preferences` JSONB field:
    ```sql
    SELECT preferences->'ageRange'->>'min' AS age_min,
           preferences->'ageRange'->>'max' AS age_max,
           preferences->>'maxDistance' AS max_distance,
           preferences->>'showVerified' AS show_verified_only,
           preferences->>'showOnline' AS show_online_only,
           interests
    FROM users
    WHERE id = :currentUserId;
    ```
  - Parse interests (JSONB array) to use in compatibility scoring.

### 3. Calculate Compatibility Scores
- **Purpose**: Rank profiles based on compatibility to prioritize high-potential matches.
- **Compatibility Metrics**:
  - **Shared Interests**: Count overlapping interests between the user’s `interests` and the candidate’s `interests` (JSONB array overlap).
  - **Age Match**: Score profiles closer to the user’s preferred age range.
  - **Distance**: If `users.location` is a `GEOGRAPHY` type, use PostGIS to calculate distance; otherwise, use a simple heuristic (e.g., same city = higher score).
  - **Activity Level**: Prioritize users with recent activity (`last_seen` or `last_login_at`).
  - **Verification Status**: Boost verified users (`verified = true`) if `show_verified_only` is true or as a tiebreaker.
  - **Profile Engagement**: Use `likes_received` and `profile_views` to boost popular profiles.
  - **Mutual Interest Potential**: If the candidate has liked similar profiles (based on `swipes` or `likes`), increase their score.
- **Scoring Formula** (example, adjustable weights):
  ```
  score = (0.4 * shared_interests_count / total_interests) +
          (0.2 * (1 - abs(user_age - candidate_age) / (age_max - age_min))) +
          (0.2 * (1 - distance / max_distance)) +
          (0.1 * (verified ? 1 : 0)) +
          (0.1 * (1 - hours_since_last_seen / 168)) +
          (0.1 * (likes_received / max_likes_received))
  ```
  - Normalize scores to [0, 1] for consistency.
- **Implementation**:
  - Use a database function or application logic to compute scores. Example SQL for shared interests:
    ```sql
    SELECT u.id,
           CARDINALITY(u.interests & :userInterests) AS shared_interests
    FROM users u
    WHERE u.id != :currentUserId;
    ```
  - For distance, if using PostGIS:
    ```sql
    SELECT u.id,
           ST_Distance(u.location, (SELECT location FROM users WHERE id = :currentUserId)) AS distance
    FROM users u
    WHERE u.id != :currentUserId;
    ```

### 4. Filter Eligible Profiles
- **Purpose**: Exclude profiles that don’t match criteria or have been swiped on.
- **Implementation**:
  - Query the `users` table, joining with `photos` and `user_filters`, excluding swiped profiles:
    ```sql
    SELECT
      u.id,
      u.name,
      u.age,
      u.bio,
      u.location,
      u.verified,
      u.is_online,
      u.last_seen,
      u.likes_received,
      u.profile_views,
      p.url AS profile_photo,
      CARDINALITY(u.interests & :userInterests) AS shared_interests,
      -- Add distance calculation if using GEOGRAPHY
      (CASE WHEN u.verified THEN 1 ELSE 0 END) AS verified_score,
      EXTRACT(EPOCH FROM (NOW() - u.last_seen)) / 3600 AS hours_since_last_seen
    FROM users u
    LEFT JOIN photos p ON u.id = p.user_id AND p.is_default = true
    LEFT JOIN user_filters f ON f.user_id = :currentUserId
    WHERE u.id != :currentUserId
      AND u.is_active = true
      AND u.is_dummy_user = false
      AND u.is_test_user = false
      AND u.age BETWEEN f.age_min AND f.age_max
      AND (f.show_verified_only = false OR u.verified = true)
      AND (f.show_online_only = false OR u.is_online = true)
      AND NOT EXISTS (
        SELECT 1
        FROM swipes s
        WHERE s.from_user_id = :currentUserId
          AND s.to_user_id = u.id
          AND s.status = 'active'
      )
      AND (
        f.interests = '[]' OR
        u.interests && f.interests
      )
      -- Add distance filter: ST_DWithin(u.location, :userLocation, f.max_distance * 1609.34)
    ORDER BY
      (0.4 * CARDINALITY(u.interests & :userInterests) / GREATEST(CARDINALITY(u.interests), 1)) +
      (0.2 * (1 - ABS(u.age - :userAge) / GREATEST(f.age_max - f.age_min, 1))) +
      (0.1 * (CASE WHEN u.verified THEN 1 ELSE 0 END)) +
      (0.1 * (1 - EXTRACT(EPOCH FROM (NOW() - u.last_seen)) / (3600 * 168))) +
      (0.1 * u.likes_received / GREATEST((SELECT MAX(likes_received) FROM users), 1))
      DESC
    LIMIT 10; -- Batch size
    ```
  - **Notes**:
    - Replace `:userInterests`, `:userAge`, and `:userLocation` with actual values.
    - If `location` is not a `GEOGRAPHY` type, use a simpler filter (e.g., `u.location = :userLocation` for same city).
    - The `ORDER BY` clause implements the compatibility score.

### 5. Order Profiles
- **Purpose**: Present profiles in descending order of compatibility score.
- **Implementation**:
  - The `ORDER BY` clause in the query above ranks profiles based on the scoring formula.
  - Optionally, shuffle the top N profiles (e.g., top 20) randomly to introduce variety while maintaining high compatibility.
  - Return the ordered list to the client for display in the swipe interface.

### 6. Insert Swipe Actions
- **Purpose**: Record the user’s swipe action (`like`, `pass`, `superlike`) in the `swipes` table.
- **Implementation**:
  - Insert into the `swipes` table:
    ```sql
    INSERT INTO swipes (from_user_id, to_user_id, action, note, status, created_at)
    VALUES (:currentUserId, :toUserId, :action, :note, 'active', NOW())
    ON CONFLICT ON CONSTRAINT unique_swipe
    DO NOTHING
    RETURNING id;
    ```
  - If the action is `like` or `superlike`, insert into the `likes` table:
    ```sql
    INSERT INTO likes (from_user_id, to_user_id, swipe_id, super_like, seen, created_at)
    VALUES (:currentUserId, :toUserId, :swipeId, :isSuperLike, false, NOW())
    RETURNING id;
    ```
  - **Transaction**: Wrap the swipe and like insertions in a transaction to ensure consistency:
    ```typescript
    await db.transaction(async (tx) => {
      const swipe = await tx
        .insert(swipes)
        .values({
          fromUserId: currentUserId,
          toUserId,
          action,
          note,
          status: "active",
        })
        .returning({ id: swipes.id })
        .get();

      if (action === "like" || action === "superlike") {
        await tx.insert(likes).values({
          fromUserId: currentUserId,
          toUserId,
          swipeId: swipe.id,
          superLike: action === "superlike",
        });
      }
    });
    ```

### 7. Update Credits and Handle Matches
- **Purpose**: Deduct credits and check for mutual likes to create matches.
- **Implementation**:
  - Update credits:
    ```sql
    UPDATE users
    SET swipe_credits = swipe_credits - 1,
        super_likes = CASE WHEN :action = 'superlike' THEN super_likes - 1 ELSE super_likes END
    WHERE id = :currentUserId
      AND swipe_credits > 0
      AND (:action != 'superlike' OR super_likes > 0);
    ```
  - Check for a reciprocal like:
    ```sql
    SELECT id
    FROM likes
    WHERE from_user_id = :toUserId
      AND to_user_id = :currentUserId
      AND swipe_id IN (SELECT id FROM swipes WHERE status = 'active');
    ```
  - If a reciprocal like exists, create a match:
    ```sql
    INSERT INTO matches (user1_id, user2_id, like1_id, like2_id, matched_at, created_at)
    VALUES (
      LEAST(:currentUserId, :toUserId),
      GREATEST(:currentUserId, :toUserId),
      :like1Id,
      :like2Id,
      NOW(),
      NOW()
    )
    RETURNING id;
    ```
  - Create a conversation:
    ```sql
    INSERT INTO conversations (match_id, user1_id, user2_id, active, created_at, updated_at)
    VALUES (:matchId, :user1Id, :user2Id, true, NOW(), NOW());
    ```
  - Update match counts:
    ```sql
    UPDATE users
    SET matches = matches + 1
    WHERE id IN (:user1Id, :user2Id);
    ```

### Error Handling
- **Insufficient Credits**: Return a 403 error with a message to purchase credits or wait for reset.
- **Duplicate Swipe**: The `unique_swipe` constraint ensures no duplicates; handle `DO NOTHING` gracefully.
- **Invalid Profile**: Skip profiles that are inactive or deleted during the swipe process.
- **Database Errors**: Log errors, retry critical operations with exponential backoff, and notify the user if needed.

### Scalability Considerations
- **Batching**: Fetch 10-20 profiles at a time to reduce database load.
- **Caching**: Cache compatibility scores and user filters in Redis to minimize repeated queries.
- **Indexes**: Leverage `swipes_from_user_idx` and `swipes_to_user_idx` for fast swipe history checks.
- **Async Processing**: Use a message queue (e.g., RabbitMQ) for swipe insertions and match creation to handle high traffic.
- **Geospatial Optimization**: If using `GEOGRAPHY`, ensure PostGIS indexes (e.g., GIST index on `location`) are in place.

### Monitoring and Logging
- **Metrics**: Track swipe success rate, match rate, average compatibility score, and credit usage.
- **Logs**: Log swipe actions, errors, and match creations for debugging and analytics.
- **Alerts**: Set up alerts for high error rates, low credit balances, or slow query performance.

### Example Pseudo-Code
```typescript
async function generateOrderedSwipes(userId: string, batchSize: number = 10) {
  // Step 1: Validate credits
  const user = await db.select({ swipeCredits: users.swipeCredits, superLikes: users.superLikes })
    .from(users)
    .where(eq(users.id, userId))
    .get();
  if (user.swipeCredits <= 0) {
    throw new Error("No swipe credits available");
  }

  // Step 2: Fetch preferences
  const filters = await db.select()
    .from(userFilters)
    .where(eq(userFilters объяснить

System: Filters.userId)).get() || {};

  // Step 3 & 4: Fetch and score profiles
  const profiles = await db
    .select({
      id: users.id,
      name: users.name,
      age: users.age,
      bio: users.bio,
      location: users.location,
      verified: users.verified,
      isOnline: users.isOnline,
      lastSeen: users.lastSeen,
      likesReceived: users.likesReceived,
      profileViews: users.profileViews,
      photo: photos.url,
      sharedInterests: sql`CARDINALITY(${users.interests} & ${filters.interests})`,
    })
    .from(users)
    .leftJoin(photos, and(eq(photos.userId, users.id), eq(photos.isDefault, true)))
    .where(
      and(
        ne(users.id, userId),
        eq(users.isActive, true),
        eq(users.isDummyUser, false),
        eq(users.isTestUser, false),
        gte(users.age, filters.ageMin || 18),
        lte(users.age, filters.ageMax || 99),
        notExists(
          db.select()
            .from(swipes)
            .where(and(
              eq(swipes.fromUserId, userId),
              eq(swipes.toUserId, users.id),
              eq(swipes.status, 'active')
            ))
        ),
        or(
          eq(filters.interests, '[]'),
          sql`${users.interests} && ${filters.interests}`
        )
      )
    )
    .orderBy(
      sql`
        (0.4 * CARDINALITY(${users.interests} & ${filters.interests}) / GREATEST(CARDINALITY(${users.interests}), 1)) +
        (0.2 * (1 - ABS(${users.age} - ${user.age}) / GREATEST(${filters.ageMax - filters.ageMin}, 1))) +
        (0.1 * CASE WHEN ${users.verified} THEN 1 ELSE 0 END) +
        (0.1 * (1 - EXTRACT(EPOCH FROM (NOW() - ${users.lastSeen})) / (3600 * 168))) +
        (0.1 * ${users.likesReceived} / GREATEST((SELECT MAX(likes_received) FROM users), 1))
      `
    )
    .limit(batchSize);

  return profiles;
}

async function recordSwipe(userId: string, toUserId: string, action: 'like' | 'pass' | 'superlike', note?: string) {
  await db.transaction(async (tx) => {
    // Step 6: Insert swipe
    const swipe = await tx.insert(swipes)
      .values({
        fromUserId: userId,
        toUserId,
        action,
        note,
        status: 'active',
      })
      .onConflictDoNothing()
      .returning({ id: swipes.id })
      .get();

    if (!swipe) return; // Duplicate swipe, skip

    // Step 7: Update credits
    await tx.update(users)
      .set({
        swipeCredits: sql`${users.swipeCredits} - 1`,
        superLikes: action === 'superlike' ? sql`${users.superLikes} - 1` : users.superLikes,
      })
      .where(and(
        eq(users.id, userId),
        gt(users.swipeCredits, 0),
        or(action !== 'superlike', gt(users.superLikes, 0))
      ));

    // Handle like/superlike
    if (action === 'like' || action === 'superlike') {
      const like = await tx.insert(likes)
        .values({
          fromUserId: userId,
          toUserId,
          swipeId: swipe.id,
          superLike: action === 'superlike',
        })
        .returning({ id: likes.id })
        .get();

      // Check for match
      const reciprocalLike = await tx.select({ id: likes.id })
        .from(likes)
        .where(and(
          eq(likes.fromUserId, toUserId),
          eq(likes.toUserId, userId),
          exists(
            db.select()
              .from(swipes)
              .where(and(
                eq(swipes.id, likes.swipeId),
                eq(swipes.status, 'active')
              ))
          )
        ))
        .get();

      if (reciprocalLike) {
        const match = await tx.insert(matches)
          .values({
            user1Id: userId < toUserId ? userId : toUserId,
            user2Id: userId < toUserId ? toUserId : userId,
            like1Id: like.id,
            like2Id: reciprocalLike.id,
            matchedAt: new Date(),
          })
          .returning({ id: matches.id })
          .get();

        await tx.insert(conversations)
          .values({
            matchId: match.id,
            user1Id: userId < toUserId ? userId : toUserId,
            user2Id: userId < toUserId ? toUserId : userId,
            active: true,
          });

        await tx.update(users)
          .set({ matches: sql`${users.matches} + 1` })
          .where(inArray(users.id, [userId, toUserId]));
      }
    }
  });
}
```

## Summary
This workflow generates ordered swipes by scoring profiles based on compatibility (interests, age, distance, activity, etc.), filters out ineligible or previously swiped profiles, and ensures swipe limits are enforced. The `swipes` table’s constraints and indexes support efficient querying and prevent duplicates. The process is scalable with batching, caching, and async processing, ensuring a smooth user experience.