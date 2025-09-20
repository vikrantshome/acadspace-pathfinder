import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Setup default user function called');
    
    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Check if default user already exists
    const { data: existingUser, error: checkError } = await supabase.auth.admin.getUserByEmail('vikrant@acadspace.org');
    
    if (existingUser) {
      console.log('Default user already exists');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Default user already exists',
        user: existingUser 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create the default user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'vikrant@acadspace.org',
      password: '1234',
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: 'Vikrant Test User'
      }
    });

    if (createError) {
      console.error('Error creating default user:', createError);
      return new Response(JSON.stringify({ 
        error: 'Failed to create default user',
        details: createError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Default user created successfully:', newUser.user?.email);

    // Create profile for the user
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: newUser.user!.id,
        full_name: 'Vikrant Test User',
        school_name: 'Demo School',
        grade: 12,
        board: 'CBSE'
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Don't fail the whole operation if profile creation fails
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Default user created successfully',
      user: newUser.user 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in setup-default-user function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});