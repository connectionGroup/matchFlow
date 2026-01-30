export function getCompany(companies, companyId) {
  return companies.find(company => company.id === companyId);
}

export function getOffers(offers, companyId) {
  return offers.filter(offer => offer.companyId === companyId);
}
