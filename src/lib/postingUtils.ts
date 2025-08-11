import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface CompanyLocation {
  address: string;
  city: string;
  state: string;
  is_headquarters: boolean;
}

export interface Company {
  id: string;
  company_name: string;
  company_logo?: string;
  phone?: string;
  website?: string;
  company_size?: string;
  industry?: string;
  description?: string;
  address_1?: string;
  city_1?: string;
  state_1?: string;
  is_headquarters_1?: boolean;
  address_2?: string;
  city_2?: string;
  state_2?: string;
  is_headquarters_2?: boolean;
  address_3?: string;
  city_3?: string;
  state_3?: string;
  is_headquarters_3?: boolean;
  address_4?: string;
  city_4?: string;
  state_4?: string;
  is_headquarters_4?: boolean;
  address_5?: string;
  city_5?: string;
  state_5?: string;
  is_headquarters_5?: boolean;
  address_6?: string;
  city_6?: string;
  state_6?: string;
  is_headquarters_6?: boolean;
  address_7?: string;
  city_7?: string;
  state_7?: string;
  is_headquarters_7?: boolean;
  address_8?: string;
  city_8?: string;
  state_8?: string;
  is_headquarters_8?: boolean;
  address_9?: string;
  city_9?: string;
  state_9?: string;
  is_headquarters_9?: boolean;
  address_10?: string;
  city_10?: string;
  state_10?: string;
  is_headquarters_10?: boolean;
}

export interface Posting {
  id: string;
  position: string;
  title: string;
  description: string;
  category?: string;
  city?: string;
  state?: string;
  hours_per_week?: number;
  pay?: number;
  business_email?: string;
  for_profit?: string;
  company_id: string;
  companies?: Company;
  internship_picture_1?: string;
  internship_picture_2?: string;
  internship_picture_3?: string;
  internship_picture_4?: string;
  internship_picture_5?: string;
}

export function getCompanyLocations(company: Company): CompanyLocation[] {
  const locations: CompanyLocation[] = [];
  for (let i = 1; i <= 10; i++) {
    const address = company[`address_${i}` as keyof Company] as string | undefined;
    const city = company[`city_${i}` as keyof Company] as string | undefined;
    const state = company[`state_${i}` as keyof Company] as string | undefined;
    const isHq = company[`is_headquarters_${i}` as keyof Company] as boolean | undefined;
    
    if (address?.trim() || city?.trim() || state) {
      locations.push({
        address: address || '',
        city: city || '',
        state: state || '',
        is_headquarters: isHq || false
      });
    }
  }
  return locations;
}

export async function getPostingAndCompanyDetails(id: string) {
  const supabase = createClientComponentClient();
  // Extract the UUID from the ID parameter (it might include company name prefix)
  const uuidMatch = id.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  const cleanId = uuidMatch ? uuidMatch[0] : id;
  
  console.log('Fetching posting details for ID:', cleanId);
  
  // First, get the posting details
  const { data: posting, error: postingError } = await supabase
    .from('internships')
    .select('*')
    .eq('id', cleanId)
    .single();

  if (postingError) {
    console.error('Error fetching posting:', postingError.message);
    console.error('Error details:', postingError);
    return null;
  }

  if (!posting) {
    console.log('No posting found with ID:', cleanId);
    return null;
  }

  // Then, get the company details
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', posting.company_id)
    .single();

  if (companyError) {
    console.error('Error fetching company:', companyError.message);
    console.error('Error details:', companyError);
    return null;
  }

  if (!company) {
    console.log('No company found with ID:', posting.company_id);
    return null;
  }

  console.log('Found posting and company:', { posting, company });
  return {
    ...posting,
    companies: company
  };
}