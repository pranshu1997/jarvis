-- Jarvis System Seed Data (template - run per-user via seed function or app bootstrap)
-- Core categories
INSERT INTO categories (user_id, slug, name, icon, color, category_type, sort_order, is_system, base_xp) VALUES
(NULL, 'physical', 'Physical', 'dumbbell', '#00d4ff', 'core', 1, true, 15),
(NULL, 'mental', 'Mental', 'brain', '#a855f7', 'core', 2, true, 15),
(NULL, 'awareness', 'Awareness', 'eye', '#22d3ee', 'core', 3, true, 15),
(NULL, 'vitality', 'Vitality', 'heart-pulse', '#10b981', 'core', 4, true, 15);

-- Workout subcategories (under physical - linked via parent in app bootstrap)
INSERT INTO categories (user_id, slug, name, icon, color, category_type, sort_order, is_system, base_xp, metadata) VALUES
(NULL, 'workout', 'Workout', 'flame', '#00d4ff', 'workout', 10, true, 20, '{"parent_slug": "physical"}'),
(NULL, 'strength', 'Strength', 'shield', '#3b82f6', 'workout_branch', 11, true, 25, '{"parent_slug": "workout"}'),
(NULL, 'sports', 'Sports', 'trophy', '#f59e0b', 'workout_branch', 12, true, 20, '{"parent_slug": "workout"}'),
(NULL, 'endurance', 'Endurance', 'wind', '#06b6d4', 'workout_branch', 13, true, 20, '{"parent_slug": "workout"}'),
(NULL, 'flexibility_branch', 'Flexibility', 'stretch', '#8b5cf6', 'workout_branch', 14, true, 15, '{"parent_slug": "workout"}'),
(NULL, 'mobility_branch', 'Mobility', 'move', '#14b8a6', 'workout_branch', 15, true, 15, '{"parent_slug": "workout"}'),
(NULL, 'fighting', 'Fighting', 'swords', '#ef4444', 'workout_branch', 16, true, 25, '{"parent_slug": "workout"}');

-- Strength muscle groups
INSERT INTO categories (user_id, slug, name, icon, color, category_type, sort_order, is_system, metadata) VALUES
(NULL, 'chest', 'Chest', 'target', '#3b82f6', 'muscle_group', 20, true, '{"parent_slug": "strength"}'),
(NULL, 'back', 'Back', 'target', '#3b82f6', 'muscle_group', 21, true, '{"parent_slug": "strength"}'),
(NULL, 'legs', 'Legs', 'target', '#3b82f6', 'muscle_group', 22, true, '{"parent_slug": "strength"}'),
(NULL, 'shoulders', 'Shoulders', 'target', '#3b82f6', 'muscle_group', 23, true, '{"parent_slug": "strength"}'),
(NULL, 'arms', 'Arms', 'target', '#3b82f6', 'muscle_group', 24, true, '{"parent_slug": "strength"}'),
(NULL, 'core_muscle', 'Core', 'target', '#3b82f6', 'muscle_group', 25, true, '{"parent_slug": "strength"}');

-- Physical habits
INSERT INTO habits (user_id, slug, name, icon, base_xp, is_system, metadata) VALUES
(NULL, 'steps_5k', 'Steps 5k', 'footprints', 15, true, '{"category_slug": "physical", "target_value": 5000, "unit": "steps"}'),
(NULL, 'workout_habit', 'Workout', 'dumbbell', 25, true, '{"category_slug": "physical"}'),
(NULL, 'flexibility', 'Flexibility', 'stretch', 15, true, '{"category_slug": "physical"}'),
(NULL, 'sports_habit', 'Sports', 'trophy', 20, true, '{"category_slug": "physical"}'),
(NULL, 'fighting_habit', 'Fighting', 'swords', 25, true, '{"category_slug": "physical"}'),
(NULL, 'mobility', 'Mobility', 'move', 15, true, '{"category_slug": "physical"}');

-- Mental habits
INSERT INTO habits (user_id, slug, name, icon, base_xp, is_system, metadata) VALUES
(NULL, 'meditate', 'Meditate', 'flower-2', 15, true, '{"category_slug": "mental"}'),
(NULL, 'puzzles', 'Puzzles', 'puzzle', 10, true, '{"category_slug": "mental"}'),
(NULL, 'work', 'Work', 'briefcase', 20, true, '{"category_slug": "mental"}'),
(NULL, 'read', 'Read', 'book-open', 15, true, '{"category_slug": "mental"}'),
(NULL, 'upskill', 'Upskill', 'graduation-cap', 20, true, '{"category_slug": "mental"}'),
(NULL, 'poker', 'Poker', 'spade', 10, true, '{"category_slug": "mental"}'),
(NULL, 'news', 'News', 'newspaper', 10, true, '{"category_slug": "mental"}');

-- Awareness habits
INSERT INTO habits (user_id, slug, name, icon, base_xp, is_system, metadata) VALUES
(NULL, 'journal', 'Journal', 'notebook-pen', 15, true, '{"category_slug": "awareness"}'),
(NULL, 'diet_tracking', 'Diet Tracking', 'apple', 15, true, '{"category_slug": "awareness"}'),
(NULL, 'weight_tracking', 'Weight Tracking', 'scale', 10, true, '{"category_slug": "awareness"}');

-- Vitality habits
INSERT INTO habits (user_id, slug, name, icon, base_xp, is_system, metadata) VALUES
(NULL, 'supplements_habit', 'Supplements', 'pill', 10, true, '{"category_slug": "vitality"}'),
(NULL, 'follow_diet', 'Follow Diet', 'salad', 20, true, '{"category_slug": "vitality"}'),
(NULL, 'water_intake', 'Water Intake', 'droplets', 10, true, '{"category_slug": "vitality", "target_value": 8, "unit": "glasses"}'),
(NULL, 'dont_smoke', 'Don''t Smoke', 'ban', 25, true, '{"category_slug": "vitality"}'),
(NULL, 'sleep', 'Sleep', 'moon', 20, true, '{"category_slug": "vitality", "target_value": 7, "unit": "hours"}'),
(NULL, 'skincare', 'Skincare', 'sparkles', 10, true, '{"category_slug": "vitality"}'),
(NULL, 'haircare', 'Haircare', 'scissors', 10, true, '{"category_slug": "vitality"}'),
(NULL, 'beardcare', 'Beardcare', 'user', 10, true, '{"category_slug": "vitality"}');

-- Supplements
INSERT INTO supplements (user_id, slug, name, base_xp, is_system) VALUES
(NULL, 'protein', 'Protein', 5, true),
(NULL, 'creatine', 'Creatine', 5, true),
(NULL, 'fish_oil', 'Fish Oil', 5, true),
(NULL, 'magnesium', 'Magnesium Glycinate', 5, true),
(NULL, 'vitamin_d3', 'Vitamin D3 + Calcium', 5, true);

-- Exercises
INSERT INTO exercises (user_id, slug, name, muscle_group, base_xp, is_system, metadata) VALUES
(NULL, 'bench_press', 'Bench Press', 'chest', 25, true, '{"parent_slug": "chest"}'),
(NULL, 'squat', 'Squat', 'legs', 30, true, '{"parent_slug": "legs"}'),
(NULL, 'deadlift', 'Deadlift', 'back', 35, true, '{"parent_slug": "back"}'),
(NULL, 'pullups', 'Pullups', 'back', 20, true, '{"parent_slug": "back"}'),
(NULL, 'shoulder_press', 'Shoulder Press', 'shoulders', 20, true, '{"parent_slug": "shoulders"}'),
(NULL, 'leg_press', 'Leg Press', 'legs', 20, true, '{"parent_slug": "legs"}'),
(NULL, 'incline_bench', 'Incline Bench', 'chest', 20, true, '{"parent_slug": "chest"}'),
(NULL, 'barbell_row', 'Barbell Row', 'back', 20, true, '{"parent_slug": "back"}'),
(NULL, 'bicep_curl', 'Bicep Curl', 'arms', 15, true, '{"parent_slug": "arms"}'),
(NULL, 'tricep_pushdown', 'Tricep Pushdown', 'arms', 15, true, '{"parent_slug": "arms"}'),
(NULL, 'plank', 'Plank', 'core_muscle', 15, true, '{"parent_slug": "core_muscle"}');

-- System quests
INSERT INTO quests (user_id, slug, title, description, quest_type, xp_reward, is_system, metadata) VALUES
(NULL, 'complete_physical', 'Physical Dominion', 'Complete all physical habits today', 'daily', 75, true, '{"category_slug": "physical"}'),
(NULL, 'complete_mental', 'Mental Ascent', 'Complete all mental habits today', 'daily', 75, true, '{"category_slug": "mental"}'),
(NULL, 'complete_awareness', 'Awareness Protocol', 'Complete all awareness habits today', 'daily', 75, true, '{"category_slug": "awareness"}'),
(NULL, 'complete_vitality', 'Vitality Surge', 'Complete all vitality habits today', 'daily', 75, true, '{"category_slug": "vitality"}'),
(NULL, 'perfect_day', 'Perfect Day', 'Complete every habit across all categories', 'daily', 200, true, '{}'),
(NULL, 'sleep_streak_7', 'Sleep Guardian', 'Maintain a 7-day sleep streak', 'weekly', 150, true, '{"habit_slug": "sleep", "streak_days": 7}'),
(NULL, 'no_smoke_30', 'Smoke Free Monarch', '30 days without smoking', 'main', 500, true, '{"habit_slug": "dont_smoke", "streak_days": 30}'),
(NULL, 'read_10_books', 'Scholar''s Path', 'Read 10 books', 'main', 1000, true, '{"habit_slug": "read", "target_count": 10}'),
(NULL, 'deep_work_marathon', 'Deep Work Dungeon', '4 hours of focused work in one session', 'dungeon', 300, true, '{"habit_slug": "work", "duration_hours": 4}'),
(NULL, 'weekly_perfect', 'Flawless Week', 'Achieve 7 perfect days in a row', 'weekly', 500, true, '{}');

-- Achievements
INSERT INTO achievements (user_id, slug, title, description, icon, xp_reward, rarity, is_system) VALUES
(NULL, 'first_level', 'Awakening', 'Reach player level 2', 'zap', 50, 'common', true),
(NULL, 'streak_7', 'Week Warrior', 'Maintain any 7-day streak', 'flame', 100, 'uncommon', true),
(NULL, 'streak_30', 'Monthly Monarch', 'Maintain any 30-day streak', 'crown', 500, 'rare', true),
(NULL, 'rank_c', 'C-Rank Hunter', 'Achieve C Rank', 'shield', 200, 'uncommon', true),
(NULL, 'rank_s', 'S-Rank Elite', 'Achieve S Rank', 'star', 1000, 'legendary', true),
(NULL, 'perfect_week', 'Perfect Protocol', 'Complete a perfect week', 'sparkles', 300, 'rare', true);
