-- Add sample interview questions
-- Migration: add_sample_interview_questions.sql

INSERT INTO interview_questions (category, question_text, expected_duration_seconds, difficulty_level) VALUES
-- Background/Experience Questions
('background', 'Tell me about your background and what interests you about this internship opportunity.', 120, 'easy'),
('experience', 'What relevant experience do you have that would make you a good fit for this role?', 120, 'medium'),
('motivation', 'Why are you interested in this internship program, and what do you hope to gain from it?', 120, 'easy'),

-- Technical Questions
('technical', 'What technical skills do you have that would be relevant to this position?', 120, 'medium'),
('technical', 'Describe a project or problem you solved using your technical skills.', 180, 'hard'),

-- Behavioral Questions
('behavioral', 'Tell me about a time when you had to work with a difficult team member. How did you handle it?', 180, 'medium'),
('behavioral', 'Describe a situation where you had to learn something new quickly. How did you approach it?', 150, 'medium'),

-- Goals/Interests Questions
('goals', 'What are your career goals and how does this internship align with them?', 120, 'easy'),
('interests', 'What extracurricular activities or hobbies do you have that might be relevant to this role?', 120, 'easy'),
('goals', 'Where do you see yourself in 5 years, and how will this experience help you get there?', 150, 'medium'); 