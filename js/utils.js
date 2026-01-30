export function getCompany(companies, companyId) {
  return companies.find(company => company.id === companyId);
}

export function getOffers(offers, companyId) {
  return offers.filter(offer => offer.companyId === companyId);
}

export function currentCompany() {
  let loggedUser = JSON.parse(sessionStorage.getItem("loggedUser"));
  return loggedUser
}