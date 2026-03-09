/**
 * India States, Union Territories & Cities
 * Static data for signup form dropdowns.
 * 28 States + 8 Union Territories with major cities.
 */

export interface StateEntry {
  name: string;
  type: 'state' | 'union_territory';
  cities: string[];
}

export const INDIA_LOCATIONS: StateEntry[] = [
  // ──── States (28) ────
  {
    name: 'Andhra Pradesh',
    type: 'state',
    cities: [
      'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool',
      'Tirupati', 'Rajahmundry', 'Kakinada', 'Kadapa', 'Anantapur',
      'Eluru', 'Ongole', 'Srikakulam', 'Machilipatnam',
    ],
  },
  {
    name: 'Arunachal Pradesh',
    type: 'state',
    cities: [
      'Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro',
      'Bomdila', 'Tezu', 'Along', 'Roing',
    ],
  },
  {
    name: 'Assam',
    type: 'state',
    cities: [
      'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon',
      'Tinsukia', 'Tezpur', 'Bongaigaon', 'Karimganj', 'North Lakhimpur',
    ],
  },
  {
    name: 'Bihar',
    type: 'state',
    cities: [
      'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga',
      'Purnia', 'Arrah', 'Begusarai', 'Katihar', 'Munger',
      'Chapra', 'Saharsa', 'Hajipur', 'Sasaram',
    ],
  },
  {
    name: 'Chhattisgarh',
    type: 'state',
    cities: [
      'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg',
      'Rajnandgaon', 'Raigarh', 'Jagdalpur', 'Ambikapur',
    ],
  },
  {
    name: 'Goa',
    type: 'state',
    cities: [
      'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda',
      'Bicholim', 'Curchorem', 'Sanquelim',
    ],
  },
  {
    name: 'Gujarat',
    type: 'state',
    cities: [
      'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar',
      'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Nadiad',
      'Morbi', 'Mehsana', 'Bharuch', 'Vapi', 'Navsari', 'Gandhidham',
    ],
  },
  {
    name: 'Haryana',
    type: 'state',
    cities: [
      'Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal',
      'Hisar', 'Rohtak', 'Sonipat', 'Yamunanagar', 'Panchkula',
      'Bhiwani', 'Sirsa', 'Rewari', 'Jhajjar',
    ],
  },
  {
    name: 'Himachal Pradesh',
    type: 'state',
    cities: [
      'Shimla', 'Dharamshala', 'Mandi', 'Solan', 'Kullu',
      'Manali', 'Bilaspur', 'Hamirpur', 'Una', 'Palampur',
    ],
  },
  {
    name: 'Jharkhand',
    type: 'state',
    cities: [
      'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh',
      'Deoghar', 'Giridih', 'Ramgarh', 'Dumka', 'Chaibasa',
    ],
  },
  {
    name: 'Karnataka',
    type: 'state',
    cities: [
      'Bengaluru', 'Mysuru', 'Hubli-Dharwad', 'Mangaluru', 'Belagavi',
      'Kalaburagi', 'Davangere', 'Ballari', 'Tumkuru', 'Shivamogga',
      'Udupi', 'Raichur', 'Bidar', 'Hassan', 'Mandya',
    ],
  },
  {
    name: 'Kerala',
    type: 'state',
    cities: [
      'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam',
      'Palakkad', 'Alappuzha', 'Kannur', 'Kottayam', 'Malappuram',
      'Kasaragod', 'Pathanamthitta', 'Idukki', 'Wayanad',
    ],
  },
  {
    name: 'Madhya Pradesh',
    type: 'state',
    cities: [
      'Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain',
      'Sagar', 'Rewa', 'Satna', 'Dewas', 'Burhanpur',
      'Morena', 'Chhindwara', 'Vidisha', 'Damoh',
    ],
  },
  {
    name: 'Maharashtra',
    type: 'state',
    cities: [
      'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik',
      'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Navi Mumbai',
      'Sangli', 'Jalgaon', 'Akola', 'Latur', 'Ahmednagar',
      'Dhule', 'Nanded', 'Palghar', 'Satara', 'Ratnagiri',
    ],
  },
  {
    name: 'Manipur',
    type: 'state',
    cities: [
      'Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching',
      'Senapati', 'Ukhrul',
    ],
  },
  {
    name: 'Meghalaya',
    type: 'state',
    cities: [
      'Shillong', 'Tura', 'Nongstoin', 'Jowai', 'Baghmara',
      'Williamnagar', 'Resubelpara',
    ],
  },
  {
    name: 'Mizoram',
    type: 'state',
    cities: [
      'Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib',
      'Saiha', 'Lawngtlai',
    ],
  },
  {
    name: 'Nagaland',
    type: 'state',
    cities: [
      'Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha',
      'Zunheboto', 'Mon',
    ],
  },
  {
    name: 'Odisha',
    type: 'state',
    cities: [
      'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur',
      'Puri', 'Balasore', 'Baripada', 'Bhadrak', 'Jharsuguda',
      'Angul', 'Jeypore',
    ],
  },
  {
    name: 'Punjab',
    type: 'state',
    cities: [
      'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda',
      'Mohali', 'Hoshiarpur', 'Pathankot', 'Moga', 'Firozpur',
      'Kapurthala', 'Sangrur', 'Barnala',
    ],
  },
  {
    name: 'Rajasthan',
    type: 'state',
    cities: [
      'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer',
      'Bikaner', 'Bhilwara', 'Alwar', 'Sikar', 'Bharatpur',
      'Sri Ganganagar', 'Pali', 'Tonk', 'Chittorgarh', 'Barmer',
    ],
  },
  {
    name: 'Sikkim',
    type: 'state',
    cities: [
      'Gangtok', 'Namchi', 'Pelling', 'Gyalshing', 'Mangan',
      'Ravangla', 'Singtam',
    ],
  },
  {
    name: 'Tamil Nadu',
    type: 'state',
    cities: [
      'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
      'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul',
      'Thanjavur', 'Nagercoil', 'Kanchipuram', 'Tirupur', 'Hosur',
    ],
  },
  {
    name: 'Telangana',
    type: 'state',
    cities: [
      'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam',
      'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Siddipet',
      'Suryapet', 'Miryalaguda',
    ],
  },
  {
    name: 'Tripura',
    type: 'state',
    cities: [
      'Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar', 'Ambassa',
      'Belonia', 'Khowai',
    ],
  },
  {
    name: 'Uttar Pradesh',
    type: 'state',
    cities: [
      'Lucknow', 'Noida', 'Kanpur', 'Ghaziabad', 'Agra',
      'Varanasi', 'Meerut', 'Prayagraj', 'Bareilly', 'Aligarh',
      'Moradabad', 'Gorakhpur', 'Saharanpur', 'Jhansi', 'Muzaffarnagar',
      'Mathura', 'Firozabad', 'Greater Noida', 'Ayodhya',
    ],
  },
  {
    name: 'Uttarakhand',
    type: 'state',
    cities: [
      'Dehradun', 'Haridwar', 'Rishikesh', 'Haldwani', 'Roorkee',
      'Kashipur', 'Rudrapur', 'Nainital', 'Mussoorie', 'Almora',
    ],
  },
  {
    name: 'West Bengal',
    type: 'state',
    cities: [
      'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri',
      'Bardhaman', 'Malda', 'Baharampur', 'Kharagpur', 'Haldia',
      'Raiganj', 'Krishnanagar', 'Jalpaiguri', 'Darjeeling',
    ],
  },

  // ──── Union Territories (8) ────
  {
    name: 'Andaman and Nicobar Islands',
    type: 'union_territory',
    cities: ['Port Blair', 'Diglipur', 'Rangat', 'Mayabunder'],
  },
  {
    name: 'Chandigarh',
    type: 'union_territory',
    cities: ['Chandigarh'],
  },
  {
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    type: 'union_territory',
    cities: ['Silvassa', 'Daman', 'Diu'],
  },
  {
    name: 'Delhi',
    type: 'union_territory',
    cities: [
      'New Delhi', 'North Delhi', 'South Delhi', 'East Delhi',
      'West Delhi', 'Central Delhi', 'Dwarka', 'Rohini', 'Shahdara',
    ],
  },
  {
    name: 'Jammu and Kashmir',
    type: 'union_territory',
    cities: [
      'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore',
      'Kathua', 'Udhampur', 'Pulwama', 'Poonch',
    ],
  },
  {
    name: 'Ladakh',
    type: 'union_territory',
    cities: ['Leh', 'Kargil'],
  },
  {
    name: 'Lakshadweep',
    type: 'union_territory',
    cities: ['Kavaratti', 'Agatti', 'Minicoy'],
  },
  {
    name: 'Puducherry',
    type: 'union_territory',
    cities: ['Puducherry', 'Karaikal', 'Yanam', 'Mahe'],
  },
];

/** All state/UT names sorted alphabetically */
export const ALL_STATES = INDIA_LOCATIONS
  .map((s) => s.name)
  .sort((a, b) => a.localeCompare(b));

/** Get label with (UT) suffix for union territories */
export const getStateLabel = (entry: StateEntry): string =>
  entry.type === 'union_territory' ? `${entry.name} (UT)` : entry.name;

/** Get sorted state entries for dropdown */
export const getSortedStateEntries = (): StateEntry[] =>
  [...INDIA_LOCATIONS].sort((a, b) => a.name.localeCompare(b.name));

/** Get cities for a given state/UT name, sorted alphabetically */
export const getCitiesForState = (stateName: string): string[] => {
  const entry = INDIA_LOCATIONS.find((s) => s.name === stateName);
  return entry ? [...entry.cities].sort((a, b) => a.localeCompare(b)) : [];
};
