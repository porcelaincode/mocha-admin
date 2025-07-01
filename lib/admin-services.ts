/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { createClient } from './supabase/client';
import { s3Service } from './s3';

// S3 Upload utility function
async function downloadAndUploadImage(imageUrl: string, userId: string, photoIndex: number) {
  try {
    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Extract file extension from URL or content type
    let extension = 'jpg';
    if (contentType.includes('png')) extension = 'png';
    else if (contentType.includes('gif')) extension = 'gif';
    else if (contentType.includes('webp')) extension = 'webp';
    
    // Generate S3 key using the existing S3 service
    const fileName = `photo_${photoIndex}.${extension}`;
    const s3Key = s3Service.generatePhotoKey(`bulk_upload_${Date.now()}`, fileName, userId);
    const originalName = `photo_${photoIndex}.${extension}`;

    // Upload to S3 using the existing service
    const uploadResult = await s3Service.uploadFile(
      s3Key,
      Buffer.from(imageBuffer),
      contentType,
      {
        userId,
        photoIndex: photoIndex.toString(),
        uploadType: 'bulk_upload'
      }
    );

    if (!uploadResult.success) {
      throw new Error(`Failed to upload to S3: ${uploadResult.error}`);
    }

    return {
      s3Key,
      cdnUrl: uploadResult.url!, // CloudFront URL from S3 service
      originalName,
      mimeType: contentType,
      size: imageBuffer.byteLength
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

// Dashboard Stats Service with Month-over-Month Analytics
export async function getDashboardStats() {
  const supabase = createClient();
  
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    
    // Current month stats
    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: newUsersThisMonth },
      { count: totalMatches },
      { count: totalMessages },
      { count: verifiedUsers },
      { data: subscriptions }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true })
        .or('isOnline.eq.true,lastSeen.gte.' + new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('users').select('*', { count: 'exact', head: true })
        .gte('created_at', startOfThisMonth.toISOString()),
      supabase.from('matches').select('*', { count: 'exact', head: true }).eq('active', true),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('verified', true),
              supabase.from('subscriptions').select('recurring_price')
          .gte('renews_at', new Date().toISOString())
    ]);

    // Last month stats for comparison
    const [
      { count: totalUsersLastMonth },
      { count: newUsersLastMonth },
      { count: totalMatchesLastMonth },
      { count: totalMessagesLastMonth },
      { count: verifiedUsersLastMonth },
      { data: subscriptionsLastMonth }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true })
        .lte('createdAt', endOfLastMonth.toISOString()),
              supabase.from('users').select('*', { count: 'exact', head: true })
          .gte('created_at', startOfLastMonth.toISOString())
          .lte('created_at', endOfLastMonth.toISOString()),
      supabase.from('matches').select('*', { count: 'exact', head: true })
        .eq('active', true)
        .lte('matched_at', endOfLastMonth.toISOString()),
              supabase.from('messages').select('*', { count: 'exact', head: true })
          .lte('created_at', endOfLastMonth.toISOString()),
              supabase.from('users').select('*', { count: 'exact', head: true })
          .eq('verified', true)
          .lte('created_at', endOfLastMonth.toISOString()),
              supabase.from('subscriptions').select('recurring_price')
          .gte('renews_at', startOfLastMonth.toISOString())
          .lte('renews_at', endOfLastMonth.toISOString())
    ]);

    // Calculate current values
    const currentRevenue = subscriptions?.reduce((sum, sub) => sum + (sub.recurring_price || 0), 0) || 0;
    const lastMonthRevenue = subscriptionsLastMonth?.reduce((sum, sub) => sum + (sub.recurring_price || 0), 0) || 0;

    // Get new users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: newUsersToday } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Calculate percentage changes
    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      newUsersToday: newUsersToday || 0,
      totalMatches: totalMatches || 0,
      messagesExchanged: totalMessages || 0,
      revenue: Math.round(currentRevenue),
      verifiedUsers: verifiedUsers || 0,
      conversionRate: totalUsers ? ((subscriptions?.length || 0) / totalUsers * 100) : 0,
      // Month-over-month changes
      changes: {
        totalUsers: calculatePercentageChange(totalUsers || 0, totalUsersLastMonth || 0),
        activeUsers: calculatePercentageChange(activeUsers || 0, totalUsersLastMonth || 0), // Approximation
        newUsers: calculatePercentageChange(newUsersThisMonth || 0, newUsersLastMonth || 0),
        totalMatches: calculatePercentageChange(totalMatches || 0, totalMatchesLastMonth || 0),
        messagesExchanged: calculatePercentageChange(totalMessages || 0, totalMessagesLastMonth || 0),
        revenue: calculatePercentageChange(currentRevenue, lastMonthRevenue),
        verifiedUsers: calculatePercentageChange(verifiedUsers || 0, verifiedUsersLastMonth || 0),
        conversionRate: calculatePercentageChange(
          totalUsers ? ((subscriptions?.length || 0) / totalUsers * 100) : 0,
          totalUsersLastMonth ? ((subscriptionsLastMonth?.length || 0) / totalUsersLastMonth * 100) : 0
        )
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      newUsersToday: 0,
      totalMatches: 0,
      messagesExchanged: 0,
      revenue: 0,
      verifiedUsers: 0,
      conversionRate: 0,
      changes: {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        totalMatches: 0,
        messagesExchanged: 0,
        revenue: 0,
        verifiedUsers: 0,
        conversionRate: 0
      }
    };
  }
}

// Users Service
export async function getUsers(page = 1, limit = 50, filters: {
  search?: string;
  status?: string;
  subscription?: string;
  verified?: string;
  userType?: string;
} = {}) {
  const supabase = createClient();
  
  try {

    
    // Start with a simple query to test basic functionality
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // Apply filters to query
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    if (filters.verified === 'verified') {
      query = query.eq('verified', true);
    } else if (filters.verified === 'unverified') {
      query = query.eq('verified', false);
    }

    if (filters.userType === 'test') {
      query = query.eq('is_test_user', true);
    } else if (filters.userType === 'dummy') {
      query = query.eq('is_dummy_user', true);
    } else if (filters.userType === 'regular') {
      query = query.eq('is_test_user', false).eq('is_dummy_user', false);
    }

    const { data: users, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return {
        users: [],
        total: 0,
        page,
        limit
      };
    }

    // Transform data to match the expected format
    const transformedUsers = users?.map(user => ({
      id: user.id,
      name: user.name || 'Unknown',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      age: user.age || 0,
      location: user.location || '',
      latitude: user.latitude || null,
      longitude: user.longitude || null,
      verified: user.verified || false,
      isOnline: user.isOnline || false,
      lastSeen: user.lastSeen ? new Date(user.lastSeen).toLocaleString() : 'Never',
      createdAt: user.created_at ? new Date(user.created_at).toLocaleDateString() : '',
      subscription: 'basic', // Default to basic since we're not fetching subscriptions here
      matches: user.matches || 0,
      messages: 0, // Would need a separate query to count messages
      profileViews: user.profile_views || 0,
      photos: 0, // Not fetching photos in this simplified query
      bio: user.bio || '',
      interests: user.interests || [],
      isTestUser: user.is_test_user || false,
      isDummyUser: user.is_dummy_user || false,
      status: 'active' // You might want to add a status field to your schema
    })) || [];

    return {
      users: transformedUsers,
      total: count || 0,
      page,
      limit
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      users: [],
      total: 0,
      page,
      limit
    };
  }
}

// Get single user with full details
export async function getUserById(userId: string) {
  const supabase = createClient();
  
  try {
    // First get the user data without relations
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    if (!user) {
      throw new Error('User not found');
    }

    // Get subscription data in a separate query
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('active_plan, renews_at, recurring_price, currency')
      .eq('user_id', userId);
      
          // Get photos in a separate query
      const { data: photos, error: photosError } = await supabase
        .from('photos')
        .select('id, url, is_default, media_type, s3_key, original_name, mime_type, size, duration, "order", created_at')
        .eq('user_id', userId)
        .order('order', { ascending: true });

    if (photosError) {
      console.error('Error fetching photos:', photosError);
    }

          // Get message count for this user
      const { count: messageCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', userId);

    // Transform data to match the expected format
    const transformedUser = {
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      age: user.age || 0,
      location: user.location || '',
      latitude: user.latitude || null,
      longitude: user.longitude || null,
      bio: user.bio || '',
      verified: user.verified || false,
      isOnline: user.isOnline || false,
      lastSeen: user.lastSeen ? new Date(user.lastSeen).toLocaleString() : 'Never',
      createdAt: user.created_at ? new Date(user.created_at).toLocaleDateString() : '',
      updatedAt: user.updated_at ? new Date(user.updated_at).toLocaleString() : '',
      lastLoginAt: user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never',
      
      // Stats
      matches: user.matches || 0,
      messages: messageCount || 0,
      profileViews: user.profile_views || 0,
      likesReceived: user.likes_received || 0,
      likesSent: user.likes_sent || 0,
      superLikes: user.super_likes || 0,
      
      // Credits
      likesCredits: user.likes_credits || 0,
      notesCredits: user.notes_credits || 0,
      chatRequestCredits: user.chat_request_credits || 0,
      
      // Subscription
      subscription: subscriptions?.[0]?.active_plan || 'basic',
      subscriptionDetails: subscriptions?.[0] || null,
      
      // Profile data
      interests: user.interests || [],
      preferences: user.preferences || {},
      isAdultModeEnabled: user.is_adult_mode_enabled || false,
      
      // Adult profile fields (only if adult mode is enabled)
      seductionStyle: user.seduction_style,
      flameLevel: user.flame_level,
      fantasyTrigger: user.fantasy_trigger,
      powerPlayPreference: user.power_play_preference,
      topTurnOn: user.top_turn_on,
      kinkScore: user.kink_score,
      idealSetting: user.ideal_setting,
      encounterFrequency: user.encounter_frequency,
      afterPassionUnwind: user.after_passion_unwind,
      spicyMediaComfort: user.spicy_media_comfort,
      consentImportance: user.consent_importance,
      midnightCraving: user.midnight_craving,
      riskTolerance: user.risk_tolerance,
      distancePreference: user.distance_preference,
      
      // Transform photos using existing URL field
      photos: photos?.map((photo: any) => ({
        id: photo.id,
        url: photo.url, // Use the fully constructed URL from database
        s3Key: photo.s3_key,
        originalName: photo.original_name,
        mimeType: photo.mime_type,
        mediaType: photo.media_type,
        isDefault: photo.is_default,
        size: photo.size,
        duration: photo.duration,
        order: photo.order,
        createdAt: photo.created_at
      })) || [],
      profilePhotos: photos?.filter((photo: any) => photo.media_type === 'image' || photo.media_type === 'profile')
        .map((photo: any) => ({
          id: photo.id,
          url: photo.url, // Use the fully constructed URL from database
          s3Key: photo.s3_key,
          originalName: photo.original_name,
          mimeType: photo.mime_type,
          mediaType: photo.media_type,
          isDefault: photo.is_default,
          size: photo.size,
          duration: photo.duration,
          order: photo.order,
          createdAt: photo.created_at
        })) || [],
      onboardingPhotos: photos?.filter((photo: any) => photo.media_type === 'onboarding')
        .map((photo: any) => ({
          id: photo.id,
          url: photo.url, // Use the fully constructed URL from database
          s3Key: photo.s3_key,
          originalName: photo.original_name,
          mimeType: photo.mime_type,
          mediaType: photo.media_type,
          isDefault: photo.is_default,
          size: photo.size,
          duration: photo.duration,
          order: photo.order,
          createdAt: photo.createdAt
        })) || [],
      
      // Meta fields
      isTestUser: user.is_test_user || false,
      isDummyUser: user.is_dummy_user || false,
      
      status: 'active' // You might want to add a status field to your schema
    };

    return transformedUser;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// Update user function
export async function updateUser(userId: string, updates: any) {
  const supabase = createClient();
  
  try {
    // Separate photos from other updates
    const { photos, ...userUpdates } = updates;
    
    // Update user data
    const { data, error } = await supabase
      .from('users')
      .update({
        ...userUpdates,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // Handle photo updates if provided
    if (photos && Array.isArray(photos)) {
      // First, delete existing photos for this user
      const { error: deleteError } = await supabase
        .from('photos')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error deleting existing photos:', deleteError);
        // Continue with photo insertion even if deletion fails
      }

      // Insert new photos
      if (photos.length > 0) {
        const photoInserts = photos.map((photo: any, index: number) => ({
          user_id: userId,
          url: photo.url,
          s3_key: photo.s3Key || '',
          original_name: photo.originalName || `photo_${index + 1}`,
          mime_type: 'image/jpeg', // Default, could be improved
          media_type: 'image',
          size: 0, // Would need to be provided or calculated
          order: photo.order || index + 1,
          is_default: index === 0, // First photo is default
          created_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
          .from('photos')
          .insert(photoInserts);

        if (insertError) {
          console.error('Error inserting photos:', insertError);
          throw new Error('Failed to update photos');
        }
      }
    }

    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Delete user function
export async function deleteUser(userId: string) {
  const supabase = createClient();
  
  try {
    // First, get user's photos to delete from S3
    const { data: photos } = await supabase
      .from('photos')
      .select('s3_key')
      .eq('user_id', userId);

    // Delete photos from S3 if any exist
    if (photos && photos.length > 0) {
      try {
        for (const photo of photos) {
          if (photo.s3_key) {
            await s3Service.deleteFile(photo.s3_key);
          }
        }
      } catch (s3Error) {
        console.warn('Some photos could not be deleted from S3:', s3Error);
        // Continue with user deletion even if S3 cleanup fails
      }
    }

    // Delete the user (cascade deletes will handle related records)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Matches Service
export async function getMatches(page = 1, limit = 50, filters: {
  search?: string;
  status?: string;
} = {}) {
  const supabase = createClient();
  
  try {
    let query = supabase
      .from('matches')
      .select(`
        *,
        user1:user1_id(id, name, age, location, photos(url, is_default)),
        user2:user2_id(id, name, age, location, photos(url, is_default)),
        conversations(messages(id))
      `)
      .eq('active', true)
      .order('matched_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (filters.search) {
      // This is a simplified search - you might want to use a more sophisticated approach
      query = query.or(`user1.name.ilike.%${filters.search}%,user2.name.ilike.%${filters.search}%`);
    }

    const { data: matches, error, count } = await query;

    if (error) throw error;

    const transformedMatches = matches?.map(match => ({
      id: match.id,
      user1: {
        id: match.user1?.id || '',
        name: match.user1?.name || 'Unknown',
        age: match.user1?.age || 0,
        location: match.user1?.location || '',
        avatar: match.user1?.name?.toLowerCase().replace(' ', '') || 'user'
      },
      user2: {
        id: match.user2?.id || '',
        name: match.user2?.name || 'Unknown',
        age: match.user2?.age || 0,
        location: match.user2?.location || '',
        avatar: match.user2?.name?.toLowerCase().replace(' ', '') || 'user'
      },
      matchedAt: match.matched_at,
      lastActivity: match.last_activity,
      messagesCount: match.conversations?.[0]?.messages?.length || 0,
      status: match.active ? 'active' : 'inactive',
      compatibility: 85, // You might want to calculate this based on interests/preferences
      mutualInterests: [] // Would need to calculate based on user interests
    })) || [];

    return {
      matches: transformedMatches,
      total: count || 0,
      page,
      limit
    };
  } catch (error) {
    console.error('Error fetching matches:', error);
    return {
      matches: [],
      total: 0,
      page,
      limit
    };
  }
}

// Enhanced Subscriptions Service
export async function getSubscriptions(page = 1, limit = 50, filters: {
  search?: string;
  plan?: string;
  status?: string;
} = {}) {
  const supabase = createClient();
  
  try {
    let query = supabase
      .from('subscriptions')
      .select(`
        *,
        user:user_id(id, name, email, phoneNumber)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (filters.search) {
      query = query.or(`user.name.ilike.%${filters.search}%,user.email.ilike.%${filters.search}%`);
    }

    if (filters.plan && filters.plan !== 'all') {
      query = query.eq('active_plan', filters.plan);
    }

    const { data: subscriptions, error, count } = await query;

    console.log(subscriptions);
    console.log(error);
    console.log(count);

    if (error) throw error;

    const transformedSubscriptions = subscriptions?.map(sub => {
      const isActive = new Date(sub.renews_at) > new Date();
      const daysUntilRenewal = Math.ceil((new Date(sub.renews_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: sub.id,
        user: {
          id: sub.user?.id || '',
          name: sub.user?.name || 'Unknown',
          email: sub.user?.email || '',
          phoneNumber: sub.user?.phoneNumber || '',
          avatar: sub.user?.name?.toLowerCase().replace(' ', '') || 'user'
        },
        plan: sub.active_plan,
        status: isActive ? 'active' : 'expired',
        price: sub.recurring_price,
        currency: sub.currency,
        startDate: sub.created_at,
        renewsAt: sub.renews_at,
        daysUntilRenewal: isActive ? Math.max(0, daysUntilRenewal) : 0,
        billingCycle: 'monthly', // You might want to add this to your schema
        metadata: sub.metadata,
        createdAt: sub.created_at,
        updatedAt: sub.updated_at
      };
    }) || [];

    return {
      subscriptions: transformedSubscriptions,
      total: count || 0,
      page,
      limit
    };
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return {
      subscriptions: [],
      total: 0,
      page,
      limit
    };
  }
}

// Analytics Service
export async function getAnalytics() {
  const supabase = createClient();
  
  try {
    // Get user growth data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Note: RPC functions might not work with client-side, so we'll use a simpler approach
    // const { data: userGrowthData, error: userGrowthError } = await supabase
    //   .rpc('get_user_growth_by_month', { start_date: sixMonthsAgo.toISOString() });

    // Get engagement metrics
    const { count: dailyActiveUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('lastSeen', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const { count: weeklyActiveUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('lastSeen', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const { count: monthlyActiveUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('lastSeen', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // Get today's messages and matches
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: todayMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    const { count: todayMatches } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .gte('matched_at', today.toISOString());

    // Get subscription distribution
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('active_plan')
      .gte('renews_at', new Date().toISOString());

    const subscriptionCounts = subscriptionData?.reduce((acc: any, sub) => {
      acc[sub.active_plan] = (acc[sub.active_plan] || 0) + 1;
      return acc;
    }, {}) || {};

    const totalActiveSubscriptions = Object.values(subscriptionCounts).reduce((sum: number, count: any) => sum + count, 0) as number;

    return {
      userGrowth: [], // Would need to implement this differently for client-side
      engagement: {
        dailyActiveUsers: dailyActiveUsers || 0,
        weeklyActiveUsers: weeklyActiveUsers || 0,
        monthlyActiveUsers: monthlyActiveUsers || 0,
        averageSessionTime: "12m 34s", // Would need session tracking
        messagesPerDay: todayMessages || 0,
        matchesPerDay: todayMatches || 0,
        profileViews: 0 // Would need view tracking
      },
      subscriptions: {
        basic: {
          count: subscriptionCounts.basic || 0,
          percentage: totalActiveSubscriptions ? (subscriptionCounts.basic || 0) / totalActiveSubscriptions * 100 : 0
        },
        premium: {
          count: subscriptionCounts.premium || 0,
          percentage: totalActiveSubscriptions ? (subscriptionCounts.premium || 0) / totalActiveSubscriptions * 100 : 0
        },
        platinum: {
          count: subscriptionCounts.platinum || 0,
          percentage: totalActiveSubscriptions ? (subscriptionCounts.platinum || 0) / totalActiveSubscriptions * 100 : 0
        }
      }
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      userGrowth: [],
      engagement: {
        dailyActiveUsers: 0,
        weeklyActiveUsers: 0,
        monthlyActiveUsers: 0,
        averageSessionTime: "0m 0s",
        messagesPerDay: 0,
        matchesPerDay: 0,
        profileViews: 0
      },
      subscriptions: {
        basic: { count: 0, percentage: 0 },
        premium: { count: 0, percentage: 0 },
        platinum: { count: 0, percentage: 0 }
      }
    };
  }
}

// Messages Service
export async function getMessages(page = 1, limit = 50, filters: {
  search?: string;
  conversationId?: string;
  status?: string;
  messageType?: string;
} = {}) {
  const supabase = createClient();
  
  try {
    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, name, email),
        conversation:conversation_id(
          id,
          match:match_id(
            user1:user1_id(id, name),
            user2:user2_id(id, name)
          )
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (filters.search) {
      query = query.ilike('content', `%${filters.search}%`);
    }

    if (filters.conversationId) {
      query = query.eq('conversation_id', filters.conversationId);
    }

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.messageType && filters.messageType !== 'all') {
      query = query.eq('message_type', filters.messageType);
    }

    const { data: messages, error, count } = await query;

    if (error) throw error;

    const transformedMessages = messages?.map(message => ({
      id: message.id,
      content: message.content,
      messageType: message.message_type || 'text',
      status: message.status || 'sent',
      createdAt: message.created_at,
      updatedAt: message.updated_at,
      replyToId: message.reply_to_id,
      sender: {
        id: message.sender?.id || '',
        name: message.sender?.name || 'Unknown',
        email: message.sender?.email || ''
      },
      conversation: {
        id: message.conversation?.id || '',
        participants: [
          message.conversation?.match?.user1?.name || 'Unknown',
          message.conversation?.match?.user2?.name || 'Unknown'
        ]
      }
    })) || [];

    return {
      messages: transformedMessages,
      total: count || 0,
      page,
      limit
    };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return {
      messages: [],
      total: 0,
      page,
      limit
    };
  }
}

// Photos/Media Service
export async function getPhotos(page = 1, limit = 50, filters: {
  search?: string;
  mediaType?: string;
  userId?: string;
} = {}) {
  const supabase = createClient();
  
  try {
    let query = supabase
      .from('photos')
      .select(`
        *,
        user:user_id(id, name, email, verified)
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (filters.mediaType && filters.mediaType !== 'all') {
      query = query.eq('mediaType', filters.mediaType);
    }

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters.search) {
      query = query.or(`user.name.ilike.%${filters.search}%,user.email.ilike.%${filters.search}%`);
    }

    const { data: photos, error, count } = await query;

    if (error) throw error;

    const transformedPhotos = photos?.map(photo => ({
      id: photo.id,
      url: photo.url,
      s3Key: photo.s3_key,
      originalName: photo.original_name,
      mimeType: photo.mime_type,
      size: photo.size,
      mediaType: photo.media_type || 'image',
      duration: photo.duration,
      order: photo.order,
      isDefault: photo.is_default,
      createdAt: photo.created_at,
      user: {
        id: photo.user?.id || '',
        name: photo.user?.name || 'Unknown',
        email: photo.user?.email || '',
        verified: photo.user?.verified || false
      }
    })) || [];

    return {
      photos: transformedPhotos,
      total: count || 0,
      page,
      limit
    };
  } catch (error) {
    console.error('Error fetching photos:', error);
    return {
      photos: [],
      total: 0,
      page,
      limit
    };
  }
}

// Reports Service (you might need to create a reports table)
export async function getReports(page = 1, limit = 50, filters: {
  search?: string;
  status?: string;
  type?: string;
} = {}) {
  // For now, return mock data since reports table might not exist
  // You would implement this when you add a reports table to your schema
  
  try {
    // Mock reports data - replace with real database query when reports table exists
    const mockReports = [
      {
        id: '1',
        type: 'inappropriate_content',
        status: 'pending',
        reportedUser: { id: '1', name: 'John Doe', email: 'john@example.com' },
        reportingUser: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
        reason: 'Inappropriate photos',
        description: 'User uploaded inappropriate content',
        createdAt: new Date().toISOString(),
        reviewedAt: null,
        reviewedBy: null
      }
    ];

    return {
      reports: mockReports,
      total: mockReports.length,
      page,
      limit
    };
  } catch (error) {
    console.error('Error fetching reports:', error);
    return {
      reports: [],
      total: 0,
      page,
      limit
    };
  }
}

// Notifications Service (you might need to create a notifications table)
export async function getNotifications(page = 1, limit = 50, filters: {
  search?: string;
  status?: string;
  type?: string;
} = {}) {
  // For now, return mock data since notifications table might not exist
  // You would implement this when you add a notifications table to your schema
  
  try {
    // Mock notifications data - replace with real database query when notifications table exists
    const mockNotifications = [
      {
        id: '1',
        type: 'system',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight',
        status: 'sent',
        recipients: 'all_users',
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    ];

    return {
      notifications: mockNotifications,
      total: mockNotifications.length,
      page,
      limit
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return {
      notifications: [],
      total: 0,
      page,
      limit
    };
  }
}

// Recent Activity Service
export async function getRecentActivity(limit = 10) {
  const supabase = createClient();
  
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get recent user signups
    const { data: recentSignups } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .gte('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    // Get recent matches
    const { data: recentMatches } = await supabase
      .from('matches')
      .select(`
        id, matched_at,
        user1:user1_id(name),
        user2:user2_id(name)
      `)
      .gte('matched_at', oneDayAgo.toISOString())
      .order('matched_at', { ascending: false })
      .limit(5);

    // Get recent subscriptions
    const { data: recentSubscriptions } = await supabase
      .from('subscriptions')
      .select(`
        id, active_plan, created_at,
        user:user_id(name)
      `)
      .gte('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(3);

    // Get recent message activity (high volume periods)
    const { count: recentMessageCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(now.getTime() - 60 * 60 * 1000).toISOString()); // Last hour

    const activities = [];

    // Add user signups
    recentSignups?.forEach(user => {
      activities.push({
        id: `signup-${user.id}`,
        type: 'user_signup',
        message: 'New user registered',
        time: getTimeAgo(user.created_at),
        user: user.name || user.email || 'Unknown User',
        timestamp: new Date(user.created_at)
      });
    });

    // Add matches
    recentMatches?.forEach((match: any) => {
      activities.push({
        id: `match-${match.id}`,
        type: 'match',
        message: 'New match created',
        time: getTimeAgo(match.matched_at),
        user: `${match.user1?.name || 'User'} & ${match.user2?.name || 'User'}`,
        timestamp: new Date(match.matched_at)
      });
    });

    // Add subscriptions
    recentSubscriptions?.forEach((sub: any) => {
      activities.push({
        id: `subscription-${sub.id}`,
        type: 'subscription',
        message: `${sub.active_plan} subscription activated`,
        time: getTimeAgo(sub.created_at),
        user: sub.user?.name || 'Unknown User',
        timestamp: new Date(sub.created_at)
      });
    });

    // Add message milestone if significant activity
    if (recentMessageCount && recentMessageCount > 100) {
      activities.push({
        id: 'messages-milestone',
        type: 'message',
        message: `${recentMessageCount}+ messages sent in the last hour`,
        time: 'Recent activity',
        user: 'System',
        timestamp: now
      });
    }

    // Sort by timestamp and limit
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

// Top Locations Service
export async function getTopLocations(limit = 5) {
  const supabase = createClient();
  
  try {
    // Get user count by location
    const { data: users } = await supabase
      .from('users')
      .select('location')
      .not('location', 'is', null)
      .not('location', 'eq', '');

    if (!users || users.length === 0) {
      return Array.from({ length: limit }, (_, index) => ({
        city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][index] || `City ${index + 1}`,
        users: 0,
        percentage: 0
      }));
    }

    // Count users by location
    const locationCounts: { [key: string]: number } = {};
    users.forEach(user => {
      if (user.location) {
        // Extract city from location (assuming format like "City, State" or just "City")
        const city = user.location.split(',')[0].trim();
        locationCounts[city] = (locationCounts[city] || 0) + 1;
      }
    });

    const totalUsers = users.length;

    // Sort and get top locations
    const topLocations = Object.entries(locationCounts)
      .map(([city, count]) => ({
        city,
        users: count,
        percentage: Math.round((count / totalUsers) * 100)
      }))
      .sort((a, b) => b.users - a.users)
      .slice(0, limit);

    // Fill remaining slots with placeholder data if needed
    while (topLocations.length < limit) {
      const placeholderCities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
      const usedCities = topLocations.map(loc => loc.city);
      const availableCity = placeholderCities.find(city => !usedCities.includes(city));
      
      if (availableCity) {
        topLocations.push({
          city: availableCity,
          users: 0,
          percentage: 0
        });
      } else {
        break;
      }
    }

    return topLocations;

  } catch (error) {
    console.error('Error fetching top locations:', error);
    return Array.from({ length: limit }, (_, index) => ({
      city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][index] || `City ${index + 1}`,
      users: 0,
      percentage: 0
    }));
  }
}

// Helper function to calculate time ago
function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}

// Bulk Upload Service
export interface BulkUserData {
  name?: string;
  email?: string;
  phoneNumber: string; // Required field
  age?: number;
  bio?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  verified?: boolean;
  interests?: string[];
  seductionStyle?: string;
  flameLevel?: string;
  fantasyTrigger?: string;
  powerPlayPreference?: string;
  topTurnOn?: string;
  kinkScore?: number;
  idealSetting?: string;
  encounterFrequency?: string;
  afterPassionUnwind?: string;
  spicyMediaComfort?: string;
  consentImportance?: number;
  midnightCraving?: string;
  riskTolerance?: string;
  distancePreference?: string;
  isTestUser?: boolean;
  isDummyUser?: boolean;
  photos?: {
    url: string;
    order: number;
  }[];
}

export interface BulkUploadResult {
  success: boolean;
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  errors: { row: number; error: string; data: any }[];
  createdUsers: string[]; // User IDs
}

export async function bulkUploadUsers(userData: BulkUserData[]): Promise<BulkUploadResult> {
  const supabase = createClient();
  const result: BulkUploadResult = {
    success: false,
    totalProcessed: userData.length,
    successCount: 0,
    errorCount: 0,
    errors: [],
    createdUsers: []
  };

  try {
    for (let i = 0; i < userData.length; i++) {
      const user = userData[i];
      
      try {
        // Validate required fields
        if (!user.phoneNumber) {
          throw new Error('Phone number is required');
        }

        // Parse interests if it's a string
        let interests = user.interests;
        if (typeof user.interests === 'string') {
          try {
            interests = JSON.parse(user.interests);
          } catch {
            interests = [];
          }
        }

        // Prepare user data for insertion
        const userInsertData = {
          name: user.name || null,
          email: user.email || null,
          phoneNumber: user.phoneNumber,
          age: user.age || null,
          bio: user.bio || null,
          location: user.location || null,
          latitude: user.latitude || null,
          longitude: user.longitude || null,
          verified: user.verified || false,
          interests: interests || [],
          seductionStyle: user.seductionStyle || null,
          flameLevel: user.flameLevel || null,
          fantasyTrigger: user.fantasyTrigger || null,
          powerPlayPreference: user.powerPlayPreference || 'maybe',
          topTurnOn: user.topTurnOn || null,
          kinkScore: user.kinkScore || 0,
          idealSetting: user.idealSetting || null,
          encounterFrequency: user.encounterFrequency || null,
          afterPassionUnwind: user.afterPassionUnwind || null,
          spicyMediaComfort: user.spicyMediaComfort || null,
          consentImportance: user.consentImportance || 0,
          midnightCraving: user.midnightCraving || null,
          riskTolerance: user.riskTolerance || null,
          distancePreference: user.distancePreference || null,
          isTestUser: user.isTestUser || false,
          isDummyUser: user.isDummyUser !== undefined ? user.isDummyUser : true, // Mark as dummy user for bulk uploads by default
        };

        // Insert user
        const { data: insertedUser, error: userError } = await supabase
          .from('users')
          .insert(userInsertData)
          .select('id')
          .single();

        if (userError) {
          throw new Error(`Failed to insert user: ${userError.message}`);
        }

        if (!insertedUser) {
          throw new Error('User insertion failed - no data returned');
        }

        result.createdUsers.push(insertedUser.id);

        // Process and upload photos if provided
        if (user.photos && user.photos.length > 0) {
          try {
            const photoInsertData = [];
            
            for (let photoIndex = 0; photoIndex < user.photos.length; photoIndex++) {
              const photo = user.photos[photoIndex];
              
              try {
                // Download and upload the image to S3
                const uploadResult = await downloadAndUploadImage(photo.url, insertedUser.id, photoIndex + 1);
                
                if (uploadResult) {
                  photoInsertData.push({
                    userId: insertedUser.id,
                    url: uploadResult.cdnUrl,
                    s3Key: uploadResult.s3Key,
                    originalName: uploadResult.originalName,
                    mimeType: uploadResult.mimeType,
                    size: uploadResult.size,
                    mediaType: 'image',
                    order: photo.order || photoIndex + 1,
                    isDefault: photoIndex === 0 // First photo is default
                  });
                }
              } catch (photoError) {
                console.warn(`Failed to process photo ${photoIndex + 1} for user ${insertedUser.id}:`, photoError);
                // Continue with other photos
              }
            }

            // Insert successfully processed photos
            if (photoInsertData.length > 0) {
              const { error: photoError } = await supabase
                .from('photos')
                .insert(photoInsertData);

              if (photoError) {
                console.warn(`Failed to insert photos for user ${insertedUser.id}:`, photoError.message);
              }
            }
          } catch (error) {
            console.warn(`Photo processing failed for user ${insertedUser.id}:`, error);
            // Don't fail the entire operation for photo errors
          }
        }

        result.successCount++;
      } catch (error) {
        result.errorCount++;
        result.errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: user
        });
      }
    }

    result.success = result.errorCount === 0;
    return result;
  } catch (error) {
    console.error('Bulk upload failed:', error);
    return {
      success: false,
      totalProcessed: userData.length,
      successCount: 0,
      errorCount: userData.length,
      errors: [{
        row: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      }],
      createdUsers: []
    };
  }
}

// Swipes Service
export async function getSwipes(page = 1, limit = 50, filters: {
  search?: string;
  userId?: string;
  action?: string;
  status?: string;
} = {}) {
  const supabase = createClient();
  
  try {
    let query = supabase
      .from('swipes')
      .select(`
        *,
        fromUser:from_user_id(id, name, email, phoneNumber),
        toUser:to_user_id(id, name, email, phoneNumber)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // Apply filters
    if (filters.search) {
      // Search in from_user or to_user names/emails
      query = query.or(`fromUser.name.ilike.%${filters.search}%,fromUser.email.ilike.%${filters.search}%,toUser.name.ilike.%${filters.search}%,toUser.email.ilike.%${filters.search}%`);
    }

    if (filters.userId && filters.userId !== "all") {
      query = query.or(`from_user_id.eq.${filters.userId},to_user_id.eq.${filters.userId}`);
    }

    if (filters.action && filters.action !== "all") {
      query = query.eq('action', filters.action);
    }

    if (filters.status && filters.status !== "all") {
      query = query.eq('status', filters.status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching swipes:', error);
      return { swipes: [], total: 0, error: error.message };
    }

    return {
      swipes: data || [],
      total: count || 0,
      error: null
    };
  } catch (error) {
    console.error('Error in getSwipes:', error);
    return {
      swipes: [],
      total: 0,
      error: 'Failed to fetch swipes'
    };
  }
}

export async function getSwipeQueueForUser(userId: string) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('swipes')
      .select(`
        *,
        toUser:to_user_id(id, name, email, phoneNumber, age, bio, location, verified)
      `)
      .eq('from_user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching swipe queue:', error);
      return { swipes: [], error: error.message };
    }

    return {
      swipes: data || [],
      error: null
    };
  } catch (error) {
    console.error('Error in getSwipeQueueForUser:', error);
    return {
      swipes: [],
      error: 'Failed to fetch swipe queue'
    };
  }
}

export async function createSwipesForUser(userId: string, targetUserIds: string[]) {
  const supabase = createClient();
  
  try {
    // First check current active swipes count
    const { count: currentSwipes } = await supabase
      .from('swipes')
      .select('*', { count: 'exact', head: true })
      .eq('from_user_id', userId)
      .eq('status', 'active');

    const remainingSlots = 5 - (currentSwipes || 0);
    
    if (remainingSlots <= 0) {
      return {
        success: false,
        error: 'User already has maximum swipes (5) in queue'
      };
    }

    // Limit to available slots
    const swipesToCreate = targetUserIds.slice(0, remainingSlots);
    
    const swipeData = swipesToCreate.map(targetUserId => ({
      from_user_id: userId,
      to_user_id: targetUserId,
      action: 'like', // Default action for generated swipes
      status: 'active',
      created_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('swipes')
      .insert(swipeData)
      .select();

    if (error) {
      console.error('Error creating swipes:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      swipes: data,
      created: swipesToCreate.length,
      remaining: remainingSlots - swipesToCreate.length
    };
  } catch (error) {
    console.error('Error in createSwipesForUser:', error);
    return {
      success: false,
      error: 'Failed to create swipes'
    };
  }
}

export async function deleteSwipe(swipeId: string) {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('swipes')
      .delete()
      .eq('id', swipeId);

    if (error) {
      console.error('Error deleting swipe:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      error: null
    };
  } catch (error) {
    console.error('Error in deleteSwipe:', error);
    return {
      success: false,
      error: 'Failed to delete swipe'
    };
  }
}

export async function updateSwipeStatus(swipeId: string, status: 'active' | 'expired' | 'revoked') {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('swipes')
      .update({ status })
      .eq('id', swipeId)
      .select()
      .single();

    if (error) {
      console.error('Error updating swipe status:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      swipe: data,
      error: null
    };
  } catch (error) {
    console.error('Error in updateSwipeStatus:', error);
    return {
      success: false,
      error: 'Failed to update swipe status'
    };
  }
}

export async function generateSwipesForUser(userId: string) {
  const supabase = createClient();
  
  try {
    // Get user's current active swipes count
    const { count: currentSwipes } = await supabase
      .from('swipes')
      .select('*', { count: 'exact', head: true })
      .eq('from_user_id', userId)
      .eq('status', 'active');

    const remainingSlots = 5 - (currentSwipes || 0);
    
    if (remainingSlots <= 0) {
      return {
        success: false,
        error: 'User already has maximum swipes (5) in queue'
      };
    }

    // Get user's preferences and filters
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Get user's filters
    const { data: userFilters } = await supabase
      .from('user_filters')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Use default preferences if no filters exist
    const ageMin = userFilters?.age_min || user.preferences?.ageRange?.min || 18;
    const ageMax = userFilters?.age_max || user.preferences?.ageRange?.max || 35;
    const maxDistance = userFilters?.max_distance || user.preferences?.maxDistance || 25;

    // Get potential matches (users not already swiped on)
    const { data: potentialMatches } = await supabase
      .from('users')
      .select('id, name, age, location, verified, interests, lastSeen')
      .neq('id', userId)
      .eq('is_dummy_user', false)
      .eq('is_test_user', false)
      .gte('age', ageMin)
      .lte('age', ageMax)
      .not('id', 'in', `(
        SELECT "to_user_id" FROM swipes 
        WHERE "from_user_id" = '${userId}' AND status = 'active'
      )`)
      .limit(remainingSlots * 3); // Get more candidates for better selection

    if (!potentialMatches || potentialMatches.length === 0) {
      return {
        success: false,
        error: 'No potential matches found'
      };
    }

    // Simple scoring algorithm (can be enhanced later)
    const scoredMatches = potentialMatches.map(match => {
      let score = 0;
      
      // Verified users get bonus
      if (match.verified) score += 0.2;
      
      // Recently active users get bonus
      if (match.lastSeen) {
        const hoursSinceLastSeen = (Date.now() - new Date(match.lastSeen).getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastSeen < 24) score += 0.3;
        else if (hoursSinceLastSeen < 168) score += 0.1;
      }
      
      // Age preference scoring
      const userAge = user.age || 25;
      const ageDiff = Math.abs(userAge - match.age);
      score += Math.max(0, 0.3 - (ageDiff / 20));
      
      // Add some randomness for variety
      score += Math.random() * 0.2;
      
      return { ...match, score };
    });

    // Sort by score and take top candidates
    const topMatches = scoredMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, remainingSlots);

    // Create swipes
    const result = await createSwipesForUser(userId, topMatches.map(m => m.id));
    
    return result;
  } catch (error) {
    console.error('Error in generateSwipesForUser:', error);
    return {
      success: false,
      error: 'Failed to generate swipes'
    };
  }
}

export async function clearExpiredSwipes() {
  const supabase = createClient();
  
  try {
    // Update swipes that are older than 24 hours to expired status
    const { data, error } = await supabase
      .from('swipes')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .select();

    if (error) {
      console.error('Error clearing expired swipes:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      updated: data?.length || 0,
      error: null
    };
  } catch (error) {
    console.error('Error in clearExpiredSwipes:', error);
    return {
      success: false,
      error: 'Failed to clear expired swipes'
    };
  }
}

export async function getSwipeStats() {
  const supabase = createClient();
  
  try {
    const [
      { count: totalSwipes },
      { count: activeSwipes },
      { count: expiredSwipes },
      { count: revokedSwipes },
      { count: likes },
      { count: passes },
      { count: superLikes }
    ] = await Promise.all([
      supabase.from('swipes').select('*', { count: 'exact', head: true }),
      supabase.from('swipes').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('swipes').select('*', { count: 'exact', head: true }).eq('status', 'expired'),
      supabase.from('swipes').select('*', { count: 'exact', head: true }).eq('status', 'revoked'),
      supabase.from('swipes').select('*', { count: 'exact', head: true }).eq('action', 'like'),
      supabase.from('swipes').select('*', { count: 'exact', head: true }).eq('action', 'pass'),
      supabase.from('swipes').select('*', { count: 'exact', head: true }).eq('action', 'superlike')
    ]);

    return {
      totalSwipes: totalSwipes || 0,
      activeSwipes: activeSwipes || 0,
      expiredSwipes: expiredSwipes || 0,
      revokedSwipes: revokedSwipes || 0,
      likes: likes || 0,
      passes: passes || 0,
      superLikes: superLikes || 0
    };
  } catch (error) {
    console.error('Error in getSwipeStats:', error);
    return {
      totalSwipes: 0,
      activeSwipes: 0,
      expiredSwipes: 0,
      revokedSwipes: 0,
      likes: 0,
      passes: 0,
      superLikes: 0
    };
  }
}

export async function getUsersWithLowSwipeQueues(threshold = 2) {
  const supabase = createClient();
  
  try {
    // Get users with less than threshold active swipes
    const { data: usersWithSwipeCounts, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        phoneNumber,
        verified,
        created_at
      `)
      .eq('is_dummy_user', false)
      .eq('is_test_user', false);

    if (error) {
      console.error('Error fetching users:', error);
      return { users: [], error: error.message };
    }

    // For each user, count their active swipes
    const usersWithCounts = await Promise.all(
      (usersWithSwipeCounts || []).map(async (user) => {
        const { count } = await supabase
          .from('swipes')
          .select('*', { count: 'exact', head: true })
          .eq('from_user_id', user.id)
          .eq('status', 'active');

        return {
          ...user,
          activeSwipes: count || 0
        };
      })
    );

    // Filter users with low swipe counts
    const lowSwipeUsers = usersWithCounts.filter(user => user.activeSwipes < threshold);

    return {
      users: lowSwipeUsers,
      error: null
    };
  } catch (error) {
    console.error('Error in getUsersWithLowSwipeQueues:', error);
    return {
      users: [],
      error: 'Failed to fetch users with low swipe queues'
    };
  }
}

export function parseCSVData(csvText: string): BulkUserData[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must contain at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const userData: BulkUserData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const user: BulkUserData = { phoneNumber: '' };
    const photos: any[] = [];

    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      const value = values[j]?.trim().replace(/"/g, '') || '';

      if (!value) continue;

      // Handle photo fields (photo1_url, photo2_url, etc.)
      if (header.startsWith('photo') && header.endsWith('_url')) {
        const photoNumber = parseInt(header.replace('photo', '').replace('_url', ''));
        const photoIndex = photoNumber - 1;
        
        if (!photos[photoIndex]) {
          photos[photoIndex] = { order: photoNumber };
        }
        
        photos[photoIndex].url = value;
      } else {
        // Handle regular user fields
        switch (header) {
          case 'name':
            user.name = value;
            break;
          case 'email':
            user.email = value;
            break;
          case 'phoneNumber':
            user.phoneNumber = value;
            break;
          case 'age':
            user.age = parseInt(value) || undefined;
            break;
          case 'bio':
            user.bio = value;
            break;
          case 'location':
            user.location = value;
            break;
          case 'verified':
            user.verified = value.toLowerCase() === 'true';
            break;
          case 'interests':
            try {
              user.interests = JSON.parse(value);
            } catch {
              user.interests = value.split(',').map(i => i.trim());
            }
            break;
          case 'kinkScore':
            user.kinkScore = parseInt(value) || 0;
            break;
          case 'consentImportance':
            user.consentImportance = parseInt(value) || 0;
            break;
          default:
            // Handle enum fields and other string fields
            (user as any)[header] = value;
            break;
        }
      }
    }

    // Filter out empty photos and add to user
    user.photos = photos.filter(photo => photo && photo.url);
    userData.push(user);
  }

  return userData;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

// Get conversations with message counts and last activity
export async function getConversations(page = 1, limit = 50, filters: {
  search?: string;
  active?: boolean;
} = {}) {
  const supabase = createClient();
  
  try {
    let query = supabase
      .from('conversations')
      .select(`
        *,
        match:match_id(
          id,
          user1:user1_id(id, name, email, verified),
          user2:user2_id(id, name, email, verified)
        ),
        messages(id, created_at, content, message_type)
      `, { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (filters.active !== undefined) {
      query = query.eq('active', filters.active);
    }

    if (filters.search) {
      // Search in user names
      query = query.or(`match.user1.name.ilike.%${filters.search}%,match.user2.name.ilike.%${filters.search}%`);
    }

    const { data: conversations, error, count } = await query;

    if (error) throw error;

    const transformedConversations = conversations?.map(conversation => {
      const messages = conversation.messages || [];
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
      
      return {
        id: conversation.id,
        matchId: conversation.match_id,
        active: conversation.active,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
        participants: [
          {
            id: conversation.match?.user1?.id || '',
            name: conversation.match?.user1?.name || 'Unknown',
            email: conversation.match?.user1?.email || '',
            verified: conversation.match?.user1?.verified || false
          },
          {
            id: conversation.match?.user2?.id || '',
            name: conversation.match?.user2?.name || 'Unknown',
            email: conversation.match?.user2?.email || '',
            verified: conversation.match?.user2?.verified || false
          }
        ],
        messageCount: messages.length,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          type: lastMessage.message_type,
          createdAt: lastMessage.created_at
        } : null,
        lastActivity: conversation.updated_at
      };
    }) || [];

    return {
      conversations: transformedConversations,
      total: count || 0,
      page,
      limit
    };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return {
      conversations: [],
      total: 0,
      page,
      limit
    };
  }
}

// Get conversation by ID with all messages
export async function getConversationById(conversationId: string) {
  const supabase = createClient();
  
  try {
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select(`
        *,
        match:match_id(
          id,
          user1:user1_id(id, name, email, verified),
          user2:user2_id(id, name, email, verified)
        ),
        messages(
          *,
          sender:sender_id(id, name, email)
        )
      `)
      .eq('id', conversationId)
      .single();

    if (error) throw error;

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const transformedConversation = {
      id: conversation.id,
      matchId: conversation.match_id,
      active: conversation.active,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
      participants: [
        {
          id: conversation.match?.user1?.id || '',
          name: conversation.match?.user1?.name || 'Unknown',
          email: conversation.match?.user1?.email || '',
          verified: conversation.match?.user1?.verified || false
        },
        {
          id: conversation.match?.user2?.id || '',
          name: conversation.match?.user2?.name || 'Unknown',
          email: conversation.match?.user2?.email || '',
          verified: conversation.match?.user2?.verified || false
        }
      ],
      messages: conversation.messages?.map((message: any) => ({
        id: message.id,
        content: message.content,
        messageType: message.message_type,
        status: message.status,
        createdAt: message.created_at,
        updatedAt: message.updated_at,
        replyToId: message.reply_to_id,
        sender: {
          id: message.sender?.id || '',
          name: message.sender?.name || 'Unknown',
          email: message.sender?.email || ''
        }
      })) || []
    };

    return transformedConversation;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
}

// Get message analytics and statistics
export async function getMessageAnalytics() {
  const supabase = createClient();
  
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Get current period stats
    const [
      { count: totalMessages },
      { count: todayMessages },
      { count: yesterdayMessages },
      { count: weekMessages },
      { count: monthMessages },
      { count: lastMonthMessages },
      { count: activeConversations },
      { count: totalConversations }
    ] = await Promise.all([
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString()),
      supabase.from('messages').select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString())
        .lt('created_at', today.toISOString()),
      supabase.from('messages').select('*', { count: 'exact', head: true })
        .gte('created_at', thisWeek.toISOString()),
      supabase.from('messages').select('*', { count: 'exact', head: true })
        .gte('created_at', thisMonth.toISOString()),
      supabase.from('messages').select('*', { count: 'exact', head: true })
        .gte('created_at', lastMonth.toISOString())
        .lte('created_at', endOfLastMonth.toISOString()),
      supabase.from('conversations').select('*', { count: 'exact', head: true })
        .eq('active', true),
      supabase.from('conversations').select('*', { count: 'exact', head: true })
    ]);

    // Get message type distribution
    const { data: messageTypes } = await supabase
      .from('messages')
      .select('message_type')
      .gte('created_at', thisMonth.toISOString());

    const typeDistribution = messageTypes?.reduce((acc: any, msg) => {
      acc[msg.message_type] = (acc[msg.message_type] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get message status distribution
    const { data: messageStatuses } = await supabase
      .from('messages')
      .select('status')
      .gte('created_at', thisMonth.toISOString());

    const statusDistribution = messageStatuses?.reduce((acc: any, msg) => {
      acc[msg.status] = (acc[msg.status] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get average message length
    const { data: messageContents } = await supabase
      .from('messages')
      .select('content')
      .gte('created_at', thisMonth.toISOString());

    const averageLength = messageContents && messageContents.length > 0 
      ? Math.round(messageContents.reduce((sum, msg) => sum + msg.content.length, 0) / messageContents.length)
      : 0;

    // Get hourly message distribution for today
    const { data: todayMessagesDetailed } = await supabase
      .from('messages')
      .select('created_at')
      .gte('created_at', today.toISOString());

    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => {
      const count = todayMessagesDetailed?.filter(msg => {
        const msgHour = new Date(msg.created_at).getHours();
        return msgHour === hour;
      }).length || 0;
      return { hour, count };
    });

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      overview: {
        totalMessages: totalMessages || 0,
        todayMessages: todayMessages || 0,
        weekMessages: weekMessages || 0,
        monthMessages: monthMessages || 0,
        activeConversations: activeConversations || 0,
        totalConversations: totalConversations || 0,
        averageLength
      },
      changes: {
        dailyChange: calculateChange(todayMessages || 0, yesterdayMessages || 0),
        monthlyChange: calculateChange(monthMessages || 0, lastMonthMessages || 0)
      },
      distribution: {
        types: typeDistribution,
        statuses: statusDistribution,
        hourly: hourlyDistribution
      }
    };
  } catch (error) {
    console.error('Error fetching message analytics:', error);
    return {
      overview: {
        totalMessages: 0,
        todayMessages: 0,
        weekMessages: 0,
        monthMessages: 0,
        activeConversations: 0,
        totalConversations: 0,
        averageLength: 0
      },
      changes: {
        dailyChange: 0,
        monthlyChange: 0
      },
      distribution: {
        types: {},
        statuses: {},
        hourly: Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }))
      }
    };
  }
}

// Get top conversations by message count
export async function getTopConversations(limit = 10) {
  const supabase = createClient();
  
  try {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        match:match_id(
          user1:user1_id(id, name),
          user2:user2_id(id, name)
        ),
        messages(id)
      `)
      .eq('active', true)
      .limit(limit);

    if (error) throw error;

    const conversationsWithCounts = conversations?.map(conversation => ({
      id: conversation.id,
      participants: [
        conversation.match?.user1?.name || 'Unknown',
        conversation.match?.user2?.name || 'Unknown'
      ],
      messageCount: conversation.messages?.length || 0,
      lastActivity: conversation.updated_at
    })) || [];

    // Sort by message count
    conversationsWithCounts.sort((a, b) => b.messageCount - a.messageCount);

    return conversationsWithCounts.slice(0, limit);
  } catch (error) {
    console.error('Error fetching top conversations:', error);
    return [];
  }
}

// Search messages across all conversations
export async function searchMessages(query: string, limit = 50) {
  const supabase = createClient();
  
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, name, email),
        conversation:conversation_id(
          id,
          match:match_id(
            user1:user1_id(id, name),
            user2:user2_id(id, name)
          )
        )
      `)
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const transformedMessages = messages?.map(message => ({
      id: message.id,
      content: message.content,
      messageType: message.message_type,
      status: message.status,
      createdAt: message.created_at,
      sender: {
        id: message.sender?.id || '',
        name: message.sender?.name || 'Unknown',
        email: message.sender?.email || ''
      },
      conversation: {
        id: message.conversation?.id || '',
        participants: [
          message.conversation?.match?.user1?.name || 'Unknown',
          message.conversation?.match?.user2?.name || 'Unknown'
        ]
      }
    })) || [];

    return transformedMessages;
  } catch (error) {
    console.error('Error searching messages:', error);
    return [];
  }
}

// Flag/unflag a message
export async function flagMessage(messageId: string, flagged = true) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({ status: flagged ? 'flagged' : 'sent' })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, message: data };
  } catch (error) {
    console.error('Error flagging message:', error);
    return { success: false, error: 'Failed to flag message' };
  }
}

// Delete a message
export async function deleteMessage(messageId: string) {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting message:', error);
    return { success: false, error: 'Failed to delete message' };
  }
}

// Deactivate a conversation
export async function deactivateConversation(conversationId: string) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('conversations')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', conversationId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, conversation: data };
  } catch (error) {
    console.error('Error deactivating conversation:', error);
    return { success: false, error: 'Failed to deactivate conversation' };
  }
}

// Products Service
export async function getProducts(page = 1, limit = 50, filters: {
  search?: string;
  status?: string;
  type?: string;
} = {}) {
  const supabase = createClient();
  
  try {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.status === 'active') {
      query = query.eq('is_active', true);
    } else if (filters.status === 'inactive') {
      query = query.eq('is_active', false);
    }

    const { data: products, error, count } = await query;

    if (error) throw error;

    const transformedProducts = products?.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency,
      credits: product.credits,
      metadata: product.metadata,
      isActive: product.is_active,
      type: product.metadata?.type || 'one_time',
      features: product.metadata?.features || [],
      createdAt: product.created_at,
      updatedAt: product.updated_at
    })) || [];

    return {
      products: transformedProducts,
      total: count || 0,
      page,
      limit
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      products: [],
      total: 0,
      page,
      limit
    };
  }
}

export async function createProduct(productData: {
  name: string;
  description: string;
  price: number;
  currency: string;
  credits?: number;
  type: 'subscription' | 'one_time';
  features?: string[];
  metadata?: any;
}) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        currency: productData.currency,
        credits: productData.credits || 0,
        metadata: {
          type: productData.type,
          features: productData.features || [],
          ...productData.metadata
        },
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, product: data };
  } catch (error) {
    console.error('Error creating product:', error);
    return { success: false, error: 'Failed to create product' };
  }
}

export async function updateProduct(productId: string, updates: {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  credits?: number;
  type?: 'subscription' | 'one_time';
  features?: string[];
  metadata?: any;
  isActive?: boolean;
}) {
  const supabase = createClient();
  
  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.currency !== undefined) updateData.currency = updates.currency;
    if (updates.credits !== undefined) updateData.credits = updates.credits;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    // Handle metadata updates
    if (updates.type || updates.features || updates.metadata) {
      const { data: currentProduct } = await supabase
        .from('products')
        .select('metadata')
        .eq('id', productId)
        .single();

      const currentMetadata = currentProduct?.metadata || {};
      updateData.metadata = {
        ...currentMetadata,
        ...(updates.metadata || {}),
        ...(updates.type && { type: updates.type }),
        ...(updates.features && { features: updates.features })
      };
    }

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, product: data };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, error: 'Failed to update product' };
  }
}

export async function deleteProduct(productId: string, hardDelete = false) {
  const supabase = createClient();
  
  try {
    if (hardDelete) {
      // Check if product has any purchases
      const { count: purchaseCount } = await supabase
        .from('purchases')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId);

      if (purchaseCount && purchaseCount > 0) {
        return { 
          success: false, 
          error: 'Cannot delete product with existing purchases. Use soft delete instead.' 
        };
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
    } else {
      // Soft delete - just mark as inactive
      const { error } = await supabase
        .from('products')
        .update({ 
          is_active: false, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', productId);

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}

export async function getProductById(productId: string) {
  const supabase = createClient();
  
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) throw error;

    if (!product) {
      throw new Error('Product not found');
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency,
      credits: product.credits,
      metadata: product.metadata,
      isActive: product.is_active,
      type: product.metadata?.type || 'one_time',
      features: product.metadata?.features || [],
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}



// Purchases Service
export async function getPurchases(page = 1, limit = 50, filters: {
  search?: string;
  userId?: string;
  productId?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}) {
  const supabase = createClient();
  
  try {
    let query = supabase
      .from('purchases')
      .select(`
        *,
        user:user_id(id, name, email, phoneNumber),
        product:product_id(id, name, description, price, currency, credits, metadata)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (filters.search) {
      query = query.or(`user.name.ilike.%${filters.search}%,user.email.ilike.%${filters.search}%,product.name.ilike.%${filters.search}%`);
    }

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters.productId) {
      query = query.eq('product_id', filters.productId);
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data: purchases, error, count } = await query;

    if (error) throw error;

    const transformedPurchases = purchases?.map(purchase => ({
      id: purchase.id,
      user: {
        id: purchase.user?.id || '',
        name: purchase.user?.name || 'Unknown',
        email: purchase.user?.email || '',
        phoneNumber: purchase.user?.phoneNumber || ''
      },
      product: {
        id: purchase.product?.id || '',
        name: purchase.product?.name || 'Unknown Product',
        description: purchase.product?.description || '',
        price: purchase.product?.price || 0,
        currency: purchase.product?.currency || 'USD',
        credits: purchase.product?.credits || 0,
        type: purchase.product?.metadata?.type || 'one_time'
      },
      amount: purchase.product?.price || 0,
      currency: purchase.product?.currency || 'USD',
      metadata: purchase.metadata,
      createdAt: purchase.created_at
    })) || [];

    return {
      purchases: transformedPurchases,
      total: count || 0,
      page,
      limit
    };
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return {
      purchases: [],
      total: 0,
      page,
      limit
    };
  }
}

export async function createPurchase(purchaseData: {
  userId: string;
  productId: string;
  metadata?: any;
}) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('purchases')
      .insert({
        user_id: purchaseData.userId,
        product_id: purchaseData.productId,
        metadata: purchaseData.metadata || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, purchase: data };
  } catch (error) {
    console.error('Error creating purchase:', error);
    return { success: false, error: 'Failed to create purchase' };
  }
}

// Revenue Analytics
export async function getRevenueAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month') {
  const supabase = createClient();
  
  try {
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }

    // Get subscription revenue
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('recurring_price, currency, created_at')
      .gte('created_at', startDate.toISOString());

    const { data: previousSubscriptions } = await supabase
      .from('subscriptions')
      .select('recurring_price, currency, created_at')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString());

    // Get one-time purchase revenue
    const { data: purchases } = await supabase
      .from('purchases')
      .select(`
        created_at,
        product:product_id(price, currency)
      `)
      .gte('created_at', startDate.toISOString());

    const { data: previousPurchases } = await supabase
      .from('purchases')
      .select(`
        created_at,
        product:product_id(price, currency)
      `)
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString());

    // Calculate current period revenue
    const subscriptionRevenue = subscriptions?.reduce((sum, sub) => sum + (sub.recurring_price || 0), 0) || 0;
    const purchaseRevenue = purchases?.reduce((sum, purchase: any) => sum + (purchase.product?.price || 0), 0) || 0;
    const totalRevenue = subscriptionRevenue + purchaseRevenue;

    // Calculate previous period revenue
    const previousSubscriptionRevenue = previousSubscriptions?.reduce((sum, sub) => sum + (sub.recurring_price || 0), 0) || 0;
    const previousPurchaseRevenue = previousPurchases?.reduce((sum, purchase: any) => sum + (purchase.product?.price || 0), 0) || 0;
    const previousTotalRevenue = previousSubscriptionRevenue + previousPurchaseRevenue;

    // Calculate growth
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      current: {
        subscriptionRevenue,
        purchaseRevenue,
        totalRevenue,
        subscriptionCount: subscriptions?.length || 0,
        purchaseCount: purchases?.length || 0
      },
      previous: {
        subscriptionRevenue: previousSubscriptionRevenue,
        purchaseRevenue: previousPurchaseRevenue,
        totalRevenue: previousTotalRevenue,
        subscriptionCount: previousSubscriptions?.length || 0,
        purchaseCount: previousPurchases?.length || 0
      },
      growth: {
        subscriptionRevenue: calculateGrowth(subscriptionRevenue, previousSubscriptionRevenue),
        purchaseRevenue: calculateGrowth(purchaseRevenue, previousPurchaseRevenue),
        totalRevenue: calculateGrowth(totalRevenue, previousTotalRevenue),
        subscriptionCount: calculateGrowth(subscriptions?.length || 0, previousSubscriptions?.length || 0),
        purchaseCount: calculateGrowth(purchases?.length || 0, previousPurchases?.length || 0)
      }
    };
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return {
      current: {
        subscriptionRevenue: 0,
        purchaseRevenue: 0,
        totalRevenue: 0,
        subscriptionCount: 0,
        purchaseCount: 0
      },
      previous: {
        subscriptionRevenue: 0,
        purchaseRevenue: 0,
        totalRevenue: 0,
        subscriptionCount: 0,
        purchaseCount: 0
      },
      growth: {
        subscriptionRevenue: 0,
        purchaseRevenue: 0,
        totalRevenue: 0,
        subscriptionCount: 0,
        purchaseCount: 0
      }
    };
  }
}

// Get product performance analytics
export async function getProductAnalytics() {
  const supabase = createClient();
  
  try {
    const { data: purchases } = await supabase
      .from('purchases')
      .select(`
        product:product_id(id, name, price, currency, metadata)
      `);

    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('active_plan, recurring_price, currency');

    // Analyze one-time purchases
    const productPerformance: { [key: string]: any } = {};
    
    purchases?.forEach((purchase: any) => {
      const product = purchase.product;
      if (product) {
        if (!productPerformance[product.id]) {
          productPerformance[product.id] = {
            id: product.id,
            name: product.name,
            type: product.metadata?.type || 'one_time',
            totalRevenue: 0,
            totalSales: 0,
            averagePrice: product.price
          };
        }
        productPerformance[product.id].totalRevenue += product.price;
        productPerformance[product.id].totalSales += 1;
      }
    });

    // Analyze subscription plans
    const planPerformance: { [key: string]: any } = {
      basic: { plan: 'basic', totalRevenue: 0, totalSubscriptions: 0, averagePrice: 0 },
      premium: { plan: 'premium', totalRevenue: 0, totalSubscriptions: 0, averagePrice: 0 },
      platinum: { plan: 'platinum', totalRevenue: 0, totalSubscriptions: 0, averagePrice: 0 }
    };

    subscriptions?.forEach(sub => {
      if (planPerformance[sub.active_plan]) {
        planPerformance[sub.active_plan].totalRevenue += sub.recurring_price;
        planPerformance[sub.active_plan].totalSubscriptions += 1;
      }
    });

    // Calculate average prices for plans
    Object.keys(planPerformance).forEach(plan => {
      const data = planPerformance[plan];
      if (data.totalSubscriptions > 0) {
        data.averagePrice = data.totalRevenue / data.totalSubscriptions;
      }
    });

    return {
      products: Object.values(productPerformance),
      plans: Object.values(planPerformance)
    };
  } catch (error) {
    console.error('Error fetching product analytics:', error);
    return {
      products: [],
      plans: []
    };
  }
}

// ... existing code ... 