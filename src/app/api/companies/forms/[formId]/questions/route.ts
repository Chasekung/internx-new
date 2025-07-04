import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

// This API route handles upserting, deleting, and reusing form questions for a specific form.
// It will support POST (create/update), DELETE (remove), and GET (fetch) operations.
// Question bank logic will also be handled here.

// POST: Upsert (create or update) questions for a form
export async function POST(request: NextRequest, { params }: { params: { formId: string } }) {
  try {
    const formId = params.formId;
    const body = await request.json();
    const { questions, deletedSectionIds, deletedQuestionIds } = body; // expects { questions: [...], deletedSectionIds: [...], deletedQuestionIds: [...] }
    if (!Array.isArray(questions)) {
      return NextResponse.json({ error: 'Questions must be an array' }, { status: 400 });
    }

    // Delete questions if any
    if (Array.isArray(deletedQuestionIds) && deletedQuestionIds.length > 0) {
      const { error: deleteQError } = await supabase
        .from('form_questions')
        .delete()
        .in('id', deletedQuestionIds);
      if (deleteQError) {
        return NextResponse.json({ error: 'Failed to delete questions', details: deleteQError.message }, { status: 500 });
      }
    }
    // Delete sections if any (will also cascade delete questions)
    if (Array.isArray(deletedSectionIds) && deletedSectionIds.length > 0) {
      const { error: deleteSError } = await supabase
        .from('form_sections')
        .delete()
        .in('id', deletedSectionIds);
      if (deleteSError) {
        return NextResponse.json({ error: 'Failed to delete sections', details: deleteSError.message }, { status: 500 });
      }
    }

    // Fetch all sections for the form (to validate section_id)
    const { data: sections, error: sectionError } = await supabase
      .from('form_sections')
      .select('id')
      .eq('form_id', formId);
    if (sectionError) {
      return NextResponse.json({ error: 'Failed to fetch form sections' }, { status: 500 });
    }
    const validSectionIds = new Set((sections || []).map(s => s.id));

    // Prepare upserts and question bank logic
    const upsertedQuestions = [];
    for (const q of questions) {
      // Validate section_id
      if (!q.section_id || !validSectionIds.has(q.section_id)) {
        return NextResponse.json({ error: `Invalid section_id for question: ${q.question_text}` }, { status: 400 });
      }
      // If new question, create in question_bank first
      let questionBankId = q.question_bank_id;
      if (!questionBankId) {
        // Insert into question_bank
        const { data: qb, error: qbError } = await supabase
          .from('question_bank')
          .insert({
            company_id: q.company_id,
            type: q.type,
            question_text: q.question_text,
            category: q.category || null,
            is_private: true,
            usage_count: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single();
        if (qbError) {
          return NextResponse.json({ error: 'Failed to create question bank entry' }, { status: 500 });
        }
        questionBankId = qb.id;
      }
      // Prepare upsert data for form_questions
      const upsertData = {
        id: q.id || undefined, // undefined for new
        section_id: q.section_id,
        question_bank_id: questionBankId,
        type: q.type,
        question_text: q.question_text,
        required: q.required || false,
        order_index: q.order_index,
        description: q.description || null,
        hint: q.hint || null,
        placeholder: q.placeholder || null,
        // Choices and dropdowns
        ...Object.fromEntries(
          Array.from({ length: 15 }, (_, i) => [
            `choice_${i + 1}`, q[`choice_${i + 1}`] || null
          ])
        ),
        ...Object.fromEntries(
          Array.from({ length: 50 }, (_, i) => [
            `dropdown_${i + 1}`, q[`dropdown_${i + 1}`] || null
          ])
        ),
        // Video uploads
        video_upload_1: q.video_upload_1 || null,
        video_upload_2: q.video_upload_2 || null,
        // File uploads
        upload_1: q.upload_1 || null,
        upload_2: q.upload_2 || null,
        upload_3: q.upload_3 || null,
        upload_4: q.upload_4 || null,
        upload_5: q.upload_5 || null,
        updated_at: new Date().toISOString(),
      };
      // Upsert into form_questions
      const { data: fq, error: fqError } = await supabase
        .from('form_questions')
        .upsert(upsertData, { onConflict: 'id' })
        .select()
        .single();
      if (fqError) {
        return NextResponse.json({ error: 'Failed to upsert form question', details: fqError.message }, { status: 500 });
      }
      upsertedQuestions.push(fq);
    }
    return NextResponse.json({ success: true, questions: upsertedQuestions });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
}

// DELETE: Remove questions from a form
export async function DELETE(request: NextRequest, { params }: { params: { formId: string } }) {
  try {
    const body = await request.json();
    const { questionIds } = body; // expects { questionIds: [...] }
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json({ error: 'questionIds must be a non-empty array' }, { status: 400 });
    }
    // Delete questions from form_questions
    const { error: deleteError } = await supabase
      .from('form_questions')
      .delete()
      .in('id', questionIds);
    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete questions', details: deleteError.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, deleted: questionIds });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
}

// GET: Fetch all questions for a form
export async function GET(request: NextRequest, { params }: { params: { formId: string } }) {
  try {
    const formId = params.formId;
    // Fetch all sections for the form
    const { data: sections, error: sectionError } = await supabase
      .from('form_sections')
      .select('id, title, description, order_index')
      .eq('form_id', formId)
      .order('order_index', { ascending: true });
    if (sectionError) {
      return NextResponse.json({ error: 'Failed to fetch form sections' }, { status: 500 });
    }
    // Fetch all questions for these sections
    const sectionIds = (sections || []).map(s => s.id);
    if (sectionIds.length === 0) {
      return NextResponse.json({ sections: [] });
    }
    const { data: questions, error: questionsError } = await supabase
      .from('form_questions')
      .select('*')
      .in('section_id', sectionIds)
      .order('order_index', { ascending: true });
    if (questionsError) {
      return NextResponse.json({ error: 'Failed to fetch form questions' }, { status: 500 });
    }
    // Group questions by section
    const sectionMap: Record<string, any> = {};
    for (const section of sections) {
      sectionMap[section.id] = { ...section, questions: [] };
    }
    for (const q of questions) {
      if (sectionMap[q.section_id]) {
        sectionMap[q.section_id].questions.push(q);
      }
    }
    const result = Object.values(sectionMap);
    return NextResponse.json({ sections: result });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
} 