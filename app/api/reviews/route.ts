import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const reviewType = searchParams.get('type') || 'user';
    const field = searchParams.get('field');
    const rating = searchParams.get('rating');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('user_id');
    const checkExisting = searchParams.get('check_existing') === 'true';

    // Handle check for existing review
    if (checkExisting && userId) {
      const { data: existingReview, error: checkError } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', userId)
        .eq('review_type', reviewType)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing review:', checkError);
        return NextResponse.json(
          { error: 'Failed to check existing reviews' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        hasRated: !!existingReview
      });
    }

    let query = supabase
      .from('reviews')
      .select(`
        id,
        stars,
        review_text,
        field,
        created_at,
        user_id
      `)
      .eq('review_type', reviewType)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters if provided
    if (field && field !== 'All Fields') {
      query = query.eq('field', field);
    }

    if (rating && rating !== 'All Ratings') {
      const ratingValue = parseInt(rating.replace(' Stars', '').replace(' Star', ''));
      if (!isNaN(ratingValue)) {
        query = query.eq('stars', ratingValue);
      }
    }

    const { data: reviews, error } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // Get rating statistics
    const { data: stats, error: statsError } = await supabase
      .from('reviews')
      .select('stars')
      .eq('review_type', reviewType);

    if (statsError) {
      console.error('Error fetching review stats:', statsError);
      return NextResponse.json(
        { error: 'Failed to fetch review statistics' },
        { status: 500 }
      );
    }

    // Calculate rating distribution
    const ratingCounts = [1, 2, 3, 4, 5].map(rating => ({
      stars: rating,
      count: stats?.filter(s => s.stars === rating).length || 0
    }));

    const totalReviews = stats?.length || 0;
    const averageRating = totalReviews > 0 
      ? stats.reduce((sum, review) => sum + review.stars, 0) / totalReviews 
      : 0;

    return NextResponse.json({
      reviews: reviews || [],
      statistics: {
        ratings: ratingCounts,
        totalReviews,
        averageRating
      }
    });

  } catch (error) {
    console.error('Reviews API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reviewType, stars, reviewText, field } = body;

    // Validate required fields
    if (!reviewType || !stars || !field) {
      return NextResponse.json(
        { error: 'Missing required fields: reviewType, stars, and field are required' },
        { status: 400 }
      );
    }

    // Validate stars rating
    if (stars < 1 || stars > 5) {
      return NextResponse.json(
        { error: 'Stars must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate review type
    if (!['user', 'company'].includes(reviewType)) {
      return NextResponse.json(
        { error: 'Review type must be either "user" or "company"' },
        { status: 400 }
      );
    }

    // Check if user has already reviewed for this type
    const { data: existingReview, error: checkError } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('review_type', reviewType)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking existing review:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing reviews' },
        { status: 500 }
      );
    }

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already submitted a review for this category' },
        { status: 409 }
      );
    }

    // Insert new review
    const { data: newReview, error: insertError } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        review_type: reviewType,
        stars,
        review_text: reviewText || null,
        field
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting review:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit review' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Review submitted successfully',
      review: newReview
    });

  } catch (error) {
    console.error('Reviews POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}