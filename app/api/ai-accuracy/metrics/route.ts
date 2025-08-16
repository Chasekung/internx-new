import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const category = searchParams.get('category');

    // Get accuracy metrics for the specified period
    const { data: metrics, error: metricsError } = await supabase
      .from('ai_accuracy_metrics')
      .select('*')
      .gte('metric_date', new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('metric_date', { ascending: true });

    if (metricsError) {
      console.error('Error fetching metrics:', metricsError);
      return NextResponse.json({ 
        error: 'Failed to fetch metrics' 
      }, { status: 500 });
    }

    // Get recent validations for detailed analysis
    const { data: recentValidations, error: validationsError } = await supabase
      .from('ai_accuracy_validation')
      .select(`
        *,
        intern:interns(full_name, email),
        validator:auth.users(email)
      `)
      .gte('created_at', new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (validationsError) {
      console.error('Error fetching validations:', validationsError);
      return NextResponse.json({ 
        error: 'Failed to fetch validations' 
      }, { status: 500 });
    }

    // Calculate summary statistics
    const totalValidations = recentValidations?.length || 0;
    const accuratePredictions = recentValidations?.filter(v => 
      v.confidence_difference && v.confidence_difference <= 10
    ).length || 0;
    
    const overallAccuracy = totalValidations > 0 
      ? Math.round((accuratePredictions / totalValidations) * 100) 
      : 0;

    // Calculate category-specific accuracy
    const categoryAccuracy = {};
    if (recentValidations) {
      const categories = ['business_finance', 'technology_engineering', 'education_nonprofit', 'healthcare_sciences', 'creative_media'];
      
      categories.forEach(cat => {
        const categoryValidations = recentValidations.filter(v => v.category === cat);
        const categoryTotal = categoryValidations.length;
        const categoryAccurate = categoryValidations.filter(v => 
          v.confidence_difference && v.confidence_difference <= 10
        ).length;
        
        categoryAccuracy[cat] = {
          total: categoryTotal,
          accurate: categoryAccurate,
          accuracy: categoryTotal > 0 ? Math.round((categoryAccurate / categoryTotal) * 100) : 0,
          averageDifference: categoryValidations.length > 0 
            ? Math.round(categoryValidations.reduce((sum, v) => sum + (v.confidence_difference || 0), 0) / categoryValidations.length)
            : 0
        };
      });
    }

    // Calculate score type accuracy
    const scoreTypeAccuracy = {};
    if (recentValidations) {
      const scoreTypes = ['skill', 'experience', 'personality', 'overall'];
      
      scoreTypes.forEach(type => {
        const typeValidations = recentValidations.filter(v => v.score_type === type);
        const typeTotal = typeValidations.length;
        const typeAccurate = typeValidations.filter(v => 
          v.confidence_difference && v.confidence_difference <= 10
        ).length;
        
        scoreTypeAccuracy[type] = {
          total: typeTotal,
          accurate: typeAccurate,
          accuracy: typeTotal > 0 ? Math.round((typeAccurate / typeTotal) * 100) : 0
        };
      });
    }

    // Calculate trend data
    const trendData = metrics?.map(metric => ({
      date: metric.metric_date,
      accuracy: metric.accuracy_percentage,
      totalValidations: metric.total_validations,
      averageDifference: metric.average_confidence_difference
    })) || [];

    // Get feedback ratings
    const { data: feedback, error: feedbackError } = await supabase
      .from('ai_feedback')
      .select('*')
      .gte('created_at', new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString());

    if (feedbackError) {
      console.error('Error fetching feedback:', feedbackError);
    }

    const feedbackStats = feedback ? {
      total: feedback.length,
      averageRating: feedback.length > 0 
        ? Math.round(feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length * 10) / 10
        : 0,
      ratingDistribution: {
        1: feedback.filter(f => f.rating === 1).length,
        2: feedback.filter(f => f.rating === 2).length,
        3: feedback.filter(f => f.rating === 3).length,
        4: feedback.filter(f => f.rating === 4).length,
        5: feedback.filter(f => f.rating === 5).length
      }
    } : null;

    return NextResponse.json({
      success: true,
      metrics: {
        period: `${period} days`,
        overall: {
          totalValidations,
          accuratePredictions,
          accuracy: overallAccuracy,
          averageDifference: metrics.length > 0 
            ? Math.round(metrics.reduce((sum, m) => sum + (m.average_confidence_difference || 0), 0) / metrics.length)
            : 0
        },
        categoryAccuracy,
        scoreTypeAccuracy,
        trendData,
        feedbackStats
      }
    });

  } catch (error) {
    console.error('Error fetching AI accuracy metrics:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 