-- CreateTable
CREATE TABLE "DailyQuotes" (
    "id" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "author" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "DailyQuotes_pkey" PRIMARY KEY ("id")
);

-- Insert seed data for DailyQuotes
INSERT INTO "DailyQuotes" ("id", "quote", "author", "category", "userId") VALUES
  ('dq1', 'Its a great day for a great day!', NULL, 'motivation', NULL),
  ('dq2', 'Let''s get this bread!', NULL, 'hustle', NULL),
  ('dq3', 'Today is your opportunity to build the tomorrow you want.', NULL, 'opportunity', NULL),
  ('dq4', 'Coffee in hand, goals in mind, let''s make it happen!', NULL, 'energy', NULL),
  ('dq5', 'Progress over perfection - let''s ship something awesome today.', NULL, 'productivity', NULL),
  ('dq6', 'Another day, another chance to level up.', NULL, 'growth', NULL),
  ('dq7', 'The grind doesn''t stop, and neither do you!', NULL, 'hustle', NULL),
  ('dq8', 'Start where you are, use what you have, do what you can.', 'Arthur Ashe', 'action', NULL),
  ('dq9', 'Monday mindset: I am unstoppable today.', NULL, 'confidence', NULL),
  ('dq10', 'Turn your can''ts into cans and your dreams into plans.', NULL, 'transformation', NULL),
  ('dq11', 'Make today so good that yesterday gets jealous.', NULL, 'motivation', NULL),
  ('dq12', 'You don''t have to be extreme, just consistent.', NULL, 'consistency', NULL),
  ('dq13', 'Small steps every day = big change over time.', NULL, 'growth', NULL),
  ('dq14', 'Fuel up, focus up, and show up.', NULL, 'focus', NULL),
  ('dq15', 'Done is better than perfect—go get it!', NULL, 'productivity', NULL),
  ('dq16', 'Big energy only. Let''s go.', NULL, 'energy', NULL),
  ('dq17', 'You didn''t come this far to only come this far.', NULL, 'perseverance', NULL),
  ('dq18', 'Vibes high, distractions low.', NULL, 'focus', NULL),
  ('dq19', 'Wake up. Show up. Level up.', NULL, 'growth', NULL),
  ('dq20', 'Youre not behind—youre building.', NULL, 'mindset', NULL),
  ('dq21', 'Success is the sum of small efforts, repeated day in and day out.', 'Robert Collier', 'success', NULL),
  ('dq22', 'You miss 100% of the shots you don''t take.', 'Wayne Gretzky', 'risk', NULL),
  ('dq23', 'Action is the foundational key to all success.', 'Pablo Picasso', 'action', NULL),
  ('dq24', 'Believe you can and you''re halfway there.', 'Theodore Roosevelt', 'confidence', NULL),
  ('dq25', 'Discipline equals freedom.', 'Jocko Willink', 'discipline', NULL)
ON CONFLICT (id) DO NOTHING;