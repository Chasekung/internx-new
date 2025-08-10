import { useSupabase } from '@/hooks/useSupabase';

export interface CompanyUser {
  id: string;
  email: string;
  role: 'COMPANY';
  companyName: string;
  contactName: string;
}

export async function checkCompanyAuth(): Promise<{ isCompany: boolean; user: CompanyUser | null; error?: string }> {
  const supabase = createClientComponentClient();
  
  try {
    // First check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { isCompany: false, user: null, error: 'Not authenticated' };
    }

    // Then verify user exists in companies table
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', user.id)
      .single();

    if (companyError || !companyData) {
      return { isCompany: false, user: null, error: 'Not a company user' };
    }

    // User is both authenticated AND a company
    const companyUser: CompanyUser = {
      id: user.id,
      email: user.email!,
      role: 'COMPANY',
      companyName: companyData.company_name,
      contactName: companyData.contact_name
    };

    return { isCompany: true, user: companyUser };
  } catch (error) {
    console.error('Company auth check error:', error);
    return { isCompany: false, user: null, error: 'Authentication check failed' };
  }
}

export async function requireCompanyAuth(): Promise<CompanyUser> {
  const { isCompany, user, error } = await checkCompanyAuth();
  
  if (!isCompany || !user) {
    throw new Error(error || 'Company authentication required');
  }
  
  return user;
} 