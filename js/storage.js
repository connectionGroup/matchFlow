const API_URL = "http://localhost:4001";

export async function fetchCompanies() {
  const response = await fetch(`${API_URL}/companies`);
  return response.json();
}

export async function fetchJobOffers() {
  const response = await fetch(`${API_URL}/jobOffers`);
  return response.json();
}
